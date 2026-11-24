<!-- src/components/project-detail/ProjectDeepDive.vue -->
<!-- Deep dive(트러블슈팅) — 이슈가 여러 개면 칩으로 하나씩 넘겨 보고, 이동 방향에 맞춰 패널이 좌우로 밀려난다.
     각 이슈는 증상 → 원인 → 해결 → 결과 세로 목록.
     다른 프로젝트로 넘어갈 때 첫 이슈부터 보이도록, 부모에서 :key="slug"로 새로 마운트한다. -->
<script setup>
import { computed, nextTick, ref } from 'vue'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-vue'

const props = defineProps({
  issues: { type: Array, required: true },
})

const activeIssue = ref(0)
const issueDirection = ref('issue-none')
const issueTabEls = []
const currentIssue = computed(() => props.issues[activeIssue.value] ?? {})
const hasCause = computed(() => !!(currentIssue.value.cause || currentIssue.value.concept))

function selectIssue(idx) {
  if (idx < 0 || idx >= props.issues.length || idx === activeIssue.value) return
  issueDirection.value = idx > activeIssue.value ? 'issue-next' : 'issue-prev'
  activeIssue.value = idx
}

// 탭 목록 안에서 ←/→ 로 이동 (WAI-ARIA tabs 패턴)
function handleIssueKeydown(e) {
  const last = props.issues.length - 1
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
</script>

<template>
  <div class="cs-issue">
    <div
      v-if="issues.length > 1"
      class="cs-issue-tabs"
      role="tablist"
      aria-label="트러블슈팅 이슈"
      @keydown="handleIssueKeydown"
    >
      <button
        v-for="(item, idx) in issues"
        :key="idx"
        :ref="(el) => (issueTabEls[idx] = el)"
        type="button"
        role="tab"
        class="cs-issue-tab"
        :class="{ active: idx === activeIssue }"
        :aria-selected="idx === activeIssue"
        :tabindex="idx === activeIssue ? 0 : -1"
        @click="selectIssue(idx)"
      >
        <span class="cs-issue-index">이슈 {{ idx + 1 }}</span>
        <span class="cs-issue-tab-title">{{ item.title || item.problem }}</span>
      </button>
    </div>

    <div class="cs-issue-viewport">
      <Transition :name="issueDirection">
        <div :key="activeIssue" class="cs-issue-panel" role="tabpanel">
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
            <li v-if="hasCause" class="cs-step">
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
              <span class="cs-step-dot">{{ hasCause ? 3 : 2 }}</span>
              <div class="cs-step-body">
                <h4 class="cs-step-title">
                  {{ currentIssue.outcome ? '해결' : '해결 및 결과' }}
                </h4>
                <p class="cs-step-text">{{ currentIssue.solution }}</p>
                <pre
                  v-if="currentIssue.code?.snippet"
                  class="cs-code"
                ><code>{{ currentIssue.code.snippet }}</code></pre>
              </div>
            </li>
            <li v-if="currentIssue.outcome" class="cs-step cs-step-result">
              <span class="cs-step-dot">{{ hasCause ? 4 : 3 }}</span>
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
      <button
        type="button"
        class="cs-issue-nav-btn"
        :disabled="activeIssue === 0"
        @click="selectIssue(activeIssue - 1)"
      >
        <IconArrowLeft :size="16" :stroke-width="2.2" /> 이전 이슈
      </button>
      <span class="cs-issue-count">{{ activeIssue + 1 }} / {{ issues.length }}</span>
      <button
        type="button"
        class="cs-issue-nav-btn"
        :disabled="activeIssue === issues.length - 1"
        @click="selectIssue(activeIssue + 1)"
      >
        다음 이슈 <IconArrowRight :size="16" :stroke-width="2.2" />
      </button>
    </div>
  </div>
</template>

<style scoped>
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

/* 이전 / 다음 이슈 — 회색 채움 버튼 한 쌍, 사이에 위치 표시
   (전역 .btn--ghost는 테두리 알약 모양이라 쓰지 않고 여기서 직접 그린다) */
.cs-issue-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 0 var(--space-8) var(--space-6);
}

.cs-issue-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-bg-alt);
  color: var(--color-text);
  font-size: var(--t6);
  font-weight: 600;
  white-space: nowrap;
  transition:
    transform 0.15s var(--ease),
    background-color 0.15s var(--ease);
}

.cs-issue-nav-btn:hover {
  background: #dcdcdc;
}

.cs-issue-nav-btn:active {
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

@media (max-width: 600px) {
  .cs-issue {
    border-radius: var(--radius-lg);
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
}

@media (prefers-reduced-motion: reduce) {
  .cs-issue-tab,
  .issue-next-enter-active,
  .issue-next-leave-active,
  .issue-prev-enter-active,
  .issue-prev-leave-active {
    transition: none;
  }
}
</style>
