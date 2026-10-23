import { test, expect } from '@playwright/test';

// Compare the rendered glyph mask with the texture beneath it. Behavior and
// viewport tests cannot catch letters protruding beyond a decorative background.
async function glyphCoverage(page, element) {
  await element.scrollIntoViewIfNeeded();
  await element.evaluate(node => node.dataset.paintCapture = 'paint');
  const paint = await element.screenshot({ omitBackground: true });
  await element.evaluate(node => node.dataset.paintCapture = 'ink');
  const glyphs = await element.screenshot({ omitBackground: true });
  await element.evaluate(node => delete node.dataset.paintCapture);
  return page.evaluate(async ({ paint, glyphs }) => {
    const pixels = async uri => {
      const picture = new Image(); picture.src = uri; await picture.decode();
      const canvas = document.createElement('canvas'); canvas.width = picture.width; canvas.height = picture.height;
      const context = canvas.getContext('2d'); context.drawImage(picture, 0, 0);
      return context.getImageData(0, 0, canvas.width, canvas.height).data;
    };
    const texture = await pixels(paint), ink = await pixels(glyphs);
    let total = 0, outside = 0;
    for (let pixel = 0; pixel < ink.length; pixel += 4) {
      if (ink[pixel + 3] > 200 && ink[pixel] > 200 && ink[pixel + 1] > 200 && ink[pixel + 2] > 200) {
        total++;
        if (texture[pixel + 3] < 32) outside++;
      }
    }
    return { total, outside, covered: 1 - outside / total };
  }, { paint: `data:image/png;base64,${paint.toString('base64')}`, glyphs: `data:image/png;base64,${glyphs.toString('base64')}` });
}

async function prepareCapture(page) {
  await page.route('**/__paint-capture.css', route => route.fulfill({
    contentType: 'text/css', body: `
      html, body, .b5-ui { background: transparent !important; }
      [data-paint-capture] { text-shadow: none !important; }
      [data-paint-capture='paint'] { -webkit-text-fill-color: transparent !important; color: transparent !important; }
      [data-paint-capture='ink'] { -webkit-text-fill-color: white !important; color: white !important; }
      [data-paint-capture='ink']::before, [data-paint-capture='ink']::after { visibility: hidden !important; }
    `
  }));
  await page.addStyleTag({ url: '/__paint-capture.css' });
  await page.evaluate(() => document.fonts.ready);
}

for (const width of [1440, 390]) {
  test(`paint stays beneath heading and control glyphs at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/gallery/');
    await expect(page.locator('body')).toHaveAttribute('data-catalog-ready', 'true');
    await prepareCapture(page);
    const selectors = [
      '.catalog-intro .b5-title-mark',
      '.catalog-tools .b5-filter[aria-pressed=true]',
      '#filters .b5-filter[aria-pressed=true]',
      '#buttons .b5-button--paint:not(.b5-button--paint-gold):not(.b5-button--paint-red)',
      '#buttons .b5-button--paint-gold', '#buttons .b5-button--paint-red',
      '#destination .b5-destination__label', '#roster .b5-panel__header',
      '#downloads .b5-download strong',
      '#menu-tabs .b5-tab[aria-selected=true]', '#dropdowns .b5-select-trigger >> nth=0'
    ];
    for (const selector of selectors) {
      const result = await glyphCoverage(page, page.locator(selector));
      expect(result.total, selector).toBeGreaterThan(100);
      expect(result.covered, `${selector}: ${JSON.stringify(result)}`).toBeGreaterThanOrEqual(.99);
    }
    // The same title skin must handle a short mark and a wider label without
    // changing the paint angle or leaving either end of the text uncovered.
    for (const label of ['UI', 'LIVE!', 'AVAILABLE IN BUILD', 'TRANSLATION UNITS & FUNCTIONS']) {
      const heading = page.locator('.catalog-intro .b5-title-mark');
      await heading.evaluate((node, text) => { node.textContent = text; node.style.fontSize = '40px'; }, label);
      const result = await glyphCoverage(page, heading);
      expect(result.covered, `${label}: ${JSON.stringify(result)}`).toBeGreaterThanOrEqual(.99);
    }
  });
}
