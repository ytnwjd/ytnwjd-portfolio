<!-- src/views/ProjectDetail.vue -->
<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { computed, nextTick, onMounted, watch } from 'vue'
import { IconCheck, IconStar } from '@tabler/icons-vue'
import projects from '@/data/projects'
import { getTechColor } from '@/data/techColors'

const route = useRoute()
const project = computed(() => projects.find((p) => p.slug === route.params.slug))

// 라우터의 scrollBehavior와 별개로, 이 페이지 자체에서도 맨 위로 스크롤을 강제한다.
// (다른 프로젝트 상세로 바로 이동할 땐 같은 컴포넌트가 재사용되어 onMounted가 다시
// 안 불리므로 slug 변경을 watch로 따로 잡는다. nextTick·rAF·지연 호출을 겹쳐서,
// 다른 스크롤 보정 로직보다 항상 "마지막에" 맨 위로 고정되도록 한다.)
function resetScroll() {
    window.scrollTo(0, 0)
    requestAnimationFrame(() => {
        window.scrollTo(0, 0)
        setTimeout(() => window.scrollTo(0, 0), 100)
    })
}

onMounted(async () => {
    await nextTick()
    resetScroll()
})

watch(
    () => route.params.slug,
    async () => {
        await nextTick()
        resetScroll()
    },
)

// result 항목 중 숫자/퍼센트가 들어간 정량적 성과만 뽑아 상단 스탯 카드로 승격.
// "2년간 단독 운영..." 같은 정성적 문장은 제외하고 기존 하단 불릿에만 남긴다.
const statCards = computed(() => {
    const result = project.value?.result
    if (!result) return []
    return result
        .map((text) => {
            const match = text.match(/\d+(\.\d+)?%/)
            return match ? { value: match[0], description: text } : null
        })
        .filter(Boolean)
        .slice(0, 3)
})

function tagStyle(tech) {
    const match = getTechColor(tech)
    return {
        backgroundColor: match.color,
        borderColor: match.color,
        color: match.light ? '#1a1a1a' : '#ffffff',
    }
}

// public 자산은 base 경로(`/ytnwjd-portfolio/`)를 붙여야 배포 환경에서도 정상 로드된다
function publicAsset(path) {
    return `${import.meta.env.BASE_URL}${path}`
}
</script>

