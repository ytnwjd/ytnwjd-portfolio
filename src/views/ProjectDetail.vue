<!-- src/views/ProjectDetail.vue -->
<!-- 프로젝트 상세 — "면접관이 읽는 엔지니어링 케이스 스터디" 구성.
     히어로(한 줄 소개·메타) → TL;DR(문제·프로젝트 개요) → 고정 탭 →
     배경 → 담당 역할 → 성과 → 아키텍처·설계 결정 → 동작 흐름 → Deep dive(트러블슈팅) → 회고 → 이전/다음.
     데이터가 없는 섹션·칸은 렌더링하지 않으므로, 프로젝트마다 채운 만큼만 노출된다.
     덩치 큰 섹션(아키텍처·동작 흐름·Deep dive)은 components/project-detail/ 로 분리했다. -->
<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { computed, nextTick, onMounted, watch } from 'vue'
import { IconArrowLeft, IconArrowRight, IconCheck } from '@tabler/icons-vue'
import projects from '@/data/projects'
import { projectGroups } from '@/data/projectGroups'
import { getTechTintStyle } from '@/data/techColors'
import { splitHeadline } from '@/utils/text'
import { useScrollSpy } from '@/composables/useScrollSpy'
import CaseSection from '@/components/project-detail/CaseSection.vue'
import ProjectArchitecture from '@/components/project-detail/ProjectArchitecture.vue'
import ProjectFlows from '@/components/project-detail/ProjectFlows.vue'
import ProjectDeepDive from '@/components/project-detail/ProjectDeepDive.vue'

const route = useRoute()
// hidden 프로젝트는 URL로 직접 들어와도 노출하지 않는다
const project = computed(() => projects.find((p) => p.slug === route.params.slug && !p.hidden))

// ── 이전 / 다음 프로젝트 ──────────────────────────────────
// PROJECTS 섹션의 그룹 순서를 그대로 따른다
const orderedProjects = computed(() => {
    const visible = projects.filter((p) => !p.hidden)
    const bySlug = Object.fromEntries(visible.map((p) => [p.slug, p]))
    const grouped = projectGroups.flatMap((g) => g.slugs.map((s) => bySlug[s]).filter(Boolean))
    const rest = visible.filter((p) => !grouped.includes(p))
    return [...grouped, ...rest]
})
const currentIndex = computed(() => orderedProjects.value.findIndex((p) => p.slug === project.value?.slug))
const prevProject = computed(() => orderedProjects.value[currentIndex.value - 1] ?? null)
const nextProject = computed(() => orderedProjects.value[currentIndex.value + 1] ?? null)

// ── TL;DR — 문제 · 프로젝트 개요 (성과는 별도 성과 섹션에서 보여준다) ──────
// 전용 필드(tldr)가 없으면 기존 필드로 채운다
const tldrCells = computed(() => {
    const p = project.value
    if (!p) return []
    return [
        { key: 'problem', label: '문제', text: p.tldr?.problem || p.background?.problem },
        { key: 'built', label: '프로젝트 개요', text: p.tldr?.built || p.summary },
    ].filter((c) => c.text)
})

// ── 회고 — { regret, next } 객체 또는 문자열 배열 모두 허용 ───────
function toList(value) {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
}

const retro = computed(() => {
    const r = project.value?.retrospective
    if (!r) return null
    if (Array.isArray(r)) return r.length ? { regret: r, next: [] } : null
    const regret = toList(r.regret)
    const next = toList(r.next)
    return regret.length || next.length ? { regret, next } : null
})

// ── 섹션 구성 & 고정 탭 ───────────────────────────────────
const sections = computed(() => {
    const p = project.value
    if (!p) return []
    return [
        { id: 'background', label: '배경', show: !!p.background },
        { id: 'role', label: '담당 역할', show: !!p.responsibilities?.length },
        { id: 'results', label: '성과', show: !!p.result?.length },
        { id: 'architecture', label: p.decisions?.length ? '설계 결정' : '아키텍처', show: !!(p.diagrams?.length || p.decisions?.length) },
        { id: 'flow', label: '동작 흐름', show: !!p.flows?.length },
        { id: 'deepdive', label: 'Deep dive', show: !!p.troubleshooting?.length },
        { id: 'retrospective', label: '회고', show: !!retro.value },
    ].filter((s) => s.show)
})

