<script setup>
definePageMeta({
  layout: 'withoutheader'
})

const route = useRoute()
const { public: { apiBase } } = useRuntimeConfig()

const { data: job, pending, error } = await useFetch(() => `${apiBase}/jobs/${route.params.id}`)

useHead(() => ({
  title: job.value ? job.value.title : 'Chi tiết việc làm – Việc Làm Miền Bắc',
}))
</script>

<template>
  <div v-if="pending" class="state-msg">Đang tải...</div>

  <div v-else-if="error || !job" class="not-found">
    <p>Không tìm thấy việc làm này.</p>
    <NuxtLink to="/jobs">← Quay lại danh sách</NuxtLink>
  </div>

  <div v-else class="main-container">
    <JobBreadcrumb v-if="job" :title="job.title" />
    <JobBanner v-if="job" :image="job.image" :alt="job.title" /> 
    <JobBody :content="job.content" />
    <JobApplyButton />
  </div>
</template>

<style scoped>
.main-container {
  max-width: 1260px;
  margin: 0 auto 60px;
  padding: 0 15px;
}

.state-msg {
  text-align: center;
  padding: 80px 20px;
  color: #888;
  font-size: 14px;
}

.not-found {
  text-align: center;
  padding: 80px 20px;
  color: #555;
}
.not-found a {
  color: #54B5FF;
  text-decoration: none;
}
</style>