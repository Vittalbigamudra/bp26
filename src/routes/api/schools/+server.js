// GET /api/schools
// Returns a simple list of schools from the database.
//
// No inputs.
//
// Output (JSON array):
//   [{ id: number, name: string }, ...]
import db from "$lib/db/sqlite.js";

export function GET() {
    const rows = db
        .query(`SELECT id, name FROM schools ORDER BY name ASC`)
        .all();

    return new Response(JSON.stringify(rows), {
        headers: { "Content-Type": "application/json" }
    });
}
