<!-- src/views/ProjectDetail.vue -->
<!-- 섹션 순서: 배경·목적 → 역할·성과 → 아키텍처(+설계 이유) → 동작 흐름 → 트러블슈팅 → 회고.
     데이터가 없는 섹션은 렌더링하지 않으므로, 프로젝트마다 채운 만큼만 노출된다. -->
<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { IconArrowLeft, IconCheck, IconStar, IconX } from '@tabler/icons-vue'
import projects from '@/data/projects'
import { getTechColor, getTagTextColor } from '@/data/techColors'

const route = useRoute()
// hidden 프로젝트는 URL로 직접 들어와도 노출하지 않는다
const project = computed(() => projects.find((p) => p.slug === route.params.slug && !p.hidden))

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
        renderFlows()
        updateActiveSection()
    },
)

// result 항목 중 숫자/퍼센트가 들어간 정량적 성과만 뽑아 상단 스탯 카드로 승격
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

// ── 섹션 구성 ─────────────────────────────────────────────
// 각 섹션의 노출 여부를 한곳에서 판단하고, 같은 목록으로 사이드바 목차도 만든다
const hasBackground = computed(() => !!(project.value?.background || project.value?.summary))
const hasRole = computed(() => !!(project.value?.responsibilities?.length || project.value?.result?.length))
const hasArchitecture = computed(() => !!project.value?.diagrams?.length)
const hasFlows = computed(() => !!project.value?.flows?.length)
const hasTroubleshooting = computed(() => !!project.value?.troubleshooting?.length)
const hasRetrospective = computed(() => !!project.value?.retrospective?.length)

const sections = computed(() =>
    [
        { id: 'background', label: project.value?.background ? '배경 · 목적' : '프로젝트 개요', show: hasBackground.value },
        { id: 'role', label: '담당 역할 · 성과', show: hasRole.value },
        { id: 'architecture', label: '시스템 아키텍처', show: hasArchitecture.value },
        { id: 'flow', label: '동작 흐름', show: hasFlows.value },
        { id: 'troubleshooting', label: '트러블슈팅', show: hasTroubleshooting.value },
        { id: 'retrospective', label: '회고 · 한계', show: hasRetrospective.value },
    ].filter((s) => s.show),
)

// ── 사이드바 목차 (scroll-spy) ─────────────────────────────
// 뷰포트 상단 기준선을 통과한 마지막 섹션을 현재 위치로 본다 (TopNav와 같은 방식)
const activeSectionId = ref(null)
const ACTIVE_LINE_OFFSET = 160

function updateActiveSection() {
    let current = sections.value[0]?.id ?? null
    for (const { id } of sections.value) {
        const el = document.getElementById(`section-${id}`)
        if (el && el.getBoundingClientRect().top - ACTIVE_LINE_OFFSET <= 0) current = id
    }
    activeSectionId.value = current
}

