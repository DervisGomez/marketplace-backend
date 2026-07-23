# Changelog

## Shared infrastructure TypeScript completion

- Migrated all remaining runtime files in `src/infrastructure` to strict TypeScript.
- Migrated canonical configuration and four shared technical utilities.
- Added reusable Express request augmentation for correlation IDs.
- Preserved every existing CommonJS import through JavaScript bridges.
- Preserved Mongoose static method binding in the typed repository factory.
- Reached 12 of 238 productive logical modules migrated (5.0% overall).
- Confirmed typecheck, build, 222 characterization tests, and 134 routes remain green.

## Incremental TypeScript migration: infrastructure HTTP

- Added a strict TypeScript build that emits CommonJS-compatible modules.
- Migrated the three shared HTTP infrastructure implementations to TypeScript.
- Retained stable JavaScript bridges for all existing CommonJS consumers.
- Added build/typecheck lifecycle scripts and migration progress documentation.
- Confirmed all 222 characterization tests and all 134 routes remain unchanged.

## Mongoose 8.24.1 evaluation

- Evaluated and adopted only Mongoose 8.24.1 from the committed 7.8.11 baseline.
- Excluded new MongoDB driver metadata from the legacy HTTP error DTO.
- Preserved write results, query policy, index policy, status codes, and JSON bodies.
- Confirmed all 222 characterization tests pass.

## Mongoose 7.8.11 evaluation

- Evaluated and adopted only Mongoose 7.8.11 from the committed 6.13.10 baseline.
- Confirmed removed callbacks, write APIs, and ObjectId construction have no remaining active usages.
- Preserved explicit query and index policies.
- Confirmed all 222 characterization tests pass without additional source compatibility changes.

## Nodemailer dependency removal

- Removed dormant Nodemailer; the application uses Mailjet as its active email provider.
- Completed the external SDK stage with all 222 characterization tests passing.

## Mailjet 6.0.11

- Updated only `node-mailjet` from 3.3.1 to 6.0.11.
- Migrated client construction from `connect()` to `apiConnect()`.
- Made client creation lazy so missing provider credentials do not prevent application startup.
- Preserved the existing send endpoint, payload, result DTO, and error mapping.
- Confirmed all 222 characterization tests pass.

## Twilio 6.0.2

- Updated only Twilio from 3.23.1 to 6.0.2.
- Preserved lazy client creation and the existing `messages.create()` payload.
- Verified client construction without performing an external send.
- Confirmed all 222 characterization tests pass.

## Socket.IO 4.8.3

- Updated only Socket.IO from 2.1.1 to 4.8.3.
- Migrated server construction and room-size access to the current API.
- Enabled `allowEIO3` to preserve compatibility with existing Socket.IO 2 clients.
- Confirmed server initialization and all 222 characterization tests pass.

## Cloudinary 2.10.0

- Updated only Cloudinary from 1.14.0 to 2.10.0.
- Consolidated duplicate startup configuration on the Cloudinary `v2` API.
- Preserved upload return values and failure fallbacks.
- Confirmed all 222 characterization tests pass.

## Multer 2.2.0

- Updated only Multer from 1.4.1 to 2.2.0.
- Preserved the existing destination and generated filename behavior.
- Removed an unused application-level Multer import.
- Confirmed all 222 characterization tests pass.

## Redis dependency removal

- Removed the unused Redis 2 client instead of introducing a new major with no active consumer.
- Confirmed all 222 characterization tests pass.

## Mongoose 6.13.10

- Updated only Mongoose from 5.13.23 to 6.13.10.
- Removed obsolete Mongoose 5 connection flags.
- Preserved permissive query casting with explicit `strictQuery: false`.
- Disabled automatic index creation during application startup.
- Preserved legacy write-result and MongoDB error response JSON.
- Confirmed all 222 characterization tests pass.

## Express 5.2.1

- Updated only Express from 4.17.1 to 5.2.1.
- Removed the unused `body-parser` and `express-promise-router` dependencies.
- Adopted native Express 5 async rejection forwarding.
- Preserved all 134 routes and confirmed all 222 characterization tests pass.

## Mongoose 5.13.23 compatibility

- Updated only Mongoose from 5.6.4 to 5.13.23.
- Preserved legacy error response JSON for MongoDB and validation failures.
- Enabled the unified MongoDB topology engine.
- Confirmed all 222 characterization tests pass on Node.js 22.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Main CI quality-gate pipeline for Node.js 22.13.
- JUnit test reports, coverage reports, and source packages as workflow artifacts.
- Tag-driven GitHub Release workflow with automatically generated release notes.
- Release Engineering and Semantic Versioning documentation.
- Husky hooks with staged-file linting, formatting, and characterization-test protection.
- Team Git workflow documentation.
- CodeQL scanning for pull requests, pushes to `main`, and weekly analysis.
- Weekly Dependabot configuration for npm and GitHub Actions.
- Informational npm audit reports and repository security policy.
- Structured Pino application and HTTP logging with correlation IDs and centralized error logging.
- Sensitive-field redaction and observability integration guidance.

### Changed

- Consolidated active documentation into `README.md` and topic-specific guides under `docs/`.
- Moved completed migration plans, module refactoring notes, audits, reports, and roadmaps to
  `docs/archive/`.

## [1.0.0] - 2026-07-22

### Added

- Current marketplace backend baseline.
- Modular CommonJS architecture on Node.js 22.13 LTS.
- ESLint 9 and Prettier 3 quality tooling.
- 222 characterization tests protecting the observable legacy behavior.
- V8 coverage reporting.

### Notes

- This version records the current modernization baseline.
- Releases package the source without `node_modules`.
- No automated deployment is included.
