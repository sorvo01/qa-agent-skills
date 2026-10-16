---
name: autotest-builder
description: Write, extend or de-flake automated UI and API tests with Playwright (TypeScript) or pytest. Use when a manual case should become an automated test, when a new spec or test file is needed, when a test is flaky, or when someone asks to review test code.
---

# Autotest builder

Goal: tests that fail only when the product is broken, and that tell you why in one glance.

## Before writing code

1. Find the existing setup: `playwright.config.*`, `pytest.ini`/`pyproject.toml`, fixtures,
   helpers, page objects, test data. Extend what is there. Do not add a second framework.
2. Pick the source case. If there is none, write the case first (steps and expected result) in
   the test description, then the code.
3. Decide the layer. Use the cheapest layer that still catches the bug:

| What you want to prove | Layer |
|---|---|
| Business rule, validation, permissions | API test |
| A user can finish a flow in the real UI | One E2E test per flow |
| Rendering of one component in many states | Component test, if the project has them |
| Data really changed | API or DB check after the UI step |

If the project has no framework yet, start with Playwright Test for web and API, and
`pytest` + `requests` for a Python service. Keep the first commit small: config, one fixture,
one passing test, one CI job.

## Locators

Prefer, in this order:

1. `getByRole(role, { name })`, which is also an accessibility check.
2. `getByLabel`, `getByPlaceholder`, `getByText` for static copy.
3. `getByTestId` when the markup is not semantic. Ask devs to add `data-testid` rather than
   using CSS paths.

Never use XPath by index, auto-generated class names, or `nth()` without a reason in a comment.

## Waiting

- Do not use `waitForTimeout` or `sleep`. Wait for a state: `await expect(locator).toBeVisible()`,
  `page.waitForResponse(url)`, or a poll on the API (`expect.poll`).
- Assertions in Playwright retry. Use `expect(locator)` instead of reading text and comparing.
- If something is slow by design (email, queue), poll with a timeout and a clear message.

## Test data and state

- Create what the test needs through the API in a fixture, and clean it up after.
- Unique data per run: suffix with a timestamp or `test.info().workerIndex`.
- Log in once per role with `storageState`, not through the UI in every test.
- Never depend on order between tests. Every test must pass alone with `--grep`.

## Structure

```
tests/
  api/         fast checks of rules and permissions
  e2e/         user flows, few and important
  fixtures/    auth, data builders, API client
  pages/       page objects only when a page is used by 3+ tests
```

Name tests as behaviour: `viewer cannot delete a project`, not `test_delete_3`.
One behaviour per test. Several `expect` lines are fine when they describe that one behaviour.

Examples in `examples/`: a UI flow with API setup, an API permission test, and a pytest version.

## Third parties and side effects

Stub payment providers, email, analytics and maps with `page.route` or a test double, unless the
test is about that integration. Mark real-integration tests with a tag (`@integration`) so CI can
run them separately.

## De-flaking a test

1. Reproduce: `npx playwright test <file> --repeat-each=20 --workers=4`.
2. Open the trace (`--trace on`) of a failed run and find the first step that differs from a pass.
3. Usual causes: a fixed wait, a locator that matches two elements, shared data between workers,
   animation, a request that finishes after the assertion.
4. Fix the cause. Retries in CI are a safety net, not a fix. Never mark a test as skipped without a
   ticket link in the skip reason.

## Definition of done

- The test passes alone and in the full suite, three runs in a row.
- You saw it fail: break the assertion or the app state once and check the failure message makes
  sense.
- No secrets in code. Credentials come from environment variables.
- The test name, the case ID (in an annotation or tag) and the expected result are readable in the
  report.

Report back with: files changed, how to run them, what the tests cover, and anything you could not
automate and why.
