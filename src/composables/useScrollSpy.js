// src/composables/useScrollSpy.js
// 고정 탭용 scroll-spy — 기준선(화면 위에서 offset px)을 통과한 마지막 섹션을 현재 위치로 본다.
// 섹션 요소 id는 `section-${id}` 규칙을 따른다.
//
// 탭을 눌러 부드럽게 스크롤하는 동안에는 지나가는 섹션들이 잠깐씩 활성화되며 깜빡이므로,
// 누른 항목을 즉시 활성으로 고정하고 스크롤이 멈출 때까지(150ms 무입력) 감지를 잠근다.
import { onMounted, onUnmounted, ref } from 'vue'

const UNLOCK_DELAY = 150

export function useScrollSpy(getIds, { offset }) {
  const activeId = ref(null)
  let locked = false
  let unlockTimer = null

  function update() {
    const ids = getIds()
    if (!ids.length) {
      activeId.value = null
      return
    }
    // 페이지 끝에 닿으면 마지막 섹션 — 짧은 마지막 섹션이 기준선에 못 닿는 경우 대비
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      activeId.value = ids[ids.length - 1]
      return
    }
    let current = ids[0]
    for (const id of ids) {
      const el = document.getElementById(`section-${id}`)
      if (el && el.getBoundingClientRect().top - offset <= 0) current = id
    }
    activeId.value = current
  }

  function armUnlock() {
    clearTimeout(unlockTimer)
    unlockTimer = setTimeout(() => {
      locked = false
    }, UNLOCK_DELAY)
  }

  function handleScroll() {
    if (locked) {
      armUnlock()
      return
    }
    update()
  }

  function scrollTo(id) {
    activeId.value = id
    locked = true
    armUnlock()
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth' })
  }

  onMounted(() => {
    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
  })
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    clearTimeout(unlockTimer)
  })

  return { activeId, scrollTo, update }
}
