const APP = {
  REGISTRY_TITLE: "Ответы на брифы Serenity",
  REGISTRY_SHEET: "Заявки",
  BRIEF_IDS: ["primary", "startup", "strategy", "complex", "performance", "seo", "smm", "website", "ecommerce", "branding", "naming", "pr"],
  BUDGET_OPTIONS: ["До 100 000 ₽", "100 000–300 000 ₽", "300 000–700 000 ₽", "700 000–1 500 000 ₽", "Более 1 500 000 ₽", "Бюджет пока не определён, нужна помощь с оценкой"],
  PRIMARY_BUDGET_OPTIONS: ["Пока не понимаю", "До 100 000 ₽", "100 000–300 000 ₽", "300 000–700 000 ₽", "700 000 ₽+", "Хочу обсудить"],
  CONTACT_METHODS: ["Telegram", "Телефон", "Email", "WhatsApp", "Другое"],
  STATUSES: ["Новая", "Взята в работу", "Уточняем", "Передано специалисту", "КП готовится", "КП отправлено", "Встреча назначена", "Не целевой", "Закрыто"],
  CLIENT_BRIEFS_FOLDER_ID: "1jQOtrhreUuquWiI1BI8-G19vK5X9g8FA",
  REQUIRED_PROPERTIES: ["RESPONSES_FOLDER_ID", "REGISTRY_SPREADSHEET_ID", "FORM_API_SECRET"]
};

const HEADERS = [
  "ID отправки",
  "Дата заявки",
  "Компания",
  "Имя",
  "Контакт",
  "Мессенджер",
  "Задача",
  "Бюджет",
  "Статус",
  "Ответственный",
  "Комментарий менеджера",
  "Ссылка на сделку в amo",
  "Дата последнего касания",
  "Следующий шаг",
  "Бриф",
  "Google Doc",
  "Согласие получено",
  "Ответы JSON"
];

function doGet(event) {
  const briefId = event && event.parameter ? event.parameter.brief : "";
  let html = HtmlService.createHtmlOutputFromFile("Index").getContent();
  const privacyPolicyUrl = getPublicUrlProperty_("PRIVACY_POLICY_URL") || "https://serenity.agency/privacy.pdf";

  if (APP.BRIEF_IDS.indexOf(briefId) !== -1) {
    const bootstrap = `<script>history.replaceState({}, "", "?brief=${briefId}");</script>`;
    html = html.replace("</head>", `${bootstrap}</head>`);
  }

  html = html.replace('privacyPolicyUrl: "https://serenity.agency/privacy.pdf"', `privacyPolicyUrl: ${JSON.stringify(privacyPolicyUrl)}`);

  return HtmlService.createHtmlOutput(html)
    .setTitle("Брифы Serenity")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function doPost(event) {
  try {
    const payload = JSON.parse(event && event.postData ? event.postData.contents : "{}");
    const expectedSecret = getProperty_("FORM_API_SECRET");
    if (!payload.apiSecret || payload.apiSecret !== expectedSecret) {
      return jsonResponse_({ ok: false, message: "Запрос отклонён." });
    }
    delete payload.apiSecret;
    return jsonResponse_(saveBrief(payload));
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, message: "Не удалось обработать запрос." });
  }
}

