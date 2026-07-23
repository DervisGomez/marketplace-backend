# TypeScript Migration Plan

Updated: 2026-07-23

## Current status

The migration is incremental and preserves CommonJS entry points throughout the transition.

| Metric                          |   Current value |
| ------------------------------- | --------------: |
| Productive logical modules      |             252 |
| Canonical TypeScript modules    |             136 |
| Overall migration               |           54.0% |
| Infrastructure modules          |               7 |
| Infrastructure modules migrated |               7 |
| Infrastructure migration        |          100.0% |
| Configuration modules migrated  |             1/1 |
| Shared utilities migrated       |             4/4 |
| Contract modules migrated       |           40/40 |
| Characterization tests          | 222/222 passing |
| HTTP routes                     |   134 preserved |

The denominator is the productive logical module inventory, excluding tests, dependencies, generated
output, type declaration files, and tooling configuration. New reusable contract modules are included in
both the numerator and denominator. A migrated module is counted once; the small number of required
CommonJS entry bridges is not counted as another implementation.

## Migration matrix by layer

| Layer          | Migrated | Inventory | Migration |
| -------------- | -------: | --------: | --------: |
| Infrastructure |        7 |         7 |    100.0% |
| Contracts      |       37 |        37 |    100.0% |
| Repositories   |       15 |        15 |    100.0% |
| Services       |       12 |        12 |    100.0% |
| Controllers    |        6 |         6 |    100.0% |
| Routes         |        0 |         6 |      0.0% |

Repository ports and repository result declarations are counted under contracts. The repository row
counts concrete persistence implementations only. Configuration and shared technical utilities remain
reported in the overall total but are not duplicated in this layer matrix.

## Compatibility strategy

The project remains a CommonJS application while individual implementations move to TypeScript:

```text
legacy CommonJS consumer
  -> stable .js bridge only at a JavaScript entry boundary
  -> compiled CommonJS artifact in dist/
  -> canonical strict TypeScript implementation
```

- Existing `require()` paths remain unchanged.
- TypeScript uses `strict: true` and Node16 module resolution.
- Compilation emits CommonJS-compatible output, declarations, and source maps.
- `npm test`, `npm start`, and development startup compile before execution.
- `dist/` is generated and excluded from version control.
- No HTTP route, status code, JSON body, or provider payload may change during a type-only migration.

## Mandatory business-module pattern

User and Product are the architectural references. All modular business implementations use the same
organization and composition rules:

- repositories remain in their established repository boundary;
- use cases are grouped by capability under `application/use-cases`;
- one named registry composes use-case objects with `Object.assign`;
- reusable request/handler contracts live in the module contract/DTO boundary;
- mappers remain under `infrastructure/mongoose/mappers`;
- controllers expose an explicit operation map through the module handler contract;
- CommonJS bridges exist only at JavaScript entry boundaries.

Question, Notification, Buy, and Payment conform to this pattern. Buy and Payment no longer use controller
`reduce` factories, anonymous registry arrays, or direct `RequestHandler` contracts. No additional
architectural variant is permitted.

## Completed scope: shared infrastructure

All runtime modules in `src/infrastructure`, the canonical configuration module in `src/config`, and the
selected technical utilities in `src/shared` now have strict TypeScript implementations.

Canonical TypeScript implementations:

- `src/config/config.ts`
- `src/infrastructure/http/createRouter.ts`
- `src/infrastructure/http/serializeLegacyError.ts`
- `src/infrastructure/http/serializeLegacyWriteResult.ts`
- `src/infrastructure/logging/correlationId.ts`
- `src/infrastructure/logging/errorLogger.ts`
- `src/infrastructure/logging/logger.ts`
- `src/infrastructure/logging/requestLogger.ts`
- `src/shared/infrastructure/mongoose/BaseMongoRepository.ts`
- `src/shared/infrastructure/mongoose/MongoObjectId.ts`
- `src/shared/pagination/LegacyPagination.ts`
- `src/shared/presentation/dto/LegacyRequestDto.ts`

Shared type declaration:

- `src/infrastructure/http/express.d.ts` augments Express requests with `requestId`.

Their original `.js` paths remain compatibility bridges. The typed contracts cover configuration, Express
routers and request context, Pino logging, legacy MongoDB DTOs, ObjectId construction, the generic Mongoose
repository factory, pagination, and request DTO cloning.

## Completed scope: business contracts

The contract boundary is now strict TypeScript without migrating controllers, services, routes, use cases,
or concrete business repositories.

Reusable contract files:

- `src/shared/contracts/ErrorContract.ts`
- `src/shared/contracts/PaginationContract.ts`
- `src/shared/contracts/PortContract.ts`
- `src/shared/contracts/RepositoryResultContract.ts`
- `src/shared/contracts/RequestContract.ts`
- `src/shared/contracts/ResponseContract.ts`
- `src/shared/contracts/index.ts`

Canonical DTO and pagination adapters:

