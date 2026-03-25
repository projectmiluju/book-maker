import { computed, onMounted } from 'vue';

import type { StoredAuthSession } from '../types/auth';

const AUTH_SESSION_STORAGE_KEY = 'book-maker.auth-session';

export function useAuthSession() {
  const session = useState<StoredAuthSession | null>('auth-session', () => null);
  const hydrated = useState<boolean>('auth-session-hydrated', () => false);

  function hydrateFromStorage() {
    if (!import.meta.client || hydrated.value) {
      return;
    }

    const rawValue = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (rawValue) {
      try {
        session.value = JSON.parse(rawValue) as StoredAuthSession;
      } catch {
        window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
        session.value = null;
      }
    }

    hydrated.value = true;
  }

  function setSession(nextSession: StoredAuthSession) {
    session.value = nextSession;

    if (import.meta.client) {
      window.localStorage.setItem(
        AUTH_SESSION_STORAGE_KEY,
        JSON.stringify(nextSession),
      );
    }
  }

  function clearSession() {
    session.value = null;

    if (import.meta.client) {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }
  }

  onMounted(hydrateFromStorage);

  return {
    session,
    hydrated: computed(() => hydrated.value),
    isAuthenticated: computed(() => session.value !== null),
    accessToken: computed(() => session.value?.accessToken ?? null),
    refreshToken: computed(() => session.value?.refreshToken ?? null),
    user: computed(() => session.value?.user ?? null),
    hydrateFromStorage,
    setSession,
    clearSession,
  };
}
