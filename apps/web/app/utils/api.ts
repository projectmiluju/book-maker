import type { StoredAuthSession } from '../types/auth';
import type { EntryInput, PublicEntry } from '../types/entries';

type AuthCredentials = {
  email: string;
  password: string;
};

type SignupInput = AuthCredentials & {
  displayName: string;
};

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

type JsonBody =
  | Record<string, unknown>
  | string
  | number
  | boolean
  | null
  | undefined;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function createAuthApiClient(baseUrl: string, fetcher: Fetcher = globalThis.fetch) {
  return {
    login(input: AuthCredentials) {
      return requestJson<StoredAuthSession>(fetcher, baseUrl, '/auth/login', {
        method: 'POST',
        body: input,
      });
    },
    signup(input: SignupInput) {
      return requestJson<StoredAuthSession>(fetcher, baseUrl, '/auth/signup', {
        method: 'POST',
        body: input,
      });
    },
    logout(refreshToken: string) {
      return requestJson<{ success: true }>(fetcher, baseUrl, '/auth/logout', {
        method: 'POST',
        body: { refreshToken },
      });
    },
  };
}

export function createEntriesApiClient(
  baseUrl: string,
  getAccessToken: () => string | null,
  fetcher: Fetcher = globalThis.fetch,
) {
  return {
    createEntry(input: EntryInput) {
      return requestJson<PublicEntry>(fetcher, baseUrl, '/entries', {
        method: 'POST',
        body: input,
        headers: createAuthHeaders(getAccessToken),
      });
    },
    getEntry(entryId: string) {
      return requestJson<PublicEntry>(fetcher, baseUrl, `/entries/${entryId}`, {
        headers: createAuthHeaders(getAccessToken),
      });
    },
    updateEntry(entryId: string, input: EntryInput) {
      return requestJson<PublicEntry>(fetcher, baseUrl, `/entries/${entryId}`, {
        method: 'PATCH',
        body: input,
        headers: createAuthHeaders(getAccessToken),
      });
    },
  };
}

function createAuthHeaders(getAccessToken: () => string | null): HeadersInit {
  const accessToken = getAccessToken();

  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

async function requestJson<T>(
  fetcher: Fetcher,
  baseUrl: string,
  path: string,
  init: Omit<RequestInit, 'body'> & {
    body?: JsonBody;
  } = {},
): Promise<T> {
  const { body, ...requestOptions } = init;
  const headers = new Headers(init.headers);
  const requestInit: RequestInit = {
    ...requestOptions,
    headers,
  };

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetcher(buildApiUrl(baseUrl, path), requestInit);
  const payload = await readPayload(response);

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(payload), response.status, payload);
  }

  return payload as T;
}

function buildApiUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.length === 0) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function extractErrorMessage(payload: unknown): string {
  if (typeof payload === 'string' && payload.length > 0) {
    return payload;
  }

  if (payload && typeof payload === 'object' && 'message' in payload) {
    const { message } = payload;

    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return '요청 처리 중 오류가 발생했습니다.';
}
