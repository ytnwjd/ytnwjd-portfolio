<!-- src/views/ProjectDetail.vue -->
<!-- 프로젝트 상세 — "면접관이 읽는 엔지니어링 케이스 스터디" 구성.
     히어로(한 줄 소개·메타) → TL;DR(문제·만든 것) → 고정 탭 →
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

// ── TL;DR — 문제 · 만든 것 (성과는 별도 성과 섹션에서 보여준다) ──────
// 문제 · 만든 것 · 성과 — 전용 필드(tldr)가 없으면 기존 필드로 채운다

const tldrCells = computed(() => {
    const p = project.value
    if (!p) return []
    return [
        { key: 'problem', label: 'Problem', text: p.tldr?.problem || p.background?.problem },
        { key: 'built', label: 'What I built', text: p.tldr?.built || p.summary },
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
        if (keyword) return { headline: keyword, text: rest, numeric: false }
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
const activeSectionId = ref(null)
const ACTIVE_LINE_OFFSET = 180

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
                    <IconArrowLeft :size="14" :stroke-width="2.5" />
                    프로젝트 목록
                </RouterLink>
                <span v-if="currentIndex >= 0" class="cs-counter">
                    {{ pad2(currentIndex + 1) }} / {{ pad2(orderedProjects.length) }}
                </span>
            </div>

            <!-- 히어로 — 소속 · 제목 · 한 줄 소개 · 메타 · 기술 -->
            <header class="cs-hero">
                <span v-if="project.organization" class="cs-eyebrow">{{ project.organization }}</span>
                <h1 class="cs-title">{{ project.title }}</h1>
                <p v-if="project.pitch" class="cs-pitch">{{ project.pitch }}</p>

                <dl class="cs-meta">
                    <div class="cs-meta-item">
                        <dt>Period</dt>
                        <dd>{{ project.period }}</dd>
                    </div>
                    <div v-if="project.role" class="cs-meta-item">
                        <dt>Role</dt>
                        <dd>{{ project.role }}</dd>
                    </div>
                    <div v-if="project.type" class="cs-meta-item">
                        <dt>Type</dt>
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

        <!-- 고정 탭 — 섹션이 2개 이상일 때만 -->
        <nav v-if="sections.length > 1" class="cs-tabs" aria-label="페이지 목차">
            <div class="cs-tabs-inner">
                <button v-for="s in sections" :key="s.id" type="button" class="cs-tab"
                    :class="{ active: s.id === activeSectionId }" @click="scrollToSection(s.id)">
                    {{ s.label }}
                </button>
            </div>
        </nav>

        <div class="cs-column">
            <!-- 배경 -->
            <!-- 섹션 공통 구조: 왼쪽 열(번호·제목·한 줄 요약) + 오른쪽 열(흰 카드 본문) -->
            <section v-if="sectionOf('background')" id="section-background" class="cs-section">
                <header class="cs-side">
                    <span class="cs-num">{{ sectionOf('background').number }}</span>
                    <h2 class="cs-h2">배경</h2>
                    <p v-if="sectionNote('background')" class="cs-side-note">{{ sectionNote('background') }}</p>
                </header>
                <div class="cs-body">
                    <div class="cs-card">
                        <p class="cs-text">{{ project.background.problem }}</p>
                        <p v-if="project.background.goal" class="cs-text cs-goal">
                            <strong>목표</strong> {{ project.background.goal }}
                        </p>
                    </div>
                </div>
            </section>

            <!-- 담당 역할 — 흰 카드 안에서 한 줄씩 구분선으로 끊는다 -->
            <section v-if="sectionOf('role')" id="section-role" class="cs-section">
                <header class="cs-side">
                    <span class="cs-num">{{ sectionOf('role').number }}</span>
                    <h2 class="cs-h2">담당 역할</h2>
                    <p v-if="sectionNote('role')" class="cs-side-note">{{ sectionNote('role') }}</p>
                </header>
                <div class="cs-body">
                    <ul class="cs-rows">
                        <li v-for="(item, idx) in project.responsibilities" :key="idx" class="cs-row">
                            <IconCheck class="cs-row-icon" :size="17" :stroke-width="2" />
                            <span>
                                <strong v-if="splitKeyword(item).keyword" class="cs-keyword">{{ splitKeyword(item).keyword }}</strong>
                                <template v-if="splitKeyword(item).keyword"> — </template>{{ splitKeyword(item).rest }}
                            </span>
                        </li>
                    </ul>
                </div>
            </section>

            <!-- 성과 — 문장마다 대표 수치를 뽑아 카드로. 수치가 없는 성과는 문장만 -->
            <section v-if="sectionOf('results')" id="section-results" class="cs-section">
                <header class="cs-side">
                    <span class="cs-num">{{ sectionOf('results').number }}</span>
                    <h2 class="cs-h2">성과</h2>
                    <p v-if="sectionNote('results')" class="cs-side-note">{{ sectionNote('results') }}</p>
                </header>
                <div class="cs-body">
                    <ul class="cs-results">
                        <li v-for="(card, idx) in resultCards" :key="idx" class="cs-result">
                            <span v-if="card.headline" class="cs-result-value"
                                :class="{ 'is-text': !card.numeric }">{{ card.headline }}</span>
                            <span class="cs-result-text">{{ card.text }}</span>
                        </li>
                    </ul>
                </div>
            </section>

            <!-- 아키텍처 · 설계 결정 — 다이어그램은 본문 폭 안에서 높이를 제한하고, 원본은 라이트박스로 -->
            <section v-if="sectionOf('architecture')" id="section-architecture" class="cs-section">
                <header class="cs-side">
                    <span class="cs-num">{{ sectionOf('architecture').number }}</span>
                    <h2 class="cs-h2">{{ sectionOf('architecture').label }}</h2>
                    <p v-if="sectionNote('architecture')" class="cs-side-note">{{ sectionNote('architecture') }}</p>
                </header>
                <div class="cs-body">

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
                        <h3 class="decision-title">결정 {{ idx + 1 }} · {{ d.title }}</h3>
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
                </div>
            </section>

            <!-- 동작 흐름 — Mermaid 시퀀스 다이어그램 -->
            <section v-if="sectionOf('flow')" id="section-flow" class="cs-section">
                <header class="cs-side">
                    <span class="cs-num">{{ sectionOf('flow').number }}</span>
                    <h2 class="cs-h2">동작 흐름</h2>
                    <p v-if="sectionNote('flow')" class="cs-side-note">{{ sectionNote('flow') }}</p>
                </header>
                <div class="cs-body">
                <div v-for="(flow, idx) in project.flows" :key="idx" class="cs-flow">
                    <h3 v-if="flow.title" class="cs-h3">{{ flow.title }}</h3>
                    <div class="cs-flow-box">
                        <div v-if="flowSvgs[idx]" class="cs-flow-svg" v-html="flowSvgs[idx]"></div>
                        <p v-else-if="flowSvgs[idx] === ''" class="cs-hint">다이어그램을 그리지 못했습니다.</p>
                        <p v-else class="cs-hint">다이어그램을 불러오는 중…</p>
                    </div>
                    <p v-if="flow.description" class="cs-text">{{ flow.description }}</p>
                </div>
                </div>
            </section>

            <!-- Deep dive — 이슈가 여러 개면 가로 탭으로 하나씩 넘겨 본다.
                 각 이슈는 증상 → 원인 → 해결 → 결과 타임라인 -->
            <section v-if="sectionOf('deepdive')" id="section-deepdive" class="cs-section">
                <header class="cs-side">
                    <span class="cs-num">{{ sectionOf('deepdive').number }}</span>
                    <h2 class="cs-h2">Deep dive</h2>
                    <p v-if="sectionNote('deepdive')" class="cs-side-note">{{ sectionNote('deepdive') }}</p>
                </header>
                <div class="cs-body">

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
                                            <p class="cs-text">{{ currentIssue.problem }}</p>
                                        </div>
                                    </li>
                                    <li v-if="currentIssue.cause || currentIssue.concept" class="cs-step">
                                        <span class="cs-step-dot">2</span>
                                        <div class="cs-step-body">
                                            <h4 class="cs-step-title">원인</h4>
                                            <p v-if="currentIssue.cause" class="cs-text">{{ currentIssue.cause }}</p>
                                            <p v-if="currentIssue.concept" class="cs-concept">
                                                <strong>개념 메모</strong> {{ currentIssue.concept }}
                                            </p>
                                        </div>
                                    </li>
                                    <li class="cs-step">
                                        <span class="cs-step-dot">{{ currentIssue.cause || currentIssue.concept ? 3 : 2 }}</span>
                                        <div class="cs-step-body">
                                            <h4 class="cs-step-title">{{ currentIssue.outcome ? '해결' : '해결 및 결과' }}</h4>
                                            <p class="cs-text">{{ currentIssue.solution }}</p>
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
                        <button type="button" class="cs-issue-nav-btn" :disabled="activeIssue === 0"
                            @click="selectIssue(activeIssue - 1)">
                            <IconArrowLeft :size="14" :stroke-width="2.5" /> 이전 이슈
                        </button>
                        <span class="cs-issue-count">{{ activeIssue + 1 }} / {{ issues.length }}</span>
                        <button type="button" class="cs-issue-nav-btn" :disabled="activeIssue === issues.length - 1"
                            @click="selectIssue(activeIssue + 1)">
                            다음 이슈 <IconArrowRight :size="14" :stroke-width="2.5" />
                        </button>
                    </div>
                </div>
                </div>
            </section>

            <!-- 회고 — 아쉬운 점 / 다시 한다면 -->
            <section v-if="sectionOf('retrospective')" id="section-retrospective" class="cs-section">
                <header class="cs-side">
                    <span class="cs-num">{{ sectionOf('retrospective').number }}</span>
                    <h2 class="cs-h2">회고</h2>
                    <p v-if="sectionNote('retrospective')" class="cs-side-note">{{ sectionNote('retrospective') }}</p>
                </header>
                <div class="cs-body">
                <div class="cs-retro">
                    <div v-if="retro.regret.length" class="cs-card">
                        <span class="tldr-label">아쉬운 점</span>
                        <ul class="cs-retro-list">
                            <li v-for="(r, idx) in retro.regret" :key="idx">{{ r }}</li>
                        </ul>
                    </div>
                    <div v-if="retro.next.length" class="cs-card">
                        <span class="tldr-label">다시 한다면</span>
                        <ul class="cs-retro-list">
                            <li v-for="(r, idx) in retro.next" :key="idx">{{ r }}</li>
                        </ul>
                    </div>
                </div>
                </div>
            </section>

            <!-- 이전 / 다음 프로젝트 -->
            <nav v-if="prevProject || nextProject" class="cs-pager" aria-label="다른 프로젝트">
                <RouterLink v-if="prevProject" :to="{ name: 'project-detail', params: { slug: prevProject.slug } }"
                    class="cs-card cs-pager-link">
                    <span class="tldr-label"><IconArrowLeft :size="12" :stroke-width="2.5" /> 이전</span>
                    <span class="cs-pager-title">{{ prevProject.title }}</span>
                </RouterLink>
                <span v-else></span>
                <RouterLink v-if="nextProject" :to="{ name: 'project-detail', params: { slug: nextProject.slug } }"
                    class="cs-card cs-pager-link cs-pager-next">
                    <span class="tldr-label">다음 <IconArrowRight :size="12" :stroke-width="2.5" /></span>
                    <span class="cs-pager-title">{{ nextProject.title }}</span>
                </RouterLink>
            </nav>
        </div>
    </article>

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
/* ── 레이아웃 ───────────────────────────────────────────── */
.project-detail {
    padding-block: 56px 96px;
}

/* 본문은 가운데 단 — 다이어그램·카드가 답답하지 않으면서 한 줄이 너무 길어지지 않는 폭 */
.cs-column {
    max-width: 1040px;
    margin: 0 auto;
}

.cs-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 8px 16px;
    border: 1.5px solid var(--color-border-strong);
    border-radius: 999px;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--color-text);
    transition:
        border-color 0.2s ease,
        color 0.2s ease;
}

.back-link:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
}

