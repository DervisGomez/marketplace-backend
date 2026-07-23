# Technical Audit Report

Date: 2026-07-23  
Scope: backend source, build/runtime configuration, CI, tests, dependency usage, module boundaries, and
generated-artifact loading.  
Mode: static/read-only audit. No behavior, dependency, or manifest change was performed.

## Executive summary

The backend has strong characterization coverage and the main modular application layers are TypeScript,
but the runtime is still hybrid. The two critical latent defects found by this audit, C-01 and C-02, are
now resolved. Several high-risk operational and security concerns and substantial JavaScript/CommonJS
residue remain.

The most urgent work is not an ESM conversion. It is to remove request-shared global state, fix undefined
runtime symbols, make the quality gates inspect TypeScript source correctly, validate configuration at
startup, and complete the non-modular legacy slices.

| Severity     |           Findings |
| ------------ | -----------------: |
| Critical     | 0 open, 2 resolved |
| High         | 1 open, 6 resolved |
| Medium       |                  8 |
| Low          |                  5 |
| Nice to Have |                  4 |

No static import cycle was detected in the 272 analyzed source/runtime files and 377 resolved local import
edges. The offline lockfile audit reported zero known vulnerabilities. These are positive signals, but
neither result covers runtime branches, provider integrations, concurrency behavior, or undeclared dynamic
imports.

## Verified inventory

| Item                                    |  Result |
| --------------------------------------- | ------: |
| TypeScript files under `src`            |     137 |
| JavaScript files under `src`            |     121 |
| Productive/test/tool CommonJS users     |     249 |
| `dist`-loading CommonJS bridges         |      20 |
| Business controller/File/Record bridges |       8 |
| Other infrastructure/config bridges     |      12 |
| Characterization tests                  | 222/222 |
| HTTP route inventory                    |     134 |
| Static circular dependency components   |       0 |
| ESLint warnings                         |       1 |
| Offline `npm audit` vulnerabilities     |       0 |

The audit shell is running Node.js 20.20.2, while `package.json` requires Node `>=22.13.0 <23` and CI pins
22.13.1. Results that depend on the runtime must therefore be reproduced under Node 22 before release.

## Critical

### C-01 — Undefined identifiers remain in reachable business branches — Resolved

Evidence:

- `ProfileContactService.ts` calls `RandString.create()` without importing or declaring `RandString`.
- `RegistrationService.ts` passes `userData` to `User.findById()` without defining `userData`.
- `services/token.js` calls `next()` in `decode()` although no `next` parameter exists.

Impact: valid requests reaching these branches can fail with `ReferenceError`, returning a legacy 500 or
crashing an uncaught execution path.

Risk: critical. The 222 tests exercise route contracts but do not prove every successful conditional
branch. ESLint already reports these symbols, but warnings do not fail CI.

Effort: low.

Recommendation: first add branch-specific characterization tests, then define/import the intended
collaborators without changing response contracts. Promote `no-undef` to an error for JavaScript and add
equivalent TypeScript linting.

Resolution (2026-07-23): three branch-specific characterization tests reproduced the original
`ReferenceError` failures before implementation. `ProfileContactService` now imports its existing
`RandString` collaborator, `RegistrationService` defines the same legacy user projection used by the other
User services, and `Token.decode` accepts the continuation it already invoked. The three new tests pass
without changing their successful response bodies or status codes; all pre-existing characterization tests
also remain passing.

### C-02 — Request data is stored in process-global mutable variables — Resolved

Evidence:

- `globalThis.numPages`, `globalThis.notification`, `globalThis.group`, and `globalThis.image` are used by
  request handlers.
- Tests run with `singleThread: true`, so they do not exercise interleaving requests.

Impact: concurrent requests can overwrite each other's pagination, aggregation, image, or notification
state. This can produce incorrect responses and, for user-specific data, cross-request information
disclosure.

Risk: critical in a multi-request production process.

Effort: medium.

Recommendation: characterize concurrent requests for the affected endpoints, replace global values with
function-local variables, and remove their global declaration augmentations only after equivalent output
is proven.

