import { test, expect } from '../../src/fixtures/api.fixture';
import {
  expectBadRequest,
  expectNotFound,
  expectSuccessfulJson,
} from '../../src/api/assertions/api.assertions';
import { notFoundSchema, pagedListSchema, personDetailSchema, personSearchSchema } from '../../src/api/schemas';
import type {
  PersonProperties,
  SwapiDetail,
  SwapiPagedList,
  SwapiRecordList,
} from '../../src/api/types/swapi.types';
import {
  DEFAULT_PAGE_SIZE,
  KNOWN_PERSON,
  MALFORMED_JSON_BODY,
  NON_EXISTENT_ID,
  NON_NUMERIC_ID,
  UNMATCHED_SEARCH_TERM,
} from '../../src/data/swapi.data';
import { saveHappyPathBody } from '../../src/utils/happy-path-store';

test.describe('GET /people', () => {
  test('lista la primera página de personajes con paginación válida', async ({ swapi }) => {
    const response = await swapi.list('people');

    expectSuccessfulJson<SwapiPagedList>(response, pagedListSchema);
    expect(response.body.results).toHaveLength(DEFAULT_PAGE_SIZE);
    expect(response.body.previous).toBeNull();
    expect(response.body.next).toContain('page=2');
    expect(response.body.total_records).toBeGreaterThan(DEFAULT_PAGE_SIZE);

    await saveHappyPathBody('people-list', response);
  });

  test('devuelve el detalle completo de un personaje conocido', async ({ swapi }) => {
    const response = await swapi.getById('people', KNOWN_PERSON.id);

    expectSuccessfulJson<SwapiDetail<PersonProperties>>(response, personDetailSchema);
    expect(response.body.result.uid).toBe(KNOWN_PERSON.id);
    expect(response.body.result.properties.name).toBe(KNOWN_PERSON.name);
    expect(response.body.result.properties.url).toContain(`/people/${KNOWN_PERSON.id}`);

    await saveHappyPathBody('people-detail', response);
  });

  test('responde una lista vacía cuando la búsqueda por nombre no coincide', async ({ swapi }) => {
    const response = await swapi.list('people', { name: UNMATCHED_SEARCH_TERM });

    expectSuccessfulJson<SwapiRecordList<PersonProperties>>(response, personSearchSchema);
    expect(response.body.result).toHaveLength(0);
  });

  test('responde 404 para un id inexistente', async ({ swapi }) => {
    const response = await swapi.getById('people', NON_EXISTENT_ID);

    expectNotFound(response, notFoundSchema);
  });

  test('responde 404 para un id con formato inválido', async ({ swapi }) => {
    const response = await swapi.getById('people', NON_NUMERIC_ID);

    expectNotFound(response, notFoundSchema);
  });

  test('responde 400 ante un body JSON malformado', async ({ swapi }) => {
    const response = await swapi.postRaw('people', MALFORMED_JSON_BODY);

    expectBadRequest(response);
  });
});
