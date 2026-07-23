# Git Workflow

## Purpose

This repository uses Husky and lint-staged to apply fast local quality gates before changes reach GitHub.
Local hooks provide early feedback, while GitHub Actions remains the authoritative verification for the
repository.

The hooks do not change application behavior and do not replace code review or CI.

## Installation

Use the supported Node.js version and install the locked dependencies:

```bash
node --version
npm ci
```

The `prepare` lifecycle script runs `husky` after installation and configures Git to use `.husky/` as its
hooks directory. Both Husky and lint-staged are exact development dependencies, so every developer and CI
environment uses the same versions.

If dependencies were installed with lifecycle scripts disabled, initialize the hooks explicitly:

```bash
npm run prepare
```

## Pre-commit

`.husky/pre-commit` runs:

```bash
npx --no-install lint-staged
```

lint-staged receives only paths currently staged in Git:

- JavaScript files run `eslint --fix` and then `prettier --write`.
- JSON, Markdown and YAML files run `prettier --write`.
- Unstaged files are not selected.
- The complete test suite is intentionally not executed during a commit.

The staged-file commands use `.gitignore` as Prettier's ignore source. This keeps generated and sensitive
paths excluded while allowing a legacy source file to be formatted when the team intentionally stages it;
the broader repository-wide formatting quarantine in `.prettierignore` remains unchanged.

lint-staged temporarily protects unstaged changes in partially staged files, applies safe fixes, and stages
the resulting content. If a command fails, the commit is cancelled and the original staged state is
restored.

Before committing, always review the final staged diff:

```bash
git diff --cached
```

## Pre-push

`.husky/pre-push` runs:

```bash
npm test
```

The push proceeds only when all characterization tests pass. A failing test produces a non-zero exit code,
which makes Git cancel the push before any refs are sent to the remote repository.

The pre-push hook currently protects the 222 characterization tests. GitHub Actions repeats the tests and
also runs lint, formatting and coverage checks as the final repository-level quality gate.

## Emergency bypass

Hooks can be bypassed for a genuine emergency:

```bash
git commit --no-verify
git push --no-verify
```

Bypassing a hook must be exceptional, documented in the pull request, and followed by a normal CI run. It
does not bypass GitHub Actions or branch protection. Do not disable hooks globally or remove `.husky/`
files to work around a failure.

## Team practices

- Use Node.js `22.13.x`, as declared by the project.
- Run `npm ci` after switching branches when `package-lock.json` changes.
- Stage intentional changes only; lint-staged operates on the staged snapshot.
- Review `git diff --cached` after automatic fixes.
- Fix hook failures instead of repeatedly bypassing them.
- Keep hooks deterministic, cross-platform and independent of secrets or external services.
- Keep pre-commit fast; add broad or expensive checks to CI rather than this hook.
- Do not add deployment operations to local hooks.
- Treat CI as authoritative because local hooks can be bypassed.

## Troubleshooting

Confirm Husky is active:

```bash
git config core.hooksPath
```

The expected value is `.husky/_`.

If the path is missing or dependencies were reinstalled without scripts, run:

```bash
npm run prepare
```

To inspect what lint-staged would process without making a commit:

```bash
npx --no-install lint-staged --debug
```