Resolution (2026-07-23): four deterministic concurrent characterization tests reproduced pagination
cross-contamination, process-global Notification/User state, and shared image input before implementation.
Question/Product pagination, Question notifications, User aggregation state, and Buy/Chat image input now
use request-local variables. The obsolete global declarations were removed. The concurrent tests pass with
independent results and unchanged HTTP payload/status structures.

## High

### H-01 — The quality gate does not meaningfully lint TypeScript — Resolved

Impact: strict compilation catches type errors, but unused imports, unsafe patterns, complexity, and many
logic defects in 137 TypeScript files are not enforced by ESLint.

Risk: high. The current lint command exits successfully with 29 warnings, scans generated `dist`, disables
`no-unused-vars`, and has no TypeScript-specific parser/rules.

Effort: medium.

Recommendation: in a dedicated tooling change, ignore `dist`, lint canonical TS source, fail on core
correctness warnings, and introduce complexity/unused-code rules gradually with a recorded baseline.

Resolution (2026-07-23): ESLint now parses and inspects canonical `src/**/*.ts` files, applies ESLint's
recommended correctness rules as errors, retains a separate legacy JavaScript policy, and excludes
`dist/**` completely. Because the official TypeScript ESLint parser does not yet declare TypeScript 7
compatibility, the ESLint 9-compatible Babel parser is used for TypeScript syntax while `tsc --strict`
remains the semantic type gate. CI already runs lint before build/tests. The accepted baseline is one
warning: `SearchUseCases.filter` has complexity 26 against the warning threshold of 25; no lint errors are
accepted.

### H-02 — Characterization coverage excludes canonical TypeScript source — Resolved

Impact: `vitest.config.js` includes only `src/**/*.js`, so coverage reporting measures legacy JavaScript and
bridges rather than most active compiled implementations.

Risk: high. A green coverage artifact can materially misrepresent tested application code.

Effort: medium.

Recommendation: enable source-map-aware TypeScript coverage, exclude one-line bridges, and establish
per-layer thresholds only after validating parity with the historical report.

Resolution (2026-07-23): coverage now runs Vitest under `c8` only when `--coverage` is requested. This is
required because the characterization suite loads compiled CommonJS modules through native `require()`,
which Vitest 1.6's built-in coverage transform does not observe. V8 execution data is remapped through the
existing TypeScript source maps to canonical `src/**/*.ts` files. The report also retains substantive
legacy JavaScript, excludes declarations and all identified one-line CommonJS bridges, and contains no
`dist/**` entries. No coverage threshold is introduced until a representative per-layer baseline is
agreed.

### H-03 — Configuration secrets are optional and not validated at startup — Resolved

Impact: JWT, Cloudinary, Twilio, and Mailjet credentials may be `undefined`; failures then occur inside live
requests or provider calls.

Risk: high. Missing JWT configuration can break authentication semantics, while provider failures are late
and difficult to diagnose.

Effort: low to medium.

Recommendation: add a typed startup validation boundary with environment-specific required fields. Keep
existing defaults only where they are an intentional contract.

Resolution (2026-07-23): startup now validates `JWT_SECRET` in every environment and validates Cloudinary,
Mailjet, and Twilio credentials in production. Existing defaults remain unchanged. Missing configuration
is logged with the exact environment-variable names and throws before MongoDB connection or HTTP `listen`.
Dedicated tests cover valid production configuration, missing required values, environment-specific
provider rules, the error message, non-zero process termination, and absence of the listening log.

### H-04 — Server readiness is independent of database readiness — Resolved

Impact: `app.js` begins `db.connect()` asynchronously, while `server.js` immediately starts listening.
Connection failure is logged but does not stop or mark the process unready.

Risk: high. The service can accept traffic while MongoDB is unavailable and can remain alive in a
permanently degraded state.

Effort: medium.

Recommendation: characterize startup behavior, then separate application construction from process
bootstrap and listen only after required dependencies are ready. Add graceful shutdown and readiness
signals.

Resolution (2026-07-23): `app.js` now only constructs/configures the Express application. The process
bootstrap validates configuration, awaits MongoDB, creates HTTP/Socket.IO infrastructure, and calls
`listen` strictly in that order. A MongoDB rejection is logged at fatal level, prevents server creation and
port binding, propagates to the composition root, and terminates the process with a non-zero code. Four
dedicated tests cover successful ordering, absence of `listen` on failure, fatal logging, and real process
termination.

