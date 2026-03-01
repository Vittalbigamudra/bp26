import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export async function GET() {
  const query = db.query(`
    SELECT id, username, school_name, otp, created_at
    FROM pending_accounts
    ORDER BY created_at DESC
  `);

  const rows = query.all(); // bun:sqlite API

  return json(rows);
}
