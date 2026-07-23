# Dependency Modernization Plan

## Compatibility implementation status (2026-07-23)

The compatibility-only implementation is complete without changing the installed Express or Mongoose
versions and without changing either dependency manifest.

| Incompatibility                        | Status                | Resolution                                                                                                                                   |
| -------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Active `Model.remove()` calls          | Resolved              | Replaced with explicit `deleteOne()`/`deleteMany()` semantics; characterization snapshots protect serialized write results.                  |
| Active `Model.update()` calls          | Resolved              | Replaced with deliberate `updateOne()`/`updateMany()` semantics; existing one/many behavior is preserved.                                    |
| Mongoose query callbacks               | Resolved              | The remaining callback flow now uses promises.                                                                                               |
| `ObjectId` calls without `new`         | Resolved              | Direct construction and the shared adapter use `new ObjectId(value)`.                                                                        |
| Legacy `fields` update options         | Resolved              | Replaced with `projection` where a projection is required.                                                                                   |
| Deprecated `findAndModify` path        | Resolved              | `useFindAndModify: false` is enabled on the current Mongoose line.                                                                           |
| Custom `db.Promise` assignment         | Resolved              | Removed; native promises remain the observable behavior.                                                                                     |
| Direct `req.query` mutation            | Resolved              | Payment and Question build local filter/update objects.                                                                                      |
| Implicit query parser selection        | Resolved              | The existing extended parser behavior is explicit in production and characterization apps.                                                   |
| Duplicate `body-parser` middleware     | Resolved in source    | Express built-in JSON and URL-encoded parsers retain the effective existing policy.                                                          |
| `express-promise-router` runtime usage | Resolved in source    | Native `express.Router()` is used with the local async error adapter.                                                                        |
| Removal of obsolete manifest entries   | Pending by constraint | `body-parser` and `express-promise-router` remain declared because this implementation may not modify `package.json` or `package-lock.json`. |

Validation: `npm test` passes 222/222 characterization tests after the Express block and after the final
Mongoose compatibility block. The historical audit below is retained as the original migration evidence;
counts described as “active” there represent the pre-implementation baseline.

## 1. Executive summary

The project is not ready for a direct Express 5 or current Mongoose upgrade. Node.js 22 is sufficient, the
134-route inventory is protected by characterization tests, and the route strings themselves are simple,
but two compatibility blockers exist:

1. Express 5 makes `req.query` read-only, while six productive operations mutate it.
2. Mongoose 7 removes `remove()` and `update()`, which are still used in sixteen active operations, and
   Mongoose 7 requires `new` when constructing `ObjectId`.

Mongoose has the largest migration risk. The installed version is 5.6.4 and the safe route is sequential:

```text
Mongoose 5.6
  -> remove current deprecations while staying on 5.x
  -> latest compatible 5.x
  -> 6.x compatibility release
  -> 7.x compatibility release
  -> 8.x evaluation
  -> 9.x only as a separate future initiative
```

Express should likewise use a compatibility-first release:

```text
Express 4
  -> remove duplicate/deprecated middleware
  -> stop mutating req.query
  -> establish one async-error strategy
  -> latest compatible 4.x
  -> Express 5
```

No dependency or source file was changed during this audit. Version targets must be resolved and pinned in
the implementation pull request, not inferred by running a bulk update.

## 2. Audit scope and evidence

Current runtime baseline:

| Component           | Declared                   | Resolved                                        |
| ------------------- | -------------------------- | ----------------------------------------------- |
| Node.js             | `>=22.13.0 <23`            | Node 22 release line                            |
| Express             | `^4.17.1`                  | 4.17.1                                          |
| Mongoose            | `^5.5.13`                  | 5.6.4                                           |
| MongoDB integration | Mongoose 5 driver behavior | MongoDB Memory Server in characterization tests |
| HTTP contracts      | 134 routes                 | 222 characterization tests                      |

Static findings:

