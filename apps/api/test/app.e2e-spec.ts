import {
  Controller,
  Get,
  INestApplication,
  Module,
  Query,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import request from 'supertest';

import { AppModule } from './../src/app.module';
import { applyGlobalAppConfig } from './../src/shared/apply-global-app-config';

class ValidationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}

@Controller('validation-test')
class ValidationTestController {
  @Get()
  getValidationResult(@Query() query: ValidationQueryDto) {
    return query;
  }
}

@Module({
  imports: [AppModule],
  controllers: [ValidationTestController],
})
class TestAppModule {}

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    process.env.API_PREFIX = 'api';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    applyGlobalAppConfig(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/health (GET)', () => {
    const server = app.getHttpServer();

    return request(server).get('/api/health').expect(200).expect({
      status: 'ok',
      service: 'book-maker-api',
    });
  });

  it('rejects unknown query fields with the global ValidationPipe', () => {
    const server = app.getHttpServer();

    return request(server)
      .get('/api/validation-test')
      .query({ keyword: 'sea', extra: 'blocked' })
      .expect(400);
  });

  it('transforms query values with the global ValidationPipe', () => {
    const server = app.getHttpServer();

    return request(server)
      .get('/api/validation-test')
      .query({ keyword: 'sea', limit: '3' })
      .expect(200)
      .expect({
        keyword: 'sea',
        limit: 3,
      });
  });
});