### H-05 — Upload and request-body limits permit resource exhaustion — Resolved

Impact: JSON accepts 50 MB bodies, and Multer defines no file size/count/type limit. Uploaded filenames
include unsanitized `originalname`.

Risk: high for memory, disk, and filename/path abuse on public endpoints.

Effort: medium.

Recommendation: characterize accepted payloads first, then apply explicit body, file size, count, MIME, and
filename policies. Treat any limit reduction as a separately approved contract/security change.

Resolution (2026-07-23): Express now accepts JSON bodies up to 10 MB instead of 50 MB. Multer limits each
file to 10 MB and each request to 10 files, permits JPEG, PNG, WebP, GIF, and PDF content types, and
normalizes stored names to a generated identifier plus a sanitized 120-character basename. Expected
Multer limit failures return HTTP 413, unsupported MIME types return HTTP 415, and partial disk files are
removed before responding. These responses are intentional security-contract changes and apply only to
oversized or invalid uploads. Six dedicated tests cover valid/oversized JSON, valid/oversized files,
unsupported MIME types, excessive file counts, and sanitized storage names.

### H-06 — Production packaging requires development tooling at startup

Impact: release artifacts contain source, `prestart` runs TypeScript, and TypeScript is a dev dependency.
A production-only install cannot reliably build the application before startup.

Risk: high for deployment reproducibility and cold-start failures.

Effort: medium.

Recommendation: produce an immutable release artifact containing validated `dist` output and production
dependencies, or make build and runtime stages explicit in the deployment platform. Do not compile on
production process startup.

### H-07 — Large non-modular JavaScript business slices remain — Resolved

Evidence: the former Account, Bank, Category, Chat, Denounce, and Invest controllers and route
implementations have moved behind the same modular boundaries used by User and Product.

Impact: resolved. These slices now use typed controllers, use cases, repository boundaries, mappers,
contracts, and infrastructure adapters.

Risk: high because future cross-cutting changes must support two architectures.

Effort: high.

Recommendation: migrate one bounded legacy slice at a time using User/Product as the only pattern. Add
characterization cases for successful and failure branches before moving logic.

Resolution (2026-07-23): Category now follows the User/Product module layout with a typed controller,
request DTO/contracts, use-case registry, catalog use cases, repository port/implementation, mapper,
infrastructure gateways, schema adapter, constants, and canonical routes. Its 10 HTTP routes and protected
route rejection are isolated in a dedicated characterization suite with unchanged snapshots. The legacy
router entry point remains as the single required compatibility bridge; obsolete controller and category
list bridges were removed.

Denounce, Invest, Bank/Account, and Chat were then completed as four independently validated groups.
Each now has dedicated characterization coverage and the standard controller → use cases → repository →
mapper → contracts → infrastructure flow. Five obsolete legacy controller files were removed. The five
existing root router bridges remain because `src/router.js` still loads those CommonJS entry points; no
new CommonJS bridges were introduced. Route definitions and schema adapters remain CommonJS only at
active runtime boundaries. All prior snapshots remain byte-equivalent after relocation, so no HTTP
status, JSON response, authentication behavior, or business rule changed.

## Medium

### M-01 — CommonJS remains the dominant module system

Impact: 249 files contain `require`, `module.exports`, or `exports`; TypeScript uses Node16 resolution but
emits into a CommonJS package.

Risk: medium. It complicates static analysis, package exports, tree shaking, and eventual ESM-only SDK
adoption.

Effort: high.

Recommendation: postpone ESM until runtime entry points, routes, schemas, services, and tests are
TypeScript. Then migrate one package boundary with an explicit interop test matrix.

### M-02 — Twenty `dist`-loading bridges remain

Impact: runtime correctness depends on parallel source and generated directory layouts.

Risk: medium. Direct execution without a build fails, and path depth makes moves fragile.

Effort: medium.