.cs-counter {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-text-faint);
}

/* ── 히어로 ─────────────────────────────────────────────── */
.cs-eyebrow {
    display: block;
    margin-bottom: 10px;
    font-family: var(--font-mono);
    font-size: 12.5px;
    color: var(--color-text-muted);
}

.cs-title {
    font-size: clamp(30px, 3.2vw, 44px);
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.01em;
    color: var(--color-ink);
    word-break: keep-all;
}

.cs-pitch {
    margin-top: 14px;
    font-size: 18px;
    line-height: 1.7;
    color: var(--color-text);
    word-break: keep-all;
}

.cs-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 40px;
    margin-top: 28px;
}

.cs-meta dt {
    margin-bottom: 4px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-faint);
}

.cs-meta dd {
    font-size: 15px;
    color: var(--color-text);
}

.cs-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 20px;
}

.tech-tag {
    padding: 4px 11px;
    border: 1px solid transparent;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
}

/* ── TL;DR ──────────────────────────────────────────────── */
.cs-tldr {
    display: grid;
    grid-template-columns: repeat(var(--tldr-count, 3), minmax(0, 1fr));
    gap: 12px;
    margin-top: 36px;
}

.tldr-card,
.cs-card {
    padding: 18px 20px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
}

.tldr-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 8px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-faint);
}

