<script setup>
import { skillCategories, levelLegend } from '@/data/skills'
import SkillIcon from '@/components/ui/SkillIcon.vue'

const LEVEL_MAP = levelLegend.reduce((acc, item) => {
  acc[item.level] = item
  return acc
}, {})

function getSkillMeta(level) {
  return LEVEL_MAP[level] ?? { label: level, desc: '', levelNum: 0 }
}
</script>

<template>
  <section id="skills" class="section">
    <h2 class="section-title">Skills</h2>

    <!-- 상단 숙련도 설명 범례 Box -->
    <div class="legend-box">
      <div v-for="item in levelLegend" :key="item.level" class="legend-card" :class="`level-${item.level}`">
        <div class="legend-header">
          <span class="legend-label">{{ item.label }}</span>
          <div class="progress-bar">
            <span v-for="i in 3" :key="i" class="bar-segment" :class="{ filled: i <= item.levelNum }"></span>
          </div>
        </div>
        <p class="legend-desc">{{ item.desc }}</p>
      </div>
    </div>

    <!-- 스킬 카테고리 그리드 -->
    <div class="category-grid">
      <div v-for="cat in skillCategories" :key="cat.category" class="category-card">
        <h3 class="category-title">{{ cat.category }}</h3>

        <ul class="skill-list">
          <li v-for="skill in cat.skills" :key="skill.name" class="skill-row" :class="`level-${skill.level}`">
            <div class="skill-info">
              <SkillIcon :name="skill.name" :icon-slug="skill.iconSlug" />
              <span class="skill-name">{{ skill.name }}</span>
            </div>

            <!-- 숙련도 표시 (Progress Bar 만 적용) -->
            <div class="progress-bar" :aria-label="`숙련도: ${getSkillMeta(skill.level).label}`">
              <span v-for="i in 3" :key="i" class="bar-segment"
                :class="{ filled: i <= getSkillMeta(skill.level).levelNum }"></span>
            </div>

            <!-- 마우스 호버 시 툴팁 -->
            <div class="skill-tooltip">
              <strong>{{ getSkillMeta(skill.level).label }}</strong>
              <p>{{ getSkillMeta(skill.level).desc }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  --color-high: #10b981;
  /* Emerald */
  --color-mid: #3b82f6;
  /* Blue */
  --color-learning: #f59e0b;
  /* Amber */
  --bg-card: #0f172a;
  --bg-card-hover: #1e293b;
  --border-color: rgba(255, 255, 255, 0.1);
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
}

/* 상단 레전드 카드 */
.legend-box {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.legend-card {
  padding: 16px 18px;
  border-radius: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.legend-label {
  font-size: 16px;
  font-weight: 600;
  color: #f8fafc;
}

.legend-desc {
  font-size: 13.5px;
  line-height: 1.5;
  color: #94a3b8;
  margin: 0;
}

/* -------------------------------------------------- */
/* [수정] Grid 기반 3열 배치 (가로 순서 배치 & 균등 정렬) */
/* -------------------------------------------------- */
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: start;
}

.category-card {
  padding: 22px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
}

/* 반응형 처리 */
@media (max-width: 1200px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
}

/* -------------------------------------------------- */

.category-title {
  margin-bottom: 18px;
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 스킬 행 스타일 */
.skill-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.skill-row:hover {
  background: var(--bg-card-hover);
}

.skill-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* [수정] 스킬명 글자 크기 상향 (13px -> 15px) */
.skill-name {
  font-size: 15px;
  font-weight: 500;
  color: #e2e8f0;
}

/* Progress Bar 스타일 */
.progress-bar {
  display: flex;
  gap: 5px;
}

.bar-segment {
  width: 14px;
  height: 7px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s ease;
}

/* 레벨별 강조 색상 */
.level-high .bar-segment.filled {
  background: var(--color-high);
}

.level-mid .bar-segment.filled {
  background: var(--color-mid);
}

.level-learning .bar-segment.filled {
  background: var(--color-learning);
}

/* 마우스 호버 툴팁 스타일 */
.skill-tooltip {
  position: absolute;
  bottom: 100%;
  right: 0;
  transform: translateY(-6px);
  width: 250px;
  padding: 12px 14px;
  background: #020617;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 20;
}

.skill-tooltip strong {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
  color: #f8fafc;
}

.skill-tooltip p {
  font-size: 12px;
  line-height: 1.4;
  color: #94a3b8;
  margin: 0;
}

.skill-row:hover .skill-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-2px);
}
</style>