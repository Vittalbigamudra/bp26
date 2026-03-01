import db from "$lib/db/sqlite.js";

// GET /api/buses/[id]/route
// Returns the list of stops with coordinates for a particular bus, same as
// the generic /api/[id]/routes endpoint but under the /buses namespace.
//
// Inputs:
//   - params.id: the bus ID from the route
//
// Output (JSON): [{ name, lat, lng, time }, ...] sorted by time.
// If there are no stops, returns an empty array.
export function GET({ params }) {
    const id = params.id;

    const stops = db.query(`
        SELECT stop_name AS name,
               latitude AS lat,
               longitude AS lng,
               pickup_time AS time
        FROM bus_stops
        WHERE bus_id = ?
        ORDER BY time ASC
    `).all(id);

    return new Response(JSON.stringify(stops));
}
