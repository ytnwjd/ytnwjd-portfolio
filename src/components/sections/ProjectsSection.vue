<!-- src/components/sections/ProjectsSection.vue -->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import projects from '@/data/projects'
import ProjectCard from './ProjectCard.vue'

const filters = [
  { key: 'all', label: '전체', test: () => true },
  { key: 'featured', label: '주요 프로젝트', test: (p) => p.featured },
  { key: 'solo', label: '개인 프로젝트', test: (p) => p.type === '개인 프로젝트' },
  { key: 'team', label: '팀 프로젝트', test: (p) => p.type.includes('팀 프로젝트') },
]

const activeFilterKey = ref('all')

const filteredProjects = computed(() => {
  const filter = filters.find((f) => f.key === activeFilterKey.value)
  return projects.filter(filter.test)
})

// .project-grid의 그리드 컬럼 수는 미디어 쿼리로 3 → 2 → 1개로 바뀐다.
// 현재 컬럼 수를 함께 추적해야 "마지막 줄에 혼자 남는지" 판단이 브레이크포인트마다 정확해진다.
const mediaQueries = [
  { query: '(max-width: 600px)', columns: 1 },
  { query: '(max-width: 900px)', columns: 2 },
]
const columns = ref(3)

function updateColumns() {
  const matched = mediaQueries.find((mq) => window.matchMedia(mq.query).matches)
  columns.value = matched ? matched.columns : 3
}

let mqlList = []

onMounted(() => {
  updateColumns()
  mqlList = mediaQueries.map((mq) => window.matchMedia(mq.query))
  mqlList.forEach((mql) => mql.addEventListener('change', updateColumns))
})

onBeforeUnmount(() => {
  mqlList.forEach((mql) => mql.removeEventListener('change', updateColumns))
})

// 현재 컬럼 수 기준으로 마지막 줄에 카드 1개만 덩그러니 남는 경우에만
// 그 카드를 전체 폭으로 넓혀 어색한 여백을 없앤다. 1열에서는 이미 전체 폭이라 항상 제외한다.
const isLastCardWide = computed(
  () => columns.value > 1 && filteredProjects.value.length % columns.value === 1,
)
</script>

<template>
  <section id="projects" class="section">
    <span class="eyebrow">Selected Work</span>
    <h2 class="giant-title">PROJECTS</h2>
    <p class="section-intro">실서비스 운영부터 팀 프로젝트까지, 직접 설계하고 완성해낸 결과물입니다.</p>

    <!-- 필터 탭 — URL 이동 없이 로컬 state로 즉시 필터링 -->
    <div class="filter-tabs" role="tablist" aria-label="프로젝트 필터">
      <button v-for="filter in filters" :key="filter.key" type="button" class="filter-tab"
        :class="{ active: activeFilterKey === filter.key }" role="tab" :aria-selected="activeFilterKey === filter.key"
        @click="activeFilterKey = filter.key">
        {{ filter.label }}
      </button>
    </div>

    <p v-if="filteredProjects.length === 0" class="filter-empty">해당하는 프로젝트가 없습니다.</p>

    <!-- 3열 그리드 — 모든 카드는 동일한 크기, 마지막 줄에 혼자 남는 카드만 전체 폭으로 확장 -->
    <ul v-else class="project-grid">
      <li v-for="(project, i) in filteredProjects" :key="project.slug" :id="`project-${project.slug}`"
        class="project-item" :class="{ 'is-wide': isLastCardWide && i === filteredProjects.length - 1 }">
        <ProjectCard :project="project" :index="i" :wide="isLastCardWide && i === filteredProjects.length - 1" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
/* 필터 탭 — 활성 탭은 포인트 컬러로 채워 명확히 구분 */
.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 32px;
}

.filter-tab {
  padding: 9px 18px;
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  color: var(--color-text-muted);
  font-size: 13.5px;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.filter-tab:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.filter-tab.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #ffffff;
}

.filter-empty {
  margin-top: 48px;
  padding: 48px 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 14px;
  text-align: center;
}

/* 프로젝트 그리드 — 카드마다 그림자로 떠 보이도록 실제 간격을 두고 배치 */
.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 32px;
}

/* KPI 카드에서 특정 프로젝트로 스크롤 이동 시, sticky 상단 내비게이션에 카드가 가리지 않도록 여백 확보 */
.project-item {
  scroll-margin-top: calc(var(--nav-height) + 24px);
}

.project-item.is-wide {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .project-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .project-grid {
    grid-template-columns: 1fr;
  }
}
</style>
