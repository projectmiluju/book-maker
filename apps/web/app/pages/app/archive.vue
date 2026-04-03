<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useAuthSession } from '../../composables/useAuthSession';
import { useEntriesArchive } from '../../composables/useEntriesArchive';
import { createEntriesApiClient } from '../../utils/api';
import { groupEntriesByMonth } from '../../utils/entry-format';

definePageMeta({ layout: 'app' });

const runtimeConfig = useRuntimeConfig();
const route = useRoute();

const { hydrated, isAuthenticated, accessToken, user, hydrateFromStorage } = useAuthSession();

const entriesApi = createEntriesApiClient(runtimeConfig.public.apiBase, () => accessToken.value);
const archive = useEntriesArchive({
  api: entriesApi,
});
const { entries, listError, listState, activeQuery, loadEntries } = archive;
const searchInput = ref('');

const groupedEntries = computed(() => groupEntriesByMonth(entries.value));
const highlightedEntryId = computed(() =>
  typeof route.query.entryId === 'string' ? route.query.entryId : null,
);
const isSearching = computed(() => activeQuery.value.length > 0);
const archiveSummary = computed(() => {
  if (listState.value !== 'loaded' && listState.value !== 'empty') {
    return '개인 기록';
  }

  return isSearching.value ? `검색 결과 ${entries.value.length}개` : `${entries.value.length}개`;
});

async function submitSearch() {
  await loadEntries(searchInput.value);
}

async function resetSearch() {
  searchInput.value = '';
  await loadEntries();
}

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
          <p class="page-subtitle">
            지금까지 쓴 기록을 날짜순으로 다시 펼치고, 필요한 문장을 다시 찾아봅니다.
          </p>
        </div>
        <div class="page-tools">
          <span class="entry-meta">{{ archiveSummary }}</span>
          <NuxtLink class="button-primary" to="/app/write">새 기록</NuxtLink>
        </div>
      </div>

      <form
        v-if="hydrated && isAuthenticated"
        class="archive-search-form"
        @submit.prevent="submitSearch"
      >
        <label class="archive-search-field" for="archive-search-input">
          <span class="archive-search-label">기록 찾기</span>
          <input
            id="archive-search-input"
            v-model="searchInput"
            data-testid="archive-search-input"
            type="search"
            placeholder="제목이나 본문에서 다시 찾고 싶은 문장을 입력해 보세요."
          />
        </label>
        <button class="button-primary" type="submit">검색</button>
        <button v-if="isSearching" class="button-ghost" type="button" @click="resetSearch">
          전체 보기
        </button>
      </form>

      <div v-if="!hydrated" class="archive-state-card">
        <p class="archive-state-copy">저장된 세션을 확인하고 있습니다.</p>
      </div>

      <div v-else-if="!isAuthenticated" class="archive-state-card">
        <p class="archive-state-copy">
          아카이브를 보려면 먼저 로그인해야 합니다. 현재 단계에서는 기록하기 화면에서 바로 세션을
          만들 수 있습니다.
        </p>
        <NuxtLink class="button-primary" to="/app/write">기록하기로 이동</NuxtLink>
      </div>

      <div v-else-if="listState === 'loading'" class="archive-state-card">
        <p class="archive-state-copy">기록을 불러오는 중입니다.</p>
      </div>

      <div v-else-if="listState === 'error'" class="archive-state-card">
        <p class="archive-state-copy">{{ listError }}</p>
        <button class="button-ghost" type="button" @click="loadEntries(activeQuery)">
          다시 불러오기
        </button>
      </div>

      <div v-else-if="listState === 'empty'" class="archive-state-card">
        <p class="archive-state-copy">
          {{
            isSearching
              ? '검색한 표현과 맞는 기록이 아직 없습니다. 다른 문장이나 제목으로 다시 찾아보세요.'
              : '아직 쌓인 기록이 없습니다. 첫 기록을 남기면 이곳에서 다시 찾아볼 수 있습니다.'
          }}
        </p>
        <button v-if="isSearching" class="button-ghost" type="button" @click="resetSearch">
          전체 기록 보기
        </button>
        <NuxtLink v-else class="button-primary" to="/app/write">첫 기록 남기기</NuxtLink>
      </div>

      <div v-else class="archive-list">
        <p v-if="highlightedEntryId" class="archive-banner">
          방금 저장한 기록이 아카이브에 반영되었습니다.
        </p>
        <p v-if="isSearching" class="archive-banner" data-testid="archive-search-banner">
          <strong>{{ activeQuery }}</strong>
          에 대한 검색 결과입니다.
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
        <span>
          {{ isSearching ? `${entries.length}개의 검색 결과` : `${entries.length}개의 기록` }}
        </span>
      </div>
    </section>
  </main>
</template>
