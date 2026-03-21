<template>
  <div>
    <header class="topbar">
      <div class="topbar-inner">
        <NuxtLink class="brand" to="/">Book Maker</NuxtLink>
        <nav class="nav">
          <NuxtLink to="/app/archive" active-class="active">아카이브</NuxtLink>
          <NuxtLink to="/app/drafts" active-class="active">초안</NuxtLink>
          <NuxtLink to="/app/write" active-class="active">기록하기</NuxtLink>
        </nav>
        <span class="meta">개인 공간</span>
      </div>
    </header>

    <slot />
  </div>
</template>
