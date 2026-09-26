<script setup>
import { computed } from 'vue'
import { skillCategories, levelLegend } from '@/data/skills'
import { getTagTextColor } from '@/data/techColors'
import SkillIcon from '@/components/ui/SkillIcon.vue'

function chipStyle(skill) {
  if (skill.level !== 'high') return undefined
  return { backgroundColor: skill.color, color: getTagTextColor(skill.light) }
}

const usedLevels = new Set(skillCategories.flatMap((c) => c.skills.map((s) => s.level)))
const activeLegend = computed(() => levelLegend.filter((item) => usedLevels.has(item.level)))
</script>

<template>
  <section id="skills" class="section">
    <span class="eyebrow">Tech Stack</span>
    <h2 class="giant-title">SKILLS</h2>
    <p class="section-intro">프로젝트를 진행하며 실제로 다뤄본 언어와 프레임워크, 도구들입니다.</p>

    <!-- 숙련도 범례 — 배지와 한 줄 요약을 항상 노출 -->
    <ul class="legend">
      <li v-for="item in activeLegend" :key="item.level" class="legend-item">
        <span class="legend-chip" :class="`level-${item.level}`">{{ item.label }}</span>
        <span class="legend-caption">{{ item.desc }}</span>
      </li>
    </ul>

    <!-- 카테고리별 한 줄 태그 클라우드 — 스크롤 없이 전체를 한눈에 파악 -->
    <div class="skill-board">
      <div v-for="cat in skillCategories" :key="cat.category" class="skill-row">
        <span class="skill-row-label">{{ cat.category }}</span>
        <ul class="skill-chips">
          <li v-for="skill in cat.skills" :key="skill.name">
            <span
              class="skill-chip"
              :class="[`level-${skill.level}`, { 'has-fill': skill.level === 'high' }]"
              :style="chipStyle(skill)"
            >
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
  gap: 20px 80px;
  margin: 32px 0 48px;
}

/* 배지 + 캡션을 하나의 묶음으로 — 줄바꿈 시 둘이 함께 이동 */
.legend-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.legend-chip {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 600;
}

/* 캡션 max-width는 배지 폭과 무관하게 독립 설정 — 의미 단위 기준 줄바꿈 유도 */
.legend-caption {
  font-size: 12.5px;
  color: var(--color-text-muted);
  line-height: 1.45;
  max-width: 240px;
  padding-top: 4px;
}

/* 모바일에서 그룹이 세로로 쌓일 때는 column gap이 의미 없으므로 간격을 줄임 */
@media (max-width: 600px) {
  .legend {
    flex-direction: column;
    gap: 20px;
  }
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
  width: 104px;
  font-family: var(--font-mono);
  font-size: 13px;
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
  padding: 7px 14px 7px 9px;
  border-radius: 999px;
  font-size: 14.5px;
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
  color: var(--color-white);
}

/* 아이콘이 어떤 브랜드 컬러 배경 위에 와도 또렷하게 보이도록 흰 원판을 깔아준다 */
.skill-chip-icon.is-badged {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 2px;
  border-radius: 999px;
  background: var(--color-white);
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
