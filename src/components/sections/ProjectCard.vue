<!-- src/components/sections/ProjectCard.vue -->
<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getTechColor, getTagTextColor } from '@/data/techColors'

const props = defineProps({
  project: { type: Object, required: true },
  wide: { type: Boolean, default: false },
  // 성과 수치 색상 — accent(포인트 컬러) | navy(보조 강조)
  tone: { type: String, default: 'accent' },
})

const metrics = computed(() => props.project.metrics ?? [])
const hook = computed(() => props.project.hook || props.project.summary)

// 기술 태그는 항상 한 줄 — 실제 너비를 재서 들어가는 만큼만 보여주고 나머지는 "+n"으로 묶는다
const allTags = computed(() => props.project.techStack ?? [])
const fitCount = ref(allTags.value.length)
const visibleTags = computed(() => allTags.value.slice(0, fitCount.value))
const showMoreChip = ref(true)
const hiddenTagCount = computed(() =>
  showMoreChip.value ? allTags.value.length - visibleTags.value.length : 0,
)

const tagsBox = ref(null) // 실제 노출 영역 (남는 폭을 모두 차지)
const tagsMeasure = ref(null) // 화면 밖 측정용 — 전체 태그 + "+n" 칩
const TAG_GAP = 5

function fitTags() {
  const box = tagsBox.value
  const measure = tagsMeasure.value
  if (!box || !measure) return

  const available = box.clientWidth
  const items = [...measure.children]
  const moreWidth = items.pop().offsetWidth

  let used = 0
  let count = 0
  for (let i = 0; i < items.length; i += 1) {
    const width = items[i].offsetWidth + (i > 0 ? TAG_GAP : 0)
    const hasRest = i < items.length - 1
    if (used + width + (hasRest ? TAG_GAP + moreWidth : 0) > available) break
    used += width
    count += 1
  }

  // 아주 좁아도 대표 태그(첫 번째)는 항상 보여준다 — "+n" 칩까지 못 들어가면 칩을 생략
  if (count === 0 && items.length) {
    count = 1
    showMoreChip.value = items[0].offsetWidth + TAG_GAP + moreWidth <= available
  } else {
    showMoreChip.value = true
  }
  fitCount.value = count
}

let resizeObserver = null

onMounted(async () => {
  await nextTick()
  fitTags()
  // 웹폰트가 늦게 적용되면 태그 폭이 바뀌므로 로드 후 한 번 더 계산
  document.fonts?.ready.then(fitTags)
  resizeObserver = new ResizeObserver(fitTags)
  if (tagsBox.value) resizeObserver.observe(tagsBox.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())

// 숙련도 구분 없이 모든 태그를 SKILLS 섹션과 같은 브랜드 컬러로 채운다
function tagStyle(tech) {
  const match = getTechColor(tech)
  return {
    backgroundColor: match.color,
    borderColor: match.color,
    color: getTagTextColor(match.light),
  }
}
</script>

<template>
  <RouterLink :to="{ name: 'project-detail', params: { slug: project.slug } }" class="project-card"
    :class="[{ 'is-wide': wide }, `tone-${tone}`]">
    <div class="card-main">
      <div v-if="!wide && metrics.length" class="metric">
        <span class="metric-value">{{ metrics[0].value }}</span>
        <span class="metric-label">{{ metrics[0].label }}</span>
      </div>

      <span class="period">{{ project.period }}</span>
      <h4 class="project-title">{{ project.title }}</h4>
      <p class="hook">{{ hook }}</p>
      <p v-if="!metrics.length && project.result?.[0]" class="result-fallback">{{ project.result[0] }}</p>

      <div class="card-footer">
        <div v-if="allTags.length" class="tech-tags-box">
          <ul ref="tagsBox" class="tech-tags">
            <li v-for="tech in visibleTags" :key="tech" class="tech-tag" :style="tagStyle(tech)">
              {{ tech }}
            </li>
            <li v-if="hiddenTagCount" class="tech-tag more">+{{ hiddenTagCount }}</li>
          </ul>
          <ul ref="tagsMeasure" class="tech-tags tech-tags--measure" aria-hidden="true">
            <li v-for="tech in allTags" :key="tech" class="tech-tag">{{ tech }}</li>
            <li class="tech-tag more">+{{ allTags.length }}</li>
          </ul>
        </div>
        <span class="more-link">자세히 보기<span class="arrow">›</span></span>
      </div>
    </div>

    <!-- 넓은 카드: 수치를 오른쪽 열에 나란히 -->
    <div v-if="wide && metrics.length" class="wide-metrics">
      <div v-for="m in metrics" :key="m.label" class="metric">
        <span class="metric-value">{{ m.value }}</span>
        <span class="metric-label">{{ m.label }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.project-card {
  display: flex;
  height: 100%;
  padding: 26px 26px 22px;
  /* 페이지 배경(#f8f8f8) 위에서 카드 면이 분명히 떠 보이도록 흰 바탕 + 2단 그림자 */
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.project-card:hover {
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.06),
    0 16px 36px rgba(0, 0, 0, 0.14);
  transform: translateY(-4px);
}

.card-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

/* 성과 수치 */
.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-main > .metric {
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--color-border);
}

.metric-value {
  font-size: 34px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-accent);
}

/* 대표(인턴) 그룹만 포인트 컬러를 쓰고, 나머지는 차분한 남색으로 위계를 한 단계 낮춘다 */
.tone-navy .metric-value {
  color: #2b4c7e;
}

.metric-label {
  font-size: 13px;
  color: var(--color-text-muted);
  word-break: keep-all;
}

.period {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--color-text-faint);
}

