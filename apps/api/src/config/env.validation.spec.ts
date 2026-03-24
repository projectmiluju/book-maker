import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  it('applies defaults for the current backend baseline', () => {
    expect(validateEnvironment({})).toEqual({
      NODE_ENV: 'development',
      API_PORT: 4000,
      API_PREFIX: 'api',
      POSTGRES_HOST: '127.0.0.1',
      POSTGRES_PORT: 5432,
      POSTGRES_DB: 'book_maker',
      POSTGRES_USER: 'book_maker',
      POSTGRES_PASSWORD: 'book_maker',
      REDIS_HOST: '127.0.0.1',
      REDIS_PORT: 6379,
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
});
