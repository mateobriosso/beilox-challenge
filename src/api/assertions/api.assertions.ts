import { expect, test } from '@playwright/test';
import type { SchemaObject } from 'ajv';
import type { ApiResponse } from '../clients/swapi.client';
import { env } from '../../utils/env';
import { validateSchema } from '../../utils/schema-validator';

/**
 * Reusable assertions for API responses.
 *
 * Every helper is a plain function around `expect` so failures show up in the
 * Playwright report with a descriptive message and the offending payload.
 */

function describeRequest(response: ApiResponse): string {
  return `${response.request.method} ${response.request.url}`;
}

/** Asserts the HTTP status code. */
export function expectStatus(response: ApiResponse, expected: number): void {
  expect(response.status, `${describeRequest(response)} should respond ${expected}`).toBe(
    expected,
  );
}

/** Annotation consumed by `src/reporters/response-time.reporter.ts`. */
const RESPONSE_TIME_ANNOTATION = 'response-time';

/**
 * Asserts the round-trip stayed under the configured budget (`API_MAX_RESPONSE_MS`)
 * and records the measurement as a test annotation so the custom reporter can
 * print a per-test table and publish it to the GitHub Actions summary.
 */
export function expectResponseTimeWithinBudget(
  response: ApiResponse,
  maxMs: number = env.apiMaxResponseMs,
): void {
  test.info().annotations.push({
    type: RESPONSE_TIME_ANNOTATION,
    description: String(response.durationMs),
  });
  expect(
    response.durationMs,
    `${describeRequest(response)} took ${response.durationMs}ms, budget is ${maxMs}ms`,
  ).toBeLessThanOrEqual(maxMs);
}

/** Asserts the response declares a JSON content type. */
export function expectJsonContentType(response: ApiResponse): void {
  expect(response.headers['content-type'], 'content-type header').toContain('application/json');
}

/**
 * Validates the body with Ajv and narrows its type on success.
 * On failure the message lists every violation (path + reason).
 */
export function expectSchema<TBody>(
  response: ApiResponse,
  schema: SchemaObject,
): asserts response is ApiResponse<TBody> {
  const { valid, errors } = validateSchema(schema, response.body);
  expect(
    valid,
    `Body of ${describeRequest(response)} does not match schema:\n - ${errors.join('\n - ')}`,
  ).toBe(true);
}

/**
 * Combined happy-path contract: 200, JSON, within time budget and schema-valid.
 * Narrows `response.body` to `TBody` for the caller.
 */
export function expectSuccessfulJson<TBody>(
  response: ApiResponse,
  schema: SchemaObject,
): asserts response is ApiResponse<TBody> {
  expectStatus(response, 200);
  expectJsonContentType(response);
  expectResponseTimeWithinBudget(response);
  expectSchema<TBody>(response, schema);
}

/** Combined 404 contract: status, JSON error envelope and time budget. */
export function expectNotFound(response: ApiResponse, schema: SchemaObject): void {
  expectStatus(response, 404);
  expectJsonContentType(response);
  expectResponseTimeWithinBudget(response);
  expectSchema(response, schema);
}

/**
 * Combined 400 contract. swapi.tech answers malformed input with a plain
 * "Bad Request" page (not JSON), so only status, body text and time are checked.
 */
export function expectBadRequest(response: ApiResponse): void {
  expectStatus(response, 400);
  expectResponseTimeWithinBudget(response);
  expect(String(response.body), 'error page text').toContain('Bad Request');
}
