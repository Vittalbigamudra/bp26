import db from "$lib/db/sqlite.js";

export async function POST({ request }) {
  try {
    const { username, password, schoolId } = await request.json();

    if (!username || !password || !schoolId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Check if username already exists
    const existing = db
      .query("SELECT id FROM users WHERE username = ?")
      .get(username);

    if (existing) {
      return new Response(JSON.stringify({ error: "Username already taken" }), { status: 409 });
    }

    // Insert new user
    db.query(
      "INSERT INTO users (username, password, school_id) VALUES (?, ?, ?)"
    ).run(username, password, schoolId);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Signup error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
