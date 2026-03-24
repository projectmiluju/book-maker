import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthConfig, getAuthConfig } from '../config/auth.config';
import { RedisService } from '../infrastructure/redis/redis.service';

@Injectable()
export class SessionService {
  private readonly config: AuthConfig;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.config = getAuthConfig(this.configService);
  }

  async storeRefreshToken(
    userId: string,
    refreshTokenId: string,
    refreshToken: string,
    ttlSeconds: number,
  ) {
    const client = await this.redisService.ensureConnected();

    await client.set(this.getSessionKey(userId, refreshTokenId), this.hashToken(refreshToken), {
      EX: ttlSeconds,
    });
  }

  async validateRefreshToken(
    userId: string,
    refreshTokenId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const client = await this.redisService.ensureConnected();
    const storedHash = await client.get(this.getSessionKey(userId, refreshTokenId));

    if (typeof storedHash !== 'string') {
      return false;
    }

    return storedHash === this.hashToken(refreshToken);
  }

  async revokeRefreshToken(userId: string, refreshTokenId: string) {
    const client = await this.redisService.ensureConnected();

    await client.del(this.getSessionKey(userId, refreshTokenId));
  }

  private getSessionKey(userId: string, refreshTokenId: string) {
    return `${this.config.refreshSessionPrefix}:${userId}:${refreshTokenId}`;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
