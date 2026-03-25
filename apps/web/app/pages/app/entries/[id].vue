<script setup lang="ts">
import { computed, watch } from 'vue';

import { useAuthSession } from '../../../composables/useAuthSession';
import { useEntriesArchive } from '../../../composables/useEntriesArchive';
import { createEntriesApiClient } from '../../../utils/api';
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

const entriesApi = createEntriesApiClient(
  runtimeConfig.public.apiBase,
  () => accessToken.value,
);
const archive = useEntriesArchive({
  api: entriesApi,
});
const {
  detailError,
  detailState,
  loadEntryDetail,
} = archive;

const entryId = computed(() => String(route.params.id));
const currentEntry = computed(() => archive.currentEntry.value);
const preview = computed(() =>
  currentEntry.value ? buildEntryPreview(currentEntry.value.body) : '',
);

watch(
  [hydrated, isAuthenticated, entryId],
  async ([isHydrated, authenticated, nextEntryId]) => {
    if (!isHydrated || !authenticated || !nextEntryId) {
      return;
    }

    await loadEntryDetail(nextEntryId);
  },
  { immediate: true },
);

onMounted(() => {
  hydrateFromStorage();
});
</script>

<template>
  <main class="app-grid">
    <aside class="sidebar">
      <div>
        <div class="sidebar-badge">기록 상세</div>
        <div class="sidebar-current">
          <div class="sidebar-title">
            {{ currentEntry?.title ?? user?.displayName ?? '기록을 읽는 중' }}
          </div>
          <div class="sidebar-copy">
            {{
              currentEntry
                ? formatEntryDateTime(currentEntry.updatedAt)
                : '세부 내용을 불러오는 중'
            }}
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink class="active" to="/app/archive">아카이브</NuxtLink>
        <NuxtLink to="/app/drafts">초안</NuxtLink>
        <NuxtLink to="/app/write">기록하기</NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <NuxtLink class="button-primary" :to="`/app/write?entryId=${entryId}`">
          이 기록 이어쓰기
        </NuxtLink>
        <NuxtLink class="button-ghost" to="/app/archive">아카이브로</NuxtLink>
      </div>
    </aside>

    <section class="app-main">
      <div class="page-header">
        <div>
          <h1 class="page-title">기록 상세</h1>
          <p class="page-subtitle">기록을 다시 읽고, 필요하면 같은 글을 이어서 수정할 수 있습니다.</p>
        </div>
        <div class="page-tools">
          <NuxtLink class="button-ghost" to="/app/archive">목록으로</NuxtLink>
          <NuxtLink class="button-primary" :to="`/app/write?entryId=${entryId}`">
            이어쓰기
          </NuxtLink>
        </div>
      </div>

      <div v-if="!hydrated" class="archive-state-card">
        <p class="archive-state-copy">저장된 세션을 확인하고 있습니다.</p>
      </div>

      <div v-else-if="!isAuthenticated" class="archive-state-card">
        <p class="archive-state-copy">
          기록 상세를 보려면 먼저 로그인해야 합니다.
        </p>
        <NuxtLink class="button-primary" to="/app/write">기록하기로 이동</NuxtLink>
      </div>

      <div v-else-if="detailState === 'loading' || detailState === 'idle'" class="archive-state-card">
        <p class="archive-state-copy">기록의 세부 내용을 불러오는 중입니다.</p>
      </div>

      <div v-else-if="detailState === 'error'" class="archive-state-card">
        <p class="archive-state-copy">{{ detailError }}</p>
        <button class="button-ghost" type="button" @click="loadEntryDetail(entryId)">
          다시 불러오기
        </button>
      </div>

      <article v-else-if="currentEntry" class="entry-detail-card">
        <p class="entry-detail-meta">
          {{ formatEntryDate(currentEntry.createdAt) }}
        </p>
        <h2 class="entry-detail-title">
          {{ currentEntry.title ?? '제목 없는 기록' }}
        </h2>
        <p class="entry-detail-preview">{{ preview }}</p>

        <div class="entry-detail-body">
          {{ currentEntry.body || '아직 본문이 비어 있습니다.' }}
        </div>

        <div class="entry-detail-footer">
          <span class="entry-meta">
            마지막 저장 {{ formatEntryDateTime(currentEntry.lastSavedAt) }}
          </span>
          <NuxtLink class="button-ghost" :to="`/app/write?entryId=${entryId}`">
            수정 화면으로
          </NuxtLink>
        </div>
      </article>
    </section>
  </main>
</template>
