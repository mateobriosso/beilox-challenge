import Ajv from 'ajv';
import type { ErrorObject, SchemaObject } from 'ajv';
import addFormats from 'ajv-formats';

/**
 * Single Ajv instance shared by every API test.
 *
 * - `allErrors` reports every mismatch at once instead of stopping at the first one,
 *   which makes a failing schema assertion actionable in one run.
 * - `strict` rejects typos in the schema itself (e.g. `requried`) at compile time.
 * - `ajv-formats` enables `format: "uri"` / `"date-time"` used by the swapi schemas.
 */
const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

/** Outcome of validating a payload against a JSON schema. */
export interface SchemaValidationResult {
  readonly valid: boolean;
  /** Human-readable list of violations, empty when `valid` is true. */
  readonly errors: readonly string[];
}

function formatError(error: ErrorObject): string {
  const path = error.instancePath === '' ? '<root>' : error.instancePath;
  const details = Object.keys(error.params).length > 0 ? ` ${JSON.stringify(error.params)}` : '';
  return `${path} ${error.message ?? 'is invalid'}${details}`;
}

/** Validates `data` against `schema`, returning every violation found. */
export function validateSchema(schema: SchemaObject, data: unknown): SchemaValidationResult {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  const errors = (validate.errors ?? []).map(formatError);
  return { valid, errors };
}
