<script setup>
import { IconArticle, IconBrandGithub, IconMail } from '@tabler/icons-vue'
import { profile } from '@/data/profile'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <p class="footer-logo">유수정<span class="footer-logo-dot">.</span></p>
          <p class="footer-role">Full-cycle Developer</p>
          <span class="footer-accent-bar" aria-hidden="true"></span>

          <div class="footer-social">
            <a class="footer-social-link" :href="`mailto:${profile.email}`" aria-label="이메일">
              <IconMail :size="18" :stroke-width="1.75" />
            </a>
            <a class="footer-social-link" :href="profile.github" target="_blank" rel="noopener" aria-label="GitHub">
              <IconBrandGithub :size="18" :stroke-width="1.75" />
            </a>
            <a v-if="profile.blog" class="footer-social-link" :href="profile.blog" target="_blank" rel="noopener"
              aria-label="블로그">
              <IconArticle :size="18" :stroke-width="1.75" />
            </a>
          </div>
        </div>

        <div class="footer-columns">
          <div class="footer-col">
            <p class="footer-col-title">Sections</p>
            <a href="#about">소개</a>
            <a href="#skills">기술 스택</a>
            <a href="#projects">프로젝트</a>
            <a href="#activity">활동</a>
          </div>

          <div class="footer-col">
            <p class="footer-col-title">Contact</p>
            <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
            <a :href="profile.github" target="_blank" rel="noopener">{{ profile.github.replace('https://', '') }}</a>
            <a v-if="profile.blog" :href="profile.blog" target="_blank" rel="noopener">
              {{ profile.blog.replace('https://', '') }}
            </a>
          </div>

          <div class="footer-col">
            <p class="footer-col-title">Resume</p>
            <a href="/resume.pdf" download>PDF 다운로드</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© {{ year }} Yu Sujeong. All rights reserved.</p>
        <p>Built with Vue 3</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--color-bg-alt);
}

.footer-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 72px 40px 32px;
}

.footer-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 48px;
  padding-bottom: 40px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  max-width: 220px;
}

.footer-logo {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-ink);
}

.footer-logo-dot {
  color: var(--color-accent);
}

.footer-role {
  margin-top: 4px;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 500;
}

.footer-accent-bar {
  width: 28px;
  height: 3px;
  margin-top: 16px;
  border-radius: 999px;
  background: var(--color-accent);
}

.footer-social {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.footer-social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.footer-social-link:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.footer-columns {
  display: flex;
  flex-wrap: wrap;
  gap: 56px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 140px;
}

.footer-col-title {
  margin-bottom: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.footer-col a {
  font-size: 14px;
  color: var(--color-text-muted);
  word-break: break-all;
  transition: color 0.2s ease;
}

.footer-col a:hover {
  color: var(--color-ink);
}

.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
  font-size: 12px;
  color: var(--color-text-faint);
}

@media (max-width: 640px) {
  .footer-inner {
    padding: 56px 24px 24px;
  }
}
</style>
