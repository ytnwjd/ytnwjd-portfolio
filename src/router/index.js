import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/projects/:slug', name: 'project-detail', component: () => import('@/views/ProjectDetail.vue') },
    // 인쇄/PDF 전용 이력서 페이지 — TopNav·Footer 없이 단독으로 렌더링된다 (App.vue 참고)
    { path: '/resume', name: 'resume', component: () => import('@/views/ResumeView.vue') },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

export default router