- `src/modules/buy/presentation/dto/BuyRequestDto.ts`
- `src/modules/notification/presentation/dto/NotificationRequestDto.ts`
- `src/modules/payment/presentation/dto/PaymentRequestDto.ts`
- `src/modules/product/presentation/dto/ProductRequestDto.ts`
- `src/modules/question/presentation/dto/QuestionRequestDto.ts`
- `src/modules/user/application/dtos/UserRequestDto.ts`
- `src/modules/product/shared/pagination/LegacyPagination.ts`

Canonical named ports:

- buy: `BuyRepository`, `PaymentRepository`, `ProductGateway`, `ReputationGateway`, `UserGateway`;
- notification: `NotificationRepository`;
- payment: `AccountGateway`, `BankGateway`, `FileGateway`, `PaymentRepository`;
- product: `ImageGateway`, `ProductNumberRepository`, `ProductReadRepository`, `ProductRepository`;
- question: `NotificationGateway`, `QuestionRepository`, `UserGateway`.

The duplicated modern/legacy MongoDB write-result and serialized error shapes were removed from the HTTP
serializers and replaced with type-only imports from the shared contracts. Runtime serialization remains
unchanged. All module-specific DTOs still expose the same `from` function, pagination still exposes
`offset` and `pages`, and every port remains an immutable `{ name }` CommonJS export.

## Completed module pattern: User

The authorized User slice is completely migrated and is the reference pattern for the remaining business
modules. Its route, domain entities, constants, and schemas stay in JavaScript as compatibility surfaces;
its module-owned validation adapter is now strict TypeScript.

Migrated User files:

- DTOs and request contracts: `UserRequestDto.ts`, `UserContracts.ts`;
- repositories: `CodeRepository.ts`, `IncrementRepository.ts`, `MarketplaceRepository.ts`,
  `UserRepository.ts`, `UserTempRepository.ts`;
- services: `AuthenticationService.ts`, `PasswordRecoveryService.ts`, `ProfileService.ts`,
  `ReferralService.ts`, `RegistrationService.ts`, `ReportingService.ts`,
  `profile/ProfileContactService.ts`;
- mappers: `CodeMapper.ts`, `IncrementMapper.ts`, `UserMapper.ts`, `UserTempMapper.ts`;
- validator adapter: `LegacyValidationAdapter.ts`;
- controller: `user.controller.ts`.

The pattern for subsequent modules is:

1. keep a `.js` bridge only when an existing JavaScript entry point loads that exact path;
2. compile the canonical strict TypeScript implementation under the same logical path in `dist`;
3. type requests and service handlers through module contracts;
4. resolve not-yet-migrated collaborators through their current JavaScript entry points;
5. preserve repository method lists, mapper construction, controller dispatch, response bodies, and
   status codes;
6. run typecheck, build, and all characterization tests before migrating another module.

## Completed wave: Question, Notification, File, and Record

All applicable components in this wave are canonical strict TypeScript and retain their public CommonJS
paths. Application use cases are counted as service implementations for Question and Notification because
their service registries compose those files directly.

| Module       | Repository | Services/use cases | Controller | DTO/contracts | Mappers | Validators | Status   |
| ------------ | ---------- | -----------------: | ---------- | ------------- | ------- | ---------- | -------- |
| User         | 5/5        |                7/7 | 1/1        | complete      | 4/4     | N/A        | Complete |
| Question     | 1/1        |                5/5 | 1/1        | complete      | 1/1     | N/A        | Complete |
| Notification | 1/1        |                4/4 | 1/1        | complete      | 1/1     | N/A        | Complete |
| File         | N/A        |                1/1 | N/A        | N/A           | N/A     | N/A        | Complete |
| Record       | N/A        |                1/1 | N/A        | N/A           | N/A     | N/A        | Complete |

Question migrated its registry, four use-case files, repository, mapper, controller, and typed request
contract. Notification migrated its registry, three use-case files, repository, mapper, controller, and
typed request contract. Their existing request DTOs and application ports were already TypeScript.

File and Record are legacy single-service modules rather than layered modules. `src/file/fileCtrl.ts` and
`src/product/record.ts` therefore complete every applicable component without creating new architecture.

Compatibility modernization completed inside the wave:

- no deprecated Mongoose `remove()` or `update()` calls remain in these scopes;
- no legacy Mongoose callbacks or incompatible `ObjectId` construction were present in the migrated
  Question and Notification persistence boundaries;
- File no longer uses the deprecated `new Buffer.from(...)` form;
- File's `fs.unlink` callbacks were replaced by non-blocking promise cleanup with swallowed cleanup errors,
  preserving the legacy response timing and error behavior;
- legacy global values used by Question and File are now represented explicitly without changing their
  observable response payloads.

Validation:

- `npm run typecheck`: passing
- `npm run build`: passing
- `npm test`: 222/222 passing
- route inventory: 134 routes unchanged

## Migration phases

### Phase 1 — remaining infrastructure (completed)

