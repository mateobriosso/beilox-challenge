import type { SchemaObject } from 'ajv';
import {
  detailSchema,
  isoDateTime,
  nonEmptyString,
  recordListSchema,
  resourceUrl,
  resourceUrlList,
} from './common.schema';

/** `result.properties` of a film. */
export const filmPropertiesSchema: SchemaObject = {
  type: 'object',
  properties: {
    title: nonEmptyString,
    episode_id: { type: 'integer', minimum: 1 },
    opening_crawl: nonEmptyString,
    director: nonEmptyString,
    producer: nonEmptyString,
    release_date: { type: 'string', format: 'date' },
    characters: resourceUrlList,
    planets: resourceUrlList,
    starships: resourceUrlList,
    vehicles: resourceUrlList,
    species: resourceUrlList,
    created: isoDateTime,
    edited: isoDateTime,
    url: resourceUrl,
  },
  required: [
    'title',
    'episode_id',
    'opening_crawl',
    'director',
    'producer',
    'release_date',
    'characters',
    'planets',
    'starships',
    'vehicles',
    'species',
    'created',
    'edited',
    'url',
  ],
  additionalProperties: false,
};

export const filmDetailSchema: SchemaObject = detailSchema(filmPropertiesSchema);
/** `/films` is not paginated: it returns every film as a full record. */
export const filmListSchema: SchemaObject = recordListSchema(filmPropertiesSchema, 1);
export const filmSearchSchema: SchemaObject = recordListSchema(filmPropertiesSchema);
