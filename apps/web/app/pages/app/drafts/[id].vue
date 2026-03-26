<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useAuthSession } from '../../../composables/useAuthSession';
import { useDrafts } from '../../../composables/useDrafts';
import type { PublicEntry } from '../../../types/entries';
import { createDraftsApiClient, createEntriesApiClient } from '../../../utils/api';
import {
  buildEntryPreview,
  formatEntryDate,
  formatEntryDateTime,
} from '../../../utils/entry-format';

definePageMeta({ layout: 'app' });

const runtimeConfig = useRuntimeConfig();
const route = useRoute();

const {
  hydrated,
  isAuthenticated,
  accessToken,
  user,
  hydrateFromStorage,
} = useAuthSession();

const draftsApi = createDraftsApiClient(
  runtimeConfig.public.apiBase,
  () => accessToken.value,
);
const entriesApi = createEntriesApiClient(
  runtimeConfig.public.apiBase,
  () => accessToken.value,
);
const draftsStore = useDrafts({
  api: draftsApi,
});
const {
  addEntriesToDraft,
  attachError,
  attachState,
  currentDraft,
  detailError,
  detailState,
  loadDraftDetail,
  reorderDraftEntries,
  reorderError,
  reorderState,
} = draftsStore;

const draftId = computed(() => String(route.params.id));
const entriesLoadState = ref<'idle' | 'loading' | 'loaded' | 'error'>('idle');
const entriesLoadError = ref('');
const allEntries = ref<PublicEntry[]>([]);
const selectedEntryIds = ref<string[]>([]);

const attachedEntryIds = computed(
  () => new Set(currentDraft.value?.entries.map((item) => item.entry.id) ?? []),
);
const availableEntries = computed(() =>
  allEntries.value.filter((entry) => !attachedEntryIds.value.has(entry.id)),
);
const currentDraftTitle = computed(
  () => currentDraft.value?.title ?? user.value?.displayName ?? '초안 불러오는 중',
);
const canSubmitEntryAttach = computed(
  () => selectedEntryIds.value.length > 0 && attachState.value !== 'submitting',
);

watch(
  [hydrated, isAuthenticated, draftId],
  async ([isHydrated, authenticated, nextDraftId]) => {
    if (!isHydrated || !authenticated || !nextDraftId) {
      return;
    }

    const { draft, entries } = await loadDraftResources(nextDraftId);

    if (draft) {
      selectedEntryIds.value = [];
    }

    if (!entries) {
      allEntries.value = [];
      entriesLoadState.value = 'error';
      entriesLoadError.value =
        '초안에 담을 기록 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
      return;
    }

    allEntries.value = entries;
    entriesLoadState.value = 'loaded';
  },
  { immediate: true },
);

onMounted(() => {
  hydrateFromStorage();
});

async function reloadDetail() {
  await loadDraftResources(draftId.value);
}

async function submitEntryAttach() {
  if (selectedEntryIds.value.length === 0) {
    return;
  }

  const draft = await addEntriesToDraft(draftId.value, selectedEntryIds.value);

  if (!draft) {
    return;
  }

  selectedEntryIds.value = [];
}

function toggleEntrySelection(entryId: string, selected: boolean) {
  if (selected) {
    selectedEntryIds.value = [...selectedEntryIds.value, entryId];
    return;
  }

  selectedEntryIds.value = selectedEntryIds.value.filter((item) => item !== entryId);
}

function buildOrderLabel(position: number) {
  return String(position).padStart(2, '0');
}

function canMoveEntry(index: number, direction: 'up' | 'down') {
  if (!currentDraft.value || reorderState.value === 'submitting') {
    return false;
  }

  return direction === 'up'
    ? index > 0
    : index < currentDraft.value.entries.length - 1;
}

