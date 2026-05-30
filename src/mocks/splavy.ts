import type { Splav } from "../types/splav";

const TRIP_TEMPLATE = {
  durationDays: 1,
  price: 80,
  difficulty: "начальный" as const,
  shortDescription:
    "Однодневный сплав для новичков: спокойный маршрут и отдых на природе.",
  longDescription:
    "Маршрут подойдёт тем, кто впервые идёт на воду. Перед стартом проводим инструктаж по безопасности.\n\nВ пути делаем остановки на отдых, после финиша помогаем с трансфером.",
  route: "Маршрут уточняется при подтверждении бронирования",
  includes: [
    "Байдарка, вёсла, спасжилеты, гермомешки",
    "Инструктор-проводник",
    "Чай и перекус",
  ],
  program: [
    {
      day: 1,
      title: "Сплав",
      description:
        "Сбор группы, инструктаж, выход на маршрут, остановка на отдых, финиш.",
    },
  ],
  seatsTotal: 12,
  seatsLeft: 8,
};

export const splavy: Splav[] = [
  {
    ...TRIP_TEMPLATE,
    id: "demo-1",
    title: "Утренний сплав",
    river: "Вилия",
    startDate: "2026-06-10",
    endDate: "2026-06-10",
    startTime: "09:00",
  },
  {
    ...TRIP_TEMPLATE,
    id: "demo-2",
    title: "Вечерний сплав",
    river: "Нарочанка",
    startDate: "2026-06-19",
    endDate: "2026-06-19",
    startTime: "18:00",
  },
];

export function getFeaturedSplav(): Splav | undefined {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = splavy
    .filter((s) => s.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  return upcoming[0] ?? splavy[splavy.length - 1];
}

export function getSplavById(id: string): Splav | undefined {
  return splavy.find((s) => s.id === id);
}
