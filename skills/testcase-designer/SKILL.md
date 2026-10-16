---
name: testcase-designer
description: Turn a user story, spec, ticket or a running feature into a small, risk-ranked set of test cases with traceability. Use when someone asks for test cases, a checklist, acceptance tests or Gherkin scenarios, or wants to know whether existing cases cover a change.
---

# Test case designer

Goal: the fewest cases that would catch the bugs that matter, each one runnable by someone who
has never seen the feature.

## Inputs to collect first

Ask for whatever is missing, in one message:

1. The source: story, spec, ticket key, design link, or the URL of the running feature.
2. Who uses it (roles) and what they must never be able to do.
3. Where the cases go: CSV for a test management tool, Markdown, or Gherkin.
4. Anything already covered by automation, so you do not duplicate it.

If you can open the feature (browser tool, API docs), look at it before writing. Cases written
from the spec alone miss what the build actually does.

## Build a risk list before any case

Write a short table first. Every case you write later must point to a row here.

| # | What can go wrong | Impact (H/M/L) | Likelihood (H/M/L) |
|---|---|---|---|

Typical sources of risk: money and billing, access between roles or tenants, data that can be lost
or leaked, anything irreversible, integrations, and whatever changed in this release.
Order the rows by impact first. High impact rows get several cases, low ones may get none.

## Pick a technique per input, not per feature

| Input looks like | Use | Example |
|---|---|---|
| A range or a length | Boundary values: min-1, min, max, max+1 | password 8..64 chars |
| A set of options | One case per class, plus an invalid one | card, PayPal, unknown |
| Rules that combine | Decision table, one case per column that changes the outcome | discount if member AND cart > 100 |
| A lifecycle | State transitions, including the forbidden ones | draft → published → archived |
| Many independent parameters | Pairwise, not the full product | browser × locale × plan |
| A permission | Role × action matrix, deny cases first | viewer tries to delete |

Always add the cases nobody writes down: empty input, double submit, back button after submit,
two tabs, slow network, session expired mid-flow, and the same action by a second user.

## Case format

One case checks one behaviour. Use this shape (CSV columns are in `templates/test-cases.csv`):

```
ID:        TC-<area>-<nnn>
Title:     <actor> <does what> → <expected outcome>   (readable as a sentence)
Risk:      R<row from the risk table>
Priority:  P1 blocks release | P2 must fix soon | P3 nice to have
Preconditions: data and state, concrete ("user with an expired card", not "a user")
Steps:     numbered, one action each, no "verify" inside steps
Expected:  observable result, with exact text or values where they matter
Source:    story key or spec section
```

Rules that keep cases runnable:

- Concrete data in the case or in a named fixture. Never "valid data".
- Expected results a stranger can check. "Works correctly" is not a result.
- No dependency on another case's leftovers. Each case sets up its own state.
- If a step needs an API call or a database check, say which one.

For Gherkin, one scenario per case, `Given` holds the preconditions, a single `When`, and `Then`
lines that each assert one thing. Use `Scenario Outline` only for real boundary tables.

## Self-check before handing over

Go through this list and fix, do not just report:

- Every high-impact risk has at least one negative case.
- Every role in the matrix has at least one deny case.
- No two cases differ only in wording.
- Each title still makes sense without the steps.
- You can name, for each case, the bug it would catch. Delete the ones where you cannot.

## Output

1. The risk table.
2. The cases in the requested format.
3. A coverage note: which risks have no case and why (out of scope, needs data, needs a decision).
4. Open questions for the product owner, phrased so they can answer yes or no.

Keep automation advice separate: mark cases as `automate: yes` when they are stable, repeated every
release and cheap to set up. The `autotest-builder` skill picks them up from there.
