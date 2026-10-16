// UI flow against the public Playwright TodoMVC demo, runnable as is:
//   npx playwright test examples/todo-flow.spec.ts
import { test, expect } from '@playwright/test';

const APP = 'https://demo.playwright.dev/todomvc/';

test.describe('todo list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP);
  });

  test('user adds two todos and completes one → counter shows 1 item left', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Write test cases');
    await input.press('Enter');
    await input.fill('Automate the P1 cases');
    await input.press('Enter');

    const items = page.getByTestId('todo-item');
    await expect(items).toHaveCount(2);

    await items.filter({ hasText: 'Write test cases' }).getByRole('checkbox').check();

    await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
    await expect(items.filter({ hasText: 'Write test cases' })).toHaveClass(/completed/);
  });

  test('empty todo is not added', async ({ page }) => {
    await page.getByPlaceholder('What needs to be done?').press('Enter');
    await expect(page.getByTestId('todo-item')).toHaveCount(0);
  });
});
