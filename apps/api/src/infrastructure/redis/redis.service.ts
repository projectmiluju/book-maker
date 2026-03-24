import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

import { InfrastructureStatus } from '../database/database.service';
import { getRedisConfig, RedisConfig } from './redis.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClientType;
  private status: InfrastructureStatus = 'disabled';
  private readonly config: RedisConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = getRedisConfig(this.configService);

    this.client = createClient({
      database: this.config.db,
      socket: {
        host: this.config.host,
        port: this.config.port,
      },
    });
  }

  async onModuleInit() {
    if (!this.config.connectOnBootstrap) {
      this.status = 'disabled';
      this.logger.log('Redis bootstrap connection is disabled for this environment.');
      return;
    }

    await this.client.connect();
    await this.client.ping();
    this.status = 'ready';
    this.logger.log('Redis connection baseline is ready.');
  }

  async onModuleDestroy() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  getClient() {
    return this.client;
  }

  getStatus(): InfrastructureStatus {
    return this.status;
  }
}