| Finding                            |                         Count | Migration significance                                              |
| ---------------------------------- | ----------------------------: | ------------------------------------------------------------------- |
| Active `Model.remove()`            |                             9 | Removed in Mongoose 7                                               |
| Active `Model.update()`            |                             7 | Removed in Mongoose 7                                               |
| `findOneAndUpdate()`               |                             5 | `findAndModify` behavior changes in Mongoose 6                      |
| `findByIdAndUpdate()`              |                            57 | Same `findAndModify` and result/projection risk                     |
| `populate()`                       |                           104 | `strictPopulate` and projection compatibility must be verified      |
| `fields` query option              |                            16 | Normalize to explicit projections before upgrading                  |
| `multi` option                     |                10 occurrences | Must become deliberate `updateMany()` semantics                     |
| Mongoose query callbacks           |                      1 active | Callback support is removed in Mongoose 7                           |
| Direct `count()`                   |                             0 | Already uses `countDocuments()`                                     |
| Direct `ensureIndex()`             |                             0 | Schema indexes still exercise index creation behavior               |
| Schema middleware hooks            |                             0 | No `pre('remove')` or callback hook migration is currently required |
| Direct `req.query` mutations       |                             6 | Express 5 blocker                                                   |
| Express 5-sensitive route patterns |                       0 found | No wildcard/optional/regexp string route blocker found              |
| Productive dependency imports      | 25 declared, 17 used directly | Eight runtime packages are removal candidates                       |

The scan is static. Dynamic branches, third-party SDK behavior, MongoDB server compatibility, and client
protocol compatibility still require integration or staging validation.

## 3. Express modernization assessment

### 3.1 Middleware

#### Duplicate body parsing — high priority

`app.js` registers both:

- `express.json()` and `express.urlencoded()`;
- `bodyParser.json()` and `bodyParser.urlencoded()`.

The same request can therefore traverse two JSON/urlencoded parser stacks. `body-parser` is no longer
necessary for these formats in Express 4.17, and the two urlencoded parsers use different `extended`
settings. Removing either stack without contract tests could change nested form parsing, rejected payloads,
error types, size-limit behavior, and handling of malformed bodies.

Strategy:

1. Add characterization cases for JSON, malformed JSON, empty body, oversized body, flat forms, nested
   forms, arrays, duplicate keys, and unsupported content types.
2. Select one explicit parser policy.
3. Remove the duplicate parser in an Express 4-only release.
4. Preserve current 50 MB JSON limits until a separate security decision changes them.

`express.json()` currently receives `extended` and `parameterLimit`, which are not JSON-parser options.
Their presence suggests configuration intent is mixed between JSON and urlencoded parsing.

#### Morgan

`morgan` remains declared but is no longer imported because pino-http owns request logging. It should be
removed in a dependency-cleanup release, not replaced.

#### Multer

Multer 1.4.1 is deeply outdated and handles attacker-controlled filenames. The current storage callback
concatenates a random prefix and `file.originalname`; file-type, size, path, and filename behavior must be
characterized before any Multer upgrade. Treat this independently from Express.

#### Static files

`express.static()` serves `/uploads`. Express 5 changes the default handling of dot-directories and may
change MIME types through newer `mime-db`. Add tests for expected download headers, dotfiles, JavaScript,
JSON, images, and missing files before the Express major upgrade.

### 3.2 Routes

All discovered route paths use literal paths such as `/user`, `/payment/pendings`, or `/qualify/buyer`.
No active string route contained unnamed `*`, optional `?`, inline regexp groups, or the newly reserved
characters that require Express 5 path rewrites.

This lowers route-matching risk, but the existing route inventory snapshot must remain the acceptance gate.
Express 5 uses a newer path matcher, so verify:

- trailing slash behavior;
- URL-encoded path segments;
- repeated slashes;
- case sensitivity;
- route ordering;
- 404 behavior;
- query strings do not influence path matching.

### 3.3 `req.query` incompatibility — release blocker

Express 5 exposes `req.query` as a getter and changes the default parser from extended to simple. Six
operations mutate query input:

- `TransactionUseCases`: adds `user`, `amount`, and `$or`;
- `ModerationUseCases`: adds `status`.

These request objects are currently used as mutable MongoDB filters. On Express 5, those assignments are not
a supported contract. They also mix untrusted transport input with trusted server-side constraints.

Required compatibility refactor before upgrading:

- create a new local filter object;
- copy only the accepted query fields;
- apply trusted user/status constraints to the local object;
- characterize nested query parsing and operator-shaped input;
- preserve the exact MongoDB filter and HTTP response.

