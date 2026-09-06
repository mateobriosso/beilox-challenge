# [centraldepasajes.com.ar] La página de resultados sin servicios renderiza el `h1` de la ruta vacío

**Tipo:** defecto de UI en el sitio de referencia (evidencia para el equipo; no es un bug de este repo).

## Observado

En `https://www.centraldepasajes.com.ar/cdp/pasajes-micro/tres-arroyos/ushuaia?FIda=09/13/2026&CntPas=1`
(ruta sin servicios) el markup es:

```html
<h1 class="d-flex city-names">
  <span class="salida ellipsis"> </span>
  <span class="arrow">…</span>
  <span class="llegada ellipsis"> </span>
</h1>
```

El `<title>` sí nombra la ruta ("Comprar pasajes baratos Tres Arroyos → Ushuaia") y el
modal "¡Ups! No encontramos opciones para tu viaje" se muestra correctamente.

Verificado con Playwright MCP: el árbol de accesibilidad de esa página no contiene ningún
`heading` de nivel 1. Captura: `docs/evidence/ui-no-results-empty-heading.png`.

## Esperado

El encabezado debería mostrar "Tres Arroyos → Ushuaia" igual que en una búsqueda con
resultados, para que el usuario confirme qué buscó antes de reintentar.

## Impacto

- Usuarios con lector de pantalla no tienen un heading principal en la página.
- SEO: `h1` vacío en todas las combinaciones origen/destino sin servicio.

## Cómo lo cubre la suite

`tests/ui/search.spec.ts`, test "mantiene el encabezado con la ruta buscada aunque no haya
servicios", marcado con `test.fail` y comentario fechado. Cuando el sitio lo corrija, el
test pasa y Playwright lo marca como fallo inesperado.

## Reproducción

1. Abrir la URL de arriba (o buscar Tres Arroyos → Ushuaia con cualquier fecha).
2. Inspeccionar `h1.city-names`: ambos `span` están vacíos.
