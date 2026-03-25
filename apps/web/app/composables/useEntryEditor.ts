import { computed, ref, watch } from 'vue';

import type { EntryInput, PublicEntry } from '../types/entries';
import { ApiError } from '../utils/api';

export type EntrySaveState =
  | 'idle'
  | 'pending'
  | 'saving'
  | 'saved'
  | 'error'
  | 'auth-required';

type EntryWriterApi = {
  createEntry(input: EntryInput): Promise<PublicEntry>;
  updateEntry(entryId: string, input: EntryInput): Promise<PublicEntry>;
};

type EntryEditorOptions = {
  api: EntryWriterApi;
  debounceMs?: number;
  initialEntry?: PublicEntry | null;
  onAuthExpired?: () => void;
  setTimeoutFn?: typeof globalThis.setTimeout;
  clearTimeoutFn?: typeof globalThis.clearTimeout;
};

export function useEntryEditor(options: EntryEditorOptions) {
  const title = ref('');
  const body = ref('');
  const entryId = ref<string | null>(null);
  const createdAt = ref<string | null>(null);
  const updatedAt = ref<string | null>(null);
  const lastSavedAt = ref<string | null>(null);
  const saveState = ref<EntrySaveState>('idle');
  const errorMessage = ref('');

  const debounceMs = options.debounceMs ?? 800;
  const setTimeoutFn = options.setTimeoutFn ?? globalThis.setTimeout;
  const clearTimeoutFn = options.clearTimeoutFn ?? globalThis.clearTimeout;

  let timerId: ReturnType<typeof globalThis.setTimeout> | null = null;
  let isApplyingRemoteEntry = false;
  let isSaving = false;
  let queuedSave = false;

  const characterCount = computed(() => body.value.length);

  if (options.initialEntry) {
    hydrateEntry(options.initialEntry);
    saveState.value = 'saved';
  }

  watch([title, body], () => {
    if (isApplyingRemoteEntry) {
      return;
    }

    scheduleSave();
  });

  function hydrateEntry(entry: PublicEntry) {
    isApplyingRemoteEntry = true;
    entryId.value = entry.id;
    title.value = entry.title ?? '';
    body.value = entry.body;
    createdAt.value = entry.createdAt;
    updatedAt.value = entry.updatedAt;
    lastSavedAt.value = entry.lastSavedAt;
    errorMessage.value = '';
    isApplyingRemoteEntry = false;
  }

  function scheduleSave() {
    if (!hasContent() && entryId.value === null) {
      saveState.value = 'idle';
      errorMessage.value = '';
      clearScheduledSave();
      return;
    }

    clearScheduledSave();
    saveState.value = 'pending';
    errorMessage.value = '';
    timerId = setTimeoutFn(() => {
      void persistEntry();
    }, debounceMs);
  }

  async function persistEntry() {
    clearScheduledSave();

    if (!hasContent() && entryId.value === null) {
      saveState.value = 'idle';
      return;
    }

    if (isSaving) {
      queuedSave = true;
      return;
    }

    isSaving = true;
    saveState.value = 'saving';
    errorMessage.value = '';

    try {
      const payload = createPayload();
      const savedEntry = entryId.value
        ? await options.api.updateEntry(entryId.value, payload)
        : await options.api.createEntry(payload);

      hydrateEntry(savedEntry);
      saveState.value = 'saved';
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        saveState.value = 'auth-required';
        errorMessage.value = '세션이 만료되어 저장할 수 없습니다. 다시 로그인해 주세요.';
        options.onAuthExpired?.();
      } else {
        saveState.value = 'error';
        errorMessage.value = '자동 저장에 실패했습니다. 다시 시도해 주세요.';
      }
    } finally {
      isSaving = false;

      if (queuedSave) {
        queuedSave = false;
        scheduleSave();
      }
    }
  }

  function retrySave() {
    void persistEntry();
  }

  function clearScheduledSave() {
    if (timerId !== null) {
      clearTimeoutFn(timerId);
      timerId = null;
    }
  }

  function hasContent() {
    return title.value.trim().length > 0 || body.value.trim().length > 0;
  }

  function createPayload(): EntryInput {
    return {
      title: title.value,
      body: body.value,
      status: 'draft',
    };
  }

  return {
    title,
    body,
    entryId,
    createdAt,
    updatedAt,
    lastSavedAt,
    characterCount,
    saveState,
    errorMessage,
    hydrateEntry,
    retrySave,
  };
}
