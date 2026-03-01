<script>
    import { onMount } from "svelte";
    import maplibre from "maplibre-gl";

    let map;
    let markers = {};
    let buses = {};          
    let busStatus = {};      
    let selectedBus = null;
    let busDetails = null;
    let messages = [];
    let pendingAccounts = [];

    const routeLayerId = "bus-route";
    const routeSourceId = "bus-route-source";
    const MAPTILER_KEY = "8G5oreAn1PJYGuI6Xgi9";

    // Helper for map layering
    function getFirstLabelLayerId() {
        if (!map) return null;
        const layers = map.getStyle().layers;
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol') return layers[i].id;
        }
        return null;
    }

    // Helper to format seconds into HH:MM AM/PM
    function formatETA(secondsToAdd) {
        const now = new Date();
        const etaDate = new Date(now.getTime() + secondsToAdd * 1000);
        return etaDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    async function fetchRoadRoute(stops) {
    if (!stops || stops.length < 2) return null;

    // 1. CLEAN THE DATA: Strip out Zip Codes and Nulls
    const validCoords = stops
        .map(s => {
            const lng = parseFloat(s.lng || s.longitude);
            const lat = parseFloat(s.lat || s.latitude);
            return { lng, lat };
        })
        .filter(c => 
            !isNaN(c.lng) && 
            !isNaN(c.lat) && 
            Math.abs(c.lat) <= 90 && // Latitude MUST be between -90 and 90
            c.lat !== 30004          // Explicitly block the Zip Code if it slips through
        );

    // 2. SAFETY CHECK: If we don't have at least 2 points, OSRM will fail
    if (validCoords.length < 2) {
        console.warn("Not enough valid coordinates for OSRM");
        return null;
    }

    // 3. BUILD URL: Longitude FIRST, then Latitude
    const coordsString = validCoords.map(c => `${c.lng},${c.lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?geometries=geojson&overview=full`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
            return data.routes[0].geometry.coordinates; 
        } else {
            console.error("OSRM Error:", data.code);
        }
    } catch (err) {
        console.error("Network error fetching road route:", err);
    }
    return null;
}

    async function fetchBusLocations() {
        try {
            const res = await fetch("/api/buses/live");
            const rows = await res.json();
            const normalized = {};
            for (const r of rows) {
                const id = String(r.bus_id ?? r.id);
                normalized[id] = { 
                    lat: Number(r.latitude ?? r.lat), 
                    lng: Number(r.longitude ?? r.lng),
                    updated_at: r.updated_at 
                };
            }
            buses = normalized;
            updateMarkers();
        } catch (e) { console.error(e); }
    }

    async function fetchBusStatus() {
        const res = await fetch("/api/buses/status");
        busStatus = await res.json();
    }

    async function fetchBusDetails(id) {
        selectedBus = String(id);
        try {
            const [dRes, rRes] = await Promise.all([
                fetch(`/api/buses/${selectedBus}/details`),
                fetch(`/api/buses/${selectedBus}/route`)
            ]);
            busDetails = await dRes.json();
            const stops = await rRes.json();

            const gps = buses[selectedBus];
            let target = (busDetails.nextStop && busDetails.nextStop.lat) ? busDetails.nextStop : (stops[0] || null);

            if (gps && target && target.lat) {
                const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${gps.lng},${gps.lat};${target.lng},${target.lat}?overview=false`);
                const data = await osrmRes.json();
                if (data.routes?.[0]) {
                    busDetails = { ...busDetails, nextStop: target, eta: formatETA(data.routes[0].duration) };
                }
            } else {
                busDetails.eta = "Stationary";
            }
            drawRoute(stops.length > 0 ? stops : (target ? [target] : []));
        } catch (err) { console.error(err); }
    }

    function updateMarkers() {
        if (!map) return;
        Object.entries(buses).forEach(([id, bus]) => {
            if (!markers[id]) {
                markers[id] = new maplibre.Marker({ color: "#E94822" }).setLngLat([bus.lng, bus.lat]).addTo(map);
            } else {
                markers[id].setLngLat([bus.lng, bus.lat]);
            }
        });
    }

    function drawRoute(stops) {
    if (!map || !map.isStyleLoaded() || !stops || stops.length < 1) return;

    fetchRoadRoute(stops).then(roadCoords => {
        // Fallback to straight lines if OSRM fails, but ensure [lng, lat] order
        let coords = roadCoords || stops.map(s => [Number(s.lng), Number(s.lat)]);

        // SANITY CHECK: MapLibre crashes if Latitude > 90 or < -90
        // We filter out any bad data and ensure the order is [longitude, latitude]
        const validCoords = coords.filter(c => {
            const lng = c[0];
            const lat = c[1];
            return isFinite(lng) && isFinite(lat) && lat >= -90 && lat <= 90;
        });

        if (validCoords.length < 2) return;

        if (map.getLayer(routeLayerId)) map.removeLayer(routeLayerId);
        if (map.getSource(routeSourceId)) map.removeSource(routeSourceId);

        map.addSource(routeSourceId, {
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: validCoords
                }
            }
        });

        map.addLayer({
            id: routeLayerId,
            type: "line",
            source: routeSourceId,
            paint: {
                "line-color": "#F2910A",
                "line-width": 6,
                "line-opacity": 0.8
            }
        }, getFirstLabelLayerId());

        // Adjust camera to fit the route
        const bounds = new maplibre.LngLatBounds();
        validCoords.forEach(c => bounds.extend(c));
        map.fitBounds(bounds, { padding: 50 });
    });
}

    async function fetchMessages() {
        const res = await fetch('/api/admin/messages');
        if (res.ok) messages = await res.json();
    }

    async function fetchPending() {
        const res = await fetch('/api/admin/pending');
        if (res.ok) pendingAccounts = await res.json();
    }

    async function reject(id) {
        await fetch("/api/admin/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        fetchPending();
    }

    onMount(() => {
        map = new maplibre.Map({
            container: "map",
            style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
            center: [-84.2291, 34.1472],
            zoom: 12
        });
        map.on('load', () => {
            fetchBusLocations();
            fetchBusStatus();
            fetchMessages();
            fetchPending();
        });
        const i1 = setInterval(fetchBusLocations, 3000);
        const i2 = setInterval(fetchBusStatus, 5000);
        const i3 = setInterval(fetchPending, 5000);
        return () => { clearInterval(i1); clearInterval(i2); clearInterval(i3); };
    });
</script>
<div class="flex h-screen bg-[#2C2D34] text-white">
    <!-- Sidebar -->
    <div class="w-80 bg-[#2C2D34] border-r border-[#3A3B44] p-4 overflow-y-auto">
        <h1 class="text-xl font-bold mb-4 text-[#EFD510]">Admin Dashboard</h1>

        <h2 class="text-sm font-semibold mb-2 text-[#F2910A] uppercase tracking-wide">
            On Route
        </h2>

        {#each Object.entries(busStatus).filter(([id, s]) => s === "on-route") as [id, status]}
            <button
                type="button"
                class="w-full text-left bg-[#3A3B44] p-3 rounded mb-3 hover:bg-[#44454F] border-l-4 transition-colors
                {selectedBus === id ? 'border-[#E94822]' : 'border-transparent'}"
                on:click={() => fetchBusDetails(id)}
            >
                <div class="font-bold text-sm">Bus {id}</div>
                <div class="text-xs text-gray-300">Lat: {buses[id]?.lat}</div>
                <div class="text-xs text-gray-300">Lng: {buses[id]?.lng}</div>
            </button>
        {/each}

        <h2 class="text-sm font-semibold mt-6 mb-2 text-[#EFD510] uppercase tracking-wide">
            Completed
        </h2>

        {#each Object.entries(busStatus).filter(([id, s]) => s === "completed") as [id, status]}
            <button
                type="button"
                class="w-full text-left bg-[#3A3B44] p-3 rounded mb-3 hover:bg-[#44454F] border-l-4 transition-colors
                {selectedBus === id ? 'border-[#E94822]' : 'border-transparent'}"
                on:click={() => fetchBusDetails(id)}
            >
                <div class="font-bold text-sm">Bus {id}</div>
                <div class="text-xs text-gray-400">Route Completed</div>
            </button>
        {/each}

        <h2 class="text-sm font-semibold mt-6 mb-2 text-[#EFD510] uppercase tracking-wide">
            Messages
        </h2>
        {#if messages.length === 0}
            <div class="text-xs text-gray-300">No messages</div>
        {:else}
            {#each messages as msg}
                <div class="bg-[#3A3B44] p-3 rounded mb-3 text-xs">
                    <div class="font-bold">{msg.name} &lt;{msg.email}&gt;</div>
                    <div class="mt-1 whitespace-pre-wrap">{msg.message}</div>
                    <div class="mt-1 text-right text-gray-400 text-[10px]">{new Date(msg.created_at).toLocaleString()}</div>
                </div>
            {/each}
        {/if}
        <h2 class="text-sm font-semibold mt-6 mb-2 text-[#EFD510] uppercase tracking-wide">
  Pending Accounts
</h2>

{#each pendingAccounts as p}
  <div class="bg-[#3A3B44] p-3 rounded mb-3 text-xs">
    <div class="font-bold">{p.username}</div>
    <div class="text-gray-300">{p.school_name}</div>
    <div class="mt-1 text-[#EFD510]">OTP: {p.otp}</div>
    <div class="mt-1 text-gray-400 text-[10px]">
      {new Date(p.created_at).toLocaleString()}
    </div>

    <div class="flex gap-2 mt-3">
      <button
        class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
        on:click={() => approve(p.id)}
      >
        Approve
      </button>

      <button
        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        on:click={() => reject(p.id)}
      >
        Reject
      </button>
    </div>
  </div>
{/each}


    </div>

    <!-- Map + Details -->
    <div class="flex-1 relative">
        <div id="map" class="absolute inset-0"></div>

        {#if busDetails}
            <div class="absolute top-4 right-4 bg-[#3A3B44] text-white shadow-xl rounded p-4 w-80 border border-[#44454F]">
                <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
                    <span class="inline-block w-2 h-2 rounded-full bg-[#E94822]"></span>
                    <span>Bus {selectedBus}</span>
                </h3>

                <div class="mb-3">
                    <div class="text-xs uppercase text-gray-400">Scheduled Arrival</div>
                    <div class="text-sm">{busDetails.scheduledArrival}</div>
                </div>

                <div class="mb-3">
                    <div class="text-xs uppercase text-gray-400">Estimated Arrival</div>
                    <div class="text-sm text-[#EFD510]">{busDetails.eta}</div>
                </div>

                <div class="mb-1">
                    <div class="text-xs uppercase text-gray-400">Next Stop</div>
                    <div class="text-sm font-semibold">{busDetails.nextStop.name}</div>
                    <div class="text-xs text-gray-300">{busDetails.nextStop.time}</div>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    #map {
        width: 100%;
        height: 100%;
    }
</style>
