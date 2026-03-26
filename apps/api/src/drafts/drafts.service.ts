import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EntryStatus } from '../entries/entry.types';
import { DatabaseService } from '../infrastructure/database/database.service';
import {
  DraftDetailRecord,
  DraftEntryRecord,
  DraftRecord,
  DraftStatus,
} from './draft.types';

type DraftRow = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: DraftStatus;
  createdAt: Date;
  updatedAt: Date;
  entryCount: number | string;
};

type DraftEntryRow = {
  id: string;
  position: number;
  createdAt: Date;
  entryId: string;
  entryUserId: string;
  entryTitle: string | null;
  entryBody: string;
  entryStatus: EntryStatus;
  entryCreatedAt: Date;
  entryUpdatedAt: Date;
  entryLastSavedAt: Date;
};

type ExistingDraftEntryRow = {
  entryId: string;
};

type ExistingEntryRow = {
  id: string;
};

type MaxPositionRow = {
  maxPosition: number | string | null;
};

type CreateDraftInput = {
  title: string;
  description?: string;
  status?: DraftStatus;
};

type UpdateDraftInput = {
  title?: string;
  description?: string;
  status?: DraftStatus;
};

@Injectable()
export class DraftsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createDraft(userId: string, input: CreateDraftInput): Promise<DraftRecord> {
    const title = normalizeRequiredTitle(input.title);
    const description = normalizeOptionalText(input.description);
    const result = await this.databaseService.getPool().query<DraftRow>(
      `
        INSERT INTO drafts (user_id, title, description, status)
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          user_id AS "userId",
          title,
          description,
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [userId, title, description, input.status ?? 'active'],
    );

    return {
      ...toDraftRecord(result.rows[0]),
      entryCount: 0,
    };
  }

  async listDrafts(userId: string): Promise<DraftRecord[]> {
    const result = await this.databaseService.getPool().query<DraftRow>(
      `
        SELECT
          d.id,
          d.user_id AS "userId",
          d.title,
          d.description,
          d.status,
          d.created_at AS "createdAt",
          d.updated_at AS "updatedAt",
          COUNT(de.id)::int AS "entryCount"
        FROM drafts d
        LEFT JOIN draft_entries de ON de.draft_id = d.id
        WHERE d.user_id = $1
        GROUP BY d.id
        ORDER BY d.updated_at DESC, d.created_at DESC
      `,
      [userId],
    );

    return result.rows.map(toDraftRecord);
  }

  async findDraftById(userId: string, draftId: string): Promise<DraftDetailRecord> {
    const draft = await this.findDraftRecordById(userId, draftId);
    const entries = await this.listDraftEntries(draftId);

    return {
      ...draft,
      entries,
    };
  }

  async updateDraft(
    userId: string,
    draftId: string,
    input: UpdateDraftInput,
  ): Promise<DraftRecord> {
    if (
      input.title === undefined &&
      input.description === undefined &&
      input.status === undefined
    ) {
      throw new BadRequestException('수정할 초안 필드가 필요합니다.');
    }

    const result = await this.databaseService.getPool().query<DraftRow>(
      `
        UPDATE drafts
        SET
          title = CASE WHEN $3 THEN $4 ELSE title END,
          description = CASE WHEN $5 THEN $6 ELSE description END,
          status = CASE WHEN $7 THEN $8 ELSE status END,
          updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING
          id,
          user_id AS "userId",
          title,
          description,
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [
        draftId,
        userId,
        input.title !== undefined,
        input.title !== undefined ? normalizeRequiredTitle(input.title) : null,
        input.description !== undefined,
        normalizeOptionalText(input.description),
        input.status !== undefined,
        input.status ?? null,
      ],
    );

    const draft = result.rows[0];

    if (!draft) {
      throw new NotFoundException('초안을 찾을 수 없습니다.');
    }

