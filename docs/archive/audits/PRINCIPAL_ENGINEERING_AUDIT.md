# Auditoría técnica integral del backend MLOLX

**Fecha:** 2026-07-23  
**Alcance:** código, tests, configuración, documentación y automatización presentes en el repositorio.  
**Método:** inspección estática, trazado de dependencias y ejecución local de `npm test`, `npm run lint` y
`npm run typecheck`. La puntuación mide el estado efectivo, no la intención declarada en documentos de
migración.

## Resumen ejecutivo

El backend está en una transición bien ejecutada desde un monolito legacy hacia un monolito modular, pero
**todavía no es Clean Architecture ni un backend Staff/Principal**. La modernización produjo beneficios
reales: módulos uniformes, contratos TypeScript estrictos en parte del sistema, repositorios adaptadores,
DTOs, logging estructurado, validación de configuración, pruebas de caracterización amplias y CI/release
disciplinados. Es un avance de ingeniería sustancial y verificable.

La limitación central es semántica: en numerosos módulos las capas son directorios, no límites. Los
application use cases importan repositorios Mongoose, reciben objetos HTTP y escriben la respuesta. Por
ejemplo, `SearchUseCases.ts` importa logging, serialización HTTP, repositorios Mongo y datos globales, lee
`req.query` y llama `res.status()`. El registry concatena objetos de handlers y el controller solo aplica un
DTO antes de delegar. Esto invierte la dirección deseada: application conoce presentation, infrastructure y
Express. Los ports existen, pero frecuentemente no gobiernan el flujo.

El riesgo más grave para producción empresarial es seguridad: CORS está abierto, no hay Helmet ni rate
limiting, la validación de entrada es parcial, varios endpoints administrativos o mutantes de categorías no
requieren autenticación, y otros endpoints sensibles solo prueban identidad, no autorización por rol. El
JWT contiene el objeto de usuario completo y un token expirado se renueva automáticamente. Tampoco hay
readiness/health endpoints ni cierre ordenado.

**Nivel actual: Intermediate alto / Senior incipiente. Puntuación global: 62/100.** La suite y la disciplina
de modernización son Senior; el diseño runtime, la seguridad y la operabilidad todavía no lo son. No
aprobaría el estado actual para una plataforma empresarial con millones de usuarios sin completar los
bloqueantes P0/P1 del roadmap.

## Puntuación

| Categoría                    |   Nota | Nivel             | Diagnóstico                                                            |
| ---------------------------- | -----: | ----------------- | ---------------------------------------------------------------------- |
| Arquitectura                 |     65 | Intermediate      | Modularidad visual fuerte; boundaries y dirección débiles              |
| SOLID                        |     61 | Intermediate      | DIP/SRP parciales; ports poco efectivos                                |
| Domain Driven Design         |     43 | Needs Improvement | Modelo mayormente anémico y documental                                 |
| Calidad de código            |     64 | Intermediate      | Legible y consistente, con handlers complejos y duplicación            |
| Testing                      |     82 | Senior            | Excelente red de caracterización; faltan pruebas de diseño y negocio   |
| Seguridad                    |     46 | Needs Improvement | Controles parciales y brechas de autorización/exposición               |
| Observabilidad               |     70 | Intermediate      | Logging sólido; sin métricas, tracing ni probes                        |
| Performance                  |     49 | Needs Improvement | Queries no gobernadas, populate/aggregate intensivos, pocos índices    |
| DevOps                       |     70 | Intermediate      | CI/release buenos; no existe artefacto desplegable ni rollback probado |
| Escalabilidad                |     61 | Intermediate      | Fácil copiar módulos; difícil escalar comportamiento y datos           |
| Developer Experience         |     57 | Needs Improvement | Mucha documentación histórica; README desactualizado                   |
| Mantenibilidad               |     60 | Intermediate      | Migración ordenada, pero doble fuente JS/TS y deuda encapsulada        |
| Calidad arquitectónica       |     55 | Needs Improvement | Mongo y Express atraviesan application                                 |
| Estándares modernos          |     62 | Intermediate      | Toolchain moderna, runtime architecture incompleta                     |
| Camino hacia Staff/Principal |     67 | Intermediate      | Buena capacidad de cambio; faltan enforcement y ownership operativo    |
| **Global ponderada**         | **62** | **Intermediate**  | **No apto aún para aprobación empresarial de gran escala**             |

