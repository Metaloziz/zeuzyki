export type Difficulty = "начальный" | "средний" | "сложный";

export interface ProgramDay {
  day: number;
  title: string;
  description: string;
}

export interface Splav {
  /** Уникальный id (соответствует `Schedule.id` в Google Sheet) */
  id: string;
  /** Название сплава */
  title: string;
  /** Река */
  river: string;
  /** Дата начала, ISO yyyy-mm-dd */
  startDate: string;
  /** Дата окончания, ISO yyyy-mm-dd */
  endDate: string;
  /** Время старта в формате HH:MM */
  startTime: string;
  /** Длительность в днях */
  durationDays: number;
  /** Цена с человека, BYN */
  price: number;
  /** Уровень сложности */
  difficulty: Difficulty;
  /** Всего мест */
  seatsTotal: number;
  /** Свободных мест */
  seatsLeft: number;
  /** Короткое описание для баннера */
  shortDescription: string;
  /** Подробное описание для страницы деталей (несколько абзацев, \n\n как разделитель) */
  longDescription: string;
  /** Маршрут — текстовое описание */
  route: string;
  /** Что входит в стоимость */
  includes: string[];
  /** Программа по дням */
  program: ProgramDay[];
}
