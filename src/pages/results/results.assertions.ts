import { expect } from '@playwright/test';
import type { ResultsPage } from './results.page';
import { RESULTS_PATH } from './results.page';
import type { SearchCriteria } from '../../data/routes.data';
import { NO_SERVICES_MESSAGE } from '../../data/routes.data';
import { formatDayShortMonth, formatMonthDayYear } from '../../utils/dates';

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Assertions about the results page, expressed in terms of the search criteria. */
export class ResultsAssertions {
  public constructor(private readonly resultsPage: ResultsPage) {}

  /** URL encodes origin, destination, date (`FIda=MM/dd/yyyy`) and passengers (`CntPas`). */
  public async expectUrlReflects(criteria: SearchCriteria): Promise<void> {
    const path = `${RESULTS_PATH}${criteria.origin.slug}/${criteria.destination.slug}`;
    const date = formatMonthDayYear(criteria.departureDate);
    const pattern = new RegExp(
      `${escapeRegExp(path)}\\?.*FIda=${escapeRegExp(date)}.*CntPas=${criteria.passengers}`,
    );
    await expect(this.resultsPage.playwrightPage).toHaveURL(pattern);
  }

  /** Heading names the searched origin and destination. */
  public async expectRouteHeading(criteria: SearchCriteria): Promise<void> {
    await expect(this.resultsPage.routeOrigin).toHaveText(criteria.origin.resultsLabel);
    await expect(this.resultsPage.routeDestination).toHaveText(
      criteria.destination.resultsLabel,
    );
  }

  /** The embedded search form carries the searched passenger count (`CntPas`). */
  public async expectPassengers(count: number): Promise<void> {
    await expect(this.resultsPage.passengers).toHaveValue(String(count));
  }

  /** The date strip highlights the searched day (e.g. "13 Sep"). */
  public async expectSelectedDate(date: Date): Promise<void> {
    await expect(this.resultsPage.selectedDate).toHaveText(formatDayShortMonth(date));
  }

  /** At least one service, and every card is consistent with the searched route. */
  public async expectServicesForRoute(criteria: SearchCriteria): Promise<void> {
    await expect(this.resultsPage.servicesContainer).toBeVisible();
    await expect(this.resultsPage.serviceCards.first()).toBeVisible();

    const origin = criteria.origin.resultsLabel;
    const destination = criteria.destination.resultsLabel;
    await expect(this.resultsPage.cardsDepartingFromOtherThan(origin)).toHaveCount(0);
    await expect(this.resultsPage.cardsArrivingToOtherThan(destination)).toHaveCount(0);
    await expect(this.resultsPage.incompleteCards()).toHaveCount(0);
  }

  /** The "no options" modal is shown and the services list stays hidden. */
  public async expectNoServicesMessage(): Promise<void> {
    await expect(this.resultsPage.noResultsModal).toBeVisible();
    await expect(this.resultsPage.noResultsMessage).toContainText(NO_SERVICES_MESSAGE);
    await expect(this.resultsPage.newSearchButton).toBeVisible();
    await expect(this.resultsPage.servicesContainer).toBeHidden();
    await expect(this.resultsPage.serviceCards).toHaveCount(0);
  }
}
