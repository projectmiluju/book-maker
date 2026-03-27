import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  PublicDraft,
  PublicDraftDetail,
} from '../types/drafts';
import { useDrafts } from './useDrafts';

function createDraftFixture(overrides: Partial<PublicDraft> = {}): PublicDraft {
  return {
    id: 'draft-1',
    title: '고요가 머무는 자리',
    description: '흩어진 기록을 모으는 초안',
    status: 'active',
    entryCount: 1,
    createdAt: '2026-03-26T00:00:00.000Z',
    updatedAt: '2026-03-26T00:00:00.000Z',
    ...overrides,
  };
}

function createDraftDetailFixture(
  overrides: Partial<PublicDraftDetail> = {},
): PublicDraftDetail {
  return {
    ...createDraftFixture(),
    entries: [
      {
        id: 'draft-entry-1',
        position: 1,
        createdAt: '2026-03-26T00:00:00.000Z',
        entry: {
          id: 'entry-1',
          title: '창가에 남은 빛',
          body: '저녁빛이 식탁 위를 천천히 지나가던 순간.',
          status: 'draft',
          createdAt: '2026-03-25T00:00:00.000Z',
          updatedAt: '2026-03-25T00:00:00.000Z',
          lastSavedAt: '2026-03-25T00:00:00.000Z',
        },
      },
    ],
    ...overrides,
  };
}