function scrollToSection(id) {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', updateActiveSection))

// ── 동작 흐름 (Mermaid) ───────────────────────────────────
// mermaid는 용량이 커서 이 페이지에서, 그것도 flows가 있을 때만 동적으로 불러온다
const flowSvgs = ref([])
let mermaidInstance = null
let renderSeq = 0

async function renderFlows() {
    const flows = project.value?.flows ?? []
    const seq = ++renderSeq
    flowSvgs.value = flows.map(() => null)
    if (!flows.length) return

    if (!mermaidInstance) {
        const { default: mermaid } = await import('mermaid')
        mermaid.initialize({
            startOnLoad: false,
            theme: 'neutral',
            fontFamily: getComputedStyle(document.body).fontFamily,
            sequence: { useMaxWidth: true, mirrorActors: false },
        })
        mermaidInstance = mermaid
    }

    const rendered = await Promise.all(
        flows.map(async (flow, idx) => {
            try {
                const { svg } = await mermaidInstance.render(`flow-${seq}-${idx}`, flow.mermaid)
                return svg
            } catch (err) {
                console.error('[ProjectDetail] mermaid render failed:', err)
                return ''
            }
        }),
    )
    // 렌더 도중 다른 프로젝트로 이동했다면 늦게 끝난 결과는 버린다
    if (seq === renderSeq) flowSvgs.value = rendered
}

onMounted(renderFlows)

// ── 기타 ─────────────────────────────────────────────────
function tagStyle(tech) {
    const match = getTechColor(tech)
    return {
        backgroundColor: match.color,
        borderColor: match.color,
        color: getTagTextColor(match.light),
    }
}

function publicAsset(path) {
    return `${import.meta.env.BASE_URL}${path}`
}

// 다이어그램 클릭 시 원본 크기로 확인할 수 있는 라이트박스
const lightboxImage = ref(null)

function openLightbox(src, alt) {
    lightboxImage.value = { src, alt }
}

function closeLightbox() {
    lightboxImage.value = null
}

function handleLightboxKeydown(e) {
    if (e.key === 'Escape') closeLightbox()
}

onMounted(() => window.addEventListener('keydown', handleLightboxKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleLightboxKeydown))
</script>

<template>
    <section v-if="project" class="section project-detail">
        <div class="detail-layout">
            <!-- 사이드바 — 돌아가기 · 메타 · 기술 스택 · 페이지 목차. 데스크탑에서는 sticky -->
            <aside class="detail-sidebar">
                <RouterLink :to="{ path: '/', hash: '#projects' }" replace class="back-link">
                    <IconArrowLeft :size="14" :stroke-width="2.5" />
                    목록으로
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
                    <li v-if="project.role" class="sidebar-meta-row">
                        <span class="sidebar-meta-label">Role</span>
                        <span class="sidebar-meta-value">{{ project.role }}</span>
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

                <nav v-if="sections.length > 1" class="sidebar-toc" aria-label="페이지 목차">
                    <span class="sidebar-tech-title">On this page</span>
                    <button v-for="s in sections" :key="s.id" type="button" class="toc-item"
                        :class="{ active: s.id === activeSectionId }" @click="scrollToSection(s.id)">
                        {{ s.label }}
                    </button>
                </nav>
            </aside>

            <div class="detail-main">
                <h1 class="project-title">{{ project.title }}</h1>

                <div v-if="statCards.length" class="stat-cards">
                    <div v-for="(stat, idx) in statCards" :key="idx" class="stat-card">
                        <span class="stat-value">{{ stat.value }}</span>
                        <span class="stat-description">{{ stat.description }}</span>
                    </div>
                </div>

                <!-- 1. 배경 · 목적 — background가 없으면 기존 summary를 개요로 대신 노출 -->
                <div v-if="hasBackground" id="section-background" class="content-block">
                    <h2 class="block-title">{{ project.background ? '배경 · 목적' : '프로젝트 개요' }}</h2>
                    <div v-if="project.background" class="background-grid">
                        <div class="background-box">
                            <span class="box-label">Why · 문제</span>
                            <p class="box-text">{{ project.background.problem }}</p>
                        </div>
                        <div class="background-box">
                            <span class="box-label">Goal · 목표</span>
                            <p class="box-text">{{ project.background.goal }}</p>
                        </div>
                    </div>
                    <p v-else class="summary-text summary-box">{{ project.summary }}</p>
                </div>

                <!-- 2. 담당 역할 · 성과 — 다이어그램보다 먼저 "내가 한 일"을 보여준다 -->
                <div v-if="hasRole" id="section-role" class="content-block">
                    <h2 class="block-title">담당 역할 · 성과</h2>
                    <ul v-if="project.responsibilities?.length" class="detail-list">
                        <li v-for="(item, idx) in project.responsibilities" :key="idx" class="detail-item">
                            <IconCheck class="bullet bullet-icon" :size="17" :stroke-width="2" />
                            <span class="text">{{ item }}</span>
                        </li>
                    </ul>
                    <ul v-if="project.result?.length" class="detail-list result-list">
                        <li v-for="(res, idx) in project.result" :key="idx" class="detail-item">
                            <IconStar class="bullet bullet-icon" :size="17" :stroke-width="2" />
                            <span class="text">{{ res }}</span>
                        </li>
                    </ul>
                </div>

                <!-- 3. 시스템 아키텍처 — 다이어그램마다 "왜 이렇게 설계했나"를 notes로 덧붙인다 -->
                <div v-if="hasArchitecture" id="section-architecture" class="content-block">
                    <h2 class="block-title">시스템 아키텍처</h2>
                    <div class="diagram-list">
                        <div v-for="(diagram, idx) in project.diagrams" :key="idx" class="diagram-item">
                            <span class="diagram-label">{{ diagram.title }}</span>
                            <div class="architecture-box">
                                <img :src="publicAsset(diagram.image)" :alt="`${project.title} ${diagram.title}`"
                                    class="architecture-image"
                                    @click="openLightbox(publicAsset(diagram.image), `${project.title} ${diagram.title}`)" />
                            </div>
                            <ol v-if="diagram.notes?.length" class="design-notes">
                                <li v-for="(note, nIdx) in diagram.notes" :key="nIdx" class="design-note">
                                    <span class="design-note-index">{{ nIdx + 1 }}</span>
                                    <span class="design-note-text">{{ note }}</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>

                <!-- 4. 동작 흐름 — Mermaid 시퀀스 다이어그램 -->
                <div v-if="hasFlows" id="section-flow" class="content-block">
                    <h2 class="block-title">동작 흐름</h2>
                    <div class="diagram-list">
                        <div v-for="(flow, idx) in project.flows" :key="idx" class="diagram-item">
                            <span class="diagram-label">{{ flow.title }}</span>
                            <div class="architecture-box flow-box">
                                <div v-if="flowSvgs[idx]" class="flow-svg" v-html="flowSvgs[idx]"></div>
                                <p v-else-if="flowSvgs[idx] === ''" class="flow-placeholder">다이어그램을 그리지 못했습니다.</p>
                                <p v-else class="flow-placeholder">다이어그램을 불러오는 중…</p>
                            </div>
                            <p v-if="flow.description" class="flow-description">{{ flow.description }}</p>
                        </div>
                    </div>
                </div>

                <!-- 5. 트러블슈팅 — 관련 개념 → 문제 → 원인 → 해결 → 코드·로그 → 결과 -->
                <div v-if="hasTroubleshooting" id="section-troubleshooting" class="content-block">
                    <h2 class="block-title">트러블슈팅</h2>
                    <div class="trouble-list">
                        <article v-for="(item, idx) in project.troubleshooting" :key="idx" class="trouble-card">
                            <div v-if="project.troubleshooting.length > 1 || item.title" class="trouble-head">
                                <span v-if="project.troubleshooting.length > 1" class="trouble-index">이슈 {{ idx + 1 }}</span>
                                <h3 v-if="item.title" class="trouble-title">{{ item.title }}</h3>
                            </div>
                            <div v-if="item.concept" class="trouble-section trouble-concept">
                                <span class="trouble-label">관련 개념</span>
                                <p class="trouble-text">{{ item.concept }}</p>
                            </div>
                            <div class="trouble-section">
                                <span class="trouble-label">문제 상황</span>
                                <p class="trouble-text">{{ item.problem }}</p>
                            </div>
                            <div v-if="item.cause" class="trouble-section">
                                <span class="trouble-label">원인 분석</span>
                                <p class="trouble-text">{{ item.cause }}</p>
                            </div>
                            <div class="trouble-section">
                                <span class="trouble-label">{{ item.outcome ? '해결' : '해결 및 결과' }}</span>
                                <p class="trouble-text">{{ item.solution }}</p>
                            </div>
                            <div v-if="item.code?.snippet" class="trouble-section">
                                <span class="trouble-label">{{ item.code.label || '코드' }}</span>
                                <pre class="trouble-code"><code>{{ item.code.snippet }}</code></pre>
                            </div>
                            <div v-if="item.outcome" class="trouble-section">
                                <span class="trouble-label">결과</span>
                                <p class="trouble-text">{{ item.outcome }}</p>
                            </div>
                        </article>
                    </div>
                </div>

                <!-- 6. 회고 · 한계 — 아쉬운 점과 다시 한다면 바꿀 것 -->
                <div v-if="hasRetrospective" id="section-retrospective" class="content-block">
                    <h2 class="block-title">회고 · 한계</h2>
                    <ul class="retro-list">
                        <li v-for="(item, idx) in project.retrospective" :key="idx" class="retro-item">{{ item }}</li>
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

    <!-- Diagram Lightbox -->
    <Teleport to="body">
        <div v-if="lightboxImage" class="lightbox-overlay" @click="closeLightbox">
            <button class="lightbox-close" @click.stop="closeLightbox" aria-label="닫기">
                <IconX :size="22" :stroke-width="2" />
            </button>
            <img :src="lightboxImage.src" :alt="lightboxImage.alt" class="lightbox-image" @click.stop />
        </div>
    </Teleport>
</template>

<style scoped>
.project-detail {
    padding-block: 80px;
    --color-highlight-bg: #faf6ec;
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 32px;
    padding: 8px 16px;
    border: 1.5px solid var(--color-border-strong);
    border-radius: 999px;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--color-text);
    transition:
        border-color 0.2s ease,
        color 0.2s ease;
}

