<script setup>
import HeroSection from './HeroSection.vue'
import { profile } from '@/data/profile'
import { aboutMe } from '@/data/aboutMe'
import { certifications } from '@/data/certifications'
</script>

<template>
  <section id="about" class="section">
    <h1 class="headline">🔥 Full-cycle 개발자 유수정 입니다!</h1>

    <div class="about-grid">
      <div class="photo" role="img" aria-label="프로필 사진"></div>

      <ul class="info-list">
        <li class="info-item">
          <span class="info-label">🎂 Birth</span>
          <span class="info-value">{{ profile.birth }}</span>
        </li>
        <li class="info-item">
          <span class="info-label">🏫 Univ.</span>
          <span class="info-value">{{ profile.university }}</span>
          <span class="info-value-sub">{{ profile.universityPeriod }}</span>
        </li>
        <li class="info-item">
          <span class="info-label">✉️ E-Mail</span>
          <a class="info-value info-link" :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        </li>
        <li class="info-item">
          <span class="info-label">🐱 Github</span>
          <a class="info-value info-link" :href="profile.github" target="_blank" rel="noopener">
            {{ profile.github.replace('https://', '') }}
          </a>
        </li>
      </ul>

      <div class="about-me">
        <h2 class="subsection-title">📖 About me</h2>
        <ul class="about-me-list">
          <li v-for="(item, index) in aboutMe" :key="index" class="about-me-item">
            <span class="about-me-emoji">{{ item.emoji }}</span>
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

    <div class="hero">
      <HeroSection />
    </div>

    <div class="certifications">
      <h2 class="subsection-title">🏅 Certifications</h2>
      <div class="certifications-grid">
        <div v-for="cert in certifications" :key="cert.name" class="certification-card">
          <span class="certification-name">{{ cert.name }}</span>
          <span class="certification-grade">{{ cert.grade }}</span>
          <span class="certification-date">취득일: {{ cert.date }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.headline {
  margin-bottom: 40px;
  font-size: 28px;
  font-weight: 700;
}

.about-grid {
  display: grid;
  grid-template-columns: 220px 260px 1fr;
  align-items: center;
  gap: 60px;
  margin-bottom: 64px;
}

.photo {
  aspect-ratio: 3 / 4;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-surface);
  background-image: url('/images/ytnwjd.jpg');
  background-size: cover;
  background-position: center;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 0;
}

.info-item:not(:last-child) {
  border-bottom: 0.5px solid var(--color-border);
}

.info-label {
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 600;
}

.info-value {
  font-size: 16px;
}

.info-value-sub {
  color: var(--color-text-muted);
  font-size: 14px;
}

.info-link {
  color: var(--color-point-1);
  word-break: break-all;
}

.about-me {
  margin-left: 24px;
}

.about-me-list {
  display: flex;
  flex-direction: column;
}

.about-me-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 0;
}

.about-me-item:not(:last-child)::after {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0.5px;
  background: var(--color-border);
  content: '';
}

.about-me-text {
  font-size: 16px;
  line-height: 1.7;
}

.highlight {
  color: var(--color-point-2);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.hero {
  margin: 0 0 100px;
}

.certifications {
  margin-top: 40px;
}

.certifications-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.certification-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 24px;
}

.certification-name {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
}

.certification-grade {
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 600;
}

.certification-date {
  color: var(--color-text-muted);
  font-size: 14px;
}

@media (max-width: 900px) {
  .about-grid {
    grid-template-columns: 1fr;
  }

  .photo {
    max-width: 260px;
  }

  .certifications-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .certifications-grid {
    grid-template-columns: 1fr;
  }
}
</style>
