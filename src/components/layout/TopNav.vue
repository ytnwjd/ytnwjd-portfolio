<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IconBrandGithub, IconFileCv, IconMenu2, IconX } from '@tabler/icons-vue'
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

// 860px 이하에서는 .menu가 숨겨지므로, 같은 항목에 접근할 수 있는 햄버거 메뉴를 대신 띄운다
const isMobileMenuOpen = ref(false)

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function handleMobileNavClick(id) {
  closeMobileMenu()
  scrollToSection(id)
}

// 라우트 이동(다른 항목 클릭, 프로젝트 상세 진입 등) 후에는 메뉴가 열린 채로 남지 않도록 정리
watch(
  () => route.fullPath,
  () => closeMobileMenu(),
)

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
        <button type="button" class="menu-toggle" :aria-expanded="isMobileMenuOpen" aria-label="메뉴 열기"
          @click="isMobileMenuOpen = !isMobileMenuOpen">
          <IconX v-if="isMobileMenuOpen" :size="22" :stroke-width="1.75" />
          <IconMenu2 v-else :size="22" :stroke-width="1.75" />
        </button>
      </div>
    </div>

    <!-- 모바일 드롭다운 메뉴 — .menu가 숨겨지는 860px 이하에서 동일한 섹션 이동 기능을 제공 -->
    <nav v-if="isMobileMenuOpen" class="mobile-menu" aria-label="모바일 메뉴">
      <button v-for="item in navItems" :key="item.id" type="button" class="mobile-menu-item"
        :class="{ active: item.id === activeId }" @click="handleMobileNavClick(item.id)">
        {{ item.labelKo }}
        <span class="menu-item-en">({{ item.labelEn }})</span>
      </button>
      <a class="mobile-menu-item" :href="profile.github" target="_blank" rel="noopener" @click="closeMobileMenu">
        <IconBrandGithub :size="16" :stroke-width="1.75" />
        GitHub
      </a>
    </nav>
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

/* 햄버거 토글 — 데스크톱에서는 숨기고, 860px 이하에서만 노출 */
.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 999px;
  color: #ffffff;
  transition: background-color 0.2s ease;
}

.menu-toggle:hover {
  background: rgba(255, 255, 255, 0.12);
}

/* 모바일 드롭다운 — top-nav(position: sticky)를 기준으로 바로 아래에 펼쳐진다 */
.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: var(--color-ink);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.25);
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  font-weight: 500;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.mobile-menu-item:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.mobile-menu-item.active {
  color: #ffffff;
  background: var(--color-accent);
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

  .menu-toggle {
    display: flex;
  }
}
</style>
