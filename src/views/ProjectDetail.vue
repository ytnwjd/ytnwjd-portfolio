<!-- src/views/ProjectDetail.vue -->
<!-- 프로젝트 상세 — "면접관이 읽는 엔지니어링 케이스 스터디" 구성.
     히어로(한 줄 소개·메타) → TL;DR(문제·프로젝트 개요) → 고정 탭 →
     배경 → 담당 역할 → 아키텍처·설계 결정 → 동작 흐름 → Deep dive(트러블슈팅) → 회고 → 이전/다음.
     데이터가 없는 섹션·칸은 렌더링하지 않으므로, 프로젝트마다 채운 만큼만 노출된다. -->
<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { IconArrowLeft, IconArrowRight, IconCheck, IconX } from '@tabler/icons-vue'
import projects from '@/data/projects'
import { projectGroups } from '@/data/projectGroups'
import { getTechTintStyle } from '@/data/techColors'

const route = useRoute()
// hidden 프로젝트는 URL로 직접 들어와도 노출하지 않는다
const project = computed(() => projects.find((p) => p.slug === route.params.slug && !p.hidden))

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
        renderFlows()
        updateActiveSection()
    },
)

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

function pad2(n) {
    return String(n).padStart(2, '0')
}

// ── TL;DR — 문제 · 프로젝트 개요 (성과는 별도 성과 섹션에서 보여준다) ──────
// 문제 · 프로젝트 개요 · 성과 — 전용 필드(tldr)가 없으면 기존 필드로 채운다

const tldrCells = computed(() => {
    const p = project.value
    if (!p) return []
    return [
        { key: 'problem', label: '문제', text: p.tldr?.problem || p.background?.problem },
        { key: 'built', label: '프로젝트 개요', text: p.tldr?.built || p.summary },
    ].filter((c) => c.text)
})

// ── 담당 역할 — "키워드 — 설명" 형식이면 키워드를 굵게 ─────────
function splitKeyword(text) {
    const match = text.match(/^(.{1,30}?)\s+—\s+(.+)$/)
    return match ? { keyword: match[1], rest: match[2] } : { keyword: null, rest: text }
}

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

// ── Deep dive 이슈 탭 ─────────────────────────────────────
// 이슈가 여러 개면 탭으로 하나씩 보여주고, 이동 방향에 맞춰 패널이 좌우로 밀려난다
const issues = computed(() => project.value?.troubleshooting ?? [])
const activeIssue = ref(0)
const issueDirection = ref('issue-next')
const issueTabEls = []
const currentIssue = computed(() => issues.value[activeIssue.value] ?? {})

function selectIssue(idx) {
    if (idx < 0 || idx >= issues.value.length || idx === activeIssue.value) return
    issueDirection.value = idx > activeIssue.value ? 'issue-next' : 'issue-prev'
    activeIssue.value = idx
}

// 탭 목록 안에서 ←/→ 로 이동 (WAI-ARIA tabs 패턴)
function handleIssueKeydown(e) {
    const last = issues.value.length - 1
    let next = null
    if (e.key === 'ArrowRight') next = activeIssue.value === last ? 0 : activeIssue.value + 1
    else if (e.key === 'ArrowLeft') next = activeIssue.value === 0 ? last : activeIssue.value - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next === null) return
    e.preventDefault()
    selectIssue(next)
    nextTick(() => issueTabEls[next]?.focus())
}

// 다른 프로젝트로 넘어가면 첫 이슈부터
watch(
    () => route.params.slug,
    () => {
        issueDirection.value = 'issue-none'
        activeIssue.value = 0
    },
)

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
    ]
        .filter((s) => s.show)
        .map((s, i) => ({ ...s, number: pad2(i + 1) }))
})

function sectionOf(id) {
    return sections.value.find((s) => s.id === id)
}

// 섹션 왼쪽 열에 붙는 한 줄 요약 (선택) — projects.js의 sectionNotes: { role: '...', ... }
function sectionNote(id) {
    return project.value?.sectionNotes?.[id] ?? ''
}

