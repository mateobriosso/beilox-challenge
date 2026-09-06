# [swapi.tech] 404 de `/api/planets/:id` devuelve la clave `messsage` (typo) en vez de `message`

**Tipo:** defecto de contrato en API externa (evidencia para el equipo; no es un bug de este repo).

## Observado

```
GET https://www.swapi.tech/api/planets/999999
HTTP 404
{"messsage":"Not found","apiVersion":"1.0","timestamp":"2026-09-06T17:21:38.791Z","support":{"contact":"admin@swapi.tech"}}
```

## Esperado

Misma clave que el resto de la API en 404:

```
GET https://www.swapi.tech/api/people/999999   → {"message":"not found", ...}
GET https://www.swapi.tech/api/films/999999    → {"message":"Film not found", ...}
```

## Impacto

Cualquier cliente que lea `body.message` para mostrar el error recibe `undefined` solo para
planetas. Un schema estricto compartido entre recursos falla en `/planets`.

## Cómo lo cubre la suite

- `src/api/schemas/common.schema.ts`: `notFoundSchema` acepta ambas claves con `anyOf`,
  de forma explícita y comentada.
- `tests/api/planets.spec.ts`: el test de 404 valida el schema tolerante y un segundo test
  bajo `test.fail` valida `canonicalNotFoundSchema` (solo `message`). El día que swapi lo
  corrija, ese test pasa y Playwright lo reporta como fallo inesperado, lo que avisa que se
  puede retirar la tolerancia.

## Reproducción

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://www.swapi.tech/api/planets/999999
curl -s https://www.swapi.tech/api/planets/999999
```