.tldr-text {
    font-size: 15px;
    line-height: 1.65;
    color: var(--color-text);
    word-break: keep-all;
}

@media (max-width: 760px) {
    .cs-tldr {
        grid-template-columns: minmax(0, 1fr);
    }
}

/* ── 고정 탭 ────────────────────────────────────────────── */
.cs-tabs {
    position: sticky;
    top: var(--nav-height);
    z-index: 20;
    margin: 48px 0 8px;
    background: var(--color-bg);
    border-block: 1px solid var(--color-border);
}

.cs-tabs-inner {
    display: flex;
    gap: 4px;
    max-width: 1040px;
    margin: 0 auto;
    padding: 16px 0;
    overflow-x: auto;
    scrollbar-width: none;
}

.cs-tabs-inner::-webkit-scrollbar {
    display: none;
}

.cs-tab {
    flex-shrink: 0;
    padding: 9px 18px;
    border-radius: 999px;
    font-size: 14.5px;
    font-weight: 500;
    color: var(--color-text-muted);
    transition:
        background-color 0.2s ease,
        color 0.2s ease;
}

/* 탭 사이 세로 구분선 — 탭 간격(gap 4px + margin 12px)의 한가운데에 놓는다 */
.cs-tab + .cs-tab {
    position: relative;
    margin-left: 12px;
}

