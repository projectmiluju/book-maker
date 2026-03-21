<script setup lang="ts">
definePageMeta({ layout: 'app' })

const marchEntries = [
  {
    date: '03.18',
    title: '창가에 남은 빛',
    body: '저녁빛이 식탁 위를 천천히 지나가던 순간을 붙잡아 두고 싶었다.'
  },
  {
    date: '03.12',
    title: '대답 없는 전화',
    body: '울리지 않은 전화보다, 울렸는데도 받지 못한 순간이 더 오래 남는다.'
  },
  {
    date: '03.01',
    title: '메모해 두고 싶었던 문장',
    body: '우리는 대체로 큰 사건보다 작은 반복 속에서 변해 간다.'
  }
]

const febEntries = [
  {
    date: '02.21',
    title: '혼자 먹는 점심',
    body: '아무도 없는 식당에서 창밖을 보며 먹는 밥이 오히려 더 오래 기억된다.'
  },
  {
    date: '02.09',
    title: '버스 안에서',
    body: '이어폰을 꽂은 채 멍하니 창밖을 보던 그 시간이 사실 가장 나다운 시간이었다.'
  }
]

const totalCount = marchEntries.length + febEntries.length
</script>

<template>
  <main class="app-grid">
    <aside class="sidebar">
      <div>
        <div class="sidebar-badge">현재 초안</div>
        <div class="sidebar-current">
          <div class="sidebar-title">고요가 머무는 자리</div>
          <div class="sidebar-copy">기록 3개 · 작성 중</div>
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
          <p class="page-subtitle">지금까지 쓴 기록 전체입니다.</p>
        </div>
        <div class="page-tools">
          <span class="entry-meta">{{ totalCount }}개</span>
          <NuxtLink class="button-primary" to="/app/write">새 기록</NuxtLink>
        </div>
      </div>

      <div class="archive-list">
        <div class="archive-month">
          <span class="archive-month-label">2026년 3월</span>
        </div>
        <article
          v-for="entry in marchEntries"
          :key="entry.date"
          class="archive-item"
        >
          <time class="archive-item-date">{{ entry.date }}</time>
          <div class="archive-item-body">
            <h2 class="archive-item-title">{{ entry.title }}</h2>
            <p class="archive-item-preview">{{ entry.body }}</p>
          </div>
        </article>

        <div class="archive-month">
          <span class="archive-month-label">2026년 2월</span>
        </div>
        <article
          v-for="entry in febEntries"
          :key="entry.date"
          class="archive-item"
        >
          <time class="archive-item-date">{{ entry.date }}</time>
          <div class="archive-item-body">
            <h2 class="archive-item-title">{{ entry.title }}</h2>
            <p class="archive-item-preview">{{ entry.body }}</p>
          </div>
        </article>
      </div>

      <div class="archive-folio">
        <span>{{ totalCount }}개의 기록</span>
      </div>
    </section>
  </main>
</template>
