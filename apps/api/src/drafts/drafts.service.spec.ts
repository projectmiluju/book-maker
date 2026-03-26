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
});