.cs-tab + .cs-tab::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -8px;
    width: 1px;
    height: 16px;
    background: var(--color-border-strong);
    transform: translateY(-50%);
}

.cs-tab:hover {
    color: var(--color-ink);
}

.cs-tab.active {
    background: var(--color-ink);
    color: var(--color-white);
}

/* ── 섹션 공통 — 왼쪽 열(번호·제목·요약) + 오른쪽 열(본문) ───── */
.cs-section {
    display: grid;
    grid-template-columns: 200px minmax(0, 1fr);
    gap: 40px;
    padding: 56px 0;
    border-bottom: 1px solid var(--color-border);
    /* 탭 클릭으로 이동 시 상단 내비게이션 + 고정 탭에 제목이 가리지 않도록 */
    scroll-margin-top: calc(var(--nav-height) + 96px);
}

/* 왼쪽 열은 본문을 읽는 동안 따라 내려온다 */
.cs-side {
    position: sticky;
    top: calc(var(--nav-height) + 100px);
    align-self: start;
}

.cs-num {
    display: block;
    margin-bottom: 6px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    color: var(--color-accent);
}

.cs-h2 {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--color-ink);
    word-break: keep-all;
}

.cs-side-note {
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--color-text-muted);
    word-break: keep-all;
}

.cs-body {
    min-width: 0;
}

@media (max-width: 860px) {
    .cs-section {
        grid-template-columns: minmax(0, 1fr);
        gap: 20px;
        padding: 44px 0;
    }

    .cs-side {
        position: static;
    }
}

.cs-h3 {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-ink);
}

.cs-text {
    font-size: 16px;
    line-height: 1.8;
    color: var(--color-text);
    word-break: keep-all;
}

/* 카드(흰 바탕) 안의 목표 박스는 페이지 배경색으로 한 단계 들어가 보이게 */
.cs-goal {
    margin-top: 16px;
    padding: 14px 18px;
    background: var(--color-bg);
    border-left: 3px solid var(--color-accent);
}

.cs-goal strong {
    margin-right: 8px;
    font-weight: 600;
    color: var(--color-ink);
}

.cs-hint {
    margin-top: 8px;
    font-size: 13px;
    color: var(--color-text-faint);
}

