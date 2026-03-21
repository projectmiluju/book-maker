import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.API_PORT ?? process.env.PORT ?? 4000);

  app.setGlobalPrefix(process.env.API_PREFIX ?? 'api');

  await app.listen(port);
}
bootstrap();
