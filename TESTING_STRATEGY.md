# Estrategia de Characterization Tests

## Objetivo

La suite protege el comportamiento HTTP observado del monolito sin definir un comportamiento “correcto”. Los `200`, `201`, `403` y `500` legacy, mensajes, cuerpos y headers actuales se almacenan como línea base. Un error existente que cambie también rompe el snapshot y exige una decisión explícita.

No se modificó código productivo para facilitar las pruebas.

## Alcance

El inventario ejecutable contiene las **134 rutas montadas** bajo `/api`:

| Área | Rutas montadas |
| --- | ---: |
| Root | 1 |
| User | 34 |
| Category | 10 |
| Product | 23 |
| Question | 8 |
| Denounce | 1 |
| Notification | 3 |
| Buy, incluidos endpoints Payment | 39 |
| Bank | 4 |
| Account | 4 |
| Invest | 1 |
| Chat | 6 |

Payment declara además nueve rutas en su router modular. Hoy `src/router.js` no monta `/api/payment`; esas nueve declaraciones se validan como contrato y sus handlers HTTP se caracterizan en sus paths realmente expuestos bajo `/api/buy`.

La suite contiene **222 pruebas** y **134 snapshots de respuestas HTTP**, además del snapshot completo del inventario de rutas.

## Estructura

```text
tests/
  characterization/
    user/
    product/
    buy/
    payment/
    question/
    notification/
    legacy/
    route-inventory.test.js
  factories/
    request.factory.js
  fixtures/
  helpers/
    characterizeModule.js
    externalServices.js
    normalizeResponse.js
    routeInventory.js
    setup.js
    testApp.js
```

## Convenciones

- Cada ruta recibe una petición Supertest real contra Express.
- Las rutas protegidas se ejecutan con un JWT válido y también sin credenciales.
- El rechazo sin credenciales fija exactamente `403`, `application/json` y `{ status: 0, data: ['Requiere Token'] }`.
- Cada snapshot registra status, `Content-Type`, CORS y cuerpo.
- ObjectIds, fechas ISO y JWT se normalizan para evitar snapshots dependientes del tiempo.
- Los IDs, body y query params provienen de una factory común.
- Los resultados legacy de error se preservan; no se convierten en expectativas ideales.
- El snapshot del inventario falla ante cambios de método, path, módulo o presencia de middleware Auth.

## MongoDB

Las pruebas usan una instancia real de MongoDB 7.0.14 mediante MongoMemoryServer. Mongoose, queries, populate y aggregate no se mockean. La base `characterization` se limpia antes de cada caso.

La versión antigua de Mongoose requiere que el URI contenga un nombre de base explícito; por eso el helper usa `mongo.getUri('characterization')`.

El endpoint `/api/category/load` responde antes de terminar sus escrituras internas con `forEach(async ...)`. El harness espera después de recibir la respuesta para aislar el siguiente test, sin cambiar ese comportamiento productivo.

## Servicios externos

Solo se sustituyen límites externos:

- Twilio mediante `services/message`.
- Email mediante `services/email`.
- Upload/Cloudinary mediante `src/file/fileCtrl`.

Los fakes son deterministas y no reemplazan repositorios, modelos ni operaciones Mongo.

## Ejecución

```bash
npm test
npm run test:watch
npm run test:coverage
```

La primera ejecución de MongoMemoryServer descarga el binario de MongoDB y puede tardar más. Las siguientes usan caché local.

Para actualizar deliberadamente la línea base después de revisar un cambio observable:

```bash
npx vitest run -u
```

Nunca se deben actualizar snapshots automáticamente para ocultar una regresión.

## Cobertura

`npm run test:coverage` genera reportes `text`, `html` y `lcov` en `coverage/`. No existe un umbral porcentual: el indicador principal es que las 134 rutas montadas permanezcan inventariadas y ejercitadas.

Línea base actual:

- Statements: 76.89%
- Branches: 46.15%
- Functions: 73.47%
- Lines: 76.89%

La cobertura refleja que cada endpoint fue invocado, pero no pretende afirmar que todas las combinaciones internas de cada handler legacy estén cubiertas.

## CI

`.github/workflows/characterization-tests.yml` ejecuta `npm ci` y `npm test` con Node 22.13.1 y MongoDB 7.0.14 en cada push y pull request.

El baseline oficial es Node 22 LTS, expresado en `engines.node` como `>=22.13.0 <23`. Vitest, Supertest y MongoMemoryServer se ejecutan bajo ese mismo runtime.

## Buenas prácticas

- Agregar una prueba de escenario antes de modificar comportamiento legacy.
- Usar factories para datos válidos y no repetir objetos extensos.
- Sembrar solo los documentos necesarios para el caso.
- Comprobar filtros, sort, limit, skip, populate y agregaciones mediante resultados observables, no inspeccionando internals de Mongoose.
- Mantener mocks únicamente en límites de red.
- Revisar individualmente cualquier cambio de snapshot.
- No corregir bugs desde una prueba de caracterización; documentar primero el comportamiento actual.
