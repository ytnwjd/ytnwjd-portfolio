<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { IconExternalLink, IconX } from '@tabler/icons-vue'
import activities from '@/data/activities'
import projects from '@/data/projects'

// 카테고리별 점 색상 — award는 사이트 전역에서 "성과"를 나타낼 때 쓰던 포인트 컬러를 그대로 이어받고,
// 나머지 4개는 그 톤과 어울리는 범위 안에서 서로 뚜렷이 구분되도록 지정
const CATEGORY_META = {
  oncampus: { label: '교내 활동', color: '#4C6EF5' },
  offcampus: { label: '교외 활동', color: '#12B886' },
  club: { label: '동아리', color: '#9775FA' },
  study: { label: '스터디', color: '#F5A623' },
  award: { label: '수상', color: 'var(--color-accent)' },
}
const legendItems = Object.entries(CATEGORY_META).map(([key, meta]) => ({ key, ...meta }))

function categoryColor(category) {
  return CATEGORY_META[category]?.color ?? 'var(--color-text-faint)'
}

// 연도는 위쪽 연도 구분자로 이미 표시되므로, 날짜 항목에는 월.일만 남긴다.
// 단, 종료일이 시작일과 다른 해로 넘어가면 종료일 쪽에만 축약 연도('YY)를 붙여 구분한다.
function formatMD(dateStr) {
  return `${dateStr.slice(5, 7)}.${dateStr.slice(8, 10)}`
}

function periodLabel(item) {
  if (!item.endDate) return formatMD(item.date)
  // endDate가 '~'면 아직 진행 중인 활동 — 종료일 없이 물결표만 이어 붙인다
  if (item.endDate === '~') return `${formatMD(item.date)} ~`
  const startYear = item.date.slice(0, 4)
  const endYear = item.endDate.slice(0, 4)
  const end =
    endYear === startYear
      ? formatMD(item.endDate)
      : `'${endYear.slice(2)}.${formatMD(item.endDate)}`
  return `${formatMD(item.date)} ~ ${end}`
}

function projectTitle(slug) {
  return projects.find((p) => p.slug === slug)?.title ?? slug
}

function publicAsset(path) {
  return `${import.meta.env.BASE_URL}${path}`
}

// 활동 사진 클릭 시 원본 크기로 확인할 수 있는 라이트박스
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

// 연도가 바뀌는 지점마다 연도 구분 행을 끼워 넣은 단일 타임라인 시퀀스를 만든다.
// side는 연도 행을 제외한 활동 항목의 순번으로만 매겨서 좌우가 끊기지 않고 번갈아 이어지게 한다.
const timelineEntries = computed(() => {
  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date))
  const entries = []
  let lastYear = null
  let activityIndex = 0
  for (const item of sorted) {
    const year = item.date.slice(0, 4)
    if (year !== lastYear) {
      entries.push({ type: 'year', key: `year-${year}`, year })
      lastYear = year
    }
    entries.push({
      type: 'activity',
      key: item.id,
      item,
      side: activityIndex % 2 === 0 ? 'left' : 'right',
    })
    activityIndex += 1
  }
  return entries
})
</script>

<template>
  <section id="activity" class="section">
    <span class="eyebrow">Beyond Code</span>
    <h2 class="giant-title">ACTIVITIES</h2>
    <p class="section-intro">2022년부터 지금까지 참여한 활동을 시간순으로 정리했습니다.</p>

    <!-- 카테고리 범례 -->
    <ul class="legend">
      <li v-for="cat in legendItems" :key="cat.key" class="legend-item">
        <span class="legend-dot" :style="{ backgroundColor: cat.color }"></span>
        {{ cat.label }}
      </li>
    </ul>

    <ol class="timeline">
      <template v-for="entry in timelineEntries" :key="entry.key">
        <li v-if="entry.type === 'year'" class="timeline-row timeline-row--year">
          <span class="timeline-year">{{ entry.year }}</span>
        </li>

        <li v-else :id="entry.item.id" class="timeline-row" :class="`timeline-row--${entry.side}`">
          <span
            class="timeline-marker"
            :style="{ backgroundColor: categoryColor(entry.item.category) }"
          ></span>

          <div class="side-block">
            <span class="timeline-date">{{ periodLabel(entry.item) }}</span>

            <div class="timeline-content">
              <h3 class="item-title">{{ entry.item.title }}</h3>
              <p v-if="entry.item.orgInfo" class="item-org">{{ entry.item.orgInfo }}</p>
              <p v-if="entry.item.role" class="item-role">{{ entry.item.role }}</p>

              <div v-if="entry.item.links?.length" class="item-links">
                <a
                  v-for="link in entry.item.links"
                  :key="link.url"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="item-link"
                >
                  <IconExternalLink :size="15" :stroke-width="2" />
                  {{ link.label }}
                </a>
              </div>

              <div v-if="entry.item.relatedProjects?.length" class="item-projects">
                <RouterLink
                  v-for="slug in entry.item.relatedProjects"
                  :key="slug"
                  :to="{ name: 'project-detail', params: { slug } }"
                  class="item-project-link"
                >
                  {{ projectTitle(slug) }} →
                </RouterLink>
              </div>
            </div>

            <div v-if="entry.item.photos?.length" class="item-attachments">
              <div class="item-photos">
                <button
                  v-for="(photo, i) in entry.item.photos"
                  :key="photo"
                  type="button"
                  class="item-photo-btn"
                  @click="openLightbox(publicAsset(photo), `${entry.item.title} 사진 ${i + 1}`)"
                >
                  <img
                    :src="publicAsset(photo)"
                    :alt="`${entry.item.title} 사진 ${i + 1}`"
                    class="item-photo-thumb"
                    loading="lazy"
                  />
                </button>
              </div>
            </div>
          </div>
        </li>
      </template>
    </ol>

    <!-- 활동 사진 라이트박스 -->
    <Teleport to="body">
      <div v-if="lightboxImage" class="lightbox-overlay" @click="closeLightbox">
        <button class="lightbox-close" @click.stop="closeLightbox" aria-label="닫기">
          <IconX :size="22" :stroke-width="2" />
        </button>
        <img :src="lightboxImage.src" :alt="lightboxImage.alt" class="lightbox-image" @click.stop />
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
/* 카테고리 범례 */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin: 28px 0 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 타임라인 — 가운데 세로선을 기준으로 항목이 좌우로 번갈아 배치된다 */
.timeline {
  position: relative;
  margin-top: 36px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--color-border);
  transform: translateX(-50%);
}