Infrastructure HTTP, logging, configuration, and selected shared technical utilities use strict
TypeScript. Schema/model files remain JavaScript until their functional repositories are migrated.

Exit criteria:

- infrastructure HTTP and technical adapters use strict TypeScript;
- only JavaScript entry boundaries retain CommonJS bridges;
- 222/222 tests pass after each small group.

### Phase 2 — configuration (completed)

Migrate:

- `src/config/config.js`;
- the root `config.js` compatibility entry point;
- environment/configuration types.

Environment-variable names, defaults, coercion, and missing-value behavior are preserved. The root
`config.js` continues to resolve through the stable `src/config/config.js` CommonJS bridge.

### Phase 3 — logging (completed)

Migrate:

- `logger.js`;
- `correlationId.js`;
- `requestLogger.js`;
- `errorLogger.js`.

Express request augmentation for `requestId` is defined without changing log levels, redaction,
serializers, headers, or error flow.

### Phase 4 — contract layer (completed)

Requests, responses, errors, pagination, repository results, DTO aliases, and named application ports are
centralized and strictly typed. No `any` or `@ts-ignore` is present in TypeScript source.

### Phase 5 — middlewares

Migrate authentication, Cloudinary configuration, and upload middleware one file at a time. Preserve
middleware ordering, `next()` behavior, token errors, multipart field handling, filenames, and limits.

### Phase 6 — repositories

Start with shared repository factories and MongoDB adapters, then migrate repositories module by module.
Type Mongoose filters/results at the boundary while retaining the legacy HTTP DTO adapters.

Recommended order:

1. notification;
2. question;
3. product;
4. payment;
5. buy;
6. remaining legacy repositories.

The User, Question, and Notification repositories are complete and provide repository migration examples
for this phase.

### Phase 7 — services

Migrate provider gateways and application services after their repository/configuration dependencies are
typed. Keep Cloudinary, Twilio, Mailjet, JWT, and Socket.IO payload contracts unchanged.

### Phase 8 — controllers

Migrate presentation controllers last. Introduce typed request augmentations and DTOs without changing
routes, validation timing, response bodies, status codes, or legacy error handling.

### Phase 9 — routes

Migrate route composition after controllers. Preserve route order, middleware order, paths, methods, and
the 134-route inventory.

### Phase 10 — TypeScript-native runtime

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

## Completed final business wave

Product, Buy, and Payment now follow the same canonical TypeScript pattern as User, Question, and
Notification. Their compiled implementations import each other directly; CommonJS bridges exist only at
the JavaScript entry boundaries. The remaining module-owned validators and gateways were completed at the
same time.

| Module       | Repositories | Registry/services/use cases | Controller | DTO/contracts | Mappers | Helpers/adapters | Status   |
| ------------ | -----------: | --------------------------: | ---------: | ------------- | ------: | ---------------- | -------- |
| User         |          5/5 |                         7/7 |        1/1 | complete      |     4/4 | complete         | Complete |
| Question     |          1/1 |                         5/5 |        1/1 | complete      |     1/1 | complete         | Complete |
| Notification |          1/1 |                         4/4 |        1/1 | complete      |     1/1 | complete         | Complete |
| Product      |          3/3 |                         6/6 |        1/1 | complete      |     1/1 | complete         | Complete |
| Buy          |          4/4 |                       10/10 |        1/1 | complete      |     3/3 | complete         | Complete |
| Payment      |          1/1 |                         6/6 |        1/1 | complete      |     1/1 | complete         | Complete |
| File         |          N/A |                         1/1 |        N/A | N/A           |     N/A | complete         | Complete |
| Record       |          N/A |                         1/1 |        N/A | N/A           |     N/A | complete         | Complete |

The completed business scopes contain no deprecated Mongoose `remove()`/`update()` calls, query callbacks,
incompatible ObjectId construction, deprecated Buffer construction, direct `req.query` mutation, `any`,
`@ts-ignore`, or `@ts-expect-error`.

### CommonJS bridge audit

- Reused: 8 (`user`, `question`, `notification`, `product`, `buy`, and `payment` controller entry bridges,
  plus the File and Record service bridges).
- Eliminated: 102 redundant per-file bridges for ports, DTOs, repositories, services/use cases, mappers,
  validators, gateways, and helpers.
- New: 0.

The six controller bridges remain because current JavaScript controllers/routes load those exact source
paths. File and Record remain because non-modular legacy consumers load their source paths directly.

## Pending and blockers

- Production packaging must include `dist/` or run the build before application startup.
- Eight `.js` entry bridges remain required while routes and legacy consumers load CommonJS source paths.
- The 116 logical JavaScript modules outside this wave are route composition, Mongoose schemas, domain
  entities/policies/value objects, constants, and older non-modular compatibility entry points.
- Coverage still targets JavaScript source paths; switch it to canonical TypeScript only in a dedicated
  tooling wave.
- Provider sandbox and production MongoDB integration validation remain operational gates; they are not
  blockers in the 222-test characterization environment.
