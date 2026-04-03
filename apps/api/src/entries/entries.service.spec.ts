import { BadRequestException, NotFoundException } from '@nestjs/common';

import { DatabaseService } from '../infrastructure/database/database.service';
import { EntriesService } from './entries.service';

describe('EntriesService', () => {
  let query: jest.Mock;
  let entriesService: EntriesService;

  beforeEach(() => {
    query = jest.fn();

    const databaseService = {
      getPool: () => ({
        query,
      }),
    } as unknown as DatabaseService;

    entriesService = new EntriesService(databaseService);
  });

  it('rejects empty update payloads', async () => {
    await expect(entriesService.updateEntry('user-1', 'entry-1', {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws when updating an entry outside the current user scope', async () => {
    query.mockResolvedValue({
      rows: [],
    });

    await expect(
      entriesService.updateEntry('user-1', 'entry-1', {
        body: 'updated body',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when deleting a missing entry', async () => {
    query.mockResolvedValue({
      rowCount: 0,
    });

    await expect(entriesService.deleteEntry('user-1', 'entry-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('filters entries by a normalized search query inside the current user scope', async () => {
    query.mockResolvedValue({
      rows: [],
    });

    await entriesService.listEntries('user-1', '  파도_기억%  ');

    expect(query).toHaveBeenCalledWith(expect.stringContaining("COALESCE(title, '') ILIKE $2"), [
      'user-1',
      '%파도\\_기억\\%%',
    ]);
  });
});
