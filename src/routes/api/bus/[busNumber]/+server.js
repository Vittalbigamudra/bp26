import db from "$lib/db/sqlite.js";

export function GET({ params }) {
  const busNumber = params.busNumber;

  const row = db
    .query(
      `SELECT 
         bus_number,
         lat,
         lng,
         next_stop,
         eta,
         scheduledArrival
       FROM buses
       WHERE bus_number = ?`
    )
    .get(busNumber);

  if (!row) {
    return new Response(JSON.stringify({ error: "Bus not found" }), { status: 404 });
  }

  return new Response(JSON.stringify(row), {
    headers: { "Content-Type": "application/json" }
  });
}
