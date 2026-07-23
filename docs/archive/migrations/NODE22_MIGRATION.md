# Migración de plataforma a Node.js 22 LTS

## Resultado

El baseline oficial del proyecto es **Node.js 22 LTS, versión 22.13.0 o superior dentro de la línea 22**.

Contrato de runtime:

```text
>=22.13.0 <23
```

La migración fue validada con Node.js `22.13.1`. No se modificaron endpoints, lógica funcional, CommonJS ni dependencias principales del negocio.

## Cambios realizados

| Archivo                                        | Cambio                                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `package.json`                                 | `engines.node` cambió de `12.18.0` a `>=22.13.0 <23`                                             |
| `package-lock.json`                            | Migrado de lockfile v1 a v3 por npm 10 bajo Node 22; conserva las versiones de negocio resueltas |
| `.nvmrc`                                       | Añadido con `22.13.1` para desarrollo local reproducible                                         |
| `.github/workflows/characterization-tests.yml` | CI actualizado de Node 20 a Node 22.13.1                                                         |
| `TESTING_STRATEGY.md`                          | Baseline y CI documentados con Node 22                                                           |
| `ESLINT_MIGRATION_PLAN.md`                     | Actualizado para reflejar que Node 22 ya es el baseline adoptado                                 |
| `NODE22_MIGRATION.md`                          | Evidencia, riesgos y próximos pasos de esta migración                                            |

No fue necesario modificar ningún archivo JavaScript productivo.

## Versiones de negocio preservadas

Después de `npm install`, el lockfile conserva:

| Dependencia | Versión resuelta |
| ----------- | ---------------: |
| Express     |           4.17.1 |
| Mongoose    |            5.6.4 |
| Socket.IO   |            2.1.1 |
| Redis       |            2.8.0 |
| Twilio      |           3.23.1 |
| Cloudinary  |           1.14.0 |

No se ejecutó `npm update`, `npm audit fix` ni una actualización selectiva de estas dependencias.

## Compatibilidad verificada

### CommonJS

El proyecto continúa usando `require()` y `module.exports`. No se añadió `"type": "module"`, no se migraron imports y no hubo cambios de resolución de módulos propios.

### Vitest

Vitest 1.6.1 ejecutó correctamente la suite bajo Node 22. Su mensaje sobre la API CJS de Vite es una advertencia del toolchain, no un fallo de CommonJS de la aplicación.

### MongoMemoryServer y Mongoose

MongoMemoryServer 10.1.4 inició MongoDB 7.0.14 correctamente. Mongoose 5.6.4 conectó usando el URI con base explícita ya definido por el harness.

### Supertest

Supertest 7.1.1 ejercitó las 134 rutas HTTP montadas sin incompatibilidades con Node 22.

## Validaciones ejecutadas

### Instalación

Ejecutado bajo Node 22.13.1:

```bash
npm install
```

Resultado: instalación satisfactoria. npm reportó 83 vulnerabilidades transitivas/directas del stack legacy; no fueron corregidas para evitar actualizaciones funcionales.

### Characterization Tests

Ejecutado bajo Node 22.13.1 y con trazas de deprecación habilitadas:

```text
Test Files  8 passed (8)
Tests       222 passed (222)
```

No cambiaron snapshots ni contratos observables.

### Dependencias protegidas

Se compararon explícitamente las versiones resueltas de Express, Mongoose, Socket.IO, Redis, Twilio y Cloudinary antes y después de la instalación. Permanecen idénticas.

## APIs obsoletas y warnings detectados

No se corrigieron los siguientes hallazgos.

### Node DEP0044: `util.isArray`

Node 22 emite:

```text
[DEP0044] DeprecationWarning: The `util.isArray` API is deprecated.
```

Origen comprobado: `mongoose/lib/aggregate.js` de Mongoose 5.6.4. No es una llamada directa del código de la aplicación. Se activa al ejecutar agregaciones.

### APIs Mongo/Mongoose legacy

Las pruebas emiten warnings por:

- `findOneAndUpdate()` usando internamente `findAndModify`.
- `collection.update`.
- `collection.remove`.

Estas operaciones aparecen en controllers, servicios y repositorios legacy. Cambiarlas podría modificar opciones, resultado de escritura o comportamiento observable; deben permanecer hasta un sprint específico respaldado por los characterization tests.

### Dependencias circulares del driver MongoDB