.back-link:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
}

/* 사이드바 안에서는 flex gap이 간격을 이미 만들어주고, 사이드바 첫 줄이 제목과
   같은 높이(grid row start)에서 시작하도록 별도 margin 없이 맞춘다 */
.detail-sidebar .back-link {
    margin-bottom: 0;
}

/* 2단 레이아웃 — 사이드바(기간·소속·유형·스택) + 메인(제목~트러블슈팅) */
.detail-layout {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 72px;
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
    font-size: clamp(34px, 3vw, 52px);
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.01em;
    margin-bottom: 32px;
    color: var(--color-ink);
}

/* Best Accomplishment와 동일한 룩앤필의 정량 성과 스탯 카드 */
.stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
}

.stat-card {
    display: flex;
    flex-direction: column;
    padding: 20px 18px;
    background: var(--color-highlight-bg);
    border: 1px solid var(--color-border);
    border-top: 3px solid var(--color-accent);
    border-radius: 8px;
}

.stat-value {
    color: var(--color-accent);
    font-size: 30px;
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
    margin-bottom: 52px;
    /* 목차로 이동 시 sticky 상단 내비게이션에 제목이 가리지 않도록 */
    scroll-margin-top: calc(var(--nav-height) + 32px);
}

.block-title {
    position: relative;
    padding-left: 14px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.02em;
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
    letter-spacing: 0.02em;
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
    cursor: zoom-in;
    transition: opacity 0.2s ease;
}

