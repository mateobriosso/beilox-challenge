import { expect } from '@playwright/test';
import type { SearchPage } from './search.page';
import type { Station } from '../../data/routes.data';
import { NO_STATION_MATCH_MESSAGE, REQUIRED_FIELD_MESSAGES } from '../../data/routes.data';
import { departureInputPattern } from '../../utils/dates';

/**
 * Assertions about the state of the search form.
 *
 * Kept apart from `SearchPage` so the page object stays a pure driver and the
 * spec reads as a list of intentions.
 */
export class SearchAssertions {
  public constructor(private readonly searchPage: SearchPage) {}

  /** The browser is still on the home page (no navigation happened). */
  public async expectStillOnSearchPage(): Promise<void> {
    await expect(this.searchPage.playwrightPage).toHaveURL(/centraldepasajes\.com\.ar\/?$/);
    await expect(this.searchPage.form).toBeVisible();
  }

  /** Every required field shows its Parsley message, in form order. */
  public async expectRequiredFieldErrors(): Promise<void> {
    await expect(this.searchPage.validationErrors).toHaveText([...REQUIRED_FIELD_MESSAGES]);
  }

  /** The open station picker offers no suggestion for the typed text. */
  public async expectNoStationSuggestions(): Promise<void> {
    await expect(this.searchPage.noStationMatchMessage).toHaveText(NO_STATION_MATCH_MESSAGE);
    await expect(this.searchPage.stationSuggestions).toHaveCount(1);
  }

  public async expectSelectedOrigin(station: Station): Promise<void> {
    await expect(this.searchPage.renderedStation('origin')).toContainText(station.optionLabel);
  }

  public async expectSelectedDestination(station: Station): Promise<void> {
    await expect(this.searchPage.renderedStation('destination')).toContainText(
      station.optionLabel,
    );
  }

  public async expectPassengers(count: number): Promise<void> {
    await expect(this.searchPage.passengers).toHaveValue(String(count));
  }

  public async expectDepartureDate(date: Date): Promise<void> {
    await expect(this.searchPage.departureDate).toHaveValue(departureInputPattern(date));
  }

  /** The calendar marks `date` (in the displayed month) as not selectable. */
  public async expectDateDisabled(date: Date): Promise<void> {
    await expect(this.searchPage.calendarDay(date.getDate(), 'disabled').first()).toBeVisible();
    await expect(this.searchPage.calendarDay(date.getDate(), 'selectable')).toHaveCount(0);
  }
}
