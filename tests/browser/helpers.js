import { expect } from '@playwright/test';

export async function expectViewportFit(page) {
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
    overflow: [...document.querySelectorAll('body *')].filter(element => element.children.length === 0).map(element => ({
      tag: element.tagName, className: typeof element.className === 'string' ? element.className : '',
      id: element.id, right: Math.round(element.getBoundingClientRect().right), width: Math.round(element.getBoundingClientRect().width),
      text: element.textContent.slice(0, 45)
    })).filter(element => element.right > innerWidth + 1 && element.width > 0).slice(0, 18)
  }));
  expect(layout.document, JSON.stringify(layout)).toBeLessThanOrEqual(layout.viewport);
}
