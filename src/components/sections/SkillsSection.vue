<script setup>
import { skillCategories } from '@/data/skills'
import SkillIcon from '@/components/ui/SkillIcon.vue'

const LEVEL_FILLED = { high: 3, mid: 2, learning: 1 }
function filledDots(level) {
  return LEVEL_FILLED[level] ?? 0
}

const levelLegend = [
  { level: 'high', label: '많이 해봤어요' },
  { level: 'mid', label: '해본 적 있어요' },
  { level: 'learning', label: '알아가고 있어요' },
]
</script>

<template>
  <section id="skills" class="section">
    <h2 class="section-title">Skills</h2>

    <ul class="level-legend">
      <li v-for="item in levelLegend" :key="item.level" class="legend-item">
        <span class="skill-dots">
          <span
            v-for="i in 3"
            :key="i"
            class="dot"
            :class="{ filled: i <= filledDots(item.level) }"
          ></span>
        </span>
        <span class="legend-label">{{ item.label }}</span>
      </li>
    </ul>

    <div class="category-grid">
      <div v-for="cat in skillCategories" :key="cat.category" class="category-card">
        <h3 class="category-title">{{ cat.category }}</h3>
        <ul class="skill-list">
          <li v-for="skill in cat.skills" :key="skill.name" class="skill-row">
            <SkillIcon :name="skill.name" :icon-slug="skill.iconSlug" />
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-dots" :aria-label="`숙련도: ${skill.level}`">
              <span v-for="i in 3" :key="i" class="dot" :class="{ filled: i <= filledDots(skill.level) }"></span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.level-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;
  margin-bottom: 32px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-label {
  color: var(--color-text-muted);
  font-size: 13px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.category-card {
  padding: 24px;
  border: 0.5px solid var(--color-border);
  border-radius: 8px;
}

.category-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 700;
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.skill-name {
  flex: 1;
  font-size: 14px;
}

.skill-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--color-border);
}

.dot.filled {
  background: var(--color-point-2);
}
</style>
