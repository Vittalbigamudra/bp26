import db from '$lib/db/sqlite.js';

// Create pending_accounts table
db.query(`
  CREATE TABLE IF NOT EXISTS pending_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    school_name TEXT NOT NULL,
    otp TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Add school_name column to users if missing
try {
  db.query(`ALTER TABLE users ADD COLUMN school_name TEXT`).run();
} catch (e) {
  // Ignore if exists
}

// Add password column to users if missing
try {
  db.query(`ALTER TABLE users ADD COLUMN password TEXT`).run();
} catch (e) {
  // Ignore if exists
}

export default db;
