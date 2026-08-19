<!-- src/components/sections/ProjectsSection.vue -->
<script setup>
import { RouterLink } from 'vue-router'
import projects from '@/data/projects'

// keyResult가 없으면 result 배열의 첫 항목(가장 핵심적인 성과)을 대신 노출
function resultLine(project) {
  return project.keyResult || project.result?.[0]
}
</script>

<template>
  <section id="projects" class="section">
    <div class="section-header">
      <h2 class="section-title">Projects</h2>
    </div>

    <!-- 목록은 "제목 + 핵심 성과 한 줄"만 남겨 스캔 속도를 우선한다.
         나머지 상세 내용(개요, 담당 역할, 트러블슈팅)은 상세 페이지에서 확인 -->
    <ul class="project-grid">
      <li v-for="project in projects" :key="project.slug" class="project-item"
        :class="{ 'is-featured': project.featured }">
        <RouterLink :to="{ name: 'project-detail', params: { slug: project.slug } }" class="project-card">
          <span class="card-accent" aria-hidden="true"></span>

          <div class="card-meta">
            <span class="status-dot" :class="{ 'is-featured': project.featured }" aria-hidden="true"></span>
            <span class="meta-text">{{ project.period }} · {{ project.organization }}</span>
          </div>

          <h3 class="project-title">{{ project.title }}</h3>

          <div v-if="project.summary || project.description" class="summary-highlight">
            <span class="summary-tag">Summary</span>
            <span class="summary-text">{{ project.summary || project.description }}</span>
          </div>

          <div v-if="resultLine(project)" class="result-highlight">
            <span class="result-tag">Result</span>
            <span class="result-text">{{ resultLine(project) }}</span>
          </div>

          <div class="card-footer">
            <ul v-if="project.techStack?.length" class="tech-tags">
              <li v-for="tech in project.techStack.slice(0, 3)" :key="tech" class="tech-tag">
                {{ tech }}
              </li>
              <li v-if="project.techStack.length > 3" class="tech-tag more">+{{ project.techStack.length - 3 }}</li>
            </ul>

            <span class="more-link"><span class="prompt"></span>자세히 보기<span class="arrow">›</span></span>
          </div>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
/* 섹션 헤더 */
.section-header {
  margin-bottom: 32px;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.02em;
}

/* 프로젝트 그리드 — 여유 있게 2열 위주로 배치해 카드 하나하나가 화면을 채우도록 함 */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 24px;
  list-style: none;
  padding: 0;
  margin: 0;
}

@media (min-width: 1024px) {
  .project-item.is-featured {
    grid-column: span 2;
  }
}

/* 카드 — 제목과 핵심 성과 한 줄에만 시선이 가도록 절제.
   좌측 액센트 바 하나로만 상태를 표시하고 나머지 장식은 제거 */
.project-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 32px 30px 26px 34px;
  background: #28374f;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-border);
  transition:
    background-color 0.2s ease,
    width 0.2s ease;
}

.project-item.is-featured .card-accent {
  background: var(--color-point-2);
}

.project-card:hover {
  transform: translateY(-3px);
  background: #2f4059;
  border-color: rgba(148, 163, 184, 0.3);
}

.project-card:hover .card-accent {
  width: 4px;
  background: var(--color-point-1);
}

.project-item.is-featured .project-card:hover .card-accent {
  background: var(--color-point-2);
}

.project-card:focus-visible {
  outline: 2px solid var(--color-point-1);
  outline-offset: 2px;
}

.project-card:hover .arrow {
  transform: translateX(3px);
}

/* 메타 한 줄 — 기간 · 기관을 한 줄로 압축, 넘치면 말줄임 처리해 카드 높이를 지킴 */
.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  min-width: 0;
}

.status-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-point-1);
  box-shadow: 0 0 0 4px var(--color-point-1-soft);
}

.status-dot.is-featured {
  background: var(--color-point-2);
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.15);
}

@media (prefers-reduced-motion: no-preference) {
  .status-dot {
    animation: dot-pulse 2.6s ease-in-out infinite;
  }
}

@keyframes dot-pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

.meta-text {
  overflow: hidden;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
  font-size: 11.5px;
  color: var(--color-text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 제목 — 카드에서 가장 먼저 읽히는 요소 */
.project-title {
  font-size: 21px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 14px;
  line-height: 1.4;
  word-break: keep-all;
}

.summary-highlight {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
}

.summary-tag {
  flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 700;
  line-height: 1.65;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-point-2);
}

.summary-text {
  font-size: 15px;
  font-weight: 400;
  line-height: 1.65;
  color: #cbd5e1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: keep-all;
}

/* 핵심 성과 한 줄 — Summary와 동일한 라벨 디자인 */
.result-highlight {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 22px;
  flex-grow: 1;
}

.result-tag {
  flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 700;
  line-height: 1.65;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-point-2);
}

.result-text {
  font-size: 15px;
  font-weight: 400;
  line-height: 1.65;
  color: #cbd5e1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: keep-all;
}

/* 하단 스택 및 자세히 보기 링크 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid var(--color-border);
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  list-style: none;
  padding: 0;
  margin: 0;
  min-width: 0;
}

/* 기술 스택 칩 — sky를 "기술" 전용 색으로 써서 result의 amber("성과")와 역할을 분리,
   테두리+연한 배경으로 카드 배경 위에서 또렷하게 도드라지게 함 */
.tech-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 10px;
  background: var(--color-point-1-soft);
  border: 1px solid rgba(56, 189, 248, 0.4);
  border-radius: 5px;
  color: var(--color-point-1);
  white-space: nowrap;
}

.tech-tag.more {
  color: var(--color-point-2);
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.4);
}

.more-link {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
  transition: color 0.2s ease;
}

.prompt {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  color: var(--color-point-1);
}

.project-card:hover .more-link {
  color: var(--color-point-1);
}

.arrow {
  display: inline-block;
  font-size: 15px;
  transition: transform 0.2s ease;
}
</style>
