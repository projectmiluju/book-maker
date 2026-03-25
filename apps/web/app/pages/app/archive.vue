<script setup lang="ts">
import { computed, watch } from 'vue';

import { useAuthSession } from '../../composables/useAuthSession';
import { useEntriesArchive } from '../../composables/useEntriesArchive';
import { createEntriesApiClient } from '../../utils/api';
import { groupEntriesByMonth } from '../../utils/entry-format';

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
  entries,
  listError,
  listState,
  loadEntries,
} = archive;

const groupedEntries = computed(() => groupEntriesByMonth(entries.value));
const highlightedEntryId = computed(() =>
  typeof route.query.entryId === 'string' ? route.query.entryId : null,
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

    await loadEntries();
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
        <div class="sidebar-badge">아카이브</div>
        <div class="sidebar-current">
          <div class="sidebar-title">
            {{ user?.displayName ?? '기록을 다시 펼쳐보는 곳' }}
          </div>
          <div class="sidebar-copy">
            {{
              isAuthenticated
                ? listState === 'loaded'
                  ? `기록 ${entries.length}개`
                  : '기록을 불러오는 중'
                : '세션이 필요합니다'
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
        <NuxtLink class="button-primary" to="/app/write">새 기록</NuxtLink>
        <NuxtLink class="button-ghost" to="/app/drafts">초안 보기</NuxtLink>
      </div>
    </aside>

    <section class="app-main">
      <div class="page-header">
        <div>
          <h1 class="page-title">아카이브</h1>
          <p class="page-subtitle">지금까지 쓴 기록을 날짜순으로 다시 펼쳐봅니다.</p>
        </div>
        <div class="page-tools">
          <span class="entry-meta">
            {{ listState === 'loaded' ? `${entries.length}개` : '개인 기록' }}
          </span>
          <NuxtLink class="button-primary" to="/app/write">새 기록</NuxtLink>
        </div>
      </div>

      <div v-if="!hydrated" class="archive-state-card">
        <p class="archive-state-copy">저장된 세션을 확인하고 있습니다.</p>
      </div>

      <div v-else-if="!isAuthenticated" class="archive-state-card">
        <p class="archive-state-copy">
          아카이브를 보려면 먼저 로그인해야 합니다. 현재 단계에서는 기록하기 화면에서 바로 세션을 만들 수 있습니다.
        </p>
        <NuxtLink class="button-primary" to="/app/write">기록하기로 이동</NuxtLink>
      </div>

      <div v-else-if="listState === 'loading'" class="archive-state-card">
        <p class="archive-state-copy">기록을 불러오는 중입니다.</p>
      </div>

      <div v-else-if="listState === 'error'" class="archive-state-card">
        <p class="archive-state-copy">{{ listError }}</p>
        <button class="button-ghost" type="button" @click="loadEntries">
          다시 불러오기
        </button>
      </div>

      <div v-else-if="listState === 'empty'" class="archive-state-card">
        <p class="archive-state-copy">
          아직 쌓인 기록이 없습니다. 첫 기록을 남기면 이곳에서 다시 찾아볼 수 있습니다.
        </p>
        <NuxtLink class="button-primary" to="/app/write">첫 기록 남기기</NuxtLink>
      </div>

      <div v-else class="archive-list">
        <p v-if="highlightedEntryId" class="archive-banner">
          방금 저장한 기록이 아카이브에 반영되었습니다.
        </p>

        <div v-for="group in groupedEntries" :key="group.key">
          <div class="archive-month">
            <span class="archive-month-label">{{ group.label }}</span>
          </div>

          <NuxtLink
            v-for="item in group.entries"
            :key="item.entry.id"
            class="archive-item"
            :class="{ 'archive-item-active': highlightedEntryId === item.entry.id }"
            :to="`/app/entries/${item.entry.id}`"
          >
            <time class="archive-item-date">{{ item.dayLabel }}</time>
            <div class="archive-item-body">
              <h2 class="archive-item-title">
                {{ item.entry.title ?? '제목 없는 기록' }}
              </h2>
              <p class="archive-item-preview">{{ item.preview }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <div v-if="listState === 'loaded'" class="archive-folio">
        <span>{{ entries.length }}개의 기록</span>
      </div>
    </section>
  </main>
</template>