The query parser must be configured explicitly in Express 4 and carried into Express 5. Choosing `simple`
without evidence would change nested query behavior.

### 3.4 Request-body behavior

Express 5 returns `undefined` for `req.body` when no parser matched; Express 4 commonly exposes an empty
object. Many handlers dereference `req.body` directly. Test every write endpoint with:

- no body;
- missing `Content-Type`;
- empty JSON;
- invalid JSON;
- form-encoded data.

Do not add a global `{}` fallback unless characterization proves that is the current observable behavior.

### 3.5 Response APIs

No active use was found for the Express 5-removed signatures:

- `req.param(name)`;
- `res.json(body, status)`;
- `res.send(body, status)`;
- numeric `res.send(status)`;
- `app.del()`.

The project predominantly uses `res.status(...).json(...)`, which is compatible. Status-code validation is
stricter in Express 5, so run a static and dynamic check for non-integer or out-of-range status values before
the upgrade.

### 3.6 Async handlers and errors

Routers are created with `express-promise-router`, while most controller/use-case methods are async and many
also catch errors locally to construct legacy responses. Express 5 natively forwards rejected promises.
Keeping both mechanisms after the upgrade creates unnecessary ambiguity around who owns rejections.

The current error topology is:

```text
async handler
  -> local catch in many legacy operations
  -> express-promise-router for uncaught rejection
  -> Pino error logger
  -> Express default error handler
```

Recommended sequence:

1. Inventory handlers that catch and respond versus handlers that can reject.
2. Preserve local catches that define HTTP contracts.
3. Use the existing `asyncHandler` only for newly migrated Express 4 handlers.
4. Add tests for sync throw, async rejection, rejection after headers, parser errors, 404, and error-handler
   response bodies.
5. Remove `express-promise-router` only in the Express 5 change, replacing it with `express.Router`.
6. Confirm each error is logged once and answered once.

Do not globally delete `try/catch`: many catch blocks intentionally return status codes and JSON that the
frontend may depend on.

### 3.7 pino-http compatibility

pino-http is standard Express middleware and is compatible with Express-style request/response objects.
The integration does not depend on removed Express 4 APIs. Validate after the major upgrade that:

- completion logs occur exactly once;
- `durationMs` remains populated;
- `req.route` or the original URL is available at log completion;
- errors forwarded automatically by Express 5 retain `requestId`;
- response serializers still capture the final status;
- parser failures pass through the error logger.

Pino is not an Express upgrade blocker.

## 4. Mongoose modernization assessment

### 4.1 `remove()` — blocking

Nine active calls remain. The correct replacement is not uniformly `deleteOne()`:

| Current intent                            | Required semantic target                                           |
| ----------------------------------------- | ------------------------------------------------------------------ |
| Filter by a unique `_id`                  | Usually `deleteOne()`                                              |
| Filter by phone/email/medium              | Decide whether uniqueness guarantees one row                       |
| Empty filter in category reset            | `deleteMany({})`, with explicit destructive-operation protection   |
| Generic filter without `{ single: true }` | Legacy `remove()` behaves as multi-delete; normally `deleteMany()` |

Several controllers serialize the raw removal result into the HTTP response. Modern driver results use
fields such as `acknowledged` and `deletedCount`, whereas legacy results use a different shape. A direct API
replacement would therefore change observable JSON even if the database mutation is correct.

Required strategy:

1. Characterize the number of records deleted.
2. Snapshot the exact serialized write-result response.
3. Introduce a repository adapter that maps modern results back to the legacy DTO.
4. Replace each call independently.
5. Keep destructive empty-filter operations behind explicit tests and operational review.

### 4.2 `update()` — blocking

Seven active calls remain:

- four operations explicitly request multi-document behavior;
- favorite operations filter by `_id` but still pass `multi`;
- one user reset has no `multi` option and therefore carries single-update behavior.

Selection rules:

- `multi: true` becomes `updateMany()`;
- known single-document filters become `updateOne()`;
- full replacement, if discovered, becomes `replaceOne()`.

As with deletion, multiple endpoints return the raw update result. Preserve legacy response fields through
an adapter until the HTTP contract is versioned.

The location update also sends a request-derived object containing both user and MongoDB update operators
into a subsequent product update. This must be characterized before replacing `update()` because stricter
casting may reject or reinterpret the payload.

