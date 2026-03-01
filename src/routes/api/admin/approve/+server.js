import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export async function POST({ request }) {
  const { pendingId } = await request.json();

  const pending = await db.get(
    `SELECT * FROM pending_accounts WHERE id = ?`,
    [pendingId]
  );

  if (!pending) {
    return json({ error: "Pending account not found" }, { status: 404 });
  }

  await db.run(
    `INSERT INTO users (username, password, school_name)
     VALUES (?, ?, ?)`,
    [pending.username, pending.password, pending.school_name]
  );

  await db.run(`DELETE FROM pending_accounts WHERE id = ?`, [pendingId]);

  return json({ success: true });
}
