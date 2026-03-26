<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { useAuthSession } from '../../composables/useAuthSession';
import { useDrafts } from '../../composables/useDrafts';
import { createDraftsApiClient } from '../../utils/api';
import { formatEntryDateTime } from '../../utils/entry-format';

definePageMeta({ layout: 'app' });

const runtimeConfig = useRuntimeConfig();

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
const draftsStore = useDrafts({
  api: draftsApi,
});
const {
  createDraft,
  createError,
  createState,
  drafts,
  listError,
  listState,
  loadDrafts,
} = draftsStore;

const createForm = reactive({
  title: '',
  description: '',
});
const draftCountLabel = computed(() =>
  listState.value === 'loaded' ? `초안 ${drafts.value.length}개` : '초안 흐름을 준비하는 중',
);

watch(
  [hydrated, isAuthenticated],
  async ([isHydrated, authenticated]) => {
    if (!isHydrated || !authenticated) {
      return;
    }

    if (listState.value !== 'idle') {
      return;
    }

    await loadDrafts();
  },
  { immediate: true },
);

onMounted(() => {
  hydrateFromStorage();
});

async function submitDraftCreate() {
  const title = createForm.title.trim();

  if (title.length === 0) {
    return;
  }

  const createdDraft = await createDraft({
    title,
    description: createForm.description.trim(),
  });

  if (!createdDraft) {
    return;
  }

  createForm.title = '';
  createForm.description = '';
  await navigateTo(`/app/drafts/${createdDraft.id}`);
}

function formatStatus(status: 'active' | 'archived') {
  return status === 'active' ? '활성' : '보관';
}
</script>

<template>
  <main class="app-grid">
    <aside class="sidebar">
      <div>
        <div class="sidebar-badge">초안</div>
        <div class="sidebar-current">
          <div class="sidebar-title">
            {{ user?.displayName ?? '흩어진 기록을 묶는 자리' }}
          </div>
          <div class="sidebar-copy">
            {{ isAuthenticated ? draftCountLabel : '세션이 필요합니다' }}
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink to="/app/archive">아카이브</NuxtLink>
        <NuxtLink class="active" to="/app/drafts">초안</NuxtLink>
        <NuxtLink to="/app/write">기록하기</NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <NuxtLink class="button-primary" to="/app/archive">기록 고르기</NuxtLink>
        <NuxtLink class="button-ghost" to="/app/write">새 기록</NuxtLink>
      </div>
    </aside>

    <section class="app-main">
      <div class="page-header">
        <div>
          <h1 class="page-title">초안</h1>
          <p class="page-subtitle">
            저장된 초안을 다시 열고, 기록을 한 흐름으로 묶기 시작합니다.
          </p>
        </div>
        <div class="page-tools">
          <span class="entry-meta">
            {{ listState === 'loaded' ? `${drafts.length}개` : 'draft flow' }}
          </span>
          <NuxtLink class="button-ghost" to="/app/archive">아카이브</NuxtLink>
        </div>
      </div>

      <div v-if="!hydrated" class="archive-state-card">
        <p class="archive-state-copy">저장된 세션을 확인하고 있습니다.</p>
      </div>

      <div v-else-if="!isAuthenticated" class="archive-state-card">
        <p class="archive-state-copy">
          초안 목록을 보려면 먼저 로그인해야 합니다. 현재 단계에서는 기록하기 화면에서 바로 세션을 만들 수 있습니다.
        </p>
        <NuxtLink class="button-primary" to="/app/write">기록하기로 이동</NuxtLink>
      </div>

      <div v-else class="drafts-shell">
        <section class="draft-create-card">
          <div>
            <p class="draft-create-eyebrow">새 초안</p>
            <h2 class="draft-create-title">기록을 묶을 빈 초안을 먼저 만들어 둡니다.</h2>
            <p class="draft-create-copy">
              제목과 짧은 설명을 적어 두면, 다음 화면에서 기록을 골라 초안에 담을 수 있습니다.
            </p>
          </div>

          <form class="draft-create-form" @submit.prevent="submitDraftCreate">
            <label class="draft-create-field">
              <span>초안 제목</span>
              <input v-model="createForm.title" maxlength="255" placeholder="예: 고요가 머무는 자리" />
            </label>

            <label class="draft-create-field">
              <span>설명</span>
              <textarea
                v-model="createForm.description"
                rows="3"
                maxlength="2000"
                placeholder="이 초안이 어떤 흐름을 담는지 짧게 적어 둡니다."
              />
            </label>

            <p v-if="createState === 'error'" class="writer-alert writer-alert-error">
              {{ createError }}
            </p>

            <div class="draft-create-actions">
              <button
                class="button-primary"
                type="submit"
                :disabled="createState === 'submitting' || createForm.title.trim().length === 0"
              >
                {{ createState === 'submitting' ? '초안 만드는 중...' : '빈 초안 만들기' }}
              </button>
              <NuxtLink class="button-ghost" to="/app/archive">먼저 기록 보기</NuxtLink>
            </div>
          </form>
        </section>

        <div v-if="listState === 'loading'" class="archive-state-card">
          <p class="archive-state-copy">초안 목록을 불러오는 중입니다.</p>
        </div>

        <div v-else-if="listState === 'error'" class="archive-state-card">
          <p class="archive-state-copy">{{ listError }}</p>
          <button class="button-ghost" type="button" @click="loadDrafts">
            다시 불러오기
          </button>
        </div>

        <div v-else-if="listState === 'empty'" class="archive-state-card">
          <p class="archive-state-copy">
            아직 저장된 초안이 없습니다. 위에서 첫 초안을 만든 뒤, 기록을 골라 흐름을 시작해 보세요.
          </p>
        </div>

        <section v-else class="draft-list-section">
          <div class="sequence-header">저장된 초안</div>

          <div class="draft-list-grid">
            <NuxtLink
              v-for="draft in drafts"
              :key="draft.id"
              class="draft-list-card"
              :to="`/app/drafts/${draft.id}`"
            >
              <div class="draft-list-meta">
                <span>{{ formatStatus(draft.status) }}</span>
                <span>{{ formatEntryDateTime(draft.updatedAt) }}</span>
              </div>
              <h2 class="draft-list-title">{{ draft.title }}</h2>
              <p class="draft-list-copy">
                {{
                  draft.description ??
                  '아직 설명이 없는 초안입니다. 다음 화면에서 기록을 고르며 흐름을 구체화할 수 있습니다.'
                }}
              </p>
              <div class="draft-list-footer">
                <span>{{ draft.entryCount }}개의 기록</span>
                <span>열기</span>
              </div>
            </NuxtLink>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>
