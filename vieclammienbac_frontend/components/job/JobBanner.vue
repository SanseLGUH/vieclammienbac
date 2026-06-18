<script setup>
defineProps({
  image: { type: String, required: true },
  alt: { type: String, default: '' },
})
</script>

<template>
  <div class="job-banner">
    <img :src="image" :alt="alt" />
  </div>
</template>

<style scoped>
.job-banner img {
  display: block;
  margin: 0 auto;
  width: 100%;
  max-width: 1260px;
  height: 600px;
  border-radius: 20px;
  object-fit: cover;
}

@media (max-width: 768px) {
  .job-banner img {
    height: 220px;
    border-radius: 12px;
  }
}
</style>