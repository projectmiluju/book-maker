import { ConfigService } from '@nestjs/config';

export type RedisConfig = {
  host: string;
  port: number;
  db: number;
  connectOnBootstrap: boolean;
};

function isRedisConfig(value: unknown): value is RedisConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.host === 'string' &&
    typeof candidate.port === 'number' &&
    typeof candidate.db === 'number' &&
    typeof candidate.connectOnBootstrap === 'boolean'
  );
}

export function getRedisConfig(configService: ConfigService): RedisConfig {
  const configValue: unknown = configService.getOrThrow('redis');

  if (!isRedisConfig(configValue)) {
    throw new Error('Redis config is missing required keys.');
  }

  return configValue;
}
