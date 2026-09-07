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

/**
 * The site's timezone. `playwright.config.ts` pins the browser context to it, so every
 * date the tests reason about has to be built in the same zone.
 */
export const SITE_TIME_ZONE = 'America/Argentina/Buenos_Aires';

/**
 * "Today" as the site sees it, not as the machine running the tests sees it.
 *
 * Node uses the host timezone (UTC on the GitHub runner) while the browser is pinned to
 * `SITE_TIME_ZONE`, so between 21:00 and 00:00 ART the two disagree on the calendar date.
 * Building the date from the host clock made `daysFromToday(-1)` point at the day the site
 * still considers today, and the past-date assertion looked for it as disabled.
 */
function todayInSiteTimeZone(): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SITE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');

  return new Date(part('year'), part('month') - 1, part('day'));
}

/**
 * Returns the site's today plus `days`, at local midnight. Only the year, month and day
 * are ever read downstream, so the host offset never leaks into an assertion.
 */
export function daysFromToday(days: number): Date {
  const date = todayInSiteTimeZone();
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