La nota global pondera más arquitectura, seguridad, testing, mantenibilidad y operación. No es un promedio
destinado a premiar cantidad de carpetas.

## Fortalezas principales

1. **Caracterización excepcional del comportamiento existente.** La ejecución local completó 18 archivos y
   243 tests sin fallos. Supertest atraviesa Express y MongoMemoryServer ejercita Mongoose real; el inventario
   protege 134 rutas. Esto reduce el riesgo de modernizar un sistema legacy.
2. **Toolchain y gates coherentes.** Node 22, TypeScript estricto, ESLint 9, Prettier, Vitest, CodeQL,
   Dependabot, build, coverage y release por SemVer están automatizados en CI.
3. **Mejoras operativas reales.** Pino, logs JSON, redacción, correlation ID, fallo temprano por configuración
   inválida y espera por Mongo antes de escuchar son buenas decisiones.
4. **Convergencia modular visible.** Once áreas tienen vocabulario y organización similares. Mappers,
   contratos y repositorios crean seams aprovechables para la siguiente fase.
5. **Uploads endurecidos.** Hay límites de tamaño/cantidad, allowlist MIME, nombre saneado y eliminación de
   archivos después de error.
6. **Pragmatismo de migración.** Los tests reconocen bugs legacy en vez de redefinirlos accidentalmente. No
   se introdujeron microservicios, CQRS ni event sourcing sin necesidad.

## Debilidades y riesgos principales

| Prioridad | Hallazgo                                                                    | Riesgo                                               |
| --------- | --------------------------------------------------------------------------- | ---------------------------------------------------- |
| P0        | Mutaciones de categoría y `/category/load` sin `Auth`                       | Modificación o carga masiva no autorizada            |
| P0        | Rutas de reporte, ganancias, locks, pagos y chat “admin” sin RBAC explícito | Escalada horizontal/vertical                         |
| P0        | CORS irrestricto, sin rate limit ni headers Helmet                          | Abuso de auth/recovery, exposición evitable          |
| P1        | Use cases dependen de Express/Mongoose y construyen HTTP                    | Cambios caros, tests de negocio lentos               |
| P1        | JWT incluye usuario completo y renueva expirados                            | Datos obsoletos, revocación débil, sesión prolongada |
| P1        | Sin health/readiness ni graceful shutdown                                   | Rollouts inseguros, pérdida de requests              |
| P1        | Paginación no acotada y construida desde strings del cliente                | DoS lógico, latencia/memoria impredecibles           |
| P1        | `autoIndex=false` y casi no hay índices declarados                          | Degradación severa al crecer los datos               |
| P2        | TS compila una allowlist manual y coexiste con wrappers JS/dist             | Drift y onboarding costoso                           |
| P2        | Snapshots dominan la suite; branches declaradas en 46.15%                   | Bugs internos compatibles con snapshot               |

## 1. Arquitectura

### Modular Monolith

El sistema sí puede describirse como **monolito modular en transición**: el despliegue es único y la
organización por capability es consistente. Sin embargo, no hay aislamiento ejecutable de módulos. `buy`
reexporta la entidad `payment`; gateways y use cases consultan modelos de User, Product, Payment, Category y
Buy. `src/router.js` además monta wrappers legacy que redirigen a rutas modulares. Los bounded modules no
poseen sus datos ni publican APIs internas estables.

### Clean Architecture y dirección de dependencias

Cumplimiento bajo-medio:

- Positivo: existen interfaces/ports y los repositorios Mongo viven bajo `infrastructure`.
- Negativo: `ProductRepository.ts` como port es solo `definePort('ProductRepository')`; no declara operaciones
  ni tipos semánticos.
- Negativo: application importa concretos de `infrastructure/mongoose`, `infrastructure/http`, el logger y
  contratos de presentation.
- Negativo: los casos de uso operan con `req`, `res`, `req.user`, `req.query` y producen status/body HTTP.
- Negativo: `BaseMongoRepository` expone el lenguaje de Mongoose (`find`, `aggregate`, `populate`), no un
  repositorio orientado al dominio.

