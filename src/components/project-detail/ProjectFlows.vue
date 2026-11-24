<!-- src/components/project-detail/ProjectFlows.vue -->
<!-- 동작 흐름 — projects.js의 flows[].mermaid를 시퀀스 다이어그램으로 그린다 -->
<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  flows: { type: Array, default: () => [] },
})

// mermaid는 용량이 커서 이 컴포넌트가 실제로 그려질 때만 동적으로 불러오고, 한 번 불러오면 재사용한다
let mermaidInstance = null
let renderSeq = 0

// null = 그리는 중, '' = 실패, 문자열 = 완성된 SVG
const flowSvgs = ref([])

async function renderFlows() {
  const flows = props.flows
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
        console.error('[ProjectFlows] mermaid render failed:', err)
        return ''
      }
    }),
  )
  // 렌더 도중 다른 프로젝트로 이동했다면 늦게 끝난 결과는 버린다
  if (seq === renderSeq) flowSvgs.value = rendered
}

onMounted(renderFlows)
// 이전/다음 프로젝트로 넘어가면 컴포넌트가 재사용되므로 flows가 바뀔 때 다시 그린다
watch(() => props.flows, renderFlows)
</script>

<template>
  <div v-for="(flow, idx) in flows" :key="idx" class="cs-flow">
    <h3 v-if="flow.title" class="cs-h3">{{ flow.title }}</h3>
    <div class="cs-flow-box">
      <div v-if="flowSvgs[idx]" class="cs-flow-svg" v-html="flowSvgs[idx]"></div>
      <p v-else-if="flowSvgs[idx] === ''" class="cs-hint">다이어그램을 그리지 못했습니다.</p>
      <p v-else class="cs-hint">다이어그램을 불러오는 중…</p>
    </div>
    <p v-if="flow.description" class="cs-flow-desc">{{ flow.description }}</p>
  </div>
</template>

<style scoped>
.cs-flow + .cs-flow {
  margin-top: var(--space-10);
}

.cs-h3 {
  margin-bottom: var(--space-3);
  font-size: var(--t4);
  line-height: var(--t4-lh);
  font-weight: 700;
  color: var(--color-text);
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

.cs-hint {
  font-size: var(--t7);
  line-height: var(--t7-lh);
  color: var(--color-text-faint);
}

.cs-flow-desc {
  margin-top: var(--space-3);
  font-size: var(--t6);
  line-height: var(--t6-lh);
  color: var(--color-text-muted);
}

@media (max-width: 600px) {
  .cs-flow-box {
    padding: var(--space-4);
    border-radius: var(--radius-lg);
  }
}
</style>
