import { ConfigService } from '@nestjs/config';
import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  accessTokenSecret:
    process.env.AUTH_ACCESS_TOKEN_SECRET ?? 'book-maker-access-secret',
  accessTokenExpiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN ?? '15m',
  refreshTokenSecret:
    process.env.AUTH_REFRESH_TOKEN_SECRET ?? 'book-maker-refresh-secret',
  refreshTokenExpiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN ?? '14d',
  refreshSessionPrefix:
    process.env.AUTH_REFRESH_SESSION_PREFIX ?? 'auth:refresh',
}));

export type AuthConfig = {
  accessTokenSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
  refreshSessionPrefix: string;
};

export function getAuthConfig(configService: ConfigService): AuthConfig {
  return configService.getOrThrow<AuthConfig>('auth');
}
