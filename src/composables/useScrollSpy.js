import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'

export function useScrollSpy(sectionIds, options = {}) {
  const activeId = ref(sectionIds[0])
  // 개별 id의 최신 ratio를 노출 — 상위/하위 항목처럼 중첩된 섹션에서
  // 호출 측이 그룹별로 직접 "가장 많이 보이는" id를 골라낼 수 있게 함
  const ratios = reactive(new Map(sectionIds.map((id) => [id, 0])))
  let observer = null

  onMounted(() => {
    const elements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean)

    observer = new IntersectionObserver(
      (entries) => {
        // 콜백은 threshold를 넘은 항목만 보고하므로, 모든 섹션의 최신 ratio를
        // 맵으로 유지해야 서로 비교할 수 있음
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        })

        // 화면에 가장 먼저 걸친 섹션이 아니라, 가장 많이 보이는 섹션을 active로 판단
        let maxId = null
        let maxRatio = 0
        ratios.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio
            maxId = id
          }
        })

        if (maxId) {
          activeId.value = maxId
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        // 화면 위아래 10%를 제외해서, 가장자리에 살짝 걸치자마자 active로 바뀌지 않게 함
        rootMargin: '-10% 0px -10% 0px',
        ...options,
      },
    )

    elements.forEach((el) => observer.observe(el))
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return { activeId, ratios }
}
