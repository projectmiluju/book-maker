<script setup lang="ts">
import { computed, watch } from 'vue';

import { useAuthSession } from '../../../composables/useAuthSession';
import { useDraftPreview } from '../../../composables/useDraftPreview';
import { createDraftsApiClient } from '../../../utils/api';
import { formatEntryDateTime } from '../../../utils/entry-format';

definePageMeta({ layout: 'app' });

const runtimeConfig = useRuntimeConfig();
const route = useRoute();

const {
  hydrated,
  isAuthenticated,
  accessToken,
  hydrateFromStorage,
} = useAuthSession();

const draftId = computed(() => {
  const value = route.query.draftId;
  return typeof value === 'string' && value.length > 0 ? value : '';
});
const draftsApi = createDraftsApiClient(
  runtimeConfig.public.apiBase,
  () => accessToken.value,
);
const {
  loadPreview,
  preview,
  previewError,
  previewState,
} = useDraftPreview({
  api: draftsApi,
});
const backLink = computed(() =>
  draftId.value ? `/app/drafts/${draftId.value}` : '/app/drafts',
);

watch(
  [hydrated, isAuthenticated, draftId],
  async ([isHydrated, authenticated, nextDraftId]) => {
    if (!isHydrated || !authenticated || !nextDraftId) {
      return;
    }

    await loadPreview(nextDraftId);
  },
  { immediate: true },
);

onMounted(() => {
  hydrateFromStorage();
});

async function reloadPreview() {
  if (!draftId.value) {
    return;
  }

  await loadPreview(draftId.value);
}

function buildPreviewParagraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}
</script>

<template>
  <main class="preview-shell">
    <NuxtLink class="back-link" :to="backLink">초안으로</NuxtLink>

    <div v-if="!hydrated" class="archive-state-card">
      <p class="archive-state-copy">저장된 세션을 확인하고 있습니다.</p>
    </div>

    <div v-else-if="!isAuthenticated" class="archive-state-card">
      <p class="archive-state-copy">초안 미리보기를 보려면 먼저 로그인해야 합니다.</p>
      <NuxtLink class="button-primary" to="/app/write">기록하기로 이동</NuxtLink>
    </div>

    <div v-else-if="!draftId" class="archive-state-card">
      <p class="archive-state-copy">
        미리볼 초안을 먼저 선택해 주세요. 초안 상세 화면에서 다시 진입할 수 있습니다.
      </p>
      <NuxtLink class="button-primary" to="/app/drafts">초안 목록으로</NuxtLink>
    </div>

    <div
      v-else-if="previewState === 'loading' || previewState === 'idle'"
      class="archive-state-card"
    >
      <p class="archive-state-copy">초안 미리보기를 준비하는 중입니다.</p>
    </div>

    <div v-else-if="previewState === 'error'" class="archive-state-card">
      <p class="archive-state-copy">{{ previewError }}</p>
      <button class="button-ghost" type="button" @click="reloadPreview">
        다시 불러오기
      </button>
    </div>

    <template v-else-if="preview">
      <header class="preview-header">
        <span class="preview-eyebrow">미리보기</span>
        <h1 class="preview-title">{{ preview.title }}</h1>
        <p class="preview-copy">
          {{
            preview.description ??
            '글의 흐름을 처음부터 끝까지 읽으며 한 권의 시작처럼 느껴지는지 확인해 보세요.'
          }}
        </p>
        <p class="preview-copy preview-timestamp">
          마지막 정리 {{ formatEntryDateTime(preview.updatedAt) }}
        </p>
        <div class="preview-divider" />
      </header>

      <article class="manuscript">
        <template v-if="preview.entries.length > 0">
          <template v-for="(entry, index) in preview.entries" :key="entry.id">
            <section>
              <h2>{{ entry.title ?? `장면 ${String(entry.position).padStart(2, '0')}` }}</h2>
              <p
                v-for="(paragraph, paragraphIndex) in buildPreviewParagraphs(entry.body)"
                :key="`${entry.id}-${paragraphIndex}`"
              >
                {{ paragraph }}
              </p>
            </section>

            <div v-if="index < preview.entries.length - 1" class="manuscript-sep">· · ·</div>
          </template>
        </template>

        <div v-else class="archive-state-card">
          <p class="archive-state-copy">
            아직 초안에 담긴 기록이 없습니다. 초안 상세 화면으로 돌아가 기록을 먼저 모아 보세요.
          </p>
        </div>
      </article>

      <div class="preview-end">
        <div class="preview-meta">여기까지입니다</div>
        <p>목록이 아니라 한 권처럼 읽히는지 확인해 보세요.</p>
        <NuxtLink class="button-secondary" :to="backLink">다시 다듬기</NuxtLink>
      </div>
    </template>
  </main>
</template>
