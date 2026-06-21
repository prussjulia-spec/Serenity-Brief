# Закрытые настройки Apps Script

Значения задаются в `Project Settings → Script Properties`. Не добавляйте реальные значения в GitHub, код, README или скриншоты.

## Обязательные

| Свойство | Что хранит |
| --- | --- |
| `RESPONSES_FOLDER_ID` | ID рабочей папки с брифами Serenity |
| `REGISTRY_SPREADSHEET_ID` | ID Google Sheets с реестром заявок |
| `FORM_API_SECRET` | длинная случайная строка для связи Cloudflare Pages и Apps Script |

## Уведомления

### Slack

| Свойство | Значение |
| --- | --- |
| `NOTIFICATION_PROVIDER` | `slack` |
| `SLACK_WEBHOOK_URL` | URL Incoming Webhook Slack |

### Telegram

| Свойство | Значение |
| --- | --- |
| `NOTIFICATION_PROVIDER` | `telegram` |
| `TELEGRAM_BOT_TOKEN` | токен бота от BotFather |
| `TELEGRAM_CHAT_ID` | ID чата или канала |

## Дополнительные

| Свойство | Что хранит |
| --- | --- |
| `PRIVACY_POLICY_URL` | утверждённая публичная ссылка на политику |
| `PUBLIC_FORM_URL` | рабочий адрес формы, обычно `https://brief.serenity.agency` |

Ссылка на политику автоматически подставляется в форму из свойства `PRIVACY_POLICY_URL` при открытии опубликованного Web app.

Документы с полными ответами клиентов сохраняются в подпапку «Брифы клиентов» по константе `APP.CLIENT_BRIEFS_FOLDER_ID` в `google-apps-script/Code.gs`. Это защищает от дублей папок с похожими названиями.

## Cloudflare Pages

В настройках проекта Pages задаются закрытые переменные:

| Переменная | Что хранит |
| --- | --- |
| `APPS_SCRIPT_URL` | URL опубликованного Apps Script Web app |
| `FORM_API_SECRET` | та же случайная строка, что и в Script Properties |
| `ADMIN_USERS_JSON` | JSON-словарь рабочих email и имён менеджеров, например `{"anna@serenity.agency":"Анна"}` |

`FORM_API_SECRET` не попадает в браузер: Pages Function добавляет его только при серверной отправке заявки в Apps Script.
`ADMIN_USERS_JSON` используется только серверными admin-функциями. Email должен совпадать с email пользователя в Cloudflare Access.

## Проверка

Запустите `checkConfiguration` в редакторе Apps Script. Функция показывает только наличие настроек, но не выводит секреты. Для проверки уведомления запустите `testNotification`.
