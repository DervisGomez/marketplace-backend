# Migration Progress

Updated: 2026-07-23

## Upgrade stages

| Stage                  | Version                         | Status      | Validation |
| ---------------------- | ------------------------------- | ----------- | ---------- |
| Compatibility baseline | Express 4.17.1 / Mongoose 5.6.4 | Completed   | 222/222    |
| Latest Mongoose 5      | Mongoose 5.13.23                | Completed   | 222/222    |
| Express 5              | Express 5.2.1                   | Completed   | 222/222    |
| Mongoose 6             | Mongoose 6.13.10                | Completed   | 222/222    |
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
- Replaced runtime use of `express-promise-router` with native Express routers.
- Validated the Express compatibility block and final Mongoose block with 222/222 characterization tests.
- Updated Mongoose alone from 5.6.4 to the final 5.x release, 5.13.23.
- Preserved legacy `MongoError` and `CastError` JSON serialization through an internal response adapter.
- Enabled the unified MongoDB topology engine while still on Mongoose 5.
- Updated Express alone from 4.17.1 to 5.2.1.
- Removed `body-parser` and `express-promise-router` after replacing their runtime behavior.
- Switched async rejection handling to native Express 5 behavior.
- Updated Mongoose alone from 5.13.23 to 6.13.10.
- Removed obsolete Mongoose 5 connection options and explicitly preserved `strictQuery: false`.
- Disabled startup-time automatic index creation to preserve characterized query behavior.
- Mapped Mongoose 6 write results and driver errors back to their legacy HTTP DTOs.

## Pending

- Upgrade external SDKs one at a time, each with its own validation and commit.

## Blockers

- External SDK upgrades remain deferred until the Mongoose 6 stage is complete.

## Validation

| Gate                                     | Result               |
| ---------------------------------------- | -------------------- |
| Characterization tests                   | 222/222 passing      |
| HTTP route inventory                     | 134 routes preserved |
| Active `.remove()` / `.update()` calls   | 0                    |
| Direct `req.query` mutations             | 0                    |
| Runtime `express-promise-router` imports | 0                    |
| Runtime `body-parser` imports            | 0                    |
