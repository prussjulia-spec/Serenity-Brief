import { getAdminUser } from "../../../lib/admin-user.js";

export async function onRequestGet({ request, env }) {
  const user = await getAdminUser(request, env);
  if (!user.ok) return json(user, user.status);
  return json({ ok: true, email: user.email, name: user.name });
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
