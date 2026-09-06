import type { SchemaObject } from 'ajv';

/**
 * Building blocks shared by every swapi.tech schema.
 *
 * Schemas are intentionally strict (`additionalProperties: false`) so that a
 * new or renamed field in the public API is caught as a contract change
 * instead of silently passing.
 */

export const metaProperties: Readonly<Record<string, SchemaObject>> = {
  apiVersion: { type: 'string', minLength: 1 },
  timestamp: { type: 'string', format: 'date-time' },
  support: {
    type: 'object',
    properties: { contact: { type: 'string', format: 'email' } },
    required: ['contact'],
    additionalProperties: false,
  },
};

export const META_REQUIRED: readonly string[] = ['apiVersion', 'timestamp', 'support'];

/** `https://www.swapi.tech/api/<resource>/<id>` style reference. */
export const resourceUrl: SchemaObject = {
  type: 'string',
  format: 'uri',
  pattern: '^https://www\\.swapi\\.tech/api/[a-z]+/\\d+$',
};

export const resourceUrlList: SchemaObject = { type: 'array', items: resourceUrl };

/** ISO-8601 date-time string, e.g. `2026-09-05T21:13:03.280Z`. */
export const isoDateTime: SchemaObject = { type: 'string', format: 'date-time' };

/** Non-empty string; swapi stores most numeric attributes as strings ("172"). */
export const nonEmptyString: SchemaObject = { type: 'string', minLength: 1 };

/** Numeric identifier serialised as a string ("1", "42"). */
export const numericId: SchemaObject = { type: 'string', pattern: '^\\d+$' };

/** Envelope for paginated collections: `/people`, `/planets`. */
export const pagedListSchema: SchemaObject = {
  type: 'object',
  properties: {
    message: { type: 'string', const: 'ok' },
    total_records: { type: 'integer', minimum: 0 },
    total_pages: { type: 'integer', minimum: 1 },
    previous: { type: ['string', 'null'], format: 'uri' },
    next: { type: ['string', 'null'], format: 'uri' },
    results: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: { uid: numericId, name: nonEmptyString, url: resourceUrl },
        required: ['uid', 'name', 'url'],
        additionalProperties: false,
      },
    },
    ...metaProperties,
  },
  required: [
    'message',
    'total_records',
    'total_pages',
    'previous',
    'next',
    'results',
    ...META_REQUIRED,
  ],
  additionalProperties: false,
};

/** Full record wrapper: `{ properties, _id, description, uid, __v }`. */
export function recordSchema(properties: SchemaObject): SchemaObject {
  return {
    type: 'object',
    properties: {
      properties,
      _id: nonEmptyString,
      description: nonEmptyString,
      uid: numericId,
      __v: { type: 'integer', minimum: 0 },
    },
    required: ['properties', '_id', 'description', 'uid', '__v'],
    additionalProperties: false,
  };
}

/** Envelope for a single record: `/people/:id`, `/planets/:id`, `/films/:id`. */
export function detailSchema(properties: SchemaObject): SchemaObject {
  return {
    type: 'object',
    properties: {
      message: { type: 'string', const: 'ok' },
      result: recordSchema(properties),
      ...metaProperties,
    },
    required: ['message', 'result', ...META_REQUIRED],
    additionalProperties: false,
  };
}

/** Envelope for a list of full records: `/films`, and `?name=` / `?title=` searches. */
export function recordListSchema(properties: SchemaObject, minItems = 0): SchemaObject {
  return {
    type: 'object',
    properties: {
      message: { type: 'string', const: 'ok' },
      result: { type: 'array', minItems, items: recordSchema(properties) },
      ...metaProperties,
    },
    required: ['message', 'result', ...META_REQUIRED],
    additionalProperties: false,
  };
}

/**
 * 404 envelope. `/planets/:id` returns the key misspelled as `messsage`;
 * `anyOf` accepts either spelling so the defect is visible in the schema
 * rather than silently tolerated by a loose `additionalProperties: true`.
 */
export const notFoundSchema: SchemaObject = {
  type: 'object',
  properties: {
    message: nonEmptyString,
    messsage: nonEmptyString,
    ...metaProperties,
  },
  required: [...META_REQUIRED],
  // Ajv strict mode needs the property declared inside each branch that requires it.
  anyOf: [
    { properties: { message: nonEmptyString }, required: ['message'] },
    { properties: { messsage: nonEmptyString }, required: ['messsage'] },
  ],
  additionalProperties: false,
};
