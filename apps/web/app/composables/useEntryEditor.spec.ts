import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { nextTick } from 'vue';

import type { PublicEntry } from '../types/entries';
import { ApiError } from '../utils/api';
import { useEntryEditor } from './useEntryEditor';

function createEntryFixture(overrides: Partial<PublicEntry> = {}): PublicEntry {
  return {
    id: 'entry-1',
    title: null,
    body: '첫 문장',
    status: 'draft',
    createdAt: '2026-03-25T00:00:00.000Z',
    updatedAt: '2026-03-25T00:00:00.000Z',
    lastSavedAt: '2026-03-25T00:00:00.000Z',
    ...overrides,
  };
}

async function flushReactivity() {
  await Promise.resolve();
  await nextTick();
}

describe('useEntryEditor', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates an entry and autosaves later edits', async () => {
    vi.useFakeTimers();

    let resolveCreate: (entry: PublicEntry) => void = () => undefined;
    const createEntry = vi.fn().mockImplementation(
      () =>
        new Promise<PublicEntry>((resolve) => {
          resolveCreate = resolve;
        }),
    );
    const updateEntry = vi
      .fn()
      .mockResolvedValue(
        createEntryFixture({
          body: '첫 문장을 조금 더 붙였습니다.',
          updatedAt: '2026-03-25T00:01:00.000Z',
          lastSavedAt: '2026-03-25T00:01:00.000Z',
        }),
      );

    const editor = useEntryEditor({
      api: {
        createEntry,
        updateEntry,
      },
      debounceMs: 300,
    });

    editor.body.value = '첫 문장';
    await nextTick();

    expect(editor.saveState.value).toBe('pending');

    await vi.advanceTimersByTimeAsync(300);

    expect(createEntry).toHaveBeenCalledWith({
      title: '',
      body: '첫 문장',
      status: 'draft',
    });
    expect(editor.saveState.value).toBe('saving');

    resolveCreate(createEntryFixture());
    await flushReactivity();

    expect(editor.saveState.value).toBe('saved');
    expect(editor.entryId.value).toBe('entry-1');

    editor.body.value = '첫 문장을 조금 더 붙였습니다.';
    await nextTick();
    await vi.advanceTimersByTimeAsync(300);
    await flushReactivity();

    expect(updateEntry).toHaveBeenCalledWith('entry-1', {
      title: '',
      body: '첫 문장을 조금 더 붙였습니다.',
      status: 'draft',
    });
    expect(editor.saveState.value).toBe('saved');
    expect(editor.lastSavedAt.value).toBe('2026-03-25T00:01:00.000Z');
  });

  it('marks autosave as auth-required when the access token expires', async () => {
    vi.useFakeTimers();

    const onAuthExpired = vi.fn();
    const editor = useEntryEditor({
      api: {
        createEntry: vi
          .fn()
          .mockRejectedValue(
            new ApiError('세션이 만료되었습니다.', 401, {
              message: '세션이 만료되었습니다.',
            }),
          ),
        updateEntry: vi.fn(),
      },
      debounceMs: 200,
      onAuthExpired,
    });

    editor.body.value = '세션 만료 테스트';
    await nextTick();
    await vi.advanceTimersByTimeAsync(200);
    await flushReactivity();

    expect(editor.saveState.value).toBe('auth-required');
    expect(editor.errorMessage.value).toContain('다시 로그인');
    expect(onAuthExpired).toHaveBeenCalledTimes(1);
  });
});
