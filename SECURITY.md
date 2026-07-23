# Security Policy

## Supported versions

Security fixes are provided for the current release line only.

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |
| < 1.0   | No        |

When a new major release becomes the supported line, this table will be updated as part of that release.

## Reporting a vulnerability

Do not disclose suspected vulnerabilities in a public issue, discussion, pull request, or chat channel.

Use GitHub's private vulnerability reporting from the repository's **Security** tab and select
**Report a vulnerability**. Include:

- the affected component and version or commit;
- clear reproduction steps or a minimal proof of concept;
- the expected and observed behavior;
- the potential confidentiality, integrity, or availability impact;
- any known workaround or mitigation;
- whether the vulnerability has been disclosed elsewhere.

If private vulnerability reporting is not available, ask a repository administrator for a private security
contact without including vulnerability details in the public request.

The maintainers aim to acknowledge a complete report within five business days. Triage, remediation, and
disclosure timelines depend on severity, exploitability, and the complexity of preserving legacy behavior.
Validated reports are handled through a private GitHub Security Advisory until a coordinated disclosure is
appropriate.

## Update policy

- Dependabot checks npm and GitHub Actions dependencies weekly.
- Minor and patch version updates are grouped where possible to reduce pull-request noise.
- Major updates remain isolated because they require explicit compatibility analysis.
- Security updates are reviewed according to severity and exploitability rather than merged automatically.
- Dependency changes must use the lockfile, pass all quality gates, and preserve the 222 characterization
  tests.
- No dependency update is merged solely because an automated tool recommends it; legacy compatibility,
  release notes, transitive impact, and rollback options must be reviewed.
- `npm audit` runs in CI as an informational control. Findings are retained as artifacts and triaged, but
  currently do not fail the build.
- `npm audit fix` and forced dependency upgrades are not part of the automated pipeline.

## Repository security controls

The baseline includes CodeQL analysis, Dependabot version updates, the GitHub dependency graph, an
informational npm audit report, local Git hooks, and CI quality gates. Repository administrators should also
enable Dependabot alerts, secret scanning, push protection, and private vulnerability reporting in GitHub
repository settings when those features are available.
