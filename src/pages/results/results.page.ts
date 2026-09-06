import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { resultsSelectors as sel } from './results.selectors';

/** Path every results page shares; the rest is `<origin-slug>/<destination-slug>`. */
export const RESULTS_PATH = '/cdp/pasajes-micro/';

/**
 * Actions and locators for the results page.
 *
 * The page is reached by submitting the search form, so there is no `open()`;
 * `waitForLoaded()` settles on whichever outcome the site produced.
 */
export class ResultsPage extends BasePage {
  public readonly routeOrigin: Locator;
  public readonly routeDestination: Locator;
  public readonly selectedDate: Locator;
  public readonly passengers: Locator;
  public readonly servicesContainer: Locator;
  public readonly serviceCards: Locator;
  public readonly noResultsModal: Locator;
  public readonly noResultsMessage: Locator;
  public readonly newSearchButton: Locator;

  public constructor(page: Page) {
    super(page);
    this.routeOrigin = page.locator(sel.routeOrigin);
    this.routeDestination = page.locator(sel.routeDestination);
    this.selectedDate = page.locator(sel.selectedDate);
    this.passengers = page.locator(sel.passengers);
    this.servicesContainer = page.locator(sel.servicesContainer);
    this.serviceCards = page.locator(sel.serviceCard);
    this.noResultsModal = page.locator(sel.noResultsModal);
    this.noResultsMessage = page.locator(sel.noResultsMessage);
    this.newSearchButton = page.locator(sel.newSearchButton);
  }

  /**
   * Waits until the results page has an outcome: at least one service card,
   * or the "no options" modal. The services list is rendered server-side after
   * a redirect, so this can take several seconds on the public site.
   */
  public async waitForLoaded(): Promise<void> {
    await this.page.waitForURL((url) => url.pathname.startsWith(RESULTS_PATH));
    // The modal markup exists (hidden) on every results page, so only a *visible*
    // modal counts as an outcome; `.first()` keeps the `or` out of strict mode.
    const outcome = this.serviceCards.first().or(this.noResultsModal.filter({ visible: true }));
    await expect(outcome.first()).toBeVisible();
  }

  /** Cards whose departure city is *not* the given one (should be none). */
  public cardsDepartingFromOtherThan(city: string): Locator {
    return this.serviceCards.filter({
      has: this.page.locator(sel.card.departureCity).filter({ hasNotText: city }),
    });
  }

  /** Cards whose arrival city is *not* the given one (should be none). */
  public cardsArrivingToOtherThan(city: string): Locator {
    return this.serviceCards.filter({
      has: this.page.locator(sel.card.arrivalCity).filter({ hasNotText: city }),
    });
  }

  /** Cards missing a departure time, arrival time or price. */
  public incompleteCards(): Locator {
    const cardsMissing = (selector: string): Locator =>
      this.serviceCards.filter({ hasNot: this.page.locator(selector) });
    return cardsMissing(sel.card.departureTime)
      .or(cardsMissing(sel.card.arrivalTime))
      .or(cardsMissing(sel.card.price));
  }
}