function sectionOf(id) {
    return sections.value.find((s) => s.id === id)
}

// 섹션 제목 아래 한 줄 요약 (선택) — projects.js의 sectionNotes: { role: '...', ... }
function sectionNote(id) {
    return project.value?.sectionNotes?.[id] ?? ''
}

// 기준선 = 상단 내비 + 고정 탭(52px) + scroll-margin 여백(32px)보다 조금 아래.
// 탭으로 이동한 섹션의 머리가 이 선을 넘어서야 바로 활성으로 잡힌다. (CSS --cs-tabs-height와 맞출 것)
const ACTIVE_LINE_OFFSET = 168
const { activeId: activeSectionId, scrollTo: scrollToSection, update: updateActiveSection } =
    useScrollSpy(() => sections.value.map((s) => s.id), { offset: ACTIVE_LINE_OFFSET })

// ── 성과 카드 — 모든 카드를 "헤드라인 + 설명" 같은 구성으로 ─────────
// 헤드라인 우선순위: "헤드라인 — 설명" 형식의 앞부분 → 퍼센트 → "A → B" 변화 → 기간·횟수
const RESULT_VALUE_PATTERNS = [
    /\d+(?:\.\d+)?%/,
    /\d[\d,.]*\s*[가-힣a-zA-Z]*\s*→\s*\d[\d,.]*\s*[가-힣a-zA-Z]*/,
    /\d+\s*(?:년|개월|주|명|건|개|회)/,
]

const resultCards = computed(() => {
    const cards = (project.value?.result ?? []).map((text) => {
        const { headline, rest } = splitHeadline(text)
        // 직접 적은 헤드라인이라도 숫자로 시작하면("3~4만 원") 수치 성과로 보고 앞쪽에 둔다
        if (headline) return { headline, text: rest, numeric: /^\d/.test(headline) }
        for (const pattern of RESULT_VALUE_PATTERNS) {
            const match = text.match(pattern)
            if (match) return { headline: match[0].trim(), text, numeric: true }
        }
        return { headline: null, text, numeric: false }
    })
    // 수치 성과를 앞으로 — 같은 그룹 안에서는 원래 순서 유지
    return [...cards.filter((c) => c.numeric), ...cards.filter((c) => !c.numeric)]
})

// ── 스크롤 초기화 ─────────────────────────────────────────
// 라우터의 scrollBehavior와 별개로, 이 페이지 자체에서도 맨 위로 스크롤을 강제한다.
// (다른 프로젝트 상세로 바로 이동할 땐 같은 컴포넌트가 재사용되어 onMounted가 다시
// 안 불리므로 slug 변경을 watch로 따로 잡는다.)
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
        updateActiveSection()
    },
)
</script>

