import { ref } from 'vue';

import type {
  CreateDraftInput,
  PublicDraft,
  PublicDraftDetail,
} from '../types/drafts';

export type DraftListState = 'idle' | 'loading' | 'loaded' | 'empty' | 'error';
export type DraftDetailState = 'idle' | 'loading' | 'loaded' | 'error';
export type DraftMutationState = 'idle' | 'submitting' | 'error';

type DraftsApi = {
  listDrafts(): Promise<PublicDraft[]>;
  getDraft(draftId: string): Promise<PublicDraftDetail>;
  createDraft(input: CreateDraftInput): Promise<PublicDraft>;
  addEntriesToDraft(draftId: string, entryIds: string[]): Promise<PublicDraftDetail>;
  reorderDraftEntries(draftId: string, entryIds: string[]): Promise<PublicDraftDetail>;
};

type UseDraftsOptions = {
  api: DraftsApi;
};

export function useDrafts(options: UseDraftsOptions) {
  const drafts = ref<PublicDraft[]>([]);
  const listState = ref<DraftListState>('idle');
  const listError = ref('');
  const currentDraft = ref<PublicDraftDetail | null>(null);
  const detailState = ref<DraftDetailState>('idle');
  const detailError = ref('');
  const createState = ref<DraftMutationState>('idle');
  const createError = ref('');
  const attachState = ref<DraftMutationState>('idle');
  const attachError = ref('');
  const reorderState = ref<DraftMutationState>('idle');
  const reorderError = ref('');

  async function loadDrafts() {
    listState.value = 'loading';
    listError.value = '';

    try {
      const nextDrafts = await options.api.listDrafts();
      drafts.value = nextDrafts;
      listState.value = nextDrafts.length > 0 ? 'loaded' : 'empty';
    } catch {
      drafts.value = [];
      listState.value = 'error';
      listError.value = '초안 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
    }
  }

  async function loadDraftDetail(draftId: string) {
    detailState.value = 'loading';
    detailError.value = '';

    try {
      const draft = await options.api.getDraft(draftId);
      currentDraft.value = draft;
      detailState.value = 'loaded';
      syncDraft(draft);

      return draft;
    } catch {
      currentDraft.value = null;
      detailState.value = 'error';
      detailError.value = '초안 상세를 불러오지 못했습니다. 목록에서 다시 선택해 주세요.';

      return null;
    }
  }

  async function createDraft(input: CreateDraftInput) {
    createState.value = 'submitting';
    createError.value = '';

    try {
      const draft = await options.api.createDraft(input);
      drafts.value = [draft, ...drafts.value];
      listState.value = 'loaded';
      createState.value = 'idle';

      return draft;
    } catch {
      createState.value = 'error';
      createError.value = '초안을 만들지 못했습니다. 제목을 확인하고 다시 시도해 주세요.';

      return null;
    }
  }

  async function addEntriesToDraft(draftId: string, entryIds: string[]) {
    attachState.value = 'submitting';
    attachError.value = '';

    try {
      const draft = await options.api.addEntriesToDraft(draftId, entryIds);
      currentDraft.value = draft;
      syncDraft(draft);
      attachState.value = 'idle';

      return draft;
    } catch {
      attachState.value = 'error';
      attachError.value =
        '기록을 초안에 담지 못했습니다. 이미 담긴 기록이 있는지 확인해 주세요.';

      return null;
    }
  }

  async function reorderDraftEntries(draftId: string, entryIds: string[]) {
    reorderState.value = 'submitting';
    reorderError.value = '';

    try {
      const draft = await options.api.reorderDraftEntries(draftId, entryIds);
      currentDraft.value = draft;
      syncDraft(draft);
      reorderState.value = 'idle';

      return draft;
    } catch {
      reorderState.value = 'error';
      reorderError.value =
        '초안 순서를 바꾸지 못했습니다. 잠시 후 다시 시도해 주세요.';

      return null;
    }
  }

  function syncDraft(draft: PublicDraft) {
    const index = drafts.value.findIndex((item) => item.id === draft.id);

    if (index === -1) {
      drafts.value = [draft, ...drafts.value];
      return;
    }

    drafts.value = [
      ...drafts.value.slice(0, index),
      draft,
      ...drafts.value.slice(index + 1),
    ];
  }

  return {
    drafts,
    listState,
    listError,
    currentDraft,
    detailState,
    detailError,
    createState,
    createError,
    attachState,
    attachError,
    reorderState,
    reorderError,
    loadDrafts,
    loadDraftDetail,
    createDraft,
    addEntriesToDraft,
    reorderDraftEntries,
  };
}
