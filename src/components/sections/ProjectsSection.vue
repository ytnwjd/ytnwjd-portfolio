<!-- src/components/sections/ProjectsSection.vue -->
<script setup>
import { RouterLink } from 'vue-router'
import { IconArrowRight } from '@tabler/icons-vue'
import projects from '@/data/projects'
import { projectGroups } from '@/data/projectGroups'
import ProjectCard from './ProjectCard.vue'

// hidden 프로젝트는 데이터는 보존하되 화면에는 노출하지 않는다
const visibleProjects = projects.filter((p) => !p.hidden)
const bySlug = Object.fromEntries(visibleProjects.map((p) => [p.slug, p]))

// 그룹 순서대로 대표 프로젝트를 묶고, 나머지는 하단 목록으로 내린다
const groups = projectGroups
  .map((group) => ({ ...group, projects: group.slugs.map((slug) => bySlug[slug]).filter(Boolean) }))
  .filter((group) => group.projects.length)

const groupedSlugs = new Set(groups.flatMap((g) => g.projects.map((p) => p.slug)))
const otherProjects = visibleProjects.filter((p) => !groupedSlugs.has(p.slug))

function startYear(period) {
  return period?.slice(0, 4)
}
</script>

<template>
  <section id="projects" class="section">
    <span class="eyebrow">Selected Work</span>
    <h2 class="giant-title">PROJECTS</h2>
    <p class="section-intro">인턴 실무와 실서비스 운영 경험으로 문제를 정의하고 해결한 과정을 담았습니다.</p>

    <div class="project-groups">
      <div v-for="group in groups" :key="group.key" class="project-group">
        <!-- 그룹 헤더 — 회사/조직 · 기간 · 한 줄 맥락 -->
        <header class="group-head">
          <div class="group-head-main">
            <h3 class="group-title">{{ group.title }}</h3>
            <span class="group-period">{{ group.period }}</span>
          </div>
        </header>
        <p class="group-desc">{{ group.description }}</p>

        <ul class="group-cards" :class="`layout-${group.layout}`">
          <li v-for="project in group.projects" :key="project.slug" :id="`project-${project.slug}`"
            class="project-item">
            <ProjectCard :project="project" :wide="group.layout === 'wide'"
              :tone="group.highlight ? 'accent' : 'navy'" />
          </li>
        </ul>
      </div>

      <!-- 대표 묶음에 속하지 않은 프로젝트 — 한 줄 목록으로 축약하되 상세 페이지 링크는 유지 -->
      <div v-if="otherProjects.length" class="other-projects">
        <span class="other-title">Other Projects</span>
        <ul class="other-list">
          <li v-for="project in otherProjects" :key="project.slug" :id="`project-${project.slug}`"
            class="project-item">
            <RouterLink :to="{ name: 'project-detail', params: { slug: project.slug } }" class="other-row">
              <span class="other-name">{{ project.title }}</span>
              <span class="other-meta">
                {{ startYear(project.period) }}
                <IconArrowRight class="other-arrow" :size="15" :stroke-width="2" />
              </span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.project-groups {
  display: flex;
  flex-direction: column;
  gap: 72px;
  margin-top: 64px;
}

/* KPI 카드에서 특정 프로젝트로 스크롤 이동 시, sticky 상단 내비게이션에 가리지 않도록 여백 확보 */
.project-item {
  min-width: 0;
  scroll-margin-top: calc(var(--nav-height) + 24px);
}

/* 그룹 헤더 — 굵은 상단 선으로 묶음의 시작을 표시 */
.group-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 24px;
  padding-top: 16px;
  border-top: 2px solid var(--color-ink);
}

.group-head-main {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 14px;
}

.group-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-ink);
  word-break: keep-all;
}

.group-period {
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--color-text-muted);
}

.group-desc {
  margin: 8px 0 24px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text-muted);
  word-break: keep-all;
}

.group-cards {
  display: grid;
  gap: 20px;
}

.group-cards.layout-cards {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.group-cards.layout-wide {
  grid-template-columns: minmax(0, 1fr);
}

@media (max-width: 1000px) {
  .group-cards.layout-cards {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* Other Projects — 카드 없이 얇은 행 목록 */
.other-title {
  display: block;
  margin-bottom: 10px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.other-list {
  border-top: 1px solid var(--color-border);
}

.other-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 4px;
  border-bottom: 1px solid var(--color-border);
  transition: color 0.2s ease;
}

.other-name {
  min-width: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  word-break: keep-all;
}

.other-meta {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--color-text-muted);
}

.other-arrow {
  transition: transform 0.2s ease;
}

.other-row:hover .other-name {
  color: var(--color-accent);
}

.other-row:hover .other-arrow {
  transform: translateX(3px);
}

@media (max-width: 600px) {
  .other-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>
