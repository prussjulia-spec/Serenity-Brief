const budgetOptions = [
  "До 100 000 ₽",
  "100 000–300 000 ₽",
  "300 000–700 000 ₽",
  "700 000–1 500 000 ₽",
  "Более 1 500 000 ₽",
  "Бюджет пока не определён, нужна помощь с оценкой"
];

const serviceBudgetHelp = "Это поможет сразу предложить реалистичный формат работы. Можно выбрать предварительный диапазон. Без учёта медиабюджета, производства и других внешних расходов.";
const externalBudgetHelp = "Без учёта услуг Serenity. Можно выбрать предварительный диапазон.";
const briefCategories = {
  primary: "Диагностика",
  startup: "Стратегия",
  strategy: "Стратегия",
  complex: "Регулярная работа",
  performance: "Канал продвижения",
  seo: "Канал продвижения",
  smm: "Канал продвижения",
  website: "Проектная работа",
  ecommerce: "Проектная работа",
  branding: "Проектная работа",
  naming: "Проектная работа",
  pr: "Канал продвижения"
};

const commonSections = [
  {
    title: "О вас и компании",
    fields: [
      field("company_name", "Название компании", "text", "Как вас правильно называть?", true),
      field("contact_name", "Как к вам обращаться?", "text", "Имя и должность", true),
      field("contact_email", "Email для связи", "email", "Используем, чтобы связаться по задаче", true),
      field("contact_phone", "Телефон", "tel", "Укажите, если удобно созвониться или написать в мессенджере"),
      field("contact_social", "Мессенджер или соцсеть", "text", "Например: @username в Telegram или ссылка на профиль"),
      field("business", "Что важно знать о вашем бизнесе для этой задачи?", "textarea", "То, чего не видно на сайте")
    ]
  },
  {
    title: "Задача",
    fields: [
      field("request", "С чем вы пришли к Serenity?", "textarea", "Что происходит сейчас и что хочется изменить?", true),
      field("deadline", "Есть ли важная дата или желаемый срок?", "text", "Например: запуск продукта, выставка, начало сезона"),
      singleChoice("budget", "Какой бюджет планируете на услуги Serenity?", budgetOptions, serviceBudgetHelp, true)
    ]
  }
];

const publicConfig = {
  privacyPolicyUrl: "https://serenity.agency/privacy.pdf",
  submissionEndpoint: "/api/submit"
};

const finalSection = section("Ожидаемый результат", [
  field("result", "Какой результат работы вы считаете хорошим?", "textarea", "Какие решения должны стать понятнее и что команда должна суметь сделать после завершения работы?", true)
]);

