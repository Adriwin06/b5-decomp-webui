import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectViewportFit } from './helpers.js';

async function catalog(page) {
  await page.goto('/gallery/#downloads');
  await expect(page.locator('body')).toHaveAttribute('data-catalog-ready', 'true');
}

// The library's download menu, as the developer dashboard example uses it; the catalog card's
// designs each open their own chooser instead (gallery/download-chooser.js).
async function workDashboard(page) {
  await page.goto('/gallery/examples.html');
  await page.getByRole('tab', { name: 'Developer dashboard' }).click();
  await expect(page.locator('#work-download')).toBeVisible();
}

const designs = page => page.locator('#catalog-download-design').evaluateAll(([select]) => [...select.options].map(option => option.value));
const choose = (page, value) => page.locator('#catalog-download-design').evaluate((node, next) => { node.value = next; node.dispatchEvent(new Event('change', { bubbles: true })); }, value);

test('the library menu opens both packages; each choice downloads its own sample file', async ({ page }) => {
  await workDashboard(page);
  const trigger = page.locator('#work-download');
  const panel = page.locator('#work-download-menu');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toHaveAccessibleName('Choose your download');
  await expect(panel.getByRole('link', { name: /^Full game/ })).toContainText('4.69 GB');
  await expect(panel.getByRole('link', { name: /^Update only/ })).toContainText('8.2 MB');
  await expect(panel).toContainText('Assets unchanged');
  expect((await new AxeBuilder({ page }).include('#work-download-menu').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  for (const [name, filename] of [['Full game', 'sample-full-game-guide.md'], ['Update only', 'sample-update-notes.md']]) {
    if (!(await panel.isVisible())) await trigger.click();
    const [download] = await Promise.all([
      page.waitForEvent('download'), panel.getByRole('link', { name: new RegExp(`^${name}`) }).click()
    ]);
    expect(download.suggestedFilename()).toBe(filename);
    expect(await download.failure()).toBeNull();
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  }
});

test('the cluster draws its gauge, rolls its odometer to the count and revs when pointed at', async ({ page }) => {
  await catalog(page);
  const gauge = page.locator('#downloads .b5-gauge');
  await expect(gauge.locator('.b5-gauge__face')).toHaveCount(1);
  await expect(gauge).toHaveAttribute('aria-hidden', 'true');
  await expect(gauge.locator('.b5-gauge__numbers text')).toHaveText(['0', '2', '4', '6', '8']);
  const needle = gauge.locator('.b5-gauge__needle');
  const turn = () => needle.evaluate(node => getComputedStyle(node).getPropertyValue('--b5-needle').trim());
  await expect.poll(turn).toBe('');
  await page.locator('#catalog-download').hover();
  await expect.poll(turn).toBe('111deg');
  const odometer = gauge.locator('.b5-odometer');
  await expect(odometer).toHaveAttribute('aria-hidden', 'true');
  await expect(odometer.locator('.b5-odometer__drum')).toHaveCount(3);
  // each drum turns to its digit: 1, 2, 8
  await expect.poll(() => odometer.locator('.b5-odometer__drum').evaluateAll(drums => drums.map(drum => drum.style.getPropertyValue('--b5-digit')).join(''))).toBe('128');
  await expect(page.locator('#catalog-download')).toHaveAccessibleName(/^Download build number 179, commit 3add8ad, 128 downloads, v0\.2\.0 · PC$/);
  const rolled = await page.evaluate(async () => {
    const { setOdometer } = await import('/dist/b5-ui.js');
    const element = document.querySelector('#downloads .b5-odometer');
    const shown = setOdometer(element, 1042.7, { digits: 3 });
    return { shown, drums: element.querySelectorAll('.b5-odometer__drum').length, value: element.dataset.b5Odometer };
  });
  expect(rolled).toEqual({ shown: 1042, drums: 4, value: '1042' });
});

test('the cluster opens a gear for each package and its needle follows the one pointed at', async ({ page }) => {
  await catalog(page);
  const needle = page.locator('#downloads .b5-gauge__needle');
  const turn = () => needle.evaluate(node => getComputedStyle(node).getPropertyValue('--b5-needle').trim());
  await page.locator('#catalog-download').click();
  const panel = page.getByRole('region', { name: 'Choose your download' });
  await panel.getByRole('link', { name: /^Full game/ }).hover();
  await expect.poll(turn).toBe('92deg');
  await panel.getByRole('link', { name: /^Update only/ }).hover();
  await expect.poll(turn).toBe('-74deg');
  await expect(panel).toContainText('Assets unchanged');
});

test('the Design switch puts every download design in the card, each opening its own chooser', async ({ page }) => {
  await catalog(page);
  const stage = page.locator('#catalog-download-stage');
  const values = await designs(page);
  expect(values).toHaveLength(15);
  for (const value of values) {
    await choose(page, value);
    const trigger = stage.locator('#catalog-download');
    const panel = page.getByRole('region', { name: 'Choose your download' });
    await expect(trigger, value).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
    await trigger.click();
    await expect(trigger, value).toHaveAttribute('aria-expanded', 'true');
    await expect(panel.getByRole('link', { name: /^Full game/ }), value).toBeVisible();
    await expect(panel.getByRole('link', { name: /^Update only/ }), value).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger, value).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger, value).toBeFocused();
    await expect(panel).toBeHidden();
  }
  // the treatment only dresses the bars; back to the cluster, its gauge and odometer return
  await choose(page, 'sign');
  await expect(page.locator('#downloads').getByRole('combobox', { name: 'Treatment', exact: true })).toBeHidden();
  await choose(page, 'cluster');
  await expect(stage.locator('.b5-gauge__face')).toHaveCount(1);
  await expect.poll(() => stage.locator('.b5-odometer__drum').count()).toBe(3);
  await expect(page.locator('#downloads').getByRole('combobox', { name: 'Treatment', exact: true })).toBeVisible();
  await expect(page.locator('#catalog-download')).toHaveAttribute('data-skin', 'tireburn');
});

