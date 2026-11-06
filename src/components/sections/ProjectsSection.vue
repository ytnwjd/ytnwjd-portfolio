<!-- src/components/sections/ProjectsSection.vue -->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import projects from '@/data/projects'
import ProjectCard from './ProjectCard.vue'

// hidden 프로젝트는 데이터는 보존하되 화면에는 노출하지 않는다
const visibleProjects = projects.filter((p) => !p.hidden)

// 데스크톱 콜라주 배치 — 섹션 헤더 아래 24열 × 10px 행 그리드 위의 좌표(grid-area)와 기울기.
// 행이 10px 단위라 span 38 ≒ 카드 높이 380px. 카드 크기는 모두 같게 두고(8열 × 38행),
// 윗줄 3장·아랫줄 2장을 위아래로 엇갈리게 놓아 지그재그 리듬만 만든다.
const COLLAGE_SLOTS = {
  'crawler-watcher': { area: '1 / 1 / span 38 / 9', tilt: '-1.2deg' },
  'labradorlabs-DBMS': { area: '8 / 9 / span 38 / 17', tilt: '1deg' },
  'vulnerability-alert-system': { area: '1 / 17 / span 38 / 25', tilt: '-0.8deg' },
  'gpu-job-management-dashboard': { area: '48 / 4 / span 38 / 12', tilt: '1.2deg' },
  ajouchong: { area: '52 / 14 / span 38 / 22', tilt: '-1deg' },
}

// 슬롯이 지정되지 않은 프로젝트가 하나라도 보이면 콜라주가 깨지므로 일반 그리드로 대체
const hasCollageSlots = visibleProjects.every((p) => COLLAGE_SLOTS[p.slug])

// 1200px 이상은 콜라주, 그 아래는 2열 → 1열 그리드.
// 현재 레이아웃을 추적해야 "마지막 줄에 혼자 남는 카드" 판단이 브레이크포인트마다 정확해진다.
const mediaQueries = [
  { query: '(max-width: 600px)', columns: 1 },
  { query: '(max-width: 1199px)', columns: 2 },
]
const columns = ref(0) // 0 = 콜라주

function updateColumns() {
  const matched = mediaQueries.find((mq) => window.matchMedia(mq.query).matches)
  columns.value = matched ? matched.columns : hasCollageSlots ? 0 : 3
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

const isCollage = computed(() => columns.value === 0)

// 그리드 모드에서 마지막 줄에 카드 1개만 덩그러니 남는 경우에만 그 카드를 전체 폭으로 넓힌다.
// 1열은 이미 전체 폭이고, 콜라주는 좌표가 고정이라 제외한다.
const isLastCardWide = computed(
  () => columns.value > 1 && visibleProjects.length % columns.value === 1,
)

function slotStyle(project) {
  const slot = COLLAGE_SLOTS[project.slug]
  return slot ? { '--slot': slot.area, '--tilt': slot.tilt } : undefined
}
</script>

<template>
  <section id="projects" class="section">
    <div class="project-layout" :class="{ 'is-collage': isCollage }">
      <div class="project-head">
        <span class="eyebrow">Selected Work</span>
        <h2 class="giant-title">PROJECTS</h2>
        <p class="section-intro">인턴 실무와 실서비스 운영 경험으로 문제를 정의하고 해결한 과정을 담았습니다.</p>
      </div>

      <!-- 데스크톱: 크기·위치·기울기가 제각각인 콜라주 / 태블릿 이하: 동일 크기 그리드 -->
      <ul class="project-grid">
        <li v-for="(project, i) in visibleProjects" :key="project.slug" :id="`project-${project.slug}`"
          class="project-item" :class="{ 'is-wide': isLastCardWide && i === visibleProjects.length - 1 }"
          :style="isCollage ? slotStyle(project) : undefined">
          <ProjectCard :project="project" :index="i"
            :no-tilt="isCollage || (isLastCardWide && i === visibleProjects.length - 1)" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* 프로젝트 그리드 — 카드마다 그림자로 떠 보이도록 실제 간격을 두고 배치 */
.project-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: minmax(330px, auto);
  gap: 24px;
  margin-top: 48px;
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

/* 콜라주 — 섹션 헤더 아래에 24열 × 10px 행 그리드를 깔고, 카드마다 좌표를 지정해 흩뿌린다 */
@media (min-width: 1200px) {
  .is-collage .project-grid {
    grid-template-columns: repeat(24, 1fr);
    grid-auto-rows: 10px;
    gap: 0 24px;
    margin-top: 100px;
  }

  .is-collage .project-item {
    grid-area: var(--slot);
    transform: rotate(var(--tilt, 0deg));
    transition: transform 0.25s ease;
  }

  /* 마우스를 올리면 기울기가 풀리며 똑바로 서고, 겹친 카드 위로 올라온다 */
  .is-collage .project-item:hover,
  .is-collage .project-item:focus-within {
    z-index: 1;
    transform: rotate(0deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .is-collage .project-item {
    transition: none;
  }
}

@media (max-width: 600px) {
  .project-grid {
    grid-template-columns: 1fr;
  }
}
</style>