Por tanto, las dependencias **no apuntan siempre hacia adentro** y el dominio no está protegido. Cambiar
Express altera casos de uso; cambiar Mongo obliga a reescribir queries dentro de application.

### Composition root y boundary enforcement

`server.js` y `startServer` constituyen un bootstrap razonable, pero la composición real ocurre mediante
`require()` globales distribuidos y registries que fusionan objetos. No hay construcción explícita de casos
de uso con dependencias. Tampoco existen reglas ESLint, dependency-cruiser/Madge o tests que prohíban imports
application → infrastructure/presentation.

**Recomendación:** establecer primero una regla de dependencias verificable y migrar verticalmente un flujo
de alto valor. Controller traduce HTTP → command; use case recibe datos planos y ports inyectados; adapters
traducen a Mongo/proveedores. Beneficio: testabilidad y sustitución gradual. Costo: medio-alto. Vale la pena,
pero no requiere reescribir todos los módulos de una vez.

## 2. SOLID

### SRP — 58/100

Positivo: router, controller, DTO, mapper y repository nominalmente separan tareas. Negativo:
`SearchUseCases.ts` (289 líneas) valida implícitamente queries, construye filtros Mongo, agrega datos, hace
joins, pagina, loguea y serializa HTTP. `src/product/record.ts` (609 líneas) concentra reputación y múltiples
agregaciones. Recomendación: extraer query objects/policies puros y response mapping, no clases por cada
función. Costo medio; alto retorno.

### OCP — 63/100

Los adapters y registries facilitan agregar handlers, pero cada operación nueva modifica objetos exportados,
controllers y routes; los filtros son bloques condicionales extensos. La extensibilidad es por edición, no
por contratos estables. Introducir estrategias solo donde exista variación real (pago, búsqueda), no como
plantilla universal.

### LSP — 66/100

No se observaron jerarquías profundas ni sustituciones inválidas. Eso evita errores LSP, pero los ports
nominales no permiten demostrar sustituibilidad: aceptan contratos demasiado vagos y devuelven queries
Mongoose. Definir contract tests para adapters y resultados independientes de ODM.

### ISP — 64/100

Hay repositorios por módulo y gateways específicos, una señal positiva. No obstante,
`BaseMongoRepository.create` expone bags de métodos CRUD y algunos ports son marcadores sin firmas. Los casos
de uso terminan conociendo capacidades concretas. Preferir interfaces pequeñas por necesidad del caso de
uso (`findPublishedProducts`, `reserveInventory`) sobre CRUD genérico.

### DIP — 52/100

Es el principio más débil. Application depende de adapters concretos y los registries no inyectan nada.
Introducir factories de módulo en el composition root y ports estructurales TypeScript. Costo medio; retorno
muy alto. No es necesario un contenedor DI.

## 3. Domain Driven Design

No existe DDD efectivo. Hay nombres de entidades, value objects y policies, pero:

- las entidades usan `Object.assign` sin invariantes ni comportamiento;
- `Money`, `Inventory` y `Warranty` son wrappers mutables sin validación, igualdad o unidad;
- varias policies declaran expresamente que son “documentales” y no se usan;
- las reglas reales viven en handlers y pipelines Mongo;
- no hay aggregates, factories, domain services o domain events efectivos;
- no hay límites transaccionales explícitos ni lenguaje ubicuo documentado;
- `Buy` reexporta `Payment`, evidencia de contexto compartido, no integración explícita.

Esto es un modelo anémico con artefactos DDD aspiracionales. No recomiendo “DDD completo”. Sí conviene
modelar únicamente invariantes de alto riesgo: reserva de inventario, transición de compra/pago, retiro,
calificación y propiedad/autorización. Un aggregate de checkout y value objects de dinero/estado tendrían
beneficio; domain events solo cuando haya una necesidad real de consistencia eventual o integración.

## 4. Calidad de código

La nomenclatura modular y los archivos pequeños en controllers/mappers mejoran lectura. TypeScript `strict`
es positivo, pero cubre una lista manual: conviven 200 `.ts` y 130 `.js`; además existen pares fuente/wrapper
como controllers JS/TS y runtime imports a `dist`. El source of truth no siempre es obvio.

Smells demostrados:

