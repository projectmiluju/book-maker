const NODE_ENVS = ['development', 'test', 'production'] as const;

type NodeEnv = (typeof NODE_ENVS)[number];

export type EnvironmentVariables = {
  NODE_ENV: NodeEnv;
  API_PORT: number;
  API_PREFIX: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_CONNECT_ON_BOOTSTRAP: boolean;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_DB: number;
  REDIS_CONNECT_ON_BOOTSTRAP: boolean;
};

function readString(
  input: Record<string, unknown>,
  key: string,
  fallback?: string,
): string {
  const value = input[key];

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Environment variable ${key} is required.`);
}

function readNumber(
  input: Record<string, unknown>,
  key: string,
  fallback?: number,
): number {
  const value = input[key];

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }

    throw new Error(`Environment variable ${key} must be a valid number.`);
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Environment variable ${key} must be a valid number.`);
}

function readBoolean(
  input: Record<string, unknown>,
  key: string,
  fallback?: boolean,
): boolean {
  const value = input[key];

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    throw new Error(`Environment variable ${key} must be true or false.`);
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Environment variable ${key} must be true or false.`);
}

export function validateEnvironment(
  input: Record<string, unknown>,
): EnvironmentVariables {
  const nodeEnv = readString(input, 'NODE_ENV', 'development');

  if (!NODE_ENVS.includes(nodeEnv as NodeEnv)) {
    throw new Error(
      `Environment variable NODE_ENV must be one of: ${NODE_ENVS.join(', ')}.`,
    );
  }

  return {
    NODE_ENV: nodeEnv as NodeEnv,
    API_PORT: readNumber(input, 'API_PORT', 4000),
    API_PREFIX: readString(input, 'API_PREFIX', 'api'),
    POSTGRES_HOST: readString(input, 'POSTGRES_HOST', '127.0.0.1'),
    POSTGRES_PORT: readNumber(input, 'POSTGRES_PORT', 5432),
    POSTGRES_DB: readString(input, 'POSTGRES_DB', 'book_maker'),
    POSTGRES_USER: readString(input, 'POSTGRES_USER', 'book_maker'),
    POSTGRES_PASSWORD: readString(input, 'POSTGRES_PASSWORD', 'book_maker'),
    POSTGRES_CONNECT_ON_BOOTSTRAP: readBoolean(
      input,
      'POSTGRES_CONNECT_ON_BOOTSTRAP',
      nodeEnv !== 'test',
    ),
    REDIS_HOST: readString(input, 'REDIS_HOST', '127.0.0.1'),
    REDIS_PORT: readNumber(input, 'REDIS_PORT', 6379),
    REDIS_DB: readNumber(input, 'REDIS_DB', 0),
    REDIS_CONNECT_ON_BOOTSTRAP: readBoolean(
      input,
      'REDIS_CONNECT_ON_BOOTSTRAP',
      nodeEnv !== 'test',
    ),
  };
}
