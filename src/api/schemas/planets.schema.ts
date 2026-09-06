import type { SchemaObject } from 'ajv';
import {
  detailSchema,
  isoDateTime,
  nonEmptyString,
  recordListSchema,
  resourceUrl,
} from './common.schema';

/** `result.properties` of a planet. */
export const planetPropertiesSchema: SchemaObject = {
  type: 'object',
  properties: {
    name: nonEmptyString,
    diameter: nonEmptyString,
    rotation_period: nonEmptyString,
    orbital_period: nonEmptyString,
    gravity: nonEmptyString,
    population: nonEmptyString,
    climate: nonEmptyString,
    terrain: nonEmptyString,
    surface_water: nonEmptyString,
    created: isoDateTime,
    edited: isoDateTime,
    url: resourceUrl,
  },
  required: [
    'name',
    'diameter',
    'rotation_period',
    'orbital_period',
    'gravity',
    'population',
    'climate',
    'terrain',
    'surface_water',
    'created',
    'edited',
    'url',
  ],
  additionalProperties: false,
};

export const planetDetailSchema: SchemaObject = detailSchema(planetPropertiesSchema);
export const planetSearchSchema: SchemaObject = recordListSchema(planetPropertiesSchema);