- loops anidados y múltiples queries secuenciales en búsqueda;
- parámetros HTTP sin límites (`parseInt(req.query.limit)`), comparaciones `==` y variables `let` mutables;
- `try/catch` repetido que responde 500 en cada handler;
- comentarios con código muerto en `SearchUseCases`;
- `global.config` y rutas relativas de siete niveles;
- `src/data/locations.js` tiene 1.204 líneas de datos embebidos;
- `src/product/record.ts` conserva una responsabilidad transversal pendiente.

ESLint confirmó complejidad ciclomática **26** en `SearchUseCases.filter`, por encima del máximo configurado
de 25 (warning, no error). La estructura de sus ramas y loops evidencia complejidad alta localizada. Conviene
reducirla y hacer que warnings críticos fallen CI después de fijar un baseline. Costo bajo; retorno medio.

## 5. Testing

La suite es la parte más madura. Resultado verificado: **243/243 tests pasaron en 28,22 s**. Tiene
characterization HTTP, inventario, concurrencia, configuración, readiness de bootstrap y uploads. Ejecutar
Mongo real en memoria y simular solo límites externos da confianza superior a mocks profundos.

Limitaciones:

- La estrategia documenta 76,89% statements/lines y 46,15% branches, sin umbrales.
- Los snapshots prueban compatibilidad, no corrección ni invariantes.
- No se encontraron suites unitarias amplias para dominio/use cases ni contract tests de repositories.
- La prueba llamada server readiness verifica bootstrap, no un endpoint operativo de readiness.
- Faltan pruebas sistemáticas de autorización por rol/ownership, NoSQL injection, límites de paginación,
  índices/planes, rollback y fallos de proveedores.

Recomendación: conservar characterization; añadir una pirámide pequeña de pruebas de negocio puras,
integration/contract tests por adapter, security matrix y tests de migraciones. Subir primero branch coverage
en auth, pagos, retiros e inventario; un umbral global arbitrario aportaría menos valor.

## 6. Seguridad

### Evaluación OWASP

- **Broken Access Control:** crítico. `category` permite POST/PUT/DELETE y `/load` sin Auth. Rutas como
  `/buy/gain/year` son públicas; `/chat/admin` solo usa Auth, sin rol visible. En otros casos la autorización
  puede existir dentro del handler, pero el diseño no la hace verificable ni uniforme.
- **Cryptographic/Auth failures:** bcrypt está presente y hay expiración JWT, pero el payload contiene el
  usuario completo. `decode` renueva tokens ya expirados, no consulta estado/rol actual, no hay `jti`,
  revocación ni rotación demostrada. Se usan dos librerías JWT.
- **Injection:** filtros y pipelines se forman desde query/body. Mongoose aporta casting, pero no equivale a
  allowlisting; `strictQuery=false` aumenta superficie. No hay sanitización central contra operadores Mongo.
- **Security misconfiguration:** `cors()` irrestricto, sin Helmet/CSP/HSTS configurado por la app y `/uploads`
  se sirve públicamente. Los errores legacy pueden devolver `[err]`.
- **Identification/auth abuse:** no hay rate limiting para login, registro, códigos o recuperación.
- **Input validation/mass assignment:** DTOs copian campos, pero no existe schema validation uniforme y
  varios modelos/updates reciben objetos derivados del request.
- **Uploads:** buen baseline de límites/MIME/nombre, pero MIME declarado no valida contenido real; PDF e
  imágenes deberían verificarse por magic bytes y, según riesgo, escanearse/transformarse.
- **Secrets/supply chain:** config falla temprano y CI usa CodeQL/Dependabot. `npm audit` es informativo, por
  lo que vulnerabilidades conocidas no bloquean releases.
- **Output encoding:** JSON reduce XSS directo; servir uploads y errores requiere content type/disposition
  seguro. No se evidenció una política central.

Antes de producción: matriz route-action-role-owner, middleware declarativo de authorization, CORS
allowlist, Helmet, rate limiting distribuible, schemas estrictos, hardening JWT y security tests. Costo
medio; retorno crítico; vale inequívocamente la pena.

## 7. Observabilidad

Pino/pino-http, request ID validado/generado, duración, serializers y redacción son un baseline bueno. Los
errores consumidos por handlers se registran, aunque eso fragmenta el error flow. Falta:

