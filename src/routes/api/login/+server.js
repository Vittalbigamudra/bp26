import db from "$lib/db/sqlite.js";

export async function POST({ request }) {
  try {
    const { username, password, schoolId } = await request.json();

    if (!username || !password || !schoolId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Example: check against a "users" table
    const row = db
      .query(
        `SELECT id, username, password, school_id
         FROM users
         WHERE username = ? AND password = ? AND school_id = ?`
      )
      .get(username, password, schoolId);

    if (!row) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }

    return new Response(JSON.stringify({ ok: true, userId: row.id }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Login error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
