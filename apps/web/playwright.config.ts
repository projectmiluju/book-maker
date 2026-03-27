import { defineConfig, devices } from '@playwright/test';

const apiPort = process.env.API_PORT ?? (process.env.CI ? '4100' : '4000');
const webPort = process.env.NUXT_PORT ?? (process.env.CI ? '3100' : '3000');
const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
const webBaseUrl = `http://127.0.0.1:${webPort}`;
const apiServerCommand = [
  'pnpm --dir ../.. db:migrate:api',
  'pnpm --dir ../.. --filter @book-maker/api start',
].join(' && ');
const webServerCommand = process.env.CI
  ? `pnpm exec nuxt preview --port ${webPort}`
  : `pnpm exec nuxt dev --host 127.0.0.1 --port ${webPort}`;

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: './playwright-report' }],
  ],
  use: {
    baseURL: webBaseUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: apiServerCommand,
      url: `${apiBaseUrl}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NODE_ENV: 'development',
        API_PORT: apiPort,
        API_PREFIX: 'api',
        NUXT_PORT: webPort,
        POSTGRES_HOST: process.env.POSTGRES_HOST ?? '127.0.0.1',
        POSTGRES_PORT: process.env.POSTGRES_PORT ?? '5432',
        POSTGRES_DB: process.env.POSTGRES_DB ?? 'book_maker',
        POSTGRES_USER: process.env.POSTGRES_USER ?? 'book_maker',
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ?? 'book_maker',
        POSTGRES_CONNECT_ON_BOOTSTRAP: 'true',
        REDIS_HOST: process.env.REDIS_HOST ?? '127.0.0.1',
        REDIS_PORT: process.env.REDIS_PORT ?? '6379',
        REDIS_DB: process.env.REDIS_DB ?? '0',
        REDIS_CONNECT_ON_BOOTSTRAP: 'true',
        AUTH_ACCESS_TOKEN_SECRET:
          process.env.AUTH_ACCESS_TOKEN_SECRET ?? 'book-maker-access-secret',
        AUTH_ACCESS_TOKEN_EXPIRES_IN:
          process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN ?? '15m',
        AUTH_REFRESH_TOKEN_SECRET:
          process.env.AUTH_REFRESH_TOKEN_SECRET ?? 'book-maker-refresh-secret',
        AUTH_REFRESH_TOKEN_EXPIRES_IN:
          process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN ?? '14d',
        AUTH_REFRESH_SESSION_PREFIX:
          process.env.AUTH_REFRESH_SESSION_PREFIX ?? 'auth:refresh',
      },
    },
    {
      command: webServerCommand,
      url: webBaseUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NUXT_PUBLIC_API_BASE: `${apiBaseUrl}/api`,
      },
    },
  ],
});
