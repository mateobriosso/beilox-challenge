# beilox-challenge

[![Playwright Tests](https://github.com/mateobriosso/beilox-challenge/actions/workflows/playwright.yml/badge.svg)](https://github.com/mateobriosso/beilox-challenge/actions/workflows/playwright.yml)
[Última corrida manual verde](https://github.com/mateobriosso/beilox-challenge/actions/runs/34060337853) · [Issues abiertos por la suite](https://github.com/mateobriosso/beilox-challenge/issues)

Framework de automatización de pruebas con **Playwright + TypeScript** que cubre, en un mismo proyecto, pruebas de UI sobre [centraldepasajes.com.ar](https://www.centraldepasajes.com.ar) y pruebas de API sobre [swapi.tech](https://www.swapi.tech), con validación de schemas mediante Ajv y ejecución automática en GitHub Actions.

## Stack


| Herramienta                                                  | Uso                                                                                       |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `@playwright/test` 1.63                                      | Runner, browser (Chromium) y cliente HTTP                                                 |
| TypeScript 6 en modo `strict`                                | Tipado estricto, sin `any`                                                                |
| ESLint 10 + `typescript-eslint` + `eslint-plugin-playwright` | Reglas de calidad: sin `waitForTimeout`, promesas siempre esperadas, aserciones web-first |
| Ajv + `ajv-formats`                                          | Validación de schemas JSON de la API                                                      |
| GitHub Actions                                               | Quality gate en cada push/PR y corrida semanal programada                                 |


## Requisitos

- Node.js 20
- npm 10

## Instalación y ejecución

```bash
npm ci
npx playwright install --with-deps chromium

npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # UI + API
npm run test:ui     # solo proyecto ui-chromium
npm run test:api    # solo proyecto api
npm run report      # abre el último reporte HTML
```

Variables de entorno (opcionales, en un `.env` local que no se versiona):


| Variable              | Default                               | Descripción                                    |
| --------------------- | ------------------------------------- | ---------------------------------------------- |
| `UI_BASE_URL`         | `https://www.centraldepasajes.com.ar` | Sitio bajo prueba (UI)                         |
| `API_BASE_URL`        | `https://www.swapi.tech`              | API bajo prueba                                |
| `API_MAX_RESPONSE_MS` | `8000`                                | Presupuesto de tiempo de respuesta por request |


Los defaults viven en `src/utils/env.ts`, así que la suite corre sin `.env` (por ejemplo en CI).

## Estructura del proyecto

```
src/
  api/
    clients/        SwapiClient: construye URLs, mide tiempo de respuesta, parsea el body
    schemas/        Schemas Ajv por recurso + envelopes comunes
    assertions/     expectSuccessfulJson / expectNotFound / expectBadRequest
    types/          Interfaces TS de las respuestas (contraparte tipada de los schemas)
  pages/
    base.page.ts
    search/         search.selectors.ts | search.page.ts | search.assertions.ts
    results/        results.selectors.ts | results.page.ts | results.assertions.ts
  fixtures/         test.extend para inyectar page objects y el cliente de API
  data/             Datos de prueba: rutas, estaciones, ids conocidos, mensajes esperados
                    + known-defects.ts: registro de los defectos abiertos que la suite tolera
  utils/            env, fechas, validador Ajv, persistencia del happy path
  reporters/        Reporters custom: tiempos de respuesta por test y defectos conocidos tolerados,
                    ambos con resumen en el job summary de Actions
tests/
  ui/search.spec.ts
  api/people.spec.ts | planets.spec.ts | films.spec.ts
resource/api/       Body de cada happy path guardado como JSON
docs/ai-usage.md    Registro de cada interacción con el asistente de IA
docs/evidence/      Capturas y cuerpos de los issues reportados durante el challenge
```

**Page Object Model en tres capas.** Cada página se divide en `*.selectors.ts` (solo CSS), `*.page.ts` (acciones y locators, con esperas web-first) y `*.assertions.ts` (expectativas expresadas en términos del criterio de búsqueda). Los specs no conocen selectores.

**Idiomas.** El README, los títulos de los tests y los issues están en español porque son lo que lee el equipo y el reporte. El código, los comentarios, los mensajes de commit y `docs/ai-usage.md` están en inglés, que es la convención del repo desde el primer commit.

## Cobertura

### UI (`tests/ui/search.spec.ts`, 8 tests)


| Escenario       | Qué valida                                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Búsqueda válida | URL con origen, destino, `FIda` y `CntPas`; encabezado; fecha activa; pasajeros; cada tarjeta coincide con la ruta y tiene horarios y precio                              |
| Sin resultados  | Modal "No encontramos opciones", lista de servicios oculta                                                                                                                |
| Datos inválidos | Formulario vacío bloqueado con mensajes de Parsley; ciudad inexistente sin sugerencias; fecha pasada deshabilitada en el calendario; misma estación como origen y destino |
| Volver atrás    | Al volver desde resultados el formulario conserva origen, destino, fecha y pasajeros                                                                                      |


### Defectos conocidos: por qué la suite está verde con 3 bugs abiertos

Verde no significa "no hay bugs", significa "todo salió como lo declaramos". Los tres defectos encontrados ([#1](https://github.com/mateobriosso/beilox-challenge/issues/1), [#2](https://github.com/mateobriosso/beilox-challenge/issues/2), [#3](https://github.com/mateobriosso/beilox-challenge/issues/3)) están cubiertos con dos mecanismos distintos:

- **`test.fail` (#1 y #2).** La aserción sigue exigiendo el comportamiento *correcto*; el modificador invierte el contrato, así que el test falla a propósito y el runner lo cuenta como `expected`. El día que lo arreglen, el test pasa, Playwright lo reporta como **unexpected success** y la corrida se pone roja: es un tripwire que avisa cuándo retirar la tolerancia.
- **Test que documenta el comportamiento actual (#3).** Asevera lo que el sitio hace hoy (acepta origen = destino y responde con el modal genérico). Pasa en verde mientras el bug exista y se pone rojo cuando lo corrijan.

El riesgo de esto es que el tally diga "27 passed" y nadie se entere de que hay tres defectos abiertos. Por eso cada uno de esos tests se anota con `annotateKnownDefect(...)` desde el registro `src/data/known-defects.ts`, y `src/reporters/known-defects.reporter.ts` cierra toda corrida con:

```
Known defects tolerated by this run: 3 (#1, #2, #3)
┌───┬──────────────────────────────┬─────────────────────────────────────────────────┬────────────┐
│ 0 │ GET /planets › el 404 ...    │ #1 — swapi.tech: ... [expected-failure]         │ 'expected' │
│ 1 │ sin resultados › mantiene .. │ #2 — centraldepasajes.com.ar: ... [expected-... │ 'expected' │
│ 2 │ datos inválidos › acepta ... │ #3 — centraldepasajes.com.ar: ... [documents-.. │ 'expected' │
└───┴──────────────────────────────┴─────────────────────────────────────────────────┴────────────┘
```

En CI la misma tabla se publica en el job summary, y si alguno pasa a `unexpected` el reporter agrega *"no longer reproduce — close the issue and drop the workaround"*. Así el verde sigue siendo verde, pero declara qué está tolerando en vez de esconderlo.

### API (`tests/api/*.spec.ts`, 19 tests)

Por cada recurso (`/people`, `/planets`, `/films`): listado, detalle por id, búsqueda sin coincidencias, 404 por id inexistente y 400 por body JSON malformado. Cada test valida status code, `content-type`, tiempo de respuesta contra `API_MAX_RESPONSE_MS` y schema con Ajv.

El body de cada happy path se guarda en `resource/api/<recurso>-<tipo>.json` junto con el request y el status. El archivo solo se reescribe si el contrato cambió (se ignora el `timestamp` del servidor), así los diffs en git son señal y no ruido.

Hallazgo documentado: el 404 de `/planets/:id` devuelve la clave `messsage` (con typo). El schema lo acepta de forma explícita y un test bajo `test.fail` vigila el schema correcto.

## CI/CD

El workflow `.github/workflows/playwright.yml`:

- Corre en cada `push` y `pull_request` sobre `master` como quality gate.
- Corre **todos los lunes a las 15:00 (Argentina, GMT-3)**: cron `0 18 * * 1` en UTC, documentado en el propio YAML. Argentina no tiene horario de verano, así que no hay deriva.
- Se puede disparar a mano con `workflow_dispatch`.
- Pasos: checkout, Node 20 con cache de npm, `npm ci`, lint, typecheck, instalación de Chromium, `npm test` con `CI=true`.
- Publica siempre tres artefactos: `playwright-report`, `test-results` (traces, videos, JSON y JUnit) y `happy-path-json` con los contratos generados en `resource/api`.
- Permisos mínimos (`contents: read`), timeout de 30 minutos y `concurrency` por branch.

### Cómo escalar el workflow cuando la suite crezca

1. **Separar UI y API en jobs independientes.** Hoy corren en el mismo job para mantenerlo simple. Con más tests, el job de API (rápido, sin browser) debería reportar solo, y el de UI no debería bloquear la lectura de los resultados de API cuando el sitio público tiene un mal día.
2. **Sharding del proyecto UI.** Playwright soporta `--shard=i/n`; con una matriz de 3 o 4 shards y el reporter `blob` (ya configurado) se fusiona todo en un solo reporte HTML con `playwright merge-reports`. El tiempo total pasa a ser el del shard más lento.
3. **Cache del browser.** Cachear `~/.cache/ms-playwright` por versión de Playwright ahorra alrededor de un minuto por job.
4. **Suites por intención.** Etiquetar tests con `@smoke` y `@regression`: el push/PR corre solo smoke (minutos), la corrida semanal y la nightly corren regresión completa.
5. **Corridas por proyecto y por browser.** Sumar `firefox` y `webkit` como proyectos de Playwright y dejarlos únicamente en la corrida programada, no en el gate de cada PR.
6. **Mantener el gate honesto.** A medida que crece, el riesgo es que el gate se vuelva lento y la gente lo ignore. Preferiría un gate corto y estricto más una regresión larga con dueño claro, antes que un único job de 40 minutos.

## Uso del asistente de IA

Todas las interacciones con el asistente (Claude Code) están registradas en [`docs/ai-usage.md`](docs/ai-usage.md): qué se pidió, qué hizo, qué decisiones tomó y cómo se
verificó cada etapa.

**Cómo lo usé, en resumen.** El asistente hizo el reconocimiento inicial de ambos targets (curl sobre swapi.tech, scripts de Playwright sobre el buscador), propuso la estructura del framework y escribió la primera versión de page objects, schemas y specs. Yo fijé las reglas del juego antes (sin `any`, sin `waitForTimeout`, POM en tres capas, fixtures con `test.extend`, log de cada interacción), revisé cada entrega contra esas reglas y contra el sitio real, y tomé las decisiones de criterio que se listan más abajo. Cada sesión termina con lint, typecheck y la suite en verde antes de commitear.

### MCP servers utilizados

**Playwright MCP** (`@playwright/mcp`). Lo usé para contrastar los selectores del POM contra el árbol de accesibilidad real del sitio, que es lo que un usuario con lector de pantalla y Playwright "ven". Dos hallazgos concretos que cambiaron cómo justifico los selectores:

- Los `input` nativos de origen y destino están `aria-hidden`; el control accesible es un `combobox` cuyo nombre es la estación seleccionada, así que `getByRole('combobox', { name })` no sirve como ancla estable. El `aria-labelledby` fijo de Select2 sí, y es lo que usa `search.selectors.ts`.
- El select de pasajeros no tiene nombre accesible (el label no está asociado), por eso queda anclado por ID. El botón sí es `button "Buscar"`, y el modal sin resultados es un `dialog` real: ambos podrían migrar a `getByRole` sin tocar nada fuera del archivo de selectores.

En la página sin resultados el árbol no contiene ningún `heading` de nivel 1, lo que confirma el defecto del `h1` vacío que vigila un `test.fail`. Captura en [`docs/evidence/ui-no-results-empty-heading.png`](docs/evidence/ui-no-results-empty-heading.png).

**GitHub MCP** (`https://api.githubcopilot.com/mcp/`). Lo usé para el circuito de defectos: los tres hallazgos de la exploración están cargados como issues del repo con la evidencia de `docs/evidence/`, y desde la sesión del asistente los leo y verifico sin salir del contexto en el que se reprodujeron. Llamadas concretas: `get_me` para confirmar con qué cuenta actúa la sesión, `list_issues` para chequear que [#1 typo `messsage` en swapi.tech](https://github.com/mateobriosso/beilox-challenge/issues/1), [#2 `h1` vacío en centraldepasajes.com.ar](https://github.com/mateobriosso/beilox-challenge/issues/2) y [#3 el buscador acepta la misma estación como origen y destino](https://github.com/mateobriosso/beilox-challenge/issues/3) siguen abiertos con sus labels, y `issue_read` sobre cada uno para contrastar el cuerpo del issue contra el test que lo cubre. Ese cruce es la parte que importa: un issue cuyo paso de reproducción ya no coincide con lo que asevera la suite es un issue que miente.

El valor real frente a hacerlo a mano es que el asistente puede cerrar el lazo en un solo turno: corre la suite, ve que el `test.fail` de #2 sigue fallando (o sea que el defecto sigue vivo), y lo confirma contra el estado del issue. La autenticación va por `Authorization: Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}` en `.mcp.json`, con el token en el entorno y nunca en el repo.

### Un caso donde decidí no usar el asistente

Decidir qué es un defecto y qué es comportamiento esperado. Durante la exploración aparecieron tres anomalías: el 404 de `/planets/:id` en swapi.tech devuelve la clave `messsage` con typo, la página de resultados renderiza el `h1` vacío cuando no hay servicios, y el formulario acepta la misma estación como origen y destino. El asistente propuso relajar las aserciones para que la suite quedara en verde. Ahí fue que tomé la decisión de reproducir los casos a mano en el browser y con curl, definí cuáles son defectos reales y los codifiqué como `test.fail` con un comentario fechado, para que la suite se ponga en rojo a propósito. Lo que se tolera, marca y cómo se comunica es criterio del QA (junto a los estándares que el equipo haya definido previamente), y nunca algo en lo que se haga outsourcing de la responsabilidad. Porque define lo que el equipo va a leer como "PASS", y tengo que poder defenderlo cuando alguien levante la bandera.

### MCP server propuesto: PostgreSQL

No lo usé en el challenge porque los dos targets son sistemas públicos de solo lectura. En el proyecto interno, la mayoría de los bugs E2E que persigo son del tipo "la UI dijo OK pero la fila no se escribió" o "los datos de prueba se corrieron". Un MCP server de base de datos (`@modelcontextprotocol/server-postgres` o el de Supabase) apuntado al ambiente de QA le permitiría al asistente, desde la misma sesión en la que maneja Playwright:

- Sembrar y limpiar datos de prueba con queries parametrizadas en lugar de mantener fixtures SQL a mano, para que cada spec arranque de un estado conocido.
- Agregar aserciones de persistencia a los flujos de UI: después de una búsqueda o una compra, consultar la tabla y compararla con lo que mostró la página, detectando defectos que un test solo de DOM no ve.
- Explicar fallos intermitentes más rápido, inspeccionando las filas reales detrás del escenario que falló.

Con credenciales de solo lectura para el asistente, escritura únicamente a través de un script de seeding revisado, y nunca contra producción.

## Qué dejé afuera y por qué

- **Un solo browser (Chromium).** El challenge no pide cross-browser y el sitio es server-rendered; Firefox y WebKit sumarían tiempo de CI sin cubrir riesgo nuevo hoy. Quedan como proyectos a agregar en la corrida programada (ver "Cómo escalar el workflow").
- **Un solo job de CI.** Con 27 tests el job entero tarda menos de dos minutos; separar UI y API en jobs o shards es la primera mejora cuando crezca, y está explicada arriba en lugar de implementada.
- **Tags `@smoke` / `@regression`.** Con una sola spec de UI no hay nada que filtrar todavía. Se introducen cuando exista una suite que tarde más que el gate que el equipo tolere.
- **Mock de la respuesta "sin resultados".** La página de resultados se renderiza en el servidor, no hay XHR que interceptar con `page.route()`. El escenario usa una ruta real sin servicios (Tres Arroyos → Ushuaia), que depende del inventario de un tercero; si algún día aparece un servicio, el test avisa y se cambia la ruta en `src/data/routes.data.ts`.
- **Validación origen = destino.** El sitio no la tiene (issue #3). El test documenta el comportamiento actual en lugar de exigir el deseado, porque el objetivo de la suite es describir el sitio de referencia, no reescribirlo.
- **`.env.example`.** Los valores por defecto viven en `src/utils/env.ts` y las variables están documentadas en este README, así que el archivo de ejemplo era redundante. En un proyecto con credenciales reales lo agregaría.
- **Schemas tolerantes.** Elegí `additionalProperties: false` para que un campo nuevo en swapi.tech se vea como cambio de contrato. La alternativa tolerante rompe menos pero informa menos; es una política, no un olvido.
- **`JSONSchemaType<T>` de Ajv.** Usé `SchemaObject` más interfaces TypeScript separadas. Se pierde la garantía de que schema e interfaz coincidan en compile time, a cambio de schemas legibles y sin pelear con `exactOptionalPropertyTypes`.
- **Atlassian MCP.** Está configurado en `.mcp.json` desde el bootstrap, pero no lo usé: no tengo un Jira de referencia para este challenge y el flujo de bugs quedó en GitHub Issues.

## Preguntas teóricas

### 1. Escalabilidad: la suite creció a 500 tests

Primero separaría por dominio funcional, no por tipo técnico: `tests/ui/search/`, `tests/ui/checkout/`, `tests/api/people/`, con sus page objects y datos al lado. Después agregaría etiquetas (`@smoke`, `@regression`, `@slow`) para que el gate de PR corra en minutos y la regresión completa quede para la corrida programada. Los fixtures pasarían a componerse (un `test` base con autenticación, otro con datos sembrados) en vez de un único `test.extend` que lo sabe todo. También pondría un límite claro: ningún spec de más de 10 tests, ningún page object de más de 200 líneas (cuando sean más, se divide el archivo). Con 500 tests el problema ya no es escribir tests, es que alguien pueda encontrar el que falló y entenderlo rápido.

### 2. Flakiness: un test intermitente sin cambios en el código

Primero lo corro en loop (`--repeat-each=20`) con trace activado para separar "a veces" de "siempre bajo cierta condición". Con la trace miro qué cambió entre la corrida que pasó y la que falló: tiempo de respuesta del backend, un elemento que se re-renderiza después de que el locator lo encontró, una animación, datos compartidos con otro test que corre en paralelo. Las causas más frecuentes son una espera implícita mal planteada (arreglo: aserción web-first sobre el estado final, no sobre el intermedio), estado compartido (arreglo: aislar datos por worker) o un ambiente inestable (arreglo: reintento acotado y alerta, no ocultar). Recién si la causa es externa y no puedo controlarla, lo marco con `test.fixme` con fecha, dueño y ticket. Un skip sin esas tres cosas es deuda invisible.

### 3. POM: cambia el selector del botón "Buscar"

Un solo archivo: `src/pages/search/search.selectors.ts`, la clave `submit` (hoy `#btnCons`). El otro `search.page.ts` la consume como `sel.submit` para construir el locator, y los specs solo llaman a `searchPage.submit()` o `searchPage.search(criteria)`. Ni las acciones ni las aserciones ni los tests conocen el CSS. Ese era el objetivo de separar selectores, acciones y aserciones: que un cambio de markup sea un diff de una línea.

### 4. AI assistant: uso responsable

Que un test pase al primer intento me dice poco; lo primero que chequeo es que **falle cuando debe fallar**: cambio el dato esperado o rompo el selector y confirmo que se pone en rojo por la razón correcta. Después reviso que las aserciones prueben lo que dice el título (un test "valida resultados coherentes" que solo mira que haya tarjetas no vale), que no haya esperas fijas ni `any` escondidos, que los datos de prueba no sean inventados (el asistente tiende a poner ids o textos plausibles que no existen) y que el código respete la estructura del proyecto en lugar de crear una nueva. El caso concreto en el que decidí no usarlo está en la sección "Un caso donde decidí no usar el asistente".

### 5. Criterio del rol: lo que un QA Senior no puede delegar

- **Definir el oráculo.** Decidir cuál es el comportamiento correcto cuando el enunciado, el sitio y la API se contradicen. Acá: si el `h1` vacío es bug o feature, si `messsage` se tolera o se reporta.
- **Decidir qué se testea y qué no.** Elegir los escenarios que cubren riesgo real en lugar de los que son fáciles de automatizar. El asistente genera 20 tests de un formulario en un minuto; saber que solo 4 importan es el trabajo.
- **Ser dueño del "verde".** Cuando la suite pasa, alguien tiene que poder afirmar qué significa eso para el release. Un `test.fail` o un retry mal puestos convierten el verde en una mentira, y la responsabilidad de esa afirmación no se delega.
- **La conversación con el equipo.** Reportar un defecto con contexto, negociar prioridad, explicar por qué un test es flaky y qué cuesta arreglarlo.

### 6. CI/CD: los tests fallan cada lunes a las 15:00 por un problema de red

Primero confirmo que es un problema de la red y no un patrón. Miro las traces de tres lunes seguidos y verifico que el fallo sea siempre de conexión o timeout, nunca de aserción. Si es transitorio, aplico en este orden: (1) `retries: 1` solo en CI y solo para el proyecto UI, ya configurado, para absorber cortes de segundos; (2) distinguir en el reporte fallo de infraestructura de fallo de producto, por ejemplo con un test de humo previo que valide que el ambiente responde, y si ese
falla, el run se marca como "ambiente caído" y no como "suite roja"; (3) alertar al equipo con ese contexto, no con un rojo genérico, porque un rojo que todos aprenden a ignorar es peor que ninguno. Lo que no haría es descartar la corrida en silencio ni subir los retries hasta que pase: si el ambiente falla todos los lunes a la misma hora, eso también es un hallazgo y hay que llevárselo a quien lo opera.