Recommendation: retain the eight currently required business entry bridges until their JavaScript
consumers migrate. Re-evaluate the 12 config/infrastructure/shared bridges after the process entry point is
compiled; remove them as consumers disappear rather than adding new bridges.

### M-03 — Compiled TypeScript imports back into the source tree

Impact: repositories, gateways, mappers, constants, and legacy services use deep paths such as
`../../../../../../../src/...`.

Risk: medium. The generated application is not self-contained and depends on both `dist` and source layouts.

Effort: high.

Recommendation: migrate the referenced schemas/domain/constants or provide one stable runtime composition
boundary per module. Avoid additional deep source imports.

### M-04 — Exact type/adapter duplication

Evidence:

- six request DTO adapters are byte-for-byte equivalent;
- three `MongoObjectId` module adapters are identical;
- File and Reputation legacy gateways are duplicated between Buy and Payment;
- PaymentRepository and several gateway ports are exact duplicates.

Impact: identical behavior has multiple maintenance points and can drift.

Risk: medium.

Effort: low to medium.

Recommendation: reuse existing shared DTO/ObjectId contracts where architecture permits. Consolidate only
stateless technical adapters; retain module ports when they express ownership or dependency inversion.

### M-05 — High-complexity hotspots lack explicit complexity gates

Evidence from a lexical branch scan:

- `src/product/record.ts`: 610 lines, 52 branch tokens;
- `SearchUseCases.ts`: 290 lines, 38;
- `ProfileService.ts`: 218 lines, 22;
- `QuestionUseCases.ts`: 176 lines, 17;
- `OrderQueryUseCases.ts`: 167 lines, 15.

Impact: changes have wide regression surfaces and are difficult to review.

Risk: medium.

Effort: medium to high.

Recommendation: measure function-level cyclomatic/cognitive complexity with a TS-aware tool, set a
non-regression baseline, and simplify only behind characterization tests. First candidates are Record,
Product Search, User Profile, Question queries, and Buy reporting/order queries.

### M-06 — Global configuration is mutable process state

Impact: `global.config` is assigned by the application, tests, and messaging service.

Risk: medium. Import order affects behavior and tests can leak configuration between cases.

Effort: medium.

Recommendation: inject or import the immutable typed config from a single composition root. Preserve
environment names and defaults during the transition.

### M-07 — Dependency declarations contain likely unused runtime packages

Evidence: no static source reference was found for `enigma-code`, `gridfs-stream`, `http-errors`,
`jsonwebtoken`, or `morgan`. Redis configuration and extensive Redis code remain commented, while no Redis
package is declared.

Impact: manifests communicate capabilities the runtime does not appear to use and increase installation
and audit surface.

Risk: medium because dynamic loading can make static results incomplete.

Effort: low.

Recommendation: confirm with runtime/module-load tracing and deployment telemetry, then remove each unused
package in an isolated dependency-cleanup change. This audit intentionally made no manifest change.

### M-08 — CI security audit is informational only

Impact: known dependency vulnerabilities do not fail CI.

Risk: medium. The current offline audit is clean, but future high/critical findings can ship.

Effort: low.

Recommendation: fail CI on an agreed severity threshold while retaining the JSON artifact for triage and
documenting temporary exceptions with expiry dates.

## Low

### L-01 — Obsolete or misleading configuration remains

Evidence:

- `express.json()` receives `extended` and `parameterLimit`, which are not JSON parser options;
- config still exposes Redis and legacy controller selection values with no active runtime consumer;
- ESLint ignores `services/suggestions.js` because of an unresolved duplicate declaration.

Impact: maintainers infer behavior that does not exist.

Risk: low.

Effort: low.

Recommendation: characterize configuration-dependent behavior, remove inert options/keys, and resolve the
lint exclusion in isolated cleanup commits.

### L-02 — `skipLibCheck` masks declaration incompatibilities

Impact: third-party declaration conflicts are not checked.

Risk: low today, but it can hide issues during SDK or TypeScript upgrades.

Effort: medium.

Recommendation: periodically run a non-blocking typecheck with `skipLibCheck: false`, triage the result,
then decide whether it can become a gate.

### L-03 — Additional strictness flags are not explicit

