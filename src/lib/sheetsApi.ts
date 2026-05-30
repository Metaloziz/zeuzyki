import type { Splav } from "../types/splav";

interface ScheduleItem {
  id: string | number;
  date: string;
  time: string;
  river: string;
  title: string;
  isActive: boolean;
}

interface ScheduleResponse {
  ok: boolean;
  items?: ScheduleItem[];
  error?: string;
}

interface BookingResponse {
  ok: boolean;
  message?: string;
  error?: string;
}

export interface BookingPayload {
  name: string;
  phone: string;
  peopleCount: number;
  tripId: string;
  tripDate: string;
  comment?: string;
}

const API_URL = (import.meta.env.VITE_GAS_API_URL ?? "").trim();
const API_KEY = (import.meta.env.VITE_GAS_API_KEY ?? "").trim();

const TRIP_TEMPLATE = {
  durationDays: 1,
  price: 80,
  difficulty: "начальный" as const,
  shortDescription:
    "Однодневный сплав для новичков: спокойный маршрут, инструктаж и отдых на природе.",
  longDescription:
    "Маршрут подойдёт тем, кто впервые идёт на воду. Перед стартом проводим инструктаж по технике безопасности и управлению байдаркой.\n\nВ пути делаем остановки на отдых. После финиша помогаем с трансфером и отвечаем на все вопросы по следующим маршрутам.",
  route: "Маршрут уточняется при подтверждении бронирования",
  includes: [
    "Байдарка, вёсла, спасжилеты, гермомешки",
    "Инструктор-проводник",
    "Брифинг по безопасности",
    "Чай и перекус на остановке",
  ],
  program: [
    {
      day: 1,
      title: "Сплав",
      description:
        "Сбор группы, инструктаж, выход на маршрут, остановка на отдых, финиш и завершение программы.",
    },
  ],
  seatsTotal: 12,
  seatsLeft: 8,
};

function assertConfigured() {
  if (!API_URL) {
    throw new Error("Не задан VITE_GAS_API_URL");
  }
  if (!API_KEY) {
    throw new Error("Не задан VITE_GAS_API_KEY");
  }
}

function toSplav(item: ScheduleItem): Splav {
  return {
    ...TRIP_TEMPLATE,
    id: String(item.id),
    title: item.title?.trim() || `Сплав по р. ${item.river}`,
    river: item.river,
    startDate: item.date,
    endDate: item.date,
    startTime: item.time,
  };
}

export async function fetchSchedule(): Promise<Splav[]> {
  assertConfigured();

  const url = new URL(API_URL);
  url.searchParams.set("action", "schedule");
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    throw new Error(`Ошибка загрузки расписания: HTTP ${res.status}`);
  }

  const json = (await res.json()) as ScheduleResponse;
  if (!json.ok) {
    throw new Error(`Ошибка API расписания: ${json.error ?? "unknown"}`);
  }

  return (json.items ?? []).filter((i) => i.isActive).map(toSplav);
}

export async function submitBooking(payload: BookingPayload): Promise<void> {
  assertConfigured();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      apiKey: API_KEY,
      name: payload.name,
      phone: payload.phone,
      peopleCount: payload.peopleCount,
      tripId: payload.tripId,
      tripDate: payload.tripDate,
      comment: payload.comment ?? "",
      source: "site",
      website: "",
    }),
  });

  if (!res.ok) {
    throw new Error(`Ошибка отправки заявки: HTTP ${res.status}`);
  }

  const json = (await res.json()) as BookingResponse;
  if (!json.ok) {
    if (json.error === "rate_limited") {
      throw new Error("Слишком много попыток. Повторите через минуту");
    }
    if (json.error === "validation_error") {
      throw new Error("Проверьте корректность заполнения полей");
    }
    if (json.error === "unauthorized") {
      throw new Error("Неверный API-ключ");
    }

    throw new Error(`Ошибка API бронирования: ${json.error ?? "unknown"}`);
  }
}