// ── 성과 카드 — 모든 카드를 "헤드라인 + 설명" 같은 구성으로 ─────────
// 헤드라인 우선순위: "헤드라인 — 설명" 형식의 앞부분 → 퍼센트 → "A → B" 변화 → 기간·횟수
const RESULT_VALUE_PATTERNS = [
    /\d+(?:\.\d+)?%/,
    /\d[\d,.]*\s*[가-힣a-zA-Z]*\s*→\s*\d[\d,.]*\s*[가-힣a-zA-Z]*/,
    /\d+\s*(?:년|개월|주|명|건|개|회)/,
]

const resultCards = computed(() => {
    const cards = (project.value?.result ?? []).map((text) => {
        const { keyword, rest } = splitKeyword(text)
        // 직접 적은 헤드라인이라도 숫자로 시작하면("3~4만 원") 수치 성과로 보고 앞쪽에 둔다
        if (keyword) return { headline: keyword, text: rest, numeric: /^\d/.test(keyword) }
        for (const pattern of RESULT_VALUE_PATTERNS) {
            const match = text.match(pattern)
            if (match) return { headline: match[0].trim(), text, numeric: true }
        }
        return { headline: null, text, numeric: false }
    })
    // 수치 성과를 앞으로 — 같은 그룹 안에서는 원래 순서 유지
    return [...cards.filter((c) => c.numeric), ...cards.filter((c) => !c.numeric)]
})

// scroll-spy — 고정 탭 아래 기준선을 통과한 마지막 섹션을 현재 위치로 본다
// 기준선 = 상단 내비(64px) + 고정 탭(52px) + scroll-margin 여백(32px) = 148px 보다 조금 아래.
// 탭으로 이동한 섹션의 머리가 이 선을 넘어서야 바로 활성으로 잡힌다. (CSS --cs-tabs-height와 맞출 것)
const activeSectionId = ref(null)
const ACTIVE_LINE_OFFSET = 168

function updateActiveSection() {
    const ids = sections.value.map((s) => s.id)
    if (!ids.length) {
        activeSectionId.value = null
        return
    }
    // 페이지 끝에 닿으면 마지막 섹션 — 짧은 마지막 섹션이 기준선에 못 닿는 경우 대비
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        activeSectionId.value = ids[ids.length - 1]
        return
    }
    let current = ids[0]
    for (const id of ids) {
        const el = document.getElementById(`section-${id}`)
        if (el && el.getBoundingClientRect().top - ACTIVE_LINE_OFFSET <= 0) current = id
    }
    activeSectionId.value = current
}

// 탭 클릭 시 누른 항목을 즉시 활성화하고, 부드러운 스크롤이 끝날 때까지 scroll-spy를 잠근다
let lockedSectionId = null
let unlockTimer = null

function armUnlock() {
    clearTimeout(unlockTimer)
    unlockTimer = setTimeout(() => {
        lockedSectionId = null
    }, 150)
}

function handleScroll() {
    if (lockedSectionId) {
        armUnlock()
        return
    }
    updateActiveSection()
}