- métricas RED y de pool/event loop;
- trazas y propagación W3C a proveedores;
- SLO/SLI, alertas y dashboards versionados;
- health/liveness/readiness reales;
- evitar registrar el URI de Mongo completo (`startServer` incluye `mongoUri` en el log), porque podría
  contener credenciales.

OpenTelemetry readiness está documentada, no implementada. Priorizar probes y métricas antes de tracing
distribuido, dado que sigue siendo un monolito.

## 8. Performance

Hay proyecciones en varias queries y límites en algunos listados, lo cual es positivo. No obstante:

- búsqueda ejecuta count + tres aggregates + lookup de categorías + query final y loops O(n×m);
- se observan cadenas repetidas de `populate`, incluso cuatro relaciones;
- paginación por `skip/limit` escala mal y el límite no tiene máximo;
- múltiples reportes agregan colecciones completas;
- casi no hay índices declarados: se encontró texto en Product y uniques/TTL en User/Code/UserTemp;
- `autoIndex=false` implica que producción necesita un proceso de índices, no evidenciado;
- no existe caché efectivo aunque Redis aparezca en config;
- no hay timeouts, `maxTimeMS`, abort signals, streaming o backpressure demostrados.

No se afirma N+1 universal sin perfiles, pero hay riesgo claro de round trips múltiples y joins Mongoose.
Crear un inventario query→índice con `explain()` sobre datos representativos, límites de página y cursor
pagination para feeds. Añadir cache solo después de medir; no por moda.

## 9. DevOps

CI y release son reproducibles y bien diseñados: `npm ci`, quality gates, CodeQL, artifacts, SemVer validado
y releases condicionados a CI. Sin embargo, el “release” es un tarball de fuente; no hay Dockerfile, SBOM,
firma/provenance, migrations/index deployment, despliegue, smoke test o rollback automatizado. El propio
workflow declara “Deployment: not executed”.

Tampoco hay handlers SIGTERM/SIGINT que dejen de aceptar tráfico, cierren HTTP/Socket.IO y desconecten Mongo.
Para una empresa madura: producir imagen inmutable no-root, escanearla, generar SBOM/provenance, desplegar a
staging, smoke/readiness, canary/blue-green y rollback comprobado. El mecanismo concreto depende de la
plataforma; no se prescribe Kubernetes.

## 10. Escalabilidad

Copiar un módulo es fácil porque la taxonomía es homogénea. Crear un módulo correctamente es más difícil:
hay que editar una larga allowlist de `tsconfig`, crear wrappers que cargan `dist`, registrar routers y
replicar registries/controllers. No hay generator ni plantilla ejecutable.

La aplicación puede escalar horizontalmente en HTTP solo si se externalizan uploads locales y estado de
Socket.IO; no se evidenció adapter compartido para sockets. Mongo soporta crecimiento, pero índices y query
budgets son prerequisitos. Mantener monolito modular es apropiado; no hay evidencia que justifique
microservicios.

## 11. Developer Experience

Existe documentación abundante sobre migración, seguridad, testing, observabilidad, releases y workflow.
La debilidad es su utilidad actual: README todavía llama al proyecto “Andamio”, describe carpetas
controllers/models que ya no representan la arquitectura, pide nodemon global y muestra puerto 8888 frente
al default 3000. TESTING_STRATEGY dice 222 tests y referencia un workflow que no existe, mientras la ejecución
actual tiene 243.

Faltan una guía arquitectónica canónica, mapa de módulos, reglas de dependencia, ADRs, `.env.example`,
runbook operativo y ruta de onboarding verificada desde clone hasta primer cambio. Consolidar documentos
históricos y marcar su estado evitará que cantidad se confunda con claridad.

## 12. Mantenibilidad

La migración reduce deuda de forma disciplinada, pero parte de la deuda fue **reubicada**, no eliminada:
bugs preservados, policies documentales, gateways “Legacy”, wrappers a `dist`, entidades anémicas y use
cases acoplados. Dentro de cinco años, sin enforcement, cada módulo tenderá a una variante diferente.

