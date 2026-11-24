<!-- src/components/ui/ImageLightbox.vue -->
<!-- 이미지를 원본 크기로 보여주는 라이트박스 — 배경 클릭·닫기 버튼·Esc로 닫는다.
     부모는 { src, alt } 또는 null을 image로 넘기고, close 이벤트에서 null로 되돌리면 된다. -->
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { IconX } from '@tabler/icons-vue'

const props = defineProps({
  image: { type: Object, default: null },
})
const emit = defineEmits(['close'])

function handleKeydown(e) {
  if (props.image && e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="image" class="lightbox-overlay" @click="emit('close')">
      <button type="button" class="lightbox-close" aria-label="닫기" @click.stop="emit('close')">
        <IconX :size="22" :stroke-width="2" />
      </button>
      <img :src="image.src" :alt="image.alt" class="lightbox-image" @click.stop />
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: rgba(0, 0, 0, 0.85);
}

.lightbox-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 12px;
  cursor: default;
}

.lightbox-close {
  position: fixed;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: var(--color-white);
  transition:
    background-color 0.15s ease,
    transform 0.15s ease;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.22);
}

.lightbox-close:active {
  transform: scale(0.98);
}

@media (max-width: 600px) {
  .lightbox-overlay {
    padding: 16px;
  }

  .lightbox-close {
    top: 16px;
    right: 16px;
  }
}
</style>