### 4.3 `count()`

No direct `count()` call was found. Current counting uses `countDocuments()`, which is the correct semantic
choice for filtered counts. Keep tests around empty filters and indexed filters because
`countDocuments({})` is not equivalent in performance to `estimatedDocumentCount()`.

### 4.4 Index creation and `ensureIndex()`

No direct `ensureIndex()` call exists. Mongoose 5 is already started with `useCreateIndex: true`, so schema
indexes use the modern driver path.

Migration work still required:

- remove `useCreateIndex` when moving to Mongoose 6 because the modern behavior becomes the default;
- inventory existing production indexes before enabling automatic creation in a new version;
- verify unique indexes for username, phone, invitation links, verification media, and TTL collections;
- inspect TTL definitions that combine `unique: true` and `expires`, because uniqueness plus timestamp
  precision may reject legitimate concurrent documents;
- run index creation in a controlled release rather than relying on application startup.

### 4.5 `findAndModify` behavior

There are 62 `findOneAndUpdate()`/`findByIdAndUpdate()` calls. Mongoose 5 currently runs without
`useFindAndModify: false`, which is why the characterization suite emits deprecation warnings.

Mongoose 6 always behaves as if `useFindAndModify` is false. Before changing versions:

1. Enable the modern behavior on the current Mongoose line in a dedicated compatibility branch.
2. Test returned documents for all `{ new: true }` and default-return operations.
3. Verify atomicity and upsert behavior.
4. Confirm validators, defaults, and middleware expectations.
5. Preserve projections and raw response shapes.

Forty-one occurrences explicitly use `new: true`; the remainder may rely on the pre-update document. Do not
globally add `new: true`.

### 4.6 Obsolete connection options

Current connection setup includes:

- `db.Promise = global.Promise`;
- `useCreateIndex: true`;
- `useNewUrlParser: true`.

Mongoose 6 makes modern parser, topology, index, and find-and-modify behavior the defaults. These compatibility
options should be removed in the Mongoose 6 preparation step, one behavior at a time. The custom Promise
assignment is unnecessary and custom promise-library support is removed in later Mongoose releases.

Connection tests must cover startup failure, authentication failure, disconnect/reconnect events, graceful
shutdown, and readiness—not only successful unit-test startup.

### 4.7 Callbacks

One active Mongoose callback remains in `services/suggestions.js`. Although the dependency scan shows that
this service is not imported by current productive entry points, it is still legacy source and will fail if
executed under Mongoose 7, which removed callback support.

Convert it to a promise/async flow before Mongoose 7 or formally delete the dead module after proving it is
not loaded dynamically.

### 4.8 ObjectId construction

Several modules invoke `mongoose.Types.ObjectId(value)` without `new`, including the shared
`MongoObjectId` helper. Mongoose 7 turns `ObjectId` into a class and requires `new`.

Centralize this change in the shared adapter first, then migrate direct callers in category, user referral,
user reporting, and question code. Add tests for:

- valid 24-character hexadecimal strings;
- invalid strings;
- existing ObjectId instances;
- `null` and `undefined`;
- arrays and numbers;
- the exact error-to-HTTP mapping.

Mongoose 8 and its MongoDB driver also reject legacy 12-character ObjectId strings, so this requires explicit
contract coverage.

### 4.9 Populate

The project has 104 populate calls and no use of `lean()`. Main risks are:

- Mongoose 6 `strictPopulate`;
- projection compatibility when the foreign field is omitted;
- chained population after `findByIdAndUpdate()`;
- missing referenced documents;
- array ordering and null retention;
- JSON serialization differences;
- query amplification and memory usage.

All populated paths appear schema-oriented, but this must be validated model by model. Build a matrix for
User, Product, Category, Buy, Message, Payment, Account, Bank, Question, and Chat relations. Snapshot both
successful and missing-reference responses before each Mongoose major.

Do not combine the Mongoose upgrade with a performance conversion to `lean()`; that changes document
serialization, getters, virtuals, defaults, and methods.

### 4.10 Projections and query strictness

Sixteen update calls use the legacy-looking `fields` option. Normalize these to documented projection APIs
before a major upgrade and verify that sensitive fields remain excluded.

