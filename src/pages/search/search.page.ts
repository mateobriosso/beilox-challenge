import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { searchSelectors as sel } from './search.selectors';
import type { SearchCriteria, Station } from '../../data/routes.data';
import { departureInputPattern, monthName } from '../../utils/dates';

/** The two Select2 station pickers share the same interaction pattern. */
type StationField = 'origin' | 'destination';

/** Upper bound on "next month" clicks while looking for the target month. */
const MAX_MONTH_HOPS = 12;

/**
 * Actions available on the home-page search form.
 *
 * Every method performs a user-level action and waits for the UI to reflect it
 * (web-first assertions), so callers never need fixed timeouts.
 */
export class SearchPage extends BasePage {
  public readonly form: Locator;
  public readonly departureDate: Locator;
  public readonly passengers: Locator;
  public readonly submitButton: Locator;
  public readonly validationErrors: Locator;
  public readonly calendar: Locator;
  public readonly stationSuggestions: Locator;
  public readonly noStationMatchMessage: Locator;

  public constructor(page: Page) {
    super(page);
    this.form = page.locator(sel.form);
    this.departureDate = page.locator(sel.departureDate);
    this.passengers = page.locator(sel.passengers);
    this.submitButton = page.locator(sel.submit);
    this.validationErrors = page.locator(sel.validationError);
    this.calendar = page.locator(sel.calendar.container);
    this.stationSuggestions = page.locator(sel.select2.option);
    this.noStationMatchMessage = page.locator(sel.select2.noResultsMessage);
  }

  /** Navigates to the home page and waits for the search form. */
  public async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.form).toBeVisible();
  }

  /** Text currently rendered in a station picker (selection or placeholder). */
  public renderedStation(field: StationField): Locator {
    return this.page.locator(sel[field].rendered);
  }

  /** Opens a station picker and types a query without choosing any suggestion. */
  public async typeStation(field: StationField, query: string): Promise<void> {
    await this.openStationPicker(field);
    await this.page.locator(sel.select2.openSearchField).fill(query);
  }

  /** Opens a station picker, types the query and picks the matching suggestion. */
  public async selectStation(field: StationField, station: Station): Promise<void> {
    await this.typeStation(field, station.query);
    await this.stationSuggestions.filter({ hasText: station.optionLabel }).first().click();
    await expect(this.renderedStation(field)).toContainText(station.optionLabel);
  }

  /** Opens the departure calendar (does nothing if it is already open). */
  public async openDepartureCalendar(): Promise<void> {
    await this.departureDate.click();
    await expect(this.calendar).toBeVisible();
  }

  /** Locator for a calendar day cell in the month currently displayed. */
  public calendarDay(dayOfMonth: number, state: 'selectable' | 'disabled'): Locator {
    const selector = state === 'selectable' ? sel.calendar.selectableDay : sel.calendar.disabledDay;
    return this.calendar.locator(selector).filter({ hasText: new RegExp(`^${dayOfMonth}$`) });
  }

  /** Picks `date` in the calendar, paging forward month by month if needed. */
  public async selectDepartureDate(date: Date): Promise<void> {
    await this.openDepartureCalendar();
    await this.showCalendarMonth(date);
    await this.calendarDay(date.getDate(), 'selectable').first().click();
    await expect(this.departureDate).toHaveValue(departureInputPattern(date));
  }

  public async selectPassengers(count: number): Promise<void> {
    await this.passengers.selectOption(String(count));
  }

  /** Clicks "Buscar" without waiting for navigation (validation may block it). */
  public async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Fills the whole form and submits it. */
  public async search(criteria: SearchCriteria): Promise<void> {
    await this.selectStation('origin', criteria.origin);
    await this.selectStation('destination', criteria.destination);
    await this.selectDepartureDate(criteria.departureDate);
    await this.selectPassengers(criteria.passengers);
    await this.submit();
  }

  /**
   * Opens a Select2 picker unless it is already open. The site auto-opens the
   * destination picker right after an origin is chosen, and clicking the
   * combobox again would close it.
   */
  private async openStationPicker(field: StationField): Promise<void> {
    const alreadyOpen = (await this.page.locator(sel[field].resultsList).count()) > 0;
    if (!alreadyOpen) {
      await this.page.locator(sel[field].combobox).click();
    }
    await expect(this.page.locator(sel[field].resultsList)).toBeVisible();
  }

  private async showCalendarMonth(date: Date): Promise<void> {
    const wanted = `${monthName(date)} ${date.getFullYear()}`;
    const heading = this.calendar.locator(sel.calendar.monthName);
    for (let hop = 0; hop < MAX_MONTH_HOPS; hop += 1) {
      const shown = (await heading.innerText()).replace(/\s+/g, ' ').trim();
      if (shown === wanted) {
        return;
      }
      await this.calendar.locator(sel.calendar.nextMonth).click();
      await expect(heading).not.toHaveText(shown);
    }
    throw new Error(`Calendar month "${wanted}" not reachable within ${MAX_MONTH_HOPS} hops`);
  }
}