/* ── 담당 역할 — 흰 카드 안에서 한 줄씩 구분선 ─────────────── */
.cs-rows {
    overflow: hidden;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
}

.cs-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 20px;
    font-size: 15.5px;
    line-height: 1.65;
    color: var(--color-text);
    word-break: keep-all;
}

.cs-row + .cs-row {
    border-top: 1px solid var(--color-border);
}

.cs-row-icon {
    flex-shrink: 0;
    margin-top: 3px;
    color: var(--color-accent);
}

.cs-keyword {
    font-weight: 600;
    color: var(--color-ink);
}

/* ── 성과 — 수치 카드 격자 ─────────────────────────────────── */
/* 카드 수와 상관없이 줄마다 역할 카드와 같은 폭을 꽉 채운다
   (grid auto-fill은 빈 칸이 남으므로 flex-wrap + grow로 나눠 가진다) */
.cs-results {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.cs-result {
    flex: 1 1 220px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 18px 20px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    /* 모든 성과 카드가 같은 구성 — 상단 포인트 선 + 헤드라인 + 설명 */
    border-top: 3px solid var(--color-accent);
    border-radius: 12px;
}

.cs-result-value {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.01em;
    color: var(--color-accent);
    word-break: keep-all;
}

.cs-result-text {
    font-size: 14.5px;
    line-height: 1.6;
    color: var(--color-text);
    word-break: keep-all;
}

.cs-result-value.is-text {
    font-size: 17px;
}

/* ── 아키텍처 — 다이어그램은 작게(높이 340px 제한), 여러 장이면 세로선으로 구분 ── */
.cs-diagrams {
    display: grid;
    grid-template-columns: repeat(var(--diagram-count, 1), minmax(0, 1fr));
    padding: 16px 0;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
}

.cs-diagram {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 0 16px;
    cursor: zoom-in;
}

.cs-diagram + .cs-diagram {
    border-left: 1px solid var(--color-border);
}

.cs-diagram img {
    max-width: 100%;
    max-height: 340px;
    width: auto;
    height: auto;
    object-fit: contain;
    transition: opacity 0.2s ease;
}

.cs-diagram:hover img {
    opacity: 0.85;
}

@media (max-width: 700px) {
    .cs-diagrams {
        grid-template-columns: minmax(0, 1fr);
    }

    .cs-diagram + .cs-diagram {
        margin-top: 16px;
        padding-top: 16px;
        border-left: none;
        border-top: 1px solid var(--color-border);
    }
}

.cs-decisions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
}

.decision-title {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-ink);
    word-break: keep-all;
}

.decision-grid {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 8px 12px;
    font-size: 15px;
    line-height: 1.7;
}

.decision-grid dt {
    padding-top: 2px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-muted);
}

.decision-grid dd {
    color: var(--color-text);
    word-break: keep-all;
}

/* ── 동작 흐름 ──────────────────────────────────────────── */
.cs-flow + .cs-flow {
    margin-top: 32px;
}

.cs-flow-box {
    margin-bottom: 12px;
    padding: 16px;
    overflow-x: auto;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
}

.cs-flow-svg :deep(svg) {
    display: block;
    max-width: 100%;
    max-height: 420px;
    height: auto;
    margin: 0 auto;
}

/* ── Deep dive ──────────────────────────────────────────── */
.cs-issue {
    overflow: hidden;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
}

/* 이슈 탭 — 이슈가 많아도 한 줄, 넘치면 가로 스크롤 */
.cs-issue-tabs {
    display: flex;
    overflow-x: auto;
    border-bottom: 1px solid var(--color-border);
    scrollbar-width: none;
}

.cs-issue-tabs::-webkit-scrollbar {
    display: none;
}

.cs-issue-tab {
    display: flex;
    /* 제목 길이만큼 폭을 차지하고 절대 줄어들지 않는다 — 넘치면 탭 줄만 가로 스크롤 */
    flex: 1 0 auto;
    align-items: center;
    gap: 8px;
    padding: 14px 16px;
    white-space: nowrap;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    text-align: left;
    color: var(--color-text-muted);
    transition:
        color 0.2s ease,
        border-color 0.2s ease,
        background-color 0.2s ease;
}

.cs-issue-tab + .cs-issue-tab {
    border-left: 1px solid var(--color-border);
}

