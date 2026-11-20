import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectViewportFit } from './helpers.js';

test('gallery loads local assets under a strict content policy without errors', async ({ page, baseURL }) => {
  const errors = [];
  const failed = [];
  const external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
  page.on('request', request => { if (new URL(request.url()).origin !== new URL(baseURL).origin) external.push(request.url()); });
  const response = await page.goto('/gallery/examples.html');
  await expect(page.getByRole('heading', { name: 'ONE CITY. ONE UI.' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('16px "B5 Anton"'))).toBe(true);
  expect(response.headers()['content-security-policy']).not.toContain('unsafe-inline');
  expect(errors).toEqual([]); expect(failed).toEqual([]); expect(external).toEqual([]);
  await page.screenshot({ path: 'test-results/gallery-desktop.png', fullPage: true });
});

test('developer example filters, pages, sorts, clears and opens details', async ({ page }) => {
  await page.goto('/gallery/examples.html');
  await page.getByRole('tab', { name: 'Developer dashboard' }).click();
  await expect(page.locator('#work-range')).toHaveText('1–5 of 8 units');
  await page.locator('#work-next').click();
  await expect(page.locator('#work-range')).toHaveText('6–8 of 8 units');
  await page.locator('#work-filter').selectOption('done');
  await expect(page.locator('#work-range')).toHaveText('1–2 of 2 units');
  await expect(page.locator('#work-prev')).toBeDisabled();
  await page.locator('#work-search').fill('missing');
  await expect(page.getByRole('heading', { name: 'No matching units' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('#work-range')).toHaveText('1–5 of 8 units');
  await page.locator('#work-sort').selectOption('functions');
  await expect(page.locator('#work-rows tr').first()).toContainText('BrnVehicle.cpp');
  const opener = page.getByRole('button', { name: 'Inspect BrnVehicle.cpp', exact: true });
  await opener.click();
  await expect(page.getByRole('dialog', { name: 'BrnVehicle.cpp' })).toBeVisible();
  await expect(page.locator('#detail-title')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});

test('density selection affects shared controls and can be reset', async ({ page }) => {
  await page.goto('/gallery/examples.html');
  const toggle = page.getByRole('button', { name: 'Compact density' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('body')).toHaveAttribute('data-b5-density', 'compact');
  expect(await toggle.evaluate(element => getComputedStyle(element).minHeight)).toBe('36px');
  await toggle.click();
  expect(await toggle.evaluate(element => getComputedStyle(element).minHeight)).toBe('44px');
});

test('directory example combines painted filters, search, empty, stale and loading states', async ({ page }) => {
  await page.goto('/gallery/examples.html');
  await expect(page.locator('#lobby-examples .b5-lobby')).toHaveCount(3);
  const group = page.getByRole('group', { name: 'Example lobby filter' });
  await group.getByRole('button', { name: 'With space' }).click();
  await expect(page.locator('#lobby-examples .b5-lobby')).toHaveCount(2);
  await page.locator('#example-lobby-search').fill('Westside');
  await expect(page.locator('#lobby-examples .b5-lobby')).toHaveCount(1);
  await page.locator('#example-lobby-search').fill('missing room');
  await expect(page.locator('#lobby-examples')).toContainText('No matching lobbies');
  await page.locator('#lobby-examples').getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('#lobby-examples .b5-lobby')).toHaveCount(3);
  await page.locator('#directory-example-state').selectOption('empty');
  await expect(page.locator('#example-lobby-count')).toHaveText('0');
  await expect(page.locator('#example-roster')).toContainText('A quiet moment in Paradise.');
  await expect(page.locator('#example-roster')).not.toHaveAttribute('tabindex');
  await expect(page.locator('#lobby-examples')).toContainText('Open roads. Your move.');
  await page.locator('#directory-example-state').selectOption('stale');
  await expect(page.locator('#example-stale')).toBeVisible();
  await expect(page.locator('#example-roster-count-label')).toHaveText('Last seen');
  await expect(page.locator('#example-roster-count')).toHaveText('17');
  await expect(page.locator('#lobby-examples .b5-lobby')).toHaveCount(3);
  await page.locator('#directory-example-state').selectOption('loading');
  await expect(page.locator('#lobby-examples')).toContainText('Getting the example snapshot');
  await expect(page.locator('#example-roster-count')).toHaveText('—');
  await expect(page.locator('#example-roster').getByRole('status')).toHaveText('Waiting for the directory…');
  await expect(page.locator('#example-roster').getByRole('link')).toHaveCount(0);
  await page.locator('#directory-example-state').selectOption('active');
  await expect(page.locator('#example-roster-count-label')).toHaveText('Online');
  await expect(page.locator('#example-roster')).toHaveAttribute('tabindex', '0');
  await expect(page.locator('#example-roster .b5-person')).toHaveCount(17);
});

test('developer modes keep the shared explorer inside its active tab panel', async ({ page }) => {
  await page.goto('/gallery/examples.html');
  await page.getByRole('tab', { name: 'Developer dashboard' }).click();
  await page.getByRole('tab', { name: 'Functions', exact: true }).click();
  await expect(page.locator('#work-function-info #work-rows')).toBeVisible();
  await expect(page.locator('#work-rows tr').first()).toContainText('BrnCamera::Update');
  await expect(page.getByRole('columnheader', { name: 'Address', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Available in build', exact: true }).click();
  await expect(page.locator('#work-build-info #work-range')).toHaveText('1–2 of 2 units');
  await page.getByRole('tab', { name: 'Translation units', exact: true }).click();
  await page.locator('#work-source').selectOption('platform');
  await expect(page.locator('#work-range')).toHaveText('1–1 of 1 units');
  await expect(page.locator('#work-rows')).toContainText('BrnOnline.cpp');
  await page.locator('#work-source').selectOption('all');
  await page.locator('#work-goal').selectOption('online');
  await expect(page.locator('#work-range')).toHaveText('1–2 of 2 units');
});

for (const width of [360, 390, 768]) {
  test(`gallery and developer pattern fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/gallery/examples.html');
    await expectViewportFit(page);
    await page.getByRole('tab', { name: 'Developer dashboard' }).click();
    await expectViewportFit(page);
    await page.getByRole('button', { name: 'Inspect BrnCamera.cpp' }).click();
    expect(await page.locator('#detail-drawer').evaluate(element => element.getBoundingClientRect().width <= innerWidth)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#detail-drawer')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Inspect BrnCamera.cpp' })).toBeFocused();
    if (width === 390) {
      await page.getByRole('tab', { name: 'Online directory' }).click();
      await page.locator('.garage-brand').scrollIntoViewIfNeeded();
      await expect(page.locator('.garage-nav a[href="#foundations"]')).toHaveAttribute('aria-current', 'location');
      await page.screenshot({ path: 'test-results/gallery-mobile.png', fullPage: true });
      await page.screenshot({ path: 'test-results/gallery-mobile-top.png' });
    }
  });
}

test('compact density preserves touch-sized controls on coarse pointers', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, hasTouch: true, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto('/gallery/examples.html');
    const toggle = page.getByRole('button', { name: 'Compact density' });
    await toggle.click();
    expect(await toggle.evaluate(element => getComputedStyle(element).minHeight)).toBe('44px');
  } finally { await context.close(); }
});

test('the public and developer examples pass automated WCAG AA checks', async ({ page }) => {
  await page.goto('/gallery/examples.html');
  const scan = () => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect((await scan()).violations).toEqual([]);
  await page.getByRole('tab', { name: 'Developer dashboard' }).click();
  expect((await scan()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Inspect BrnCamera.cpp' }).click();
  expect((await scan()).violations).toEqual([]);
});
