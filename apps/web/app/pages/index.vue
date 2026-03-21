<template>
  <main>
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <span class="eyebrow">안녕, 나의 바다</span>
          <h1 class="display">모든 안녕이<br />머무는 곳.</h1>
          <p class="lede">
            짧게 남긴 장면과 마음을 차곡차곡 쌓아 두세요. 안녕, 나의 바다는 그 기록이 한 권의
            흐름으로 자라나는 과정을 보여줍니다.
          </p>
          <div class="actions">
            <NuxtLink class="button-primary" to="/app/write">지금 기록하기</NuxtLink>
            <NuxtLink class="button-ghost" to="/app/archive">아카이브 보기</NuxtLink>
          </div>
        </div>

        <div class="paper-panel hero-sheet">
          <div class="sheet-kicker">
            <span>2026.03.18</span>
            <span class="dot-status">자동 저장됨</span>
          </div>
          <div>
            <h2 class="sheet-title">창가에<br />남은 빛</h2>
            <p class="sheet-copy">
              저녁빛이 식탁 위를 지나가던 순간은 생각보다 오래 남았다. 사라지는 것은 늘 빠르지만,
              사라지기 직전의 장면은 이상하게 더 선명해진다.
            </p>
          </div>
          <div class="sheet-footer">
            <span>124자</span>
            <span>나만 볼 수 있습니다</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-muted">
      <div class="container two-col">
        <div>
          <span class="eyebrow">문제</span>
          <h2 class="section-title">글은 많이 썼는데,<br />원고는 없습니다.</h2>
        </div>
        <div>
          <p class="section-copy">
            SNS, 메모앱, 노트북에 흩어진 글들은 시간이 지나면 사라지거나 잊힙니다.
          </p>
          <p class="section-copy">
            안녕, 나의 바다는 짧은 기록을 잃지 않고 쌓아 두고, 그것을 한 권의 흐름으로 묶는
            공간입니다.
          </p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <span class="eyebrow">사용 흐름</span>
        <h2 class="section-title">기록하고 쌓고<br />묶어서 읽습니다.</h2>

        <div class="feature-grid">
          <div class="feature-item">
            <span class="eyebrow">01</span>
            <h3>짧게 기록하기</h3>
            <p>한 문장, 한 장면이면 충분합니다. 제목 없이 시작해도 됩니다.</p>
          </div>
          <div class="feature-item">
            <span class="eyebrow">02</span>
            <h3>아카이브에 쌓기</h3>
            <p>기록은 날짜 순으로 모입니다. 흘러가지 않고 내 공간에 남습니다.</p>
          </div>
          <div class="feature-item">
            <span class="eyebrow">03</span>
            <h3>초안으로 묶기</h3>
            <p>닿는 글을 골라 순서를 정합니다. 흩어진 기록이 하나의 흐름이 됩니다.</p>
          </div>
          <div class="feature-item">
            <span class="eyebrow">04</span>
            <h3>책처럼 읽기</h3>
            <p>편집 화면을 벗어나 읽기 모드에서 한 권처럼 읽어 봅니다.</p>
          </div>
        </div>

        <div class="cta-band">
          <div class="cta-band-inner">
            <span class="cta-band-label">조용한 글쓰기 공간</span>
            <h3 class="cta-band-title">UI는 조용하게.<br />글은 앞으로.</h3>
            <p class="cta-band-copy">
              군더더기 없는 화면에서 글을 쓰고, 내가 쓴 것이 어떻게 읽히는지 확인할 수 있습니다.
            </p>
            <NuxtLink class="button-inv" to="/app/write">지금 시작하기</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