Definir una “golden path” y fitness functions de arquitectura aporta más que otra reorganización masiva.
Eliminar gradualmente duplicados JS/TS y hacer que el runtime ejecute un único árbol construido. Registrar
cada bug deliberadamente preservado con owner, riesgo y fecha de retiro.

## 13. Calidad arquitectónica: escenarios de cambio

| Cambio                                      | Dificultad     | Evidencia                                                      |
| ------------------------------------------- | -------------- | -------------------------------------------------------------- |
| Mongo → PostgreSQL                          | **Muy alta**   | queries, aggregates, populate y ObjectId dentro de application |
| Express → otro HTTP framework               | **Alta**       | use cases reciben req/res y generan respuestas                 |
| Sustituir proveedor de imágenes             | **Media**      | ImageGateway existe, aunque adapters conservan legado          |
| Probar regla de negocio sin infraestructura | **Alta**       | reglas mezcladas con handlers y Mongoose                       |
| Añadir módulo CRUD similar                  | **Media-baja** | estructura repetible, pero registro/build manual               |
| Extraer un módulo como servicio             | **Muy alta**   | datos y modelos cruzados, sin API/eventos internos             |

Los repositories actuales ayudan a centralizar modelos, pero no hacen al dominio independiente porque
application consume su API concreta. La independencia real se demuestra sustituyendo un adapter en tests,
no por la presencia del nombre `Repository`.

## 14. Comparación con equipos maduros

El proyecto ya se alinea en CI reproducible, dependabot/code scanning, logging estructurado,
characterization y migración incremental. Queda por debajo del estándar empresarial moderno en:

- ownership y enforcement de boundaries;
- threat modeling y autorización deny-by-default;
- artefactos desplegables, supply-chain evidence y rollback;
- SLOs, métricas, probes y runbooks;
- schema/index migrations;
- contract tests y tests de invariantes;
- ADRs y documentación canónica actualizada.

Los equipos maduros no son maduros por acumular patrones, sino por hacer explícitas y verificables sus
decisiones, riesgos y mecanismos operativos. Ese es el salto pendiente.

## 15. Roadmap hacia Staff/Principal

### Fase 0 — Bloqueantes de producción (0–30 días)

1. **Cerrar autorización.** Inventariar cada ruta con actor, rol, ownership y sensibilidad; proteger
   mutaciones/admin; tests deny-by-default. Problema: acceso indebido. Beneficio: reduce riesgo crítico.
   Costo: medio. **Obligatorio.**
2. **Endurecer borde HTTP.** CORS allowlist, Helmet, límites de body menores por ruta, rate limit en
   auth/recovery, validación schema y límites de paginación. Problema: abuso/inyección/configuración.
   Beneficio: gran reducción de superficie. Costo: bajo-medio. **Obligatorio.**
3. **Corregir ciclo JWT.** Payload mínimo (`sub`, roles/version), rechazar expirados, rotación/revocación y
   consulta de estado crítico. Problema: sesión y privilegios obsoletos. Costo: medio. **Obligatorio.**
4. **Añadir probes y shutdown.** Liveness, readiness de Mongo, drain HTTP/socket y cierre Mongo. Problema:
   despliegues inseguros. Costo: bajo-medio. **Obligatorio.**

### Fase 1 — Límites arquitectónicos (30–90 días)

5. **Definir y automatizar dependency rules.** Domain no importa nada externo; application solo domain y
   ports; adapters hacia afuera. Añadir lint/test de arquitectura. Problema: regresión estructural. Costo:
   bajo. **Muy alto retorno.**
6. **Migrar un slice crítico end-to-end**, preferiblemente checkout/retiro: DTO HTTP → command, use case
   puro, ports inyectados, adapter Mongo y presenter. Problema: arquitectura nominal. Beneficio: patrón
   probado. Costo: medio. **Sí vale la pena.**
7. **Modelar invariantes críticas**, no DDD ceremonial: Money, Inventory, PaymentTransition, ownership y
   transacción/idempotencia. Problema: corrupción lógica/financiera. Costo: medio-alto. **Alto retorno.**
8. **Contract tests de adapters y unit tests de negocio.** Mantener characterization. Problema: suite detecta
   cambios, no necesariamente errores. Costo: medio. **Alto retorno.**