function saveBrief(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    if (payload && payload.honeypot) return { ok: true };
    validate_(payload);

    const sheet = getRegistrySheet_();
    const existingUrl = findExistingSubmission_(sheet, payload.submissionId);
    if (existingUrl) {
      return { ok: true, duplicate: true, documentUrl: existingUrl };
    }

    enforceRateLimit_(payload.contactEmail || payload.contactValue);
    const documentUrl = createBriefDocument_(payload);
    const submittedAt = new Date();
    const contact = payload.contactValue || [payload.contactEmail, payload.contactPhone].filter(Boolean).join("\n");
    const contactMethod = payload.contactMethod || payload.contactSocial;

    sheet.appendRow([
      safeCell_(payload.submissionId),
      submittedAt,
      safeCell_(payload.companyName),
      safeCell_(payload.contactName),
      safeCell_(contact),
      safeCell_(contactMethod),
      safeCell_(payload.request),
      safeCell_(payload.budget),
      "Новая",
      "",
      "",
      "",
      "",
      "",
      safeCell_(payload.briefTitle),
      documentUrl,
      payload.consentAt ? new Date(payload.consentAt) : submittedAt,
      JSON.stringify(payload.sections || [])
    ]);

    const registryRowUrl = `${sheet.getParent().getUrl()}#gid=${sheet.getSheetId()}&range=A${sheet.getLastRow()}:R${sheet.getLastRow()}`;

    try {
      notifyNewSubmission_(payload, documentUrl, registryRowUrl);
    } catch (notificationError) {
      console.error("Notification failed", notificationError);
    }

    return { ok: true, documentUrl: documentUrl, registryUrl: registryRowUrl };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Не удалось сохранить бриф. Проверьте обязательные поля и попробуйте ещё раз." };
  } finally {
    lock.releaseLock();
  }
}

function validate_(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Некорректные данные.");
  const isPrimary = payload.briefId === "primary";
  const hasPrimaryBasics = payload.companyName && payload.contactName && payload.contactMethod && payload.contactValue && payload.request;
  const hasStandardBasics = payload.companyName && payload.contactName && payload.contactEmail && payload.request && payload.budget;
  if (!payload.submissionId || !payload.briefId || !payload.briefTitle || (isPrimary ? !hasPrimaryBasics : !hasStandardBasics)) {
    throw new Error("Не заполнены обязательные поля.");
  }
  if (payload.privacyConsent !== true || !payload.consentAt) throw new Error("Не получено согласие на обработку данных.");
  if (APP.BRIEF_IDS.indexOf(payload.briefId) === -1) throw new Error("Неизвестный тип брифа.");
  if (!isPrimary && APP.BUDGET_OPTIONS.indexOf(payload.budget) === -1) throw new Error("Некорректная категория бюджета.");
  if (isPrimary && payload.budget && APP.PRIMARY_BUDGET_OPTIONS.indexOf(payload.budget) === -1) throw new Error("Некорректная категория бюджета.");
  if (isPrimary && APP.CONTACT_METHODS.indexOf(payload.contactMethod) === -1) throw new Error("Некорректный способ связи.");
  if (!isPrimary && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contactEmail)) throw new Error("Некорректный email.");
  if (isPrimary && payload.contactMethod === "Email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contactValue)) throw new Error("Некорректный email.");
  if (Number(payload.formStartedAt) && Date.now() - Number(payload.formStartedAt) < 2500) throw new Error("Слишком быстрая отправка.");

  [
    payload.submissionId, payload.briefTitle, payload.companyName, payload.contactName,
    payload.contactEmail, payload.contactPhone || "", payload.contactSocial || "",
    payload.contactMethod || "", payload.contactValue || "",
    payload.request || "", payload.budget || ""
  ].forEach(function(value) {
    if (typeof value !== "string" || value.length > 5000) throw new Error("Некорректные данные.");
  });
  if (!Array.isArray(payload.sections) || payload.sections.length > 8) throw new Error("Некорректная структура брифа.");
  payload.sections.forEach(function(section) {
    if (!section || typeof section.title !== "string" || section.title.length > 200 || !Array.isArray(section.answers) || section.answers.length > 25) {
      throw new Error("Некорректная структура брифа.");
    }
  });
  if (payload.briefId === "startup") validateBudgetAnswer_(payload.sections, "Какой бюджет доступен на первые тесты?");
  if (payload.briefId === "complex" || payload.briefId === "performance") validateBudgetAnswer_(payload.sections, "Какой медиабюджет планируете?");
  if (JSON.stringify(payload).length > 150000) throw new Error("Бриф слишком большой.");
}

function validateBudgetAnswer_(sections, question) {
  const answer = findAnswerInSections_(sections, [question]);
  if (APP.BUDGET_OPTIONS.indexOf(answer) === -1) throw new Error("Не заполнен обязательный бюджетный вопрос.");
}

