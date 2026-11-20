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

test('the site nav marks the section being read and releases its listeners', async ({ page }) => {
  await fixture(page);
  await page.evaluate(() => {
    const nav = document.createElement('nav');
    nav.className = 'b5-site-nav';
    nav.innerHTML = '<a href="#spy-one" aria-current="location">One</a><a href="#spy-two">Two</a><a href="https://example.org/">Away</a>';
    document.body.prepend(nav);
    for (const id of ['spy-one', 'spy-two']) {
      const section = document.createElement('section');
      section.id = id; section.style.height = '1600px';
      document.body.append(section);
    }
    window.spy = window.library.createNavSpy(nav);
  });
  const current = () => page.evaluate(() => [...document.querySelectorAll('.b5-site-nav a')].map(link => link.getAttribute('aria-current')));
  await page.evaluate(() => document.getElementById('spy-two').scrollIntoView());
  await expect.poll(current).toEqual([null, 'location', null]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(current).toEqual(['location', null, null]);
  await page.evaluate(() => { window.spy.destroy(); document.getElementById('spy-two').scrollIntoView(); });
  await page.waitForTimeout(100);
  expect(await current()).toEqual(['location', null, null]);
});

test('the site nav marks no link while a section it does not list is read', async ({ page }) => {
  await fixture(page);
  await page.evaluate(() => {
    const nav = document.createElement('nav');
    nav.className = 'b5-site-nav';
    nav.innerHTML = '<a href="#listed-one" aria-current="location">One</a>';
    document.body.prepend(nav);
    for (const id of ['listed-one', 'unlisted-two', 'unlisted-three']) {
      const section = document.createElement('section');
      section.id = id; section.style.height = '1600px';
      document.body.append(section);
    }
    window.library.createNavSpy(nav);
  });
  const current = () => page.evaluate(() => document.querySelector('.b5-site-nav a').getAttribute('aria-current'));
  await page.evaluate(() => document.getElementById('unlisted-two').scrollIntoView());
  await expect.poll(current).toBe(null);
  await page.evaluate(() => document.getElementById('listed-one').scrollIntoView());
  await expect.poll(current).toBe('location');
});

test('setProgress fills a meter like a ring and names its value', async ({ page }) => {
  await fixture(page);
  const result = await page.evaluate(() => {
    const meter = document.createElement('div');
    meter.className = 'b5-meter';
    meter.setAttribute('aria-label', 'Units complete');
    meter.innerHTML = '<span class="b5-meter__label">Units complete</span><span class="b5-meter__value" data-b5-progress-label>—</span><span class="b5-meter__bar"></span>';
    document.querySelector('#app').append(meter);
    window.library.setProgress(meter, 42);
    return [meter.getAttribute('role'), meter.getAttribute('aria-valuenow'), meter.style.getPropertyValue('--b5-meter'), meter.querySelector('[data-b5-progress-label]').textContent];
  });
  expect(result).toEqual(['progressbar', '42', '0.42', '42%']);
});

test('a ticker pauses and plays from its toggle, which keeps its label', async ({ page }) => {
  // the config asks for reduced motion, which stills the ticker
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await fixture(page);
  const states = await page.evaluate(() => {
    const ticker = document.createElement('section');
    ticker.className = 'b5-ticker';
    ticker.innerHTML = '<div class="b5-ticker__window"><ul class="b5-ticker__track"><li class="b5-ticker__item"><strong>Merged</strong>One</li></ul></div><button class="b5-button b5-button--ink b5-ticker__toggle" type="button" aria-pressed="false">Pause</button>';
    document.querySelector('#app').append(ticker);
    window.ui.refresh();
    const toggle = ticker.querySelector('button');
    const read = () => [ticker.hasAttribute('data-b5-paused'), toggle.getAttribute('aria-pressed'), toggle.textContent];
    const out = [read()];
    toggle.click();
    out.push([...read(), getComputedStyle(ticker.querySelector('.b5-ticker__track')).animationPlayState]);
    toggle.click();
    out.push(read());
    return out;
  });
  expect(states).toEqual([[false, 'false', 'Pause'], [true, 'true', 'Pause', 'paused'], [false, 'false', 'Pause']]);
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
