// API permission test pattern. Point BASE_URL at your service and provide tokens per role:
//   BASE_URL=https://staging.example.test ADMIN_TOKEN=... VIEWER_TOKEN=... npx playwright test
import { test, expect, request, APIRequestContext } from '@playwright/test';

const baseURL = process.env.BASE_URL!;
const asRole = (token: string) =>
  request.newContext({ baseURL, extraHTTPHeaders: { Authorization: `Bearer ${token}` } });

let admin: APIRequestContext;
let viewer: APIRequestContext;
let projectId: string;

test.beforeAll(async () => {
  admin = await asRole(process.env.ADMIN_TOKEN!);
  viewer = await asRole(process.env.VIEWER_TOKEN!);
  const res = await admin.post('/api/projects', { data: { name: `qa-${Date.now()}` } });
  expect(res.status()).toBe(201);
  projectId = (await res.json()).id;
});

test.afterAll(async () => {
  await admin.delete(`/api/projects/${projectId}`);
  await admin.dispose();
  await viewer.dispose();
});

test('viewer cannot delete a project', { annotation: { type: 'case', description: 'TC-AUTH-003' } }, async () => {
  const res = await viewer.delete(`/api/projects/${projectId}`);
  expect(res.status()).toBe(403);

  // The deny must be real, not only a status code.
  const check = await admin.get(`/api/projects/${projectId}`);
  expect(check.status()).toBe(200);
});

test('viewer cannot rename a project by sending extra fields', async () => {
  const res = await viewer.patch(`/api/projects/${projectId}`, { data: { name: 'hijacked', ownerId: 'me' } });
  expect([403, 404]).toContain(res.status());
  const after = await (await admin.get(`/api/projects/${projectId}`)).json();
  expect(after.name).not.toBe('hijacked');
});
