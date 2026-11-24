<!-- src/components/project-detail/ProjectArchitecture.vue -->
<!-- 아키텍처 · 설계 결정 — 다이어그램은 본문 폭 안에서 높이를 제한하고, 원본은 라이트박스로.
     설계 결정은 왜 / 대안 / 대가 카드로 보여준다. -->
<script setup>
import { ref } from 'vue'
import ImageLightbox from '@/components/ui/ImageLightbox.vue'
import { publicAsset } from '@/utils/asset'

defineProps({
  projectTitle: { type: String, required: true },
  diagrams: { type: Array, default: () => [] },
  decisions: { type: Array, default: () => [] },
})

const lightboxImage = ref(null)
</script>

<template>
  <div v-if="diagrams.length" class="cs-diagrams" :style="{ '--diagram-count': diagrams.length }">
    <button
      v-for="(diagram, idx) in diagrams"
      :key="idx"
      type="button"
      class="cs-diagram"
      :aria-label="`${diagram.title} 크게 보기`"
      @click="
        lightboxImage = { src: publicAsset(diagram.image), alt: `${projectTitle} ${diagram.title}` }
      "
    >
      <img :src="publicAsset(diagram.image)" :alt="`${projectTitle} ${diagram.title}`" />
    </button>
  </div>
  <p v-if="diagrams.length" class="cs-hint">이미지를 누르면 크게 볼 수 있어요</p>

  <!-- 설계 결정 — 왜 / 대안 / 대가 -->
  <div v-if="decisions.length" class="cs-decisions">
    <div v-for="(d, idx) in decisions" :key="idx" class="decision">
      <span class="decision-index">결정 {{ idx + 1 }}</span>
      <h3 class="decision-title">{{ d.title }}</h3>
      <dl class="decision-grid">
        <template v-if="d.why">
          <dt>왜</dt>
          <dd>{{ d.why }}</dd>
        </template>
        <template v-if="d.alternative">
          <dt>대안</dt>
          <dd>{{ d.alternative }}</dd>
        </template>
        <template v-if="d.tradeoff">
          <dt>대가</dt>
          <dd>{{ d.tradeoff }}</dd>
        </template>
      </dl>
    </div>
  </div>

  <ImageLightbox :image="lightboxImage" @close="lightboxImage = null" />
</template>

<style scoped>
/* 다이어그램은 높이 340px 제한, 여러 장이면 안쪽 구분선 */
.cs-diagrams {
  display: grid;
  grid-template-columns: repeat(var(--diagram-count, 1), minmax(0, 1fr));
  padding: var(--space-6) 0;
  background: var(--color-surface);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-xl);
}

.cs-diagram {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0 var(--space-6);
  cursor: zoom-in;
}

.cs-diagram + .cs-diagram::before {
  content: '';
  position: absolute;
  top: var(--space-2);
  bottom: var(--space-2);
  left: 0;
  width: 1px;
  background: var(--color-bg-alt);
}

.cs-diagram img {
  max-width: 100%;
  max-height: 340px;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: opacity 0.15s var(--ease);
}

.cs-diagram:hover img {
  opacity: 0.85;
}

.cs-hint {
  margin-top: var(--space-2);
  font-size: var(--t7);
  line-height: var(--t7-lh);
  color: var(--color-text-faint);
}

.cs-decisions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.decision {
  padding: var(--space-6) var(--space-8);
  background: var(--color-surface);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-xl);
}

.decision-index {
  display: block;
  margin-bottom: var(--space-1);
  font-size: var(--t7);
  line-height: var(--t7-lh);
  font-weight: 600;
  color: var(--color-accent);
}

.decision-title {
  margin-bottom: var(--space-4);
  font-size: var(--t4);
  line-height: var(--t4-lh);
  font-weight: 700;
  color: var(--color-text);
}

.decision-grid {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: var(--space-3) var(--space-3);
}

.decision-grid dt {
  font-size: var(--t6);
  line-height: var(--t6-lh);
  font-weight: 600;
  color: var(--color-text-faint);
}

.decision-grid dd {
  font-size: var(--t6);
  line-height: var(--t6-lh);
  color: var(--color-text);
}

@media (max-width: 700px) {
  .cs-diagrams {
    grid-template-columns: minmax(0, 1fr);
  }

  .cs-diagram {
    padding: 0 var(--space-5);
  }

  .cs-diagram + .cs-diagram {
    margin-top: var(--space-5);
    padding-top: var(--space-5);
  }

  .cs-diagram + .cs-diagram::before {
    top: 0;
    bottom: auto;
    left: var(--space-5);
    right: var(--space-5);
    width: auto;
    height: 1px;
  }
}

@media (max-width: 600px) {
  .cs-diagrams,
  .decision {
    border-radius: var(--radius-lg);
  }

  .decision {
    padding: var(--space-5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cs-diagram img {
    transition: none;
  }
}
</style>