<template>
    <article v-if="project" class="section project-detail">
        <div class="cs-column">
            <!-- 상단 — 목록으로 · 몇 번째 프로젝트인지 -->
            <div class="cs-topbar">
                <RouterLink :to="{ path: '/', hash: '#projects' }" replace class="back-link">
                    <IconArrowLeft :size="16" :stroke-width="2.2" />
                    프로젝트 목록
                </RouterLink>
                <span v-if="currentIndex >= 0" class="cs-counter">
                    {{ currentIndex + 1 }} / {{ orderedProjects.length }}
                </span>
            </div>

            <!-- 히어로 — 소속 · 제목 · 한 줄 소개 · 메타 · 기술 -->
            <header class="cs-hero">
                <span v-if="project.organization" class="cs-org">{{ project.organization }}</span>
                <h1 class="cs-title">{{ project.title }}</h1>
                <p v-if="project.pitch" class="cs-pitch">{{ project.pitch }}</p>

                <dl class="cs-meta">
                    <div class="cs-meta-item">
                        <dt>기간</dt>
                        <dd>{{ project.period }}</dd>
                    </div>
                    <div v-if="project.role" class="cs-meta-item">
                        <dt>역할</dt>
                        <dd>{{ project.role }}</dd>
                    </div>
                    <div v-if="project.type" class="cs-meta-item">
                        <dt>유형</dt>
                        <dd>{{ project.type }}</dd>
                    </div>
                </dl>

                <ul v-if="project.techStack?.length" class="cs-stack">
                    <li v-for="tech in project.techStack" :key="tech" class="tech-tag" :style="getTechTintStyle(tech)">
                        {{ tech }}
                    </li>
                </ul>
            </header>

            <!-- TL;DR — 첫 화면 10초 안에 무엇을 왜 만들었는지 보이도록 (성과는 아래 성과 섹션) -->
            <section v-if="tldrCells.length" class="cs-tldr" aria-label="요약"
                :style="{ '--tldr-count': tldrCells.length }">
                <div v-for="cell in tldrCells" :key="cell.key" class="tldr-card">
                    <span class="tldr-label">{{ cell.label }}</span>
                    <p class="tldr-text">{{ cell.text }}</p>
                </div>
            </section>
        </div>

        <!-- 고정 탭 — 섹션이 2개 이상일 때만. 굵은 글자 + 포인트 밑줄 탭 -->
        <nav v-if="sections.length > 1" class="cs-tabs" aria-label="페이지 목차">
            <div class="cs-tabs-inner">
                <button v-for="s in sections" :key="s.id" type="button" class="cs-tab"
                    :class="{ active: s.id === activeSectionId }" @click="scrollToSection(s.id)">
                    {{ s.label }}
                </button>
            </div>
        </nav>

        <!-- 섹션 공통 구조(CaseSection): 제목(+ 한 줄 요약) → 흰 면 본문. 한 단으로 위에서 아래로 읽힌다 -->
        <div class="cs-column cs-sections">
            <CaseSection v-if="sectionOf('background')" id="background" title="배경"
                :note="sectionNote('background')">
                <div class="cs-card">
                    <p class="cs-text">{{ project.background.problem }}</p>
                    <div v-if="project.background.goal" class="cs-goal">
                        <strong class="cs-goal-label">목표</strong>
                        <p class="cs-goal-text">{{ project.background.goal }}</p>
                    </div>
                </div>
            </CaseSection>

            <!-- 담당 역할 — 흰 면 안에서 한 줄씩, 안쪽으로 들인 구분선으로 끊는다 -->
            <CaseSection v-if="sectionOf('role')" id="role" title="담당 역할" :note="sectionNote('role')">
                <ul class="cs-rows">
                    <li v-for="(item, idx) in project.responsibilities" :key="idx" class="cs-row">
                        <span class="cs-row-icon" aria-hidden="true">
                            <IconCheck :size="14" :stroke-width="2.6" />
                        </span>
                        <span class="cs-row-body">
                            <strong v-if="splitHeadline(item).headline" class="cs-keyword">{{ splitHeadline(item).headline }}</strong>
                            <span class="cs-row-text" :class="{ 'is-sub': splitHeadline(item).headline }">{{ splitHeadline(item).rest }}</span>
                        </span>
                    </li>
                </ul>
            </CaseSection>

            <!-- 성과 — 문장마다 대표 수치를 뽑아 카드로. 수치가 없는 성과는 문장만 -->
            <CaseSection v-if="sectionOf('results')" id="results" title="성과" :note="sectionNote('results')">
                <ul class="cs-results">
                    <li v-for="(card, idx) in resultCards" :key="idx" class="cs-result">
                        <span v-if="card.headline" class="cs-result-value"
                            :class="{ 'is-text': !card.numeric }">{{ card.headline }}</span>
                        <span class="cs-result-text" :class="{ 'is-solo': !card.headline }">{{ card.text }}</span>
                    </li>
                </ul>
            </CaseSection>

            <CaseSection v-if="sectionOf('architecture')" id="architecture" :title="sectionOf('architecture').label"
                :note="sectionNote('architecture')">
                <ProjectArchitecture :project-title="project.title" :diagrams="project.diagrams ?? []"
                    :decisions="project.decisions ?? []" />
            </CaseSection>

            <CaseSection v-if="sectionOf('flow')" id="flow" title="동작 흐름" :note="sectionNote('flow')">
                <ProjectFlows :flows="project.flows" />
            </CaseSection>

            <CaseSection v-if="sectionOf('deepdive')" id="deepdive" title="Deep dive" :note="sectionNote('deepdive')">
                <!-- 다른 프로젝트로 넘어가면 새로 마운트해 첫 이슈부터 보이게 한다 -->
                <ProjectDeepDive :key="project.slug" :issues="project.troubleshooting" />
            </CaseSection>

            <!-- 회고 — 아쉬운 점 / 다시 한다면 -->
            <CaseSection v-if="sectionOf('retrospective')" id="retrospective" title="회고"
                :note="sectionNote('retrospective')">
                <div class="cs-retro">
                    <div v-if="retro.regret.length" class="cs-card">
                        <h3 class="cs-retro-label">아쉬운 점</h3>
                        <ul class="cs-retro-list">
                            <li v-for="(r, idx) in retro.regret" :key="idx">{{ r }}</li>
                        </ul>
                    </div>
                    <div v-if="retro.next.length" class="cs-card">
                        <h3 class="cs-retro-label">다시 한다면</h3>
                        <ul class="cs-retro-list">
                            <li v-for="(r, idx) in retro.next" :key="idx">{{ r }}</li>
                        </ul>
                    </div>
                </div>
            </CaseSection>

            <!-- 이전 / 다음 프로젝트 -->
            <nav v-if="prevProject || nextProject" class="cs-pager" aria-label="다른 프로젝트">
                <RouterLink v-if="prevProject" :to="{ name: 'project-detail', params: { slug: prevProject.slug } }"
                    class="cs-pager-link">
                    <span class="cs-pager-label"><IconArrowLeft :size="14" :stroke-width="2.2" /> 이전 프로젝트</span>
                    <span class="cs-pager-title">{{ prevProject.title }}</span>
                </RouterLink>
                <span v-else class="cs-pager-empty"></span>
                <RouterLink v-if="nextProject" :to="{ name: 'project-detail', params: { slug: nextProject.slug } }"
                    class="cs-pager-link cs-pager-next">
                    <span class="cs-pager-label">다음 프로젝트 <IconArrowRight :size="14" :stroke-width="2.2" /></span>
                    <span class="cs-pager-title">{{ nextProject.title }}</span>
                </RouterLink>
            </nav>
        </div>
    </article>

    <section v-else class="section empty-state">
        <p class="empty-text">해당 프로젝트 정보를 찾을 수 없습니다.</p>
        <RouterLink :to="{ path: '/', hash: '#projects' }" replace class="back-link">
            <IconArrowLeft :size="16" :stroke-width="2.2" />
            프로젝트 목록으로 돌아가기
        </RouterLink>
    </section>
