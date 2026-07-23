# TypeScript Migration Plan

Updated: 2026-07-23

## Current status

The migration is incremental and preserves CommonJS entry points throughout the transition.

| Metric                          |   Current value |
| ------------------------------- | --------------: |
| Productive logical modules      |             238 |
| Canonical TypeScript modules    |               3 |
| Overall migration               |            1.3% |
| Infrastructure modules          |               7 |
| Infrastructure modules migrated |               3 |
| Infrastructure migration        |           42.9% |
| Characterization tests          | 222/222 passing |
| HTTP routes                     |   134 preserved |

The denominator is the productive JavaScript module inventory, excluding tests, dependencies, generated
output, and tooling configuration. A migrated module is counted once: its temporary `.js` compatibility
bridge is not counted as another implementation.

## Compatibility strategy

The project remains a CommonJS application while individual implementations move to TypeScript:

```text
legacy CommonJS consumer
  -> stable .js bridge
  -> compiled CommonJS artifact in dist/
  -> canonical strict TypeScript implementation
```

- Existing `require()` paths remain unchanged.
- TypeScript uses `strict: true` and Node16 module resolution.
- Compilation emits CommonJS-compatible output, declarations, and source maps.
- `npm test`, `npm start`, and development startup compile before execution.
- `dist/` is generated and excluded from version control.
- No HTTP route, status code, JSON body, or provider payload may change during a type-only migration.

## Completed phase: infrastructure HTTP

Canonical TypeScript implementations:

- `src/infrastructure/http/createRouter.ts`
- `src/infrastructure/http/serializeLegacyError.ts`
- `src/infrastructure/http/serializeLegacyWriteResult.ts`

Their original `.js` paths remain compatibility bridges. The typed contracts cover Express routers,
legacy MongoDB error DTOs, and legacy write-result DTOs.

Validation:

- `npm run typecheck`: passing
- `npm run build`: passing
- `npm test`: 222/222 passing
- route inventory: 134 routes unchanged

## Migration phases

### Phase 1 — remaining infrastructure

Migrate infrastructure adapters and shared technical utilities before application code. Keep schema/model
files in JavaScript until repository contracts are typed.

Exit criteria:

- infrastructure HTTP and technical adapters use strict TypeScript;
- every migrated module retains a CommonJS bridge;
- 222/222 tests pass after each small group.

### Phase 2 — configuration

Migrate:

- `src/config/config.js`;
- the root `config.js` compatibility entry point;
- environment/configuration types.

Preserve environment-variable names, defaults, coercion, and missing-value behavior.

### Phase 3 — logging

Migrate:

- `logger.js`;
- `correlationId.js`;
- `requestLogger.js`;
- `errorLogger.js`.

Add Express request augmentation for `requestId` and logger fields without changing log levels,
redaction, serializers, headers, or error flow.

### Phase 4 — middlewares

Migrate authentication, Cloudinary configuration, and upload middleware one file at a time. Preserve
middleware ordering, `next()` behavior, token errors, multipart field handling, filenames, and limits.

### Phase 5 — repositories

Start with shared repository factories and MongoDB adapters, then migrate repositories module by module.
Type Mongoose filters/results at the boundary while retaining the legacy HTTP DTO adapters.

Recommended order:

1. notification;
2. question;
3. product;
4. payment;
5. buy;
6. user and remaining legacy repositories.

### Phase 6 — services

Migrate provider gateways and application services after their repository/configuration dependencies are
typed. Keep Cloudinary, Twilio, Mailjet, JWT, and Socket.IO payload contracts unchanged.

### Phase 7 — controllers

Migrate presentation controllers last. Introduce typed request augmentations and DTOs without changing
routes, validation timing, response bodies, status codes, or legacy error handling.

### Phase 8 — TypeScript-native runtime

Only after all productive modules are TypeScript:

- remove temporary CommonJS bridges;
- choose a single compiled entry point;
- expand coverage collection to TypeScript sources;
- remove JavaScript allowances and compatibility scaffolding;
- evaluate ESM separately, never in the same change.

## Rules for every migration slice

1. Migrate one bounded layer or module group.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Run all 222 characterization tests.
5. Confirm the 134-route inventory.
6. Update this document's module counts and percentage.
7. Commit the slice independently.

## Pending and blockers

- Production packaging must include the generated `dist/` directory or run the build with development
  dependencies available before starting the application.
- Coverage currently targets JavaScript source paths; TypeScript coverage should be switched only after
  enough canonical runtime modules have migrated to keep historical reports comparable.
- Express request augmentation will be introduced in the logging phase, not globally in this first slice.
