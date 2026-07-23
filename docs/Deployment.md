# Deployment and releases

## Estado implementado

El repositorio implementa integración continua y publicación de GitHub Releases. **No implementa
despliegue**, Docker, Kubernetes ni promoción automática a un entorno.

## CI

`.github/workflows/ci.yml` se ejecuta en pushes a `main`/`master`, pull requests y como workflow reutilizable.
Usa Node.js 22.13.1 y:

1. instala con `npm ci`;
2. ejecuta lint y formato;
3. ejecuta los 243 tests;
4. genera cobertura;
5. crea un archive del source desde el commit;
6. publica cobertura, JUnit y source como artifacts.

El job de seguridad ejecuta `npm audit` de forma informativa. CodeQL vive en un workflow independiente.

## Releases

`.github/workflows/release.yml` responde a tags `v*`, ejecuta CI, valida Semantic Versioning y crea un GitHub
Release. Adjunta:

- source archive validado;
- resultados JUnit;
- reporte de cobertura.

No publica a npm, no crea una imagen y no modifica servidores externos.

## Crear una release

1. Actualiza `CHANGELOG.md`.
2. Actualiza la versión de `package.json` y `package-lock.json`.
3. Integra el cambio solo con CI verde.
4. Crea un tag anotado sobre el commit validado:

```bash
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

5. Verifica el workflow y los tres artifacts.

No muevas ni recrees un tag publicado. Si una release es incorrecta, documenta el problema y publica una
nueva versión patch.

## Ejecución del artifact

El artifact actual contiene source y requiere Node.js, dependencias instaladas y MongoDB:

```bash
npm ci
NODE_ENV=production npm start
```

La configuración de producción exige JWT, Cloudinary, Mailjet y Twilio. Consulta
[Development](Development.md) para la lista.

## Rollback actual

Como no existe deployment automatizado, el workflow no puede hacer rollback de un entorno. Una release
inválida debe dejar de consumirse y ser reemplazada por una nueva versión. El procedimiento operativo del
entorno donde se ejecute el source debe definirse fuera de este repositorio.

## Limitaciones operativas

- No hay Dockerfile ni imagen inmutable.
- No hay staging, smoke test post-deploy o rollback automatizado.
- No hay health/readiness HTTP.
- No hay graceful shutdown para HTTP, Socket.IO y Mongo.
- No hay migración versionada de índices.

Esta sección describe límites actuales; no implica que esas capacidades estén implementadas.
