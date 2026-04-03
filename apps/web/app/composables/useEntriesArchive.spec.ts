import { describe, expect, it, vi } from 'vitest';

import type { PublicEntry } from '../types/entries';
import { useEntriesArchive } from './useEntriesArchive';

function createEntryFixture(overrides: Partial<PublicEntry> = {}): PublicEntry {
  return {
    id: 'entry-1',
    title: '창가에 남은 빛',
    body: '저녁빛이 식탁 위를 천천히 지나가던 순간을 붙잡아 두고 싶었다.',
    status: 'draft',
    createdAt: '2026-03-25T00:00:00.000Z',
    updatedAt: '2026-03-25T00:00:00.000Z',
    lastSavedAt: '2026-03-25T00:00:00.000Z',
    ...overrides,
  };
}

describe('useEntriesArchive', () => {
  it('loads archive entries and marks the list as loaded', async () => {
    const listEntries = vi
      .fn()
      .mockResolvedValue([
        createEntryFixture(),
        createEntryFixture({ id: 'entry-2', title: '두 번째 기록' }),
      ]);
    const archive = useEntriesArchive({
      api: {
        listEntries,
        getEntry: vi.fn(),
      },
    });

    await archive.loadEntries();

    expect(archive.listState.value).toBe('loaded');
    expect(archive.entries.value).toHaveLength(2);
    expect(listEntries).toHaveBeenCalledWith(undefined);
  });

  it('marks the archive as empty when there are no entries', async () => {
    const archive = useEntriesArchive({
      api: {
        listEntries: vi.fn().mockResolvedValue([]),
        getEntry: vi.fn(),
      },
    });

    await archive.loadEntries();

    expect(archive.listState.value).toBe('empty');
    expect(archive.entries.value).toEqual([]);
  });

  it('loads entry detail and exposes an error when detail fetch fails', async () => {
    const getEntry = vi
      .fn()
      .mockResolvedValueOnce(createEntryFixture({ id: 'entry-7', title: '상세 기록' }))
      .mockRejectedValueOnce(new Error('boom'));
    const archive = useEntriesArchive({
      api: {
        listEntries: vi.fn().mockResolvedValue([]),
        getEntry,
      },
    });

    const loadedEntry = await archive.loadEntryDetail('entry-7');

    expect(loadedEntry?.id).toBe('entry-7');
    expect(archive.detailState.value).toBe('loaded');

    await archive.loadEntryDetail('missing-entry');

    expect(archive.detailState.value).toBe('error');
    expect(archive.detailError.value).toContain('불러오지 못했습니다');
  });

  it('normalizes the active query and requests filtered entries', async () => {
    const listEntries = vi
      .fn()
      .mockResolvedValue([createEntryFixture({ id: 'entry-9', title: '파도 냄새' })]);
    const archive = useEntriesArchive({
      api: {
        listEntries,
        getEntry: vi.fn(),
      },
    });

    await archive.loadEntries('  파도  ');

    expect(archive.activeQuery.value).toBe('파도');
    expect(listEntries).toHaveBeenCalledWith('파도');
    expect(archive.entries.value).toHaveLength(1);
  });
});
