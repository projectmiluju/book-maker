import { randomUUID } from 'node:crypto';

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
import { DatabaseService } from './../src/infrastructure/database/database.service';
import { RedisService } from './../src/infrastructure/redis/redis.service';
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

type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
};

type AuthResponseBody = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    createdAt: string;
    updatedAt: string;
  };
};

class DuplicateEmailError extends Error {
  code = '23505' as const;

  constructor() {
    super('Duplicate email');
  }
}

class FakePool {
  private readonly usersById = new Map<string, StoredUser>();
  private readonly usersByEmail = new Map<string, StoredUser>();

  query<T>(queryText: string, values: unknown[]) {
    const normalizedQuery = queryText.replace(/\s+/g, ' ').trim();

    if (normalizedQuery.startsWith('INSERT INTO users')) {
      const email = values[0] as string;

      if (this.usersByEmail.has(email)) {
        return Promise.reject(new DuplicateEmailError());
      }

      const user: StoredUser = {
        id: randomUUID(),
        email,
        passwordHash: values[1] as string,
        displayName: values[2] as string,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.usersById.set(user.id, user);
      this.usersByEmail.set(user.email, user);

      return Promise.resolve({
        rows: [this.toRow(user)] as T[],
      });
    }

    if (normalizedQuery.includes('FROM users WHERE email = $1')) {
      const email = values[0] as string;
      const user = this.usersByEmail.get(email);

      return Promise.resolve({
        rows: user ? ([this.toRow(user)] as T[]) : [],
      });
    }

    if (normalizedQuery.includes('FROM users WHERE id = $1')) {
      const id = values[0] as string;
      const user = this.usersById.get(id);

      return Promise.resolve({
        rows: user ? ([this.toRow(user)] as T[]) : [],
      });
    }

    return Promise.reject(new Error(`Unsupported fake query: ${normalizedQuery}`));
  }

  private toRow(user: StoredUser) {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

class FakeDatabaseService {
  private readonly pool = new FakePool();

  getPool() {
    return this.pool;
  }

  getStatus() {
    return 'disabled' as const;
  }
}

class FakeRedisClient {
  isOpen = true;
  private readonly store = new Map<string, string>();

  connect() {
    this.isOpen = true;
    return Promise.resolve(this);
  }

  ping() {
    return Promise.resolve('PONG');
  }

  get(key: string) {
    return Promise.resolve(this.store.get(key) ?? null);
  }

  set(key: string, value: string) {
    this.store.set(key, value);
    return Promise.resolve('OK');
  }

  del(key: string) {
    const existed = this.store.delete(key);
    return Promise.resolve(existed ? 1 : 0);
  }

  quit() {
    this.isOpen = false;
    return Promise.resolve('OK');
  }
}

class FakeRedisService {
  private readonly client = new FakeRedisClient();

  ensureConnected() {
    return Promise.resolve(this.client);
  }

  getClient() {
    return this.client;
  }

  getStatus() {
    return 'disabled' as const;
  }
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let fakeDatabaseService: FakeDatabaseService;
  let fakeRedisService: FakeRedisService;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    process.env.API_PREFIX = 'api';
    process.env.POSTGRES_CONNECT_ON_BOOTSTRAP = 'false';
    process.env.REDIS_CONNECT_ON_BOOTSTRAP = 'false';

    fakeDatabaseService = new FakeDatabaseService();
    fakeRedisService = new FakeRedisService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue(fakeDatabaseService)
      .overrideProvider(RedisService)
      .useValue(fakeRedisService)
      .compile();

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
      dependencies: {
        postgres: 'disabled',
        redis: 'disabled',
      },
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

  it('signs up a user and exposes the current user through /auth/me', async () => {
    const server = app.getHttpServer();
    const signupResponse = await request(server)
      .post('/api/auth/signup')
      .send({
        email: 'sea@example.com',
        password: 'password123',
        displayName: '바다',
      })
      .expect(201);
    const signupBody = signupResponse.body as AuthResponseBody;

    expect(signupBody.user.email).toBe('sea@example.com');
    expect(signupBody.accessToken).toEqual(expect.any(String));
    expect(signupBody.refreshToken).toEqual(expect.any(String));

    await request(server)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${signupBody.accessToken}`)
      .expect(200)
      .expect({
        id: signupBody.user.id,
        email: 'sea@example.com',
        displayName: '바다',
        createdAt: signupBody.user.createdAt,
        updatedAt: signupBody.user.updatedAt,
      });
  });

  it('rejects /auth/me without a bearer token', () => {
    const server = app.getHttpServer();

    return request(server).get('/api/auth/me').expect(401);
  });

  it('logs in an existing user with valid credentials', async () => {
    const server = app.getHttpServer();

    await request(server).post('/api/auth/signup').send({
      email: 'sea@example.com',
      password: 'password123',
      displayName: '바다',
    });

    const loginResponse = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'sea@example.com',
        password: 'password123',
      })
      .expect(201);
    const loginBody = loginResponse.body as AuthResponseBody;

    expect(loginBody.user.displayName).toBe('바다');
    expect(loginBody.accessToken).toEqual(expect.any(String));
  });

  it('rotates refresh tokens and revokes them on logout', async () => {
    const server = app.getHttpServer();
    const signupResponse = await request(server)
      .post('/api/auth/signup')
      .send({
        email: 'sea@example.com',
        password: 'password123',
        displayName: '바다',
      })
      .expect(201);
    const signupBody = signupResponse.body as AuthResponseBody;

    const refreshResponse = await request(server)
      .post('/api/auth/refresh')
      .send({
        refreshToken: signupBody.refreshToken,
      })
      .expect(201);
    const refreshBody = refreshResponse.body as AuthResponseBody;

    await request(server)
      .post('/api/auth/refresh')
      .send({
        refreshToken: signupBody.refreshToken,
      })
      .expect(401);

    await request(server)
      .post('/api/auth/logout')
      .send({
        refreshToken: refreshBody.refreshToken,
      })
      .expect(201)
      .expect({
        success: true,
      });

    await request(server)
      .post('/api/auth/refresh')
      .send({
        refreshToken: refreshBody.refreshToken,
      })
      .expect(401);
  });
});
