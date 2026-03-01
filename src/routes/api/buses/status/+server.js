import db from "$lib/db/sqlite.js";

// GET /api/buses/status
// Returns the current status of every known or recently-seen bus.
//
// No inputs. The query uses two tables (`buses` and `bus_locations`) to
// assemble the list.
//
// Output (JSON):
//   { [busId: string]: "on-route" | "completed" }
//
// A bus is marked "on-route" if it has recent GPS activity (within 2
// minutes) or if its scheduled last stop time is in the future. Otherwise it
// is considered "completed".
export function GET() {
    // start with the canonical bus list, but also include any IDs we've seen
    // in the live location table (helps show simulated vehicles that aren't
    // pre-registered in the `buses` table).
    const buses = db
        .query(`
            SELECT id FROM buses
            UNION
            SELECT DISTINCT bus_id AS id
            FROM bus_locations
        `)
        .all();
    const stops = db.query(`
        SELECT bus_id, MAX(pickup_time) AS last_stop
        FROM bus_stops
        GROUP BY bus_id
    `).all();

    const now = new Date();
    const result = {};

    for (const bus of buses) {
        const stop = stops.find(s => s.bus_id === bus.id);
        // first check live GPS to see if we've heard from this bus recently
        const loc = db
            .query(
                `SELECT updated_at
                 FROM bus_locations
                 WHERE bus_id = ?
                 ORDER BY updated_at DESC
                 LIMIT 1`,
                [bus.id]
            )
            .get();

        let isLive = false;
        if (loc && loc.updated_at) {
            const then = new Date(loc.updated_at);
            const delta = now - then;
            // consider live if we've seen it in the last 2 minutes
            if (delta < 2 * 60 * 1000) {
                isLive = true;
            }
        }

        if (isLive) {
            // if the bus is transmitting, mark it on-route regardless of schedule
            result[bus.id] = "on-route";
            continue;
        }

        // fallback to schedule-based logic if no recent GPS
        if (!stop || !stop.last_stop) {
            result[bus.id] = "on-route";
            continue;
        }
        const lastTime = new Date(`1970-01-01T${stop.last_stop}`);
        result[bus.id] = now > lastTime ? "completed" : "on-route";
    }

    return new Response(JSON.stringify(result));
}
