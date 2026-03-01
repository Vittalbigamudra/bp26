import db from "$lib/db/sqlite.js";

const USER = "vmjm";
const PASS = "1234";

export function GET({ request }) {
  const auth = request.headers.get("authorization");

  if (!auth || !auth.startsWith("Basic ")) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Sysadmin API"' }
    });
  }

  const base64 = auth.replace("Basic ", "");
  const [user, pass] = atob(base64).split(":");

  if (user !== USER || pass !== PASS) {
    return new Response("Forbidden", { status: 403 });
  }

  const rows = db
    .query(`
      SELECT id, name, email, message, created_at
      FROM contact_messages
      ORDER BY created_at DESC
    `)
    .all();

  return new Response(JSON.stringify(rows), {
    headers: { "Content-Type": "application/json" }
  });
}