### Fase 2 — Datos y operación a escala (60–150 días)

9. **Programa de query performance.** Telemetría, slow-query budget, explain, índices versionados, cursor
   pagination, projections y límites. Problema: degradación con volumen. Costo: medio. **Necesario antes de
   millones de usuarios.**
10. **Artefacto y despliegue reproducible.** Imagen no-root, SBOM/provenance, staging, smoke/canary y rollback
    ensayado. Problema: release no equivale a deploy. Costo: medio. **Alto retorno operativo.**
11. **SLIs/SLOs y runbooks.** Latencia, error rate, disponibilidad, saturación Mongo/event loop; alertas por
    burn rate. Problema: operación reactiva. Costo: medio. **Marca distintiva Staff.**
12. **Externalizar estado local.** Object storage para uploads y adapter compartido de Socket.IO si hay más
    de una réplica. Problema: afinidad/pérdida de archivos. Costo: medio. **Condicionado al despliegue.**

### Fase 3 — Sostenibilidad (90–180 días)

13. Consolidar TS/runtime y retirar wrappers/duplicados JS-dist.
14. Crear plantilla/generator de módulo con tests y reglas incluidas.
15. Reescribir README, Architecture y ADRs; archivar planes históricos completados.
16. Registrar deuda compatible con characterization con owner, fecha y criterio de eliminación.

No recomiendo ahora microservicios, CQRS, event sourcing, service mesh ni un contenedor DI. Ninguno resuelve
los problemas observados y aumentarían el costo cognitivo.

## Evidencias verificables

- `app.js`: CORS abierto, static uploads, 10 MB JSON, `strictQuery=false`, `autoIndex=false`.
- `server.js` y `src/infrastructure/http/startServer.ts`: buen fail-fast de Mongo; sin señales/shutdown/probes.
- `src/modules/product/application/use-cases/search/SearchUseCases.ts`: acoplamiento HTTP/Mongo/logging,
  múltiples agregaciones, loops, paginación no acotada y complejidad 26 reportada por ESLint.
- `src/modules/product/application/services/ProductUseCaseRegistry.ts`: registry por fusión de handlers, sin
  inyección.
- `src/modules/product/application/ports/ProductRepository.ts`: port nominal sin operaciones tipadas.
- `src/modules/product/infrastructure/mongoose/repositories/ProductRepository.ts`: API Mongoose genérica.
- `src/modules/*/domain`: entidades `Object.assign`, constantes y policies expresamente documentales.
- `src/modules/category/presentation/routes/category.routes.js`: mutaciones públicas.
- `src/modules/buy/presentation/routes/buy.routes.js` y chat routes: endpoints sensibles sin autorización por
  rol declarativa.
- `middlewares/auth.js` y `services/token.js`: identidad por header, payload de usuario y renovación expirada.
- `middlewares/upload.js`: límites y saneamiento correctos; confianza en MIME del cliente.
- `tsconfig.json`: strict positivo, pero include manual por módulo.
- `.github/workflows/ci.yml` y `release.yml`: gates/release fuertes; sin despliegue.
- `README.md` frente a código/config: documentación principal desactualizada.
- `TESTING_STRATEGY.md`, tests y ejecución local: cobertura de caracterización fuerte; 243 tests actuales.

## Conclusión final

1. **¿Qué nivel tiene?** Intermediate alto con prácticas Senior puntuales, especialmente testing,
   automatización y modernización incremental. No Senior integral porque Clean Architecture, seguridad,
   performance y operación no alcanzan ese nivel.
2. **¿Es apto para producción empresarial?** No en el estado auditado para millones de usuarios. Podría
   operar en un entorno controlado, pero autorización, hardening, probes/shutdown y límites de datos son
   bloqueantes de aprobación.
3. **¿Puntuación global?** **62/100.**
4. **¿Qué falta para ser referencia?** Convertir carpetas en boundaries ejecutables, hacer explícitas las
   invariantes y autorizaciones, gobernar queries/índices, y cerrar el ciclo operativo con SLOs, artefactos,
   despliegues y rollback. El salto a Staff/Principal no consiste en añadir patrones; consiste en crear
   mecanismos que mantengan estas propiedades verdaderas cuando crezcan el equipo, el tráfico y el tiempo.
