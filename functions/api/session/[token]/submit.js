export async function onRequestPost({ params, request, env }) {
  if (!env.SESSIONS || !env.APPS_SCRIPT_URL || !env.FORM_API_SECRET) {
    return json({ ok: false, message: "Сервис недоступен." }, 503);
  }

  const token = params.token;
  const raw = await env.SESSIONS.get(`session:${token}`);
  if (!raw) return json({ ok: false, message: "Ссылка устарела или не существует." }, 404);

  const session = JSON.parse(raw);

  if (session.status === "submitted") {
    return json({ ok: false, message: "Бриф уже отправлен.", submissionId: session.submissionId }, 409);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "Неверный формат запроса." }, 400);
  }

  let result;
  try {
    const response = await fetch(env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, apiSecret: env.FORM_API_SECRET }),
      redirect: "follow"
    });
    result = await response.json();
  } catch (error) {
    console.error("Session submit proxy failed", error);
    return json({ ok: false, message: "Не удалось отправить бриф. Попробуйте ещё раз." }, 502);
  }

  if (!result?.ok) {
    return json(result, 400);
  }

  // Mark session as submitted so duplicate submits are blocked
  const now = new Date().toISOString();
  const submissionId = payload.submissionId || result.submissionId || null;
  const updated = { ...session, status: "submitted", submissionId, updatedAt: now };

  await env.SESSIONS.put(`session:${token}`, JSON.stringify(updated), {
    expirationTtl: 31_536_000
  });

  return json(result, 200);
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
