<script setup>
import { kpiCards } from '@/data/hero'

function scrollToTarget(linkTo) {
  document.querySelector(linkTo)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="hero-section">
    <span class="eyebrow">Best Accomplishment</span>
    <div class="hero">
      <button
        v-for="card in kpiCards"
        :key="card.id"
        type="button"
        class="kpi-card"
        @click="scrollToTarget(card.linkTo)"
      >
        <span class="kpi-value">{{ card.value }}</span>
        <span class="kpi-label">{{ card.label }}</span>
        <span class="kpi-description">{{ card.description }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
  margin-top: 24px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
}

.kpi-card {
  display: flex;
  flex-direction: column;
  padding: 34px 28px;
  background: var(--color-bg);
  text-align: left;
  transition: background-color 0.2s ease;
}

.kpi-card:hover {
  background: var(--color-bg-alt);
}

.kpi-value {
  display: block;
  color: var(--color-accent);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.kpi-label {
  display: block;
  margin-top: 14px;
  font-family: var(--font-mono);
  color: var(--color-text-faint);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.kpi-description {
  display: block;
  margin-top: 4px;
  color: var(--color-text-muted);
  font-size: 15px;
  line-height: 1.5;
  white-space: pre-line;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 520px) {
  .hero {
    grid-template-columns: 1fr;
  }
}
</style>
