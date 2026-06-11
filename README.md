# ЖЭЎЖЫКІ — сплавы на байдарках

SPA для записи на байдарочные сплавы. Витрина маршрутов, расписание, форма записи и страницы «Про нас», «Корпоративные сплавы», FAQ.

## Стек

- **Vite + React 18 + TypeScript**
- **Yarn Berry 4** (`nodeLinker: node-modules`)
- **Mantine v7** (UI-кит)
- **CSS Modules** + `brand.css` (дизайн-токены)
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
assets/
├── routes/              фото маршрутов (папка = slug реки из API)
│   ├── viliya/
│   ├── ilia-1-chast/
│   └── ilia-2-chast/
├── corporate/           фото корпоративных сплавов (hero.jpg, 01.jpg…)
└── telegram-icon.svg

public/
├── favicon.png
└── assets/logo.png

src/
├── App.tsx
├── main.tsx
├── brand.css
├── components/
│   ├── Header/
│   ├── Footer/
│   └── BookingModal/
├── pages/
│   ├── Home.tsx         главная: маршруты + расписание
│   ├── About.tsx
│   ├── Corporate.tsx
│   ├── Faq.tsx
│   └── SplavDetails.tsx
├── lib/
│   ├── routePhotos.ts   маппинг названий рек из API → фото
│   ├── sheetsApi.ts     Google Apps Script API
│   └── format.ts
└── types/
```

## Переменные окружения

Создай `.env` (локально) или задай переменную в CI:

```sh
VITE_GAS_API_KEY=<YOUR_SECRET_API_KEY>
```

URL Google Apps Script задан в `src/lib/sheetsApi.ts`.

Для GitHub Pages добавь в Secrets: `VITE_GAS_API_KEY`.

## Добавление фото маршрута

1. Создай папку в `assets/routes/` со slug из `RIVER_ID_TO_PHOTO_GROUP` в `src/constants/rivers.ts` (`viliya`, `ilia-1-chast`, `ilia-2-chast`, `corporate`).
2. Положи файлы `01.jpg`, `02.jpg` и т.д.
3. В Google Sheets фото привязаны к **ID** реки (лист `Rivers`), а не к названию — название можно менять свободно. Актуальные ID: `1` — Вилия, `2` — Илия Маршрут №1, `3` — Илия Маршрут №2, `4` — Корпоративный сплав.

Корпоративные фото: `assets/corporate/hero.jpg` + `01.jpg`…`06.jpg`.

## Деплой на GitHub Pages

1. Репозиторий **`zeuzyki`** (или поменять `VITE_BASE` в `.github/workflows/deploy.yml`).
2. **Settings → Pages → Source → GitHub Actions**.
3. Push в `main` запускает `.github/workflows/deploy.yml`.
4. Сайт: `https://<username>.github.io/zeuzyki/`.

### Глубокие ссылки (`/splav/1`)

`scripts/spa-404.mjs` копирует `dist/index.html` → `dist/404.html` для SPA fallback на GitHub Pages.