.cs-issue-tab:hover {
    background: var(--color-bg);
    color: var(--color-ink);
}

.cs-issue-tab.active {
    border-bottom-color: var(--color-accent);
    color: var(--color-ink);
}

.cs-issue-tab:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: -2px;
}

.cs-issue-index {
    flex-shrink: 0;
    padding: 3px 10px;
    border: 1px solid var(--color-border-strong);
    border-radius: 999px;
    color: var(--color-text-muted);
    font-family: var(--font-mono);
    font-size: 11.5px;
    font-weight: 600;
}

.cs-issue-tab.active .cs-issue-index,
.cs-issue-index.is-active {
    border-color: var(--color-accent);
    background: var(--color-accent-soft);
    color: var(--color-accent);
}

.cs-issue-tab-title {
    font-size: 14.5px;
    font-weight: 600;
}

.cs-issue-single-title {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px 20px 4px;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
    color: var(--color-ink);
    word-break: keep-all;
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
        transform 0.32s ease,
        opacity 0.32s ease;
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

.cs-issue-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-top: 1px solid var(--color-border);
}

.cs-issue-nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--color-text);
    transition:
        background-color 0.2s ease,
        color 0.2s ease;
}

.cs-issue-nav-btn:hover:not(:disabled) {
    background: var(--color-bg);
    color: var(--color-accent);
}

.cs-issue-nav-btn:disabled {
    color: var(--color-text-faint);
    cursor: default;
}

.cs-issue-count {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-text-faint);
}

.cs-steps {
    padding: 22px 20px;
}

.cs-step {
    position: relative;
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr);
    gap: 14px;
    padding-bottom: 22px;
}

.cs-step:last-child {
    padding-bottom: 0;
}

/* 단계 사이를 잇는 세로선 */
.cs-step:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 12.5px;
    top: 30px;
    bottom: 4px;
    width: 1px;
    background: var(--color-border);
}

.cs-step-dot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: 1px solid var(--color-border-strong);
    border-radius: 50%;
    background: var(--color-bg);
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-text-muted);
}

.cs-step-result .cs-step-dot {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: var(--color-white);
}

.cs-step-body {
    min-width: 0;
    padding-top: 2px;
}

.cs-step-title {
    margin-bottom: 6px;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-ink);
}

.cs-concept {
    margin-top: 10px;
    padding: 12px 14px;
    border-radius: 8px;
    background: var(--color-bg);
    font-size: 14.5px;
    line-height: 1.7;
    color: var(--color-text);
    word-break: keep-all;
}

.cs-concept strong {
    margin-right: 6px;
    font-weight: 600;
    color: var(--color-ink);
}

.cs-code {
    margin: 10px 0 0;
    padding: 14px 16px;
    overflow-x: auto;
    border-radius: 8px;
    background: #1e1e1e;
    color: #e6e6e6;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.6;
    white-space: pre;
}

.cs-outcome {
    font-size: 17px;
    font-weight: 600;
    line-height: 1.6;
    color: var(--color-accent);
    word-break: keep-all;
}

/* ── 회고 ───────────────────────────────────────────────── */
.cs-retro {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
}

.cs-retro-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 15px;
    line-height: 1.7;
    color: var(--color-text);
    word-break: keep-all;
}

/* ── 이전 / 다음 ────────────────────────────────────────── */
.cs-pager {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 48px;
}

.cs-pager-link {
    display: flex;
    flex-direction: column;
    transition:
        border-color 0.2s ease,
        transform 0.2s ease;
}

.cs-pager-link:hover {
    border-color: var(--color-accent);
    transform: translateY(-2px);
}

.cs-pager-next {
    align-items: flex-end;
    text-align: right;
}

.cs-pager-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-ink);
    word-break: keep-all;
}

@media (max-width: 600px) {
    .cs-pager {
        grid-template-columns: minmax(0, 1fr);
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
    padding: 48px;
    background: rgba(0, 0, 0, 0.85);
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
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-white);
    transition: background-color 0.2s ease;
}

.lightbox-close:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* ── 빈 상태 ────────────────────────────────────────────── */
.empty-state {
    padding: 120px 20px;
    text-align: center;
}

.empty-text {
    margin-bottom: 16px;
    font-size: 16px;
    color: var(--color-text-muted);
}

@media (prefers-reduced-motion: reduce) {
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
