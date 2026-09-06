import type { SchemaObject } from 'ajv';
import {
  detailSchema,
  isoDateTime,
  nonEmptyString,
  recordListSchema,
  resourceUrl,
  resourceUrlList,
} from './common.schema';

/** `result.properties` of a person. */
export const personPropertiesSchema: SchemaObject = {
  type: 'object',
  properties: {
    name: nonEmptyString,
    height: nonEmptyString,
    mass: nonEmptyString,
    hair_color: nonEmptyString,
    skin_color: nonEmptyString,
    eye_color: nonEmptyString,
    birth_year: nonEmptyString,
    gender: nonEmptyString,
    homeworld: resourceUrl,
    films: resourceUrlList,
    vehicles: resourceUrlList,
    starships: resourceUrlList,
    created: isoDateTime,
    edited: isoDateTime,
    url: resourceUrl,
  },
  required: [
    'name',
    'height',
    'mass',
    'hair_color',
    'skin_color',
    'eye_color',
    'birth_year',
    'gender',
    'homeworld',
    'films',
    'vehicles',
    'starships',
    'created',
    'edited',
    'url',
  ],
  additionalProperties: false,
};

export const personDetailSchema: SchemaObject = detailSchema(personPropertiesSchema);
export const personSearchSchema: SchemaObject = recordListSchema(personPropertiesSchema);
