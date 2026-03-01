import fs from "fs";
import csv from "csv-parser";

const BUS_ID = "25125";
const CSV_FILE = "./src/lib/assets/bus_stops.csv";

function loadStops() {
    return new Promise((resolve) => {
        const stops = [];

        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on("data", (row) => {
                    if (row.bus_id === BUS_ID) {
                        let latStr = String(row.lat || "").trim();
                        let lngStr = String(row.lng || "").trim();
                        
                        latStr = latStr.match(/^-?\d+\.?\d*/)?.[0] || "";
                        lngStr = lngStr.match(/^-?\d+\.?\d*/)?.[0] || "";
                        
                        const lat = Number(latStr);
                        const lng = Number(lngStr);
                        if (!isFinite(lat) || !isFinite(lng)) return;

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
                stops.forEach(s => {
                    console.log(`${s.name}: ${s.lat.toFixed(6)}, ${s.lng.toFixed(6)}`);
                });
                resolve(stops);
            });
    });
}

await loadStops();
