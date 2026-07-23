# Veyco Marketplace Backend

Backend del marketplace Veyco. Expone una API HTTP sobre Express, persiste datos en MongoDB mediante
Mongoose y soporta comunicación en tiempo real con Socket.IO.

## Arquitectura

El servicio es un monolito modular organizado por capacidades. Los módulos viven en `src/modules/` y
separan presentación, aplicación, dominio e infraestructura. La modernización es incremental: todavía
existen adaptadores y fachadas CommonJS de compatibilidad.

Consulta [Architecture](docs/Architecture.md) para conocer las capas, módulos, flujo de petición y reglas
vigentes.

## Tecnologías

- Node.js 22.13.x
- TypeScript y CommonJS
- Express 5
- Mongoose 8 y MongoDB
- Vitest, Supertest y MongoMemoryServer
- ESLint 9, Prettier 3 y Husky
- Pino y pino-http
- Socket.IO 4

## Requisitos

- Node.js `>=22.13.0 <23`
- npm
- MongoDB accesible para ejecutar la aplicación

## Instalación

```bash
npm ci
cp .env.example .env
```

Completa las variables necesarias y arranca en desarrollo:

```bash
npm run dev
```

La API usa el puerto `3000` por defecto y se monta bajo `/api`.

## Configuración

`JWT_SECRET` es obligatorio en todos los entornos. En producción también son obligatorias las credenciales
de Cloudinary, Mailjet y Twilio; la aplicación falla al iniciar si falta alguna.

| Variable              | Uso                         | Valor por defecto           |
| --------------------- | --------------------------- | --------------------------- |
| `NODE_ENV`            | Entorno de ejecución        | `development`               |
| `PORT`                | Puerto HTTP                 | `3000`                      |
| `WEB_URL`             | URL del cliente web         | `http://localhost:4200/`    |
| `MONGODB_URI`         | Conexión MongoDB            | `mongodb://localhost/mlolx` |
| `JWT_SECRET`          | Firma de tokens             | Sin valor; obligatoria      |
| `JWT_EXPIRATION_DAYS` | Duración del token          | `7`                         |
| `BCRYPT_SALT_ROUNDS`  | Rondas de bcrypt            | `10`                        |
| `UPLOADS_PATH`        | Ruta configurada de uploads | `./uploads`                 |
| `LOG_LEVEL`           | Nivel de Pino               | Según entorno               |

La lista completa, incluidos Mailjet, Twilio y Cloudinary, está en `.env.example` y se explica en
[Development](docs/Development.md).

## Scripts

| Comando                 | Propósito                          |
| ----------------------- | ---------------------------------- |
| `npm run build`         | Compilar TypeScript a `dist/`      |
| `npm run typecheck`     | Validar tipos sin emitir archivos  |
| `npm start`             | Compilar y ejecutar `server.js`    |
| `npm run dev`           | Compilar y ejecutar con nodemon    |
| `npm test`              | Ejecutar los 243 tests             |
| `npm run test:coverage` | Ejecutar tests y generar cobertura |
| `npm run test:watch`    | Ejecutar Vitest en modo watch      |
| `npm run lint`          | Ejecutar ESLint                    |
| `npm run format:check`  | Verificar formato                  |
| `npm run format`        | Aplicar Prettier                   |

## Testing y calidad

La suite contiene 243 tests, incluidos characterization tests HTTP sobre Express y MongoDB real en memoria.
CI ejecuta lint, formato, tests, cobertura y empaquetado en cada pull request y push a las ramas principales.

Consulta [Testing](docs/Testing.md) y [Contributing](docs/Contributing.md).

## Estructura

```text
src/modules/        módulos de negocio
src/infrastructure/ infraestructura HTTP y logging compartida
src/config/         configuración tipada y validación
src/shared/         contratos y adapters compartidos
middlewares/       middleware de autenticación, uploads y proveedores
services/           integraciones y servicios de compatibilidad
socket/             conexión Socket.IO
tests/              characterization, seguridad, configuración y plataforma
.github/workflows/  CI, CodeQL y releases
docs/               documentación vigente e historial
```

## Contribuir

Instala con `npm ci`, crea cambios pequeños, conserva los contratos caracterizados y deja que los hooks den
feedback local. GitHub Actions es el gate definitivo. Lee [Contributing](docs/Contributing.md) antes de
enviar cambios.

## Documentación

- [Architecture](docs/Architecture.md)
- [Development](docs/Development.md)
- [Testing](docs/Testing.md)
- [Security](docs/Security.md)
- [Deployment](docs/Deployment.md)
- [Observability](docs/Observability.md)
- [Contributing](docs/Contributing.md)
- [Changelog](CHANGELOG.md)

Los informes y planes completados se conservan fuera de la documentación principal en
[`docs/archive/`](docs/archive/README.md).
