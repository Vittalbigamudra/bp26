import db from "$lib/db/sqlite.js";

// GET /api/buses/live
// Fetches the most recent known GPS locations for all buses that have valid
// coordinates recorded.
//
// No inputs.
//
// Output (JSON array):
//   [{ bus_id: string, latitude: number, longitude: number, updated_at: string }, ...]
// Only rows with non-null, sane latitude/longitude values are returned.
export function GET() {
    const rows = db
        .query(`
            SELECT bus_id, latitude, longitude, updated_at
            FROM bus_locations
            WHERE latitude IS NOT NULL
              AND longitude IS NOT NULL
              AND latitude BETWEEN -90 AND 90
              AND longitude BETWEEN -180 AND 180
        `)
        .all();

    return new Response(JSON.stringify(rows), {
        headers: { "Content-Type": "application/json" }
    });
}
