import { ref } from 'vue';

import type { PublicEntry } from '../types/entries';

export type ArchiveListState = 'idle' | 'loading' | 'loaded' | 'empty' | 'error';
export type EntryDetailState = 'idle' | 'loading' | 'loaded' | 'error';

type EntriesReaderApi = {
  listEntries(searchQuery?: string): Promise<PublicEntry[]>;
  getEntry(entryId: string): Promise<PublicEntry>;
};

type UseEntriesArchiveOptions = {
  api: EntriesReaderApi;
};

export function useEntriesArchive(options: UseEntriesArchiveOptions) {
  const entries = ref<PublicEntry[]>([]);
  const listState = ref<ArchiveListState>('idle');
  const listError = ref('');
  const activeQuery = ref('');
  const currentEntry = ref<PublicEntry | null>(null);
  const detailState = ref<EntryDetailState>('idle');
  const detailError = ref('');

  async function loadEntries(searchQuery = '') {
    const normalizedQuery = searchQuery.trim();

    listState.value = 'loading';
    listError.value = '';
    activeQuery.value = normalizedQuery;

    try {
      const nextEntries = await options.api.listEntries(normalizedQuery || undefined);
      entries.value = nextEntries;
      listState.value = nextEntries.length > 0 ? 'loaded' : 'empty';
    } catch {
      entries.value = [];
      listState.value = 'error';
      listError.value = '아카이브를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
    }
  }

  async function loadEntryDetail(entryId: string) {
    detailState.value = 'loading';
    detailError.value = '';

    try {
      const entry = await options.api.getEntry(entryId);
      currentEntry.value = entry;
      detailState.value = 'loaded';
      syncEntry(entry);

      return entry;
    } catch {
      currentEntry.value = null;
      detailState.value = 'error';
      detailError.value = '기록을 불러오지 못했습니다. 아카이브에서 다시 선택해 주세요.';

      return null;
    }
  }

  function syncEntry(entry: PublicEntry) {
    const index = entries.value.findIndex((item) => item.id === entry.id);

    if (index === -1) {
      return;
    }

    entries.value = [...entries.value.slice(0, index), entry, ...entries.value.slice(index + 1)];
  }

  return {
    entries,
    listState,
    listError,
    activeQuery,
    currentEntry,
    detailState,
    detailError,
    loadEntries,
    loadEntryDetail,
  };
}