function enforceRateLimit_(email) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(email).toLowerCase());
  const key = "rate-" + Utilities.base64EncodeWebSafe(digest).slice(0, 32);
  const cache = CacheService.getScriptCache();
  const attempts = Number(cache.get(key) || 0) + 1;
  if (attempts > 5) throw new Error("Слишком много отправок.");
  cache.put(key, String(attempts), 3600);
}

function getRegistrySheet_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("REGISTRY_SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("Не задано свойство REGISTRY_SPREADSHEET_ID.");

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(APP.REGISTRY_SHEET) || spreadsheet.getSheets()[0].setName(APP.REGISTRY_SHEET);
  migrateRegistry_(sheet);
  formatRegistrySheet_(sheet);
  return sheet;
}

function setupRegistry() {
  const sheet = getRegistrySheet_();
  createManagerFilterViews_(sheet);
}

function migrateRegistry_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }

  const oldHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (oldHeaders.join("|") === HEADERS.join("|")) return;

  const oldRows = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues()
    : [];
  const index = {};
  oldHeaders.forEach(function(header, column) { index[header] = column; });
  const value = function(row, names) {
    for (let i = 0; i < names.length; i += 1) {
      if (index[names[i]] !== undefined) return row[index[names[i]]];
    }
    return "";
  };

  const migrated = oldRows.map(function(row) {
    const email = value(row, ["Email", "Контакт"]);
    const phone = value(row, ["Телефон"]);
    const json = value(row, ["Ответы JSON"]);
    return [
      value(row, ["ID отправки"]),
      value(row, ["Дата заявки", "Дата"]),
      value(row, ["Компания"]),
      value(row, ["Имя", "Контакт"]),
      [email, phone].filter(Boolean).join("\n"),
      value(row, ["Мессенджер", "Мессенджер / соцсеть"]),
      findAnswerInJson_(json, ["С чем вы пришли к Serenity?"]),
      findAnswerInJson_(json, ["Какой бюджет планируете на услуги Serenity?", "Какой бюджет планируете?", "Какой бюджет готовы выделить на тесты?", "Какой бюджет готов выделить бизнес?"]),
      normalizeStatus_(value(row, ["Статус"])),
      value(row, ["Ответственный"]),
      value(row, ["Комментарий менеджера", "Комментарий"]),
      value(row, ["Ссылка на сделку в amo"]),
      value(row, ["Дата последнего касания"]),
      value(row, ["Следующий шаг"]),
      value(row, ["Бриф"]),
      value(row, ["Google Doc"]),
      value(row, ["Согласие получено"]),
      json
    ];
  });

  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  if (migrated.length) sheet.getRange(2, 1, migrated.length, HEADERS.length).setValues(migrated);
}

function findAnswerInJson_(json, questions) {
  try {
    const sections = typeof json === "string" ? JSON.parse(json) : json;
    return findAnswerInSections_(sections, questions);
  } catch (error) {
    return "";
  }
}

function findAnswerInSections_(sections, questions) {
  for (let i = 0; i < sections.length; i += 1) {
    for (let j = 0; j < sections[i].answers.length; j += 1) {
      if (questions.indexOf(sections[i].answers[j].question) !== -1) return sections[i].answers[j].answer || "";
    }
  }
  return "";
}

function normalizeStatus_(status) {
  if (status === "Новый" || !status) return "Новая";
  return APP.STATUSES.indexOf(status) !== -1 ? status : "Новая";
}

function formatRegistrySheet_(sheet) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight("bold")
    .setBackground("#171719")
    .setFontColor("#ffffff")
    .setWrap(true);

  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(APP.STATUSES, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 9, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(statusRule);
  sheet.getRange(2, 11, Math.max(sheet.getMaxRows() - 1, 1), 1).clearDataValidations();

  if (sheet.getLastRow() > 1) {
    const statusRange = sheet.getRange(2, 9, sheet.getLastRow() - 1, 1);
    statusRange.setValues(statusRange.getValues().map(function(row) { return [normalizeStatus_(row[0])]; }));
  }

  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).createFilter();
  sheet.hideColumns(1);
  sheet.hideColumns(18);
  sheet.getRange("B:B").setNumberFormat("dd.mm.yyyy hh:mm");
  sheet.getRange("M:M").setNumberFormat("dd.mm.yyyy");
  sheet.getRange("N:N").setNumberFormat("@");
  sheet.getRange("Q:Q").setNumberFormat("dd.mm.yyyy hh:mm");
  sheet.getDataRange().setVerticalAlignment("top");
  sheet.getRange(2, 3, Math.max(sheet.getMaxRows() - 1, 1), 15).setWrap(true);

  const widths = [130, 190, 160, 220, 180, 300, 130, 170, 180, 280, 220, 150, 190, 190, 130, 160];
  widths.forEach(function(width, i) { sheet.setColumnWidth(i + 2, width); });
}