`strictQuery` changes across Mongoose 6 and 7. The application constructs filters from `req.query`, including
operator-shaped values. Pin `strictQuery` explicitly during the compatibility phase and decide its future
value only after query and security tests. Enabling `sanitizeFilter` is a separate security change because
it can alter currently accepted filters.

### 4.11 Hooks

No schema `pre()` or `post()` middleware was found, so old `remove` hooks and callback-style hooks are not
current blockers. Re-run this check before each major upgrade because future modules may introduce hooks.

## 5. Dependency classification

Classification meanings:

- **Safe Upgrade:** low coupling; still requires lockfile review and the standard gates.
- **Requires Refactor:** compatible only after a bounded source/configuration change.
- **High Risk:** major runtime, data, protocol, security, or external-provider behavior.
- **Replace:** remove unused dependency or replace the library rather than carrying it forward.

### 5.1 Runtime dependencies

| Dependency               | Resolved | Classification    | Evidence and strategy                                                                                                                                     |
| ------------------------ | -------: | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bcryptjs`               |    2.4.3 | Safe Upgrade      | Three user services; verify existing hashes, compare, hash rounds, malformed hashes, and timing-sensitive auth paths.                                     |
| `body-parser`            |   1.18.3 | Replace           | Duplicates Express built-in parsers. Remove only after parser contract tests.                                                                             |
| `cloudinary`             |   1.14.0 | High Risk         | Old SDK used for configuration, upload and file deletion; provider responses and callbacks are coupled to file endpoints. Isolate behind a gateway first. |
| `cookie-parser`          |    1.4.3 | Safe Upgrade      | One global middleware; characterize signed/unsigned, duplicate and malformed cookies.                                                                     |
| `cors`                   |    2.8.4 | Safe Upgrade      | One global middleware with defaults; snapshot preflight and response headers. Explicit policy should be a separate change.                                |
| `debug`                  |    2.6.9 | Replace           | No direct import. Remove after checking transitive consumers do not depend on the top-level declaration.                                                  |
| `dotenv`                 |   10.0.0 | Safe Upgrade      | Loaded once before application bootstrap. Verify precedence, missing variables, multiline values and production injection.                                |
| `enigma-code`            |   0.0.11 | Replace           | No direct import; remove after a dynamic-load search.                                                                                                     |
| `express`                |   4.17.1 | High Risk         | 134 routes, parser differences, immutable `req.query`, async error changes and static-file differences. Use the staged Express plan.                      |
| `express-promise-router` |    3.0.3 | Replace           | Needed for Express 4 promise forwarding; redundant with Express 5. Remove in the Express 5 phase after error tests.                                       |
| `gridfs-stream`          |    1.1.1 | Replace           | No direct import and historically tied to old MongoDB driver APIs. Remove rather than modernize unless a dormant feature is proven.                       |
| `http-errors`            |    1.6.3 | Replace           | No direct import. Existing error flow uses native errors and Express.                                                                                     |
| `jsonwebtoken`           |    8.4.0 | Requires Refactor | Declared but unused. Candidate replacement for `jwt-simple`, but authentication contracts and algorithm policy must be designed first.                    |
| `jwt-simple`             |    0.5.5 | Replace           | Active token implementation with manual expiration logic. Consolidate on one maintained JWT implementation after token compatibility tests.               |
| `moment`                 |   2.22.2 | Replace           | Used only for JWT timestamps. Replace with native epoch calculations; do not combine with JWT-library migration.                                          |
| `mongoose`               |    5.6.4 | High Risk         | Data layer-wide coupling, removed write APIs, ObjectId construction, callbacks, populate and query strictness. Upgrade sequentially by major.             |
| `morgan`                 |    1.9.1 | Replace           | No longer imported after pino-http adoption.                                                                                                              |
| `multer`                 |    1.4.1 | High Risk         | Security-sensitive upload surface and filename behavior. Isolate and test before upgrading.                                                               |
| `node-mailjet`           |    3.3.1 | Requires Refactor | One email gateway using provider-specific fluent API and response shape. Add a fake gateway and provider contract tests.                                  |
| `nodemailer`             |   6.4.10 | Replace           | No direct import. Remove unless an untracked transport is documented.                                                                                     |
| `pino`                   |   10.3.1 | Safe Upgrade      | Centralized adapter; validate serializers, redaction and production JSON.                                                                                 |
| `pino-http`              |   11.0.0 | Safe Upgrade      | Standard Express middleware; validate one completion/error log and correlation ID propagation.                                                            |
| `redis`                  |    2.8.0 | Replace           | Imported only in Socket code that is commented out. Remove; reintroduce a modern client only when a real distributed-state use case exists.               |
| `socket.io`              |    2.1.1 | High Risk         | Client/server protocol major changes and direct adapter-room access. Requires client inventory, dual-environment testing and a dedicated rollback.        |
| `twilio`                 |   3.23.1 | Requires Refactor | One lazy gateway; external API, error and message SID behavior require provider contract tests and sandbox validation.                                    |

### 5.2 Development dependencies

| Dependency              | Resolved | Classification    | Evidence and strategy                                                                                                                    |
| ----------------------- | -------: | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `@vitest/coverage-v8`   |    1.6.1 | Requires Refactor | Must move in lockstep with Vitest; compare include/exclude rules, report paths and thresholds.                                           |
| `eslint`                |   9.39.5 | Safe Upgrade      | Already on flat config. Minor/patch updates are low risk; a future major needs a separate rule-baseline review.                          |
| `husky`                 |    9.1.7 | Safe Upgrade      | Two simple shell hooks; validate executable bits and `core.hooksPath`.                                                                   |
| `lint-staged`           |   16.2.7 | Safe Upgrade      | Configuration is isolated in `package.json`; validate partially staged files and rollback behavior.                                      |
| `mongodb-memory-server` |   10.1.4 | Requires Refactor | MongoDB binary/server changes can alter query, index and aggregation behavior. Pin the MongoDB binary per migration stage.               |
| `nodemon`               |   1.19.1 | Replace           | Development-only legacy watcher. Evaluate Node's native watch mode in a separate tooling change.                                         |
| `pino-pretty`           |   13.1.3 | Safe Upgrade      | Development-only transport; verify it is never required when production installs omit dev dependencies.                                  |
| `prettier`              |    3.9.6 | Safe Upgrade      | Current major and isolated formatting config; avoid whole-repository formatting during dependency work.                                  |
| `supertest`             |    7.1.1 | Safe Upgrade      | Test-only HTTP client. Confirm headers, binary bodies, redirects and server lifecycle.                                                   |
| `vitest`                |    1.6.1 | Requires Refactor | Major changes can affect CommonJS loading, snapshots, fake timers, reporters and coverage. Upgrade separately from runtime dependencies. |

## 6. Prioritized modernization roadmap

### Phase 0 — Freeze and evidence

| Attribute | Value    |
| --------- | -------- |
| Priority  | Critical |
| Risk      | Low      |
| Effort    | 2–4 days |

Actions:

- Pin the MongoDB binary/version used by characterization tests.
- Record current Node, MongoDB server, dependency and lockfile versions.
- Add parser, static-file, error-flow, auth-token, upload and WebSocket characterization gaps.
- Capture write-result JSON for every `remove()` and `update()` endpoint.
- Add a production-like staging smoke suite.

Tests affected:

- all 222 existing tests;
- new compatibility tests for parsers, write results, errors, uploads and sockets.

Rollback:

- documentation/test-only phase; revert the test commit if an assertion is incorrect.

### Phase 1 — Dead dependency cleanup

| Attribute | Value      |
| --------- | ---------- |
| Priority  | High       |
| Risk      | Low–medium |
| Effort    | 1–2 days   |

Candidates:

- `debug`;
- `enigma-code`;
- `gridfs-stream`;
- `http-errors`;
- `morgan`;
- `nodemailer`;
- dormant `redis`;
- later, `nodemon`.

Strategy:

- remove one logical group per pull request;
- scan static and dynamic loading;
- run startup, 222 tests, socket smoke tests and release packaging.

Rollback:

- revert manifest and lockfile together; no database rollback.

### Phase 2 — Mongoose 5 compatibility refactor

| Attribute | Value       |
| --------- | ----------- |
| Priority  | Critical    |
| Risk      | High        |
| Effort    | 1–2 sprints |

Actions:

- replace each `remove()` with deliberate single/multi semantics;
- replace each `update()` with deliberate one/many semantics;
- preserve legacy write-result DTOs;
- convert the remaining callback;
- normalize `fields` projections;
- centralize ObjectId construction with `new`;
- set and test modern find-and-modify behavior;
- explicitly pin query strictness;
- remove `db.Promise`.

Tests affected:

- Account, Bank, Category, User, Product, Notification, Buy and Payment characterization suites;
- all raw write-result response snapshots;
- concurrency tests for increments and state transitions.

Rollback:

- deploy source-compatible adapters before changing Mongoose;
- revert application release without database schema changes;
- do not perform irreversible data migrations in this phase.

### Phase 3 — Latest Mongoose 5, then Mongoose 6

| Attribute | Value              |
| --------- | ------------------ |
| Priority  | Critical           |
| Risk      | High               |
| Effort    | 1 sprint plus soak |

Strategy:

- move first to the final compatible Mongoose 5 release;
- soak in staging;
- upgrade to Mongoose 6 in a separate release;
- remove obsolete connection flags;
- explicitly test `strictQuery`, `strictPopulate`, undefined update fields, arrays, defaults and indexes.

Tests affected:

- all 222 tests;
- complete populate matrix;
- MongoDB startup/index tests;
- query-injection and filter-casting tests.

Rollback:

- retain the previous lockfile artifact and application image/package;
- no schema migration in the same release;
- verify the supported MongoDB server window permits both old and new application versions before rollout.

### Phase 4 — Express 4 compatibility refactor

| Attribute | Value       |
| --------- | ----------- |
| Priority  | High        |
| Risk      | Medium–high |
| Effort    | 1 sprint    |

Actions:

- stop mutating `req.query`;
- pin the query parser;
- remove duplicate body parsing;
- characterize empty-body and parser errors;
- consolidate async/error ownership;
- test pino-http completion/error behavior.

Tests affected:

- route inventory;
- every endpoint using query filters;
- every JSON/form write endpoint;
- observability invariants.

Rollback:

- remain on Express 4 throughout this phase;
- revert each compatibility refactor independently.

### Phase 5 — Express 5

| Attribute | Value              |
| --------- | ------------------ |
| Priority  | High               |
| Risk      | High               |
| Effort    | 3–5 days plus soak |

Strategy:

- upgrade Express alone;
- replace `express-promise-router` with the native router;
- do not upgrade Mongoose or provider SDKs in the same release;
- compare the 134-route inventory, response contracts, headers, static MIME types, errors and logs.

Rollback:

- preserve the Express 4 package/lock artifact;
- use a canary or low-percentage release;
- rollback on any contract, error-rate or latency regression.

### Phase 6 — Mongoose 7

| Attribute | Value              |
| --------- | ------------------ |
| Priority  | Medium–high        |
| Risk      | High               |
| Effort    | 1 sprint plus soak |

Entry criteria:

- zero `remove()` and `update()`;
- zero Mongoose callbacks;
- all ObjectId construction uses the compatible adapter;
- explicit `strictQuery`;
- populate matrix green.

Rollback:

- same dual-compatible MongoDB server requirement as Phase 3;
- no data migration in the dependency release.

### Phase 7 — External and protocol dependencies

| Attribute | Value                     |
| --------- | ------------------------- |
| Priority  | Medium                    |
| Risk      | High                      |
| Effort    | Multiple isolated sprints |

Upgrade independently:

1. Multer/upload pipeline.
2. Cloudinary.
3. Socket.IO server and all clients.
4. JWT implementation.
5. Twilio.
6. Mailjet.

Each needs a port/gateway, fake integration, provider sandbox where available, production observability and
an independent rollback.

### Phase 8 — Mongoose 8 evaluation

| Attribute | Value    |
| --------- | -------- |
| Priority  | Medium   |
| Risk      | High     |
| Effort    | 1 sprint |

Evaluate only after Mongoose 7 is stable. Mongoose 8 changes its MongoDB driver, ObjectId validation,
document deletion results, update behavior, and create/error timing. Mongoose 9 should be a later,
separately approved initiative rather than the initial modernization target.

## 7. Test impact matrix

| Change                       | Primary suites                                       | Additional tests required                                           |
| ---------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| Express parser consolidation | All POST/PUT routes                                  | malformed/empty/oversized JSON, form nesting, content types         |
| Express query behavior       | Payment, Product, Buy, Question, User reporting      | nested queries, duplicate keys, operators, immutable query          |
| Express async errors         | All modules                                          | sync throw, rejected promise, headers sent, parser error            |
| Static middleware            | Legacy/file routes                                   | MIME, cache headers, ranges, dotfiles, missing files                |
| Mongoose remove/update       | Account, Bank, Category, Notification, Product, User | mutation count and exact write-result JSON                          |
| findAndModify behavior       | All modular domains                                  | before/after document, not found, validation, concurrency           |
| ObjectId                     | Buy, Product, Payment, Question, User                | valid/invalid/12-char/null/number/already-ObjectId                  |
| Populate                     | Product, Buy, Payment, Question, Chat                | missing refs, arrays, projections, ordering, nulls                  |
| Index behavior               | User, UserTemp, Code, Product                        | uniqueness, TTL, startup index creation                             |
| JWT replacement              | User/Auth                                            | expiry boundary, refresh, malformed token, algorithm, legacy tokens |
| Socket.IO                    | Chat/Notification clients                            | handshake, rooms, reconnect, disconnect, mixed client versions      |
| Upload/Cloudinary            | File/Product/User                                    | filename, size, MIME, provider failure, cleanup                     |

## 8. Release and rollback policy

Every dependency migration release must:

1. change one runtime concern;
2. use exact lockfile output reviewed in the pull request;
3. pass lint, format, 222 tests, coverage, CodeQL and the new compatibility tests;
4. publish a release artifact before deployment;
5. run staging smoke tests against a production-compatible MongoDB version;
6. define measurable rollback signals;
7. avoid database transformations unless both old and new applications can read the resulting data.

Rollback signals:

- HTTP status/body contract drift;
- increase in 5xx or unhandled rejection rate;
- MongoDB cast, populate, index or topology errors;
- write-result response drift;
- authentication failures;
- upload/provider failures;
- Socket.IO connection or room-delivery regressions;
- latency or memory regression beyond the agreed threshold.

Rollback unit:

- application source;
- `package.json`;
- `package-lock.json`;
- build/release artifact;
- environment configuration.

Never rollback only `package.json` while retaining a lockfile from another dependency graph.

## 9. Recommended pull-request sequence

1. `test: expand dependency compatibility characterization`
2. `chore: remove proven unused runtime dependencies`
3. `refactor: preserve legacy Mongo write result contracts`
4. `refactor: replace deprecated Mongoose write APIs`
5. `refactor: modernize ObjectId and callback usage`
6. `chore: enable modern find-and-modify behavior on Mongoose 5`
7. `chore: upgrade to final Mongoose 5 baseline`
8. `chore: migrate Mongoose 5 to 6`
9. `refactor: make Express query filters immutable`
10. `refactor: consolidate Express body parsing and async errors`
11. `chore: migrate Express 4 to 5`
12. `chore: migrate Mongoose 6 to 7`
13. Independent provider/protocol migrations
14. Mongoose 8 evaluation

## 10. Decision

The modernization is feasible without rewriting the system, but it must be compatibility-first.

The highest-value preparatory work is:

1. preserve raw MongoDB write-result response contracts;
2. replace `remove()` and `update()` while still on Mongoose 5;
3. centralize ObjectId construction;
4. stop mutating `req.query`;
5. eliminate duplicate body parsing;
6. separate external SDK and Socket.IO upgrades from Express/Mongoose.

A simultaneous Express 5 + Mongoose latest + provider dependency upgrade is explicitly not recommended.

## 11. Primary references

- [Express 5 migration guide](https://expressjs.com/en/guide/migrating-5/)
- [Mongoose 5 deprecation guidance](https://mongoosejs.com/docs/5.x/docs/deprecations.html)
- [Mongoose 5 to 6 migration guide](https://mongoosejs.com/docs/7.x/docs/migrating_to_6.html)
- [Mongoose 6 to 7 migration guide](https://mongoosejs.com/docs/7.x/docs/migrating_to_7.html)
- [Mongoose 7 to 8 migration guide](https://mongoosejs.com/docs/migrating_to_8.html)
- [Mongoose 8 to 9 migration guide](https://mongoosejs.com/docs/migrating_to_9.html)
- [pino-http Express middleware documentation](https://github.com/pinojs/pino-http)
