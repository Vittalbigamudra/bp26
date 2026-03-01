import db from "$lib/db/sqlite.js";

// GET /api/[id]/details
// This endpoint returns basic schedule details for a specific bus.
//
// Inputs:
//   - params.id: the bus identifier supplied via the route (e.g. /api/42/details)
//
// Output (JSON):
//   {
//     scheduledArrival: string|null,   // time of last stop in schedule or null
//     eta: string|null,                // estimated arrival (currently same as scheduledArrival)
//     nextStop: { name: string, time: string } // the next upcoming or final stop
//   }
// If the bus has no stops in the schedule, a placeholder object with nulls is
// returned.
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
        eta: scheduledArrival, // placeholder; real ETA would use routing
        nextStop
    }));
}
