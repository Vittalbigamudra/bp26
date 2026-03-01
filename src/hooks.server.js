const USER = "vmjm";
const PASS = "1234";

export async function handle({ event, resolve }) {
  const url = event.url.pathname;

  // Protect sysadmin UI and sysadmin API
  const protectedPaths = [
    "/sysadmin",
    "/api/sysadmin",
  ];

  const isProtected =
    protectedPaths.some((p) => url === p || url.startsWith(p + "/"));

  if (isProtected) {
    const auth = event.request.headers.get("authorization");

    if (!auth || !auth.startsWith("Basic ")) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Sysadmin Area"' }
      });
    }

    const base64 = auth.replace("Basic ", "");
    const [user, pass] = atob(base64).split(":");

    if (user !== USER || pass !== PASS) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  return resolve(event);
}
