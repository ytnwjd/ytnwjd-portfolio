<script setup>
import Sidebar from '@/components/layout/Sidebar.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import SkillsSection from '@/components/sections/SkillsSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import ActivitiesSection from '@/components/sections/ActivitiesSection.vue'
</script>

<template>
  <div class="layout">
    <Sidebar />
    <main class="content">
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ActivitiesSection />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  /* 사이드바가 stretch되면 position: sticky가 먹히지 않으므로 자기 높이(100vh)를 유지시킴 */
  align-items: flex-start;
}

.content {
  flex: 1;
}
</style>
