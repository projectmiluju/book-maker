import { expect, type Page } from '@playwright/test';

const AUTH_SESSION_STORAGE_KEY = 'book-maker.auth-session';

type SignupOptions = {
  displayName: string;
  email: string;
  password: string;
};

type StoredAuthSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    createdAt: string;
    updatedAt: string;
  };
};

export async function signupFromWritePage(page: Page, options: SignupOptions) {
  await page.goto('/app/write');

  await expect(page).toHaveURL(/\/app\/write$/);
  await page.getByTestId('auth-display-name-input').fill(options.displayName);
  await page.getByTestId('auth-email-input').fill(options.email);
  await page.getByTestId('auth-password-input').fill(options.password);
  await page.getByTestId('auth-submit-button').click();

  await expect(page.getByTestId('writer-sheet')).toBeVisible();
}

export async function readStoredAuthSession(page: Page) {
  return page.evaluate<never, StoredAuthSession | null>((storageKey) => {
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as StoredAuthSession;
  }, AUTH_SESSION_STORAGE_KEY);
}

export async function overwriteStoredAccessToken(page: Page, accessToken: string) {
  await page.evaluate(
    ([storageKey, nextAccessToken]) => {
      const rawValue = window.localStorage.getItem(storageKey);

      if (!rawValue) {
        throw new Error('Auth session is missing.');
      }

      const session = JSON.parse(rawValue) as StoredAuthSession;

      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          ...session,
          accessToken: nextAccessToken,
        }),
      );
    },
    [AUTH_SESSION_STORAGE_KEY, accessToken] as const,
  );
}
