<script setup>
import { reactive } from 'vue'
import { IconInfoCircle } from '@tabler/icons-vue'
import { skillCategories, levelLegend } from '@/data/skills'
import SkillIcon from '@/components/ui/SkillIcon.vue'

function chipStyle(skill) {
  if (skill.level !== 'high') return undefined
  return { backgroundColor: skill.color, color: skill.light ? '#1a1a1a' : '#ffffff' }
}

// 배지별 설명 아코디언 — 여러 개를 동시에 열어 서로 비교할 수 있도록 독립적으로 토글
const openLevels = reactive(new Set())

function toggleLevel(level) {
  if (openLevels.has(level)) openLevels.delete(level)
  else openLevels.add(level)
}
</script>

<template>
  <section id="skills" class="section">
    <span class="eyebrow">Tech Stack</span>
    <h2 class="giant-title">SKILLS</h2>
    <p class="section-intro">프로젝트를 진행하며 실제로 다뤄본 언어와 프레임워크, 도구들입니다.</p>

    <!-- 숙련도 범례 — 아이콘 클릭 시 해당 항목 설명만 아코디언으로 펼쳐짐 -->
    <ul class="legend">
      <li v-for="item in levelLegend" :key="item.level" class="legend-item">
        <div class="legend-chip-row">
          <span class="legend-chip" :class="`level-${item.level}`">{{ item.label }}</span>
          <button type="button" class="legend-info-btn" :class="{ 'is-open': openLevels.has(item.level) }"
            :aria-expanded="openLevels.has(item.level)" :aria-controls="`level-desc-${item.level}`"
            :aria-label="`${item.label} 설명 ${openLevels.has(item.level) ? '닫기' : '보기'}`"
            @click="toggleLevel(item.level)">
            <IconInfoCircle :size="15" :stroke-width="1.75" />
          </button>
        </div>

        <div class="legend-desc-wrap" :class="{ 'is-open': openLevels.has(item.level) }">
          <p :id="`level-desc-${item.level}`" class="legend-desc">{{ item.desc }}</p>
        </div>
      </li>
    </ul>

    <!-- 카테고리별 한 줄 태그 클라우드 — 스크롤 없이 전체를 한눈에 파악 -->
    <div class="skill-board">
      <div v-for="cat in skillCategories" :key="cat.category" class="skill-row">
        <span class="skill-row-label">{{ cat.category }}</span>
        <ul class="skill-chips">
          <li v-for="skill in cat.skills" :key="skill.name">
            <span class="skill-chip" :class="[`level-${skill.level}`, { 'has-fill': skill.level === 'high' }]"
              :style="chipStyle(skill)">
              <span class="skill-chip-icon" :class="{ 'is-badged': skill.level === 'high' }">
                <SkillIcon :name="skill.name" :icon-slug="skill.iconSlug" />
              </span>
              {{ skill.name }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.legend {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 10px 16px;
  margin: 32px 0 48px;
}

.legend-item {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.legend-chip-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-chip {
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
}

/* 배지 옆 정보 아이콘 — 클릭으로만 토글, 모바일 탭도 동일하게 동작 */
.legend-info-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  color: var(--color-text-muted);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.legend-info-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.legend-info-btn.is-open {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #ffffff;
}

/* 아코디언 — max-height 트랜지션으로 높이를 부드럽게(과하지 않게) 애니메이션 */
.legend-desc-wrap {
  max-width: 320px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.25s ease;
}

.legend-desc-wrap.is-open {
  max-height: 220px;
}

.legend-desc {
  padding-top: 10px;
  color: var(--color-text-muted);
  font-size: 13.5px;
  line-height: 1.6;
}

/* 태그 클라우드 보드 — 카테고리를 좌측 라벨 + 우측 칩 한 줄로, 세로 공간을 최소화 */
.skill-board {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-border);
}

.skill-row {
  display: flex;
  align-items: baseline;
  gap: 24px;
  padding: 18px 0;
  border-bottom: 1px solid var(--color-border);
}

.skill-row-label {
  flex-shrink: 0;
  width: 96px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.skill-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px 6px 8px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.skill-chip.has-fill:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
}

/* 많이 해봤어요 — 각 기술의 실제 브랜드 컬러로 채운다(색상은 chipStyle에서 인라인으로 지정) */
.legend-chip.level-high {
  background: var(--color-accent);
  color: #ffffff;
}

/* 아이콘이 어떤 브랜드 컬러 배경 위에 와도 또렷하게 보이도록 흰 원판을 깔아준다 */
.skill-chip-icon.is-badged {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 2px;
  border-radius: 999px;
  background: #ffffff;
}

.level-mid {
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
}

.legend-chip.level-mid {
  padding: 6px 13px;
}

.level-learning {
  border: 1px dashed var(--color-border-strong);
  color: var(--color-text-muted);
}

.legend-chip.level-learning {
  padding: 6px 13px;
}

@media (max-width: 640px) {
  .skill-row {
    flex-direction: column;
    gap: 8px;
  }

  .skill-row-label {
    width: auto;
  }
}
</style>
