<template>
  <div class="page-wrapper">
    <HomeHeroBanner v-bind="banner" />

    <main class="content-grid">
      
      <HomeCompanySidebar />
      <HomeNewsFeed />
      <HomeAditionalDocuments />
    </main>
  </div>
</template>

<script setup lang="ts">
const banner = {
  eyebrow:  'Việc làm miền Bắc',
  title:    'Việc Làm Tốt - Cuộc Sống Tốt',
  subtitle: 'Chúng tôi phục vụ người công nhân như phục vụ người thân của mình',
  ctaText:  'Tìm việc ngay',
  ctaLink:  '/jobs',
}
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  max-width: 1260px;
  margin: 0 auto;
  box-sizing: border-box;
}

.content-grid {
  display: flex;
  margin-top: 10px;
  width: 100%;
  gap: 20px;
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  .content-grid { gap: 16px; }
}

@media (max-width: 768px) {
  .content-grid { flex-direction: column; gap: 12px; }
}
</style>