function scrollToSection(id) {
    activeSectionId.value = id
    lockedSectionId = id
    armUnlock()
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
    updateActiveSection()
    window.addEventListener('scroll', handleScroll, { passive: true })
})
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    clearTimeout(unlockTimer)
})

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

        <div class="cs-column cs-sections">
            <!-- 섹션 공통 구조: 제목(+ 한 줄 요약) → 흰 면 본문. 한 단으로 위에서 아래로 읽힌다 -->
            <!-- 배경 -->
            <section v-if="sectionOf('background')" id="section-background" class="cs-section">
                <header class="cs-head">
                    <h2 class="cs-h2">배경</h2>
                    <p v-if="sectionNote('background')" class="cs-head-note">{{ sectionNote('background') }}</p>
                </header>
                <div class="cs-card">
                    <p class="cs-text">{{ project.background.problem }}</p>
                    <div v-if="project.background.goal" class="cs-goal">
                        <strong class="cs-goal-label">목표</strong>
                        <p class="cs-goal-text">{{ project.background.goal }}</p>
                    </div>
                </div>
            </section>

            <!-- 담당 역할 — 흰 면 안에서 한 줄씩, 안쪽으로 들인 구분선으로 끊는다 -->
            <section v-if="sectionOf('role')" id="section-role" class="cs-section">
                <header class="cs-head">
                    <h2 class="cs-h2">담당 역할</h2>
                    <p v-if="sectionNote('role')" class="cs-head-note">{{ sectionNote('role') }}</p>
                </header>
                <ul class="cs-rows">
                    <li v-for="(item, idx) in project.responsibilities" :key="idx" class="cs-row">
                        <span class="cs-row-icon" aria-hidden="true">
                            <IconCheck :size="14" :stroke-width="2.6" />
                        </span>
                        <span class="cs-row-body">
                            <strong v-if="splitKeyword(item).keyword" class="cs-keyword">{{ splitKeyword(item).keyword }}</strong>
                            <span class="cs-row-text" :class="{ 'is-sub': splitKeyword(item).keyword }">{{ splitKeyword(item).rest }}</span>
                        </span>
                    </li>
                </ul>
            </section>

            <!-- 성과 — 문장마다 대표 수치를 뽑아 카드로. 수치가 없는 성과는 문장만 -->
            <section v-if="sectionOf('results')" id="section-results" class="cs-section">
                <header class="cs-head">
                    <h2 class="cs-h2">성과</h2>
                    <p v-if="sectionNote('results')" class="cs-head-note">{{ sectionNote('results') }}</p>
                </header>
                <ul class="cs-results">
                    <li v-for="(card, idx) in resultCards" :key="idx" class="cs-result">
                        <span v-if="card.headline" class="cs-result-value"
                            :class="{ 'is-text': !card.numeric }">{{ card.headline }}</span>
                        <span class="cs-result-text" :class="{ 'is-solo': !card.headline }">{{ card.text }}</span>
                    </li>
                </ul>
            </section>

            <!-- 아키텍처 · 설계 결정 — 다이어그램은 본문 폭 안에서 높이를 제한하고, 원본은 라이트박스로 -->
            <section v-if="sectionOf('architecture')" id="section-architecture" class="cs-section">
                <header class="cs-head">
                    <h2 class="cs-h2">{{ sectionOf('architecture').label }}</h2>
                    <p v-if="sectionNote('architecture')" class="cs-head-note">{{ sectionNote('architecture') }}</p>
                </header>

                <div v-if="project.diagrams?.length" class="cs-diagrams"
                    :style="{ '--diagram-count': project.diagrams.length }">
                    <button v-for="(diagram, idx) in project.diagrams" :key="idx" type="button" class="cs-diagram"
                        :aria-label="`${diagram.title} 크게 보기`"
                        @click="openLightbox(publicAsset(diagram.image), `${project.title} ${diagram.title}`)">
                        <img :src="publicAsset(diagram.image)" :alt="`${project.title} ${diagram.title}`" />
                    </button>
                </div>
                <p v-if="project.diagrams?.length" class="cs-hint">이미지를 누르면 크게 볼 수 있어요</p>

                <!-- 설계 결정 — 왜 / 대안 / 대가 -->
                <div v-if="project.decisions?.length" class="cs-decisions">
                    <div v-for="(d, idx) in project.decisions" :key="idx" class="cs-card decision">
                        <span class="decision-index">결정 {{ idx + 1 }}</span>
                        <h3 class="decision-title">{{ d.title }}</h3>
                        <dl class="decision-grid">
                            <template v-if="d.why">
                                <dt>왜</dt>
                                <dd>{{ d.why }}</dd>
                            </template>
                            <template v-if="d.alternative">
                                <dt>대안</dt>
                                <dd>{{ d.alternative }}</dd>
                            </template>
                            <template v-if="d.tradeoff">
                                <dt>대가</dt>
                                <dd>{{ d.tradeoff }}</dd>
                            </template>
                        </dl>
                    </div>
                </div>
            </section>

            <!-- 동작 흐름 — Mermaid 시퀀스 다이어그램 -->
            <section v-if="sectionOf('flow')" id="section-flow" class="cs-section">
                <header class="cs-head">
                    <h2 class="cs-h2">동작 흐름</h2>
                    <p v-if="sectionNote('flow')" class="cs-head-note">{{ sectionNote('flow') }}</p>
                </header>
                <div v-for="(flow, idx) in project.flows" :key="idx" class="cs-flow">
                    <h3 v-if="flow.title" class="cs-h3">{{ flow.title }}</h3>
                    <div class="cs-flow-box">
                        <div v-if="flowSvgs[idx]" class="cs-flow-svg" v-html="flowSvgs[idx]"></div>
                        <p v-else-if="flowSvgs[idx] === ''" class="cs-hint">다이어그램을 그리지 못했습니다.</p>
                        <p v-else class="cs-hint">다이어그램을 불러오는 중…</p>
                    </div>
                    <p v-if="flow.description" class="cs-flow-desc">{{ flow.description }}</p>
                </div>
            </section>

            <!-- Deep dive — 이슈가 여러 개면 칩으로 하나씩 넘겨 본다.
                 각 이슈는 증상 → 원인 → 해결 → 결과 세로 목록 -->
            <section v-if="sectionOf('deepdive')" id="section-deepdive" class="cs-section">
                <header class="cs-head">
                    <h2 class="cs-h2">Deep dive</h2>
                    <p v-if="sectionNote('deepdive')" class="cs-head-note">{{ sectionNote('deepdive') }}</p>
                </header>

                <div class="cs-issue">
                    <div v-if="issues.length > 1" class="cs-issue-tabs" role="tablist" aria-label="트러블슈팅 이슈"
                        @keydown="handleIssueKeydown">
                        <button v-for="(item, idx) in issues" :key="idx" :ref="(el) => (issueTabEls[idx] = el)"
                            type="button" role="tab" class="cs-issue-tab" :class="{ active: idx === activeIssue }"
                            :aria-selected="idx === activeIssue" :tabindex="idx === activeIssue ? 0 : -1"
                            @click="selectIssue(idx)">
                            <span class="cs-issue-index">이슈 {{ idx + 1 }}</span>
                            <span class="cs-issue-tab-title">{{ item.title || item.problem }}</span>
                        </button>
                    </div>

                    <div class="cs-issue-viewport">
                        <Transition :name="issueDirection">
                            <div :key="`${project.slug}-${activeIssue}`" class="cs-issue-panel" role="tabpanel">
                                <!-- 이슈가 하나여도 탭과 같은 "이슈 1" 배지로 번호를 붙인다 -->
                                <h3 v-if="issues.length === 1" class="cs-issue-single-title">
                                    <span class="cs-issue-index is-active">이슈 1</span>
                                    <span v-if="currentIssue.title">{{ currentIssue.title }}</span>
                                </h3>
                                <ol class="cs-steps">
                                    <li class="cs-step">
                                        <span class="cs-step-dot">1</span>
                                        <div class="cs-step-body">
                                            <h4 class="cs-step-title">증상</h4>
                                            <p class="cs-step-text">{{ currentIssue.problem }}</p>
                                        </div>
                                    </li>
                                    <li v-if="currentIssue.cause || currentIssue.concept" class="cs-step">
                                        <span class="cs-step-dot">2</span>
                                        <div class="cs-step-body">
                                            <h4 class="cs-step-title">원인</h4>
                                            <p v-if="currentIssue.cause" class="cs-step-text">{{ currentIssue.cause }}</p>
                                            <p v-if="currentIssue.concept" class="cs-concept">
                                                <strong>개념 메모</strong> {{ currentIssue.concept }}
                                            </p>
                                        </div>
                                    </li>
                                    <li class="cs-step cs-step-solution">
                                        <span class="cs-step-dot">{{ currentIssue.cause || currentIssue.concept ? 3 : 2 }}</span>
                                        <div class="cs-step-body">
                                            <h4 class="cs-step-title">{{ currentIssue.outcome ? '해결' : '해결 및 결과' }}</h4>
                                            <p class="cs-step-text">{{ currentIssue.solution }}</p>
                                            <pre v-if="currentIssue.code?.snippet" class="cs-code"><code>{{ currentIssue.code.snippet }}</code></pre>
                                        </div>
                                    </li>
                                    <li v-if="currentIssue.outcome" class="cs-step cs-step-result">
                                        <span class="cs-step-dot">{{ currentIssue.cause || currentIssue.concept ? 4 : 3 }}</span>
                                        <div class="cs-step-body">
                                            <h4 class="cs-step-title">결과</h4>
                                            <p class="cs-outcome">{{ currentIssue.outcome }}</p>
                                        </div>
                                    </li>
                                </ol>
                            </div>
                        </Transition>
                    </div>

                    <!-- 이전 / 다음 이슈 -->
                    <div v-if="issues.length > 1" class="cs-issue-nav">
                        <button type="button" class="btn btn--ghost cs-issue-nav-btn" :disabled="activeIssue === 0"
                            @click="selectIssue(activeIssue - 1)">
                            <IconArrowLeft :size="16" :stroke-width="2.2" /> 이전 이슈
                        </button>
                        <span class="cs-issue-count">{{ activeIssue + 1 }} / {{ issues.length }}</span>
                        <button type="button" class="btn btn--ghost cs-issue-nav-btn"
                            :disabled="activeIssue === issues.length - 1" @click="selectIssue(activeIssue + 1)">
                            다음 이슈 <IconArrowRight :size="16" :stroke-width="2.2" />
                        </button>
                    </div>
                </div>
            </section>

            <!-- 회고 — 아쉬운 점 / 다시 한다면 -->
            <section v-if="sectionOf('retrospective')" id="section-retrospective" class="cs-section">
                <header class="cs-head">
                    <h2 class="cs-h2">회고</h2>
                    <p v-if="sectionNote('retrospective')" class="cs-head-note">{{ sectionNote('retrospective') }}</p>
                </header>
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
            </section>

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
/* ── 레이아웃 ───────────────────────────────────────────── */
/* 회색 바탕 위에 흰 면들을 한 단으로 쌓는다.
   --cs-width: 케이스 스터디 본문 폭 — 한 줄이 너무 길지 않게 (content-width 안쪽)
   --cs-tabs-height: 고정 탭 높이 — scroll-spy 기준선·scroll-margin 계산에 같이 쓴다 */
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

