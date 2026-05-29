# План перехода на Google Sheets без Google Form

## Цель
Убрать зависимость от Google Form:
- своя форма на сайте,
- чтение расписания из Google Sheets,
- запись заявок в Google Sheets.

## Рекомендуемый вариант (старт)
Использовать **Google Apps Script Web App** как API-слой.

Почему:
- быстрый запуск,
- не нужен отдельный сервер,
- данные сразу в Google Sheets.

## Архитектура
1. Фронт сайта отправляет `POST` в API (Apps Script URL).
2. `doPost` в Apps Script валидирует и пишет заявку в лист `Bookings`.
3. Фронт запрашивает `GET` (тот же API).
4. `doGet` отдаёт JSON расписания из листа `Schedule`.

## Структура Google Sheets

### Лист `Schedule`
Колонки:
- `id`
- `date` (YYYY-MM-DD)
- `time` (HH:MM)
- `river`
- `title`
- `isActive`

### Лист `Bookings`
Колонки:
- `createdAt`
- `name`
- `phone`
- `peopleCount`
- `tripId`
- `tripDate`
- `comment`
- `source` (например `site`)

## Безопасность
- Не вызывать Sheets API напрямую из фронта с ключами.
- Добавить API-ключ (например заголовок `X-API-Key`).
- Валидировать поля на API-слое.
- Добавить антиспам: honeypot + rate limit.

## Этапы внедрения
1. Создать Google Sheet с листами `Schedule` и `Bookings`.
2. Написать `Code.gs` с `doGet` и `doPost`.
3. Опубликовать Apps Script как Web App.
4. Подключить фронт:
   - чтение расписания из `GET`,
   - отправка формы в `POST`.
5. Отключить текущую интеграцию через Google Form.
6. Протестировать:
   - корректность чтения расписания,
   - запись заявок,
   - обработку ошибок/спама.

## Что сделать следующим шагом
Подготовить:
1. готовый `Code.gs` (GET+POST),
2. точный формат строк/валидации,
3. изменения в текущем проекте для чтения/записи через новый API.
