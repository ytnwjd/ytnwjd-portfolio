<!-- src/components/project-detail/CaseSection.vue -->
<!-- 상세 페이지 섹션 껍데기 — 제목(+ 한 줄 요약) → 본문(slot).
     id는 `section-${id}`로 붙어 고정 탭의 scroll-spy·이동 대상이 된다. -->
<script setup>
defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  note: { type: String, default: '' },
})
</script>

<template>
  <section :id="`section-${id}`" class="cs-section">
    <header class="cs-head">
      <h2 class="cs-h2">{{ title }}</h2>
      <p v-if="note" class="cs-head-note">{{ note }}</p>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.cs-section {
  min-width: 0;
  /* 탭 클릭으로 이동 시 상단 내비게이션 + 고정 탭에 제목이 가리지 않도록.
     --cs-tabs-height는 ProjectDetail.vue의 .project-detail에서 정의한다 */
  scroll-margin-top: calc(var(--nav-height) + var(--cs-tabs-height) + var(--space-8));
}

.cs-head {
  margin-bottom: var(--space-5);
}

.cs-h2 {
  font-size: var(--t2);
  line-height: var(--t2-lh);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.cs-head-note {
  margin-top: var(--space-1);
  font-size: var(--t5);
  line-height: var(--t5-lh);
  color: var(--color-text-muted);
}

@media (max-width: 600px) {
  .cs-h2 {
    font-size: var(--t3);
    line-height: var(--t3-lh);
  }
}
</style>
