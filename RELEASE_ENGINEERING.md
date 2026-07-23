# Release Engineering

## Purpose

This document defines how the backend is validated, packaged, versioned, and released. The pipeline deliberately
stops before deployment: a release is a tested, immutable delivery candidate, not an automatic production change.

The project uses Node.js 22.13, npm lockfile installs, CommonJS, ESLint 9, Prettier 3, Vitest, and GitHub Actions.

## Pipeline architecture

Two workflows separate continuous integration from release publication.

### Main CI pipeline

File: `.github/workflows/ci.yml`

The workflow runs for pushes to `master` or `main`, pull requests, and as a reusable workflow invoked by the
release pipeline.

The quality job executes these stages in order:

1. Checkout the exact commit.
2. Install Node.js 22.13.1 and enable the npm cache.
3. Run `npm ci` using `package-lock.json`.
4. Run `npm run lint`.
5. Run `npm run format:check`.
6. Run `npm test` with the default and JUnit reporters.
7. Run `npm run test:coverage`.
8. Build a source archive from the Git commit.
9. Publish coverage, test reports, and the source package.
10. Write a quality-gate table to the GitHub Actions job summary.

The workflow uses least-privilege read access and cancels superseded CI runs on the same ref.

### Release pipeline

File: `.github/workflows/release.yml`

The release workflow runs only for tags matching `v*`. Before creating a release, it:

1. Invokes the reusable CI workflow against the tagged commit.
2. Rejects tags that are not valid Semantic Versions.
3. Downloads the artifacts produced by that same workflow run.
4. Packages the coverage report for attachment.
5. Creates a GitHub Release with automatic release notes.
6. Attaches the source archive, JUnit report, and coverage archive.

It does not deploy, publish to npm, build a container, or change an external environment.

## Quality gates

A commit is a valid release candidate only if all of these gates pass:

| Gate | Command | Purpose |
| --- | --- | --- |
| Dependency installation | `npm ci` | Reproducible installation from the lockfile |
| Static analysis | `npm run lint` | ESLint 9 code-quality rules |
| Formatting | `npm run format:check` | Prettier 3 formatting contract |
| Characterization | `npm test` | Observable behavior protected by 222 tests |
| Coverage | `npm run test:coverage` | V8 HTML and LCOV coverage generation |
| Packaging | `git archive` | Immutable tracked source without `node_modules` |

Coverage is currently recorded and published. A numeric coverage threshold should only be introduced after the
team agrees on a baseline and verifies that it does not incentivize low-value tests.

## Artifacts

### Coverage report

The `coverage-report-<commit-sha>` artifact contains the HTML report and `lcov.info`. CI retains it for 14 days.

### Test report

The `test-reports-<commit-sha>` artifact contains `junit.xml`. CI retains it for 14 days. GitHub does not interpret
JUnit natively, but the format is suitable for future test-reporting integrations.

### Source package

The `release-package-<commit-sha>` artifact contains `veyco-backend-source.tar.gz`. It is generated from the Git
tree rather than the working directory, so it:

- represents the exact validated commit;
- excludes `node_modules`;
- excludes ignored and untracked local files;
- is reproducible from the same commit.

CI retains source packages for 30 days. Release assets are retained by the GitHub Release and additionally as a
90-day workflow artifact.

## Semantic Versioning

Versions follow `MAJOR.MINOR.PATCH`.

- **MAJOR:** incompatible API contract or observable behavior change.
- **MINOR:** backward-compatible functionality.
- **PATCH:** backward-compatible fixes and internal changes.

Examples:

- `v1.0.1`: internal pipeline or documentation correction.
- `v1.1.0`: backward-compatible endpoint or capability.
- `v2.0.0`: intentionally incompatible API or behavior.

Pre-release versions may use forms such as `v2.0.0-rc.1`. Build metadata is valid SemVer, but should not normally
be used for GitHub release tags.