function createManagerFilterViews_(sheet) {
  const spreadsheet = sheet.getParent();
  const views = [
    { title: "Новые", query: "select * where Col8 = 'Новая'" },
    { title: "Без ответственного", query: "select * where Col9 is null" },
    { title: "Без движения", query: "select * where Col9 is not null and Col8 <> 'Новая' and Col8 <> 'Не целевой' and Col8 <> 'Закрыто' and (Col12 is null or Col13 is null)" },
    { title: "КП отправлено", query: "select * where Col8 = 'КП отправлено'" }
  ];

  views.forEach(function(item) {
    const viewSheet = spreadsheet.getSheetByName(item.title) || spreadsheet.insertSheet(item.title);
    viewSheet.clear();
    viewSheet.getRange("A1").setFormula(`=QUERY('${APP.REGISTRY_SHEET}'!B:Q;"${item.query}";1)`);
    viewSheet.setFrozenRows(1);
    viewSheet.setTabColor("#7655ff");
    viewSheet.getRange(1, 1, 1, 16)
      .setFontWeight("bold")
      .setBackground("#171719")
      .setFontColor("#ffffff")
      .setWrap(true);
    viewSheet.getDataRange().setVerticalAlignment("top").setWrap(true);
  });

  const mySheet = spreadsheet.getSheetByName("Мои заявки") || spreadsheet.insertSheet("Мои заявки");
  const ownerRange = sheet.getRange(2, 10, Math.max(sheet.getMaxRows() - 1, 1), 1);
  const availableOwners = ownerRange.getDisplayValues()
    .map(function(row) { return String(row[0] || "").trim(); })
    .filter(Boolean);
  const currentOwner = String(mySheet.getRange("B1").getValue() || "").trim();
  const selectedOwner = availableOwners.indexOf(currentOwner) !== -1 ? currentOwner : "";
  mySheet.clear();
  mySheet.getRange("A1").setValue("Ответственный:");
  mySheet.getRange("B1").setValue(selectedOwner);
  mySheet.getRange("B1").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInRange(ownerRange, true)
      .setAllowInvalid(false)
      .build()
  );
  mySheet.getRange("A3").setFormula(
    `=QUERY('${APP.REGISTRY_SHEET}'!B:Q;"select * where Col9 = '"&SUBSTITUTE(B1;"'";"''")&"'";1)`
  );
  mySheet.setFrozenRows(3);
  mySheet.setTabColor("#7655ff");
  mySheet.getRange("A1:B1").setFontWeight("bold").setBackground("#171719").setFontColor("#ffffff");
  mySheet.getRange(3, 1, 1, 16).setFontWeight("bold").setBackground("#171719").setFontColor("#ffffff").setWrap(true);
  mySheet.getDataRange().setVerticalAlignment("top").setWrap(true);
}

function findExistingSubmission_(sheet, submissionId) {
  if (sheet.getLastRow() < 2) return "";
  const match = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1)
    .createTextFinder(submissionId)
    .matchEntireCell(true)
    .findNext();
  return match ? sheet.getRange(match.getRow(), 16).getValue() : "";
}

