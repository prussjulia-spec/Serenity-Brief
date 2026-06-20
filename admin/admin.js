const STATUSES = [
  "Новая", "Взята в работу", "Уточняем", "Передано специалисту",
  "КП готовится", "КП отправлено", "Встреча назначена",
  "Не целевой", "Закрыто", "Тест"
];

const ACTIVE_STATUSES = new Set([
  "Взята в работу", "Уточняем", "Передано специалисту",
  "КП готовится", "КП отправлено", "Встреча назначена"
]);

const CLOSED_STATUSES = new Set(["Не целевой", "Закрыто"]);

const STATUS_CLASS = {
  "Новая": "s-new",
  "Взята в работу": "s-active",
  "Уточняем": "s-clarify",
  "Передано специалисту": "s-assigned",
  "КП готовится": "s-kp",
  "КП отправлено": "s-sent",
  "Встреча назначена": "s-meeting",
  "Не целевой": "s-junk",
  "Закрыто": "s-closed",
  "Тест": "s-test"
};

let briefs = [];
let currentFilter = "all";
let currentId = null;

document.addEventListener("DOMContentLoaded", function () {
  initFilters();
  initPanel();
  loadBriefs();
});

// ── Data ────────────────────────────────────────────────────────────────────

async function loadBriefs() {
  show("loading");
  hide("error");
  hide("empty");
  hide("list");

  try {
    const res = await fetch("/api/admin/briefs");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || "Ошибка сервера");
    briefs = data.briefs || [];
    hide("loading");
    renderStats();
    renderList();
  } catch (err) {
    hide("loading");
    showError("Не удалось загрузить заявки: " + err.message);
  }
}

async function patchBrief(submissionId, updates) {
  const res = await fetch("/api/admin/briefs", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submissionId, updates })
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.message || "Ошибка сохранения");
  return data;
}

// ── Render ───────────────────────────────────────────────────────────────────

function getFiltered() {
  return briefs.filter(function (b) {
    if (currentFilter === "all") return b.status !== "Тест";
    if (currentFilter === "new") return b.status === "Новая";
    if (currentFilter === "active") return ACTIVE_STATUSES.has(b.status);
    if (currentFilter === "closed") return CLOSED_STATUSES.has(b.status);
    if (currentFilter === "test") return b.status === "Тест";
    return true;
  });
}

function renderStats() {
  const real = briefs.filter(function (b) { return b.status !== "Тест"; });
  const newCount = briefs.filter(function (b) { return b.status === "Новая"; }).length;
  const activeCount = briefs.filter(function (b) { return ACTIVE_STATUSES.has(b.status); }).length;
  const testCount = briefs.filter(function (b) { return b.status === "Тест"; }).length;

  el("stats").innerHTML =
    mkStat(real.length, "всего") +
    mkStat(newCount, "новых", "s-new") +
    mkStat(activeCount, "в работе", "s-active") +
    (testCount ? mkStat(testCount, "тест", "s-test") : "");
}

function mkStat(n, label, cls) {
  return '<span class="stat"><b class="' + (cls || "") + '">' + n + '</b> ' + esc(label) + '</span>';
}

function renderList() {
  const items = getFiltered().slice().sort(function (a, b) {
    return b.date > a.date ? 1 : -1;
  });

  if (!items.length) {
    hide("list");
    show("empty");
    return;
  }

  hide("empty");
  show("list");

  el("list").innerHTML = items.map(function (b) {
    return (
      '<div class="card" data-id="' + esc(b.submissionId) + '">' +
        '<div class="card-main">' +
          '<div class="card-company">' + esc(b.company || "—") + '</div>' +
          '<div class="card-meta">' + esc(b.name || "") + (b.contact ? " · " + esc(b.contact) : "") + '</div>' +
          (b.request ? '<div class="card-request">' + esc(b.request.slice(0, 120)) + '</div>' : "") +
        '</div>' +
        '<div class="card-side">' +
          '<span class="badge ' + (STATUS_CLASS[b.status] || "") + '">' + esc(b.status) + '</span>' +
          '<span class="card-type">' + esc(b.briefTitle || "") + '</span>' +
          '<span class="card-date">' + esc(shortDate(b.date)) + '</span>' +
          (b.responsible ? '<span class="card-owner">' + esc(b.responsible) + '</span>' : "") +
        '</div>' +
      '</div>'
    );
  }).join("");

  el("list").querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("click", function () { openPanel(card.dataset.id); });
  });
}

// ── Filters ──────────────────────────────────────────────────────────────────

function initFilters() {
  el("filters").addEventListener("click", function (e) {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    el("filters").querySelectorAll(".filter").forEach(function (f) { f.classList.remove("active"); });
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderList();
  });
}

// ── Panel ────────────────────────────────────────────────────────────────────

