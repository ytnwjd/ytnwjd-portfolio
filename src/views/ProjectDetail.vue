<!-- src/views/ProjectDetail.vue -->
<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { computed } from 'vue'
import projects from '@/data/projects'

const route = useRoute()
const project = computed(() => projects.find((p) => p.slug === route.params.slug))
</script>

<template>
    <section v-if="project" class="section">
        <RouterLink to="/projects" class="back-link">← 프로젝트 목록</RouterLink>
        <h1 class="project-title">{{ project.title }}</h1>
        <p class="project-period">{{ project.period }}</p>
        <p class="project-description">{{ project.description }}</p>

        <!-- Tech Stack / Key Responsibilities / 주요 성과 / Problem Solving 등 -->
    </section>

    <section v-else class="section">
        <p>해당 프로젝트를 찾을 수 없습니다.</p>
        <RouterLink to="/projects">← 프로젝트 목록으로</RouterLink>
    </section>
</template>

<style scoped>
.back-link {
    display: inline-block;
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--color-text-muted);
    text-decoration: none;
}

.project-title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 4px;
}

.project-period {
    color: var(--color-text-muted);
    font-size: 13px;
    margin-bottom: 16px;
}

.project-description {
    font-size: 15px;
    line-height: 1.7;
}
</style>