function createBriefDocument_(payload) {
  const date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  const title = `${payload.briefTitle} — ${payload.companyName} — ${date}`;
  const document = DocumentApp.create(title);
  const body = document.getBody();

  body.appendParagraph(payload.briefTitle).setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph(`${payload.companyName} · ${payload.contactName} · ${payload.contactValue || payload.contactEmail}`);
  if (payload.contactMethod) body.appendParagraph(`Удобный способ связи: ${payload.contactMethod}`);
  if (payload.contactPhone) body.appendParagraph(`Телефон: ${payload.contactPhone}`);
  if (payload.contactSocial) body.appendParagraph(`Мессенджер / соцсеть: ${payload.contactSocial}`);
  body.appendParagraph(`Получено: ${date}`);
  body.appendParagraph(`Согласие на обработку данных: ${payload.consentAt}`);

  (payload.sections || []).forEach(function(section) {
    body.appendParagraph(section.title).setHeading(DocumentApp.ParagraphHeading.HEADING1);
    (section.answers || []).forEach(function(item) {
      body.appendParagraph(item.question).setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph(item.answer || "Нет ответа");
    });
  });

  document.saveAndClose();
  moveFileToFolder_(document.getId());
  return document.getUrl();
}

function notifyNewSubmission_(payload, documentUrl, registryUrl) {
  const properties = PropertiesService.getScriptProperties();
  const provider = String(properties.getProperty("NOTIFICATION_PROVIDER") || "").toLowerCase();
  if (!provider) return;

  const text = [
    "Новая заявка с брифа Serenity",
    `Компания: ${payload.companyName}`,
    `Контакт: ${payload.contactName} · ${payload.contactValue || payload.contactEmail}${payload.contactPhone ? " · " + payload.contactPhone : ""}`,
    payload.contactMethod ? `Связаться через: ${payload.contactMethod}` : (payload.contactSocial ? `Мессенджер: ${payload.contactSocial}` : ""),
    payload.request ? `Задача: ${payload.request.slice(0, 500)}` : "",
    payload.budget ? `Бюджет: ${payload.budget}` : "",
    `Бриф: ${payload.briefTitle}`,
    `Документ: ${documentUrl}`,
    `Реестр: ${registryUrl}`
  ].filter(Boolean).join("\n");

  if (provider === "slack") {
    const webhook = properties.getProperty("SLACK_WEBHOOK_URL");
    if (!webhook) throw new Error("Не задан SLACK_WEBHOOK_URL.");
    UrlFetchApp.fetch(webhook, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ text: text })
    });
    return;
  }

  if (provider === "telegram") {
    const token = properties.getProperty("TELEGRAM_BOT_TOKEN");
    const chatId = properties.getProperty("TELEGRAM_CHAT_ID");
    if (!token || !chatId) throw new Error("Не заданы Telegram-настройки.");
    UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "post",
      payload: { chat_id: chatId, text: text, disable_web_page_preview: true }
    });
  }
}

function testNotification() {
  notifyNewSubmission_({
    companyName: "Тест Serenity",
    contactName: "Тестовый клиент",
    contactEmail: "test@example.com",
    contactPhone: "",
    contactSocial: "",
    request: "Проверка уведомления о новой заявке",
    budget: "",
    briefTitle: "Первичный бриф"
  }, "https://docs.google.com/", SpreadsheetApp.openById(getProperty_("REGISTRY_SPREADSHEET_ID")).getUrl());
}

function checkConfiguration() {
  const properties = PropertiesService.getScriptProperties();
  const result = {
    required: {},
    notifications: properties.getProperty("NOTIFICATION_PROVIDER") || "не подключены",
    privacyPolicyUrl: properties.getProperty("PRIVACY_POLICY_URL") || "не задана"
  };
  APP.REQUIRED_PROPERTIES.forEach(function(name) { result.required[name] = Boolean(properties.getProperty(name)); });
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function getProperty_(name) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) throw new Error(`Не задано свойство ${name}.`);
  return value;
}

function getPublicUrlProperty_(name) {
  const value = String(PropertiesService.getScriptProperties().getProperty(name) || "").trim();
  return /^https:\/\/[^\s]+$/i.test(value) ? value : "";
}

function jsonResponse_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function moveFileToFolder_(fileId) {
  const file = DriveApp.getFileById(fileId);
  const folder = DriveApp.getFolderById(APP.CLIENT_BRIEFS_FOLDER_ID);
  file.moveTo(folder);
}

function safeCell_(value) {
  const text = String(value || "");
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}
