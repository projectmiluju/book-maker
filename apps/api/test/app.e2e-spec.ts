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
import { EntryStatus } from './../src/entries/entry.types';
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

type StoredEntry = {
  id: string;
  userId: string;
  title: string | null;
  body: string;
  status: EntryStatus;
  createdAt: Date;
  updatedAt: Date;
  lastSavedAt: Date;
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

type EntryResponseBody = {
  id: string;
  title: string | null;
  body: string;
  status: EntryStatus;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string;
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
  private readonly entriesById = new Map<string, StoredEntry>();

  query<T>(queryText: string, values: unknown[]) {
    const normalizedQuery = queryText.replace(/\s+/g, ' ').trim();

    if (normalizedQuery.startsWith('INSERT INTO users')) {
      return this.insertUser<T>(values);
    }

    if (normalizedQuery.includes('FROM users WHERE email = $1')) {
      return this.selectUserByEmail<T>(values);
    }

    if (normalizedQuery.includes('FROM users WHERE id = $1')) {
      return this.selectUserById<T>(values);
    }

    if (normalizedQuery.startsWith('INSERT INTO entries')) {
      return this.insertEntry<T>(values);
    }

    if (
      normalizedQuery.includes('FROM entries WHERE user_id = $1 ORDER BY updated_at DESC')
    ) {
      return this.listEntries<T>(values);
    }

    if (normalizedQuery.startsWith('DELETE FROM entries')) {
      return this.deleteEntry(values);
    }

    if (normalizedQuery.includes('FROM entries WHERE id = $1 AND user_id = $2')) {
      return this.selectEntryById<T>(values);
    }

    if (normalizedQuery.startsWith('UPDATE entries')) {
      return this.updateEntry<T>(values);
    }

    return Promise.reject(new Error(`Unsupported fake query: ${normalizedQuery}`));
  }

  private insertUser<T>(values: unknown[]) {
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
      rows: [this.toUserRow(user)] as T[],
    });
  }

  private selectUserByEmail<T>(values: unknown[]) {
    const email = values[0] as string;
    const user = this.usersByEmail.get(email);

    return Promise.resolve({
      rows: user ? ([this.toUserRow(user)] as T[]) : [],
    });
  }

  private selectUserById<T>(values: unknown[]) {
    const id = values[0] as string;
    const user = this.usersById.get(id);

    return Promise.resolve({
      rows: user ? ([this.toUserRow(user)] as T[]) : [],
    });
  }

  private insertEntry<T>(values: unknown[]) {
    const now = new Date();
    const entry: StoredEntry = {
      id: randomUUID(),
      userId: values[0] as string,
      title: (values[1] as string | null) ?? null,
      body: values[2] as string,
      status: values[3] as EntryStatus,
      createdAt: now,
      updatedAt: now,
      lastSavedAt: now,
    };

    this.entriesById.set(entry.id, entry);

    return Promise.resolve({
      rows: [this.toEntryRow(entry)] as T[],
    });
  }

  private listEntries<T>(values: unknown[]) {
    const userId = values[0] as string;
    const entries = [...this.entriesById.values()]
      .filter((entry) => entry.userId === userId)
      .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
      .map((entry) => this.toEntryRow(entry)) as T[];

    return Promise.resolve({
      rows: entries,
    });
  }

  private selectEntryById<T>(values: unknown[]) {
    const entryId = values[0] as string;
    const userId = values[1] as string;
    const entry = this.entriesById.get(entryId);

    if (!entry || entry.userId !== userId) {
      return Promise.resolve({
        rows: [] as T[],
      });
    }

    return Promise.resolve({
      rows: [this.toEntryRow(entry)] as T[],
    });
  }

  private updateEntry<T>(values: unknown[]) {
    const entryId = values[0] as string;
    const userId = values[1] as string;
    const updateTitle = values[2] as boolean;
    const title = values[3] as string | null;
    const updateBody = values[4] as boolean;
    const body = values[5] as string | null;
    const updateStatus = values[6] as boolean;
    const status = values[7] as EntryStatus | null;
    const entry = this.entriesById.get(entryId);

    if (!entry || entry.userId !== userId) {
      return Promise.resolve({
        rows: [] as T[],
      });
    }

    if (updateTitle) {
      entry.title = title;
    }

    if (updateBody && body !== null) {
      entry.body = body;
    }

    if (updateStatus && status !== null) {
      entry.status = status;
    }

    const now = new Date();
    entry.updatedAt = now;
    entry.lastSavedAt = now;

    return Promise.resolve({
      rows: [this.toEntryRow(entry)] as T[],
    });
  }

  private deleteEntry(values: unknown[]) {
    const entryId = values[0] as string;
    const userId = values[1] as string;
    const entry = this.entriesById.get(entryId);

    if (!entry || entry.userId !== userId) {
      return Promise.resolve({
        rowCount: 0,
      });
    }

    this.entriesById.delete(entryId);

    return Promise.resolve({
      rowCount: 1,
    });
  }

  private toUserRow(user: StoredUser) {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toEntryRow(entry: StoredEntry) {
    return {
      id: entry.id,
      userId: entry.userId,
      title: entry.title,
      body: entry.body,
      status: entry.status,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      lastSavedAt: entry.lastSavedAt,
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
    if (app) {
      await app.close();
    }
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
    const signupBody = await signup(server, 'sea@example.com');

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

    await signup(server, 'sea@example.com');

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
    const signupBody = await signup(server, 'sea@example.com');

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

  it('creates, lists, reads, updates, and deletes an entry inside the current user scope', async () => {
    const server = app.getHttpServer();
    const auth = await signup(server, 'sea@example.com');

    const createResponse = await request(server)
      .post('/api/entries')
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        title: '  바다 메모  ',
        body: '첫 문장',
      })
      .expect(201);
    const createdEntry = createResponse.body as EntryResponseBody;

    expect(createdEntry.title).toBe('바다 메모');
    expect(createdEntry.body).toBe('첫 문장');
    expect(createdEntry.status).toBe('draft');

    const listResponse = await request(server)
      .get('/api/entries')
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .expect(200);
    const listBody = listResponse.body as EntryResponseBody[];

    expect(listBody).toHaveLength(1);
    expect(listBody[0].id).toBe(createdEntry.id);

    await request(server)
      .get(`/api/entries/${createdEntry.id}`)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .expect(200)
      .expect({
        ...createdEntry,
      });

    const updateResponse = await request(server)
      .patch(`/api/entries/${createdEntry.id}`)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        title: '',
        body: '수정된 문장',
        status: 'completed',
      })
      .expect(200);
    const updatedEntry = updateResponse.body as EntryResponseBody;

    expect(updatedEntry.title).toBeNull();
    expect(updatedEntry.body).toBe('수정된 문장');
    expect(updatedEntry.status).toBe('completed');
    expect(new Date(updatedEntry.lastSavedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(createdEntry.lastSavedAt).getTime(),
    );

    await request(server)
      .delete(`/api/entries/${createdEntry.id}`)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .expect(200)
      .expect({
        success: true,
      });

    await request(server)
      .get(`/api/entries/${createdEntry.id}`)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .expect(404);
  });

  it('blocks access to another user entry', async () => {
    const server = app.getHttpServer();
    const owner = await signup(server, 'owner@example.com');
    const stranger = await signup(server, 'other@example.com');

    const createResponse = await request(server)
      .post('/api/entries')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        body: 'owner entry',
      })
      .expect(201);
    const createdEntry = createResponse.body as EntryResponseBody;

    await request(server)
      .get(`/api/entries/${createdEntry.id}`)
      .set('Authorization', `Bearer ${stranger.accessToken}`)
      .expect(404);

    await request(server)
      .patch(`/api/entries/${createdEntry.id}`)
      .set('Authorization', `Bearer ${stranger.accessToken}`)
      .send({
        body: 'stolen',
      })
      .expect(404);

    await request(server)
      .delete(`/api/entries/${createdEntry.id}`)
      .set('Authorization', `Bearer ${stranger.accessToken}`)
      .expect(404);
  });
});

async function signup(server: ReturnType<INestApplication['getHttpServer']>, email: string) {
  const response = await request(server)
    .post('/api/auth/signup')
    .send({
      email,
      password: 'password123',
      displayName: '바다',
    })
    .expect(201);

  return response.body as AuthResponseBody;
}