The package version, changelog version, and Git tag should agree for a planned product release. The pipeline does
not mutate `package.json`; version changes remain an explicit, reviewed source change.

## Changelog strategy

`CHANGELOG.md` follows Keep a Changelog.

During development:

1. Add user-visible or operationally significant entries under `[Unreleased]`.
2. Group entries under `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, or `Security`.
3. Describe effects, not commit mechanics.

When preparing a release:

1. Confirm all intended changes are under `[Unreleased]`.
2. Create a version heading with the release date.
3. Leave a new empty `[Unreleased]` section.
4. Update the version in `package.json` and `package-lock.json` in a dedicated reviewed change.
5. Merge only after CI passes.

## Creating a release

### 1. Prepare the release change

- Select the next version according to Semantic Versioning.
- Update `CHANGELOG.md`.
- Update `package.json` and `package-lock.json` without running `npm update`.
- Open a pull request and wait for all quality gates.

### 2. Tag the validated commit

After merging, create an annotated tag on the exact commit:

```bash
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

### 3. Observe the release workflow

The tag starts the Release workflow. It reruns all quality gates. GitHub creates the release only after they pass.
If validation fails, no release is created.

### 4. Verify the release

Confirm that:

- automatic release notes are present;
- the source archive is attached;
- the JUnit report is attached;
- the coverage archive is attached;
- no deployment occurred.

Do not move or recreate a published version tag. Correct a release with a new patch version.

## Rollback and failed releases

Because this pipeline does not deploy, rollback means preventing a bad candidate from being consumed:

- A failing quality gate creates no GitHub Release.
- If a release is found invalid after publication, mark it as a pre-release or document the issue.
- Fix the issue and publish a new patch version.
- Do not overwrite the existing tag or binary assets.

Future deployment pipelines should roll back by redeploying a previously approved release artifact, never by
rebuilding an old branch.

## Adding Continuous Delivery later

Deployment should be added as a separate workflow or job that consumes an existing GitHub Release artifact. It
must not rebuild application source independently.

Recommended future flow:

```text
CI quality gates
        ↓
GitHub Release
        ↓
Environment approval
        ↓
Deploy immutable release artifact
        ↓
Health check
        ↓
Promote or roll back
```

Before adding any provider, define:

- staging and production GitHub Environments;
- required reviewers for production;
- environment-specific secrets;
- health and readiness checks;
- database migration policy;
- rollback procedure;
- deployment concurrency;
- post-deployment observability.

### Render

Add a deployment job that runs after a release is published and invokes a Render deploy hook or API using a
GitHub Environment secret. Prefer deploying a release-specific artifact or immutable commit rather than tracking
an unprotected branch.

### Railway

Use a Railway project token stored in a GitHub Environment. Pin the deployment to the release commit and keep
staging and production as separate environments. Production should require manual approval.

### Docker

When containerization is introduced, build the image once after CI, tag it with the Semantic Version and commit
SHA, generate an SBOM, scan it, and publish it to a registry. Deployment jobs must promote the same image digest
across environments.

### VPS

Use a restricted deployment identity and transfer or pull the signed release artifact. Extract into a
version-specific directory, switch an atomic `current` symlink, run health checks, and retain the previous version
for rollback. Never copy the developer working tree or `node_modules`.

## Branch protection recommendations

Configure the repository so that:

- pull requests are required for `main` or `master`;
- the `Quality gates` job is required;
- branches must be current before merge;
- force pushes and branch deletion are disabled;
- release tags are protected;
- production environments require reviewers when deployment is added.

These repository settings are intentionally not changed by the workflow files and must be configured by a
repository administrator.

## Extending the pipeline

Future gates should be added before packaging, independently, and with an explicit failure policy. Suitable
additions include:

- dependency vulnerability scanning;
- secret scanning;
- license policy checks;
- test result annotations;
- coverage thresholds;
- package provenance and checksums;
- SBOM generation;
- artifact signing;
- staging smoke tests.

Each stage should remain deterministic and must not mutate production state.