.project-title {
  margin: 4px 0 8px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--color-ink);
  word-break: keep-all;
}

.hook,
.result-fallback {
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--color-text-muted);
  word-break: keep-all;
}

.result-fallback {
  margin-top: 6px;
}

/* 하단 스택 및 자세히 보기 — 본문 길이와 무관하게 카드 바닥에 붙는다 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 18px;
  margin-top: auto;
}

.card-main > .hook,
.card-main > .result-fallback {
  margin-bottom: 18px;
}

/* 태그 영역은 "자세히 보기"를 뺀 남은 폭을 모두 차지하고, 절대 줄바꿈하지 않는다 */
.tech-tags-box {
  position: relative;
  flex: 1;
  min-width: 0;
  /* 측정용 목록(전체 태그 한 줄)이 박스 밖으로 나가 페이지 폭을 늘리지 않도록 자른다 */
  overflow: hidden;
}

.tech-tags {
  display: flex;
  flex-wrap: nowrap;
  gap: 5px;
  overflow: hidden;
}

/* 폭 측정 전용 — 레이아웃에 영향 없이 화면 밖에서 전체 태그의 실제 폭만 잰다 */
.tech-tags--measure {
  position: absolute;
  top: 0;
  left: 0;
  /* 박스 폭에 맞춰 태그가 눌리면 실제 폭을 잴 수 없으므로, 내용 폭 그대로 펼친다 */
  width: max-content;
  visibility: hidden;
  pointer-events: none;
  overflow: visible;
}

.tech-tag {
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
  padding: 4px 9px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.tech-tag.more {
  color: var(--color-text-faint);
}

.more-link {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  min-height: 26px;
  gap: 3px;
  font-size: 13.5px;
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

/* 넓은 카드 — 본문 | 수치 2열 */
.project-card.is-wide {
  gap: 40px;
  padding: 30px 32px 26px;
}

/* 수치 개수와 무관하게 열 너비를 고정해 넓은 카드끼리 구분선 위치를 맞춘다 */
/* grid로 행 전체는 세로 가운데에 두되(align-content), 수치끼리는 윗선을 맞춘다(align-items).
   라벨 줄 수가 달라도 90% · 16% 같은 값이 같은 높이에 온다. */
.wide-metrics {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  flex: 0 0 380px;
  gap: 32px;
  align-content: center;
  align-items: start;
  padding-left: 40px;
  border-left: 1px solid var(--color-border);
}

@media (max-width: 860px) {
  .project-card.is-wide {
    flex-direction: column-reverse;
    gap: 0;
  }

  .wide-metrics {
    flex-basis: auto;
    gap: 32px;
    padding: 0 0 18px;
    margin-bottom: 18px;
    border-left: none;
    border-bottom: 1px solid var(--color-border);
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-card,
  .arrow {
    transition: none;
  }
}
</style>
