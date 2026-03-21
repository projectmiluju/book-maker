<script setup lang="ts">
definePageMeta({ layout: 'app' })
</script>

<template>
  <main class="writer-grid">
    <aside class="sidebar">
      <div>
        <div class="sidebar-badge">기록하기</div>
        <div class="sidebar-current">
          <div class="sidebar-title">새 기록</div>
          <div class="sidebar-copy">저장 전</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink to="/app/archive">아카이브</NuxtLink>
        <NuxtLink to="/app/drafts">초안</NuxtLink>
        <NuxtLink class="active" to="/app/write">기록하기</NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <NuxtLink class="button-ghost" to="/app/archive">아카이브로</NuxtLink>
      </div>
    </aside>

    <section class="writer-main">
      <article class="writer-sheet">
        <div class="writer-topline">
          <span class="writer-meta">2026년 3월 21일</span>
          <span class="dot-status">자동 저장 중</span>
        </div>

        <input
          class="writer-title"
          placeholder="제목 (선택)"
          spellcheck="false"
        />

        <textarea
          class="writer-body"
          placeholder="오늘의 장면이나 생각을 남겨 보세요."
          rows="14"
        />

        <div class="writer-footer">
          <span class="writer-meta">0자</span>
          <span class="writer-meta">나만 볼 수 있습니다</span>
        </div>
      </article>
    </section>
  </main>
</template>
