<script setup>
import projects from '@/data/projects'
</script>

<template>
  <section id="projects" class="section">
    <h2 class="section-title">Projects</h2>

    <ul class="project-list">
      <li v-for="project in projects" :id="`project-${project.slug}`" :key="project.slug" class="project-card">
        <h3 class="project-title">{{ project.title }}</h3>
        <p class="project-period">{{ project.period }}</p>
        <p class="project-description">{{ project.description }}</p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.project-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.project-card {
  padding: 24px;
  border: 0.5px solid var(--color-border);
  border-radius: 8px;
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
}
</style>
