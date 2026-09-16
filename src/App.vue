<script setup>
import { RouterView } from 'vue-router'
import TopNav from '@/components/layout/TopNav.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<template>
  <div class="layout">
    <TopNav />
    <main class="content">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.content {
  flex: 1;
}
</style>
