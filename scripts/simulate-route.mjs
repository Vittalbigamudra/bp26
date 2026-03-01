import fs from "fs";
import csv from "csv-parser";
import fetch from "node-fetch";
import "dotenv/config.js";

// CONFIG
const BUS_ID = process.env.BUS_ID || process.argv[2] || "25101"; // can pass as env or CLI arg
const MAPTILER_KEY = process.env.MAPTILER_KEY;
const CSV_FILE = "./src/lib/assets/bus_stops.csv";
const GPS_ENDPOINT = "http://localhost:5173/gps"; // SvelteKit dev server
const UPDATE_INTERVAL = 2000; // ms
const SPEED_MPS = 10; // meters per second (realistic bus speed)

function loadStops() {
    return new Promise((resolve) => {
        const stops = [];

        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on("data", (row) => {
                    if (row.bus_id === BUS_ID) {
                        // Clean coordinates: trim whitespace and take only numeric part
                        let latStr = String(row.lat || "").trim();
                        let lngStr = String(row.lng || "").trim();
                        
                        // Extract just the number (ignore trailing junk)
                        latStr = latStr.match(/^-?\d+\.?\d*/)?.[0] || "";
                        lngStr = lngStr.match(/^-?\d+\.?\d*/)?.[0] || "";
                        
                        const lat = Number(latStr);
                        const lng = Number(lngStr);
                        if (!isFinite(lat) || !isFinite(lng)) return; // skip invalid coordinates

                        // Reject coordinates outside Forsyth County, GA (likely bad data)
                        if (lat < 33.5 || lat > 34.5 || lng < -85 || lng > -83) return;
                        stops.push({
                            name: row.name,
                            lat,
                            lng,
                            pickup_time: row.pickup_time
                        });
                    }
            })
            .on("end", () => {
                stops.sort((a, b) =>
                    new Date(`1970-01-01T${a.pickup_time}`) -
                    new Date(`1970-01-01T${b.pickup_time}`)
                );
                resolve(stops);
            });
    });
}

// Haversine distance in meters
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Fetch route geometry from OSRM (Open Source Routing Machine)
async function getRoute(start, end) {
    const coords = `${start.lng},${start.lat};${end.lng},${end.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.routes && data.routes[0] && data.routes[0].geometry) {
            return data.routes[0].geometry.coordinates; // [lng, lat] pairs
        }
    } catch (err) {
        // Silently fail and use straight line
    }
    return null;
}

// Interpolate position along a path
function interpolateAlongPath(path, distanceMeters) {
    let accumulated = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const [lng1, lat1] = path[i];
        const [lng2, lat2] = path[i + 1];
        const segmentDist = haversineDistance(lat1, lng1, lat2, lng2);

        if (accumulated + segmentDist >= distanceMeters) {
            // Interpolate within this segment
            const remaining = distanceMeters - accumulated;
            const fraction = remaining / segmentDist;
            return {
                lat: lat1 + (lat2 - lat1) * fraction,
                lng: lng1 + (lng2 - lng1) * fraction
            };
        }
        accumulated += segmentDist;
    }
    // Return end of path if we've gone past it
    const last = path[path.length - 1];
    return { lat: last[1], lng: last[0] };
}

async function sendGPS(lat, lng) {
    const params = new URLSearchParams({
        id: BUS_ID,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6),
        timestamp: new Date().toISOString()
    });

    try {
        const res = await fetch(`${GPS_ENDPOINT}?${params.toString()}`);
        const data = await res.json();
        console.log(`[${BUS_ID}] Sent:`, data);
    } catch (err) {
        console.error("GPS send error:", err);
    }
}

async function simulate() {
    const stops = await loadStops();
    if (stops.length < 2) {
        console.error("Not enough stops to simulate.");
        return;
    }

    // ensure route begins/ends at Denmark High School (645 Mullinax Rd)
    // geocoded as [-84.22851, 34.146378]
    const school = { name: "DENMARK HS", lat: 34.146378, lng: -84.22851 };
    // add at start if not already present (compare by rough proximity)
    const first = stops[0];
    if (first && (Math.abs(first.lat - school.lat) > 1e-5 || Math.abs(first.lng - school.lng) > 1e-5)) {
        stops.unshift(school);
    }
    const last = stops[stops.length - 1];
    if (last && (Math.abs(last.lat - school.lat) > 1e-5 || Math.abs(last.lng - school.lng) > 1e-5)) {
        stops.push(school);
    }

    console.log(`Simulating bus ${BUS_ID} with ${stops.length} stops.`);

    // Pre-fetch all routes
    const routes = [];
    for (let i = 0; i < stops.length - 1; i++) {
        console.log(`Fetching route from ${stops[i].name} to ${stops[i + 1].name}...`);
        const route = await getRoute(stops[i], stops[i + 1]);
        if (route && route.length > 0) {
            console.log(`  ✓ Got road route with ${route.length} points`);
            routes.push(route);
        } else {
            console.log(`  → Using straight line`);
            routes.push([[stops[i].lng, stops[i].lat], [stops[i + 1].lng, stops[i + 1].lat]]);
        }
    }

    console.log(`\nStarting simulation...\n`);

    let currentSegment = 0;
    let distanceAlongSegment = 0;

    setInterval(async () => {
        if (currentSegment >= routes.length) {
            console.log("Route completed.");
            process.exit(0);
        }

        const route = routes[currentSegment];
        const nextStop = stops[currentSegment + 1];

        // Move along the route
        distanceAlongSegment += (SPEED_MPS * UPDATE_INTERVAL) / 1000; // meters moved this tick

        // Calculate total route distance
        let totalDist = 0;
        for (let i = 0; i < route.length - 1; i++) {
            const [lng1, lat1] = route[i];
            const [lng2, lat2] = route[i + 1];
            totalDist += haversineDistance(lat1, lng1, lat2, lng2);
        }

        if (distanceAlongSegment >= totalDist) {
            // Reached the next stop
            console.log(`Reached stop: ${nextStop.name}`);
            currentSegment++;
            distanceAlongSegment = 0;
        }

        // Get current position
        const current = interpolateAlongPath(route, distanceAlongSegment);
        await sendGPS(current.lat, current.lng);
    }, UPDATE_INTERVAL);
}

simulate();