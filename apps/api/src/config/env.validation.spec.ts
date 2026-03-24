import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  it('applies defaults for the current backend baseline', () => {
    expect(validateEnvironment({})).toEqual({
      NODE_ENV: 'development',
      API_PORT: 4000,
      API_PREFIX: 'api',
      AUTH_ACCESS_TOKEN_SECRET: 'book-maker-access-secret',
      AUTH_ACCESS_TOKEN_EXPIRES_IN: '15m',
      AUTH_REFRESH_TOKEN_SECRET: 'book-maker-refresh-secret',
      AUTH_REFRESH_TOKEN_EXPIRES_IN: '14d',
      AUTH_REFRESH_SESSION_PREFIX: 'auth:refresh',
      POSTGRES_HOST: '127.0.0.1',
      POSTGRES_PORT: 5432,
      POSTGRES_DB: 'book_maker',
      POSTGRES_USER: 'book_maker',
      POSTGRES_PASSWORD: 'book_maker',
      POSTGRES_CONNECT_ON_BOOTSTRAP: true,
      REDIS_HOST: '127.0.0.1',
      REDIS_PORT: 6379,
      REDIS_DB: 0,
      REDIS_CONNECT_ON_BOOTSTRAP: true,
    });
  });

  it('disables bootstrap connections by default in test mode', () => {
    expect(
      validateEnvironment({
        NODE_ENV: 'test',
      }),
    ).toMatchObject({
      POSTGRES_CONNECT_ON_BOOTSTRAP: false,
      REDIS_CONNECT_ON_BOOTSTRAP: false,
    });
  });

  it('rejects unsupported NODE_ENV values', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'local',
      }),
    ).toThrow(/NODE_ENV/);
  });

  it('rejects invalid numeric values', () => {
    expect(() =>
      validateEnvironment({
        API_PORT: 'oops',
      }),
    ).toThrow(/API_PORT/);
  });

  it('rejects invalid boolean values', () => {
    expect(() =>
      validateEnvironment({
        POSTGRES_CONNECT_ON_BOOTSTRAP: 'maybe',
      }),
    ).toThrow(/POSTGRES_CONNECT_ON_BOOTSTRAP/);
  });
});
