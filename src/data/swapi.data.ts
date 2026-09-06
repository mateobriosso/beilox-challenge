/**
 * Known swapi.tech records used as happy-path anchors, plus the inputs that
 * trigger each expected error. Centralised so a data change never requires
 * touching a spec.
 */

export interface KnownRecord {
  readonly id: string;
  readonly name: string;
}

export const KNOWN_PERSON: KnownRecord = { id: '1', name: 'Luke Skywalker' };
export const KNOWN_PLANET: KnownRecord = { id: '1', name: 'Tatooine' };
export const KNOWN_FILM: KnownRecord = { id: '1', name: 'A New Hope' };

/** Identifier that no resource will ever have. */
export const NON_EXISTENT_ID = '999999';

/** Identifier with the wrong type; swapi.tech answers 404 rather than 400. */
export const NON_NUMERIC_ID = 'not-a-number';

/** Search term that matches nothing. */
export const UNMATCHED_SEARCH_TERM = 'zzz-no-such-record';

/** Syntactically invalid JSON body, rejected by the server's body parser with 400. */
export const MALFORMED_JSON_BODY = '{"name": "Luke"';

/** Default page size announced by the API. */
export const DEFAULT_PAGE_SIZE = 10;
