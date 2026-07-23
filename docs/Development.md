# Development

## Entorno

Usa Node.js `>=22.13.0 <23` y el lockfile del repositorio:

```bash
npm ci
cp .env.example .env
```

No es necesario instalar nodemon globalmente; es una dependencia del proyecto.

## Configuración

La configuración se carga desde variables de entorno y se valida durante el arranque.

### Aplicación

- `NODE_ENV`: `development`, `test` o `production`.
- `PORT`: puerto HTTP; por defecto `3000`.
- `WEB_URL`: origen del cliente; por defecto `http://localhost:4200/`.
- `UPLOADS_PATH`: ruta configurada de uploads; por defecto `./uploads`.
- `LOG_LEVEL`: nivel de Pino.

### Datos y autenticación

- `MONGODB_URI`: por defecto `mongodb://localhost/mlolx`.
- `REDISCLOUD_URL`: permanece en configuración por compatibilidad; no existe un cliente Redis activo.
- `JWT_SECRET`: obligatorio.
- `JWT_EXPIRATION_DAYS`: por defecto `7`.
- `BCRYPT_SALT_ROUNDS`: por defecto `10`.
- `BCRYPT_SALT`: configuración de compatibilidad.

### Proveedores

Cloudinary usa `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`. Mailjet usa
`MAILJET_API_KEY`, `MAILJET_SECRET`, `MAILJET_FROM_EMAIL` y `MAILJET_FROM_NAME`. Twilio usa
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y `TWILIO_PHONE_NUMBER`.

Todas estas credenciales son obligatorias en `production`. Nunca confirmes `.env` ni secretos reales.

## Ejecución

```bash
npm run dev
```

`predev` compila TypeScript y nodemon ejecuta `server.js`. Para simular el arranque productivo:

```bash
npm start
```

`prestart` también compila. MongoDB debe estar disponible antes de que el servidor empiece a escuchar.

## Flujo de trabajo

Antes de proponer un cambio:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

Los hooks de Husky ejecutan lint-staged antes del commit y la suite antes del push. CI es la verificación
autoritaria.

## Añadir o modificar funcionalidad

- Trabaja dentro del módulo propietario en `src/modules/`.
- Conserva la dirección de dependencias definida en [Architecture](Architecture.md).
- Añade primero un escenario de caracterización si el contrato legacy no está protegido.
- Evita nuevos imports directos entre modelos de módulos.
- No edites `dist/`; se genera con `npm run build`.
- No actualices snapshots sin revisar el cambio observable.
- Documenta cambios visibles en `CHANGELOG.md`.

## Solución de problemas

- Si faltan bridges compilados, ejecuta `npm run build`.
- Si MongoMemoryServer descarga el binario por primera vez, la suite puede tardar más.
- Si Husky no está activo, ejecuta `npm run prepare` y comprueba `git config core.hooksPath`.
- Si cambia `package-lock.json`, reinstala con `npm ci`.
