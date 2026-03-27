import { expect, test } from '@playwright/test';

import {
  overwriteStoredAccessToken,
  readStoredAuthSession,
  signupFromWritePage,
} from './helpers/auth';

test('autosave 중 access token이 유효하지 않으면 세션을 정리하고 로그인 화면으로 돌려보낸다', async ({
  page,
}) => {
  const uniqueSuffix = `${Date.now()}`;
  const saveRequestUrls: string[] = [];

  page.on('request', (request) => {
    if (
      request.method() === 'POST' &&
      request.url().endsWith('/api/entries')
    ) {
      saveRequestUrls.push(request.url());
    }
  });

  await signupFromWritePage(page, {
    displayName: `만료 테스트 ${uniqueSuffix}`,
    email: `auth-expiry-${uniqueSuffix}@example.com`,
    password: 'password-1234',
  });

  const initialSession = await readStoredAuthSession(page);
  expect(initialSession?.refreshToken).toBeTruthy();

  await overwriteStoredAccessToken(page, 'expired-access-token');
  await page.reload();

  await expect(page.getByTestId('writer-sheet')).toBeVisible();

  await page.getByTestId('entry-body-input').fill(
    '세션이 유효하지 않을 때 자동 저장이 반복 재시도 없이 멈추는지 확인합니다.',
  );

  await expect(page.getByTestId('auth-form')).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole('heading', {
      name: '기록을 시작하려면 먼저 세션이 필요합니다.',
    }),
  ).toBeVisible();

  await page.waitForTimeout(1_000);

  expect(saveRequestUrls).toHaveLength(1);
  await expect.poll(() => readStoredAuthSession(page)).toBeNull();
});
