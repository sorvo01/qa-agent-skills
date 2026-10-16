# QA Agent Skills

Six [Claude Code](https://docs.claude.com/en/docs/claude-code) skills for hands-on software testing.
Each one is a short, opinionated procedure the agent follows, with templates and runnable examples.

**Showcase:** a simulated run and a real (anonymized) case for every skill:
[sorvo01.github.io/qa-agent-skills/showcase](https://sorvo01.github.io/qa-agent-skills/showcase/)

| Skill | Use it to | Ships with |
|---|---|---|
| [`testcase-designer`](skills/testcase-designer/SKILL.md) | Turn a story, spec or running feature into a risk-ranked set of test cases | CSV template, Gherkin example |
| [`autotest-builder`](skills/autotest-builder/SKILL.md) | Write or de-flake Playwright (TypeScript) and pytest tests | UI flow, API permission test, pytest version |
| [`ci-github-actions`](skills/ci-github-actions/SKILL.md) | Run tests in GitHub Actions: PR checks, sharding, nightly regression | `tests.yml`, `nightly.yml` |
| [`perf-load-k6`](skills/perf-load-k6/SKILL.md) | Plan and run load tests with k6, SLO thresholds, one-page report | `load.js` with five profiles, report template |
| [`explore-session`](skills/explore-session/SKILL.md) | Run a chartered exploratory session with notes and a debrief | charter plan, session notes |
| [`web3-synpress`](skills/web3-synpress/SKILL.md) | Test dApps with Synpress + MetaMask and verify results on-chain | wallet setup, transfer spec, config |

## Install

```bash
git clone https://github.com/sorvo01/qa-agent-skills
cp -r qa-agent-skills/skills/* ~/.claude/skills/        # for all projects
# or: cp -r qa-agent-skills/skills/* <your-project>/.claude/skills/
```

Then ask Claude Code in plain words ("write test cases for STORY-12", "add a k6 smoke to CI",
"explore the checkout as a viewer") or call a skill by name, for example `/explore-session`.

## How the skills fit together

```
explore-session ──► bugs, ideas
       │
testcase-designer ──► cases marked automate: yes ──► autotest-builder ──► ci-github-actions
                                                        │                     ▲
                                              web3-synpress (dApps)   perf-load-k6 (nightly smoke)
```

## What was checked

- `autotest-builder/examples/todo-flow.spec.ts`: 2 passed against the public Playwright TodoMVC demo;
  the API examples type-check with `tsc --strict`.
- `ci-github-actions/templates/*.yml`: pass `actionlint`.
- `perf-load-k6/templates/load.js`: smoke profile passes all thresholds against the public k6 demo API.
- `web3-synpress/examples`: type-check against Synpress 4.1 (`moduleResolution: Bundler`).
  Running it needs your dApp, a local Anvil chain and the Synpress cache.

## Principles behind the skills

- Risk first: coverage follows impact, not the number of screens.
- A test you have never seen fail is not a test yet.
- The source of truth wins: the database for data, the chain for Web3, the receipt for payments.
- Evidence at the moment of the bug, not reconstructed later.
- Test accounts and throwaway wallets only. Nothing here needs production data.

## Author

Volodymyr Sorochan, Senior QA and Security Engineer. 10+ years in test automation and security
testing: enterprise identity and access management at Broadcom, Web3 at Tally, API security of a
SASE platform. CEH, ISTQB Advanced (Test Manager, Test Analyst), ISTQB Testing with Generative AI,
Claude Certified Architect.

MIT licensed.
