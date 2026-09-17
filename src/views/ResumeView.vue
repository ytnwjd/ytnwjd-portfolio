<!-- src/views/ResumeView.vue -->
<!-- 인쇄/PDF 전용 이력서 페이지. 웹사이트의 카드·radius·그림자·accent 컬러 등 시각 스타일을
     적용하지 않고, 흑백 텍스트 위주의 담백한 문서 레이아웃으로 별도 제작한다.
     빌드 시 scripts/generate-resume-pdf.js가 이 라우트를 Puppeteer로 열어 PDF로 저장한다. -->
<script setup>
import { computed } from 'vue'
import { profile } from '@/data/profile'
import { skillCategories } from '@/data/skills'
import projects from '@/data/projects'
import activities from '@/data/activities'
import { certifications } from '@/data/certifications'

const INTRO =
  '기획부터 개발, 배포, 운영까지 서비스의 전체 생명주기를 스스로 책임지는 Full-cycle Developer 유수정입니다.'

const photoSrc = `${import.meta.env.BASE_URL}images/ytnwjd.jpg`

const LEVEL_LABEL = {
  high: '다수 사용',
  mid: '사용 경험',
  learning: '학습 중',
}

// 카테고리별로 숙련도 그룹을 묶어 "React.js, Vue.js (다수 사용)" 형태의 한 줄 요약을 만든다
const skillLines = computed(() =>
  skillCategories.map((cat) => {
    const groups = ['high', 'mid', 'learning']
      .map((level) => {
        const names = cat.skills.filter((s) => s.level === level).map((s) => s.name)
        return names.length ? `${names.join(', ')} (${LEVEL_LABEL[level]})` : null
      })
      .filter(Boolean)
    return { category: cat.category, text: groups.join(' · ') }
  }),
)

const featuredProjects = computed(() => projects.filter((p) => p.featured))

const featuredActivities = computed(() => {
  return [...activities]
    .filter((a) => a.featured)
    .sort((a, b) => a.date.localeCompare(b.date))
})

function formatDate(dateStr) {
  return dateStr.replaceAll('-', '.')
}

function periodLabel(item) {
  if (!item.endDate) return formatDate(item.date)
  if (item.endDate === '~') return `${formatDate(item.date)} ~`
  return `${formatDate(item.date)} ~ ${formatDate(item.endDate)}`
}
</script>

<template>
  <div class="resume-page">
    <!-- 헤더: 사진 · 이름 · 한 줄 소개 · 연락처 -->
    <header class="r-header">
      <div class="r-header-main">
        <h1 class="r-name">유수정</h1>
        <p class="r-role">Full-cycle Developer</p>
        <p class="r-intro">{{ INTRO }}</p>
        <ul class="r-contacts">
          <li>{{ profile.email }}</li>
          <li>{{ profile.github }}</li>
          <li v-if="profile.blog">{{ profile.blog }}</li>
        </ul>
      </div>
      <img class="r-photo" :src="photoSrc" alt="유수정 프로필 사진" />
    </header>

    <!-- Skills -->
    <section class="r-section">
      <h2 class="r-section-title">Skills</h2>
      <ul class="r-skill-list">
        <li v-for="line in skillLines" :key="line.category" class="r-skill-row">
          <span class="r-skill-category">{{ line.category }}</span>
          <span class="r-skill-text">{{ line.text }}</span>
        </li>
      </ul>
    </section>

    <!-- Projects -->
    <section class="r-section">
      <h2 class="r-section-title">Projects</h2>
      <article v-for="project in featuredProjects" :key="project.slug" class="r-project">
        <div class="r-project-head">
          <h3 class="r-project-title">{{ project.title }}</h3>
          <span class="r-project-period">{{ project.period }}</span>
        </div>
        <p class="r-project-meta">{{ project.organization }} · {{ project.type }}</p>
        <p class="r-project-summary">{{ project.summary }}</p>
        <ul v-if="project.result?.length" class="r-project-result">
          <li v-for="(res, idx) in project.result" :key="idx">{{ res }}</li>
        </ul>
        <p v-if="project.techStack?.length" class="r-project-stack">{{ project.techStack.join(', ') }}</p>
      </article>
    </section>

    <!-- Activities & Awards -->
    <section class="r-section">
      <h2 class="r-section-title">Activities &amp; Awards</h2>
      <ul class="r-activity-list">
        <li v-for="item in featuredActivities" :key="item.id" class="r-activity">
          <div class="r-activity-head">
            <span class="r-activity-title">
              <template v-if="item.category === 'award'">🏆 </template>{{ item.title }}
            </span>
            <span class="r-activity-period">{{ periodLabel(item) }}</span>
          </div>
          <p v-if="item.orgInfo" class="r-activity-org">{{ item.orgInfo }}</p>
          <p v-if="item.role" class="r-activity-role">{{ item.role }}</p>
        </li>
      </ul>
    </section>

    <!-- Certifications -->
    <section class="r-section">
      <h2 class="r-section-title">Certifications</h2>
      <ul class="r-cert-list">
        <li v-for="cert in certifications" :key="cert.name" class="r-cert">
          <span class="r-cert-name">{{ cert.name }}</span>
          <span class="r-cert-grade">{{ cert.grade }}</span>
          <span class="r-cert-date">{{ cert.date }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
/* 인쇄/문서용 담백한 레이아웃 — 웹사이트의 accent 컬러·카드·그림자 등은 의도적으로 배제 */
.resume-page {
    max-width: 720px;
    margin: 0 auto;
    padding: 48px 40px 80px;
    background: #ffffff;
    color: #111111;
    font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Pretendard', Roboto, sans-serif;
    font-size: 13.5px;
    line-height: 1.6;
}

.r-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    padding-bottom: 20px;
    border-bottom: 2px solid #111111;
}

