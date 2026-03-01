import db from "$lib/db/sqlite.js";

// GET /api/buses/[id]/details
// Identical to the generic /api/[id]/details endpoint, returns schedule
// information for a bus ID under the /buses namespace.
//
// Inputs:
//   - params.id: bus identifier in the URL
//
// Output (JSON):
//   { scheduledArrival: string|null, eta: string|null,
//     nextStop: {name:string,time:string} }
//
// Returns placeholder values when no stops are found.
export function GET({ params }) {
    const id = params.id;

    const stops = db.query(`
        SELECT stop_name AS name, pickup_time AS time
        FROM bus_stops
        WHERE bus_id = ?
        ORDER BY pickup_time ASC
    `).all(id);

    if (!stops.length) {
        return new Response(JSON.stringify({
            scheduledArrival: null,
            eta: null,
            nextStop: { name: "No stops", time: "" }
        }));
    }

    const scheduledArrival = stops[stops.length - 1].time;

    const now = new Date();
    let nextStop = stops.find(s => new Date(`1970-01-01T${s.time}`) > now);
    if (!nextStop) nextStop = stops[stops.length - 1];

    return new Response(JSON.stringify({
        scheduledArrival,
        eta: scheduledArrival,
        nextStop
    }));
}
