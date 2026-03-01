import db from "$lib/db/sqlite.js";

// GET /api/[id]/routes
// Retrieves the full list of scheduled stops (with coordinates) for a given
// bus.
//
// Inputs:
//   - params.id: the bus identifier from the URL
//
// Output (JSON): an array of stop objects:
//   [{ name: string, lat: number, lng: number, time: string }, ...]
// sorted by pickup time ascending. If no stops exist, an empty array is
// returned.
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
