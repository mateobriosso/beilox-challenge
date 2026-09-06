# [centraldepasajes.com.ar] El buscador acepta la misma estación como origen y destino

**Tipo:** brecha de validación de UI en el sitio de referencia (evidencia para el equipo; no es un bug de este repo).

## Observado

1. En el home, elegir **Buenos Aires. Terminal Retiro** como origen.
2. Al abrirse el selector de destino, la misma estación sigue disponible y se puede elegir.
3. Completar fecha y presionar **Buscar**: el formulario no muestra ningún error (Parsley
   solo valida campos vacíos) y navega a
   `https://www.centraldepasajes.com.ar/cdp/pasajes-micro/retiro-buenos-aires/retiro-buenos-aires?FIda=09/13/2026&CntPas=1`.
4. La página de resultados responde con el modal genérico "¡Ups! No encontramos opciones para
   tu viaje. Intentá con otra fecha, origen o destino", y el `<title>` queda
   "Comprar pasajes baratos Retiro - Buenos Aires → Retiro - Buenos Aires".

Verificado con Playwright MCP: el árbol de accesibilidad de esa página contiene el `dialog`
sin resultados y ningún mensaje que indique que origen y destino son iguales.
Captura: `docs/evidence/ui-same-station-accepted.png`.

## Esperado

Validar en el formulario, antes de enviar, que origen y destino sean distintos (o filtrar la
estación ya elegida del selector de destino), con un mensaje específico. Un viaje con el mismo
origen y destino nunca puede tener servicios, así que el round-trip al servidor y el mensaje
genérico solo confunden.

## Impacto

- Experiencia: el usuario recibe "intentá con otra fecha" cuando el problema es la ruta.
- Costo: una búsqueda al backend que siempre va a devolver vacío.
- SEO: se generan URLs indexables `/<slug>/<slug>` sin contenido.

## Cómo lo cubre la suite

`tests/ui/search.spec.ts`, test "acepta origen y destino iguales y solo lo informa como
búsqueda sin opciones", dentro del grupo *datos inválidos*. El test documenta el comportamiento
actual (formulario acepta, resultados muestran el modal) en lugar del deseado; si el sitio
agrega la validación, el test falla y avisa que hay que reescribirlo como validación de
formulario.

## Reproducción

1. Abrir https://www.centraldepasajes.com.ar.
2. Origen: "Buenos Aires. Terminal Retiro". Destino: la misma estación. Fecha: cualquier día futuro.
3. Buscar. Observar que no hay validación y aparece el modal "¡Ups!".