/* ── 섹션 공통 — 제목 → 흰 면 본문, 섹션 사이는 넉넉히 ───────── */
.cs-sections {
    display: flex;
    flex-direction: column;
    gap: 80px;
    padding-top: var(--space-12);
}

.cs-section {
    min-width: 0;
    /* 탭 클릭으로 이동 시 상단 내비게이션 + 고정 탭에 제목이 가리지 않도록 */
    scroll-margin-top: calc(var(--nav-height) + var(--cs-tabs-height) + var(--space-8));
}

.cs-head {
    margin-bottom: var(--space-5);
}

.cs-h2 {
    font-size: var(--t2);
    line-height: var(--t2-lh);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--color-text);
}

.cs-head-note {
    margin-top: var(--space-1);
    font-size: var(--t5);
    line-height: var(--t5-lh);
    color: var(--color-text-muted);
}

.cs-h3 {
    margin-bottom: var(--space-3);
    font-size: var(--t4);
    line-height: var(--t4-lh);
    font-weight: 700;
    color: var(--color-text);
}

.cs-card {
    padding: var(--space-8);
    background: var(--color-surface);
    box-shadow: var(--card-shadow);
    border-radius: var(--radius-xl);
}

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

.cs-hint {
    margin-top: var(--space-2);
    font-size: var(--t7);
    line-height: var(--t7-lh);
    color: var(--color-text-faint);
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

/* ── 아키텍처 — 다이어그램은 높이 340px 제한, 여러 장이면 안쪽 구분선 ── */
.cs-diagrams {
    display: grid;
    grid-template-columns: repeat(var(--diagram-count, 1), minmax(0, 1fr));
    padding: var(--space-6) 0;
    background: var(--color-surface);
    box-shadow: var(--card-shadow);
    border-radius: var(--radius-xl);
}

.cs-diagram {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 0 var(--space-6);
    cursor: zoom-in;
}

.cs-diagram + .cs-diagram::before {
    content: '';
    position: absolute;
    top: var(--space-2);
    bottom: var(--space-2);
    left: 0;
    width: 1px;
    background: var(--color-bg-alt);
}

.cs-diagram img {
    max-width: 100%;
    max-height: 340px;
    width: auto;
    height: auto;
    object-fit: contain;
    transition: opacity 0.15s var(--ease);
}

.cs-diagram:hover img {
    opacity: 0.85;
}

@media (max-width: 700px) {
    .cs-diagrams {
        grid-template-columns: minmax(0, 1fr);
    }

    .cs-diagram {
        padding: 0 var(--space-5);
    }

    .cs-diagram + .cs-diagram {
        margin-top: var(--space-5);
        padding-top: var(--space-5);
    }

    .cs-diagram + .cs-diagram::before {
        top: 0;
        bottom: auto;
        left: var(--space-5);
        right: var(--space-5);
        width: auto;
        height: 1px;
    }
}

.cs-decisions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-top: var(--space-6);
}

