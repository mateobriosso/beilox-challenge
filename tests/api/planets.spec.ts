import { test, expect } from '../../src/fixtures/api.fixture';
import {
  expectBadRequest,
  expectNotFound,
  expectSuccessfulJson,
} from '../../src/api/assertions/api.assertions';
import {
  canonicalNotFoundSchema,
  notFoundSchema,
  pagedListSchema,
  planetDetailSchema,
  planetSearchSchema,
} from '../../src/api/schemas';
import type {
  PlanetProperties,
  SwapiDetail,
  SwapiNotFound,
  SwapiPagedList,
  SwapiRecordList,
} from '../../src/api/types/swapi.types';
import {
  DEFAULT_PAGE_SIZE,
  KNOWN_PLANET,
  MALFORMED_JSON_BODY,
  NON_EXISTENT_ID,
  UNMATCHED_SEARCH_TERM,
} from '../../src/data/swapi.data';
import { saveHappyPathBody } from '../../src/utils/happy-path-store';
import { KNOWN_DEFECTS } from '../../src/data/known-defects';
import { annotateKnownDefect } from '../../src/utils/known-defects';

test.describe('GET /planets', () => {
  test('lista la primera página de planetas con paginación válida', async ({ swapi }) => {
    const response = await swapi.list('planets');

    expectSuccessfulJson<SwapiPagedList>(response, pagedListSchema);
    expect(response.body.results).toHaveLength(DEFAULT_PAGE_SIZE);
    expect(response.body.previous).toBeNull();
    expect(response.body.next).toContain('page=2');
    expect(response.body.total_records).toBeGreaterThan(DEFAULT_PAGE_SIZE);

    await saveHappyPathBody('planets-list', response);
  });

  test('devuelve el detalle completo de un planeta conocido', async ({ swapi }) => {
    const response = await swapi.getById('planets', KNOWN_PLANET.id);

    expectSuccessfulJson<SwapiDetail<PlanetProperties>>(response, planetDetailSchema);
    expect(response.body.result.uid).toBe(KNOWN_PLANET.id);
    expect(response.body.result.properties.name).toBe(KNOWN_PLANET.name);
    expect(response.body.result.properties.url).toContain(`/planets/${KNOWN_PLANET.id}`);

    await saveHappyPathBody('planets-detail', response);
  });

  test('filtra por nombre y devuelve solo el planeta buscado', async ({ swapi }) => {
    const response = await swapi.list('planets', { name: KNOWN_PLANET.name });

    expectSuccessfulJson<SwapiRecordList<PlanetProperties>>(response, planetSearchSchema);
    expect(response.body.result).toHaveLength(1);
    expect(response.body.result[0]?.properties.name).toBe(KNOWN_PLANET.name);
  });

  test('responde una lista vacía cuando la búsqueda por nombre no coincide', async ({ swapi }) => {
    const response = await swapi.list('planets', { name: UNMATCHED_SEARCH_TERM });

    expectSuccessfulJson<SwapiRecordList<PlanetProperties>>(response, planetSearchSchema);
    expect(response.body.result).toHaveLength(0);
  });

  test('responde 404 para un id inexistente', async ({ swapi }) => {
    const response = await swapi.getById('planets', NON_EXISTENT_ID);

    expectNotFound(response, notFoundSchema);
    // Known upstream defect: this endpoint spells the key as `messsage`.
    // The assertion documents the behaviour so a fix upstream is noticed.
    const body = response.body as SwapiNotFound;
    expect(body.messsage ?? body.message).toMatch(/not found/i);
  });

  test('el 404 debería usar la clave `message` como el resto de la API (defecto conocido)', async ({
    swapi,
  }) => {
    // Upstream defect observed 2026-09-06: the body is `{"messsage": "Not found", ...}`.
    // Expected failure keeps the suite green while making the contract explicit; the day
    // swapi.tech fixes the key this test "unexpectedly passes" and the annotation can go.
    annotateKnownDefect(KNOWN_DEFECTS.planetsNotFoundTypo);
    test.fail(true, 'swapi.tech /planets/:id misspells the 404 key as `messsage` (issue #1)');

    const response = await swapi.getById('planets', NON_EXISTENT_ID);

    expectNotFound(response, canonicalNotFoundSchema);
  });

  test('responde 400 ante un body JSON malformado', async ({ swapi }) => {
    const response = await swapi.postRaw('planets', MALFORMED_JSON_BODY);

    expectBadRequest(response);
  });
});
