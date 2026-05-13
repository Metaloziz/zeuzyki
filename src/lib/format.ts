const monthsGen: Record<number, string> = {
  0: 'января',
  1: 'февраля',
  2: 'марта',
  3: 'апреля',
  4: 'мая',
  5: 'июня',
  6: 'июля',
  7: 'августа',
  8: 'сентября',
  9: 'октября',
  10: 'ноября',
  11: 'декабря',
};

export function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${monthsGen[end.getMonth()]}`;
  }
  return `${start.getDate()} ${monthsGen[start.getMonth()]} — ${end.getDate()} ${monthsGen[end.getMonth()]}`;
}

export function formatDateRangeFull(startIso: string, endIso: string): string {
  const end = new Date(endIso);
  return `${formatDateRange(startIso, endIso)} ${end.getFullYear()}`;
}