const briefTypes = [
  brief(
    "primary",
    "Первичный бриф",
    "Не уверены, какая услуга нужна? Опишите задачу — мы изучим контекст и предложим следующий шаг.",
    "≈ 5 минут",
    [
      ...commonSections,
      section("Продукт и продажи", [
        field("products", "Какие продукты или услуги продаёте?", "textarea", "Что продаётся чаще, что приоритетно развивать?"),
        field("audience", "Кто ваш основной клиент?", "textarea", "B2B или B2C, отрасль, должность, география"),
        field("sales", "Как сейчас устроены продажи?", "textarea", "Откуда приходят обращения, кто и как их обрабатывает?"),
        field("marketing", "Что уже делаете в маркетинге?", "textarea", "Каналы, подрядчики, результаты, неудачные тесты")
      ]),
      section("Контекст", [
        field("competitors", "Кого считаете конкурентами?", "textarea", "Прямые конкуренты и компании, на которые ориентируетесь"),
        field("strength", "Почему клиенты выбирают вас?", "textarea", "Что чаще всего отмечают клиенты и отдел продаж?"),
        field("materials", "Какие материалы можно изучить?", "textarea", "Исследования, аналитика, брендбук, презентации, отчёты")
      ])
    ]
  ),
  brief(
    "startup",
    "Стратегия для стартапа",
    "Для проектов от идеи до первых продаж. Оценим гипотезы, экономику и подходящий формат запуска.",
    "≈ 10 минут",
    [
      ...commonSections,
      section("Стадия и продукт", [
        choice("startup_stage", "На какой стадии находится проект?", ["Идея", "Прототип", "MVP", "Первые продажи", "Рост", "Pre-seed", "Seed"], true),
        field("problem", "Какую конкретную проблему решает продукт?", "textarea"),
        field("product_state", "В каком виде продукт доступен сейчас?", "textarea", "Что уже можно показать или протестировать?"),
      ]),
      section("Подтверждённые данные", [
        field("interviews", "Проводили ли интервью с потенциальными клиентами?", "textarea", "С кем говорили и что узнали?"),
        field("sales", "Есть ли подтверждённые продажи или активные пользователи?", "textarea"),
        field("economics", "Что уже известно об экономике продукта?", "textarea", "Цена, себестоимость, маржа, LTV, стоимость привлечения")
      ]),
      section("Гипотезы и рост", [
        field("segments", "Какие сегменты аудитории рассматриваете?", "textarea"),
        field("tests", "Какие каналы и гипотезы уже тестировали?", "textarea"),
        singleChoice("test_budget", "Какой бюджет доступен на первые тесты?", budgetOptions, externalBudgetHelp, true)
      ]),
      section("Результат стратегии", [
        choice("strategy_output", "Что должно быть в результате?", ["Маркетинговая стратегия", "Growth-стратегия", "Unit-экономика", "Финансовая модель", "Воронка и roadmap тестов", "Материалы для инвесторов"]),
        field("horizon", "На какой горизонт нужен план?", "text", "3, 6 или 12 месяцев"),
        field("metrics", "Какие метрики для проекта ключевые?", "textarea")
      ])
    ]
  ),
  brief(
    "strategy",
    "Маркетинговая стратегия",
    "Для плана развития маркетинга на 6–12 месяцев. Оценим цели, приоритеты, каналы и бюджетную рамку.",
    "≈ 15 минут",
    [
      ...commonSections,
      section("Бизнес и цели", [
        field("business_model", "Как компания зарабатывает?", "textarea", "Основные продукты, модель оплаты, средний чек"),
        field("year_goal", "Какие бизнес-цели стоят на год?", "textarea", "Выручка, новые рынки, продукты, доля рынка"),
        field("priority", "Что важнее всего изменить в ближайшие 6–12 месяцев?", "textarea", "", true),
        field("constraints", "Какие ограничения нужно учитывать?", "textarea", "Команда, производство, законодательство, сезонность")
      ]),
      section("Рынок и аудитория", [
        field("markets", "На каких рынках и территориях работаете?", "textarea", "Текущая и желаемая география"),
        field("segments", "Какие сегменты клиентов для вас наиболее ценны?", "textarea", "Кто покупает чаще, больше и дольше остаётся"),
        field("choice", "Как клиент выбирает решение?", "textarea", "Триггеры, критерии, барьеры, участники принятия решения"),
        field("competitors", "Кто формирует правила рынка?", "textarea", "Лидеры, прямые и косвенные конкуренты")
      ]),
      section("Маркетинг и данные", [
        field("channels", "Какие каналы уже используете?", "textarea", "Бюджеты, результаты, выводы"),
        field("funnel", "Как выглядит путь от первого контакта до покупки?", "textarea", "Этапы, конверсии, срок сделки"),
        field("analytics", "Какие данные доступны?", "textarea", "CRM, сквозная аналитика, исследования, отчёты"),
        field("team", "Кто будет реализовывать стратегию?", "textarea", "Внутренняя команда, подрядчики, план найма")
      ])
    ]
  ),
  brief(
    "complex",
    "Комплексное продвижение",
    "Для регулярной реализации маркетинга командой. Оценим рекламу, контент, аналитику и работу с заявками.",
    "≈ 10 минут",
    [
      ...commonSections,
      section("Продвижение сейчас", [
        field("channels", "Какие каналы работают сейчас?", "textarea", "Реклама, SEO, соцсети, PR, партнёрства"),
        singleChoice("media_budget", "Какой медиабюджет планируете?", budgetOptions, externalBudgetHelp, true),
        field("numbers", "Какие показатели отслеживаете?", "textarea", "Трафик, заявки, продажи, стоимость привлечения"),
        field("past", "Что уже пробовали и к каким выводам пришли?", "textarea"),
        field("team", "Кто сейчас отвечает за маркетинг?", "textarea")
      ]),
      section("Приоритеты", [
        field("product_focus", "Что продвигаем в первую очередь?", "textarea", "Продукт, услуга, направление или бренд"),
        field("audience", "Кого хотим привлечь?", "textarea", "Текущая и новая аудитория"),
        choice("goals", "Какие задачи стоят перед продвижением?", ["Заявки", "Продажи", "Выход на новый рынок", "Узнаваемость", "Повторные покупки", "Другое"]),
        field("seasonality", "Есть ли сезонность и важные периоды?", "textarea")
      ]),
      section("Продажи и аналитика", [
        field("funnel", "Опишите путь клиента до покупки", "textarea"),
        field("sales_team", "Как отдел продаж работает с обращениями?", "textarea"),
        field("crm", "Какие системы аналитики и CRM подключены?", "textarea"),
        field("kpi", "Какие показатели должны измениться?", "textarea")
      ])
    ]
  ),
  brief(
    "performance",
    "Performance-реклама",
    "Для запуска или улучшения платной рекламы. Оценим продукт, экономику и план привлечения клиентов.",
    "≈ 10 минут",
    [
      ...commonSections,
      section("Продукт и экономика", [
        field("offer", "Что именно рекламируем?", "textarea", "Продукты, услуги и приоритетные предложения"),
        field("geo", "Где показываем рекламу?", "textarea"),
        field("economics", "Какие данные по экономике есть?", "textarea", "Средний чек, маржа, допустимая цена заявки или продажи"),
        field("seasonality", "Есть ли сезонность, акции или ограничения?", "textarea")
      ]),
      section("Реклама сейчас", [
        choice("platforms", "Какие площадки уже использовали?", ["Яндекс Директ", "Google Ads", "VK Реклама", "Telegram Ads", "Другие", "Не запускали"]),
        field("results", "Какие результаты получили?", "textarea", "Бюджет, показы, клики, заявки, продажи"),
        field("access", "Какие доступы и данные можно предоставить?", "textarea", "Кабинеты, Метрика, Analytics, CRM, коллтрекинг"),
        field("landing", "Куда ведём рекламу?", "textarea", "Ссылки и известные проблемы посадочных страниц")
      ]),
      section("Цели теста", [
        field("target", "Какое целевое действие считаем главным?", "text", "Покупка, заявка, звонок, регистрация"),
        field("lead_quality", "Какая заявка считается качественной?", "textarea"),
        singleChoice("media_budget", "Какой медиабюджет планируете?", budgetOptions, externalBudgetHelp, true),
        field("reporting", "Кому и как часто нужны результаты?", "textarea")
      ])
    ]
  ),
  brief(
    "seo",
    "SEO и органический трафик",
    "Для системного роста сайта в поиске. Оценим текущее состояние и потенциал органического трафика.",
    "≈ 10 минут",
    [
      ...commonSections,
      section("Сайт и спрос", [
        field("site", "Какой сайт продвигаем?", "text", "", true),
        field("regions", "Какие регионы и языки важны?", "textarea"),
        field("directions", "Какие направления приоритетны?", "textarea"),
        field("seasonality", "Есть ли сезонность спроса?", "textarea")
      ]),
      section("История SEO", [
        field("history", "Что уже делали по SEO?", "textarea", "Подрядчики, работы, сроки, результаты"),
        field("problems", "Какие проблемы сайта уже известны?", "textarea"),
        field("analytics", "Какая аналитика подключена?", "textarea"),
        field("access", "Можно ли предоставить доступы?", "textarea", "Метрика, Search Console, CMS, панели вебмастеров")
      ]),
      section("Контент и конкуренты", [
        field("competitors", "С кем конкурируете в поиске?", "textarea"),
        field("content", "Кто может готовить и согласовывать контент?", "textarea"),
        field("expertise", "Какие эксперты доступны внутри компании?", "textarea"),
        field("kpi", "Какой результат SEO важен бизнесу?", "textarea")
      ])
    ]
  ),
  brief(
    "smm",
    "SMM и контент",
    "Для регулярной работы с соцсетями и контентом. Оценим площадки, ресурсы команды и формат ведения.",
    "≈ 10 минут",
    [
      ...commonSections,
      section("Роль соцсетей", [
        choice("goals", "Для чего бренду соцсети?", ["Продажи", "Узнаваемость", "Имидж", "Комьюнити", "Поддержка клиентов", "Работа с сотрудниками"]),
        field("platforms", "Какие площадки ведёте или рассматриваете?", "textarea"),
        field("audience", "С кем хотим общаться?", "textarea"),
        field("tone", "Как бренд должен звучать?", "textarea", "Можно привести примеры близких по тону аккаунтов")
      ]),
      section("Контент", [
        field("topics", "О чём бренд может говорить регулярно?", "textarea"),
        field("experts", "Кто может участвовать в создании контента?", "textarea"),
        field("assets", "Какие материалы уже есть?", "textarea", "Фото, видео, исследования, кейсы, брендбук"),
        field("restrictions", "Что нельзя публиковать или обсуждать?", "textarea")
      ]),
      section("Процессы и результат", [
        field("current", "Что происходит в соцсетях сейчас?", "textarea"),
        field("approval", "Как устроено согласование?", "textarea"),
        field("moderation", "Нужно ли отвечать на сообщения и комментарии?", "textarea"),
        field("kpi", "Какие показатели важны?", "textarea")
      ])
    ]
  ),
  brief(
    "website",
    "Сайт или лендинг",
    "Для запуска или обновления сайта. Оценим задачи, материалы, функциональность и объём разработки.",
    "≈ 15 минут",
    [
      ...commonSections,
      section("Задача сайта", [
        choice("site_type", "Что нужно разработать?", ["Корпоративный сайт", "Лендинг", "Интернет-магазин", "Сервис", "Редизайн", "Пока не знаем"]),
        field("site_goal", "Какую главную задачу должен решать сайт?", "textarea", "", true),
        field("current_site", "Есть ли текущий сайт?", "text"),
        field("problems", "Что в текущем сайте не устраивает?", "textarea")
      ]),
      section("Аудитория и контент", [
        field("audience", "Кто будет пользоваться сайтом?", "textarea"),
        field("scenarios", "Что посетитель должен сделать на сайте?", "textarea"),
        field("structure", "Какие разделы точно нужны?", "textarea"),
        field("content", "Какие материалы уже готовы?", "textarea")
      ]),
      section("Функциональность", [
        field("functions", "Какие функции и интеграции нужны?", "textarea", "CRM, оплата, каталог, личный кабинет, калькулятор"),
        field("cms", "Есть ли требования к CMS и технологиям?", "textarea"),
        field("references", "Какие сайты нравятся и почему?", "textarea"),
        field("support", "Кто будет обновлять сайт после запуска?", "textarea")
      ])
    ]
  ),
  brief(
    "ecommerce",
    "Интернет-магазин",
    "Для запуска или развития интернет-магазина. Оценим каталог, путь покупки, интеграции и объём проекта.",
    "≈ 15 минут",
    [
      ...commonSections,
      section("Каталог и продажи", [
        field("catalog", "Что продаём и как устроен каталог?", "textarea", "Категории, глубина вложенности, примерное количество товаров"),
        field("product_data", "Какие данные есть у товара?", "textarea", "Характеристики, варианты, фото, цены, остатки"),
        field("pricing", "Как устроены цены, скидки и программа лояльности?", "textarea")
      ]),
      section("Покупка", [
        field("checkout", "Как должен выглядеть путь от товара до заказа?", "textarea"),
        field("payment", "Какие способы оплаты нужны?", "textarea"),
        field("delivery", "Какие способы и правила доставки нужны?", "textarea")
      ]),
      section("Управление и интеграции", [
        field("integrations", "С какими системами нужно связать магазин?", "textarea", "1С, CRM, склад, службы доставки, платёжные системы"),
        field("orders", "Как команда будет обрабатывать заказы?", "textarea"),
        field("cms", "Есть ли требования к CMS или технологиям?", "textarea")
      ]),
      section("Материалы и запуск", [
        field("content", "Насколько готовы контент и данные каталога?", "textarea"),
        field("analytics", "Какая аналитика и CRM уже подключены?", "textarea"),
        field("support", "Кто будет поддерживать магазин после запуска?", "textarea")
      ])
    ]
  ),
  brief(
    "branding",
    "Брендинг и фирменный стиль",
    "Для нового бренда или обновления стиля. Оценим задачу, аудиторию, носители и объём работы.",
    "≈ 15 минут",
    [
      ...commonSections,
      section("Бренд", [
        choice("branding_task", "Какая задача стоит?", ["Новый бренд", "Ребрендинг", "Обновление стиля", "Логотип", "Гайдлайн", "Пока не знаем"], true),
        field("story", "Расскажите историю бренда", "textarea"),
        field("positioning", "Как бренд позиционируется сейчас?", "textarea"),
        field("changes", "Что должно измениться в восприятии бренда?", "textarea")
      ]),
      section("Аудитория и характер", [
        field("audience", "Для кого создаём бренд?", "textarea"),
        field("character", "Каким человеком мог бы быть бренд?", "textarea"),
        field("associations", "Какие ассоциации важно вызвать и каких избежать?", "textarea"),
        field("competitors", "На фоне каких брендов нужно выделиться?", "textarea")
      ]),
      section("Визуальная система", [
        field("carriers", "Где стиль будет использоваться?", "textarea", "Сайт, соцсети, упаковка, офис, документы"),
        field("legacy", "Что из текущего стиля важно сохранить?", "textarea"),
        field("references", "Какие визуальные решения нравятся или не нравятся?", "textarea"),
        field("technical", "Есть ли технические или юридические ограничения?", "textarea")
      ])
    ]
  ),
  brief(
    "naming",
    "Нейминг",
    "Для компании, продукта или сервиса, которому нужно название. Определим смысл, характер и рамки поиска.",
    "≈ 10 минут",
    [
      ...commonSections,
      section("Объект нейминга", [
        field("object", "Для чего создаём название?", "textarea", "Компания, продукт, линейка, сервис, событие"),
        field("essence", "В чём суть продукта или бизнеса?", "textarea", "", true),
        field("geo", "Где будет использоваться название?", "textarea"),
        field("future", "Как проект может развиваться дальше?", "textarea")
      ]),
      section("Смысл и звучание", [
        field("message", "Какую главную мысль должно передавать название?", "textarea"),
        field("associations", "Какие ассоциации нужны и нежелательны?", "textarea"),
        field("language", "На каких языках название должно работать?", "textarea"),
        choice("style", "Какой характер названия ближе?", ["Деловое", "Эмоциональное", "Технологичное", "Необычное", "Описательное", "Без предпочтений"])
      ]),
      section("Ограничения", [
        field("competitors", "Какие названия есть у конкурентов?", "textarea"),
        field("liked", "Какие названия вам нравятся и почему?", "textarea"),
        field("avoid", "Какие слова, темы и приёмы нельзя использовать?", "textarea"),
        field("legal", "Какие проверки и доменные зоны нужны?", "textarea")
      ])
    ]
  ),
  brief(
    "pr",
    "PR и репутация",
    "Для задач по публичности, экспертности и репутации. Оценим инфоповоды, ресурсы и формат PR-работы.",
    "≈ 10 минут",
    [
      ...commonSections,
      section("Публичная задача", [
        choice("pr_goal", "Что должен изменить PR?", ["Узнаваемость", "Доверие", "Репутация", "Поддержка продаж", "Выход на новый рынок", "Экспертность"]),
        field("audience", "На чьё мнение нужно повлиять?", "textarea"),
        field("messages", "Какие мысли аудитория должна запомнить?", "textarea"),
        field("risks", "Есть ли чувствительные темы или репутационные риски?", "textarea")
      ]),
      section("Инфополе", [
        field("media", "Где бренд уже представлен?", "textarea", "СМИ, рейтинги, конференции, соцсети"),
        field("speakers", "Кто может выступать от лица компании?", "textarea"),
        field("reasons", "Какие инфоповоды ожидаются?", "textarea"),
        field("competitors", "Чью публичность считаете сильной?", "textarea")
      ]),
      section("Процессы", [
        field("materials", "Какие материалы и исследования доступны?", "textarea"),
        field("approval", "Кто согласовывает публичные материалы?", "textarea"),
        field("reaction", "Как быстро команда может отвечать на запросы?", "textarea"),
        field("kpi", "По каким показателям оценивать работу?", "textarea")
      ])
    ]
  )
];

