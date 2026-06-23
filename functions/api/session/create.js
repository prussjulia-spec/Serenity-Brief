export async function onRequestPost({ request, env }) {
  if (!env.SESSIONS || !env.ADMIN_SECRET) {
    return json({ ok: false, message: "Сервис недоступен." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "Неверный формат запроса." }, 400);
  }

  if (!body.adminSecret || body.adminSecret !== env.ADMIN_SECRET) {
    return json({ ok: false, message: "Unauthorized" }, 401);
  }

  const briefId = (body.briefId || "").trim();
  const clientName = (body.clientName || "").trim();
  const createdBy = (body.createdBy || "").trim();

  if (!briefId || !clientName) {
    return json({ ok: false, message: "Обязательные поля: briefId, clientName" }, 400);
  }

  const token = crypto.randomUUID();
  const now = new Date().toISOString();

  const session = {
    v: 1,
    token,
    briefId,
    clientName,
    createdBy,
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
  const url = `${origin}/?session=${token}`;

  return json({ ok: true, token, url }, 201);
}

export function onRequestGet() {
  return json({ ok: false, message: "Метод не поддерживается." }, 405);
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
