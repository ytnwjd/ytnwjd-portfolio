<!-- src/components/sections/ProjectsSection.vue -->
<script setup>
import { RouterLink } from 'vue-router'
import projects from '@/data/projects'
</script>

<template>
  <section id="projects" class="section">
    <h2 class="section-title">Projects</h2>

    <ul class="project-list">
      <li v-for="project in projects" :id="`project-${project.slug}`" :key="project.slug" class="project-item">
        <RouterLink :to="`/projects/${project.slug}`" class="project-card">
          <h3 class="project-title">{{ project.title }}</h3>
          <p class="project-period">{{ project.period }}</p>
          <p class="project-description">{{ project.description }}</p>

          <ul v-if="project.techStack?.length" class="tech-tags">
            <li v-for="tech in project.techStack" :key="tech" class="tech-tag">{{ tech }}</li>
          </ul>

          <span class="project-link">자세히 보기 →</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.project-item {
  list-style: none;
}

.project-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  border: 0.5px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s ease;
}

.project-card:hover {
  border-color: var(--color-point-1);
}

.project-title {
  margin-bottom: 4px;
  font-size: 18px;
  font-weight: 700;
}

.project-period {
  margin-bottom: 12px;
  color: var(--color-text-muted);
  font-size: 13px;
}

.project-description {
  font-size: 15px;
  line-height: 1.6;
  flex-grow: 1;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
  padding: 0;
  list-style: none;
}

.tech-tag {
  font-size: 11px;
  color: var(--color-text-muted);
  border: 0.5px solid var(--color-border);
  padding: 2px 8px;
  border-radius: 10px;
}

.project-link {
  margin-top: 16px;
  font-size: 13px;
  color: var(--color-point-1);
}
</style>