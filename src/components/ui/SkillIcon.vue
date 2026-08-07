<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  iconSlug: { type: String, default: undefined },
})

function defaultSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// props.iconSlug === null이면 아이콘 없음이 명시된 것(폴백 배지 강제), undefined면 이름에서 slug 추정
const slug = computed(() => (props.iconSlug !== undefined ? props.iconSlug : defaultSlug(props.name)))
const initial = computed(() => props.name.trim().charAt(0).toUpperCase())

const failed = ref(false)
</script>

<template>
  <span class="skill-icon">
    <img
      v-if="slug && !failed"
      class="skill-icon-img"
      :src="`https://cdn.simpleicons.org/${slug}`"
      :alt="name"
      width="16"
      height="16"
      loading="lazy"
      @error="failed = true"
    />
    <span v-else class="skill-icon-badge">{{ initial }}</span>
  </span>
</template>

<style scoped>
.skill-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.skill-icon-img {
  display: block;
}

.skill-icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--color-border);
  color: var(--color-text-muted);
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
}
</style>