</template>

<style scoped>
/* ── 레이아웃 ───────────────────────────────────────────── */
/* 회색 바탕 위에 흰 면들을 한 단으로 쌓는다.
   --cs-width: 케이스 스터디 본문 폭 — 한 줄이 너무 길지 않게 (content-width 안쪽)
   --cs-tabs-height: 고정 탭 높이 — scroll-spy 기준선·CaseSection의 scroll-margin 계산에 같이 쓴다 */
.project-detail {
    --cs-width: 800px;
    --cs-tabs-height: 52px;
    --cs-hover-bg: color-mix(in srgb, var(--color-surface), var(--color-bg-alt) 55%);
    /* 전역 .section(홈 섹션용 넓은 좌우 여백·하단 구분선)을 이 페이지에서는 덮어쓴다 —
       고정 탭이 --gutter만큼 좌우로 늘어나므로 여백도 --gutter로 맞춘다 */
    max-width: none;
    padding-block: var(--space-8) 120px;
    padding-inline: var(--gutter);
    border-bottom: none;
    /* 한글이 단어 중간에서 끊기지 않게 ("전/면" → "전면") */
    word-break: keep-all;
}

.cs-column {
    max-width: var(--cs-width);
    margin: 0 auto;
}

.cs-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-8);
}

/* 뒤로가기 — 테두리 없는 텍스트 버튼. 글자 시작선을 본문과 맞추려고 왼쪽 패딩만큼 당긴다 */
.back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    margin-left: calc(var(--space-3) * -1);
    padding: 0 var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--t6);
    line-height: var(--t6-lh);
    font-weight: 600;
    color: var(--color-text-muted);
    transition:
        background-color 0.15s var(--ease),
        color 0.15s var(--ease),
        transform 0.15s var(--ease);
}

