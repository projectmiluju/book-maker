import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type AppConfig = {
  port: number;
  prefix: string;
};

function isAppConfig(value: unknown): value is AppConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.port === 'number' && typeof candidate.prefix === 'string'
  );
}

export function applyGlobalAppConfig(app: INestApplication): number {
  const configService = app.get(ConfigService);
  const appConfigValue: unknown = configService.getOrThrow('app');

  if (!isAppConfig(appConfigValue)) {
    throw new Error('App config is missing required keys.');
  }

  app.setGlobalPrefix(appConfigValue.prefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  return appConfigValue.port;
}