.r-header-main {
    min-width: 0;
    flex: 1;
}

.r-photo {
    flex-shrink: 0;
    width: 96px;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    object-position: center 15%;
    border: 1px solid #cccccc;
}

.r-name {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.01em;
}

.r-role {
    margin-top: 4px;
    font-size: 14px;
    font-weight: 600;
    color: #444444;
}

.r-intro {
    margin-top: 10px;
    color: #333333;
}

.r-contacts {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    margin-top: 12px;
    color: #444444;
    font-size: 12.5px;
}

.r-contacts li {
    list-style: none;
}

.r-section {
    margin-top: 28px;
    break-inside: avoid;
}

.r-section-title {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding-bottom: 6px;
    margin-bottom: 14px;
    border-bottom: 1px solid #cccccc;
}

/* Skills */
.r-skill-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.r-skill-row {
    display: flex;
    gap: 12px;
    list-style: none;
}

.r-skill-category {
    flex-shrink: 0;
    width: 84px;
    font-weight: 700;
    color: #111111;
}

.r-skill-text {
    color: #333333;
}

/* Projects */
.r-project {
    break-inside: avoid;
    margin-bottom: 20px;
}

.r-project:last-child {
    margin-bottom: 0;
}

.r-project-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
}

.r-project-title {
    font-size: 14.5px;
    font-weight: 700;
}

.r-project-period {
    flex-shrink: 0;
    font-size: 12px;
    color: #555555;
}

.r-project-meta {
    margin-top: 2px;
    font-size: 12px;
    color: #555555;
}

.r-project-summary {
    margin-top: 6px;
    color: #222222;
}

.r-project-result {
    margin-top: 6px;
    padding-left: 16px;
    color: #222222;
}

.r-project-result li {
    list-style: disc;
}

.r-project-stack {
    margin-top: 6px;
    font-size: 12px;
    color: #666666;
}

/* Activities */
.r-activity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.r-activity {
    break-inside: avoid;
    list-style: none;
}

.r-activity-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
}

.r-activity-title {
    font-weight: 700;
}

.r-activity-period {
    flex-shrink: 0;
    font-size: 12px;
    color: #555555;
}

.r-activity-org,
.r-activity-role {
    margin-top: 2px;
    font-size: 12.5px;
    color: #444444;
}

/* Certifications */
.r-cert-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.r-cert {
    display: flex;
    align-items: baseline;
    gap: 10px;
    list-style: none;
}

.r-cert-name {
    font-weight: 700;
    min-width: 160px;
}

.r-cert-grade {
    color: #444444;
}

.r-cert-date {
    margin-left: auto;
    font-size: 12px;
    color: #666666;
}

/* 인쇄 시에만 적용 — 화면 미리보기에서는 일반 스크롤 페이지로 보이면 된다 */
@media print {
    @page {
        size: A4;
        margin: 16mm 14mm;
    }

    .resume-page {
        max-width: none;
        padding: 0;
    }

    .r-section {
        break-inside: avoid;
    }
}
</style>
