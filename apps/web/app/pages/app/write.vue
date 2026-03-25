<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { useAuthSession } from '../../composables/useAuthSession';
import { useEntryEditor } from '../../composables/useEntryEditor';
import { createAuthApiClient, createEntriesApiClient } from '../../utils/api';

definePageMeta({ layout: 'app' });

const runtimeConfig = useRuntimeConfig();
const route = useRoute();

const {
  hydrated,
  isAuthenticated,
  accessToken,
  refreshToken,
  user,
  hydrateFromStorage,
  setSession,
  clearSession,
} = useAuthSession();

const authApi = createAuthApiClient(runtimeConfig.public.apiBase);
const entriesApi = createEntriesApiClient(
  runtimeConfig.public.apiBase,
  () => accessToken.value,
);

const editor = useEntryEditor({
  api: entriesApi,
  onAuthExpired: clearSession,
});
const {
  title,
  body,
  characterCount,
  createdAt,
  errorMessage,
  hydrateEntry,
  lastSavedAt,
  retrySave,
  saveState,
} = editor;

const authMode = ref<'signup' | 'login'>('signup');
const authPending = ref(false);
const authError = ref('');
const authForm = reactive({
  displayName: '고요한 기록자',
  email: '',
  password: '',
});
const entryLoadPending = ref(false);
const entryLoadError = ref('');
const loadedEntryId = ref<string | null>(null);
const logoutPending = ref(false);

const statusLabelMap = {
  idle: '아직 저장 전',
  pending: '자동 저장 준비 중',
  saving: '자동 저장 중',
  saved: '저장됨',
  error: '저장 실패',
  'auth-required': '세션 확인 필요',
} as const;

const saveStatusLabel = computed(() => statusLabelMap[saveState.value]);
const entryDateLabel = computed(() =>
  formatDate(createdAt.value ?? new Date().toISOString()),
);
const savedArchiveLink = computed(() =>
  lastSavedAt.value && editor.entryId.value
    ? {
        archive: `/app/archive?entryId=${editor.entryId.value}`,
        detail: `/app/entries/${editor.entryId.value}`,
      }
    : null,
);
const saveSummary = computed(() => {
  if (saveState.value === 'saved' && lastSavedAt.value) {
    return `${formatTime(lastSavedAt.value)}에 저장됨`;
  }

  if (saveState.value === 'error' || saveState.value === 'auth-required') {
    return errorMessage.value;
  }

  return saveStatusLabel.value;
});

watch(
  [hydrated, isAuthenticated, () => route.query.entryId],
  async ([isHydrated, authenticated, entryId]) => {
    if (!isHydrated || !authenticated || typeof entryId !== 'string') {
      return;
    }

    if (loadedEntryId.value === entryId) {
      return;
    }

    entryLoadPending.value = true;
    entryLoadError.value = '';

    try {
      const entry = await entriesApi.getEntry(entryId);
      hydrateEntry(entry);
      loadedEntryId.value = entryId;
    } catch {
      entryLoadError.value =
        '기존 기록을 불러오지 못했습니다. 새 기록으로 이어서 작성할 수 있습니다.';
    } finally {
      entryLoadPending.value = false;
    }
  },
  { immediate: true },
);

onMounted(() => {
  hydrateFromStorage();
});

async function submitAuth() {
  authPending.value = true;
  authError.value = '';

  try {
    const session =
      authMode.value === 'signup'
        ? await authApi.signup({
            displayName: authForm.displayName,
            email: authForm.email,
            password: authForm.password,
          })
        : await authApi.login({
            email: authForm.email,
            password: authForm.password,
          });

    setSession(session);
  } catch (error) {
    authError.value = error instanceof Error ? error.message : '로그인에 실패했습니다.';
  } finally {
    authPending.value = false;
  }
}