.architecture-image:hover {
    opacity: 0.85;
}

/* Diagram Lightbox */
.lightbox-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
    z-index: 1000;
}

.lightbox-image {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
    cursor: default;
}

.lightbox-close {
    position: fixed;
    top: 24px;
    right: 32px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-white);
    transition: background-color 0.2s ease;
}

.lightbox-close:hover {
    background: rgba(255, 255, 255, 0.2);
}

.summary-text {
    font-size: 17px;
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
    font-size: 16px;
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
    background: var(--color-highlight-bg);
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
    letter-spacing: 0.02em;
    color: var(--color-text-faint);
}

.trouble-text {
    font-size: 16px;
    line-height: 1.65;
    color: var(--color-text);
}

/* 배경 · 목적 — 문제(Why)와 목표(Goal)를 나란히 */
.background-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.background-box {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 22px 24px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
}

.box-label {
    font-family: var(--font-mono);
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--color-text-faint);
}

.box-text {
    font-size: 16px;
    line-height: 1.7;
    color: var(--color-text);
    word-break: keep-all;
}

@media (max-width: 700px) {
    .background-grid {
        grid-template-columns: minmax(0, 1fr);
    }
}

/* 역할 목록 다음에 오는 성과 목록은 구분선으로 한 번 끊는다 */
.detail-list + .result-list {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px dashed var(--color-border);
}

/* 설계 이유 — 다이어그램 바로 아래 번호 목록 */
.design-notes {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 6px;
}

.design-note {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 15.5px;
    line-height: 1.65;
    color: var(--color-text);
}

.design-note-index {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    margin-top: 2px;
    border-radius: 999px;
    background: var(--color-accent-soft);
    color: var(--color-accent);
    font-family: var(--font-mono);
    font-size: 11.5px;
    font-weight: 700;
}

/* 동작 흐름 (Mermaid) — 넓은 시퀀스 다이어그램은 박스 안에서만 가로 스크롤 */
.flow-box {
    padding: 16px;
    overflow-x: auto;
}

.flow-svg {
    width: 100%;
}

.flow-svg :deep(svg) {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 0 auto;
}

.flow-placeholder {
    padding: 32px 0;
    font-size: 14px;
    color: var(--color-text-faint);
}

.flow-description {
    font-size: 15.5px;
    line-height: 1.65;
    color: var(--color-text-muted);
}

/* 트러블슈팅 확장 항목 */
.trouble-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
}

.trouble-head .trouble-index {
    align-self: auto;
}

.trouble-title {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.4;
    color: var(--color-ink);
    word-break: keep-all;
}

/* 관련 개념 — 면접에서 바로 이어질 개념 질문에 대한 답을 먼저 깔아둔다 */
.trouble-concept {
    padding: 14px 16px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
}

.trouble-code {
    margin: 0;
    padding: 16px 18px;
    overflow-x: auto;
    background: #1e1e1e;
    border-radius: 8px;
    color: #e6e6e6;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.6;
    white-space: pre;
}

/* 회고 · 한계 */
.retro-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.retro-item {
    position: relative;
    padding-left: 18px;
    font-size: 16px;
    line-height: 1.65;
    color: var(--color-text);
    word-break: keep-all;
}

.retro-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.75em;
    width: 8px;
    height: 2px;
    background: var(--color-text-faint);
}

/* 사이드바 목차 */
.sidebar-toc {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-top: 20px;
    border-top: 1px solid var(--color-border);
}

.toc-item {
    padding: 6px 0 6px 12px;
    border-left: 2px solid var(--color-border);
    text-align: left;
    font-size: 13.5px;
    color: var(--color-text-muted);
    transition:
        color 0.2s ease,
        border-color 0.2s ease;
}

.toc-item:hover {
    color: var(--color-ink);
}

.toc-item.active {
    border-left-color: var(--color-accent);
    color: var(--color-ink);
    font-weight: 600;
}

/* 모바일에서는 사이드바가 본문 위로 쌓이므로 목차는 생략 */
@media (max-width: 860px) {
    .sidebar-toc {
        display: none;
    }
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