describe('useDrafts', () => {
  it('loads drafts and marks the list as loaded', async () => {
    const drafts = useDrafts({
      api: {
        listDrafts: vi.fn().mockResolvedValue([
          createDraftFixture(),
          createDraftFixture({ id: 'draft-2', title: '두 번째 초안', entryCount: 0 }),
        ]),
        getDraft: vi.fn(),
        createDraft: vi.fn(),
        addEntriesToDraft: vi.fn(),
        removeDraftEntry: vi.fn(),
        reorderDraftEntries: vi.fn(),
      },
    });

    await drafts.loadDrafts();

    expect(drafts.listState.value).toBe('loaded');
    expect(drafts.drafts.value).toHaveLength(2);
  });

  it('marks the draft list as empty when there are no drafts', async () => {
    const drafts = useDrafts({
      api: {
        listDrafts: vi.fn().mockResolvedValue([]),
        getDraft: vi.fn(),
        createDraft: vi.fn(),
        addEntriesToDraft: vi.fn(),
        removeDraftEntry: vi.fn(),
        reorderDraftEntries: vi.fn(),
      },
    });

    await drafts.loadDrafts();

    expect(drafts.listState.value).toBe('empty');
    expect(drafts.drafts.value).toEqual([]);
  });

  it('creates a draft and prepends it to the list', async () => {
    const createDraft = vi.fn().mockResolvedValue(
      createDraftFixture({ id: 'draft-9', title: '새 초안', entryCount: 0 }),
    );
    const drafts = useDrafts({
      api: {
        listDrafts: vi.fn().mockResolvedValue([]),
        getDraft: vi.fn(),
        createDraft,
        addEntriesToDraft: vi.fn(),
        removeDraftEntry: vi.fn(),
        reorderDraftEntries: vi.fn(),
      },
    });

    const createdDraft = await drafts.createDraft({
      title: '새 초안',
    });

    expect(createdDraft?.id).toBe('draft-9');
    expect(drafts.drafts.value[0]?.title).toBe('새 초안');
    expect(drafts.createState.value).toBe('idle');
  });

  it('loads draft detail and syncs the current draft', async () => {
    const drafts = useDrafts({
      api: {
        listDrafts: vi.fn().mockResolvedValue([]),
        getDraft: vi.fn().mockResolvedValue(createDraftDetailFixture()),
        createDraft: vi.fn(),
        addEntriesToDraft: vi.fn(),
        removeDraftEntry: vi.fn(),
        reorderDraftEntries: vi.fn(),
      },
    });

    const draft = await drafts.loadDraftDetail('draft-1');

    expect(draft?.id).toBe('draft-1');
    expect(drafts.detailState.value).toBe('loaded');
    expect(drafts.currentDraft.value?.entries).toHaveLength(1);
  });

  it('exposes an error when entry attach fails', async () => {
    const drafts = useDrafts({
      api: {
        listDrafts: vi.fn().mockResolvedValue([]),
        getDraft: vi.fn().mockResolvedValue(createDraftDetailFixture()),
        createDraft: vi.fn(),
        addEntriesToDraft: vi.fn().mockRejectedValue(new Error('boom')),
        removeDraftEntry: vi.fn(),
        reorderDraftEntries: vi.fn(),
      },
    });

    await drafts.addEntriesToDraft('draft-1', ['entry-1']);

    expect(drafts.attachState.value).toBe('error');
    expect(drafts.attachError.value).toContain('초안에 담지 못했습니다');
  });

  it('removes a draft entry and syncs the current draft detail', async () => {
    const drafts = useDrafts({
      api: {
        listDrafts: vi.fn().mockResolvedValue([]),
        getDraft: vi.fn().mockResolvedValue(
          createDraftDetailFixture({
            entryCount: 2,
            entries: [
              {
                id: 'draft-entry-1',
                position: 1,
                createdAt: '2026-03-26T00:00:00.000Z',
                entry: {
                  id: 'entry-1',
                  title: '창가에 남은 빛',
                  body: '저녁빛이 식탁 위를 천천히 지나가던 순간.',
                  status: 'draft',
                  createdAt: '2026-03-25T00:00:00.000Z',
                  updatedAt: '2026-03-25T00:00:00.000Z',
                  lastSavedAt: '2026-03-25T00:00:00.000Z',
                },
              },
              {
                id: 'draft-entry-2',
                position: 2,
                createdAt: '2026-03-26T00:00:00.000Z',
                entry: {
                  id: 'entry-2',
                  title: '둘째 기록',
                  body: '둘째 문장',
                  status: 'draft',
                  createdAt: '2026-03-25T00:00:00.000Z',
                  updatedAt: '2026-03-25T00:00:00.000Z',
                  lastSavedAt: '2026-03-25T00:00:00.000Z',
                },
              },
            ],
          }),
        ),
        createDraft: vi.fn(),
        addEntriesToDraft: vi.fn(),
        removeDraftEntry: vi.fn().mockResolvedValue(
          createDraftDetailFixture({
            entryCount: 1,
            entries: [
              {
                id: 'draft-entry-2',
                position: 1,
                createdAt: '2026-03-26T00:00:00.000Z',
                entry: {
                  id: 'entry-2',
                  title: '둘째 기록',
                  body: '둘째 문장',
                  status: 'draft',
                  createdAt: '2026-03-25T00:00:00.000Z',
                  updatedAt: '2026-03-25T00:00:00.000Z',
                  lastSavedAt: '2026-03-25T00:00:00.000Z',
                },
              },
            ],
          }),
        ),
        reorderDraftEntries: vi.fn(),
      },
    });

    await drafts.loadDraftDetail('draft-1');
    await drafts.removeDraftEntry('draft-1', 'entry-1');

    expect(drafts.removeState.value).toBe('idle');
    expect(drafts.currentDraft.value?.entries.map((item) => item.entry.id)).toEqual([
      'entry-2',
    ]);
    expect(drafts.currentDraft.value?.entries[0]?.position).toBe(1);
  });

  it('reorders draft entries and syncs the current draft detail', async () => {
    const drafts = useDrafts({
      api: {
        listDrafts: vi.fn().mockResolvedValue([]),
        getDraft: vi.fn().mockResolvedValue(createDraftDetailFixture()),
        createDraft: vi.fn(),
        addEntriesToDraft: vi.fn(),
        removeDraftEntry: vi.fn(),
        reorderDraftEntries: vi.fn().mockResolvedValue(
          createDraftDetailFixture({
            entries: [
              {
                id: 'draft-entry-2',
                position: 1,
                createdAt: '2026-03-26T00:00:00.000Z',
                entry: {
                  id: 'entry-2',
                  title: '둘째 기록',
                  body: '둘째 문장',
                  status: 'draft',
                  createdAt: '2026-03-25T00:00:00.000Z',
                  updatedAt: '2026-03-25T00:00:00.000Z',
                  lastSavedAt: '2026-03-25T00:00:00.000Z',
                },
              },
              {
                id: 'draft-entry-1',
                position: 2,
                createdAt: '2026-03-26T00:00:00.000Z',
                entry: {
                  id: 'entry-1',
                  title: '창가에 남은 빛',
                  body: '저녁빛이 식탁 위를 천천히 지나가던 순간.',
                  status: 'draft',
                  createdAt: '2026-03-25T00:00:00.000Z',
                  updatedAt: '2026-03-25T00:00:00.000Z',
                  lastSavedAt: '2026-03-25T00:00:00.000Z',
                },
              },
            ],
          }),
        ),
      },
    });

    await drafts.loadDraftDetail('draft-1');
    await drafts.reorderDraftEntries('draft-1', ['entry-2', 'entry-1']);

    expect(drafts.reorderState.value).toBe('idle');
    expect(drafts.currentDraft.value?.entries.map((item) => item.entry.id)).toEqual([
      'entry-2',
      'entry-1',
    ]);
  });
});
