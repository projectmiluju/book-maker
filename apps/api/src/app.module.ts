import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { appConfig } from './config/app.config';
import { authConfig } from './config/auth.config';
import { databaseConfig } from './config/database.config';
import { validateEnvironment } from './config/env.validation';
import { redisConfig } from './config/redis.config';
import { EntriesModule } from './entries/entries.module';
import { HealthModule } from './health/health.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig, redisConfig],
      validate: validateEnvironment,
    }),
    InfrastructureModule,
    UsersModule,
    AuthModule,
    EntriesModule,
    HealthModule,
  ],
})
export class AppModule {}
