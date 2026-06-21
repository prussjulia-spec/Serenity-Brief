import assert from "node:assert/strict";
import { getAdminUser } from "../lib/admin-user.js";
import { onRequestGet as getMe } from "../functions/api/admin/me.js";
import { onRequestPost as createSession } from "../functions/api/admin/sessions.js";

const originalFetch = globalThis.fetch;

try {
  await testKnownManager();
  await testUnknownManager();
  await testMissingAccess();
  await testInvalidUsersConfig();
  await testServerOwnsResponsibleName();
  console.log("Admin auth tests passed");
} finally {
  globalThis.fetch = originalFetch;
}

async function testKnownManager() {
  mockIdentity("ANNA@SERENITY.AGENCY");
  const request = accessRequest("https://brief.test/api/admin/me");
  const response = await getMe({
    request,
    env: { ADMIN_USERS_JSON: JSON.stringify({ "anna@serenity.agency": "Анна" }) }
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { ok: true, email: "anna@serenity.agency", name: "Анна" });
}

async function testUnknownManager() {
  mockIdentity("guest@example.com");
  const result = await getAdminUser(
    accessRequest("https://brief.test/api/admin/me"),
    { ADMIN_USERS_JSON: JSON.stringify({ "anna@serenity.agency": "Анна" }) }
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, 403);
  assert.equal(result.email, "guest@example.com");
}

async function testMissingAccess() {
  const result = await getAdminUser(
    new Request("https://brief.test/api/admin/me"),
    { ADMIN_USERS_JSON: JSON.stringify({ "anna@serenity.agency": "Анна" }) }
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
}

async function testInvalidUsersConfig() {
  mockIdentity("anna@serenity.agency");
  const result = await getAdminUser(
    accessRequest("https://brief.test/api/admin/me"),
    { ADMIN_USERS_JSON: "not-json" }
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, 503);
}

async function testServerOwnsResponsibleName() {
  mockIdentity("anna@serenity.agency");
  const writes = [];
  const request = accessRequest("https://brief.test/api/admin/sessions", {
    method: "POST",
    body: JSON.stringify({
      briefId: "website",
      clientName: "Тестовый клиент",
      projectName: "Новый сайт",
      createdBy: "Подменённое имя"
    })
  });

  const response = await createSession({
    request,
    env: {
      ADMIN_USERS_JSON: JSON.stringify({ "anna@serenity.agency": "Анна" }),
      SESSIONS: {
        put: async function (key, value) { writes.push([key, JSON.parse(value)]); }
      }
    }
  });

  assert.equal(response.status, 201);
  assert.equal(writes.length, 1);
  assert.equal(writes[0][1].createdBy, "Анна");
  assert.equal(writes[0][1].createdByEmail, "anna@serenity.agency");
}

function accessRequest(url, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("CF-Access-Jwt-Assertion", "verified-jwt");
  headers.set("Cookie", "CF_Authorization=session-cookie");
  if (init.body) headers.set("Content-Type", "application/json");
  return new Request(url, { ...init, headers });
}

function mockIdentity(email) {
  globalThis.fetch = async function (url, options) {
    assert.equal(new URL(url).pathname, "/cdn-cgi/access/get-identity");
    assert.match(options.headers.Cookie, /CF_Authorization/);
    return new Response(JSON.stringify({ email }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };
}