.decision {
    padding: var(--space-6) var(--space-8);
}

.decision-index {
    display: block;
    margin-bottom: var(--space-1);
    font-size: var(--t7);
    line-height: var(--t7-lh);
    font-weight: 600;
    color: var(--color-accent);
}

.decision-title {
    margin-bottom: var(--space-4);
    font-size: var(--t4);
    line-height: var(--t4-lh);
    font-weight: 700;
    color: var(--color-text);
}

.decision-grid {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    gap: var(--space-3) var(--space-3);
}

.decision-grid dt {
    font-size: var(--t6);
    line-height: var(--t6-lh);
    font-weight: 600;
    color: var(--color-text-faint);
}

.decision-grid dd {
    font-size: var(--t6);
    line-height: var(--t6-lh);
    color: var(--color-text);
}

/* ── 동작 흐름 ──────────────────────────────────────────── */
.cs-flow + .cs-flow {
    margin-top: var(--space-10);
}

.cs-flow-box {
    padding: var(--space-6);
    overflow-x: auto;
    background: var(--color-surface);
    box-shadow: var(--card-shadow);
    border-radius: var(--radius-xl);
}

.cs-flow-svg :deep(svg) {
    display: block;
    max-width: 100%;
    max-height: 420px;
    height: auto;
    margin: 0 auto;
}