test('a design chooser opens onto its first choice from the keyboard, cycles with the arrows and downloads', async ({ page }) => {
  await catalog(page);
  for (const value of ['plate-paradise', 'billboard', 'sign-route']) {
    await choose(page, value);
    const trigger = page.locator('#catalog-download');
    const panel = page.getByRole('region', { name: 'Choose your download' });
    const full = panel.getByRole('link', { name: /^Full game/ });
    const update = panel.getByRole('link', { name: /^Update only/ });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(full, value).toBeFocused();
    await page.keyboard.press('ArrowDown'); await expect(update).toBeFocused();
    await page.keyboard.press('ArrowDown'); await expect(full).toBeFocused();
    await page.keyboard.press('End'); await expect(update).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false'); await expect(trigger).toBeFocused();
    await page.keyboard.press('ArrowUp'); await expect(update).toBeFocused();
    const [download] = await Promise.all([page.waitForEvent('download'), update.click()]);
    expect(download.suggestedFilename()).toBe('sample-update-notes.md');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  }
  // a plate turns back from its own control
  await choose(page, 'plate-night');
  await page.locator('#catalog-download').click();
  await page.getByRole('button', { name: 'Turn the plate back' }).click();
  await expect(page.locator('#catalog-download')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#catalog-download')).toBeFocused();
});

test('every design chooser passes automated WCAG AA checks while open', async ({ page }) => {
  await catalog(page);
  for (const value of await designs(page)) {
    await choose(page, value);
    await page.locator('#catalog-download').click();
    await expect(page.locator('#catalog-download')).toHaveAttribute('aria-expanded', 'true');
    const { violations } = await new AxeBuilder({ page }).include('#catalog-download-stage').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(violations.map(violation => `${value}: ${violation.id} ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`)).toEqual([]);
    await page.keyboard.press('Escape');
  }
});

test('outside clicks dismiss a design chooser and the eye opens the separate contents drawer', async ({ page }) => {
  await catalog(page);
  const trigger = page.locator('#catalog-download');
  const panel = page.locator('#catalog-download-menu');
  await trigger.click();
  await expect(panel).toBeVisible();
  await page.locator('#downloads .catalog-card__header').click();
  await expect(panel).toBeHidden(); await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  const preview = page.getByRole('button', { name: 'Preview sample contents' });
  await preview.click();
  await expect(panel).toBeHidden();
  await expect(page.getByRole('dialog', { name: 'Build contents sample-build.zip' })).toBeVisible();
  await page.keyboard.press('Escape'); await expect(preview).toBeFocused();
});

test('library download choices support keyboard navigation, normal Tab order and Escape focus return', async ({ page }) => {
  await workDashboard(page);
  const trigger = page.locator('#work-download');
  const panel = page.locator('#work-download-menu');
  const full = panel.getByRole('link', { name: /^Full game/ });
  const update = panel.getByRole('link', { name: /^Update only/ });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(full).toBeFocused();
  await page.keyboard.press('ArrowDown'); await expect(update).toBeFocused();
  await page.keyboard.press('Home'); await expect(full).toBeFocused();
  await page.keyboard.press('End'); await expect(update).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden(); await expect(trigger).toBeFocused();
  await page.keyboard.press('ArrowUp'); await expect(update).toBeFocused();
  await page.keyboard.press('Home');
  await page.keyboard.press('Tab'); await expect(update).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Preview example build contents' })).toBeFocused();
  await expect(panel).toBeHidden();
  await trigger.focus(); await page.keyboard.press('Space');
  await expect(panel).toBeVisible();
  await trigger.click(); await expect(panel).toBeHidden();
});

test('download popovers work inside dialogs and release their state when destroyed or removed', async ({ page }) => {
  await page.goto('/tests/fixtures/consumer.html');
  await page.waitForFunction(() => window.fixtureReady);
  await page.locator('#dialog-trigger').click();
  const trigger = page.locator('#fixture-download');
  const panel = page.locator('#fixture-download-menu');
  await page.evaluate(() => {
    const group = document.querySelector('#fixture-download-group');
    window.downloadUI = window.library.createDownloadMenu(group);
    window.sameDownloadUI = window.downloadUI === window.library.createDownloadMenu(group);
    window.downloadUI.open({ focus: 'first' });
  });
  expect(await page.evaluate(() => window.sameDownloadUI)).toBe(true);
  expect(await panel.evaluate(element => element.matches(':popover-open'))).toBe(true);
  await expect(panel.getByRole('link', { name: 'Full game' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden(); await expect(page.locator('#fixture-dialog')).toBeVisible();
  await trigger.click();
  await page.evaluate(() => window.library.closeDialog(document.querySelector('#fixture-dialog')));
  await expect(panel).toBeHidden();
  await page.locator('#dialog-trigger').click(); await trigger.click();
  await page.evaluate(() => window.ui.destroy());
  await expect(panel).toBeHidden();
  await expect(trigger).not.toHaveAttribute('aria-expanded');
  await expect(panel).not.toHaveAttribute('style');
  await page.evaluate(() => {
    window.ui = window.library.enhance(document.querySelector('#app'));
    window.downloadUI = window.library.createDownloadMenu(document.querySelector('#fixture-download-group'));
    window.downloadUI.open();
    document.querySelector('#fixture-download-group').remove();
    window.ui.refresh();
  });
  expect(await page.evaluate(() => {
    try { window.downloadUI.open(); return false; } catch { return true; }
  })).toBe(true);
});

for (const width of [360, 390, 768]) {
  test(`download controls and their choosers fit a ${width}px viewport in both applications`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await catalog(page);
    await page.evaluate(() => document.fonts.ready);
    const title = page.locator('#catalog-download strong');
    expect(await title.evaluate(element => {
      const text = document.createRange(); text.selectNodeContents(element);
      return text.getBoundingClientRect().width <= element.getBoundingClientRect().width + 1;
    }), 'The full download label should fit independently of its decorative paint.').toBe(true);
    // every design, open, stays inside the viewport and never widens the page
    for (const value of await designs(page)) {
      await choose(page, value);
      await page.locator('#catalog-download').click();
      const panel = page.locator('#catalog-download-menu');
      await expect(panel, value).toBeVisible();
      const rect = await panel.boundingBox();
      expect(rect.x, value).toBeGreaterThanOrEqual(0); expect(rect.x + rect.width, value).toBeLessThanOrEqual(width);
      await expectViewportFit(page);
      await page.keyboard.press('Escape');
    }
    await page.goto('/gallery/examples.html');
    await page.getByRole('tab', { name: 'Developer dashboard' }).click();
    await page.locator('#work-download').click();
    await expect(page.locator('#work-download')).toHaveAttribute('aria-expanded', 'true');
    await page.evaluate(() => document.fonts.ready);
    const workPanel = page.locator('#work-download-menu');
    await expect(workPanel.locator('.b5-download-menu__note')).toBeInViewport();
    const workRect = await workPanel.boundingBox();
    expect(workRect.x).toBeGreaterThanOrEqual(0); expect(workRect.x + workRect.width).toBeLessThanOrEqual(width);
    expect(workRect.y).toBeGreaterThanOrEqual(0); expect(workRect.y + workRect.height).toBeLessThanOrEqual(844);
    await expectViewportFit(page);
    // Element screenshots scroll the source toolbar and can move its popover.
    if (width === 390) await page.screenshot({ path: 'test-results/download-menu-mobile.png', clip: workRect });
  });
}

test('the library chooser opens above a low toolbar and remains scrollable in a short viewport', async ({ page }) => {
  await workDashboard(page);
  await page.setViewportSize({ width: 1280, height: 480 });
  const trigger = page.locator('#work-download');
  await trigger.evaluate(element => element.scrollIntoView({ block: 'end' }));
  await trigger.click();
  const panel = page.locator('#work-download-menu');
  const control = await trigger.boundingBox();
  const above = await panel.boundingBox();
  expect(above.y + above.height).toBeLessThanOrEqual(control.y);
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 240 });
  await trigger.click();
  const compact = await panel.boundingBox();
  expect(compact.y).toBeGreaterThanOrEqual(0); expect(compact.y + compact.height).toBeLessThanOrEqual(240);
  const update = panel.getByRole('link', { name: /^Update only/ });
  await trigger.focus(); await page.keyboard.press('ArrowUp'); await expect(update).toBeFocused();
});
