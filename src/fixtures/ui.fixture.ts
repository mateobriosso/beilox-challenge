import { test as base } from '@playwright/test';
import { SearchPage } from '../pages/search/search.page';
import { SearchAssertions } from '../pages/search/search.assertions';
import { ResultsPage } from '../pages/results/results.page';
import { ResultsAssertions } from '../pages/results/results.assertions';

/** Page objects and their assertion companions, injected into every UI spec. */
interface UiFixtures {
  readonly searchPage: SearchPage;
  readonly searchAssertions: SearchAssertions;
  readonly resultsPage: ResultsPage;
  readonly resultsAssertions: ResultsAssertions;
}

/**
 * UI test entry point. Specs import `test` and `expect` from here so page
 * objects are always built on the test's own `page` and never shared across
 * workers.
 */
export const test = base.extend<UiFixtures>({
  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },
  searchAssertions: async ({ searchPage }, use) => {
    await use(new SearchAssertions(searchPage));
  },
  resultsPage: async ({ page }, use) => {
    await use(new ResultsPage(page));
  },
  resultsAssertions: async ({ resultsPage }, use) => {
    await use(new ResultsAssertions(resultsPage));
  },
});

export { expect } from '@playwright/test';