async function moveDraftEntry(entryId: string, direction: 'up' | 'down') {
  if (!currentDraft.value) {
    return;
  }

  const currentEntryIds = currentDraft.value.entries.map((item) => item.entry.id);
  const currentIndex = currentEntryIds.indexOf(entryId);

  if (currentIndex === -1) {
    return;
  }

  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0 || nextIndex >= currentEntryIds.length) {
    return;
  }

  const nextEntryIds = [...currentEntryIds];
  const [movedEntryId] = nextEntryIds.splice(currentIndex, 1);

  if (!movedEntryId) {
    return;
  }

  nextEntryIds.splice(nextIndex, 0, movedEntryId);

  await reorderDraftEntries(draftId.value, nextEntryIds);
}

async function loadDraftResources(nextDraftId: string) {
  entriesLoadState.value = 'loading';
  entriesLoadError.value = '';

  const [draft, entries] = await Promise.all([
    loadDraftDetail(nextDraftId),
    entriesApi.listEntries().catch(() => null),
  ]);

  if (!entries) {
    allEntries.value = [];
    entriesLoadState.value = 'error';
    entriesLoadError.value =
      '초안에 담을 기록 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
  } else {
    allEntries.value = entries;
    entriesLoadState.value = 'loaded';
  }

  return {
    draft,
    entries,
  };
}

function handleEntrySelectionChange(entryId: string, event: Event) {
  toggleEntrySelection(entryId, (event.target as HTMLInputElement).checked);
}
</script>

