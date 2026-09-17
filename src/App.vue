<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import TopNav from '@/components/layout/TopNav.vue'
import Footer from '@/components/layout/Footer.vue'

// 이력서 페이지(/resume)는 인쇄/PDF 전용 단독 문서라 사이트 내비게이션·푸터를 두르지 않는다
const route = useRoute()
const isBareLayout = computed(() => route.name === 'resume')
</script>

<template>
  <div v-if="isBareLayout" class="layout">
    <RouterView />
  </div>
  <div v-else class="layout">
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
