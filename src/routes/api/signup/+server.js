import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST({ request }) {
  const { username, password, schoolName } = await request.json();

  if (!username || !password || !schoolName) {
    return json({ error: 'Missing fields' }, { status: 400 });
  }

  // Check if user already exists
  const existingQuery = db.query(`
    SELECT id FROM users WHERE username = ? AND school_name = ?
  `);

  const existing = existingQuery.get(username, schoolName);

  if (existing) {
    return json({ error: 'Username already exists for this school' }, { status: 409 });
  }

  // Create OTP
  const otp = generateOTP();

  // Insert into pending_accounts
  const insertQuery = db.query(`
    INSERT INTO pending_accounts (username, password, school_name, otp)
    VALUES (?, ?, ?, ?)
  `);

  insertQuery.run(username, password, schoolName, otp);

  return json({
    success: true,
    message: "Account pending admin approval",
    otpRequired: true
  });
}
