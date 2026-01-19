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
        answer: 'Ответ с ссылкой на [документ](docs/test.md).',
        sources: ['docs/test.md'],
        mode: 'llm',
        timings_ms: { total_ms: 123 },
      }),
    });
  });

  await page.goto('/');

  await page.getByPlaceholder('Задайте вопрос по Bitrix документации...').fill('Как получить список элементов?');
  await page.getByRole('button', { name: 'Ответить' }).click();

  await expect(page.getByText('Ответ с ссылкой', { exact: false })).toBeVisible();
  await expect(page.getByText('Источники (1)')).toBeVisible();
});
