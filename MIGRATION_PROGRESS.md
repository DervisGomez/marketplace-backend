# Migration Progress

Updated: 2026-07-23

## Upgrade stages

| Stage                  | Version                         | Status      | Validation |
| ---------------------- | ------------------------------- | ----------- | ---------- |
| Compatibility baseline | Express 4.17.1 / Mongoose 5.6.4 | Completed   | 222/222    |
| Latest Mongoose 5      | Mongoose 5.13.23                | Completed   | 222/222    |
| Express 5              | Pending                         | Not started | —          |
| Mongoose 6             | Pending                         | Not started | —          |
| External SDKs          | Pending                         | Not started | —          |
| Mongoose 7 evaluation  | Pending                         | Not started | —          |
| Mongoose 8 evaluation  | Pending                         | Not started | —          |

## Completed

- Replaced all active Mongoose `remove()` calls with explicit modern delete operations.
- Replaced all active Mongoose `update()` calls with explicit one/many update operations.
- Preserved the characterized HTTP status codes, JSON bodies, and write-result serialization.
- Converted the remaining Mongoose callback flow to promises.
- Updated every runtime `ObjectId` construction to use `new`.
- Replaced legacy `fields` update options with `projection`.
- Enabled the modern Mongoose find-and-modify implementation on the current dependency line.
- Removed the obsolete custom Mongoose Promise assignment.
- Stopped mutating `req.query`; local copies now carry trusted filters and updates.
- Made the existing extended query parser policy explicit.
- Removed duplicate `body-parser` middleware usage in production and tests.
- Replaced runtime use of `express-promise-router` with native Express routers and the local async error adapter.
- Validated the Express compatibility block and final Mongoose block with 222/222 characterization tests.
- Updated Mongoose alone from 5.6.4 to the final 5.x release, 5.13.23.
- Preserved legacy `MongoError` and `CastError` JSON serialization through an internal response adapter.
- Enabled the unified MongoDB topology engine while still on Mongoose 5.

## Pending

- Remove `body-parser` from `package.json` and `package-lock.json`.
- Remove `express-promise-router` from `package.json` and `package-lock.json`.
- Upgrade Express and Mongoose in separate, future dependency releases.
- After upgrading to Mongoose 6+, remove compatibility-only connection options that newer versions no longer accept.

## Blockers

- The current task explicitly prohibits changes to `package.json` and `package-lock.json`. Consequently,
  obsolete packages are no longer used by application code but cannot yet be removed from the installed
  dependency graph.
- No Express or Mongoose version upgrade is authorized in this compatibility phase.

## Validation

| Gate                                     | Result               |
| ---------------------------------------- | -------------------- |
| Characterization tests                   | 222/222 passing      |
| HTTP route inventory                     | 134 routes preserved |
| Active `.remove()` / `.update()` calls   | 0                    |
| Direct `req.query` mutations             | 0                    |
| Runtime `express-promise-router` imports | 0                    |
| Runtime `body-parser` imports            | 0                    |