const state = {
  screen: "home",
  briefId: null,
  answers: readStorage("serenityBriefAnswers"),
  submissionIds: readStorage("serenitySubmissionIds"),
  sending: false,
  submission: null,
  error: "",
  formStartedAt: Date.now()
};

const app = document.querySelector("#app");
const saveStatus = document.querySelector("#save-status");
const requestedBriefId = new URLSearchParams(window.location.search).get("brief");

if (briefTypes.some((item) => item.id === requestedBriefId)) {
  state.briefId = requestedBriefId;
  state.screen = "brief";
}

function field(id, label, type = "text", help = "", required = false) {
  return { id, label, type, help, required };
}

function choice(id, label, options, required = false) {
  return { id, label, type: "choice", options, required };
}

function singleChoice(id, label, options, help = "", required = false) {
  return { id, label, type: "singleChoice", options, help, required };
}

function section(title, fields) {
  return { title, fields };
}

function brief(id, title, description, time, sections) {
  return { id, title, description, time, sections: [...sections, finalSection] };
}

function formatTime(time) {
  return `Заполнение: ${time.replace("≈ ", "около ")}`;
}

function formatCompactTime(time) {
  return time.replace("≈ ", "Около ");
}

function getBriefIntro(briefItem) {
  if (briefItem.id === "primary") return "Коротко опишите задачу — мы предложим следующий шаг.";
  return briefItem.description.match(/^.*?[.!?](?=\s|$)/)?.[0] || briefItem.description;
}

