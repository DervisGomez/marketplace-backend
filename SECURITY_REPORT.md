# Reporte de seguridad de secretos

Fecha de auditoría: 2026-07-22

## Alcance y método

Se revisó el árbol completo del repositorio, incluidos archivos ocultos, ignorados, binarios, scripts, servicios, controladores y los 136 commits alcanzables desde todas las referencias locales de Git. Los valores reales se omiten deliberadamente de este reporte.

## CRÍTICO

| Archivo | Línea original | Tipo de secreto | Riesgo | Propuesta / estado |
| --- | ---: | --- | --- | --- |
| `config.js` | 15 | JWT secret hardcodeado | Permite firmar tokens válidos y suplantar usuarios. | Eliminado del árbol actual; usar `JWT_SECRET`. Rotar inmediatamente. |
| `config.js` | 24-26 | Twilio Account SID, Auth Token y número emisor | Toma de cuenta, envío fraudulento y cargos. | Eliminados del árbol actual; usar variables `TWILIO_*`. Revocar/rotar SID/token. |
| `config.js` | 34-37 | Cloudinary cloud name, API key y API secret | Lectura, modificación o eliminación de activos y consumo de cuota. | Eliminados del árbol actual; usar variables `CLOUDINARY_*`. Rotar credenciales. |
| `middlewares/cloudinary.js` | 4-6 | Segundo juego de credenciales Cloudinary | Compromiso de una segunda cuenta Cloudinary. | Eliminado; el middleware consume la configuración central. Rotar este segundo juego de credenciales. |
| `services/email.js` | 1 | Mailjet API key y secret | Envío de correo abusivo, afectación de reputación y cargos. | Eliminados; usar `MAILJET_API_KEY` y `MAILJET_SECRET`. Revocar/rotar ambas claves. |
| Historial Git (`config.js`, `middlewares/cloudinary.js`, `services/email.js`) | varias | Copias históricas de los secretos anteriores | Borrar el secreto del último commit no lo elimina de clones, forks ni commits antiguos. Se detectaron hallazgos en 30 revisiones de esos archivos. | Antes de publicar: rotar todos los secretos, reescribir todas las referencias con `git-filter-repo`/BFG, forzar la actualización del remoto y volver a escanear un clon fresco. |
| `nohup.out` | varias (archivo histórico) | JWT y datos operativos/personales en logs | Un token puede permitir acceso mientras sea válido; los logs además exponen información de usuarios. | Retirado del índice y añadido a `.gitignore`; debe purgarse también del historial Git. |

## ALTO

| Archivo | Línea original | Tipo de secreto/dato | Riesgo | Propuesta / estado |
| --- | ---: | --- | --- | --- |
| `config.js` | 16 | Sal bcrypt fija con apariencia de contraseña | Aunque el código usa rondas y no esta sal fija para el hash actual, el valor estaba presentado como credencial. | Sustituida por `BCRYPT_SALT`; conservar solo si alguna integración heredada la necesita. |
| `nohup.out` | varias | Correos, teléfonos, rutas, errores y tráfico HTTP | Divulgación de PII y detalles internos útiles para ataques. | Retirado del índice e ignorado. Purgar del historial antes de publicar. |

## MEDIO

| Archivo | Línea original | Tipo de dato | Riesgo | Propuesta / estado |
| --- | ---: | --- | --- | --- |
| `dump.rdb` | binario | Volcado Redis versionado | Un volcado real puede contener sesiones, tokens o datos de aplicación. El archivo inspeccionado solo mostró metadatos Redis, pero no debe versionarse. | Retirado del índice y añadido a `.gitignore`; purgar del historial. |
| `uploads/images.jpeg` | binario | Archivo de uploads versionado | Los uploads pueden incluir contenido o metadatos de usuarios. | Ya existe la regla `uploads`; revisar si la imagen de ejemplo tiene autorización antes de publicar o retirarla del índice. |

## BAJO

| Archivo | Línea | Hallazgo | Riesgo | Propuesta / estado |
| --- | ---: | --- | --- | --- |
| `src/config/config.js` | 8, 11 | URI locales de MongoDB y Redis sin credenciales | No son secretos, pero revelan valores de desarrollo y pueden provocar conexiones locales involuntarias. | Se mantienen como defaults para conservar el comportamiento; producción debe definir `MONGODB_URI` y `REDISCLOUD_URL`. |
| `.gitignore` | varias | Faltaban patrones para entornos, claves, certificados y credenciales | Riesgo de exposición accidental futura. | Añadidos los patrones solicitados y directorios sensibles habituales. |

## Configuración resultante

La fuente central es `src/config/config.js`. El `config.js` de la raíz permanece como adaptador para conservar todos los `require()` existentes y no cambiar contratos internos.

Variables documentadas en `.env.example`:

- `PORT`, `WEB_URL`, `UPLOADS_PATH`
- `MONGODB_URI`, `REDISCLOUD_URL`
- `JWT_SECRET`, `JWT_EXPIRATION_DAYS`
- `BCRYPT_SALT_ROUNDS`, `BCRYPT_SALT`
- `MAILJET_API_KEY`, `MAILJET_SECRET`, `MAILJET_FROM_EMAIL`, `MAILJET_FROM_NAME`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Estado para publicación

El árbol de trabajo saneado no contiene los secretos identificados. Sin embargo, **el repositorio completo todavía no debe hacerse público** hasta completar estos pasos externos/destructivos:

1. Revocar y rotar las credenciales JWT, Mailjet, Twilio y ambos juegos Cloudinary.
2. Purgar `config.js`, `middlewares/cloudinary.js`, `services/email.js`, `nohup.out` y `dump.rdb` de todas las referencias del historial.
3. Invalidar o eliminar ramas/tags/remotos antiguos y coordinar que los colaboradores reclonen.
4. Escanear un clon fresco del remoto saneado antes de cambiar su visibilidad.

No es técnicamente posible confirmar que GitHub puede hacerse público sin exposición mientras los secretos continúen en el historial o sigan siendo válidos en sus proveedores.

## Validación ejecutada

- Carga aislada de `src/config/config.js`: correcta.
- Dependencias (`npm ls --depth=0`): completas.
- Comparación de variables `process.env` contra `.env.example`: coincidencia completa (19 variables).
- Escaneo del árbol actual por patrones de proveedores, claves privadas, URIs con credenciales y asignaciones sensibles: sin secretos hardcodeados detectados fuera de artefactos locales ignorados.
- Reglas de `.gitignore`: verificadas para todos los nombres solicitados.
- Sintaxis JavaScript global: bloqueada por un error preexistente en `services/suggestions.js:22` (`suggestions` ya fue declarado). No se modificó porque corregir bugs está fuera del alcance solicitado.
- El proyecto no define un script de pruebas automatizadas en `package.json`; por ello no fue posible ejecutar una suite funcional.
