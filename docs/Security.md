# Security

## Reportar una vulnerabilidad

No publiques detalles en issues, pull requests o chats públicos. Usa **Report a vulnerability** en la
sección Security del repositorio. Incluye componente y versión, reproducción, impacto y mitigaciones
conocidas. La línea 1.x es la única soportada.

## Autenticación actual

Las rutas protegidas usan `middlewares/auth.js`. El cliente envía el JWT en `Authorization` y el identificador
del usuario en el header `_id`; el middleware verifica que coincidan. Los tokens se firman con
`JWT_SECRET` y tienen expiración configurable.

Limitaciones conocidas:

- el payload contiene el objeto de usuario;
- un token expirado se renueva automáticamente;
- no hay revocación o rotación demostrada;
- autenticación no equivale a autorización por rol u ownership;
- conviven dos librerías JWT.

Estas limitaciones deben considerarse al exponer rutas o cambiar sesiones.

## Uploads

Multer escribe en `uploads/` con:

- máximo de 10 MB por archivo;
- máximo de 10 archivos;
- allowlist declarada para GIF, JPEG, PNG, WebP y PDF;
- nombre generado y basename saneado;
- eliminación de archivos parciales después de errores.

El MIME proviene del cliente y no valida magic bytes. Los archivos se sirven bajo `/uploads`; evita tratar
contenido subido como confiable.

## Configuración y secretos

`JWT_SECRET` es obligatorio. En producción también se validan credenciales de Cloudinary, Mailjet y Twilio.
La aplicación falla al arrancar si faltan. Los secretos solo deben vivir en variables del entorno; `.env`
no se confirma.

Pino redacta headers y campos sensibles comunes. Aun así, no registres bodies completos, tokens,
contraseñas, documentos, información de pago o códigos.

## Controles del repositorio

- CodeQL analiza JavaScript/TypeScript en pull requests, pushes a `main` y semanalmente.
- Dependabot revisa npm y GitHub Actions cada semana.
- `npm audit` genera un artifact informativo; actualmente no bloquea CI.
- CI exige lint, formato, tests y cobertura antes de empaquetar.

## Limitaciones conocidas

El estado actual conserva riesgos que deben tratarse como restricciones, no como controles implementados:

- CORS se configura sin allowlist.
- No hay Helmet ni rate limiting.
- La validación de entrada no es uniforme.
- Existen rutas sensibles sin autorización declarativa por rol/ownership.
- Los filtros Mongo se construyen parcialmente desde entradas HTTP.
- Los uploads validan MIME declarado, no contenido.
- Los errores legacy pueden conservar detalles internos.

No declares el backend endurecido frente a OWASP hasta resolver y probar estas limitaciones.
