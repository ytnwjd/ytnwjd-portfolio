<script setup>
import HeroSection from './HeroSection.vue'
import { profile } from '@/data/profile'
import { aboutMe } from '@/data/aboutMe'
import { certifications } from '@/data/certifications'

const FULL_CYCLE_DEVELOPER_DESC =
  'Full-cycle Developer란, 기획부터 배포, 운영까지 SDLC 전 과정을 스스로 책임지는 개발자를 뜻합니다.'

// Hero 배경 — Full-cycle 순환 고리 클러스터 (SVG)
function toRad(deg) { return (deg * Math.PI) / 180 }
function pt(cx, cy, r, deg) {
  const rad = toRad(deg)
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}
function f(n) { return +n.toFixed(2) }

function makeArcPath(cx, cy, r, s, e) {
  const [x1, y1] = pt(cx, cy, r, s)
  const [x2, y2] = pt(cx, cy, r, e)
  const span = ((e - s) + 360) % 360
  return `M ${f(x1)} ${f(y1)} A ${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${f(x2)} ${f(y2)}`
}

function makeArrowPath(cx, cy, r, endDeg, size = 5) {
  const [ex, ey] = pt(cx, cy, r, endDeg)
  const rad = toRad(endDeg)
  const tx = -Math.sin(rad), ty = Math.cos(rad) // SVG(y-down) 시계방향 접선
  const ox = Math.cos(rad), oy = Math.sin(rad)  // 반지름 방향(outward), 접선의 수직
  const b1 = [f(ex - tx * size + ox * size * 0.42), f(ey - ty * size + oy * size * 0.42)]
  const b2 = [f(ex - tx * size - ox * size * 0.42), f(ey - ty * size - oy * size * 0.42)]
  return `M ${b1[0]} ${b1[1]} L ${f(ex)} ${f(ey)} L ${b2[0]} ${b2[1]}`
}

function makeDots(cx, cy, r, s, e, count) {
  const span = ((e - s) + 360) % 360
  return Array.from({ length: count }, (_, i) => {
    const [x, y] = pt(cx, cy, r, s + (span / (count - 1)) * i)
    return { x: f(x), y: f(y) }
  })
}

const cycles = [
  { cx: 148,  cy: 128, r: 56, s: -80, gap: 42, n: 5, dur: 28 },
  { cx: 820,  cy: 72,  r: 40, s:  20, gap: 50, n: 4, dur: 22 },
  { cx: 1350, cy: 180, r: 62, s: 140, gap: 36, n: 6, dur: 32 },
  { cx: 440,  cy: 320, r: 46, s: 200, gap: 44, n: 5, dur: 25 },
  { cx: 1160, cy: 285, r: 50, s: -20, gap: 40, n: 5, dur: 30 },
].map(({ cx, cy, r, s, gap, n, dur }) => {
  const e = s + (360 - gap)
  return { cx, cy, dur, arc: makeArcPath(cx, cy, r, s, e), arrow: makeArrowPath(cx, cy, r, e), dots: makeDots(cx, cy, r, s, e, n) }
})
</script>

