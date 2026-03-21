<script setup lang="ts">
definePageMeta({ layout: 'app' });
</script>

<template>
  <main class="preview-shell">
    <NuxtLink class="back-link" to="/app/drafts">초안으로</NuxtLink>

    <header class="preview-header">
      <span class="preview-eyebrow">미리보기</span>
      <h1 class="preview-title">고요가 머무는 자리</h1>
      <p class="preview-copy">글의 흐름을 처음부터 끝까지 읽어 보세요.</p>
      <div class="preview-divider" />
    </header>

    <article class="manuscript">
      <section>
        <h2>창가에 남은 빛</h2>
        <p>
          저녁빛이 식탁 위를 지나가던 순간은 생각보다 오래 남았다. 사라지는 것은 늘 빠르지만,
          사라지기 직전의 장면은 이상하게 더 선명해진다.
        </p>
        <p>어쩌면 기억은 사건이 아니라 빛의 방향을 저장하는 일인지도 모른다.</p>
      </section>

      <div class="manuscript-sep">· · ·</div>

      <section>
        <h2>대답 없는 전화</h2>
        <p>
          받지 못한 전화는 금방 잊히지만, 받지 못한 이유를 오래 설명하게 되는 밤이 있다. 말해지지
          않은 대답이 더 오래 남는 순간들.
        </p>
        <p>전화기를 내려놓고 나서도 울림은 한동안 손 안에 남아 있었다.</p>
      </section>

      <div class="manuscript-sep">· · ·</div>

      <section>
        <h2>메모해 두고 싶었던 문장</h2>
        <p>
          우리는 대체로 큰 사건보다 작은 반복 속에서 변해 간다. 습관이 성격을 만들고, 성격이 선택을
          만들고, 선택이 기억을 만든다.
        </p>
        <p>메모는 그 반복의 증거다.</p>
      </section>
    </article>

    <div class="preview-end">
      <div class="preview-meta">여기까지입니다</div>
      <p>목록이 아니라 한 권처럼 읽히는지 확인해 보세요.</p>
      <NuxtLink class="button-secondary" to="/app/drafts">다시 다듬기</NuxtLink>
    </div>
  </main>
</template>
