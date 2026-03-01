import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export async function POST({ request }) {
  const { username, schoolName, otp } = await request.json();

  if (!username || !schoolName || !otp) {
    return json({ error: "Missing fields" }, { status: 400 });
  }

  const pending = db.query(`
    SELECT * FROM pending_accounts
    WHERE username = ? AND school_name = ? AND otp = ?
  `).get(username, schoolName, otp);

  if (!pending) {
    return json({ error: "Invalid OTP or account not found" }, { status: 400 });
  }

  db.query(`
    INSERT INTO users (username, password_hash, school_name, role)
    VALUES (?, ?, ?, ?)
  `).run(
    pending.username,
    pending.password,
    pending.school_name,
    "student"
  );

  db.query(`DELETE FROM pending_accounts WHERE id = ?`).run(pending.id);

  return json({ success: true });
}
