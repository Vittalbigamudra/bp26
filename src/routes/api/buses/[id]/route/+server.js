import { json } from '@sveltejs/kit';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

export async function GET({ params }) {
    const busId = String(params.id); // Ensure we are comparing strings
    const stops = [];

    // Use absolute path to ensure the server finds the file
    const csvPath = path.resolve('src/lib/assets/bus_stops.csv');

    return new Promise((resolve) => {
        if (!fs.existsSync(csvPath)) {
            console.error("CSV File not found at:", csvPath);
            return resolve(json([], { status: 404 }));
        }

        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
                // IMPORTANT: Match the column name in your CSV exactly
                if (String(row.bus_id) === busId) {
                    stops.push({
                        name: row.name,
                        lat: parseFloat(row.lat),
                        lng: parseFloat(row.lng),
                        time: row.pickup_time
                    });
                }
            })
            .on('end', () => {
                // Sort by time so the route line is drawn in the right order
                stops.sort((a, b) => a.time.localeCompare(b.time));
                resolve(json(stops));
            });
    });
}