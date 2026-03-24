import { ConfigService } from '@nestjs/config';

export type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  connectOnBootstrap: boolean;
};

function isDatabaseConfig(value: unknown): value is DatabaseConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.host === 'string' &&
    typeof candidate.port === 'number' &&
    typeof candidate.database === 'string' &&
    typeof candidate.username === 'string' &&
    typeof candidate.password === 'string' &&
    typeof candidate.connectOnBootstrap === 'boolean'
  );
}

export function getDatabaseConfig(configService: ConfigService): DatabaseConfig {
  const configValue: unknown = configService.getOrThrow('database');

  if (!isDatabaseConfig(configValue)) {
    throw new Error('Database config is missing required keys.');
  }

  return configValue;
}