<template>
  <section id="about" class="section hero-section">
    <div class="hero-stage">
      <svg
        class="hero-canvas"
        aria-hidden="true"
        viewBox="0 0 1440 420"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          v-for="(c, i) in cycles"
          :key="i"
          class="cycle-cluster"
          :style="`transform-origin: ${c.cx}px ${c.cy}px; animation-duration: ${c.dur}s`"
        >
          <path :d="c.arc" class="cycle-arc" />
          <path :d="c.arrow" class="cycle-arrow" />
          <circle v-for="(dot, j) in c.dots" :key="j" :cx="dot.x" :cy="dot.y" r="2" class="cycle-dot" />
        </g>
      </svg>
      <span class="eyebrow">Portfolio · Full-cycle Developer</span>
      <h1 class="giant-title outline">유수정</h1>
      <p class="hero-tagline">
        <span>단편적인 문제 해결보다 근본 원인을 찾아 해결하고,</span>
        <span>운영 안정화까지 책임지는 Full-cycle 개발자 유수정입니다!</span>
      </p>
    </div>

    <!-- 명함(ID card) — 사진을 카드 가장 왼쪽에 통째로 붙이고, 연락처와 About Me까지 한 장의 카드 안에 모두 담는다 -->
    <div class="id-card">
      <div class="id-card-photo" role="img" aria-label="프로필 사진"></div>

      <div class="id-card-body">
        <div class="id-card-header">
          <p class="id-card-name">유수정</p>
          <p class="id-card-role">Full-cycle Developer</p>
          <p class="id-card-role-desc">{{ FULL_CYCLE_DEVELOPER_DESC }}</p>

          <ul class="id-card-info">
            <li class="id-card-row">
              <span class="id-card-label">Birth</span>
              <span class="id-card-value">{{ profile.birth }}</span>
            </li>
            <li class="id-card-row">
              <span class="id-card-label">Univ.</span>
              <span class="id-card-value"
                >{{ profile.university }} ({{ profile.universityPeriod }})</span
              >
            </li>
            <li class="id-card-row">
              <span class="id-card-label">E-Mail</span>
              <a class="id-card-value id-card-link" :href="`mailto:${profile.email}`">{{
                profile.email
              }}</a>
            </li>
          </ul>
        </div>

        <div class="about-me">
          <span class="eyebrow">About Me</span>
          <ul class="about-me-list">
            <li v-for="(item, index) in aboutMe" :key="index" class="about-me-item">
              <span class="about-me-emoji" aria-hidden="true">{{ item.emoji }}</span>
              <p class="about-me-text">
                <template v-for="(fragment, fragIndex) in item.fragments" :key="fragIndex">
                  <strong v-if="fragment.highlight" class="highlight">{{ fragment.text }}</strong>
                  <template v-else>{{ fragment.text }}</template>
                </template>
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="hero-kpi">
      <HeroSection />
    </div>

    <div class="certifications">
      <span class="eyebrow">Certifications</span>
      <div class="certifications-grid">
        <div v-for="cert in certifications" :key="cert.name" class="certification-card">
          <span class="certification-name">{{ cert.name }}</span>
          <span class="certification-grade">{{ cert.grade }}</span>
          <span class="certification-date">취득일 {{ cert.date }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-stage {
  position: relative;
  padding: 24px 0;
}

.hero-canvas {
  position: absolute;
  inset: -40px -20px;
  width: calc(100% + 40px);
  height: calc(100% + 80px);
}

.cycle-arc {
  stroke: rgba(0, 0, 0, 0.12);
  stroke-width: 1;
  fill: none;
}

.cycle-arrow {
  stroke: rgba(0, 0, 0, 0.14);
  stroke-width: 1;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.cycle-dot {
  fill: rgba(0, 0, 0, 0.35);
}

.cycle-cluster {
  animation: cycle-spin linear infinite;
}

@keyframes cycle-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .cycle-cluster {
    animation: none;
  }
}

.hero-stage .eyebrow,
.hero-stage .giant-title,
.hero-stage .hero-tagline {
  position: relative;
}

.hero-tagline {
  margin-top: 50px;
  color: var(--color-accent);
  font-size: 30px;
  font-weight: 600;
  line-height: 1.65;
}

.hero-tagline span {
  display: block;
}

/* 명함(ID card) — 사진 한 장이 카드 왼쪽 전체 높이를 차지하고, 오른쪽에 연락처와 About Me까지
   한 장의 카드 안에 모두 담아 "하나의 큰 명함"처럼 보이게 한다 */
.id-card {
  display: flex;
  align-items: center;
  margin-top: 64px;
  margin-bottom: 96px;
  border: 1px solid var(--color-border);
  border-top: 4px solid var(--color-accent);
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.07);
}

.id-card-photo {
  flex-shrink: 0;
  width: 320px;
  aspect-ratio: 3 / 4;
  margin-left: 36px;
  border-radius: 8px;
  background-color: var(--color-bg-alt);
  background-image: url('/images/ytnwjd.jpg');
  background-size: cover;
  background-position: center 15%;
}

.id-card-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  padding: 48px 56px;
}

.id-card-header {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.id-card-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-ink);
  letter-spacing: -0.01em;
}

.id-card-role {
  margin-top: 4px;
  color: var(--color-accent);
  font-size: 15px;
  font-weight: 600;
}

.id-card-role-desc {
  margin: 0px 0 8px 0;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.id-card-info {
  display: flex;
  flex-wrap: wrap;
  column-gap: 36px;
  row-gap: 8px;
  margin-top: 0;
}

.id-card-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0;
  font-size: 15px;
}

.id-card-label {
  flex-shrink: 0;
  width: 46px;
  font-family: var(--font-mono);
  color: var(--color-text-faint);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.id-card-value {
  min-width: 0;
  color: var(--color-text);
  word-break: break-all;
}

.id-card-link {
  transition: color 0.2s ease;
}

.id-card-link:hover {
  color: var(--color-accent);
}

.about-me {
  margin-top: 28px;
}

.about-me .eyebrow {
  margin-bottom: 0;
}

.about-me-list {
  display: flex;
  flex-direction: column;
  margin-top: 0;
}

.about-me-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
}

.about-me-item:not(:last-child)::after {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--color-border);
  content: '';
}

.about-me-emoji {
  font-size: 18px;
}

.about-me-text {
  font-size: 15.5px;
  line-height: 1.7;
}

.highlight {
  font-weight: 700;
  color: var(--color-accent-dark);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.hero-kpi {
  margin-bottom: 96px;
}

.certifications-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  margin-top: 24px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
}

.certification-card {
  display: flex;
  flex-direction: column;
  padding: 34px 28px;
  background: var(--color-bg);
  transition: background-color 0.2s ease;
}

.certification-card:hover {
  background: var(--color-bg-alt);
}

.certification-name {
  display: block;
  color: var(--color-accent);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.certification-grade {
  display: block;
  margin-top: 14px;
  font-family: var(--font-mono);
  color: var(--color-text-faint);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.certification-date {
  display: block;
  margin-top: 4px;
  color: var(--color-text-muted);
  font-size: 15px;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .id-card {
    flex-direction: column;
  }

  .id-card-photo {
    width: 220px;
    margin: 24px 0 0;
  }

  .id-card-body {
    padding: 32px 28px;
  }

  .certifications-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .hero-tagline {
    font-size: 14px;
  }

  .certifications-grid {
    grid-template-columns: 1fr;
  }
}
</style>
