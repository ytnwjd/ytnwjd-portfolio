<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { IconUser, IconTools, IconFolder, IconAward, IconFileCv } from '@tabler/icons-vue'
import { useScrollSpy } from '@/composables/useScrollSpy'
import { profile } from '@/data/profile'
import { skillCategories } from '@/data/skills'
import projects from '@/data/projects'
import activities from '@/data/activities'

// 인디케이터 높이 — 항목마다 하위에 범례/서브앵커가 붙어 높이가 달라지므로,
// 세로 위치(top)는 실제 DOM에서 측정하고 높이만 버튼 자체 높이(라벨 2줄 기준)로 고정
const NAV_ITEM_HEIGHT = 56

const navItems = [
  { id: 'about', labelKo: '소개', labelEn: 'About Me', icon: IconUser },
  {
    id: 'skills',
    labelKo: '기술 스택',
    labelEn: 'Tech Skills',
    icon: IconTools,
    count: skillCategories.reduce((sum, category) => sum + category.skills.length, 0),
    legend: '많이 해봤어요 · 해본 적 있어요 · 알아가고 있어요',
  },
  {
    id: 'projects',
    labelKo: '프로젝트',
    labelEn: 'Project',
    icon: IconFolder,
    count: projects.length,
  },
  {
    id: 'activity',
    labelKo: '교내외 활동',
    labelEn: 'Activity',
    icon: IconAward,
    count: activities.length,
    children: [
      { id: 'activity-oncampus', label: '교내 활동' },
      { id: 'activity-offcampus', label: '교외 활동' },
    ],
  },
]

const TOP_LEVEL_IDS = navItems.map((item) => item.id)
const SUB_IDS = navItems.flatMap((item) => item.children?.map((child) => child.id) ?? [])

const { ratios } = useScrollSpy([...TOP_LEVEL_IDS, ...SUB_IDS])

function pickMostVisible(ids) {
  let maxId = null
  let maxRatio = 0
  ids.forEach((id) => {
    const ratio = ratios.get(id) ?? 0
    if (ratio > maxRatio) {
      maxRatio = ratio
      maxId = id
    }
  })
  return maxId
}

// "04"는 교내/교외 두 하위 섹션을 감싸고 있어 자기 자신도 ratio를 갖기 때문에,
// 상위 활성 항목은 상위 id들끼리만, 하위 활성 항목은 하위 id들끼리만 비교해야 함
const activeId = computed(() => pickMostVisible(TOP_LEVEL_IDS) ?? TOP_LEVEL_IDS[0])
const activeSubId = computed(() => pickMostVisible(SUB_IDS))

const activeIndex = computed(() => navItems.findIndex((item) => item.id === activeId.value))

const navButtonRefs = ref([])
const indicatorStyle = ref({ transform: 'translateY(0px)', height: `${NAV_ITEM_HEIGHT}px` })

function updateIndicatorPosition() {
  const el = navButtonRefs.value[Math.max(activeIndex.value, 0)]
  if (!el) return
  indicatorStyle.value = {
    transform: `translateY(${el.offsetTop}px)`,
    height: `${NAV_ITEM_HEIGHT}px`,
  }
}

onMounted(async () => {
  await nextTick()
  updateIndicatorPosition()
})