.back-link:hover {
    background: var(--color-bg-alt);
    color: var(--color-text);
}

.back-link:active {
    transform: scale(var(--press-scale));
}

.cs-counter {
    font-size: var(--t7);
    line-height: var(--t7-lh);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-faint);
}

/* ── 히어로 ─────────────────────────────────────────────── */
.cs-org {
    display: block;
    margin-bottom: var(--space-2);
    font-size: var(--t6);
    line-height: var(--t6-lh);
    font-weight: 600;
    color: var(--color-text-muted);
}

.cs-title {
    font-size: var(--t-display);
    font-weight: 700;
    line-height: 1.27;
    letter-spacing: -0.02em;
    color: var(--color-text);
}

.cs-pitch {
    margin-top: var(--space-3);
    font-size: var(--t4);
    line-height: var(--t4-lh);
    color: var(--color-text-muted);
}

.cs-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-6);
    margin-top: var(--space-6);
}

.cs-meta-item {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
}

.cs-meta dt {
    font-size: var(--t6);
    line-height: var(--t6-lh);
    font-weight: 400;
    color: var(--color-text-faint);
}

.cs-meta dd {
    font-size: var(--t6);
    line-height: var(--t6-lh);
    font-weight: 600;
    color: var(--color-text);
}

.cs-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: var(--space-5);
}

/* 기술 태그 — 브랜드 색을 옅게 깐 작은 칩 */
.tech-tag {
    padding: 3px var(--space-2);
    border-radius: var(--radius-xs);
    font-size: var(--t7);
    line-height: var(--t7-lh);
    font-weight: 600;
    white-space: nowrap;
}

/* ── TL;DR ──────────────────────────────────────────────── */
.cs-tldr {
    display: grid;
    grid-template-columns: repeat(var(--tldr-count, 2), minmax(0, 1fr));
    gap: var(--space-3);
    margin-top: var(--space-10);
}

.tldr-card {
    padding: var(--space-6);
    background: var(--color-surface);
    box-shadow: var(--card-shadow);
    border-radius: var(--radius-lg);
}

.tldr-label {
    display: block;
    margin-bottom: var(--space-2);
    font-size: var(--t6);
    line-height: var(--t6-lh);
    font-weight: 600;
    color: var(--color-accent);
}

.tldr-text {
    font-size: var(--t5);
    line-height: var(--t5-lh);
    color: var(--color-text);
}

@media (max-width: 760px) {
    .cs-tldr {
        grid-template-columns: minmax(0, 1fr);
    }
}

/* ── 고정 탭 — 굵은 글자 + 포인트 밑줄 ─────────────────────── */
/* .section의 좌우 여백(gutter)까지 바탕색으로 덮어, 스크롤되는 본문이 탭 옆으로 비치지 않게 한다 */
.cs-tabs {
    position: sticky;
    top: var(--nav-height);
    z-index: 20;
    margin: var(--space-12) calc(var(--gutter) * -1) 0;
    background: var(--color-bg);
}

.cs-tabs-inner {
    display: flex;
    gap: var(--space-6);
    max-width: calc(var(--cs-width) + var(--gutter) * 2);
    height: var(--cs-tabs-height);
    margin: 0 auto;
    padding: 0 var(--gutter);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    /* 탭 줄 아래 얇은 바닥선 — 활성 밑줄이 이 선 위에 얹힌다 */
    background:
        linear-gradient(var(--color-border), var(--color-border)) var(--gutter) 100% /
        calc(100% - var(--gutter) * 2) 1px no-repeat;
}