async function logout() {
  if (!refreshToken.value) {
    clearSession();
    return;
  }

  logoutPending.value = true;

  try {
    await authApi.logout(refreshToken.value);
  } catch {
    // 서버 로그아웃이 실패해도 로컬 세션은 즉시 정리한다.
  } finally {
    clearSession();
    logoutPending.value = false;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}
</script>

<template>
  <main class="writer-grid">
    <aside class="sidebar">
      <div>
        <div class="sidebar-badge">기록하기</div>
        <div class="sidebar-current">
          <div class="sidebar-title">
            {{ user?.displayName ?? '개인 기록 공간' }}
          </div>
          <div class="sidebar-copy">
            {{ isAuthenticated ? saveSummary : '세션이 필요합니다' }}
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink to="/app/archive">아카이브</NuxtLink>
        <NuxtLink to="/app/drafts">초안</NuxtLink>
        <NuxtLink class="active" to="/app/write">기록하기</NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button
          v-if="isAuthenticated"
          class="button-ghost"
          type="button"
          :disabled="logoutPending"
          @click="logout"
        >
          {{ logoutPending ? '세션 정리 중...' : '로그아웃' }}
        </button>
        <NuxtLink
          v-if="savedArchiveLink"
          class="button-ghost"
          :to="savedArchiveLink.detail"
        >
          방금 기록 보기
        </NuxtLink>
        <NuxtLink class="button-ghost" to="/app/archive">아카이브로</NuxtLink>
      </div>
    </aside>

    <section class="writer-main">
      <div v-if="!hydrated" class="writer-shell">
        <article class="writer-auth-card">
          <p class="writer-auth-eyebrow">세션 확인 중</p>
          <h1 class="writer-auth-title">기록 공간을 준비하고 있습니다.</h1>
          <p class="writer-auth-copy">
            저장된 로그인 세션을 불러오고 있습니다.
          </p>
        </article>
      </div>

      <div v-else-if="!isAuthenticated" class="writer-shell">
        <article class="writer-auth-card">
          <p class="writer-auth-eyebrow">Private Writing</p>
          <h1 class="writer-auth-title">기록을 시작하려면 먼저 세션이 필요합니다.</h1>
          <p class="writer-auth-copy">
            현재 단계에서는 이 화면에서 바로 가입하거나 로그인한 뒤, 같은 자리에서 자동 저장 흐름을 이어서 확인할 수 있습니다.
          </p>

          <div class="writer-auth-switch">
            <button
              type="button"
              class="button-ghost"
              :data-active="authMode === 'signup'"
              @click="authMode = 'signup'"
            >
              가입 후 시작
            </button>
            <button
              type="button"
              class="button-ghost"
              :data-active="authMode === 'login'"
              @click="authMode = 'login'"
            >
              로그인
            </button>
          </div>

          <form class="writer-auth-form" @submit.prevent="submitAuth">
            <label v-if="authMode === 'signup'" class="writer-auth-field">
              <span>이름</span>
              <input
                v-model="authForm.displayName"
                autocomplete="name"
                placeholder="기록에 남길 이름"
                type="text"
              />
            </label>

            <label class="writer-auth-field">
              <span>이메일</span>
              <input
                v-model="authForm.email"
                autocomplete="email"
                placeholder="you@example.com"
                type="email"
              />
            </label>

            <label class="writer-auth-field">
              <span>비밀번호</span>
              <input
                v-model="authForm.password"
                autocomplete="current-password"
                placeholder="8자 이상"
                type="password"
              />
            </label>

            <p v-if="authError" class="writer-alert writer-alert-error">
              {{ authError }}
            </p>

            <button class="button-primary" type="submit" :disabled="authPending">
              {{
                authPending
                  ? '세션 준비 중...'
                  : authMode === 'signup'
                    ? '가입 후 시작'
                    : '로그인 후 계속'
              }}
            </button>
          </form>
        </article>
      </div>

      <article v-else class="writer-sheet">
        <div class="writer-topline">
          <span class="writer-meta">{{ entryDateLabel }}</span>
          <span class="dot-status" :data-tone="saveState">{{ saveStatusLabel }}</span>
        </div>

        <p v-if="entryLoadPending" class="writer-alert">기존 기록을 불러오는 중입니다.</p>
        <p v-else-if="entryLoadError" class="writer-alert writer-alert-error">
          {{ entryLoadError }}
        </p>
        <p
          v-else-if="errorMessage && (saveState === 'error' || saveState === 'auth-required')"
          class="writer-alert writer-alert-error"
        >
          {{ errorMessage }}
          <button
            v-if="saveState === 'error'"
            class="writer-alert-action"
            type="button"
            @click="retrySave"
          >
            다시 저장
          </button>
        </p>

        <input
          v-model="title"
          class="writer-title"
          placeholder="제목 (선택)"
          spellcheck="false"
        />

        <textarea
          v-model="body"
          class="writer-body"
          placeholder="오늘의 장면이나 생각을 남겨 보세요."
          rows="14"
        />

        <div class="writer-footer">
          <span class="writer-meta">{{ characterCount }}자</span>
          <span class="writer-meta">
            {{
              lastSavedAt
                ? `${formatTime(lastSavedAt)} 마지막 저장`
                : '나만 볼 수 있습니다'
            }}
          </span>
        </div>

        <div v-if="savedArchiveLink" class="writer-links">
          <NuxtLink class="button-ghost" :to="savedArchiveLink.archive">
            아카이브에서 확인
          </NuxtLink>
          <NuxtLink class="button-ghost" :to="savedArchiveLink.detail">
            상세로 열기
          </NuxtLink>
        </div>
      </article>
    </section>
  </main>
</template>
