<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <nav class="breadcrumb-bar">
    <NuxtLink to="/jobs" class="back-btn" aria-label="Quay lại">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
    </NuxtLink>
    <NuxtLink to="/">Trang chủ</NuxtLink>
    <span>›</span>
    <NuxtLink to="/jobs">Việc làm</NuxtLink>
    <span>›</span>
    <span class="current">{{ title }}</span>
  </nav>
</template>

<style scoped>
.breadcrumb-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #555;
  height: 50px;
  user-select: none;
}
.breadcrumb-bar a {
  color: #54B5FF;
  text-decoration: none;
}
.breadcrumb-bar a:hover { text-decoration: underline; }
.breadcrumb-bar .current { color: #888; }

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #333 !important;
  text-decoration: none !important;
  flex-shrink: 0;
  transition: background 0.2s;
}
.back-btn:hover { background: #e0e0e0; }
</style>