.cs-tabs-inner::-webkit-scrollbar {
    display: none;
}

.cs-tab {
    position: relative;
    flex-shrink: 0;
    height: 100%;
    padding: 0 2px;
    font-size: var(--t5);
    line-height: var(--t5-lh);
    font-weight: 600;
    white-space: nowrap;
    color: var(--color-text-faint);
    transition: color 0.15s var(--ease);
}

.cs-tab::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    border-radius: 2px;
    background: var(--color-accent);
    transform: scaleX(0);
    transition: transform 0.2s var(--ease);
}

.cs-tab:hover {
    color: var(--color-text-muted);
}

.cs-tab.active {
    color: var(--color-text);
}

.cs-tab.active::after {
    transform: scaleX(1);
}

.cs-tab:focus-visible {
    outline-offset: -2px;
}

/* ── 섹션 묶음 — 섹션 사이는 넉넉히 ───────────────────────── */
.cs-sections {
    display: flex;
    flex-direction: column;
    gap: 80px;
    padding-top: var(--space-12);
}

/* 배경·회고에 쓰는 흰 면 */
.cs-card {
    padding: var(--space-8);
    background: var(--color-surface);
    box-shadow: var(--card-shadow);
    border-radius: var(--radius-xl);
}

/* ── 배경 ───────────────────────────────────────────────── */
.cs-text {
    font-size: var(--t5);
    line-height: 1.75;
    color: var(--color-text);
}

/* 흰 면 안의 목표 — 회색 면으로 한 단계 들어가 보이게 */
.cs-goal {
    margin-top: var(--space-6);
    padding: var(--space-4) var(--space-5);
    background: var(--color-bg);
    border-radius: var(--radius-md);
}

.cs-goal-label {
    display: block;
    margin-bottom: var(--space-1);
    font-size: var(--t7);
    line-height: var(--t7-lh);
    font-weight: 600;
    color: var(--color-accent);
}

.cs-goal-text {
    font-size: var(--t6);
    line-height: var(--t6-lh);
    color: var(--color-text);
}

/* ── 담당 역할 — 흰 면 안의 목록, 구분선은 좌우를 들여서 ────────── */
.cs-rows {
    padding: var(--space-2) 0;
    background: var(--color-surface);
    box-shadow: var(--card-shadow);
    border-radius: var(--radius-xl);
}

.cs-row {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-5) var(--space-8);
}

.cs-row + .cs-row::before {
    content: '';
    position: absolute;
    top: 0;
    left: var(--space-8);
    right: var(--space-8);
    height: 1px;
    background: var(--color-bg-alt);
}

/* 체크 아이콘은 옅은 포인트 원 안에 — 첫 줄 글자 높이 가운데에 맞춘다 */
.cs-row-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    margin-top: 2px;
    border-radius: 50%;
    background: var(--color-accent-soft);
    color: var(--color-accent);
}

.cs-row-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.cs-keyword {
    font-size: var(--t5);
    line-height: var(--t5-lh);
    font-weight: 700;
    color: var(--color-text);
}

.cs-row-text {
    font-size: var(--t5);
    line-height: var(--t5-lh);
    color: var(--color-text);
}

.cs-row-text.is-sub {
    font-size: var(--t6);
    line-height: var(--t6-lh);
    color: var(--color-text-muted);
}

/* ── 성과 — 큰 수치 카드 ───────────────────────────────────── */
/* 카드 수와 상관없이 줄마다 본문 폭을 꽉 채운다
   (grid auto-fill은 빈 칸이 남으므로 flex-wrap + grow로 나눠 가진다) */
.cs-results {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
}

.cs-result {
    flex: 1 1 240px;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-6);
    background: var(--color-surface);
    box-shadow: var(--card-shadow);
    border-radius: var(--radius-lg);
}

.cs-result-value {
    font-size: var(--t2);
    line-height: var(--t2-lh);
    font-weight: 700;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    color: var(--color-accent);
}

