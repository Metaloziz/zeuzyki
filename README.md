# Zeuzyki — сплавы на байдарках

SPA для записи на байдарочные сплавы. Витрина + страница деталей + форма записи.

## Стек

- **Vite + React 18 + TypeScript**
- **Yarn Berry 4** (`nodeLinker: node-modules`)
- **Mantine v7** (UI-кит)
- **CSS Modules** (стили)
- **react-router-dom** (роутинг)
- **react-hook-form + zod** (форма + валидация)
- Деплой: **GitHub Pages** через GitHub Actions

## Скрипты

```sh
yarn dev         # дев-сервер на http://localhost:5173
yarn build       # production-сборка в dist/ (+ 404.html для SPA fallback)
yarn preview     # локальный просмотр продакшн-сборки
yarn typecheck   # проверка типов без сборки
```

## Структура

```
src/
├── App.tsx                     routes
├── main.tsx                    entry, BrowserRouter + MantineProvider
├── theme.ts                    Mantine theme
├── global.css                  reset
├── components/
│   ├── Header/                 sticky apple-style nav
│   ├── BookingModal/           форма "Записаться"
│   ├── AboutSection/           информация о компании
│   ├── CorporateSection/       корпоративные сплавы
│   └── SplavCard/              карточка сплава
├── pages/
│   ├── Home.tsx                главная (витрина)
│   ├── About.tsx               страница "Про нас"
│   ├── Corporate.tsx           страница корпоративных сплавов
│   └── SplavDetails.tsx        страница деталей сплава
├── mocks/splavy.ts             fallback-моки расписания
├── types/splav.ts              Splav, ProgramDay, Difficulty
├── lib/
│   ├── format.ts               форматтер дат
│   └── sheetsApi.ts            Google Apps Script API (GET/POST)
└── generated/
    └── form-schema.ts          legacy (можно удалить позже)
```

## Переменные окружения

Создай `.env.local` (локально) или задай переменную в CI:

```sh
VITE_GAS_API_KEY=<YOUR_SECRET_API_KEY>
```

URL Google Apps Script задан в `src/lib/sheetsApi.ts` как публичный endpoint.

Для GitHub Pages добавь в Secrets:
- `VITE_GAS_API_KEY`

## Деплой на GitHub Pages

1. Запушить репозиторий на GitHub под именем **`zeuzyki`** (если другое имя — поменять `VITE_BASE` в `.github/workflows/deploy.yml` и дефолт в `vite.config.ts`).
2. В настройках репозитория **Settings → Pages → Build and deployment → Source** выбрать **GitHub Actions**.
3. Push в `main` запускает workflow `.github/workflows/deploy.yml`:
   - `yarn install --immutable`
   - `yarn build` с `VITE_BASE=/zeuzyki/`
   - Загрузка `dist/` как Pages-артефакт
   - Публикация
4. Сайт будет доступен по адресу `https://<username>.github.io/zeuzyki/`.

### Кастомный домен или деплой в корень

- Если используешь кастомный домен — задай `VITE_BASE: /` в workflow.
- Для локального деплоя в корень: `VITE_BASE=/ yarn build`.

### Глубокие ссылки (`/splav/1`)

GitHub Pages не умеет SPA-fallback сам. Решено просто: `scripts/spa-404.mjs` после сборки копирует `dist/index.html` → `dist/404.html`. GH Pages подаёт `404.html` на любой неизвестный путь, и React Router подхватывает.

## Что дальше

См. план развития в чате с агентом (`.agents/`):

- [x] Страница "Про нас" (/about)
- [x] Страница корпоративных сплавов (/corporate)
- [x] Интеграция формы с Google Apps Script Web App (запись в Google Sheet)
- [x] Чтение сплавов из Google Sheet вместо моков
- [ ] Фото-галерея для сплавов
- [ ] Популярные вопросы (FAQ секция)
