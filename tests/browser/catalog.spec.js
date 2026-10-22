import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectViewportFit } from './helpers.js';

async function catalog(page) {
  await page.goto('/gallery/');
  await expect(page.locator('body')).toHaveAttribute('data-catalog-ready', 'true');
  await page.evaluate(() => document.fonts.ready);
}

test('catalog covers every reference family, provides source markup and loads the artwork pack', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await catalog(page);
  await expect(page.locator('.catalog-card')).toHaveCount(37);
  await expect(page.locator('#catalog-total')).toHaveText('37 component families');
  await expect(page.locator('#catalog-artwork .catalog-asset')).toHaveCount(28);
  await expect(page.locator('#counters')).toContainText('149 findings');
  await expect(page.locator('#menu-tabs').getByRole('tab', { name: 'Available in build' })).toBeVisible();
  await page.locator('#dropdowns').getByRole('combobox', { name: 'Status filter', exact: true }).click();
  await page.getByRole('option', { name: 'Completed', exact: true }).click();
  await expect(page.locator('#catalog-select-state')).toHaveText('Current status value: done');
  await page.locator('#roster').getByRole('button', { name: 'Show populated state' }).click();
  await expect(page.locator('#catalog-roster-count')).toHaveText('2');
  await expect(page.locator('#catalog-roster-content')).toContainText('Driver 01');
  await page.locator('#roster').getByRole('button', { name: 'Show empty state' }).click();
  for (const id of ['counters', 'menu-tabs', 'dropdowns', 'destination', 'filters', 'roster', 'empty-state', 'search-refresh']) {
    const demo = page.locator(`#${id} .catalog-demo`);
    await demo.screenshot({ path: `test-results/reference-${id}.png` });
  }
  await page.locator('#drawers .catalog-source summary').click();
  await expect(page.locator('#catalog-source-drawers')).toContainText('<dialog');
  expect(errors).toEqual([]);
});

test('catalog search, category filters and reset expose useful complete specimens', async ({ page }) => {
  await catalog(page);
  await page.locator('#catalog-search').fill('dropdown');
  await expect(page.locator('.catalog-card:visible')).toHaveCount(1);
  await expect(page.locator('#dropdowns')).toBeVisible();
  await page.getByRole('group', { name: 'Component category' }).getByRole('button', { name: 'Data', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No matching components' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.locator('.catalog-card:visible')).toHaveCount(37);
  await page.getByRole('group', { name: 'Component category' }).getByRole('button', { name: 'Identity', exact: true }).click();
  await expect(page.locator('#destination')).toBeVisible();
  await expect(page.locator('#dropdowns')).toBeHidden();
});

test('download skins, preview, drawer back navigation and refresh behave as demonstrated', async ({ page }) => {
  await catalog(page);
  const treatment = page.locator('#downloads').getByRole('combobox', { name: 'Treatment', exact: true });
  await treatment.click(); await page.getByRole('option', { name: 'Paradise skyline' }).click();
  await expect(page.locator('#catalog-download')).toHaveAttribute('data-skin', 'skyline');
  await page.getByRole('button', { name: 'Preview sample contents' }).click();
  await expect(page.getByRole('dialog', { name: 'Sample build contents' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Inspect translation unit', exact: false }).click();
  await page.getByRole('button', { name: 'Inspect an example function', exact: false }).click();
  await expect(page.locator('#catalog-detail-title')).toHaveText('ExampleCamera::Update');
  await page.getByRole('button', { name: 'Back to unit', exact: false }).click();
  await expect(page.locator('#catalog-detail-title')).toHaveText('BrnCamera.cpp');
  await page.keyboard.press('Escape');
  await page.locator('#catalog-refresh').click();
  await expect(page.locator('#catalog-refresh-result')).toContainText('Example refreshed just now');
});

test('catalog passes automated WCAG AA checks, including an open custom dropdown', async ({ page }) => {
  test.setTimeout(45000);
  await catalog(page);
  const scan = () => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect((await scan()).violations).toEqual([]);
  await page.locator('#dropdowns').getByRole('combobox', { name: 'Status filter', exact: true }).click();
  expect((await scan()).violations).toEqual([]);
});

for (const width of [360, 390, 768]) {
  test(`catalog reference components fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await catalog(page);
    await expectViewportFit(page);
    const combo = page.locator('#dropdowns').getByRole('combobox', { name: 'Status filter', exact: true });
    await combo.click();
    const rect = await page.getByRole('listbox', { name: 'Status filter', exact: true }).boundingBox();
    expect(rect.x).toBeGreaterThanOrEqual(0); expect(rect.x + rect.width).toBeLessThanOrEqual(width);
    await page.keyboard.press('Escape');
    if (width === 390) {
      await page.locator('#destination .catalog-demo').screenshot({ path: 'test-results/reference-destination-mobile.png' });
      await page.locator('#roster .catalog-demo').screenshot({ path: 'test-results/reference-roster-mobile.png' });
    }
  });
}
