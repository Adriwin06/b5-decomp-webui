import { defineConfig } from '@playwright/test';

const baseURL = `http://127.0.0.1:${process.env.PORT ?? 4175}`;

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
    viewport: { width: 1440, height: 960 },
    reducedMotion: 'reduce',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run preview',
    url: `${baseURL}/gallery/`,
    reuseExistingServer: !process.env.CI,
    timeout: 15000
  }
});