<template>
    <section v-if="project" class="section project-detail">
        <div class="detail-layout">
            <!-- 사이드바 — 돌아가기 링크를 맨 위에 두어 제목과 시작 높이를 맞추고,
                 그 아래 기간·소속·유형 메타와 기술 스택. 데스크탑에서는 sticky -->
            <aside class="detail-sidebar">
                <RouterLink :to="{ path: '/', hash: '#projects' }" replace class="back-link">
                    ← 프로젝트 목록으로 돌아가기
                </RouterLink>

                <ul class="sidebar-meta">
                    <li class="sidebar-meta-row">
                        <span class="sidebar-meta-label">Period</span>
                        <span class="sidebar-meta-value">{{ project.period }}</span>
                    </li>
                    <li v-if="project.organization" class="sidebar-meta-row">
                        <span class="sidebar-meta-label">Org.</span>
                        <span class="sidebar-meta-value">{{ project.organization }}</span>
                    </li>
                    <li v-if="project.type" class="sidebar-meta-row">
                        <span class="sidebar-meta-label">Type</span>
                        <span class="sidebar-meta-value">{{ project.type }}</span>
                    </li>
                </ul>

                <div v-if="project.techStack?.length" class="sidebar-tech">
                    <span class="sidebar-tech-title">Tech Stack</span>
                    <div class="tech-tags">
                        <span v-for="tech in project.techStack" :key="tech" class="tech-tag" :style="tagStyle(tech)">
                            {{ tech }}
                        </span>
                    </div>
                </div>
            </aside>

            <!-- 메인 컬럼 — 제목부터 트러블슈팅까지 -->
            <div class="detail-main">
                <h1 class="project-title">{{ project.title }}</h1>

                <!-- Best Accomplishment 스타일 스탯 카드 -->
                <div v-if="statCards.length" class="stat-cards">
                    <div v-for="(stat, idx) in statCards" :key="idx" class="stat-card">
                        <span class="stat-value">{{ stat.value }}</span>
                        <span class="stat-description">{{ stat.description }}</span>
                    </div>
                </div>

                <!-- Project Summary -->
                <div v-if="project.summary" class="content-block summary-box">
                    <h2 class="block-title">프로젝트 개요</h2>
                    <p class="summary-text">{{ project.summary }}</p>
                </div>

                <!-- Architecture / ERD Diagrams -->
                <div v-if="project.diagrams && project.diagrams.length" class="content-block">
                    <h2 class="block-title">시스템 다이어그램</h2>
                    <div class="diagram-list">
                        <div v-for="(diagram, idx) in project.diagrams" :key="idx" class="diagram-item">
                            <span class="diagram-label">{{ diagram.title }}</span>
                            <div class="architecture-box">
                                <img
                                    :src="publicAsset(diagram.image)"
                                    :alt="`${project.title} ${diagram.title}`"
                                    class="architecture-image"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Key Responsibilities -->
                <div v-if="project.responsibilities && project.responsibilities.length" class="content-block">
                    <h2 class="block-title">주요 담당 역할 및 성과</h2>
                    <ul class="detail-list">
                        <li v-for="(item, idx) in project.responsibilities" :key="idx" class="detail-item">
                            <IconCheck class="bullet bullet-icon" :size="17" :stroke-width="2" />
                            <span class="text">{{ item }}</span>
                        </li>
                    </ul>
                </div>

                <!-- Problem Solving & Troubleshooting -->
                <div v-if="project.troubleshooting && project.troubleshooting.length" class="content-block">
                    <h2 class="block-title">문제 해결 및 트러블슈팅</h2>
                    <div class="trouble-list">
                        <div v-for="(item, idx) in project.troubleshooting" :key="idx" class="trouble-card">
                            <span v-if="project.troubleshooting.length > 1" class="trouble-index">이슈 {{ idx + 1 }}</span>
                            <div class="trouble-section">
                                <span class="trouble-label">문제 상황</span>
                                <p class="trouble-text">{{ item.problem }}</p>
                            </div>
                            <div v-if="item.cause" class="trouble-section">
                                <span class="trouble-label">원인 분석</span>
                                <p class="trouble-text">{{ item.cause }}</p>
                            </div>
                            <div class="trouble-section">
                                <span class="trouble-label">해결 및 결과</span>
                                <p class="trouble-text">{{ item.solution }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Key Results / Output -->
                <div v-if="project.result && project.result.length" class="content-block">
                    <h2 class="block-title">주요 성과 및 결과</h2>
                    <ul class="detail-list result-list">
                        <li v-for="(res, idx) in project.result" :key="idx" class="detail-item">
                            <IconStar class="bullet bullet-icon" :size="17" :stroke-width="2" />
                            <span class="text">{{ res }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <section v-else class="section empty-state">
        <p class="empty-text">해당 프로젝트 정보를 찾을 수 없습니다.</p>
        <RouterLink :to="{ path: '/', hash: '#projects' }" replace class="back-link">
            ← 프로젝트 목록으로 돌아가기
        </RouterLink>
    </section>
</template>

<style scoped>
.project-detail {
    max-width: 980px;
}

.back-link {
    display: inline-block;
    margin-bottom: 32px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-muted);
    transition: color 0.2s ease;
}

.back-link:hover {
    color: var(--color-ink);
}

/* 사이드바 안에서는 flex gap이 간격을 이미 만들어주고, 사이드바 첫 줄이 제목과
   같은 높이(grid row start)에서 시작하도록 별도 margin 없이 맞춘다 */
.detail-sidebar .back-link {
    margin-bottom: 0;
}

/* 2단 레이아웃 — 사이드바(기간·소속·유형·스택) + 메인(제목~트러블슈팅) */
.detail-layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 56px;
    align-items: start;
}

.detail-sidebar {
    position: sticky;
    top: calc(var(--nav-height) + 32px);
    display: flex;
    flex-direction: column;
    gap: 28px;
}

