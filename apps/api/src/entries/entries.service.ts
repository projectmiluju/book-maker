import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { DatabaseService } from '../infrastructure/database/database.service';
import { EntryRecord, EntryStatus } from './entry.types';

type EntryRow = {
  id: string;
  userId: string;
  title: string | null;
  body: string;
  status: EntryStatus;
  createdAt: Date;
  updatedAt: Date;
  lastSavedAt: Date;
};

type CreateEntryInput = {
  title?: string;
  body?: string;
  status?: EntryStatus;
};

type UpdateEntryInput = {
  title?: string;
  body?: string;
  status?: EntryStatus;
};

@Injectable()
export class EntriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createEntry(userId: string, input: CreateEntryInput): Promise<EntryRecord> {
    const result = await this.databaseService.getPool().query<EntryRow>(
      `
        INSERT INTO entries (user_id, title, body, status)
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          user_id AS "userId",
          title,
          body,
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt",
          last_saved_at AS "lastSavedAt"
      `,
      [userId, normalizeTitle(input.title), input.body ?? '', input.status ?? 'draft'],
    );

    return result.rows[0];
  }

  async listEntries(userId: string, query?: string): Promise<EntryRecord[]> {
    const normalizedQuery = normalizeSearchQuery(query);
    const searchPattern = normalizedQuery ? `%${escapeLike(normalizedQuery)}%` : null;
    const result = await this.databaseService.getPool().query<EntryRow>(
      `
        SELECT
          id,
          user_id AS "userId",
          title,
          body,
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt",
          last_saved_at AS "lastSavedAt"
        FROM entries
        WHERE user_id = $1
          AND (
            $2::text IS NULL
            OR COALESCE(title, '') ILIKE $2 ESCAPE '\\'
            OR body ILIKE $2 ESCAPE '\\'
          )
        ORDER BY updated_at DESC, created_at DESC
      `,
      [userId, searchPattern],
    );

    return result.rows;
  }

  async findEntryById(userId: string, entryId: string): Promise<EntryRecord> {
    const result = await this.databaseService.getPool().query<EntryRow>(
      `
        SELECT
          id,
          user_id AS "userId",
          title,
          body,
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt",
          last_saved_at AS "lastSavedAt"
        FROM entries
        WHERE id = $1 AND user_id = $2
        LIMIT 1
      `,
      [entryId, userId],
    );

    const entry = result.rows[0];

    if (!entry) {
      throw new NotFoundException('기록을 찾을 수 없습니다.');
    }

    return entry;
  }

  async updateEntry(
    userId: string,
    entryId: string,
    input: UpdateEntryInput,
  ): Promise<EntryRecord> {
    if (input.title === undefined && input.body === undefined && input.status === undefined) {
      throw new BadRequestException('수정할 기록 필드가 필요합니다.');
    }

    const result = await this.databaseService.getPool().query<EntryRow>(
      `
        UPDATE entries
        SET
          title = CASE WHEN $3 THEN $4 ELSE title END,
          body = CASE WHEN $5 THEN $6 ELSE body END,
          status = CASE WHEN $7 THEN $8 ELSE status END,
          updated_at = NOW(),
          last_saved_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING
          id,
          user_id AS "userId",
          title,
          body,
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt",
          last_saved_at AS "lastSavedAt"
      `,
      [
        entryId,
        userId,
        input.title !== undefined,
        normalizeTitle(input.title),
        input.body !== undefined,
        input.body ?? null,
        input.status !== undefined,
        input.status ?? null,
      ],
    );

    const entry = result.rows[0];

    if (!entry) {
      throw new NotFoundException('기록을 찾을 수 없습니다.');
    }

    return entry;
  }

  async deleteEntry(userId: string, entryId: string): Promise<void> {
    const result = await this.databaseService.getPool().query(
      `
        DELETE FROM entries
        WHERE id = $1 AND user_id = $2
      `,
      [entryId, userId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('기록을 찾을 수 없습니다.');
    }
  }
}

function normalizeTitle(title: string | undefined): string | null {
  if (title === undefined) {
    return null;
  }

  const normalized = title.trim();

  return normalized.length > 0 ? normalized : null;
}

function normalizeSearchQuery(query: string | undefined): string | null {
  if (query === undefined) {
    return null;
  }

  const normalized = query.trim();

  return normalized.length > 0 ? normalized : null;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
