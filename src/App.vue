<script setup>
import { RouterView } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
</script>

<template>
  <div class="layout">
    <Sidebar />
    <main class="content">
      <RouterView />
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
