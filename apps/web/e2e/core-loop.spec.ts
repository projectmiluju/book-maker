import { expect, test } from '@playwright/test';

test('landing에서 시작해 write -> archive -> draft -> preview 핵심 루프를 확인한다', async ({
  page,
}) => {
  const uniqueSuffix = `${Date.now()}`;
  const email = `smoke-${uniqueSuffix}@example.com`;
  const password = 'password-1234';
  const displayName = `연결 테스트 ${uniqueSuffix}`;
  const entryTitle = `새벽 기록 ${uniqueSuffix}`;
  const entryBody = [
    '바다는 아직 말이 없었고, 창문에는 이른 물빛이 남아 있었다.',
    '짧게 남긴 문장이 오늘의 원고 첫 장면이 되는지 확인하고 싶었다.',
  ].join('\n\n');
  const draftTitle = `새벽 초안 ${uniqueSuffix}`;

  await page.goto('/');
  await page.getByTestId('landing-start-writing').click();

  await expect(page).toHaveURL(/\/app\/write$/);
  await page.getByTestId('auth-display-name-input').fill(displayName);
  await page.getByTestId('auth-email-input').fill(email);
  await page.getByTestId('auth-password-input').fill(password);
  await page.getByTestId('auth-submit-button').click();

  await expect(page.getByTestId('writer-sheet')).toBeVisible();

  await page.getByTestId('entry-title-input').fill(entryTitle);
  await page.getByTestId('entry-body-input').fill(entryBody);

  await expect(page.getByTestId('entry-save-status')).toHaveText('저장됨', {
    timeout: 15_000,
  });

  await page.getByTestId('entry-archive-link').click();

  await expect(page).toHaveURL(/\/app\/archive/);
  await expect(page.getByRole('link', { name: entryTitle })).toBeVisible({
    timeout: 15_000,
  });

  await page.goto('/app/drafts');
  await page.getByTestId('draft-create-title-input').fill(draftTitle);
  await page.getByTestId('draft-create-submit').click();

  const draftDetailTitle = page.locator('.draft-title-display', { hasText: draftTitle });
  const landedOnDetail = await draftDetailTitle
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (!landedOnDetail) {
    const createdDraftLink = page.getByRole('link', { name: draftTitle });
    await expect(createdDraftLink).toBeVisible({ timeout: 15_000 });
    await createdDraftLink.click();
  }

  await expect(draftDetailTitle).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveURL(/\/app\/drafts\/[^/?]+$/);

  const availableEntryCheckbox = page.getByRole('checkbox', {
    name: new RegExp(entryTitle),
  });
  await expect(availableEntryCheckbox).toBeVisible({ timeout: 15_000 });
  await availableEntryCheckbox.check();
  await page.getByTestId('draft-attach-submit').click();

  await expect(page.locator('.sequence-item', { hasText: entryTitle })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByTestId('draft-open-preview').click();

  await expect(page).toHaveURL(/\/app\/drafts\/preview\?draftId=/);
  await expect(page.getByRole('heading', { name: draftTitle })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(entryBody.split('\n\n')[0] ?? '')).toBeVisible();
});
