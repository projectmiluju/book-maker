import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JsonWebTokenError,
  JwtPayload,
  sign,
  SignOptions,
  TokenExpiredError,
  verify,
} from 'jsonwebtoken';

import { AuthConfig, getAuthConfig } from '../config/auth.config';
import { UserRecord } from '../users/user.types';
import { AccessTokenPayload, RefreshTokenPayload } from './auth.types';

@Injectable()
export class TokenService {
  private readonly config: AuthConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = getAuthConfig(this.configService);
  }

  issueAccessToken(user: UserRecord): string {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };
    const options: SignOptions = {
      expiresIn: toExpiresInValue(this.config.accessTokenExpiresIn),
    };

    return sign(payload, this.config.accessTokenSecret, options);
  }

  issueRefreshToken(user: UserRecord, refreshTokenId: string): string {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
      jti: refreshTokenId,
    };
    const options: SignOptions = {
      expiresIn: toExpiresInValue(this.config.refreshTokenExpiresIn),
    };

    return sign(payload, this.config.refreshTokenSecret, options);
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const payload = this.verifyToken(token, this.config.accessTokenSecret);

    if (payload.type !== 'access') {
      throw new UnauthorizedException('유효한 access token이 아닙니다.');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      type: 'access',
    };
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    const payload = this.verifyToken(token, this.config.refreshTokenSecret);
    const refreshTokenId = payload.jti;

    if (payload.type !== 'refresh' || typeof refreshTokenId !== 'string') {
      throw new UnauthorizedException('유효한 refresh token이 아닙니다.');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      type: 'refresh',
      jti: refreshTokenId,
    };
  }

  getRefreshTokenTtlSeconds(): number {
    return parseDurationToSeconds(this.config.refreshTokenExpiresIn);
  }

  private verifyToken(token: string, secret: string) {
    try {
      const payload = verify(token, secret);

      if (!isTokenPayload(payload)) {
        throw new UnauthorizedException('토큰 형식이 올바르지 않습니다.');
      }

      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('토큰이 만료되었습니다.');
      }

      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('토큰 검증에 실패했습니다.');
      }

      throw error;
    }
  }
}

function isTokenPayload(
  payload: string | JwtPayload,
): payload is JwtPayload & {
  sub: string;
  email: string;
  type: string;
  jti?: string;
} {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload.sub === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.type === 'string'
  );
}

function parseDurationToSeconds(value: string): number {
  const match = value.match(/^(\d+)([smhd])$/);

  if (!match) {
    const parsed = Number(value);

    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }

    throw new Error(`Unsupported auth duration value: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      throw new Error(`Unsupported auth duration unit: ${unit}`);
  }
}

function toExpiresInValue(value: string): SignOptions['expiresIn'] {
  const numericValue = Number(value);

  if (Number.isInteger(numericValue) && numericValue > 0) {
    return numericValue;
  }

  return value as SignOptions['expiresIn'];
}