watch(activeIndex, async () => {
  await nextTick()
  updateIndicatorPosition()
})

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <p class="name">유수정</p>
      <p class="tagline">Full-cycle Dev</p>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-track">
        <div class="nav-track-bg"></div>
        <div class="nav-track-indicator" :style="indicatorStyle"></div>
      </div>

      <ul class="nav-list">
        <li v-for="item in navItems" :key="item.id">
          <button ref="navButtonRefs" type="button" class="nav-item" :class="{ active: item.id === activeId }"
            @click="scrollToSection(item.id)">
            <component :is="item.icon" class="nav-icon" :size="24" :stroke-width="1.75" />
            <span class="nav-label">
              <span class="nav-label-ko">{{ item.labelKo }}</span>
              <span class="nav-label-en">({{ item.labelEn }})</span>
            </span>
            <span v-if="item.count !== undefined" class="nav-badge">{{ item.count }}</span>
          </button>

          <p v-if="item.legend" class="nav-legend">{{ item.legend }}</p>

          <ul v-if="item.children" class="nav-sublist">
            <li v-for="child in item.children" :key="child.id">
              <button type="button" class="nav-subitem" :class="{ active: child.id === activeSubId }"
                @click="scrollToSection(child.id)">
                {{ child.label }}
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <ul class="contact-list">
        <li class="contact-item">
          <span class="contact-label">이메일</span>
          <span class="contact-sep">:</span>
          <a class="contact-value" :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        </li>
        <li class="contact-item">
          <span class="contact-label">GitHub</span>
          <span class="contact-sep">:</span>
          <a class="contact-value" :href="profile.github" target="_blank" rel="noopener">
            {{ profile.github.replace('https://', '') }}
          </a>
        </li>
        <li class="contact-item">
          <span class="contact-label">블로그</span>
          <span class="contact-sep">:</span>
          <a v-if="profile.blog" class="contact-value" :href="profile.blog" target="_blank" rel="noopener">
            {{ profile.blog.replace('https://', '') }}
          </a>
          <span v-else class="contact-value contact-value-empty">준비 중</span>
        </li>
      </ul>

      <a href="/resume.pdf" download class="resume-link" aria-label="이력서 PDF 다운로드">
        <IconFileCv :size="18" :stroke-width="1.75" />
        <span>PDF 다운로드</span>
      </a>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  width: 280px;
  height: 100vh;
  /* 상단 여백을 콘텐츠 섹션의 padding-top(96px)과 맞춰 About 제목과 높이를 나란히 맞춤 */
  padding: 96px 24px 40px;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: 8px 0 24px rgba(0, 0, 0, 0.25);
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  margin-bottom: 48px;
}

.name {
  font-size: 24px;
  font-weight: 600;
}

.tagline {
  color: var(--color-text-muted);
  font-size: 16px;
}

.sidebar-nav {
  position: relative;
  /* 왼쪽에 절대 위치로 배치되는 트랙/인디케이터 공간 확보 (텍스트와 겹침 방지) */
  padding-left: 16px;
}

.nav-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
}

.nav-track-bg {
  position: absolute;
  inset: 0;
  background: var(--color-border);
}

.nav-track-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  background: var(--color-point-1);
  transition:
    transform 0.3s ease,
    height 0.3s ease;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 56px;
  padding: 0 12px;
  border-radius: 6px;
  color: var(--color-text-muted);
  text-align: left;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.nav-item.active {
  background: var(--color-point-1-soft);
  color: var(--color-point-1);
  box-shadow: 0 2px 8px rgba(56, 189, 248, 0.2);
}

.nav-icon {
  flex-shrink: 0;
}

.nav-label {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.nav-label-ko {
  font-size: 16px;
  font-weight: 500;
}

.nav-label-en {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 400;
}

.nav-item.active .nav-label-en {
  color: inherit;
  opacity: 0.75;
}

.nav-badge {
  padding: 1px 7px;
  border: 1px solid var(--color-point-2);
  border-radius: 999px;
  color: var(--color-point-2);
  font-size: 11px;
  font-weight: 600;
}

.nav-legend {
  padding: 0 12px 12px 46px;
  color: var(--color-text-muted);
  font-size: 8px;
  line-height: 1.5;
}

.nav-sublist {
  display: flex;
  flex-direction: column;
  padding-bottom: 8px;
}

.nav-subitem {
  width: 100%;
  padding: 6px 12px 6px 46px;
  color: var(--color-text-muted);
  font-size: 14px;
  text-align: left;
  transition: color 0.2s ease;
}

.nav-subitem.active {
  color: var(--color-point-1);
  font-weight: 600;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 12px;
}

.contact-label {
  color: var(--color-text-muted);
  font-weight: 600;
}

.contact-sep {
  color: var(--color-text-muted);
}

.contact-value {
  color: var(--color-text);
  word-break: break-all;
  transition: color 0.2s ease;
}

a.contact-value:hover {
  color: var(--color-point-1);
}

.contact-value-empty {
  color: var(--color-text-muted);
  font-style: italic;
}

.resume-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 500;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.resume-link:hover {
  border-color: var(--color-point-1);
  color: var(--color-point-1);
}
</style>
