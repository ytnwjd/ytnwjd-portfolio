<script setup>
import { kpiCards } from '@/data/hero'

function scrollToTarget(linkTo) {
  document.querySelector(linkTo)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="hero-section">
    <h2 class="subsection-title">🏆 Best Accomplishment</h2>
    <div class="hero">
      <button v-for="card in kpiCards" :key="card.linkTo" type="button" class="kpi-card"
        @click="scrollToTarget(card.linkTo)">
        <span class="kpi-value">{{ card.value }}</span>
        <span class="kpi-label">[{{ card.label }}]</span>
        <span class="kpi-description">{{ card.description }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.kpi-card {
  flex: 1;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 24px;
  text-align: left;
  transition: border-color 0.2s ease;
}

.kpi-card:hover {
  border-color: var(--color-point-1);
}

.kpi-value {
  display: block;
  color: var(--color-point-2);
  font-size: 28px;
  font-weight: 700;
}

.kpi-label {
  display: block;
  margin-top: 10px;
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.kpi-description {
  display: block;
  margin-top: 4px;
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.5;
}
</style>
