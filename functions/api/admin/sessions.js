// POST /api/admin/sessions → create a personal client brief link.

export async function onRequestPost({ request, env }) {
  const isLocalDev = env.ENVIRONMENT === "development";
  if (!isLocalDev && !request.headers.get("CF-Access-Jwt-Assertion")) {
    return json({ ok: false, message: "Доступ запрещён." }, 401);
  }

  if (!env.SESSIONS) {
    return json({ ok: false, message: "Сервис недоступен." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "Неверный формат запроса." }, 400);
  }

  const briefId = String(body.briefId || "").trim();
  const clientName = String(body.clientName || "").trim();
  const projectName = String(body.projectName || "").trim();
  const createdBy = String(body.createdBy || "").trim();

  if (!briefId || !clientName || !createdBy) {
    return json({ ok: false, message: "Укажите тип брифа, клиента и ответственного менеджера." }, 400);
  }

  const token = crypto.randomUUID();
  const now = new Date().toISOString();
  const session = {
    v: 1,
    token,
    briefId: briefId.slice(0, 100),
    clientName: clientName.slice(0, 500),
    projectName: projectName.slice(0, 1000),
    createdBy: createdBy.slice(0, 200),
    status: "draft",
    answers: {},
    submissionId: null,
    createdAt: now,
    updatedAt: now
  };

  await env.SESSIONS.put(`session:${token}`, JSON.stringify(session), {
    expirationTtl: 31_536_000
  });

  const origin = new URL(request.url).origin;
  return json({ ok: true, token, url: `${origin}/?session=${token}` }, 201);
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
