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
import { DraftStatus } from './../src/drafts/draft.types';
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

type DraftResponseBody = {
  id: string;
  title: string;
  description: string | null;
  status: DraftStatus;
  entryCount: number;
  createdAt: string;
  updatedAt: string;
};

type DraftDetailResponseBody = DraftResponseBody & {
  entries: Array<{
    id: string;
    position: number;
    createdAt: string;
    entry: EntryResponseBody;
  }>;
};

type StoredDraft = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: DraftStatus;
  createdAt: Date;
  updatedAt: Date;
};

type StoredDraftEntry = {
  id: string;
  draftId: string;
  entryId: string;
  position: number;
  createdAt: Date;
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
  private readonly draftsById = new Map<string, StoredDraft>();
  private readonly draftEntriesById = new Map<string, StoredDraftEntry>();

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

    if (normalizedQuery.startsWith('INSERT INTO drafts')) {
      return this.insertDraft<T>(values);
    }

    if (normalizedQuery.startsWith('INSERT INTO draft_entries')) {
      return this.insertDraftEntry(values);
    }

    if (normalizedQuery.startsWith('UPDATE draft_entries')) {
      return this.updateDraftEntryPosition(values);
    }

    if (
      normalizedQuery.includes('FROM entries WHERE user_id = $1 ORDER BY updated_at DESC')
    ) {
      return this.listEntries<T>(values);
    }

    if (
      normalizedQuery.includes('FROM drafts d LEFT JOIN draft_entries de ON de.draft_id = d.id') &&
      normalizedQuery.includes('WHERE d.user_id = $1') &&
      normalizedQuery.includes('ORDER BY d.updated_at DESC')
    ) {
      return this.listDrafts<T>(values);
    }

    if (
      normalizedQuery.includes('FROM drafts d LEFT JOIN draft_entries de ON de.draft_id = d.id') &&
      normalizedQuery.includes('WHERE d.id = $1 AND d.user_id = $2')
    ) {
      return this.selectDraftById<T>(values);
    }

    if (
      normalizedQuery.includes('FROM draft_entries de INNER JOIN entries e ON e.id = de.entry_id')
    ) {
      return this.listDraftEntries<T>(values);
    }

    if (
      normalizedQuery.includes('FROM entries WHERE user_id = $1 AND id = ANY($2::uuid[])')
    ) {
      return this.selectEntriesByIds<T>(values);
    }

    if (
      normalizedQuery.includes(
        'FROM draft_entries WHERE draft_id = $1 AND entry_id = ANY($2::uuid[])',
      )
    ) {
      return this.selectDraftEntriesByEntryIds<T>(values);
    }

    if (normalizedQuery.includes('SELECT COALESCE(MAX(position), 0) AS "maxPosition"')) {
      return this.selectDraftMaxPosition<T>(values);
    }

    if (normalizedQuery.includes('SELECT COUNT(*)::int AS "maxPosition"')) {
      return this.countDraftEntries<T>(values);
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

    if (
      normalizedQuery.startsWith('UPDATE drafts') &&
      normalizedQuery.includes('RETURNING')
    ) {
      return this.updateDraft<T>(values);
    }

    if (
      normalizedQuery.startsWith('UPDATE drafts') &&
      !normalizedQuery.includes('RETURNING')
    ) {
      return this.touchDraft(values);
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

  private insertDraft<T>(values: unknown[]) {
    const now = new Date();
    const draft: StoredDraft = {
      id: randomUUID(),
      userId: values[0] as string,
      title: values[1] as string,
      description: (values[2] as string | null) ?? null,
      status: values[3] as DraftStatus,
      createdAt: now,
      updatedAt: now,
    };

    this.draftsById.set(draft.id, draft);

    return Promise.resolve({
      rows: [this.toDraftRow(draft, 0)] as T[],
    });
  }

  private insertDraftEntry(values: unknown[]) {
    const draftId = values[0] as string;
    const entryId = values[1] as string;
    const position = values[2] as number;
    const draftEntry: StoredDraftEntry = {
      id: randomUUID(),
      draftId,
      entryId,
      position,
      createdAt: new Date(),
    };

    this.draftEntriesById.set(draftEntry.id, draftEntry);

    return Promise.resolve({
      rowCount: 1,
      rows: [],
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

  private listDrafts<T>(values: unknown[]) {
    const userId = values[0] as string;
    const drafts = [...this.draftsById.values()]
      .filter((draft) => draft.userId === userId)
      .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
      .map((draft) => this.toDraftRow(draft, this.getDraftEntryCount(draft.id))) as T[];

    return Promise.resolve({
      rows: drafts,
    });
  }

  private selectDraftById<T>(values: unknown[]) {
    const draftId = values[0] as string;
    const userId = values[1] as string;
    const draft = this.draftsById.get(draftId);

    if (!draft || draft.userId !== userId) {
      return Promise.resolve({
        rows: [] as T[],
      });
    }

    return Promise.resolve({
      rows: [this.toDraftRow(draft, this.getDraftEntryCount(draft.id))] as T[],
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

  private listDraftEntries<T>(values: unknown[]) {
    const draftId = values[0] as string;
    const rows = [...this.draftEntriesById.values()]
      .filter((draftEntry) => draftEntry.draftId === draftId)
      .sort((left, right) => left.position - right.position)
      .map((draftEntry) => {
        const entry = this.entriesById.get(draftEntry.entryId);

        if (!entry) {
          throw new Error(`Missing entry for draft entry ${draftEntry.id}`);
        }

        return {
          id: draftEntry.id,
          position: draftEntry.position,
          createdAt: draftEntry.createdAt,
          entryId: entry.id,
          entryUserId: entry.userId,
          entryTitle: entry.title,
          entryBody: entry.body,
          entryStatus: entry.status,
          entryCreatedAt: entry.createdAt,
          entryUpdatedAt: entry.updatedAt,
          entryLastSavedAt: entry.lastSavedAt,
        };
      }) as T[];

    return Promise.resolve({
      rows,
    });
  }

  private selectEntriesByIds<T>(values: unknown[]) {
    const userId = values[0] as string;
    const entryIds = values[1] as string[];
    const rows = entryIds
      .map((entryId) => this.entriesById.get(entryId))
      .filter((entry): entry is StoredEntry => Boolean(entry && entry.userId === userId))
      .map((entry) => ({ id: entry.id })) as T[];

    return Promise.resolve({
      rows,
    });
  }

  private selectDraftEntriesByEntryIds<T>(values: unknown[]) {
    const draftId = values[0] as string;
    const entryIds = new Set(values[1] as string[]);
    const rows = [...this.draftEntriesById.values()]
      .filter((draftEntry) => draftEntry.draftId === draftId && entryIds.has(draftEntry.entryId))
      .map((draftEntry) => ({ entryId: draftEntry.entryId })) as T[];

    return Promise.resolve({
      rows,
    });
  }

  private selectDraftMaxPosition<T>(values: unknown[]) {
    const draftId = values[0] as string;
    const maxPosition = [...this.draftEntriesById.values()]
      .filter((draftEntry) => draftEntry.draftId === draftId)
      .reduce((currentMax, draftEntry) => Math.max(currentMax, draftEntry.position), 0);

    return Promise.resolve({
      rows: [{ maxPosition }] as T[],
    });
  }

  private countDraftEntries<T>(values: unknown[]) {
    const draftId = values[0] as string;

    return Promise.resolve({
      rows: [{ maxPosition: this.getDraftEntryCount(draftId) }] as T[],
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

  private updateDraft<T>(values: unknown[]) {
    const draftId = values[0] as string;
    const userId = values[1] as string;
    const updateTitle = values[2] as boolean;
    const title = values[3] as string | null;
    const updateDescription = values[4] as boolean;
    const description = values[5] as string | null;
    const updateStatus = values[6] as boolean;
    const status = values[7] as DraftStatus | null;
    const draft = this.draftsById.get(draftId);

    if (!draft || draft.userId !== userId) {
      return Promise.resolve({
        rows: [] as T[],
      });
    }

    if (updateTitle && title !== null) {
      draft.title = title;
    }

    if (updateDescription) {
      draft.description = description;
    }

    if (updateStatus && status !== null) {
      draft.status = status;
    }

    draft.updatedAt = new Date();

    return Promise.resolve({
      rows: [this.toDraftRow(draft, this.getDraftEntryCount(draft.id))] as T[],
    });
  }

  private touchDraft(values: unknown[]) {
    const draftId = values[0] as string;
    const userId = values[1] as string;
    const draft = this.draftsById.get(draftId);

    if (!draft || draft.userId !== userId) {
      return Promise.resolve({
        rowCount: 0,
      });
    }

    draft.updatedAt = new Date();

    return Promise.resolve({
      rowCount: 1,
    });
  }

  private updateDraftEntryPosition(values: unknown[]) {
    const draftId = values[0] as string;
    const entryId = values[1] as string;
    const position = values[2] as number;
    const draftEntry = [...this.draftEntriesById.values()].find(
      (item) => item.draftId === draftId && item.entryId === entryId,
    );

    if (!draftEntry) {
      return Promise.resolve({
        rowCount: 0,
      });
    }

    draftEntry.position = position;

    return Promise.resolve({
      rowCount: 1,
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

  private toDraftRow(draft: StoredDraft, entryCount: number) {
    return {
      id: draft.id,
      userId: draft.userId,
      title: draft.title,
      description: draft.description,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      entryCount,
    };
  }

  private getDraftEntryCount(draftId: string) {
    return [...this.draftEntriesById.values()].filter(
      (draftEntry) => draftEntry.draftId === draftId,
    ).length;
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

  it('creates, lists, reads, updates, and adds entries to a draft inside the current user scope', async () => {
    const server = app.getHttpServer();
    const auth = await signup(server, 'draft-owner@example.com');

    const firstEntry = await createEntry(server, auth.accessToken, {
      title: '첫 기록',
      body: '첫 문장',
    });
    const secondEntry = await createEntry(server, auth.accessToken, {
      title: '둘째 기록',
      body: '둘째 문장',
    });

    const createDraftResponse = await request(server)
      .post('/api/drafts')
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        title: '  파도 초안  ',
        description: '  바다를 모은다  ',
      })
      .expect(201);
    const createdDraft = createDraftResponse.body as DraftResponseBody;

    expect(createdDraft.title).toBe('파도 초안');
    expect(createdDraft.description).toBe('바다를 모은다');
    expect(createdDraft.entryCount).toBe(0);
    expect(createdDraft.status).toBe('active');

    const listResponse = await request(server)
      .get('/api/drafts')
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .expect(200);
    const listBody = listResponse.body as DraftResponseBody[];

    expect(listBody).toHaveLength(1);
    expect(listBody[0].id).toBe(createdDraft.id);

    const updateResponse = await request(server)
      .patch(`/api/drafts/${createdDraft.id}`)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        title: '고요한 파도',
        description: '',
        status: 'archived',
      })
      .expect(200);
    const updatedDraft = updateResponse.body as DraftResponseBody;

    expect(updatedDraft.title).toBe('고요한 파도');
    expect(updatedDraft.description).toBeNull();
    expect(updatedDraft.status).toBe('archived');

    const attachResponse = await request(server)
      .post(`/api/drafts/${createdDraft.id}/entries`)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        entryIds: [firstEntry.id, secondEntry.id],
      })
      .expect(201);
    const attachedDraft = attachResponse.body as DraftDetailResponseBody;

    expect(attachedDraft.entryCount).toBe(2);
    expect(attachedDraft.entries).toHaveLength(2);
    expect(attachedDraft.entries[0].position).toBe(1);
    expect(attachedDraft.entries[0].entry.id).toBe(firstEntry.id);
    expect(attachedDraft.entries[1].position).toBe(2);
    expect(attachedDraft.entries[1].entry.id).toBe(secondEntry.id);

    await request(server)
      .get(`/api/drafts/${createdDraft.id}`)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .expect(200)
      .expect(attachedDraft);

    await request(server)
      .post(`/api/drafts/${createdDraft.id}/entries`)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        entryIds: [firstEntry.id],
      })
      .expect(409);

    const reorderResponse = await request(server)
      .patch(`/api/drafts/${createdDraft.id}/entries/reorder`)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        entryIds: [secondEntry.id, firstEntry.id],
      })
      .expect(200);
    const reorderedDraft = reorderResponse.body as DraftDetailResponseBody;

    expect(reorderedDraft.entries).toHaveLength(2);
    expect(reorderedDraft.entries[0].position).toBe(1);
    expect(reorderedDraft.entries[0].entry.id).toBe(secondEntry.id);
    expect(reorderedDraft.entries[1].position).toBe(2);
    expect(reorderedDraft.entries[1].entry.id).toBe(firstEntry.id);

    await request(server)
      .patch(`/api/drafts/${createdDraft.id}/entries/reorder`)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        entryIds: [firstEntry.id],
      })
      .expect(400);
  });

  it('blocks access to another user draft and attached entries', async () => {
    const server = app.getHttpServer();
    const owner = await signup(server, 'draft-owner-2@example.com');
    const stranger = await signup(server, 'draft-other@example.com');

    const ownerEntry = await createEntry(server, owner.accessToken, {
      body: 'owner entry',
    });

    const createDraftResponse = await request(server)
      .post('/api/drafts')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        title: 'owner draft',
      })
      .expect(201);
    const ownerDraft = createDraftResponse.body as DraftResponseBody;

    await request(server)
      .get(`/api/drafts/${ownerDraft.id}`)
      .set('Authorization', `Bearer ${stranger.accessToken}`)
      .expect(404);

    await request(server)
      .patch(`/api/drafts/${ownerDraft.id}`)
      .set('Authorization', `Bearer ${stranger.accessToken}`)
      .send({
        title: 'stolen',
      })
      .expect(404);

    await request(server)
      .post(`/api/drafts/${ownerDraft.id}/entries`)
      .set('Authorization', `Bearer ${stranger.accessToken}`)
      .send({
        entryIds: [ownerEntry.id],
      })
      .expect(404);

    const strangerEntry = await createEntry(server, stranger.accessToken, {
      body: 'stranger entry',
    });

    await request(server)
      .post(`/api/drafts/${ownerDraft.id}/entries`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        entryIds: [strangerEntry.id],
      })
      .expect(404);

    await request(server)
      .patch(`/api/drafts/${ownerDraft.id}/entries/reorder`)
      .set('Authorization', `Bearer ${stranger.accessToken}`)
      .send({
        entryIds: [ownerEntry.id],
      })
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

async function createEntry(
  server: ReturnType<INestApplication['getHttpServer']>,
  accessToken: string,
  payload: {
    title?: string;
    body: string;
  },
) {
  const response = await request(server)
    .post('/api/entries')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload)
    .expect(201);

  return response.body as EntryResponseBody;
}