/* 수치가 아닌 헤드라인은 색 없이 한 단계 작게 — 포인트 색은 숫자에만 */
.cs-result-value.is-text {
    font-size: var(--t4);
    line-height: var(--t4-lh);
    color: var(--color-text);
}

.cs-result-text {
    font-size: var(--t6);
    line-height: var(--t6-lh);
    color: var(--color-text-muted);
}

.cs-result-text.is-solo {
    font-size: var(--t5);
    line-height: var(--t5-lh);
    color: var(--color-text);
}

/* ── 회고 ───────────────────────────────────────────────── */
.cs-retro {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: var(--space-3);
}

.cs-retro .cs-card {
    padding: var(--space-6);
    border-radius: var(--radius-lg);
}

.cs-retro-label {
    margin-bottom: var(--space-3);
    font-size: var(--t5);
    line-height: var(--t5-lh);
    font-weight: 700;
    color: var(--color-text);
}

.cs-retro-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.cs-retro-list li {
    position: relative;
    padding-left: var(--space-4);
    font-size: var(--t6);
    line-height: var(--t6-lh);
    color: var(--color-text);
}

.cs-retro-list li::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 10px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--color-text-faint);
}

/* ── 이전 / 다음 프로젝트 — 흰 카드 두 장 ─────────────────── */
.cs-pager {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
}

.cs-pager-link {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
    padding: var(--space-5) var(--space-6);
    background: var(--color-surface);
    box-shadow: var(--card-shadow);
    border-radius: var(--radius-lg);
    transition:
        background-color 0.15s var(--ease),
        transform 0.15s var(--ease);
}

.cs-pager-link:hover {
    box-shadow: var(--card-shadow-hover);
    background: var(--cs-hover-bg);
}

.cs-pager-link:active {
    transform: scale(var(--press-scale));
}

.cs-pager-next {
    align-items: flex-end;
    text-align: right;
}

.cs-pager-label {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--t7);
    line-height: var(--t7-lh);
    font-weight: 600;
    color: var(--color-text-faint);
}

.cs-pager-title {
    font-size: var(--t5);
    line-height: var(--t5-lh);
    font-weight: 700;
    color: var(--color-text);
}

/* ── 모바일 — 흰 면 안쪽 여백을 한 단계 줄이고, 섹션 간격도 좁힌다
   (분리한 섹션 컴포넌트들의 모바일 규칙은 각 컴포넌트 안에 있다) ── */
@media (max-width: 600px) {
    .project-detail {
        padding-block: var(--space-4) 72px;
    }

    .cs-topbar {
        margin-bottom: var(--space-6);
    }

    .cs-pitch {
        font-size: var(--t5);
        line-height: var(--t5-lh);
    }

    .cs-tabs {
        margin-top: var(--space-10);
    }

    .cs-tabs-inner {
        gap: var(--space-5);
    }

    .cs-tab {
        font-size: var(--t6);
    }

    .cs-sections {
        gap: 56px;
        padding-top: var(--space-10);
    }

    .cs-card,
    .tldr-card,
    .cs-result,
    .cs-retro .cs-card {
        padding: var(--space-5);
    }

    .cs-card,
    .cs-rows {
        border-radius: var(--radius-lg);
    }

    .cs-row {
        gap: var(--space-3);
        padding: var(--space-4) var(--space-5);
    }

    .cs-row + .cs-row::before {
        left: var(--space-5);
        right: var(--space-5);
    }

    .cs-text {
        font-size: var(--t6);
    }

    .cs-pager {
        grid-template-columns: minmax(0, 1fr);
    }

    .cs-pager-empty {
        display: none;
    }
}

/* ── 빈 상태 ────────────────────────────────────────────── */
.empty-state {
    padding: 120px var(--gutter);
    text-align: center;
}

.empty-state .back-link {
    margin-left: 0;
}

.empty-text {
    margin-bottom: var(--space-4);
    font-size: var(--t5);
    line-height: var(--t5-lh);
    color: var(--color-text-muted);
}

@media (prefers-reduced-motion: reduce) {
    .cs-tab::after,
    .cs-pager-link {
        transition: none;
    }
}
</style>
