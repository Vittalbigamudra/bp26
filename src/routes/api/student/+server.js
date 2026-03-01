import db from "$lib/db/sqlite.js";

export async function POST({ request }) {
  try {
    const { studentId, password, schoolId } = await request.json();

    if (!studentId || !password || !schoolId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Fetch student
    const row = db
      .query(
        `SELECT id, student_id, password, school_id, bus_number
         FROM students
         WHERE student_id = ? AND school_id = ?`
      )
      .get(studentId, schoolId);

    if (!row) {
      return new Response(JSON.stringify({ error: "Student not found" }), { status: 404 });
    }

    if (row.password !== password) {
      return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        studentId: row.student_id,
        schoolId: row.school_id,
        busNumber: row.bus_number
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Student login error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
