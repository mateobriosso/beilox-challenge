import { test as base } from '@playwright/test';
import { SwapiClient } from '../api/clients/swapi.client';

/** Fixtures injected into every API spec. */
interface ApiFixtures {
  /** Typed client bound to the project's `baseURL` and default headers. */
  readonly swapi: SwapiClient;
}

/**
 * API test entry point. Specs import `test` and `expect` from here instead of
 * `@playwright/test` so the client is always constructed the same way.
 */
export const test = base.extend<ApiFixtures>({
  swapi: async ({ request }, use) => {
    await use(new SwapiClient(request));
  },
});

export { expect } from '@playwright/test';
