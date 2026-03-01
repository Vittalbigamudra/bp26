import db from "$lib/db/sqlite.js";

// GET /gps
// Ingests GPS coordinates for a given bus and updates the `bus_locations`
// table.
//
// Inputs (query parameters):
//   id:     string   bus identifier (required)
//   lat:    number   latitude in decimal degrees (required)
//   lng:    number   longitude in decimal degrees (required)
//   timestamp: string ISO timestamp of the measurement (optional; defaults to now)
//
// Outputs:
//   200 OK with { ok: true } when the location is stored/updated.
//   400 Bad Request with { error: string } if parameters are missing/invalid.
//   500 Internal Error with { message: string } on database failures.
export async function GET({ url }) {
    const bus_id = url.searchParams.get("id");
    const lat = Number(url.searchParams.get("lat"));
    const lng = Number(url.searchParams.get("lng"));
    const timestamp = url.searchParams.get("timestamp") ?? new Date().toISOString();

    if (!bus_id || isNaN(lat) || isNaN(lng)) {
        return new Response(JSON.stringify({ error: "Missing or invalid parameters" }), { status: 400 });
    }

    // Reject impossible coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error("Rejected invalid GPS:", { bus_id, lat, lng });
        return new Response(JSON.stringify({ error: "Invalid coordinates" }), { status: 400 });
    }

    try {
        const update = db
            .query("UPDATE bus_locations SET latitude=?, longitude=?, updated_at=? WHERE bus_id=?")
            .run(lat, lng, timestamp, bus_id);

        if (update.changes === 0) {
            db.query(
                "INSERT INTO bus_locations (bus_id, latitude, longitude, updated_at) VALUES (?, ?, ?, ?)"
            ).run(bus_id, lat, lng, timestamp);
        }

        return new Response(JSON.stringify({ ok: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        console.error("GPS endpoint error:", err);
        return new Response(JSON.stringify({ message: "Internal Error" }), { status: 500 });
    }
}
