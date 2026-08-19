<!-- src/views/ProjectDetail.vue -->
<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { computed } from 'vue'
import projects from '@/data/projects'

const route = useRoute()
const project = computed(() => projects.find((p) => p.slug === route.params.slug))
</script>

<template>
    <section v-if="project" class="section project-detail">
        <RouterLink :to="{ path: '/', hash: '#projects' }" replace class="back-link">
            ← 프로젝트 목록으로 돌아가기
        </RouterLink>

        <!-- Header Section -->
        <header class="detail-header">
            <div class="meta-badges">
                <span v-if="project.type" class="badge type-badge">{{ project.type }}</span>
                <span v-if="project.organization" class="badge org-badge">{{ project.organization }}</span>
            </div>
            <h1 class="project-title">{{ project.title }}</h1>
            <p class="project-period">{{ project.period }}</p>
        </header>

        <!-- Project Summary -->
        <div v-if="project.summary" class="content-block summary-box">
            <h2 class="block-title">📌 프로젝트 개요</h2>
            <p class="summary-text">{{ project.summary }}</p>
        </div>

        <!-- Tech Stack -->
        <div v-if="project.techStack && project.techStack.length" class="content-block">
            <h2 class="block-title">⚒️ 사용 기술 스택</h2>
            <div class="tech-tags">
                <span v-for="tech in project.techStack" :key="tech" class="tech-tag">
                    {{ tech }}
                </span>
            </div>
        </div>

        <!-- Key Responsibilities -->
        <div v-if="project.responsibilities && project.responsibilities.length" class="content-block">
            <h2 class="block-title">📋 주요 담당 역할 및 성과</h2>
            <ul class="detail-list">
                <li v-for="(item, idx) in project.responsibilities" :key="idx" class="detail-item">
                    <span class="bullet">✓</span>
                    <span class="text">{{ item }}</span>
                </li>
            </ul>
        </div>

        <!-- Problem Solving & Troubleshooting -->
        <div v-if="project.troubleshooting && project.troubleshooting.length" class="content-block">
            <h2 class="block-title">💡 문제 해결 및 트러블슈팅</h2>
            <div class="trouble-list">
                <div v-for="(item, idx) in project.troubleshooting" :key="idx" class="trouble-card">
                    <div class="trouble-section problem">
                        <span class="trouble-label">문제 상황</span>
                        <p class="trouble-text">{{ item.problem }}</p>
                    </div>
                    <div v-if="item.cause" class="trouble-section cause">
                        <span class="trouble-label">원인 분석</span>
                        <p class="trouble-text">{{ item.cause }}</p>
                    </div>
                    <div class="trouble-section solution">
                        <span class="trouble-label">해결 및 결과</span>
                        <p class="trouble-text">{{ item.solution }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Key Results / Output -->
        <div v-if="project.result && project.result.length" class="content-block">
            <h2 class="block-title">🎯 주요 성과 및 결과</h2>
            <ul class="detail-list result-list">
                <li v-for="(res, idx) in project.result" :key="idx" class="detail-item">
                    <span class="bullet">🏆</span>
                    <span class="text">{{ res }}</span>
                </li>
            </ul>
        </div>
    </section>

    <section v-else class="section empty-state">
        <p class="empty-text">해당 프로젝트 정보를 찾을 수 없습니다.</p>
        <RouterLink :to="{ path: '/', hash: '#projects' }" replace class="back-link">
            ← 프로젝트 목록으로 돌아가기
        </RouterLink>
    </section>
</template>

<style scoped>
.project-detail {
    max-width: 860px;
    margin: 0 auto;
    padding: 40px 20px;
    color: #f8fafc;
}

.back-link {
    display: inline-block;
    margin-bottom: 24px;
    font-size: 14px;
    font-weight: 500;
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.2s ease;
}

.back-link:hover {
    color: #3b82f6;
}

/* Header */
.detail-header {
    margin-bottom: 32px;
}

.meta-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

.badge {
    font-size: 13px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
}

.type-badge {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.3);
}

.org-badge {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.project-title {
    font-size: 32px;
    font-weight: 800;
    line-height: 1.3;
    margin-bottom: 8px;
    color: #f8fafc;
}

.project-period {
    font-size: 15px;
    color: #94a3b8;
}

/* Content Block */
.content-block {
    margin-bottom: 36px;
}

.block-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #f8fafc;
}

/* Summary Box */
.summary-box {
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px 24px;
}

.summary-text {
    font-size: 15px;
    line-height: 1.7;
    color: #cbd5e1;
    margin: 0;
}

/* Tech Tags */
.tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.tech-tag {
    font-size: 14px;
    font-weight: 500;
    padding: 6px 12px;
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: #e2e8f0;
}

/* Responsibilities & Results List */
.detail-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.detail-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 15px;
    line-height: 1.6;
    color: #e2e8f0;
}

.bullet {
    color: #10b981;
    font-weight: 700;
    flex-shrink: 0;
}

.result-list .bullet {
    color: #f59e0b;
}

/* Troubleshooting Cards */
.trouble-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.trouble-card {
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.trouble-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.trouble-label {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.problem .trouble-label {
    color: #f87171;
}

.cause .trouble-label {
    color: #fbbf24;
}

.solution .trouble-label {
    color: #34d399;
}

.trouble-text {
    font-size: 15px;
    line-height: 1.6;
    color: #cbd5e1;
    margin: 0;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 80px 20px;
}

.empty-text {
    font-size: 16px;
    color: #94a3b8;
    margin-bottom: 16px;
}
</style>