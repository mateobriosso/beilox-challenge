/** Date helpers shared by the UI page objects and test data. Locale: es-AR. */

export const SPANISH_MONTHS: readonly string[] = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/** Three-letter abbreviations used by the results date strip (e.g. "13 Sep"). */
export const SPANISH_MONTHS_SHORT: readonly string[] = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Returns today's date plus `days`, with the time component zeroed. */
export function daysFromToday(days: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

/** `dd/MM/yyyy`, the format shown in the search form input. */
export function formatDayMonthYear(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/**
 * Matches the departure input value for `date`. The site writes `dd-MM-yyyy` right
 * after picking a day in the calendar but restores `dd/MM/yyyy` when navigating back,
 * so both separators are accepted.
 */
export function departureInputPattern(date: Date): RegExp {
  return new RegExp(`^${pad2(date.getDate())}[-/]${pad2(date.getMonth() + 1)}[-/]${date.getFullYear()}$`);
}

/** `MM/dd/yyyy`, the format the site uses in the results URL (`FIda` query param). */
export function formatMonthDayYear(date: Date): string {
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}/${date.getFullYear()}`;
}

/** Full Spanish month name, e.g. "Septiembre". */
export function monthName(date: Date): string {
  return SPANISH_MONTHS[date.getMonth()] ?? '';
}

/** Day and abbreviated month as shown in the results date strip, e.g. "13 Sep". */
export function formatDayShortMonth(date: Date): string {
  return `${date.getDate()} ${SPANISH_MONTHS_SHORT[date.getMonth()] ?? ''}`;
}
