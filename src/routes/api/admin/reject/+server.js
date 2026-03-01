import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export async function POST({ request }) {
  const { id } = await request.json();

  if (!id) {
    return json({ error: "Missing pending account ID" }, { status: 400 });
  }

  // Delete the pending account
  db.query(`DELETE FROM pending_accounts WHERE id = ?`).run(id);

  return json({ success: true });
}