    return {
      ...toDraftRecord(draft),
      entryCount: await this.countDraftEntries(draftId),
    };
  }

  async addEntriesToDraft(
    userId: string,
    draftId: string,
    entryIds: string[],
  ): Promise<DraftDetailRecord> {
    if (entryIds.length === 0) {
      throw new BadRequestException('초안에 담을 기록이 필요합니다.');
    }

    await this.findDraftRecordById(userId, draftId);

    const existingEntriesResult =
      await this.databaseService.getPool().query<ExistingEntryRow>(
        `
          SELECT id
          FROM entries
          WHERE user_id = $1 AND id = ANY($2::uuid[])
        `,
        [userId, entryIds],
      );

    if (existingEntriesResult.rows.length !== entryIds.length) {
      throw new NotFoundException('기록을 찾을 수 없습니다.');
    }

    const duplicatedEntriesResult =
      await this.databaseService.getPool().query<ExistingDraftEntryRow>(
        `
          SELECT entry_id AS "entryId"
          FROM draft_entries
          WHERE draft_id = $1 AND entry_id = ANY($2::uuid[])
        `,
        [draftId, entryIds],
      );

    if (duplicatedEntriesResult.rows.length > 0) {
      throw new ConflictException('이미 초안에 담긴 기록입니다.');
    }

    const maxPositionResult = await this.databaseService.getPool().query<MaxPositionRow>(
      `
        SELECT COALESCE(MAX(position), 0) AS "maxPosition"
        FROM draft_entries
        WHERE draft_id = $1
      `,
      [draftId],
    );

    let position = Number(maxPositionResult.rows[0]?.maxPosition ?? 0);

    for (const entryId of entryIds) {
      position += 1;

      await this.databaseService.getPool().query(
        `
          INSERT INTO draft_entries (draft_id, entry_id, position)
          VALUES ($1, $2, $3)
        `,
        [draftId, entryId, position],
      );
    }

    await this.databaseService.getPool().query(
      `
        UPDATE drafts
        SET updated_at = NOW()
        WHERE id = $1 AND user_id = $2
      `,
      [draftId, userId],
    );

    return this.findDraftById(userId, draftId);
  }

  private async findDraftRecordById(userId: string, draftId: string): Promise<DraftRecord> {
    const result = await this.databaseService.getPool().query<DraftRow>(
      `
        SELECT
          d.id,
          d.user_id AS "userId",
          d.title,
          d.description,
          d.status,
          d.created_at AS "createdAt",
          d.updated_at AS "updatedAt",
          COUNT(de.id)::int AS "entryCount"
        FROM drafts d
        LEFT JOIN draft_entries de ON de.draft_id = d.id
        WHERE d.id = $1 AND d.user_id = $2
        GROUP BY d.id
        LIMIT 1
      `,
      [draftId, userId],
    );

    const draft = result.rows[0];

    if (!draft) {
      throw new NotFoundException('초안을 찾을 수 없습니다.');
    }

    return toDraftRecord(draft);
  }

  private async listDraftEntries(draftId: string): Promise<DraftEntryRecord[]> {
    const result = await this.databaseService.getPool().query<DraftEntryRow>(
      `
        SELECT
          de.id,
          de.position,
          de.created_at AS "createdAt",
          e.id AS "entryId",
          e.user_id AS "entryUserId",
          e.title AS "entryTitle",
          e.body AS "entryBody",
          e.status AS "entryStatus",
          e.created_at AS "entryCreatedAt",
          e.updated_at AS "entryUpdatedAt",
          e.last_saved_at AS "entryLastSavedAt"
        FROM draft_entries de
        INNER JOIN entries e ON e.id = de.entry_id
        WHERE de.draft_id = $1
        ORDER BY de.position ASC, de.created_at ASC
      `,
      [draftId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      position: row.position,
      createdAt: row.createdAt,
      entry: {
        id: row.entryId,
        userId: row.entryUserId,
        title: row.entryTitle,
        body: row.entryBody,
        status: row.entryStatus,
        createdAt: row.entryCreatedAt,
        updatedAt: row.entryUpdatedAt,
        lastSavedAt: row.entryLastSavedAt,
      },
    }));
  }

  private async countDraftEntries(draftId: string): Promise<number> {
    const result = await this.databaseService.getPool().query<MaxPositionRow>(
      `
        SELECT COUNT(*)::int AS "maxPosition"
        FROM draft_entries
        WHERE draft_id = $1
      `,
      [draftId],
    );

    return Number(result.rows[0]?.maxPosition ?? 0);
  }
}

function toDraftRecord(row: DraftRow): DraftRecord {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    entryCount: Number(row.entryCount ?? 0),
  };
}

function normalizeRequiredTitle(title: string): string {
  const normalized = title.trim();

  if (normalized.length === 0) {
    throw new BadRequestException('초안 제목은 비워둘 수 없습니다.');
  }

  return normalized;
}

function normalizeOptionalText(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}
