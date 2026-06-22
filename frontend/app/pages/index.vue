<template>
  <div class="page">
    <HomeHeroBanner v-bind="banner" />

    <main class="content-grid">
      <HomeSideBar :images="sidebar1Images" :video-src="sidebar1VideoSrc" />
      
      <HomeNewsFeed />

      <HomeSideBar :images="sidebar2Images" :video-src="sidebar2VideoSrc" />
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

  const sidebar1VideoSrc = 'https://drive.vieclammienbac.com/download?id=5e6f3208-ec2d-42ef-8364-1428a85bb3b6'
  const sidebar1Images = [
    {
      src: 'https://drive.vieclammienbac.com/download?id=1422bf15-4b5a-43cf-84dc-4ec54e1aae6a',
      alt: '',
    },
    {
      src: 'https://drive.vieclammienbac.com/download?id=a019c9c2-af44-4f9f-aee1-e235f8a96bf8',
      alt: '',
    },
  ]

  const sidebar2VideoSrc = 'https://drive.vieclammienbac.com/download?id=3abe8991-75b6-4430-ac6e-08710a105232'
  const sidebar2Images = [
    {
      src: 'https://drive.vieclammienbac.com/download?id=74895b38-0680-4760-a553-22dbacd1a78e',
      alt: '',
    },
    {
      src: 'https://drive.vieclammienbac.com/download?id=438ca515-4210-4480-9fdc-3bcd9a78a772',
      alt: '',
    },
  ]
</script>

<style scoped>
  .page {
    width: 100%;
    max-width: var(--container-max);
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