import type { Page } from '@playwright/test';

/**
 * Common ground for every page object.
 *
 * Page objects hold *locators* and *actions* only; assertions live in the
 * sibling `*.assertions.ts` module so a page can be driven without asserting
 * and asserted without re-implementing navigation.
 */
export abstract class BasePage {
  public constructor(protected readonly page: Page) {}

  /** Exposes the underlying Playwright page for assertions modules. */
  public get playwrightPage(): Page {
    return this.page;
  }

  /** Browser "back" navigation, waiting for the previous document to load. */
  public async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
  }
}
