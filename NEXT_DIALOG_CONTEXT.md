# Handoff для следующего диалога (Zeuzyki)

## Что уже сделано

- Миграция с Google Form на **Google Apps Script Web App + Google Sheets** внедрена во фронт.
- Чтение расписания идет через `GET` в Apps Script.
- Отправка заявки идет через `POST` в Apps Script (`text/plain` JSON).
- Форма бронирования переработана:
  - блочная структура,
  - тематические цветные иконки,
  - добавлен блок про детей,
  - увеличен мобильный степпер количества участников.
- Исправлены пути картинок корпоративной страницы через `new URL(..., import.meta.url)` (Vite-friendly, без 404 на GH Pages).

## Ключевые файлы

- API-клиент: `src/lib/sheetsApi.ts`
- Главная (загрузка расписания): `src/pages/Home.tsx`
- Детали сплава (загрузка по id): `src/pages/SplavDetails.tsx`
- Форма бронирования: `src/components/BookingModal/BookingModal.tsx`
- Стили формы: `src/components/BookingModal/BookingModal.module.css`
- Корпоративные изображения: `src/pages/Corporate.tsx`
- Workflow деплоя: `.github/workflows/deploy.yml`
- Пример env: `.env.example`

## Текущая безопасная схема конфигурации (актуально)

В `src/lib/sheetsApi.ts` сейчас **без хардкода** — только env:

- `VITE_GAS_API_URL`
- `VITE_GAS_API_KEY`

Если их нет/пустые -> ошибка `Не задан VITE_GAS_API_URL` / `Не задан VITE_GAS_API_KEY`.

## Что проверить в GitHub (главное)

1. Репо -> `Settings` -> `Secrets and variables` -> `Actions`
2. Убедиться, что есть и НЕ пустые:
   - `VITE_GAS_API_URL`
   - `VITE_GAS_API_KEY`
3. Запустить redeploy:
   - `Actions` -> `Deploy to GitHub Pages` -> `Run workflow`.

## Apps Script / Sheets

- Web App URL (текущий):
  - `https://script.google.com/macros/s/AKfycbxdjqgFqoAwbrmvK4O7KBpBxXyR-yDvn1ML4mJNSfzvNp_FvDklP5w3HhsFnqv67hgz/exec`
- В Apps Script deployment должно быть:
  - `Execute as: Me`
  - `Who has access: Anyone`

## Важная безопасность

API ключ уже светился в переписке/коммитах ранее.

Рекомендуется:
1. Сгенерировать новый `API_KEY`.
2. Обновить его в Script Properties (`API_KEY`).
3. Обновить `VITE_GAS_API_KEY` в GitHub Secrets и локальном `.env.local`.

## Последние релевантные коммиты

- `5f58bed` — `Restore env-only GAS configuration` (убран временный хардкод, безопасная схема)
- `4a85044` — `Handle empty GAS env values` (временная правка, уже не актуальна после возврата безопасной схемы)
- `0cda5e4` — временные fallback в коде (позже отменены)
- `9b814d5` — `Fix corporate image asset paths`
- `775cd37` — `Improve booking form mobile usability`

## Что просили делать «дальше по чуть-чуть»

- Пользователь просил переносить UX-идеи с `https://splav-request.vercel.app/` постепенно, маленькими шагами.
- Уже добавлен блок детей + улучшен mobile UX счетчика участников.
- Возможный следующий шаг: унифицировать большой степпер и для детского счетчика, затем добавлять другие поля по одному.
