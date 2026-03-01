import db from "$lib/db/sqlite.js";

export function GET({ params }) {
  const userId = Number(params.userId);

  // 1. Find the linked student record
  const student = db.query(`
    SELECT s.id, s.student_id, s.bus_id, s.stop_id, s.school_id
    FROM student_user_links l
    JOIN students s ON s.id = l.student_id
    WHERE l.user_id = ? AND l.approved = 1
  `).get(userId);

  if (!student) {
    return new Response(JSON.stringify({ error: "Student not found" }), { status: 404 });
  }

  // 2. Get bus info
  const bus = db.query(`
    SELECT id, bus_number, status
    FROM buses
    WHERE id = ?
  `).get(student.bus_id);

  if (!bus) {
    return new Response(JSON.stringify({ error: "Bus not found" }), { status: 404 });
  }

  // 3. Get live location
  const loc = db.query(`
    SELECT latitude AS lat, longitude AS lng, updated_at
    FROM bus_locations
    WHERE bus_id = ?
  `).get(bus.id);

  // 4. Get next stop
  const nextStop = db.query(`
    SELECT stop_name AS name, pickup_time AS time, latitude AS lat, longitude AS lng
    FROM bus_stops
    WHERE bus_id = ? AND stop_order > 0
    ORDER BY stop_order ASC
    LIMIT 1
  `).get(bus.id);

  // 5. Get all stops for route
  const stops = db.query(`
    SELECT latitude AS lat, longitude AS lng, stop_name AS name, pickup_time AS time
    FROM bus_stops
    WHERE bus_id = ?
    ORDER BY stop_order ASC
  `).all(bus.id);

  return new Response(JSON.stringify({
    busId: bus.id,
    busNumber: bus.bus_number,
    status: bus.status,
    location: loc || null,
    nextStop: nextStop || null,
    scheduledArrival: nextStop?.time || null,
    eta: nextStop?.time || null,
    stops
  }), { headers: { "Content-Type": "application/json" } });
}
