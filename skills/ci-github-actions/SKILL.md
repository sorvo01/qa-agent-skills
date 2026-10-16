---
name: ci-github-actions
description: Set up or fix GitHub Actions workflows that run automated tests: PR checks, sharded Playwright runs, API tests, nightly regression, performance smoke, test reports as artifacts. Use when tests need to run in CI, when a pipeline is slow or flaky, or when someone asks to make tests a required check.
---

# CI with GitHub Actions

Goal: every pull request gets a fast, trustworthy answer; the slow and expensive checks run on a
schedule; a failure is understandable from the job summary without re-running anything locally.

## Look before you write

1. List `.github/workflows/`. Extend an existing workflow if it already builds the app.
2. Find how tests run locally (`package.json` scripts, `Makefile`, `tox.ini`). CI should call the
   same command, not a copy of it.
3. Find what the tests need: base URL, a running app, a database, secrets, test users.
4. Check how long the suite takes. That decides sharding.

## Pipeline shape

| Trigger | What runs | Time budget |
|---|---|---|
| `pull_request` | lint, unit, API tests, E2E smoke (`@smoke` tag) | under 10 min |
| `push` to main | full E2E, sharded | under 20 min |
| `schedule` nightly | full regression on all browsers, `@integration`, performance smoke | no hard limit |
| `workflow_dispatch` | anything above, with inputs (env, grep, browser) | on demand |

Templates in `templates/`:

- `tests.yml`: PR and main runs, Playwright sharded across 4 jobs, blob reports merged into one
  HTML report, traces kept for failures only.
- `nightly.yml`: scheduled full regression plus a k6 smoke with thresholds.

Copy one, then adapt: the Node version, the install command, how the app starts, the secrets.

## Rules that save hours later

- Pin actions to a major version (`actions/checkout@v4`) or a commit SHA for third-party ones.
- `permissions:` at the top, read-only by default. Add `pull-requests: write` only to the job that
  comments.
- `concurrency:` per branch with `cancel-in-progress: true` for PRs, so a new push stops the old run.
- Cache dependencies with `actions/setup-node` `cache: npm` (or pip). Cache Playwright browsers
  keyed on the Playwright version, or install with `--with-deps` and accept the minute.
- Secrets only through `secrets.*` and `env:`. Never `echo` them. Forked PRs do not get secrets,
  so jobs that need them should skip cleanly on forks.
- `timeout-minutes` on every job. A hung browser should not eat six hours of minutes.
- Upload reports with `if: ${{ !cancelled() }}` so you get them when tests fail.
- Write a short result to `$GITHUB_STEP_SUMMARY`: passed, failed, flaky, link to the report.

## Starting the app under test

Pick one and write it down in the workflow comment:

1. Test a deployed preview or staging URL passed as `BASE_URL`. Simplest, but the environment
   must match the commit (wait for the deploy, or read the URL from the deployment event).
2. Start the app in the job: `npm run build && npm start &` then wait for the port
   (`npx wait-on http://localhost:3000`). Playwright `webServer` in the config does the same.
3. Services the app needs (Postgres, Redis) go in `services:` with health checks.

## Flaky tests in CI

- `retries: 2` in CI only, and report flaky tests separately. A test that passed on retry is
  still a bug to fix.
- Same shard keeps failing: check for shared test data between workers first.
- Upload traces and videos on failure only; full traces on every test make artifacts huge.

## Making it a gate

When the job has been green and stable for a week, add it as a required status check in branch
protection. Required checks must have a stable job name, so do not put matrix values into the name
of the job you require; require the merge-report job instead.

## Verify before handing over

- Validate YAML (`actionlint` if available, otherwise a YAML parser).
- Push to a branch and open a draft PR; confirm the jobs start, the shards split the tests, and the
  report artifact opens.
- Break one test on purpose and confirm the summary shows it clearly. Then revert.

Report back with: the workflow files, what triggers what, expected duration, the secrets that must
be added in repo settings, and what still runs only locally.
