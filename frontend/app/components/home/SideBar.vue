<template>
  <aside class="company-sidebar" :style="sidebarStyle">
    <div v-if="videoSrc" class="sidebar-video-container">
      <video :src="videoSrc" controls class="plyr__video-wrapper" />
    </div>

    <div v-if="images && images.length" class="sidebar-imgs">
      <img
        v-for="(img, i) in images"
        :key="i"
        :src="img.src"
        :alt="img.alt || ''"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    videoSrc?: string
    images?: { src: string; alt?: string }[]
    width?: string
    imageHeight?: string
    imageMinWidth?: string
    gap?: string
  }>(),
  {
    videoSrc: undefined,
    images: () => [],
    width: '300px',
    imageHeight: '400px',
    imageMinWidth: '45%',
    gap: '10px',
  },
)

const sidebarStyle = computed(() => {
  return {
    '--sidebar-width': props.width,
    '--image-height': props.imageHeight,
    '--image-min-width': props.imageMinWidth,
    '--gap': props.gap,
  }
})
</script>

<style scoped>
/* 2. Lock down the video container aspect ratio *before* the video loads */
.sidebar-video-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000; /* Dark background placeholder while loading */
  overflow: hidden;
}

:deep(.plyr),
:deep(.plyr__video-wrapper),
.sidebar-video-container video {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}
</style>


<style scoped>
.company-sidebar {
  flex: 0 0 300px;
  border: 1px solid rgba(0, 0, 0, 0.07);
  background-color: #fff;
}

.sidebar-imgs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.07);
  margin-top: 10px;
}

.sidebar-imgs img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

@media (max-width: 1024px) {
  .company-sidebar { flex: 0 0 260px; }
}

@media (max-width: 768px) {
  .sidebar-imgs { flex-wrap: nowrap; }
  .sidebar-imgs img { width: calc(50% - 5px); height: auto; }
  .company-sidebar { width: 100%; flex: unset; order: -1; }
}
</style>