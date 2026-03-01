import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export async function POST({ request }) {
  const { username, password, schoolName } = await request.json();

  // Validate required fields
  if (!username || !password || !schoolName) {
    return json({ error: 'Missing fields' }, { status: 400 });
  }

  // Check if user exists
  const user = db.query(
    `SELECT * FROM users
     WHERE username = ? AND school_name = ?`
  ).get(username, schoolName);

  if (!user) {
    return json({ error: "User not found or not approved" }, { status: 404 });
  }

  // Compare password (your DB stores password_hash)
  if (user.password_hash !== password) {
    return json({ error: "Incorrect password" }, { status: 401 });
  }

  return json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      schoolName: user.school_name,
      role: user.role
    }
  });
}
