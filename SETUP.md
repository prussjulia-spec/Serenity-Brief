# Первичная настройка

Актуальная инструкция находится в:

- [README.md](README.md) — устройство проекта;
- [docs/SCRIPT_PROPERTIES.md](docs/SCRIPT_PROPERTIES.md) — закрытые настройки;
- [docs/OPERATIONS.md](docs/OPERATIONS.md) — тестирование и публикация.

Перед первым запуском задайте обязательные свойства Apps Script:

- `RESPONSES_FOLDER_ID`;
- `REGISTRY_SPREADSHEET_ID`;
- `FORM_API_SECRET`.

Затем:

1. перенесите `google-apps-script/Code.gs` и собранный `google-apps-script/Index.html` в Apps Script;
2. запустите `setupRegistry` и опубликуйте Web app с доступом `Anyone`;
3. создайте Cloudflare Pages-проект с командой `npm run build:pages` и каталогом `dist`;
4. добавьте в Pages переменные `APPS_SCRIPT_URL` и тот же `FORM_API_SECRET`;
5. подключите домен `brief.serenity.agency`.
