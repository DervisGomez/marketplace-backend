# Observability

## Logging

El backend usa Pino y pino-http. En desarrollo, `pino-pretty` produce salida legible; en producción se emite
JSON por stdout para que la plataforma lo recoja. `LOG_LEVEL` permite ajustar el nivel.

| Nivel   | Uso                                    |
| ------- | -------------------------------------- |
| `fatal` | El proceso no puede continuar          |
| `error` | Operación o request fallido            |
| `warn`  | Condición recuperable o respuesta 4xx  |
| `info`  | Ciclo de vida y requests exitosos      |
| `debug` | Diagnóstico de desarrollo/legacy       |
| `trace` | Investigación temporal de alto volumen |

Usa el logger compartido y pasa errores como `{ err }`. No escribas logs en archivos rotativos desde la
aplicación.

## Correlation ID

El middleware acepta `X-Request-ID` con letras, números, `.`, `_`, `:` o `-`, hasta 128 caracteres. Si falta
o es inválido genera un UUID. El valor queda en `req.requestId`, se devuelve en la respuesta y se incluye en
logs HTTP y de error.

Los logs de request incluyen método, ruta/URL, status, duración, IP y user agent. No uses request IDs como
labels de alta cardinalidad.

## Datos sensibles

La configuración central redacta authorization, cookies, passwords, tokens y códigos en shapes comunes.
La redacción es defensa adicional: evita registrar bodies completos, documentos de usuario, credenciales,
pagos o identidad.

## Errores

El error logger registra errores enviados con `next(err)` y conserva el flujo de Express. Handlers legacy
que consumen errores siguen registrándolos localmente y construyen su respuesta existente.

## Estado actual y límites

El backend dispone de logs estructurados y correlación. No implementa:

- métricas de aplicación o MongoDB;
- tracing/OpenTelemetry;
- health, liveness o readiness HTTP;
- SLI/SLO, dashboards o alertas versionadas.

La plataforma de ejecución debe recolectar stdout y aplicar retención, control de acceso y masking según la
clasificación de datos.