.sidebar-meta {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--color-border);
}

.sidebar-meta-row {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.sidebar-meta-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-faint);
}

.sidebar-meta-value {
    font-size: 14.5px;
    color: var(--color-text);
    word-break: keep-all;
}

.sidebar-tech-title {
    display: block;
    margin-bottom: 12px;
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-faint);
}

.detail-main {
    min-width: 0;
    max-width: 680px;
}

@media (max-width: 860px) {
    .detail-layout {
        grid-template-columns: 1fr;
        gap: 40px;
    }

    .detail-sidebar {
        position: static;
    }

    .detail-main {
        max-width: none;
    }
}

.project-title {
    font-size: 34px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.01em;
    margin-bottom: 28px;
    color: var(--color-ink);
}

/* Best Accomplishment와 동일한 룩앤필의 정량 성과 스탯 카드 */
.stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1px;
    margin-bottom: 32px;
    background: var(--color-border);
    border: 1px solid var(--color-border);
}

.stat-card {
    display: flex;
    flex-direction: column;
    padding: 20px 18px;
    background: var(--color-bg-alt);
    border-top: 3px solid var(--color-accent);
    border-radius: 8px;
}

.stat-value {
    color: var(--color-accent);
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.01em;
}

.stat-description {
    margin-top: 6px;
    color: var(--color-text-muted);
    font-size: 13px;
    line-height: 1.5;
}

/* Content Block */
.content-block {
    margin-bottom: 40px;
}

.block-title {
    position: relative;
    padding-left: 14px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 18px;
    color: var(--color-ink);
    font-family: var(--font-mono);
}

.block-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 3px;
    height: 14px;
    background: var(--color-accent);
    border-radius: 2px;
    transform: translateY(-50%);
}

/* Summary Box */
.summary-box {
    padding: 24px 28px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
}

/* Architecture / ERD Diagrams */
.diagram-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.diagram-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.diagram-label {
    font-family: var(--font-mono);
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-faint);
}

.architecture-box {
    padding: 8px;
    border: 1px solid var(--color-border);
    background-color: var(--color-surface);
    border-radius: 12px;
    display: flex;
    justify-content: center;
}

.architecture-image {
    max-width: 100%;
    height: auto;
}

.summary-text {
    font-size: 15.5px;
    line-height: 1.75;
    color: var(--color-text);
}

/* Tech Tags (사이드바) */
.tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.tech-tag {
    font-size: 12px;
    font-weight: 600;
    padding: 5px 11px;
    border: 1px solid transparent;
    border-radius: 999px;
    white-space: nowrap;
}

/* Responsibilities & Results List */
.detail-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.detail-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 15px;
    line-height: 1.65;
    color: var(--color-text);
}

.bullet {
    flex-shrink: 0;
    color: var(--color-accent);
}

/* 아웃라인 별 아이콘 — 텍스트 첫 줄과 눈높이가 맞도록 살짝 내리고,
   채움 없이 포인트 컬러 선만 둘러 다른 UI 요소들과 톤을 맞춘다 */
.bullet-icon {
    margin-top: 2px;
    color: var(--color-accent);
}

/* Troubleshooting Cards */
.trouble-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.trouble-card {
    position: relative;
    padding: 24px 28px;
    background: #faf6ec;
    border-left: 3px solid var(--color-accent);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    gap: 18px;
}

/* 트러블슈팅이 2건 이상일 때만 "이슈 N" 배지로 항목을 구분 */
.trouble-index {
    align-self: flex-start;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 3px 11px;
    border: 1px solid var(--color-accent);
    border-radius: 999px;
    background: var(--color-accent-soft);
    color: var(--color-accent);
}

.trouble-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.trouble-label {
    font-family: var(--font-mono);
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-faint);
}

.trouble-text {
    font-size: 15px;
    line-height: 1.65;
    color: var(--color-text);
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 120px 20px;
}

.empty-text {
    font-size: 16px;
    color: var(--color-text-muted);
    margin-bottom: 16px;
}
</style>
