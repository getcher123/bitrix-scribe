import { test, expect } from '@playwright/test';

test('ask -> answer -> sources', async ({ page }) => {
  await page.route('**/health', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok' }),
    });
  });

  await page.route('**/history**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [] }),
    });
  });

  await page.route('**/answer', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        answer: 'Answer with a link to the [document](docs/test.md).',
        sources: ['docs/test.md'],
        mode: 'llm',
        timings_ms: { total_ms: 123 },
      }),
    });
  });

  await page.goto('/');

  await page.getByPlaceholder('Ask a question about Bitrix documentation...').fill('How to get the list of elements?');
  await page.getByRole('button', { name: 'Answer' }).click();

  await expect(page.getByText('Answer with a link', { exact: false })).toBeVisible();
  await expect(page.getByText('Sources (1)')).toBeVisible();
});