Evidence: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`,
`noUnusedLocals`, and `noUnusedParameters` are absent. `strict` does enable `noImplicitAny`, but the other
flags are independent.

Impact: indexed access, optional-property semantics, overrides, and unused code receive less checking.

Risk: low to medium depending on the flag.

Effort: medium.

Recommendation: evaluate flags one at a time with an error inventory. Do not enable them together or
silence errors with escape hatches.

### L-04 — Naming and line-ending residue reduces consistency

Evidence: `incrementShema.js`, `denounce.Ctrl.js`, mixed `var`/`let`, and CRLF-formatted legacy middleware.

Impact: searchability and automated tooling are less predictable.

Risk: low.

Effort: low.

Recommendation: correct names only when all import paths are controlled and protected by route/module-load
tests. Normalize line endings mechanically in a dedicated change.

### L-05 — Dead/commented Redis and Socket.IO code obscures active behavior

Impact: `socket/connection.js` contains large commented Redis blocks and a no-op string expression
`('use strict')`.

Risk: low operationally, medium for maintenance comprehension.

Effort: low.

Recommendation: verify Redis is intentionally retired, then delete commented code and remove stale config
in a documentation/cleanup change.

## Nice to Have

### N-01 — Prepare an ESM proof of concept outside production

Impact: establishes the work needed for ESM-only packages without risking the current runtime.

Risk: low if isolated.

Effort: medium.

Recommendation: create a disposable branch/test fixture for the compiled entry point, Mongoose models,
Socket.IO, Vitest, and CommonJS SDK interop. Do not combine it with dependency upgrades.

### N-02 — Replace deep relative imports after source/compiled separation is resolved

Impact: improves readability and move safety.

Risk: low, but aliases can create a new runtime-resolution variant.

Effort: medium.

Recommendation: consider package imports or a documented alias only after one self-contained runtime tree
exists. Keep one resolution strategy across all modules.

### N-03 — Add architecture conformance checks

Impact: prevents new registry/controller/bridge variants and cross-layer imports.

Risk: low.

Effort: medium.

Recommendation: encode the User/Product conventions in a read-only architecture test: allowed folders,
one registry shape, explicit controller maps, no new source-to-`dist` bridges, and permitted dependency
directions.

### N-04 — Add duplicate-code reporting as an advisory gate

Impact: makes adapter and use-case drift visible.

Risk: low.

Effort: low.

Recommendation: start with reporting only, exclude generated output and one-line bridges, and prioritize
semantic duplication rather than forcing abstraction by percentage.

## Simplification candidates

Recommended order, always behind characterization tests:

1. `ProfileContactService` and `RegistrationService`: fix missing collaborators and consolidate repeated
   verification-code flows.
2. Question pagination: replace process globals with local results.
3. `src/product/record.ts`: isolate reputation/category calculations into existing module responsibilities.
4. Product Search/Catalog and Buy Order/Reporting: extract repeated pagination and aggregation construction
   without changing filters.
5. File/Reputation gateways: remove identical adapters once all consumers can use one shared technical
   boundary.
6. Completed: Account, Bank, Category, Chat, Denounce, and Invest now use the User/Product module pattern.

## Prioritized execution roadmap

1. Retain the completed C-01 and concurrent C-02 characterization coverage.
2. Keep critical runtime defects closed without changing HTTP contracts.
3. Correct lint and coverage gates so they inspect canonical TypeScript.
4. Add startup configuration/readiness validation and production artifact packaging.
5. Harden upload/body limits through an explicitly approved security-contract wave.
6. Migrate remaining non-modular JavaScript slices.
7. Consolidate adapters and remove bridges as consumers disappear.
8. Evaluate ESM only after the runtime is self-contained and the remaining JavaScript entry points are gone.

## Audit limitations

- No production traffic, provider sandbox, or production MongoDB environment was inspected.
- Import-cycle detection resolves static relative `require`/`import` paths; dynamic paths are outside its
  scope.
- Complexity figures are lexical hotspot indicators, not a formal function-level cyclomatic score.
- Dependency usage is static and must be confirmed before manifest cleanup.
- The local audit runtime is Node 20.20.2; CI is configured for Node 22.13.1.
