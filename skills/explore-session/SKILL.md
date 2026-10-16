---
name: explore-session
description: Run a time-boxed exploratory testing session on a web app or API: write a charter, pick heuristics, drive the product (browser tool or API client), keep session notes, and debrief with bugs, questions and coverage. Use when someone asks to "poke at", "explore", "smoke test by hand", or find bugs in a feature without written cases.
---

# Exploratory session

Exploratory testing is designing and running tests at the same time, guided by what you just saw.
It is not random clicking. It has a mission, a time box and written notes.

## 1. Charter (2 minutes)

One line, written before you start:

> Explore **<target>** with **<resources: role, data, tool, device>** to discover **<information>**.

Examples:

- Explore the checkout with a card that is declined on the second attempt to discover how payment
  errors are shown and whether the order is created twice.
- Explore project sharing with a Viewer and an Editor account in two browsers to discover what a
  Viewer can change through the UI and the API.
- Explore the import of a 10 MB CSV with broken rows to discover how errors are reported.

Time box: 30, 60 or 90 minutes. If the charter is too big for 90 minutes, split it.

## 2. Pick 3 to 5 heuristics for this charter

Do not run all of them. Choose the ones that fit the target.

| Heuristic | Try |
|---|---|
| **Boundaries** | 0, 1, max, max+1, empty, whitespace, very long, unicode, emoji, RTL |
| **Interruptions** | reload mid-flow, back button, close tab, lose network, session expires |
| **Repetition** | double click submit, same request twice, two tabs doing the same thing |
| **Roles and ownership** | same URL as another role, another user's ID in the path or body |
| **State** | do it out of order, undo, cancel halfway, come back tomorrow (change the clock) |
| **Data lifecycle** | create, edit, delete, restore; does every list, count and export agree? |
| **Money** | price shown vs charged vs refunded, currency, rounding, discounts stacking |
| **Errors** | force a 500 or timeout (DevTools / proxy) and see what the user gets |
| **Consistency** | same thing in web, mobile width, email, PDF, API: does it say the same? |
| **Claims** | read the marketing page and help text; test every promise literally |

## 3. Drive the product and keep notes

Use a browser tool (Playwright MCP, Chrome DevTools) or an API client. Keep the console and the
network panel open the whole time: half of real bugs show up there first.

Write notes as you go, in `templates/session-notes.md` format. Each line has a tag:

- `TEST` what you tried
- `BUG` behaviour that is wrong, with steps and evidence
- `ISSUE` a question or a risk, not yet a bug (unclear requirement, missing log, slow page)
- `IDEA` something worth a separate charter later

Capture evidence at the moment you see the problem: screenshot with the faulty element marked,
the request and response, console error, time and account used. Evidence collected later is often
gone.

Follow surprises. If something odd happens, stay on it for a few minutes and narrow it down. Note
that you left the charter, so the debrief can show it.

## 4. Writing a bug from the session

```
Title:    <where> <what happens> when <condition>
Env:      build/URL, browser or device, account role
Steps:    numbered, minimal, start from a known state
Expected: what should happen, and why (spec, common sense, another screen)
Actual:   what happened, exact text, request/response if relevant
Evidence: screenshot (element marked), trace or HAR, console line
Severity: P1 data loss, money, security, blocked flow | P2 major function wrong | P3 minor | P4 cosmetic
```

Retest once before filing. If it reproduces only sometimes, say how often (3 of 10).
Keep UX opinions separate from bugs: a confusing label is a recommendation, not a P2.

## 5. Debrief (10 minutes)

Answer these, in this order:

1. **Past:** what did you cover against the charter, and what did you not reach?
2. **Results:** bugs (with severity), issues/questions, ideas for new charters.
3. **Obstacles:** what slowed you down (test data, access, unstable env).
4. **Outlook:** what should the next session explore, and how risky is the area now?
5. **Feelings:** your confidence in this area, low/medium/high, in one sentence why.

Use `templates/charter.md` for planning several sessions and `templates/session-notes.md` for the
notes and the debrief.

## Rules

- Never test destructive actions on shared or production data without a written yes.
- Test accounts only; never your personal or a customer's real data.
- If you find a security issue, stop exploring it once it is proven, record minimal evidence, and
  report it privately rather than in a public tracker.
