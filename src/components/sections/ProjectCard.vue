<!-- src/components/sections/ProjectCard.vue -->
<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getTechColor } from '@/data/techColors'

const props = defineProps({
  project: { type: Object, required: true },
  index: { type: Number, required: true },
  // 그리드 전체 폭을 차지하는 마지막 카드는 회전을 주면 모서리가 섹션 밖으로
  // 삐져나가 가로 스크롤이 생기므로 회전 없이 뜨는 효과만 적용
  wide: { type: Boolean, default: false },
})

const indexLabel = computed(() => String(props.index + 1).padStart(2, '0'))

// keyResult가 없으면 result 배열의 첫 항목(가장 핵심적인 성과)을 대신 노출
const resultLine = computed(() => props.project.keyResult || props.project.result?.[0])

// 카드마다 hover 시 방향을 번갈아 자연스럽게 미세 회전
const rotate = computed(() => (props.index % 2 === 0 ? '0.6deg' : '-0.5deg'))

// 숙련도 구분 없이 모든 태그를 SKILLS 섹션과 같은 브랜드 컬러로 채운다
function tagStyle(tech) {
  const match = getTechColor(tech)
  return {
    backgroundColor: match.color,
    borderColor: match.color,
    color: match.light ? '#1a1a1a' : '#ffffff',
  }
}
</script>

<template>
  <RouterLink :to="{ name: 'project-detail', params: { slug: project.slug } }" class="project-card"
    :class="{ 'no-tilt': wide }" :style="{ '--rotate': rotate }">
    <div class="card-top">
      <span class="index-badge">{{ indexLabel }}</span>
      <span class="meta-text">{{ project.period }} · {{ project.organization }}</span>
    </div>

    <h3 class="project-title">{{ project.title }}</h3>

    <div v-if="project.summary || project.description" class="summary-highlight">
      <span class="summary-tag">Summary</span>
      <span class="summary-text">{{ project.summary || project.description }}</span>
    </div>

    <div v-if="resultLine" class="result-highlight">
      <span class="result-tag">Result</span>
      <span class="result-text">{{ resultLine }}</span>
    </div>

    <div class="card-footer">
      <ul v-if="project.techStack?.length" class="tech-tags">
        <li v-for="tech in project.techStack.slice(0, 4)" :key="tech" class="tech-tag" :style="tagStyle(tech)">
          {{ tech }}
        </li>
        <li v-if="project.techStack.length > 4" class="tech-tag more">+{{ project.techStack.length - 4 }}</li>
      </ul>

      <span class="more-link">자세히 보기<span class="arrow">›</span></span>
    </div>
  </RouterLink>
</template>

<style scoped>
.project-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px 22px;
  background: var(--color-bg);
  border: 1px solid var(--color-accent);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.project-card:hover {
  background: var(--color-bg-alt);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.14);
  transform: translateY(-4px) rotate(var(--rotate));
}

/* 그리드 전체 폭 카드는 회전 시 모서리가 섹션 밖으로 나가 가로 스크롤을 유발하므로 제외 */
.project-card.no-tilt:hover {
  transform: translateY(-4px);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.index-badge {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-faint);
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  padding: 2px 8px;
}

.meta-text {
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--color-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 12px;
  line-height: 1.4;
  word-break: keep-all;
}

.summary-highlight,
.result-highlight {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.result-highlight {
  margin-bottom: 16px;
  flex-grow: 1;
}

.summary-tag,
.result-tag {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.6;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.summary-text,
.result-text {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--color-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: keep-all;
}

/* 하단 스택 및 자세히 보기 링크 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  min-width: 0;
}

.tech-tag {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 8px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.tech-tag.more {
  color: var(--color-text-faint);
}

.more-link {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 3px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
  transition: color 0.2s ease;
}

.project-card:hover .more-link {
  color: var(--color-ink);
}

.arrow {
  display: inline-block;
  font-size: 14px;
  transition: transform 0.2s ease;
}

.project-card:hover .arrow {
  transform: translateX(3px);
}
</style>