function render() {
  saveStatus.hidden = state.screen === "home";
  if (state.screen === "brief") return renderBrief();
  if (state.screen === "result") return renderResult();
  renderHome();
}

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <p class="hero-kicker">Брифы Serenity</p>
      <h1>Расскажите о проекте.<br>Мы предложим следующий шаг.</h1>
      <p class="hero-copy">Выберите подходящий бриф.</p>
    </section>
    <button class="catalog-hint" type="button" data-brief="primary">Не знаете, что выбрать? Начните с первичного брифа →</button>
    <section class="catalog">
      ${briefTypes.map((item) => `
        <button class="brief-card" type="button" data-brief="${item.id}">
          <div class="brief-card-top">
            <span class="card-category">${briefCategories[item.id]}</span>
            <span class="time">${formatTime(item.time)}</span>
          </div>
          <h2>${item.title}</h2>
          <div class="brief-card-bottom">
            <p>${item.description}</p>
            <span class="arrow">→</span>
          </div>
        </button>
      `).join("")}
    </section>
  `;
}

function renderBrief() {
  const current = getCurrentBrief();
  const progress = getRequiredProgress();

  app.innerHTML = `
    <div class="brief-shell">
      <aside class="brief-aside">
        <button class="back-link" type="button" data-action="home">← Все брифы</button>
        <h2>${current.title}</h2>
        <p>${getBriefIntro(current)}</p>
        <span class="aside-time">${formatCompactTime(current.time)}</span>
        <div class="progress-label"><span>Обязательные ответы</span><strong>${progress}%</strong></div>
        <div class="progress"><span style="width:${progress}%"></span></div>
        <nav class="section-nav">
          ${current.sections.map((item, index) => `<button type="button" data-scroll="section-${index}">${String(index + 1).padStart(2, "0")} · ${item.title}</button>`).join("")}
        </nav>
      </aside>

      <form class="brief-form" id="brief-form">
        <input class="honeypot" type="text" name="company_site_confirm" tabindex="-1" autocomplete="off">
        <div class="form-head">
          <h1>Расскажите<br>о проекте</h1>
          <p>Можно отвечать коротко. Поля со звездочкой обязательны, остальные можно пропустить.</p>
        </div>
        ${current.sections.map((item, sectionIndex) => `
          <section class="form-section" id="section-${sectionIndex}">
            <div class="section-title">
              <span>${String(sectionIndex + 1).padStart(2, "0")}</span>
              <h2>${item.title}</h2>
            </div>
            <div class="fields">
              ${item.fields.map(renderField).join("")}
            </div>
          </section>
        `).join("")}
        <label class="consent">
          <input type="checkbox" name="privacy_consent" value="accepted" required>
          <span>
            Я согласен(на) на обработку персональных данных для подготовки предложения.
            ${publicConfig.privacyPolicyUrl
              ? `<a href="${escapeHtml(publicConfig.privacyPolicyUrl)}" target="_blank" rel="noreferrer">Политика обработки данных</a>`
              : `<span class="policy-placeholder">Ссылка на политику будет добавлена после публикации документа.</span>`}
          </span>
        </label>
        <div class="form-actions">
          <button class="button secondary" type="button" data-action="clear">Очистить ответы</button>
          <button class="button" type="submit" ${state.sending ? "disabled" : ""}>${state.sending ? "Отправляем…" : "Отправить бриф →"}</button>
        </div>
        ${state.error ? `<p class="form-error" role="alert">${escapeHtml(state.error)}</p>` : ""}
        <p class="form-note">Данные попадут только в рабочий реестр Serenity и документ с ответами.</p>
      </form>
    </div>
  `;
  fillAnswers();
}

function renderField(item) {
  const required = item.required ? ` <span class="required">*</span>` : "";
  const helpId = `${item.id}-help`;
  const help = item.help ? `<small id="${helpId}">${item.help}</small>` : "";
  const describedBy = item.help ? ` aria-describedby="${helpId}"` : "";
  if (item.type === "choice" || item.type === "singleChoice") {
    const inputType = item.type === "singleChoice" ? "radio" : "checkbox";
    const nativeRequired = item.type === "singleChoice" && item.required ? " required" : "";
    return `
      <fieldset class="field ${item.type === "singleChoice" ? "single-choice" : "multi-choice"}"${item.required ? ' aria-required="true"' : ""}>
        <legend>${item.label}${required}</legend>
        ${help}
        <div class="choice-grid">
          ${item.options.map((option) => `
            <label class="choice">
              <input type="${inputType}" name="${item.id}" value="${escapeHtml(option)}"${describedBy}${nativeRequired} ${item.required ? "data-required-choice" : ""}>
              <span>${option}</span>
            </label>
          `).join("")}
        </div>
      </fieldset>
    `;
  }
  const autocomplete = {
    company_name: "organization",
    contact_name: "name",
    contact_email: "email",
    contact_phone: "tel"
  }[item.id];
  const autocompleteAttr = autocomplete ? ` autocomplete="${autocomplete}"` : "";
  const control = item.type === "textarea"
    ? `<textarea id="${item.id}" name="${item.id}"${describedBy} ${item.required ? "required" : ""}></textarea>`
    : `<input id="${item.id}" type="${item.type}" name="${item.id}"${describedBy}${autocompleteAttr} ${item.required ? "required" : ""}>`;
  return `<div class="field"><label for="${item.id}">${item.label}${required}</label>${help}${control}</div>`;
}

function renderResult() {
  const current = getCurrentBrief();
  app.innerHTML = `
    <section class="result">
      <div class="result-card">
        <div class="result-head">
          <div>
            <span class="tag">${current.title}</span>
            <h1>Спасибо,<br>бриф отправлен</h1>
            <p class="result-copy">Ответы сохранились у команды Serenity. Мы изучим задачу и вернёмся к вам по указанному контакту.</p>
          </div>
          <div class="result-actions">
            <button class="button secondary" type="button" data-action="edit">Вернуться к ответам</button>
            <button class="button" type="button" data-action="copy">Скопировать ответы</button>
          </div>
        </div>
        ${current.sections.map((sectionItem) => `
          <section class="summary-section">
            <h2>${sectionItem.title}</h2>
            <dl>
              ${sectionItem.fields.map((item) => `
                <div class="summary-item">
                  <dt>${item.label}</dt>
                  <dd class="${hasAnswer(item.id) ? "" : "empty"}">${hasAnswer(item.id) ? escapeHtml(formatAnswer(item.id)) : "Нет ответа"}</dd>
                </div>
              `).join("")}
            </dl>
          </section>
        `).join("")}
      </div>
    </section>
  `;
}

function getCurrentBrief() {
  return briefTypes.find((item) => item.id === state.briefId) || briefTypes[0];
}

function fillAnswers() {
  const form = document.querySelector("#brief-form");
  const answers = state.answers[state.briefId] || {};
  Object.entries(answers).forEach(([name, value]) => {
    const controls = form.elements[name];
    if (!controls) return;
    if (controls instanceof RadioNodeList) {
      [...controls].forEach((control) => {
        control.checked = Array.isArray(value) ? value.includes(control.value) : control.value === value;
      });
    } else if (controls.type === "checkbox") {
      controls.checked = Boolean(value);
    } else {
      controls.value = value;
    }
  });
}

function saveAnswers() {
  const form = document.querySelector("#brief-form");
  if (!form) return;
  const data = {};
  const formData = new FormData(form);
  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
    } else {
      data[key] = value;
    }
  }
  state.answers[state.briefId] = data;
  const saved = writeStorage("serenityBriefAnswers", state.answers);
  updateProgress();
  setSaveStatus(saved ? "Черновик сохранён" : "Черновик только в этой вкладке", saved ? "" : "error");
}

function getRequiredProgress() {
  const requiredFields = getCurrentBrief().sections.flatMap((item) => item.fields).filter((item) => item.required);
  const requiredIds = [...requiredFields.map((item) => item.id), "privacy_consent"];
  const completed = requiredIds.filter(hasAnswer).length;
  return requiredIds.length ? Math.round((completed / requiredIds.length) * 100) : 100;
}

function updateProgress() {
  const progress = getRequiredProgress();
  const value = document.querySelector(".progress-label strong");
  const bar = document.querySelector(".progress span");
  if (value) value.textContent = `${progress}%`;
  if (bar) bar.style.width = `${progress}%`;
}

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function hasAnswer(id) {
  const value = state.answers[state.briefId]?.[id];
  return Array.isArray(value) ? value.length > 0 : Boolean(value?.trim?.());
}

function formatAnswer(id) {
  const value = state.answers[state.briefId]?.[id];
  return Array.isArray(value) ? value.join(", ") : value;
}

function makeTextSummary() {
  const current = getCurrentBrief();
  const lines = [`Бриф: ${current.title}`, ""];
  current.sections.forEach((sectionItem) => {
    lines.push(sectionItem.title.toUpperCase());
    sectionItem.fields.forEach((item) => {
      lines.push(`${item.label}: ${hasAnswer(item.id) ? formatAnswer(item.id) : "Нет ответа"}`);
    });
    lines.push("");
  });
  return lines.join("\n");
}

function makeSubmissionPayload() {
  const current = getCurrentBrief();
  const answers = state.answers[state.briefId] || {};

  return {
    submissionId: getSubmissionId(),
    briefId: current.id,
    briefTitle: current.title,
    submittedAt: new Date().toISOString(),
    companyName: answers.company_name || "",
    contactName: answers.contact_name || "",
    contactEmail: answers.contact_email || "",
    contactPhone: answers.contact_phone || "",
    contactSocial: answers.contact_social || "",
    request: answers.request || "",
    budget: answers.budget || "",
    privacyConsent: answers.privacy_consent === "accepted",
    consentAt: answers.privacy_consent === "accepted" ? new Date().toISOString() : "",
    formStartedAt: state.formStartedAt,
    honeypot: answers.company_site_confirm || "",
    sections: current.sections.map((sectionItem) => ({
      title: sectionItem.title,
      answers: sectionItem.fields.map((item) => ({
        question: item.label,
        answer: hasAnswer(item.id) ? formatAnswer(item.id) : ""
      }))
    })),
    summary: makeTextSummary()
  };
}

function getSubmissionId() {
  if (!state.submissionIds[state.briefId]) {
    state.submissionIds[state.briefId] = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    writeStorage("serenitySubmissionIds", state.submissionIds);
  }
  return state.submissionIds[state.briefId];
}

async function submitBrief() {
  const payload = makeSubmissionPayload();

  if (window.google?.script?.run) {
    return new Promise((resolve, reject) => {
      window.google.script.run
        .withSuccessHandler((result) => result?.ok ? resolve(result) : reject(new Error(result?.message || "Не удалось отправить бриф.")))
        .withFailureHandler(() => reject(new Error("Не удалось отправить бриф. Попробуйте ещё раз.")))
        .saveBrief(payload);
    });
  }

  const response = await fetch(publicConfig.submissionEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result?.ok) {
    throw new Error(result?.message || "Не удалось отправить бриф. Попробуйте ещё раз.");
  }
  return result;
}

function setSaveStatus(text, type = "") {
  if (!saveStatus) return;
  saveStatus.className = `autosave ${type}`.trim();
  saveStatus.innerHTML = `<i></i> ${escapeHtml(text)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("click", async (event) => {
  const briefButton = event.target.closest("[data-brief]");
  const actionButton = event.target.closest("[data-action]");
  const scrollButton = event.target.closest("[data-scroll]");

  if (briefButton) {
    state.briefId = briefButton.dataset.brief;
    state.screen = "brief";
    updateUrl(state.briefId);
    render();
    window.scrollTo({ top: 0 });
  }

  if (scrollButton) {
    document.querySelector(`#${scrollButton.dataset.scroll}`)?.scrollIntoView({ behavior: "smooth" });
  }

  if (!actionButton) return;
  const action = actionButton.dataset.action;
  if (action === "home") {
    saveAnswers();
    state.screen = "home";
    updateUrl();
    render();
    window.scrollTo({ top: 0 });
  }
  if (action === "clear") {
    if (window.confirm("Очистить ответы в этом брифе?")) {
      state.answers[state.briefId] = {};
      delete state.submissionIds[state.briefId];
      writeStorage("serenityBriefAnswers", state.answers);
      writeStorage("serenitySubmissionIds", state.submissionIds);
      state.formStartedAt = Date.now();
      render();
    }
  }
  if (action === "edit") {
    state.screen = "brief";
    setSaveStatus("Черновик сохранён");
    updateUrl(state.briefId);
    render();
  }
  if (action === "copy") {
    try {
      await navigator.clipboard.writeText(makeTextSummary());
      actionButton.textContent = "Скопировано";
    } catch {
      actionButton.textContent = "Не удалось скопировать";
    }
    setTimeout(() => {
      actionButton.textContent = "Скопировать ответы";
    }, 1800);
  }
});

document.addEventListener("input", (event) => {
  if (!event.target.closest("#brief-form")) return;
  saveAnswers();
});

document.addEventListener("submit", async (event) => {
  if (event.target.id !== "brief-form") return;
  event.preventDefault();
  saveAnswers();
  const requiredChoices = [...event.target.querySelectorAll("[data-required-choice]")];
  const missingChoice = requiredChoices.find((item) => !event.target.querySelector(`[name="${item.name}"]:checked`));
  if (missingChoice) {
    const missingName = missingChoice.name;
    state.error = "Ответьте, пожалуйста, на обязательные вопросы.";
    render();
    const field = document.querySelector(`[name="${missingName}"]`)?.closest(".field");
    field?.scrollIntoView({ behavior: "smooth", block: "center" });
    field?.querySelector("input")?.focus({ preventScroll: true });
    return;
  }
  if (!event.target.reportValidity()) return;
  if (state.answers[state.briefId]?.company_site_confirm) return;

  state.sending = true;
  state.error = "";
  render();
  setSaveStatus("Отправляем бриф", "sending");
  try {
    state.submission = await submitBrief();
    state.sending = false;
    state.screen = "result";
    delete state.submissionIds[state.briefId];
    writeStorage("serenitySubmissionIds", state.submissionIds);
    setSaveStatus("Бриф отправлен", "sent");
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    state.sending = false;
    state.error = error.message;
    render();
    setSaveStatus("Черновик сохранён", "error");
    document.querySelector(".form-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

function updateUrl(briefId = "") {
  const url = new URL(window.location.href);
  if (briefId) {
    url.searchParams.set("brief", briefId);
  } else {
    url.searchParams.delete("brief");
  }
  window.history.replaceState({}, "", url);
}

render();
