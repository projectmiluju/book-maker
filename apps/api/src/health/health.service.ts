import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../infrastructure/database/database.service';
import { RedisService } from '../infrastructure/redis/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'book-maker-api',
      dependencies: {
        postgres: this.databaseService.getStatus(),
        redis: this.redisService.getStatus(),
      },
    };
  }
}
