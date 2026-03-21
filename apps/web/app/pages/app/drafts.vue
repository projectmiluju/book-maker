<script setup lang="ts">
definePageMeta({ layout: 'app' });

const draftEntries = [
  {
    order: '01',
    title: '창가에 남은 빛',
    body: '저녁빛이 식탁 위를 천천히 지나가던 순간.',
    tag: '03.18',
  },
  {
    order: '02',
    title: '대답 없는 전화',
    body: '받지 못한 순간이 오히려 더 오래 남는다.',
    tag: '03.12',
  },
  {
    order: '03',
    title: '메모해 두고 싶었던 문장',
    body: '큰 사건보다 작은 반복 속에서 사람이 바뀐다.',
    tag: '03.01',
  },
];
</script>

<template>
  <main class="app-grid">
    <aside class="sidebar">
      <div>
        <div class="sidebar-badge">현재 초안</div>
        <div class="sidebar-current">
          <div class="sidebar-title">고요가 머무는 자리</div>
          <div class="sidebar-copy">기록 {{ draftEntries.length }}개</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink to="/app/archive">아카이브</NuxtLink>
        <NuxtLink class="active" to="/app/drafts">초안</NuxtLink>
        <NuxtLink to="/app/write">기록하기</NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <NuxtLink class="button-primary" to="/app/drafts/preview">미리보기</NuxtLink>
        <button class="button-ghost">기록 추가</button>
      </div>
    </aside>

    <section class="app-main">
      <div class="draft-hero">
        <input class="draft-title-input" value="고요가 머무는 자리" />
        <textarea class="draft-description" rows="2">
흩어진 기록을 조용한 흐름으로 묶어 두는 초안.</textarea
        >

        <div class="draft-meta">
          <span>기록 {{ draftEntries.length }}개</span>
          <span>12,402자</span>
          <span>활성</span>
        </div>

        <div class="draft-actions">
          <button class="button-ghost">기록 추가</button>
          <NuxtLink class="button-primary" to="/app/drafts/preview">미리보기</NuxtLink>
        </div>
      </div>

      <div class="sequence-header">순서</div>

      <div class="sequence-list">
        <article v-for="entry in draftEntries" :key="entry.order" class="sequence-item">
          <div class="sequence-order">{{ entry.order }}</div>
          <div>
            <h2 class="sequence-title">{{ entry.title }}</h2>
            <p class="sequence-copy">{{ entry.body }}</p>
          </div>
          <div class="sequence-tag">{{ entry.tag }}</div>
        </article>
      </div>

      <div class="draft-footer">
        <span class="entry-meta">순서를 바꿔 흐름을 만들어 보세요</span>
        <NuxtLink class="button-secondary" to="/app/drafts/preview">책처럼 읽어보기</NuxtLink>
      </div>
    </section>
  </main>
</template>
