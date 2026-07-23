# Observability

## Purpose

The observability layer provides structured application and HTTP logs without changing the API payloads,
status codes, route contracts, or business rules. Pino is the shared logging backend, and pino-http records
the HTTP lifecycle.

Logs are pretty-printed for local development and emitted as newline-delimited JSON in production so a log
collector can process them without parsing human-oriented text.

## Architecture

```text
Client
  |
  | X-Request-ID (optional)
  v
Correlation ID middleware
  |
  | req.requestId + response X-Request-ID
  v
Pino HTTP middleware
  |
  v
Express parsers and application routes
  |
  +--> Application logger
  |
  v
Error logging middleware
  |
  v
Existing Express error handling
```

| Component          | Responsibility                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| `logger.js`        | Creates the shared Pino instance, levels, timestamps, serializers, redaction and output format. |
| `correlationId.js` | Reuses a safe incoming request ID or creates a UUID and returns it to the client.               |
| `requestLogger.js` | Records request and response metadata and request duration.                                     |
| `errorLogger.js`   | Logs errors passed through Express before delegating to the existing error path.                |
| `asyncHandler.js`  | Adapts new promise-based handlers to Express `next(err)` without duplicating `try/catch`.       |

The async handler is intentionally not retrofitted into legacy controllers whose `catch` blocks construct
observable HTTP responses. It is available for new handlers and incremental migrations where
characterization tests prove equivalence.

## Configuration

```dotenv
NODE_ENV=development
LOG_LEVEL=debug
```

`NODE_ENV` controls log rendering:

- `development`: human-readable output through pino-pretty;
- `production`: structured JSON;
- `test`: structured logging is silent by default to keep characterization output deterministic.

`LOG_LEVEL` overrides the environment default. Production should normally use `info`; temporary diagnostic
changes should be time-boxed and reverted after the incident.

## Levels

| Level   | Use                                                 |
| ------- | --------------------------------------------------- |
| `fatal` | The process cannot continue safely.                 |
| `error` | Failed operations and unhandled request errors.     |
| `warn`  | Recoverable conditions and HTTP 4xx responses.      |
| `info`  | Service lifecycle and successful HTTP requests.     |
| `debug` | Legacy diagnostics and development troubleshooting. |
| `trace` | Short-lived, high-volume investigation only.        |

Application code must use the shared logger instead of `console.log`, `console.error`, or `console.warn`.
Errors should be passed as `{ err }` so the configured error serializer retains the stack and cause.

## HTTP request logs

Completed HTTP requests include:

- `requestId`;
- HTTP method;
- route or original URL;
- response status;
- duration in milliseconds;
- client IP according to Express proxy configuration;
- user agent.

The logger does not modify response bodies or status codes. The only response metadata it adds is
`X-Request-ID`.

## Correlation IDs

Clients may send `X-Request-ID`. Values containing only letters, digits, `.`, `_`, `:`, or `-`, with a
maximum length of 128 characters, are reused. Invalid or missing values are replaced with a UUID.

The selected value is:

1. exposed to application code as `req.requestId`;
2. included in HTTP and error logs;
3. returned in the `X-Request-ID` response header.

Support teams should request this identifier when investigating an incident. External services should
propagate it on downstream calls when integrations are modernized.

## Sensitive-data handling

Central redaction censors authorization headers, cookies, passwords, tokens, and verification codes in
common request and application-log shapes. Productive code should still avoid logging complete request
bodies, user documents, credentials, payment data, or identity documents.

Redaction is defense in depth, not permission to log sensitive data. When adding a new credential field,
extend the central redaction list and add a focused validation before logging it.

## Error flow

Errors forwarded with `next(err)` reach the error logger after application routes. The middleware records
the serialized exception and request context, then calls `next(err)` unchanged. Express therefore preserves
the existing response behavior.

Legacy `catch` blocks that already consume errors retain their current control flow and now log through the
shared Pino instance. They are not converted to centralized error handling until their HTTP behavior is
explicitly protected and migration is authorized.

## Production collection

Application containers or process managers should collect stdout and stderr. The application should not
write rotating log files itself.

### Grafana and Loki

Ship JSON stdout with Grafana Alloy, Promtail, or the platform's native collector. Map `service`,
`environment`, and severity to low-cardinality labels. Keep `requestId` as a searchable JSON field rather
than a high-cardinality label.

### Elastic Stack

Use Filebeat or Elastic Agent to ingest stdout. Decode JSON at the edge and map timestamps, severity,
request fields, and error stacks into an ECS-compatible index template.

### OpenSearch or ELK-compatible collectors

Forward the same JSON stream through Fluent Bit or Vector. Apply retention, access controls, encryption,
and field-level masking in the central platform.

### OpenTelemetry

A future OpenTelemetry integration should add traces and metrics without replacing Pino. Inject trace and
span IDs into logger bindings, propagate W3C `traceparent`, and correlate logs with spans using an
OpenTelemetry SDK initialized before the application bootstrap.

Recommended future signals:

- HTTP latency and request count by normalized route;
- 4xx and 5xx rates;
- MongoDB operation duration and connection-pool health;
- event-loop lag and process memory;
- external provider latency and error rates.

Do not use user IDs, request IDs, raw URLs, or query strings as metric labels.

## Operational practices

- Keep production logs in JSON.
- Send logs to stdout; let the runtime handle transport and retention.
- Restrict access to centralized logs and define retention by data classification.
- Alert on sustained error rates and latency, not isolated log lines.
- Never enable `trace` globally for an indefinite period.
- Verify redaction whenever authentication or payment payloads evolve.
- Include `requestId` in incident notes and support escalations.
- Treat logging changes as production changes and protect them with characterization tests.
