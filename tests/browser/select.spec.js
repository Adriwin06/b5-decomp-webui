import { test, expect } from '@playwright/test';

async function fixture(page) {
  await page.goto('/tests/fixtures/consumer.html');
  await page.waitForFunction(() => window.fixtureReady);
}

test('brush select supports exploration, cancellation, type-ahead and native form values', async ({ page }) => {
  await fixture(page);
  const combo = page.getByRole('combobox', { name: 'Fixture status', exact: true });
  await combo.focus();
  await page.keyboard.press('ArrowDown');
  await expect(combo).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('option', { name: 'Beta', exact: true })).toHaveClass(/--active/);
  await expect(page.locator('#fixture-select')).toHaveValue('');
  await page.keyboard.press('Escape');
  await expect(combo).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#fixture-select')).toHaveValue('');
  await page.keyboard.press('b');
  await expect(page.getByRole('option', { name: 'Beta', exact: true })).toHaveClass(/--active/);
  await page.keyboard.press('Enter');
  await expect(page.locator('#fixture-select')).toHaveValue('beta');
  expect(await page.evaluate(() => new FormData(document.querySelector('#select-form')).get('status'))).toBe('beta');
  await expect(combo).toContainText('Beta');
});

test('disabled options and optgroups are skipped; Home/End and Tab commit correctly', async ({ page }) => {
  await fixture(page);
  const combo = page.getByRole('combobox', { name: 'Fixture status', exact: true });
  await combo.focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('option', { name: 'Gamma', exact: true })).toHaveClass(/--active/);
  await page.keyboard.press('Tab');
  await expect(page.locator('#fixture-select')).toHaveValue('gamma');
  await combo.focus(); await page.keyboard.press('Home'); await page.keyboard.press('Enter');
  await expect(page.locator('#fixture-select')).toHaveValue('');
  await combo.click();
  await page.getByRole('option', { name: 'Alpha', exact: true }).click();
  await expect(combo).toContainText('Alpha');
});

test('native option changes, disable state and form reset synchronize the enhanced select', async ({ page }) => {
  await fixture(page);
  const combo = page.getByRole('combobox', { name: 'Fixture status', exact: true });
  await combo.click(); await page.getByRole('option', { name: 'Beta', exact: true }).click();
  await page.getByRole('button', { name: 'Reset selection' }).click();
  await expect(combo).toContainText('All statuses');
  await page.locator('#fixture-select').evaluate(select => { const option = new Option('New source', 'new'); select.append(option); select.value = 'new'; select.dispatchEvent(new Event('change', { bubbles: true })); });
  await expect(combo).toContainText('New source');
  await page.locator('#fixture-select').evaluate(select => { select.disabled = true; });
  await expect(combo).toBeDisabled();
  await page.locator('#fixture-select').evaluate(select => { select.disabled = false; });
  await expect(combo).toBeEnabled();
});

test('required form validation focuses the visible combobox and clears its own error when valid', async ({ page }) => {
  await fixture(page);
  expect(await page.locator('#select-form').evaluate(form => form.checkValidity())).toBe(false);
  const combo = page.getByRole('combobox', { name: 'Fixture status', exact: true });
  await expect(combo).toBeFocused();
  await expect(combo).toHaveAttribute('aria-invalid', 'true');
  await combo.click(); await page.getByRole('option', { name: 'Alpha', exact: true }).click();
  await expect(combo).not.toHaveAttribute('aria-invalid', 'true');
  expect(await page.locator('#select-form').evaluate(form => form.checkValidity())).toBe(true);
});

test('select popup uses the top layer and Escape closes the popup before its modal', async ({ page }) => {
  await fixture(page);
  await page.locator('#dialog-trigger').click();
  const dialog = page.locator('#fixture-dialog');
  const combo = dialog.getByRole('combobox', { name: 'Dialog visibility' });
  await combo.click();
  const menu = page.getByRole('listbox', { name: 'Dialog visibility' });
  expect(await menu.evaluate(element => element.matches(':popover-open'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden(); await expect(dialog).toBeVisible();
  await combo.click();
  await page.evaluate(() => window.library.closeDialog(document.querySelector('#fixture-dialog')));
  await expect(menu).toBeHidden(); await expect(dialog).toBeHidden();
  await expect(page.locator('#dialog-trigger')).toBeFocused();
});

test('enhancement destruction restores the native select and removes the popup', async ({ page }) => {
  await fixture(page);
  await page.getByRole('combobox', { name: 'Fixture status', exact: true }).click();
  await page.evaluate(() => window.ui.destroy());
  await expect(page.locator('#fixture-select')).not.toHaveClass(/b5-select-native/);
  await expect(page.locator('#fixture-select')).not.toHaveAttribute('aria-hidden');
  await expect(page.locator('.b5-select-menu')).toHaveCount(0);
  await page.locator('#fixture-select').selectOption('beta');
  await expect(page.locator('#fixture-select')).toHaveValue('beta');
});

test('painted filter groups skip disabled choices and emit one selection change', async ({ page }) => {
  await fixture(page);
  await page.evaluate(() => { window.filterChanges = []; document.querySelector('#fixture-filters').addEventListener('b5:filterchange', event => window.filterChanges.push(event.detail.value)); });
  const group = page.getByRole('group', { name: 'Fixture filters' });
  await group.getByRole('button', { name: 'All', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(group.getByRole('button', { name: 'With space' })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => window.filterChanges)).toEqual(['space']);
  await page.keyboard.press('Home');
  await expect(group.getByRole('button', { name: 'All', exact: true })).toBeFocused();
});

test('pager supports numbers, jump, collection shrink and lifecycle restoration', async ({ page }) => {
  await fixture(page);
  const pager = page.getByRole('navigation', { name: 'Fixture pages' });
  await pager.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(pager.getByRole('status')).toHaveText('11–20 of 95');
  await pager.getByRole('spinbutton', { name: 'Jump to page' }).fill('10');
  await pager.getByRole('spinbutton', { name: 'Jump to page' }).press('Enter');
  await expect(pager.getByRole('status')).toHaveText('91–95 of 95');
  await expect(pager.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await page.evaluate(() => window.library.createPager(document.querySelector('#fixture-pager')).set({ total: 12 }));
  await expect(pager.getByRole('status')).toHaveText('11–12 of 12');
  await page.evaluate(() => window.ui.destroy());
  await expect(pager).toBeEmpty();
});
