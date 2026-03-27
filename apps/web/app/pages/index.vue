<script setup lang="ts">
import {
  LANDING_FLOW_STEPS,
  LANDING_LIVE_LINKS,
  LANDING_PROOF_POINTS,
} from '../utils/landing-content';
</script>

<template>
  <main>
    <section class="hero landing-hero">
      <div class="container hero-grid landing-hero-grid">
        <div class="landing-copy">
          <span class="eyebrow">안녕, 나의 바다</span>
          <h1 class="display">흩어진 글이<br />한 권이 되기까지</h1>
          <p class="lede">
            짧은 기록을 쌓아 두세요. 안녕, 나의 바다는 그 조각들이 아카이브와 초안을 거쳐 책처럼
            읽히는 흐름으로 자라나는 과정을 보여줍니다.
          </p>

          <div class="actions">
            <NuxtLink class="button-primary" to="/app/write">기록 시작하기</NuxtLink>
            <NuxtLink class="button-ghost" to="/app/drafts">
              초안 흐름 보기
            </NuxtLink>
          </div>

          <div class="landing-meta-row">
            <span class="landing-meta-pill">private-first writing product</span>
            <span class="landing-meta-pill">responsive web first</span>
            <span class="landing-meta-pill">MVP 구현 진행 중</span>
          </div>
        </div>

        <div class="paper-panel hero-sheet landing-sheet">
          <div class="sheet-kicker">
            <span>지금 할 수 있는 흐름</span>
            <span class="dot-status">초안 미리보기 연결됨</span>
          </div>

          <div>
            <h2 class="sheet-title">짧은 기록이<br />원고의 시작이 됩니다</h2>
            <p class="sheet-copy">
              기록을 남기고, 아카이브에서 다시 꺼내고, 초안으로 묶은 뒤, 읽기 화면에서 한 권의
              시작처럼 확인해 보세요. 아직 출간 도구는 없지만, 지금 가장 중요한 루프는 이미
              움직이고 있습니다.
            </p>
          </div>

          <div class="landing-sheet-list">
            <NuxtLink
              v-for="link in LANDING_LIVE_LINKS"
              :key="link.to"
              class="landing-sheet-link"
              :to="link.to"
            >
              <span class="landing-sheet-label">{{ link.label }}</span>
              <span class="landing-sheet-copy">{{ link.copy }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-muted">
      <div class="container two-col landing-intro-grid">
        <div>
          <span class="eyebrow">왜 필요한가</span>
          <h2 class="section-title">글은 남겼지만,<br />원고는 남지 않았습니다.</h2>
        </div>

        <div class="landing-problem-card">
          <p class="section-copy">
            SNS에 올린 문장은 쉽게 흘러가고, 메모앱에 남긴 기록은 쌓여도 몸을 갖추지 못합니다.
            많이 썼는데도 한 권은 시작되지 않은 것처럼 느껴지는 이유입니다.
          </p>
          <p class="section-copy">
            안녕, 나의 바다는 짧은 기록을 잃지 않고 모아 두고, 서로 닿는 글을 초안으로 묶어,
            실제로 읽어볼 수 있는 흐름까지 연결하는 공간입니다.
          </p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <span class="eyebrow">사용 흐름</span>
        <h2 class="section-title">기록하고, 쌓고,<br />묶어서 읽어봅니다.</h2>

        <div class="feature-grid landing-feature-grid">
          <article
            v-for="step in LANDING_FLOW_STEPS"
            :key="step.number"
            class="feature-item landing-feature-item"
          >
            <span class="eyebrow">{{ step.number }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.copy }}</p>
            <NuxtLink class="landing-inline-link" :to="step.to">{{ step.cta }}</NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section class="section landing-proof-section">
      <div class="container">
        <div class="landing-proof-header">
          <div>
            <span class="eyebrow">지금 구현된 것</span>
            <h2 class="section-title">문서가 아니라 실제 화면으로 이어진 흐름입니다.</h2>
          </div>
          <p class="section-copy landing-proof-copy">
            현재 MVP는 기록 작성, 아카이브, 초안 정리, 초안 미리보기까지 연결되어 있습니다. 랜딩은
            그 현재 상태를 과장 없이 보여주는 입구여야 합니다.
          </p>
        </div>

        <div class="landing-proof-grid">
          <article
            v-for="point in LANDING_PROOF_POINTS"
            :key="point.title"
            class="landing-proof-card"
          >
            <span class="landing-proof-kicker">{{ point.kicker }}</span>
            <h3>{{ point.title }}</h3>
            <p>{{ point.copy }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="cta-band landing-cta-band">
          <div class="cta-band-inner landing-cta-inner">
            <span class="cta-band-label">조용한 제품 소개</span>
            <h3 class="cta-band-title">지금은 크게 설명하기보다,<br />조용히 시작할 수 있어야 합니다.</h3>
            <p class="cta-band-copy">
              기록은 짧게 시작하고, 초안은 천천히 모으고, 미리보기에서 한 권의 감각을 확인합니다.
              안녕, 나의 바다는 그 첫 루프를 먼저 완성하는 중입니다.
            </p>

            <div class="landing-cta-actions">
              <NuxtLink class="button-inv" to="/app/write">첫 기록 남기기</NuxtLink>
              <NuxtLink class="button-ghost landing-ghost-inv" to="/app/drafts">
                초안 둘러보기
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
