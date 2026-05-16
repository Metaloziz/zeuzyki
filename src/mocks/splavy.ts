import { getFormField } from "../generated/form-schema";
import { ENTRY } from "../lib/googleForm";
import type { Splav } from "../types/splav";

/**
 * Список доступных дат БЕРЁТСЯ ИЗ Google Form (поле «Дата похода»).
 * Описание / цена / программа — пока живут здесь как общий шаблон.
 * Когда подключим Google Sheet — мета-данные будут читаться оттуда,
 * привязка по formDateValue (строка опции в форме) как по ключу.
 */

/** Год сезона — Google Form в дате не хранит год; ставим вручную. */
const SEASON_YEAR = 2025;

const MONTHS_2_DIGIT: Record<string, number> = {
  "01": 0,
  "02": 1,
  "03": 2,
  "04": 3,
  "05": 4,
  "06": 5,
  "07": 6,
  "08": 7,
  "09": 8,
  "10": 9,
  "11": 10,
  "12": 11,
};

/**
 * Примеры, которые парсятся:
 *   "13.09 (сб) в 12:00 Илия"
 *   "13.11 (ср) в 13.00 Нарочь"   (разделитель времени — точка)
 *   "5.7 в 9-30 Неман"          (однозначные цифры, тире в времени, без скобок)
 *   "20.09 12:00 Илия"           (без «в»).
 * Если строка не парсится — возвращает null.
 */
function parseDateOption(
  opt: string,
): { date: string; time: string; river: string } | null {
  const m = opt.match(
    /^\s*(\d{1,2})\.(\d{1,2})(?:\s*\(\s*[а-яa-z]+\s*\))?\s*(?:в\s+)?(\d{1,2})[.:\-](\d{2})\s+(.+?)\s*$/i,
  );
  if (!m) return null;
  const [, ddRaw, mmRaw, hh, min, river] = m;
  const dd = ddRaw.padStart(2, "0");
  const mm = mmRaw.padStart(2, "0");
  if (!(mm in MONTHS_2_DIGIT)) return null;
  return {
    date: `${SEASON_YEAR}-${mm}-${dd}`,
    time: `${hh.padStart(2, "0")}:${min}`,
    river: river.trim(),
  };
}

/** Шаблон, одинаковый для всех дат (пока). Заменится при подключении Google Sheet. */
const TRIP_TEMPLATE = {
  durationDays: 1,
  price: 80,
  difficulty: "начальный" as const,
  shortDescription:
    "Однодневный сплав по живописной Илии. Старт в 12:00, лёгкое спокойное течение, обед на берегу, к вечеру вы дома.",
  longDescription:
    "Илия — небольшая, но очень красивая река на севере Минской области. Идеальный формат для тех, кто хочет проверить себя на воде, но не готов ночевать в палатке.\n\nМаршрут проходит через сосновые боры и небольшие деревни. Спокойное течение и отсутствие сложных препятствий делают сплав безопасным даже для тех, кто впервые садится в байдарку. Берём с собой полотенце, сменную одежду и хорошее настроение.",
  route: "д. Старое Поле — устье у Вилии (~15 км по воде)",
  includes: [
    "Байдарка, вёсла, спасжилеты, гермомешки",
    "Инструктор-проводник",
    "Обед на берегу",
    "Чай у костра",
    "Трансфер из Молодечно (по запросу)",
    "Страховка участников",
  ],
  program: [
    {
      day: 1,
      title: "Сплав",
      description:
        "Сбор в 12:00 на точке старта. Инструктаж, посадка в байдарки. ~4 часа на воде с остановкой на обед-пикник. Финиш у устья Илии в Вилию, антистапель, возвращение к 19:00.",
    },
  ],
  seatsTotal: 12,
  seatsLeft: 8,
};

const dateField = getFormField(ENTRY.date);
const dateOptions = dateField?.options ?? [];

const monthsGen: Record<number, string> = {
  0: "января",
  1: "февраля",
  2: "марта",
  3: "апреля",
  4: "мая",
  5: "июня",
  6: "июля",
  7: "августа",
  8: "сентября",
  9: "октября",
  10: "ноября",
  11: "декабря",
};

function buildSplav(formDateValue: string, idx: number): Splav | null {
  const parsed = parseDateOption(formDateValue);
  if (!parsed) {
    // eslint-disable-next-line no-console
    console.warn(
      `[splavy] Не удалось распарсить дату формы: "${formDateValue}"`,
    );
    return null;
  }
  const d = new Date(parsed.date);
  const humanDate = `${d.getDate()} ${monthsGen[d.getMonth()]}`;
  return {
    ...TRIP_TEMPLATE,
    id: idx + 1,
    title: `Сплав ${humanDate}`,
    river: parsed.river,
    startDate: parsed.date,
    endDate: parsed.date,
    startTime: parsed.time,
    formDateValue,
  };
}

export const splavy: Splav[] = dateOptions
  .map(buildSplav)
  .filter((s): s is Splav => s !== null);

/** Возвращает ближайший по дате будущий сплав, либо самый новый, если все в прошлом */
export function getFeaturedSplav(): Splav | undefined {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = splavy
    .filter((s) => s.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  return upcoming[0] ?? splavy[splavy.length - 1];
}

/** Поиск сплава по id (для страницы деталей) */
export function getSplavById(id: number): Splav | undefined {
  return splavy.find((s) => s.id === id);
}
