# Changelog

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
