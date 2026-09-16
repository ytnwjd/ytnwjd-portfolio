<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IconBrandGithub, IconFileCv } from '@tabler/icons-vue'
import { profile } from '@/data/profile'

const navItems = [
  { id: 'about', labelKo: '소개', labelEn: 'About' },
  { id: 'skills', labelKo: '기술 스택', labelEn: 'Skills' },
  { id: 'projects', labelKo: '프로젝트', labelEn: 'Projects' },
  { id: 'activity', labelKo: '활동', labelEn: 'Activity' },
]

// 플로팅 위젯에는 자리 제약상 짧은 핵심 항목만 노출
const floatingItems = [
  { id: 'projects', label: 'Projects' },
  { id: 'activity', label: 'Activity' },
]

const route = useRoute()
const router = useRouter()

const SECTION_IDS = navItems.map((item) => item.id)

// 섹션마다 높이가 크게 달라 IntersectionObserver의 "노출 비율" 기준은 부정확하므로,
// 뷰포트 상단(네비 바로 아래) 기준선을 통과한 마지막 섹션을 active로 판단한다
const rawActiveId = ref(SECTION_IDS[0])
const ACTIVE_LINE_OFFSET = 140

function updateActiveSection() {
  let current = SECTION_IDS[0]
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top - ACTIVE_LINE_OFFSET <= 0) {
      current = id
    }
  }
  rawActiveId.value = current
}

onMounted(() => {
  updateActiveSection()
  window.addEventListener('scroll', updateActiveSection, { passive: true })
  window.addEventListener('resize', updateActiveSection)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateActiveSection)
  window.removeEventListener('resize', updateActiveSection)
})

// 상세 페이지(/projects/:slug)에서는 관찰 대상 섹션이 DOM에 없으므로
// "프로젝트" 항목을 강제로 활성 표시
const isProjectDetail = computed(() => route.name === 'project-detail')
const activeId = computed(() => (isProjectDetail.value ? 'projects' : rawActiveId.value))

function scrollToSection(id) {
  const el = document.getElementById(id)

  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
    router.push({ path: route.path, hash: `#${id}` })
  } else {
    router.push({ path: '/', hash: `#${id}` })
  }
}

function scrollToTop() {
  const el = document.getElementById('about')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
    router.push({ path: route.path, hash: '#about' })
  } else {
    router.push({ path: '/', hash: '#about' })
  }
}
</script>

<template>
  <header class="top-nav">
    <div class="top-nav-inner">
      
      <nav class="menu">
        <button v-for="item in navItems" :key="item.id" type="button" class="menu-item"
          :class="{ active: item.id === activeId }" @click="scrollToSection(item.id)">
          {{ item.labelKo }}
          <span class="menu-item-en">({{ item.labelEn }})</span>
        </button>
      </nav>

      <div class="actions">
        <a class="btn btn--ghost action-github" :href="profile.github" target="_blank" rel="noopener">
          <IconBrandGithub :size="16" :stroke-width="1.75" />
          GitHub
        </a>
        <a class="btn btn--fill" href="/resume.pdf" download aria-label="이력서 PDF 다운로드">
          <IconFileCv :size="16" :stroke-width="1.75" />
          이력서
        </a>
      </div>
    </div>
  </header>

  <div class="floating-nav" role="navigation" aria-label="빠른 이동">
    <button type="button" class="pill pill-logo" @click="scrollToTop" aria-label="맨 위로">Y.</button>
    <button v-for="item in floatingItems" :key="item.id" type="button" class="pill"
      :class="{ active: item.id === activeId }" @click="scrollToSection(item.id)">
      {{ item.label }}
    </button>
  </div>
</template>

<style scoped>
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--nav-height);
  background: var(--color-ink);
  color: #ffffff;
}

.top-nav-inner {
  display: flex;
  align-items: center;
  gap: 32px;
  height: 100%;
  max-width: 1260px;
  margin: 0 auto;
  padding: 0 40px;
}

.logo {
  flex-shrink: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #ffffff;
}

.logo-dot {
  color: var(--color-text-faint);
}

.menu {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.menu-item {
  padding: 8px 16px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.menu-item-en {
  margin-left: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
}

.menu-item.active {
  color: #ffffff;
  background: var(--color-accent);
}

.menu-item.active .menu-item-en {
  color: rgba(255, 255, 255, 0.55);
}

.menu-item:hover {
  color: #ffffff;
}

.actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
}

.action-github {
  border-color: rgba(255, 255, 255, 0.35);
  color: #ffffff;
}

.action-github:hover {
  border-color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.actions .btn--fill {
  background: #ffffff;
  border-color: #ffffff;
  color: var(--color-ink);
}

.actions .btn--fill:hover {
  background: rgba(255, 255, 255, 0.85);
}

/* 플로팅 알약 내비 — awwwards 식 좌하단 고정 위젯 */
.floating-nav {
  position: fixed;
  left: 24px;
  bottom: 24px;
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border-radius: 999px;
  background: var(--color-ink);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.pill {
  padding: 8px 16px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 600;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.pill-logo {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
}

.pill.active {
  color: #ffffff;
  background: var(--color-accent);
}

.pill:hover {
  color: #ffffff;
}

@media (max-width: 860px) {
  .menu {
    display: none;
  }

  .action-github {
    display: none;
  }
}
</style>