.cs-flow-desc {
    margin-top: var(--space-3);
    font-size: var(--t6);
    line-height: var(--t6-lh);
    color: var(--color-text-muted);
}

/* ── Deep dive ──────────────────────────────────────────── */
.cs-issue {
    overflow: hidden;
    background: var(--color-surface);
    box-shadow: var(--card-shadow);
    border-radius: var(--radius-xl);
}

/* 이슈 칩 — 이슈가 많아도 한 줄, 넘치면 칩 줄만 가로 스크롤 */
.cs-issue-tabs {
    display: flex;
    gap: var(--space-2);
    padding: var(--space-6) var(--space-8) 0;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
}

.cs-issue-tabs::-webkit-scrollbar {
    display: none;
}

.cs-issue-tab {
    display: flex;
    /* 제목 길이만큼 폭을 차지하고 줄어들지 않는다 */
    flex: 0 0 auto;
    align-items: center;
    gap: var(--space-2);
    min-height: 40px;
    padding: 0 var(--space-4);
    border-radius: var(--radius-sm);
    background: var(--color-bg);
    white-space: nowrap;
    text-align: left;
    color: var(--color-text-muted);
    transition:
        background-color 0.15s var(--ease),
        color 0.15s var(--ease),
        transform 0.15s var(--ease);
}

