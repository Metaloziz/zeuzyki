/**
 * Отправка заявки в Google Form.
 *
 * Entry IDs и URL берутся из автогенерированной схемы (см. scripts/fetch-form-schema.mjs).
 * При изменении полей в форме — пересоберись (`yarn fetch-schema`), и константы
 * автоматически обновятся. Если ID какого-то поля исчезнет — TS-проверка ниже
 * (через getFormField) кинет ошибку при импорте и не даст выкатить сломанный код.
 *
 * Из-за CORS Google не отдаёт ответ — шлём `no-cors`. Это значит:
 *   - запрос УХОДИТ нормально и форма принимает данные
 *   - мы НЕ можем прочитать `response.ok` или статус
 *   - считаем submit успешным, если `fetch` не выбросил исключение (это сетевая ошибка)
 */
import {
  FORM_FIELDS,
  FORM_ID,
  FORM_PAGE_COUNT,
  getFormField,
} from "../generated/form-schema";

/** Семантическая карта entry ID → удобное имя в нашем UI. */
export const ENTRY = {
  date: "entry.287946786",
  transfer: "entry.1350839334",
  name: "entry.1109098148",
  phone: "entry.1963406160",
  participants: "entry.1619294198",
} as const;

// Sanity check at module load — если форма пересобрана и какой-то ID
// пропал, мы упадём здесь, а не молча будем слать в никуда.
for (const [key, entryId] of Object.entries(ENTRY)) {
  if (!getFormField(entryId)) {
    throw new Error(
      `[googleForm] Поле "${key}" (${entryId}) не найдено в текущей схеме формы. ` +
        `Запусти 'yarn fetch-schema' и проверь src/generated/form-schema.ts.`,
    );
  }
}

/** Опции (для radio/checkbox-полей формы) — отдаём UI прямо отсюда */
export const getOptions = (entryId: string): readonly string[] =>
  getFormField(entryId)?.options ?? [];

export interface BookingPayload {
  /** Точная строка варианта даты в форме */
  date: string;
  /** ФИО */
  name: string;
  /** Телефон в формате +375 (XX) XXX-XX-XX */
  phone: string;
  /** Точная строка варианта трансфера (см. getOptions(ENTRY.transfer)) */
  transfer: string;
  /** Список других участников: фамилии, имена, телефоны, возраст детей */
  participants: string;
}

export async function submitBooking(payload: BookingPayload): Promise<void> {
  const url = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

  const data = new FormData();
  data.append(ENTRY.date, payload.date);
  data.append(ENTRY.name, payload.name);
  data.append(ENTRY.phone, payload.phone);
  data.append(ENTRY.transfer, payload.transfer);
  data.append(ENTRY.participants, payload.participants);

  // Для многостраничных форм ОБЯЗАТЕЛЬНО нужен pageHistory — без него
  // Google сохранит только поля с первой страницы. Строка вида "0,1,2,..." — все индексы страниц.
  if (FORM_PAGE_COUNT > 1) {
    const pageHistory = Array.from(
      { length: FORM_PAGE_COUNT },
      (_, i) => i,
    ).join(",");
    data.append("pageHistory", pageHistory);
    data.append("fvv", "1");
  }

  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    body: data,
  });
}

// re-export для удобства потребителей UI
export { FORM_FIELDS };
