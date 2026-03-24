import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { applyGlobalAppConfig } from './shared/apply-global-app-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = applyGlobalAppConfig(app);

  await app.listen(port);
}
void bootstrap();