.cs-issue-tab:hover {
    background: var(--color-bg-alt);
    color: var(--color-text);
}

.cs-issue-tab:active {
    transform: scale(var(--press-scale));
}

.cs-issue-tab.active {
    background: var(--color-accent-soft);
    color: var(--color-accent-dark);
}

.cs-issue-tab:focus-visible {
    outline-offset: -2px;
}

.cs-issue-index {
    flex-shrink: 0;
    font-size: var(--t7);
    line-height: var(--t7-lh);
    font-weight: 600;
    color: var(--color-text-faint);
}

.cs-issue-tab.active .cs-issue-index,
.cs-issue-index.is-active {
    color: var(--color-accent);
}

.cs-issue-tab-title {
    font-size: var(--t6);
    line-height: var(--t6-lh);
    font-weight: 600;
}

.cs-issue-single-title {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--space-8) var(--space-8) 0;
    font-size: var(--t4);
    line-height: var(--t4-lh);
    font-weight: 700;
    color: var(--color-text);
}

/* 패널 슬라이드 — 다음 이슈는 오른쪽에서, 이전 이슈는 왼쪽에서 들어온다.
   나가는 패널은 absolute로 빼서 높이가 새 패널 기준으로 바로 맞춰지게 한다 */
.cs-issue-viewport {
    position: relative;
    overflow: hidden;
}

.issue-next-enter-active,
.issue-next-leave-active,
.issue-prev-enter-active,
.issue-prev-leave-active {
    transition:
        transform 0.32s var(--ease),
        opacity 0.32s var(--ease);
}

.issue-next-leave-active,
.issue-prev-leave-active {
    position: absolute;
    inset: 0 0 auto 0;
}

.issue-next-enter-from,
.issue-prev-leave-to {
    transform: translateX(40px);
    opacity: 0;
}

.issue-next-leave-to,
.issue-prev-enter-from {
    transform: translateX(-40px);
    opacity: 0;
}

/* 단계 — 작은 번호 표식 + 세로 연결선. 문제·원인은 회색, 해결은 옅은 포인트, 결과는 포인트 */
.cs-steps {
    padding: var(--space-8);
}

.cs-step {
    position: relative;
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr);
    gap: var(--space-4);
    padding-bottom: var(--space-6);
}

.cs-step:last-child {
    padding-bottom: 0;
}

.cs-step:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 11px;
    top: 32px;
    bottom: var(--space-2);
    width: 2px;
    border-radius: 1px;
    background: var(--color-bg-alt);
}

.cs-step-dot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-bg-alt);
    font-size: var(--t7);
    line-height: 1;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-muted);
}

.cs-step-solution .cs-step-dot {
    background: var(--color-accent-soft);
    color: var(--color-accent);
}

.cs-step-result .cs-step-dot {
    background: var(--color-accent);
    color: var(--color-white);
}

.cs-step-body {
    min-width: 0;
}

.cs-step-title {
    margin-bottom: var(--space-1);
    font-size: var(--t6);
    line-height: 24px;
    font-weight: 700;
    color: var(--color-text);
}

.cs-step-text {
    font-size: var(--t6);
    line-height: 1.7;
    color: var(--color-text);
}

.cs-concept {
    margin-top: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    font-size: var(--t6);
    line-height: var(--t6-lh);
    color: var(--color-text-muted);
}

.cs-concept strong {
    margin-right: 6px;
    font-weight: 600;
    color: var(--color-text);
}