Node 22 advierte accesos a propiedades inexistentes dentro de dependencias circulares:

- `count`
- `findOne`
- `remove`
- `updateOne`

Las trazas apuntan a `mongodb/lib/operations/db_ops.js`, transitivo de Mongoose 5. No provienen de los módulos modernizados.

### Dependencias circulares de Cloudinary

Cloudinary 1.14.0 y su Lodash transitivo generan warnings al clonar la API v2 durante una dependencia circular, incluyendo propiedades como `config`, `utils`, `uploader`, `api`, `url`, `image` y `video`.

No se actualizó Cloudinary porque está explícitamente fuera del alcance.

### API CJS de Vite

Vitest muestra:

```text
The CJS build of Vite's Node API is deprecated.
```

La aplicación no consume Vite. El warning pertenece al toolchain Vitest 1.6.1 y no requiere migrar la aplicación a ESM.

### Construcción redundante de Buffer

La búsqueda estática encontró:

```js
new Buffer.from(value, 'base64');
```

en `src/file/fileCtrl.js`. Usa la API moderna `Buffer.from`, pero con `new` redundante. Node 22 no emitió una deprecación durante las pruebas. Se documenta para revisión futura y no se modifica en esta migración.

### APIs Node obsoletas no encontradas directamente

No se encontraron usos propios de:

- `process.binding`
- `process.mainModule`
- `url.parse`
- `crypto.createCipher` / `createDecipher`
- `fs.exists`
- módulos core `sys`, `domain` o `punycode`
- constructor legacy `Buffer(value)`

## Riesgos encontrados

### Alto: dependencias legacy sobre Node moderno

Mongoose 5 y el driver MongoDB asociado funcionan bajo las pruebas actuales, pero usan APIs deprecadas. Una futura versión mayor de Node podría convertir parte de esta deuda en incompatibilidad.

### Alto: vulnerabilidades npm

`npm install` reportó 83 vulnerabilidades: 6 low, 18 moderate, 43 high y 16 critical. El conteo no implica automáticamente explotabilidad en esta aplicación, pero requiere un análisis separado. No debe ejecutarse `npm audit fix --force` sin una estrategia de actualización y pruebas.

### Medio: lockfile migrado

El lockfile pasó de v1 a v3. Esto es intencional para npm 10/Node 22 y produce un diff grande de metadatos. Las versiones críticas se verificaron sin cambios.

### Medio: infraestructura externa

El repositorio y GitHub Actions ya declaran Node 22, pero cualquier Dockerfile, servidor, PaaS o proceso administrado fuera del repositorio debe alinearse manualmente.

### Bajo: warnings en logs

Los warnings de Mongoose, MongoDB, Cloudinary y Vite aumentan ruido, pero no hicieron fallar la aplicación ni las pruebas.

## Dependencias que requieren atención futura

Sin proponer su actualización dentro de este sprint:

- Mongoose 5.6.4 y su driver MongoDB: deprecaciones y ciclos CommonJS.
- Cloudinary 1.14.0: warnings de dependencias circulares.
- Socket.IO 2.1.1: generación antigua no validada aquí con clientes modernos.
- Redis 2.8.0: cliente legacy basado en callbacks.
- Twilio 3.23.1: SDK antiguo; la inicialización diferida evita bloquear el arranque.
- Vitest 1.6.1/Vite: API CJS deprecada.
- Nodemon 1.19.1: tooling de desarrollo antiguo.

## Siguientes pasos recomendados

1. Alinear producción, contenedores y herramientas locales con Node 22.13+.
2. Usar `nvm use` antes de instalar o ejecutar el proyecto.
3. Confirmar que despliegues ejecuten `npm ci`, no `npm update`.
4. Mantener las 222 pruebas como gate obligatorio.
5. Iniciar Sprint 1B con ESLint 10 y Prettier 3 usando el plan gradual existente.
6. Auditar vulnerabilidades por explotabilidad en un sprint independiente.
7. Planificar actualizaciones de Mongoose/Cloudinary separadas, nunca mezcladas con lint o formato.

## Confirmación de compatibilidad

- Node oficial: `>=22.13.0 <23`.
- CI: Node 22.13.1.
- CommonJS preservado.
- Dependencias de negocio preservadas.
- Código productivo sin cambios.
- Characterization Tests: 222/222 aprobadas.
- Preparado para ESLint 10 + Prettier 3.
