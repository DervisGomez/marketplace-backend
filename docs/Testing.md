# Testing

## Estado actual

La suite contiene **243 tests en 18 archivos**. Protege el comportamiento HTTP observable, el inventario de
rutas, configuración, límites de uploads, concurrencia y bootstrap de plataforma.

## Herramientas

- Vitest como runner.
- Supertest contra una aplicación Express real.
- MongoMemoryServer 7.0.14 con Mongoose real.
- V8/c8 para cobertura.
- Snapshots normalizados para contratos HTTP.

## Tipos de pruebas

### Characterization

Ejercitan las rutas montadas bajo `/api` y fijan status, headers y cuerpo observado. Incluyen solicitudes
autenticadas y rechazos sin credenciales. Los snapshots preservan compatibilidad, incluso cuando el
comportamiento legacy no es el ideal.

### Inventario de rutas

Protege método, path, módulo y presencia del middleware de autenticación para las 134 rutas montadas.

### Integración

Las pruebas usan MongoDB real en memoria; `find`, `populate` y `aggregate` no se mockean. Solo se sustituyen
límites externos como Twilio, Mailjet y Cloudinary/uploads.

### Seguridad, configuración y plataforma

Hay suites focalizadas en límites y nombres de uploads, validación de variables, estado de arranque y
aislamiento de estado entre requests concurrentes.

## Ejecutar

```bash
npm test
npm run test:watch
npm run test:coverage
```

`npm test` compila antes de ejecutar. La primera corrida puede descargar MongoDB. El timeout del runner es
30 segundos y los hooks admiten hasta 120 segundos.

Para actualizar deliberadamente snapshots:

```bash
npx vitest run -u
```

Revisa cada diff; nunca actualices snapshots solo para hacer pasar CI.

## Cobertura

`npm run test:coverage` genera texto, HTML y LCOV en `coverage/`. La línea base documentada es:

| Métrica    | Cobertura |
| ---------- | --------: |
| Statements |    76,89% |
| Branches   |    46,15% |
| Functions  |    73,47% |
| Lines      |    76,89% |

No existe un umbral porcentual. El inventario de rutas y el valor de las assertions son más importantes que
un porcentaje aislado. Los snapshots no sustituyen unit tests de invariantes ni contract tests de adapters.

## Convenciones

- Crea solo los documentos necesarios para cada escenario.
- Usa factories comunes y resultados deterministas.
- Mockea redes externas, no repositorios internos.
- Prueba filtros, sort, limit, skip y aggregates por sus resultados.
- Añade tests de negocio puros cuando se extraiga un use case de Express/Mongoose.
- Mantén fixtures y snapshots libres de secretos.

CI ejecuta tests y cobertura según [Deployment](Deployment.md).