/* 코드 조각만은 정렬이 깨지지 않도록 고정폭 글꼴을 쓴다 */
.cs-code {
    margin: var(--space-3) 0 0;
    padding: var(--space-4);
    overflow-x: auto;
    border-radius: var(--radius-md);
    background: #1e1e1e;
    color: #e6e6e6;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: var(--t7);
    line-height: 1.6;
    letter-spacing: 0;
    white-space: pre;
}

.cs-outcome {
    font-size: var(--t5);
    line-height: var(--t5-lh);
    font-weight: 700;
    color: var(--color-accent);
}

/* 이전 / 다음 이슈 — 회색 버튼(.btn--ghost) 한 쌍, 사이에 위치 표시 */
.cs-issue-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: 0 var(--space-8) var(--space-6);
}

/* 전역 .btn--ghost(테두리 알약)와 달리 이 페이지는 회색 채움 + 작은 둥근 모서리 */
.cs-issue-nav-btn.btn--ghost {
    min-height: 40px;
    padding: 0 var(--space-4);
    border: none;
    border-radius: var(--radius-sm);
    background: var(--color-bg-alt);
    color: var(--color-text);
    font-size: var(--t6);
    font-weight: 600;
    transition:
        transform 0.15s var(--ease),
        background-color 0.15s var(--ease);
}

.cs-issue-nav-btn.btn--ghost:hover {
    background: #dcdcdc;
    color: var(--color-text);
}

.cs-issue-nav-btn.btn--ghost:active {
    transform: scale(var(--press-scale));
}

.cs-issue-nav-btn:disabled {
    opacity: 0.4;
    cursor: default;
    pointer-events: none;
}

.cs-issue-count {
    font-size: var(--t7);
    line-height: var(--t7-lh);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-faint);
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

/* ── 모바일 — 흰 면 안쪽 여백을 한 단계 줄이고, 섹션 간격도 좁힌다 ── */
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

    .cs-h2 {
        font-size: var(--t3);
        line-height: var(--t3-lh);
    }

    .cs-card,
    .tldr-card,
    .cs-result,
    .cs-retro .cs-card,
    .decision {
        padding: var(--space-5);
    }

    .cs-card,
    .cs-rows,
    .cs-diagrams,
    .cs-flow-box,
    .cs-issue {
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

    .cs-flow-box {
        padding: var(--space-4);
    }

    .cs-issue-tabs {
        padding: var(--space-5) var(--space-5) 0;
    }

    .cs-issue-single-title {
        padding: var(--space-6) var(--space-5) 0;
    }

    .cs-steps {
        padding: var(--space-6) var(--space-5);
    }

    .cs-issue-nav {
        padding: 0 var(--space-5) var(--space-5);
    }

    .cs-issue-nav-btn {
        padding: 0 var(--space-3);
    }

    .cs-pager {
        grid-template-columns: minmax(0, 1fr);
    }

    .cs-pager-empty {
        display: none;
    }
}

/* ── 라이트박스 ─────────────────────────────────────────── */
.lightbox-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-12);
    background: rgba(0, 0, 0, 0.85);
}

.lightbox-image {
    max-width: 100%;
    max-height: 100%;
    border-radius: var(--radius-md);
    cursor: default;
}

.lightbox-close {
    position: fixed;
    top: var(--space-6);
    right: var(--space-6);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    color: var(--color-white);
    transition:
        background-color 0.15s var(--ease),
        transform 0.15s var(--ease);
}

.lightbox-close:hover {
    background: rgba(255, 255, 255, 0.22);
}

.lightbox-close:active {
    transform: scale(var(--press-scale));
}

@media (max-width: 600px) {
    .lightbox-overlay {
        padding: var(--space-4);
    }

    .lightbox-close {
        top: var(--space-4);
        right: var(--space-4);
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
    .cs-issue-tab,
    .cs-pager-link,
    .cs-diagram img,
    .issue-next-enter-active,
    .issue-next-leave-active,
    .issue-prev-enter-active,
    .issue-prev-leave-active {
        transition: none;
    }
}
</style>
