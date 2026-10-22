import { test, expect } from '@playwright/test';

async function fixture(page) {
  await page.goto('/tests/fixtures/consumer.html');
  await page.waitForFunction(() => window.fixtureReady);
}

test('tabs support arrow navigation, disabled skipping and boundary keys', async ({ page }) => {
  await fixture(page);
  await page.locator('#first').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#last')).toBeFocused();
  await expect(page.locator('#last')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#first-panel')).toBeHidden();
  await expect(page.locator('#last-panel')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#first')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('#last')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.locator('#first')).toBeFocused();
  await page.locator('[role="tablist"]').evaluate(element => element.setAttribute('aria-orientation', 'vertical'));
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#last')).toBeFocused();
});

test('enhancement is idempotent and can be destroyed and mounted again', async ({ page }) => {
  await fixture(page);
  const result = await page.evaluate(() => {
    const app = document.querySelector('#app');
    const duplicate = window.library.enhance(app);
    const same = duplicate === window.ui;
    window.library.createTabs(document.querySelector('#tabs')).select(2);
    duplicate.destroy();
    const restored = document.querySelector('#first').getAttribute('aria-selected') === 'true' && document.querySelector('#last-panel').hidden;
    const remount = window.library.enhance(app);
    return { same, restored, fresh: remount !== duplicate };
  });
  expect(result).toEqual({ same: true, restored: true, fresh: true });
  await page.locator('#last').click();
  await expect(page.locator('#last-panel')).toBeVisible();
});

test('native dialog traps focus, closes on Escape and restores the opener', async ({ page }) => {
  await fixture(page);
  const trigger = page.locator('#dialog-trigger');
  await trigger.click();
  const dialog = page.locator('#fixture-dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#fixture-title')).toBeFocused();
  await dialog.getByRole('button', { name: 'Close fixture' }).focus();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.querySelector('#fixture-dialog').contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator('html')).not.toHaveClass(/b5-modal-open/);
  await trigger.click();
  await page.mouse.click(2, 2);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('refresh discovers new tabs and releases controllers for removed groups', async ({ page }) => {
  await fixture(page);
  const result = await page.evaluate(() => {
    const app = document.querySelector('#app');
    const previous = document.querySelector('#tabs');
    const controller = window.library.createTabs(previous);
    const replacement = previous.cloneNode(true);
    previous.remove();
    app.append(replacement);
    window.ui.refresh();
    let released = false;
    try { controller.select(2); } catch { released = true; }
    return { released, selected: window.library.createTabs(replacement).select(2) };
  });
  expect(result).toEqual({ released: true, selected: true });
  await expect(page.locator('#last-panel')).toBeVisible();
});

test('notifications render text safely and pause while focused', async ({ page }) => {
  await fixture(page);
  await page.clock.install();
  await page.evaluate(() => window.library.notify('<img src=x onerror=alert(1)>', { duration: 1000, root: document.querySelector('#app') }));
  const toast = page.locator('.b5-toast');
  await expect(toast).toContainText('<img src=x onerror=alert(1)>');
  await expect(toast.locator('img')).toHaveCount(0);
  await toast.getByRole('button', { name: 'Dismiss notification' }).focus();
  await page.clock.fastForward(5000);
  await expect(toast).toBeVisible();
  await page.locator('#copy').focus();
  await page.clock.fastForward(1100);
  await expect(toast).toHaveCount(0);
});

test('copy dispatches one event and clipboard denial provides a dismissible fallback', async ({ page }) => {
  await fixture(page);
  await page.evaluate(() => {
    window.copyCalls = 0;
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.copyCalls++; window.copiedText = text; } } });
    window.library.enhance(document.querySelector('#app'));
  });
  await page.locator('#copy').click();
  await expect(page.locator('.b5-toast [role="status"]')).toHaveText('Copied to clipboard');
  expect(await page.evaluate(() => ({ calls: window.copyCalls, text: window.copiedText }))).toEqual({ calls: 1, text: 'example.invalid:27900' });
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Permission denied'); }; });
  await page.locator('#copy').click();
  await expect(page.getByRole('status', { name: '' }).filter({ hasText: 'Copy unavailable' })).toBeVisible();
  await page.locator('.b5-toast').filter({ hasText: 'Copy unavailable' }).getByRole('button').click();
  await expect(page.locator('.b5-toast').filter({ hasText: 'Copy unavailable' })).toHaveCount(0);
});

test('notifications created in a modal remain in its top layer', async ({ page }) => {
  await fixture(page);
  await page.locator('#dialog-trigger').click();
  await page.evaluate(() => window.library.notify('Inside the dialog', { duration: 0 }));
  await expect(page.locator('#fixture-dialog .b5-toast')).toBeVisible();
  await page.locator('#fixture-dialog .b5-toast').getByRole('button').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#dialog-trigger')).toBeFocused();
});

test('foundations leave surrounding host-page elements unchanged', async ({ page }) => {
  await fixture(page);
  const styles = await page.evaluate(() => ({
    outsideFont: getComputedStyle(document.querySelector('#outside-heading')).fontFamily,
    insideFont: getComputedStyle(document.querySelector('#inside-heading')).fontFamily,
    outsideToken: getComputedStyle(document.querySelector('#outside-button')).getPropertyValue('--b5-color-background'),
    outsideTone: getComputedStyle(document.querySelector('#outside-button')).getPropertyValue('--b5-tone'),
    insideToken: getComputedStyle(document.querySelector('#app')).getPropertyValue('--b5-color-background').trim()
  }));
  expect(styles.outsideFont).not.toContain('B5 Anton');
  expect(styles.insideFont).toContain('B5 Anton');
  expect(styles.outsideToken).toBe('');
  expect(styles.outsideTone).toBe('');
  expect(styles.insideToken).toBe('#100e0e');
});