.timeline-row {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 56px;
}

.timeline-row:not(.timeline-row--year):not(:last-child) {
  margin-bottom: 22px;
}

.timeline-marker {
  position: absolute;
  top: 5px;
  left: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 0 4px var(--color-bg);
  z-index: 1;
}

/* 카드 없이 점 옆에 날짜, 그 옆에 본문이 나란히 놓인다.
   자식 순서는 항상 [날짜][본문][첨부]이고, 왼쪽 카드만 row-reverse로 뒤집어서
   첨부(사진)가 세로선에서 가장 먼 바깥쪽에 오도록 만든다. */
.side-block {
  display: flex;
  align-items: center;
  gap: 16px;
}

.timeline-row--left .side-block {
  grid-column: 1;
  flex-direction: row-reverse;
}

.timeline-row--right .side-block {
  grid-column: 2;
}

.timeline-date {
  flex-shrink: 0;
  margin-top: 3px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-faint);
  white-space: nowrap;
}

.timeline-content {
  min-width: 0;
}

/* 사진·링크 첨부 — 본문 옆, 세로선에서 먼 바깥쪽에 배치되는 블록 */
.item-attachments {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  flex-shrink: 0;
}

.timeline-row--year {
  display: flex;
  justify-content: center;
  margin: 8px 0 24px;
}

.timeline-row--year:not(:first-child) {
  margin-top: 16px;
}

.timeline-year {
  position: relative;
  z-index: 1;
  background: var(--color-bg);
  padding: 2px 20px;
  font-family: var(--font-mono);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-ink);
}

.item-title {
  font-size: 17.5px;
  font-weight: 700;
  color: var(--color-ink);
  word-break: keep-all;
}

.item-org {
  margin-top: 5px;
  color: var(--color-text-muted);
  font-size: 14.5px;
}

.item-role {
  margin-top: 5px;
  color: var(--color-text);
  font-size: 15px;
  line-height: 1.6;
  word-break: keep-all;
}

.item-projects {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  margin-top: 8px;
}

.item-project-link {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-accent);
  transition: color 0.2s ease;
}

.item-project-link:hover {
  color: var(--color-accent-dark);
}

/* 첨부 사진 썸네일 */
.item-photos {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.item-photo-btn {
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  line-height: 0;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

.item-photo-btn:hover {
  border-color: var(--color-accent);
  transform: translateY(-1px);
}

.item-photo-thumb {
  width: 120px;
  height: 120px;
  object-fit: cover;
  display: block;
}

/* 첨부 링크(노션 등) */
.item-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  margin-top: 8px;
}

.item-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-muted);
  transition: color 0.2s ease;
}

.item-link:hover {
  color: var(--color-accent);
}

/* 활동 사진 라이트박스 */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  z-index: 1000;
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
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white);
  transition: background-color 0.2s ease;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 화면이 좁아지면 좌우 교차 배치 대신 선을 왼쪽으로 옮기고 카드를 한 줄로 통일한다 */
@media (max-width: 640px) {
  .timeline::before {
    left: 17px;
    transform: none;
  }

  .timeline-row {
    grid-template-columns: 1fr;
    padding-left: 40px;
  }

  .timeline-row--left .side-block,
  .timeline-row--right .side-block {
    grid-column: 1;
    flex-direction: column;
  }

  .timeline-marker {
    left: 17px;
    transform: none;
  }

  .timeline-row--year {
    justify-content: flex-start;
    padding-left: 40px;
  }

  .timeline-year {
    background: none;
    padding: 0;
    font-size: 26px;
  }
}
</style>
