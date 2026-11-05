<!-- src/components/sections/ProjectsSection.vue -->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import projects from '@/data/projects'
import ProjectCard from './ProjectCard.vue'

// hidden 프로젝트는 데이터는 보존하되 화면에는 노출하지 않는다
const visibleProjects = projects.filter((p) => !p.hidden)

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
  () => columns.value > 1 && visibleProjects.length % columns.value === 1,
)
</script>

<template>
  <section id="projects" class="section">
    <span class="eyebrow">Selected Work</span>
    <h2 class="giant-title">PROJECTS</h2>
    <p class="section-intro">실서비스 운영부터 팀 프로젝트까지, 직접 설계하고 완성해낸 결과물입니다.</p>

    <!-- 3열 그리드 — 모든 카드는 동일한 크기, 마지막 줄에 혼자 남는 카드만 전체 폭으로 확장 -->
    <ul class="project-grid">
      <li v-for="(project, i) in visibleProjects" :key="project.slug" :id="`project-${project.slug}`"
        class="project-item" :class="{ 'is-wide': isLastCardWide && i === visibleProjects.length - 1 }">
        <ProjectCard :project="project" :index="i" :wide="isLastCardWide && i === visibleProjects.length - 1" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
/* 프로젝트 그리드 — 카드마다 그림자로 떠 보이도록 실제 간격을 두고 배치 */
.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(330px, auto);
  gap: 24px;
  margin-top: 32px;
}

/* KPI 카드에서 특정 프로젝트로 스크롤 이동 시, sticky 상단 내비게이션에 카드가 가리지 않도록 여백 확보.
   min-width: 0은 카드 내부 텍스트의 고유 너비가 그리드 트랙을 밀어내 페이지 전체가 가로로
   넘치는 것(overflow-x: hidden에 의해 우측 요소가 잘려 보이지 않는 문제)을 막는다 */
.project-item {
  min-width: 0;
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
