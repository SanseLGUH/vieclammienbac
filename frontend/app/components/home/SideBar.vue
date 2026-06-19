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
/* 1. Ensure the sidebar respects its boundaries and uses the width prop */
.company-sidebar {
  flex: 0 0 var(--sidebar-width);
  width: var(--sidebar-width);
  max-width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.07);
  background-color: #fff;
  box-sizing: border-box;
  overflow: hidden; /* Prevents child elements from bleeding out */
}

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

/* 3. Wire up your image CSS variables */
.sidebar-imgs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
  padding: var(--gap);
  background-color: rgba(0, 0, 0, 0.07);
  margin-top: var(--gap);
  box-sizing: border-box;
}

.sidebar-imgs img {
  flex: 1 1 var(--image-min-width);
  width: 100%;
  height: var(--image-height);
  object-fit: cover;
}

/* Responsive design adjustments */
@media (max-width: 1024px) {
  .company-sidebar { 
    --sidebar-width: 260px; /* Overriding the CSS variable simplifies responsive tweaks */
  }
}

@media (max-width: 768px) {
  .company-sidebar { 
    width: 100%; 
    flex: unset; 
    order: -1; 
  }
  .sidebar-imgs { 
    flex-wrap: nowrap; 
    overflow-x: auto; /* Adds scrolling if images exceed mobile width */
  }
  .sidebar-imgs img { 
    flex: 0 0 calc(50% - (var(--gap) / 2));
    height: auto; 
    aspect-ratio: 1 / 1; /* Keep them neat on mobile */
  }
}
</style>