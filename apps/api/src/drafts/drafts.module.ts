import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { DraftsController } from './drafts.controller';
import { DraftsService } from './drafts.service';

@Module({
  imports: [InfrastructureModule, AuthModule],
  controllers: [DraftsController],
  providers: [DraftsService],
  exports: [DraftsService],
})
export class DraftsModule {}
