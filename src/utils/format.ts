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

const weekdaysShort: Record<number, string> = {
  0: "вс",
  1: "пн",
  2: "вт",
  3: "ср",
  4: "чт",
  5: "пт",
  6: "сб",
};

const humanDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

export function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);

  if (startIso === endIso) {
    return `${start.getDate()} ${monthsGen[start.getMonth()]}, ${weekdaysShort[start.getDay()]}`;
  }

  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${monthsGen[end.getMonth()]}`;
  }
  return `${start.getDate()} ${monthsGen[start.getMonth()]} — ${end.getDate()} ${monthsGen[end.getMonth()]}`;
}

export function formatDateRangeFull(startIso: string, endIso: string): string {
  const end = new Date(endIso);
  return `${formatDateRange(startIso, endIso)} ${end.getFullYear()}`;
}

export function formatHumanDate(date: Date): string {
  return humanDateFormatter.format(date);
}
