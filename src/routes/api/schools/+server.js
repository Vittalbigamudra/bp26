import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export async function GET() {
  // Resolve path relative to this file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Walk from routes/api/schools → routes/api → routes → src → lib/assets
  const filePath = path.join(__dirname, '../../../lib/assets/raw_stops.tsv');

  const raw = fs.readFileSync(filePath, 'utf-8');

  const lines = raw.trim().split('\n');
  const rows = lines.map(line => line.split('\t'));

  const schoolNames = new Set();

  for (const row of rows) {
    const school = row[2]?.trim();
    if (school) schoolNames.add(school);
  }

  return json([...schoolNames]);
}