function initPanel() {
  el("overlay").addEventListener("click", closePanel);
  el("panel-close").addEventListener("click", closePanel);
  el("btn-save").addEventListener("click", saveChanges);
  el("btn-doc").addEventListener("click", openDoc);
  el("btn-copy-link").addEventListener("click", copyLink);
  el("btn-mark-test").addEventListener("click", toggleTest);
}

function openPanel(submissionId) {
  const b = briefs.find(function (x) { return x.submissionId === submissionId; });
  if (!b) return;
  currentId = submissionId;

  el("panel-title").textContent = b.company || "Заявка";
  el("panel-meta").textContent = [b.briefTitle, b.budget, b.date ? shortDate(b.date) : ""].filter(Boolean).join(" · ");

  const select = el("field-status");
  select.innerHTML = STATUSES.map(function (s) {
    return '<option value="' + esc(s) + '"' + (s === b.status ? " selected" : "") + '>' + esc(s) + '</option>';
  }).join("");

  el("field-responsible").value = b.responsible || "";
  el("field-next-step").value = b.nextStep || "";
  el("field-comment").value = b.comment || "";
  el("save-msg").textContent = "";
  el("save-msg").className = "save-msg";

  const fields = [
    ["Компания", b.company],
    ["Имя", b.name],
    ["Контакт", b.contact],
    ["Мессенджер", b.messenger],
    ["Бюджет", b.budget],
    ["Задача", b.request],
    ["Дата заявки", b.date],
    ["Последнее касание", b.lastTouch],
    ["Ссылка amoCRM", b.amoLink]
  ].filter(function (f) { return f[1]; });

  el("brief-fields").innerHTML = fields.map(function (f) {
    return '<div class="brief-field"><dt class="bf-label">' + esc(f[0]) + '</dt><dd class="bf-value">' + esc(String(f[1])) + '</dd></div>';
  }).join("");

  el("btn-doc").disabled = !b.docUrl;
  el("btn-mark-test").textContent = b.status === "Тест" ? "Снять отметку «Тест»" : "Отметить как тест";

  show("overlay");
  el("panel").classList.remove("hidden");
  document.body.classList.add("panel-open");
  el("panel").scrollTop = 0;
}

function closePanel() {
  hide("overlay");
  el("panel").classList.add("hidden");
  document.body.classList.remove("panel-open");
  currentId = null;
}

// ── Actions ───────────────────────────────────────────────────────────────────

async function saveChanges() {
  if (!currentId) return;

  const updates = {
    status: el("field-status").value,
    responsible: el("field-responsible").value.trim(),
    nextStep: el("field-next-step").value.trim(),
    comment: el("field-comment").value.trim()
  };

  const btn = el("btn-save");
  const msg = el("save-msg");
  btn.disabled = true;
  msg.textContent = "Сохраняю...";
  msg.className = "save-msg";

  try {
    await patchBrief(currentId, updates);
    applyLocal(currentId, updates);
    msg.textContent = "Сохранено ✓";
    msg.className = "save-msg msg-ok";
    renderStats();
    renderList();
  } catch (err) {
    msg.textContent = err.message;
    msg.className = "save-msg msg-err";
  } finally {
    btn.disabled = false;
  }
}

function openDoc() {
  const b = current();
  if (b && b.docUrl) window.open(b.docUrl, "_blank", "noopener,noreferrer");
}

function copyLink() {
  const b = current();
  if (!b) return;
  const link = window.location.origin + "/";
  navigator.clipboard.writeText(link).then(function () {
    const btn = el("btn-copy-link");
    btn.textContent = "Скопировано!";
    setTimeout(function () { btn.textContent = "Скопировать ссылку на форму"; }, 2000);
  });
}

async function toggleTest() {
  const b = current();
  if (!b) return;
  const newStatus = b.status === "Тест" ? "Новая" : "Тест";
  const btn = el("btn-mark-test");
  btn.disabled = true;

  try {
    await patchBrief(currentId, { status: newStatus });
    applyLocal(currentId, { status: newStatus });
    el("field-status").value = newStatus;
    btn.textContent = newStatus === "Тест" ? "Снять отметку «Тест»" : "Отметить как тест";
    renderStats();
    renderList();
  } catch (err) {
    // silent — user sees no change
  } finally {
    btn.disabled = false;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function applyLocal(submissionId, updates) {
  const b = briefs.find(function (x) { return x.submissionId === submissionId; });
  if (!b) return;
  Object.assign(b, updates);
}

function current() {
  return currentId ? briefs.find(function (x) { return x.submissionId === currentId; }) : null;
}

function el(id) { return document.getElementById(id); }
function show(id) { el(id).classList.remove("hidden"); }
function hide(id) { el(id).classList.add("hidden"); }

function showError(msg) {
  const e = el("error");
  e.textContent = msg;
  e.classList.remove("hidden");
}

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortDate(dateStr) {
  if (!dateStr) return "";
  return String(dateStr).split(" ")[0];
}
