import { test, expect } from '../../src/fixtures/api.fixture';
import {
  expectBadRequest,
  expectNotFound,
  expectSuccessfulJson,
} from '../../src/api/assertions/api.assertions';
import { filmDetailSchema, filmListSchema, filmSearchSchema, notFoundSchema } from '../../src/api/schemas';
import type {
  FilmProperties,
  SwapiDetail,
  SwapiRecordList,
} from '../../src/api/types/swapi.types';
import {
  KNOWN_FILM,
  MALFORMED_JSON_BODY,
  NON_EXISTENT_ID,
  NON_NUMERIC_ID,
  UNMATCHED_SEARCH_TERM,
} from '../../src/data/swapi.data';
import { saveHappyPathBody } from '../../src/utils/happy-path-store';

/** The saga has six canonical films in swapi.tech. */
const EXPECTED_FILM_COUNT = 6;

test.describe('GET /films', () => {
  test('lista todas las películas con sus propiedades completas', async ({ swapi }) => {
    const response = await swapi.list('films');

    expectSuccessfulJson<SwapiRecordList<FilmProperties>>(response, filmListSchema);
    expect(response.body.result).toHaveLength(EXPECTED_FILM_COUNT);

    const episodes = response.body.result.map((film) => film.properties.episode_id);
    expect(new Set(episodes).size, 'episode ids are unique').toBe(EXPECTED_FILM_COUNT);

    await saveHappyPathBody('films-list', response);
  });

  test('devuelve el detalle completo de una película conocida', async ({ swapi }) => {
    const response = await swapi.getById('films', KNOWN_FILM.id);

    expectSuccessfulJson<SwapiDetail<FilmProperties>>(response, filmDetailSchema);
    expect(response.body.result.uid).toBe(KNOWN_FILM.id);
    expect(response.body.result.properties.title).toBe(KNOWN_FILM.name);
    expect(response.body.result.properties.characters.length).toBeGreaterThan(0);

    await saveHappyPathBody('films-detail', response);
  });

  test('responde una lista vacía cuando la búsqueda por título no coincide', async ({ swapi }) => {
    const response = await swapi.list('films', { title: UNMATCHED_SEARCH_TERM });

    expectSuccessfulJson<SwapiRecordList<FilmProperties>>(response, filmSearchSchema);
    expect(response.body.result).toHaveLength(0);
  });

  test('responde 404 para un id inexistente', async ({ swapi }) => {
    const response = await swapi.getById('films', NON_EXISTENT_ID);

    expectNotFound(response, notFoundSchema);
  });

  test('responde 404 para un id con formato inválido', async ({ swapi }) => {
    const response = await swapi.getById('films', NON_NUMERIC_ID);

    expectNotFound(response, notFoundSchema);
  });

  test('responde 400 ante un body JSON malformado', async ({ swapi }) => {
    const response = await swapi.postRaw('films', MALFORMED_JSON_BODY);

    expectBadRequest(response);
  });
});
