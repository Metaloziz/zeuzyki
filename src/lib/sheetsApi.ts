import type { River } from "../types/river";
import type { Splav } from "../types/splav";

interface ScheduleItem {
  id: string | number;
  date: string;
  time: string;
  river: string;
  riverId?: string | number;
  title: string;
  isActive: boolean;
}

interface ScheduleResponse {
  ok: boolean;
  items?: ScheduleItem[];
  error?: string;
}

interface RiversResponse {
  ok: boolean;
  items?: River[];
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
  kidsCount?: number;
  kidsAges?: string;
  tripTitle: string;
  tripDate: string;
  tripTime?: string;
  scheduleId?: string;
  riverId?: string;
  riverName?: string;
  comment?: string;
}

const GAS_API_URL =
  "https://script.google.com/macros/s/AKfycbxccist5FQVr6JcHbmKlCIsvIgFmidHLM1qDq3I6QdNVVN4N611qpFlRLERANoVtoCC/exec";

const API_URL = GAS_API_URL;
const API_KEY = (import.meta.env.VITE_GAS_API_KEY ?? "").trim();

const SCHEDULE_CACHE_VERSION = 1;
const RIVERS_CACHE_VERSION = 1;
const SCHEDULE_CACHE_KEY = `zeuzyki:schedule:v${SCHEDULE_CACHE_VERSION}:${API_URL}:${API_KEY}`;
const RIVERS_CACHE_KEY = `zeuzyki:rivers:v${RIVERS_CACHE_VERSION}:${API_URL}:${API_KEY}`;

interface ScheduleCache {
  savedAt: number;
  items: Splav[];
}

interface RiversCache {
  savedAt: number;
  items: River[];
}

interface FetchScheduleOptions {
  onRefreshStart?: () => void;
  onRefreshComplete?: () => void;
  onRefreshError?: (error: unknown) => void;
  onUpdate?: (items: Splav[]) => void;
}

interface FetchRiversOptions {
  onRefreshStart?: () => void;
  onRefreshComplete?: () => void;
  onRefreshError?: (error: unknown) => void;
  onUpdate?: (items: River[]) => void;
}

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
    riverId: String(item.riverId ?? ""),
    startDate: item.date,
    endDate: item.date,
    startTime: item.time,
  };
}

function toRiver(item: River): River {
  return {
    id: String(item.id),
    river: item.river?.trim() ?? "",
    distance: item.distance?.trim() ?? "",
    time: item.time?.trim() ?? "",
    price: item.price?.trim() ?? "",
    kidsPrice: item.kidsPrice?.trim() ?? "",
    description: item.description?.trim() ?? "",
  };
}

function getCachedSchedule(): Splav[] | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SCHEDULE_CACHE_KEY);
    if (!raw) return null;

    const cache = JSON.parse(raw) as Partial<ScheduleCache>;
    if (!cache.savedAt || !Array.isArray(cache.items)) {
      window.localStorage.removeItem(SCHEDULE_CACHE_KEY);
      return null;
    }

    return cache.items;
  } catch {
    window.localStorage.removeItem(SCHEDULE_CACHE_KEY);
    return null;
  }
}

function setCachedSchedule(items: Splav[]) {
  if (typeof window === "undefined") return;

  try {
    const cache: ScheduleCache = {
      savedAt: Date.now(),
      items,
    };
    window.localStorage.setItem(SCHEDULE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage can be unavailable or full; schedule loading must still work.
  }
}

function getCachedRivers(): River[] | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(RIVERS_CACHE_KEY);
    if (!raw) return null;

    const cache = JSON.parse(raw) as Partial<RiversCache>;
    if (!cache.savedAt || !Array.isArray(cache.items)) {
      window.localStorage.removeItem(RIVERS_CACHE_KEY);
      return null;
    }

    return cache.items;
  } catch {
    window.localStorage.removeItem(RIVERS_CACHE_KEY);
    return null;
  }
}

function setCachedRivers(items: River[]) {
  if (typeof window === "undefined") return;

  try {
    const cache: RiversCache = {
      savedAt: Date.now(),
      items,
    };
    window.localStorage.setItem(RIVERS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage can be unavailable or full; rivers loading must still work.
  }
}

function areSchedulesEqual(a: Splav[], b: Splav[]) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function areRiversEqual(a: River[], b: River[]) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function fetchScheduleFromApi(): Promise<Splav[]> {
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

  const items = (json.items ?? []).filter((i) => i.isActive).map(toSplav);
  setCachedSchedule(items);
  return items;
}

async function refreshCachedSchedule(
  cached: Splav[],
  options: FetchScheduleOptions,
) {
  options.onRefreshStart?.();

  try {
    const fresh = await fetchScheduleFromApi();
    if (!areSchedulesEqual(cached, fresh)) {
      options.onUpdate?.(fresh);
    }
  } catch (error) {
    options.onRefreshError?.(error);
  } finally {
    options.onRefreshComplete?.();
  }
}

export async function fetchSchedule(
  options: FetchScheduleOptions = {},
): Promise<Splav[]> {
  assertConfigured();

  const cached = getCachedSchedule();
  if (cached) {
    void refreshCachedSchedule(cached, options);
    return cached;
  }

  return fetchScheduleFromApi();
}

async function fetchRiversFromApi(): Promise<River[]> {
  const url = new URL(API_URL);
  url.searchParams.set("action", "rivers");
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    throw new Error(`Ошибка загрузки видов сплавов: HTTP ${res.status}`);
  }

  const json = (await res.json()) as RiversResponse;
  if (!json.ok) {
    throw new Error(`Ошибка API видов сплавов: ${json.error ?? "unknown"}`);
  }

  const items = (json.items ?? []).map(toRiver).filter((item) => item.river);
  setCachedRivers(items);
  return items;
}

async function refreshCachedRivers(
  cached: River[],
  options: FetchRiversOptions,
) {
  options.onRefreshStart?.();

  try {
    const fresh = await fetchRiversFromApi();
    if (!areRiversEqual(cached, fresh)) {
      options.onUpdate?.(fresh);
    }
  } catch (error) {
    options.onRefreshError?.(error);
  } finally {
    options.onRefreshComplete?.();
  }
}

export async function fetchRivers(
  options: FetchRiversOptions = {},
): Promise<River[]> {
  assertConfigured();

  const cached = getCachedRivers();
  if (cached) {
    void refreshCachedRivers(cached, options);
    return cached;
  }

  return fetchRiversFromApi();
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
      kidsCount: payload.kidsCount ?? 0,
      kidsAges: payload.kidsAges ?? "",
      tripTitle: payload.tripTitle,
      tripDate: payload.tripDate,
      tripTime: payload.tripTime ?? "",
      scheduleId: payload.scheduleId ?? "",
      riverId: payload.riverId ?? "",
      riverName: payload.riverName ?? "",
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
