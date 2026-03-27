import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../infrastructure/database/database.service';
import { DraftsService } from './drafts.service';

describe('DraftsService', () => {
  let query: jest.Mock;
  let draftsService: DraftsService;

  beforeEach(() => {
    query = jest.fn();

    const databaseService = {
      getPool: () => ({
        query,
      }),
    } as unknown as DatabaseService;

    draftsService = new DraftsService(databaseService);
  });

  it('rejects a blank draft title on creation', async () => {
    await expect(
      draftsService.createDraft('user-1', {
        title: '   ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects empty update payloads', async () => {
    await expect(draftsService.updateDraft('user-1', 'draft-1', {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws when updating a draft outside the current user scope', async () => {
    query.mockResolvedValue({
      rows: [],
    });

    await expect(
      draftsService.updateDraft('user-1', 'draft-1', {
        title: '바다 초안',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when adding duplicate entries to the same draft', async () => {
    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'draft-1',
            userId: 'user-1',
            title: '초안',
            description: null,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            entryCount: 1,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'entry-1' }],
      })
      .mockResolvedValueOnce({
        rows: [{ entryId: 'entry-1' }],
      });

    await expect(
      draftsService.addEntriesToDraft('user-1', 'draft-1', ['entry-1']),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects reorder payloads that do not include the full draft entry set', async () => {
    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'draft-1',
            userId: 'user-1',
            title: '초안',
            description: null,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            entryCount: 2,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'draft-entry-1',
            position: 1,
            createdAt: new Date(),
            entryId: 'entry-1',
            entryUserId: 'user-1',
            entryTitle: '첫 기록',
            entryBody: '첫 문장',
            entryStatus: 'draft',
            entryCreatedAt: new Date(),
            entryUpdatedAt: new Date(),
            entryLastSavedAt: new Date(),
          },
          {
            id: 'draft-entry-2',
            position: 2,
            createdAt: new Date(),
            entryId: 'entry-2',
            entryUserId: 'user-1',
            entryTitle: '둘째 기록',
            entryBody: '둘째 문장',
            entryStatus: 'draft',
            entryCreatedAt: new Date(),
            entryUpdatedAt: new Date(),
            entryLastSavedAt: new Date(),
          },
        ],
      });

    await expect(
      draftsService.reorderDraftEntries('user-1', 'draft-1', ['entry-2']),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('reorders draft entries and returns the updated detail', async () => {
    const initialUpdatedAt = new Date('2026-03-26T00:00:00.000Z');
    const reorderedUpdatedAt = new Date('2026-03-26T00:10:00.000Z');
    const entryCreatedAt = new Date('2026-03-25T00:00:00.000Z');
    const draftEntryCreatedAt = new Date('2026-03-26T00:00:00.000Z');

    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'draft-1',
            userId: 'user-1',
            title: '초안',
            description: null,
            status: 'active',
            createdAt: initialUpdatedAt,
            updatedAt: initialUpdatedAt,
            entryCount: 2,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'draft-entry-1',
            position: 1,
            createdAt: draftEntryCreatedAt,
            entryId: 'entry-1',
            entryUserId: 'user-1',
            entryTitle: '첫 기록',
            entryBody: '첫 문장',
            entryStatus: 'draft',
            entryCreatedAt: entryCreatedAt,
            entryUpdatedAt: entryCreatedAt,
            entryLastSavedAt: entryCreatedAt,
          },
          {
            id: 'draft-entry-2',
            position: 2,
            createdAt: draftEntryCreatedAt,
            entryId: 'entry-2',
            entryUserId: 'user-1',
            entryTitle: '둘째 기록',
            entryBody: '둘째 문장',
            entryStatus: 'draft',
            entryCreatedAt: entryCreatedAt,
            entryUpdatedAt: entryCreatedAt,
            entryLastSavedAt: entryCreatedAt,
          },
        ],
      })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'draft-1',
            userId: 'user-1',
            title: '초안',
            description: null,
            status: 'active',
            createdAt: initialUpdatedAt,
            updatedAt: reorderedUpdatedAt,
            entryCount: 2,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'draft-entry-2',
            position: 1,
            createdAt: draftEntryCreatedAt,
            entryId: 'entry-2',
            entryUserId: 'user-1',
            entryTitle: '둘째 기록',
            entryBody: '둘째 문장',
            entryStatus: 'draft',
            entryCreatedAt: entryCreatedAt,
            entryUpdatedAt: entryCreatedAt,
            entryLastSavedAt: entryCreatedAt,
          },
          {
            id: 'draft-entry-1',
            position: 2,
            createdAt: draftEntryCreatedAt,
            entryId: 'entry-1',
            entryUserId: 'user-1',
            entryTitle: '첫 기록',
            entryBody: '첫 문장',
            entryStatus: 'draft',
            entryCreatedAt: entryCreatedAt,
            entryUpdatedAt: entryCreatedAt,
            entryLastSavedAt: entryCreatedAt,
          },
        ],
      });

    const draft = await draftsService.reorderDraftEntries('user-1', 'draft-1', [
      'entry-2',
      'entry-1',
    ]);

    expect(draft.entries.map((item) => item.entry.id)).toEqual(['entry-2', 'entry-1']);
    expect(draft.entries.map((item) => item.position)).toEqual([1, 2]);
  });

  it('throws when removing an entry that is not in the draft', async () => {
    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'draft-1',
            userId: 'user-1',
            title: '초안',
            description: null,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            entryCount: 1,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'draft-entry-1',
            position: 1,
            createdAt: new Date(),
            entryId: 'entry-1',
            entryUserId: 'user-1',
            entryTitle: '첫 기록',
            entryBody: '첫 문장',
            entryStatus: 'draft',
            entryCreatedAt: new Date(),
            entryUpdatedAt: new Date(),
            entryLastSavedAt: new Date(),
          },
        ],
      });

    await expect(
      draftsService.removeDraftEntry('user-1', 'draft-1', 'entry-9'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('removes a draft entry, reorders positions, and returns the updated detail', async () => {
    const initialUpdatedAt = new Date('2026-03-26T00:00:00.000Z');
    const removedUpdatedAt = new Date('2026-03-26T00:10:00.000Z');
    const entryCreatedAt = new Date('2026-03-25T00:00:00.000Z');
    const draftEntryCreatedAt = new Date('2026-03-26T00:00:00.000Z');

    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'draft-1',
            userId: 'user-1',
            title: '초안',
            description: null,
            status: 'active',
            createdAt: initialUpdatedAt,
            updatedAt: initialUpdatedAt,
            entryCount: 2,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'draft-entry-1',
            position: 1,
            createdAt: draftEntryCreatedAt,
            entryId: 'entry-1',
            entryUserId: 'user-1',
            entryTitle: '첫 기록',
            entryBody: '첫 문장',
            entryStatus: 'draft',
            entryCreatedAt: entryCreatedAt,
            entryUpdatedAt: entryCreatedAt,
            entryLastSavedAt: entryCreatedAt,
          },
          {
            id: 'draft-entry-2',
            position: 2,
            createdAt: draftEntryCreatedAt,
            entryId: 'entry-2',
            entryUserId: 'user-1',
            entryTitle: '둘째 기록',
            entryBody: '둘째 문장',
            entryStatus: 'draft',
            entryCreatedAt: entryCreatedAt,
            entryUpdatedAt: entryCreatedAt,
            entryLastSavedAt: entryCreatedAt,
          },
        ],
      })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'draft-1',
            userId: 'user-1',
            title: '초안',
            description: null,
            status: 'active',
            createdAt: initialUpdatedAt,
            updatedAt: removedUpdatedAt,
            entryCount: 1,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'draft-entry-2',
            position: 1,
            createdAt: draftEntryCreatedAt,
            entryId: 'entry-2',
            entryUserId: 'user-1',
            entryTitle: '둘째 기록',
            entryBody: '둘째 문장',
            entryStatus: 'draft',
            entryCreatedAt: entryCreatedAt,
            entryUpdatedAt: entryCreatedAt,
            entryLastSavedAt: entryCreatedAt,
          },
        ],
      });

    const draft = await draftsService.removeDraftEntry('user-1', 'draft-1', 'entry-1');

    expect(draft.entryCount).toBe(1);
    expect(draft.entries.map((item) => item.entry.id)).toEqual(['entry-2']);
    expect(draft.entries.map((item) => item.position)).toEqual([1]);
  });
});
