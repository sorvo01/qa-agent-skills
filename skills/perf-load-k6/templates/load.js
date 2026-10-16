// k6 load script with five profiles. Example target: the public k6 test API (https://quickpizza.grafana.com).
//   k6 run --env PROFILE=smoke load.js
//   k6 run --env BASE_URL=https://staging.example.test --env PROFILE=load --summary-export=summary.json load.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://quickpizza.grafana.com';
const PROFILE = __ENV.PROFILE || 'smoke';
const TARGET_RPS = Number(__ENV.TARGET_RPS || 10); // journeys per second at "expected peak"

const profiles = {
  smoke: { executor: 'constant-vus', vus: 1, duration: '30s' },
  load: {
    executor: 'ramping-arrival-rate', startRate: 1, timeUnit: '1s',
    preAllocatedVUs: 50, maxVUs: 200,
    stages: [
      { target: TARGET_RPS, duration: '3m' },
      { target: TARGET_RPS, duration: '15m' },
      { target: 0, duration: '1m' },
    ],
  },
  stress: {
    executor: 'ramping-arrival-rate', startRate: 1, timeUnit: '1s',
    preAllocatedVUs: 100, maxVUs: 1000,
    stages: [1, 2, 3, 4, 5].map((k) => ({ target: TARGET_RPS * k, duration: '4m' })),
  },
  spike: {
    executor: 'ramping-arrival-rate', startRate: TARGET_RPS, timeUnit: '1s',
    preAllocatedVUs: 100, maxVUs: 1000,
    stages: [
      { target: TARGET_RPS, duration: '2m' },
      { target: TARGET_RPS * 5, duration: '15s' },
      { target: TARGET_RPS * 5, duration: '2m' },
      { target: TARGET_RPS, duration: '15s' },
      { target: TARGET_RPS, duration: '3m' }, // recovery: latency must come back down
    ],
  },
  soak: {
    executor: 'constant-arrival-rate', rate: TARGET_RPS, timeUnit: '1s',
    duration: '2h', preAllocatedVUs: 50, maxVUs: 300,
  },
};

export const options = {
  scenarios: { main: profiles[PROFILE] },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
    'http_req_duration{journey:browse}': ['p(95)<500'],
    'http_req_duration{journey:order}': ['p(95)<1000'],
  },
};

const between = (min, max) => Math.random() * (max - min) + min;

export default function () {
  // 70% of journeys only browse, 30% place an order: from the workload model.
  if (Math.random() < 0.7) {
    group('browse', () => {
      const res = http.get(`${BASE_URL}/`, { tags: { journey: 'browse' } });
      check(res, {
        'browse: status 200': (r) => r.status === 200,
        'browse: page has content': (r) => (r.body || '').length > 500,
      });
    });
    sleep(between(1, 3));
  } else {
    group('order', () => {
      const res = http.post(
        `${BASE_URL}/api/pizza`,
        JSON.stringify({ maxCaloriesPerSlice: 1000, mustBeVegetarian: false, excludedIngredients: [], excludedTools: [], maxNumberOfToppings: 5, minNumberOfToppings: 2 }),
        { headers: { 'Content-Type': 'application/json', Authorization: 'token abcdef0123456789' }, tags: { journey: 'order' } },
      );
      check(res, {
        'order: status 200': (r) => r.status === 200,
        'order: pizza returned': (r) => r.status === 200 && r.json('pizza.name') !== undefined,
      });
    });
    sleep(between(2, 5));
  }
}
