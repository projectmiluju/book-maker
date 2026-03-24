import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

import { DatabaseConfig, getDatabaseConfig } from './database.config';

export type InfrastructureStatus = 'disabled' | 'ready';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;
  private status: InfrastructureStatus = 'disabled';
  private readonly config: DatabaseConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = getDatabaseConfig(this.configService);

    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
    });
  }

  async onModuleInit() {
    if (!this.config.connectOnBootstrap) {
      this.status = 'disabled';
      this.logger.log(
        'PostgreSQL bootstrap connection is disabled for this environment.',
      );
      return;
    }

    await this.pool.query('SELECT 1');
    this.status = 'ready';
    this.logger.log('PostgreSQL connection baseline is ready.');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  getPool() {
    return this.pool;
  }

  getStatus(): InfrastructureStatus {
    return this.status;
  }
}
