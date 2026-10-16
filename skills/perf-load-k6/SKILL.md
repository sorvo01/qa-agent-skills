---
name: perf-load-k6
description: Plan, script, run and explain API and backend performance tests with k6: workload model, SLO thresholds, smoke/load/stress/spike/soak profiles, CI smoke, and a one-page result summary. Use when someone asks whether a service will hold a load, why an endpoint is slow, or how to add performance checks to a release.
---

# Performance testing with k6

Goal: a number someone can make a decision on ("checkout holds 120 orders per minute at p95 under
800 ms, breaks at about 300"), plus the evidence behind it.

## Safety first

- Never point load at production or a shared environment without a written yes from the owner,
  a time window, and someone watching the dashboards.
- Start every new script with the `smoke` profile (1 to 2 users). Fix errors there, not at 500 users.
- Use test accounts and test payment modes. Load tests create real data; plan its cleanup.

## Step 1: the workload model

Fill this table before writing code. Ask for production analytics or logs; if there are none,
write down the assumption and who agreed to it.

| User journey | Share of traffic | Requests per journey | Think time | Target rate |
|---|---|---|---|---|
| Browse catalog | 60% | 4 | 3-8 s | |
| Search | 25% | 2 | 2-5 s | |
| Checkout | 15% | 6 | 5-10 s | |

Target rate = peak hour traffic × growth margin (usually × 2 for "will we survive a campaign").
Model by arrival rate (`constant-arrival-rate`, `ramping-arrival-rate`) when you know requests per
second; by virtual users only when you know concurrent sessions.

## Step 2: SLOs as thresholds

Agree the numbers, then encode them so the run fails on its own:

```js
thresholds: {
  http_req_failed: ['rate<0.01'],                       // under 1% errors
  'http_req_duration{journey:checkout}': ['p(95)<800'],  // per journey, not only global
  'http_req_duration{journey:browse}': ['p(95)<400'],
  checks: ['rate>0.99'],
}
```

Tag requests by journey so one slow endpoint does not hide inside a global average.
Averages are not SLOs. Use p95 and p99.

## Step 3: pick the profile

| Profile | Question it answers | Shape |
|---|---|---|
| smoke | Does the script work? | 1-2 VUs, 1 min |
| load | Do we meet SLOs at expected peak? | ramp to target, hold 10-30 min |
| stress | Where does it break, and how? | step up past target until errors or latency explode |
| spike | Do we survive a sudden burst and recover? | jump to 5× in seconds, then back |
| soak | Do we leak memory or connections? | target load for 2-8 h |

`templates/load.js` has all five, selected with `--env PROFILE=<name>`.

## Step 4: a script that measures the right thing

- Each iteration is one realistic journey with `group()` and a journey tag.
- `check()` the response body, not only the status. A 200 with an error page is a failure.
- Data from `SharedArray` (CSV/JSON of test users, product IDs), not one hard-coded user that
  hits the cache every time.
- Think time with `sleep(randomBetween(...))`, otherwise you test a bot, not users.
- Correlate dynamic values (tokens, IDs) from previous responses.
- Static assets and third parties are out of scope unless that is the question.

Run:

```
k6 run --env BASE_URL=https://staging.example.test --env PROFILE=smoke templates/load.js
k6 run --env PROFILE=load --summary-export=summary.json templates/load.js
```

## Step 5: watch the server, not only k6

k6 tells you the symptom. During load and stress runs, capture at the same time: CPU and memory of
app and DB, DB connections and slow queries, queue depth, error logs, autoscaling events.
Note the exact start and end time so the graphs line up with the run.

If the load generator itself hits 80%+ CPU, the numbers are wrong. Use more generators or cloud
execution.

## Step 6: read the results

- Compare to the previous run of the same profile (`summary.json` kept as a baseline).
- Find the knee: the rate where p95 starts climbing faster than the load. That is the practical
  capacity, not the point of total failure.
- Errors first, latency second: a fast 500 is not good performance.
- For each slow journey, say which resource ran out first (CPU, DB pool, locks, external API).

## Output: one page

Use `templates/report.md`:

1. Verdict in one sentence: meets / does not meet the SLOs at the target rate.
2. Table: journey, target, p95, p99, error rate, pass/fail.
3. Capacity: the knee and the breaking point.
4. Bottleneck with evidence (graph or log line) and a suggested fix.
5. What was not tested and the assumptions in the workload model.

For CI, keep only the smoke profile on every merge (thresholds fail the job) and run load tests
nightly or before releases. See the `ci-github-actions` skill.