<template>
  <main class="app-grid">
    <aside class="sidebar">
      <div>
        <div class="sidebar-badge">초안 상세</div>
        <div class="sidebar-current">
          <div class="sidebar-title">{{ currentDraftTitle }}</div>
          <div class="sidebar-copy">
            {{
              currentDraft
                ? `기록 ${currentDraft.entries.length}개`
                : '초안의 흐름을 불러오는 중'
            }}
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink to="/app/archive">아카이브</NuxtLink>
        <NuxtLink class="active" to="/app/drafts">초안</NuxtLink>
        <NuxtLink to="/app/write">기록하기</NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <NuxtLink class="button-primary" to="/app/drafts">목록으로</NuxtLink>
        <NuxtLink class="button-ghost" to="/app/archive">기록 고르기</NuxtLink>
      </div>
    </aside>

    <section class="app-main">
      <div class="page-header">
        <div>
          <h1 class="page-title">초안 상세</h1>
          <p class="page-subtitle">
            저장된 초안을 열고, 포함된 기록과 아직 담지 않은 기록을 함께 확인합니다.
          </p>
        </div>
        <div class="page-tools">
          <NuxtLink class="button-ghost" to="/app/drafts">목록으로</NuxtLink>
          <NuxtLink class="button-ghost" to="/app/archive">아카이브</NuxtLink>
        </div>
      </div>

      <div v-if="!hydrated" class="archive-state-card">
        <p class="archive-state-copy">저장된 세션을 확인하고 있습니다.</p>
      </div>

      <div v-else-if="!isAuthenticated" class="archive-state-card">
        <p class="archive-state-copy">
          초안 상세를 보려면 먼저 로그인해야 합니다.
        </p>
        <NuxtLink class="button-primary" to="/app/write">기록하기로 이동</NuxtLink>
      </div>

      <div
        v-else-if="
          detailState === 'loading' ||
          detailState === 'idle' ||
          entriesLoadState === 'loading' ||
          entriesLoadState === 'idle'
        "
        class="archive-state-card"
      >
        <p class="archive-state-copy">초안과 기록 목록을 함께 불러오는 중입니다.</p>
      </div>

      <div
        v-else-if="detailState === 'error' || entriesLoadState === 'error'"
        class="archive-state-card"
      >
        <p class="archive-state-copy">
          {{ detailState === 'error' ? detailError : entriesLoadError }}
        </p>
        <button class="button-ghost" type="button" @click="reloadDetail">
          다시 불러오기
        </button>
      </div>

      <template v-else-if="currentDraft">
        <div class="draft-hero">
          <div class="draft-title-display">{{ currentDraft.title }}</div>
          <p class="draft-description-display">
            {{
              currentDraft.description ??
              '아직 설명이 없는 초안입니다. 기록을 추가하며 흐름을 조금씩 구체화할 수 있습니다.'
            }}
          </p>

          <div class="draft-meta">
            <span>기록 {{ currentDraft.entries.length }}개</span>
            <span>{{ currentDraft.status === 'active' ? '활성' : '보관' }}</span>
            <span>{{ formatEntryDateTime(currentDraft.updatedAt) }}</span>
          </div>
        </div>

        <section class="draft-picker-card">
          <div class="draft-picker-header">
            <div>
              <p class="draft-create-eyebrow">기록 추가</p>
              <h2 class="draft-create-title">아직 초안에 담지 않은 기록을 고릅니다.</h2>
            </div>
            <span class="entry-meta">{{ availableEntries.length }}개 선택 가능</span>
          </div>

          <p v-if="attachState === 'error'" class="writer-alert writer-alert-error">
            {{ attachError }}
          </p>

          <div v-if="availableEntries.length === 0" class="archive-state-card">
            <p class="archive-state-copy">
              초안에 담을 수 있는 기록이 더 없습니다. 모든 기록이 이미 초안에 포함되었거나, 먼저 새 기록을 남겨야 합니다.
            </p>
            <NuxtLink class="button-primary" to="/app/write">새 기록 쓰기</NuxtLink>
          </div>

          <div v-else class="draft-picker-list">
            <label
              v-for="entry in availableEntries"
              :key="entry.id"
              class="draft-picker-item"
            >
              <input
                :checked="selectedEntryIds.includes(entry.id)"
                type="checkbox"
                @change="handleEntrySelectionChange(entry.id, $event)"
              />
              <div>
                <div class="draft-picker-title">
                  {{ entry.title ?? '제목 없는 기록' }}
                </div>
                <p class="draft-picker-copy">{{ buildEntryPreview(entry.body) }}</p>
                <div class="draft-picker-meta">
                  <span>{{ formatEntryDate(entry.updatedAt) }}</span>
                  <span>{{ entry.status === 'draft' ? '작성 중' : entry.status }}</span>
                </div>
              </div>
            </label>

            <div class="draft-create-actions">
              <button
                class="button-primary"
                type="button"
                :disabled="!canSubmitEntryAttach"
                @click="submitEntryAttach"
              >
                {{ attachState === 'submitting' ? '초안에 담는 중...' : '선택한 기록 담기' }}
              </button>
              <NuxtLink class="button-ghost" to="/app/archive">아카이브에서 보기</NuxtLink>
            </div>
          </div>
        </section>

        <section>
          <div class="sequence-header">초안에 담긴 기록</div>

          <p v-if="reorderState === 'error'" class="writer-alert writer-alert-error">
            {{ reorderError }}
          </p>

          <div v-if="currentDraft.entries.length === 0" class="archive-state-card">
            <p class="archive-state-copy">
              아직 이 초안에는 담긴 기록이 없습니다. 위에서 기록을 골라 첫 흐름을 만들어 보세요.
            </p>
          </div>

          <div v-else class="sequence-list">
            <article
              v-for="(draftEntry, index) in currentDraft.entries"
              :key="draftEntry.id"
              class="sequence-item"
            >
              <div class="sequence-order">{{ buildOrderLabel(draftEntry.position) }}</div>
              <div>
                <h2 class="sequence-title">
                  {{ draftEntry.entry.title ?? '제목 없는 기록' }}
                </h2>
                <p class="sequence-copy">{{ buildEntryPreview(draftEntry.entry.body) }}</p>
              </div>
              <div class="sequence-tools">
                <div class="sequence-tag">
                  {{ formatEntryDate(draftEntry.entry.updatedAt) }}
                </div>
                <div class="sequence-actions">
                  <button
                    class="button-ghost sequence-action"
                    type="button"
                    :disabled="!canMoveEntry(index, 'up')"
                    @click="moveDraftEntry(draftEntry.entry.id, 'up')"
                  >
                    위로
                  </button>
                  <button
                    class="button-ghost sequence-action"
                    type="button"
                    :disabled="!canMoveEntry(index, 'down')"
                    @click="moveDraftEntry(draftEntry.entry.id, 'down')"
                  >
                    아래로
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </template>
    </section>
  </main>
</template>
