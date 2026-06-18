<template>
  <aside class="company-sidebar">
    <vue-plyr :options="{ ratio: '16:9' }">
      <video>
        <source :src="videoSrc" type="video/mp4" />
      </video>
    </vue-plyr>

    <div class="sidebar-imgs">
      <img v-for="(img, i) in images" :key="i" :src="img.src" :alt="img.alt" />
    </div>
  </aside>
</template>

<style scoped>
:deep(.plyr__video-wrapper) {
  height: auto !important;
  aspect-ratio: 16 / 9;
}

:deep(.plyr) {
  height: auto !important;
}

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

<script setup lang="ts">
withDefaults(
  defineProps<{
    videoSrc?: string
    images?: { src: string; alt?: string }[]
  }>(),
  {
  	videoSrc: 'https://drive.vieclammienbac.com/download?id=5e6f3208-ec2d-42ef-8364-1428a85bb3b6',
    images: () => [
      {
        src: 'https://drive.vieclammienbac.com/download?id=1422bf15-4b5a-43cf-84dc-4ec54e1aae6a',
        alt: '',
      },
      {
        src: 'https://drive.vieclammienbac.com/download?id=a019c9c2-af44-4f9f-aee1-e235f8a96bf8',
        alt: '',
      },
    ],
  },
)
</script>
