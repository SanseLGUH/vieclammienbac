<script setup>
definePageMeta({
  middleware: "auth",
});

const { public: { apiBase } } = useRuntimeConfig();

const { data: profile, error, pending } = await useAsyncData(
  "profile",
  () =>
    $fetch(`${apiBase}/profile`, {
      credentials: "include",
    }),
  { server: false }
);

const displayProfile = computed(() => profile.value);
const joinedDate = computed(() => {
  if (!displayProfile.value?.created_at) return "";
  return new Date(displayProfile.value.created_at).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});
</script>

<template>
  <div v-if="displayProfile" class="page">
    <div
      class="banner"
      :style="{ backgroundImage: `url(https://drive.vieclammienbac.com/download?id=${displayProfile.banner})` }"
    ></div>
    <div class="header">
      <img
        class="avatar"
        :src="`https://drive.vieclammienbac.com/download?id=${displayProfile.avatar}`"
        :alt="displayProfile.username"
      />
      <div class="info">
        <h1 class="name">{{ displayProfile.username }}</h1>
        <p class="email">{{ displayProfile.email }}</p>
        <p class="joined">Tham gia ngày {{ joinedDate }}</p>
      </div>
    </div>
    <div class="content"></div>
  </div>

  <div v-else-if="error" class="page error-state">
    <p> {{error}} </p>
    <p>Không thể tải hồ sơ. Vui lòng thử lại.</p>
  </div>

  <div v-else class="page loading-state">
    <p>Đang tải hồ sơ...</p>
  </div>
</template>

<style scoped>
.page {
  margin: 0 auto;
  background-color: #ffffff;
  max-width: 1260px;
}
.banner {
  position: relative;
  width: 100%;
  height: 320px;
  background-color: #dbeafe;
  background-size: cover;
  background-position: center;
}
.banner::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 140px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.85) 70%, #ffffff 100%);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  mask-image: linear-gradient(to bottom, transparent 0%, black 60%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 60%);
}
.header {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  padding: 0 2rem;
  margin-top: -60px;
}

.content {
  width: 100%;
  border: 1px solid #3c3c3c;
  height: 1000px;
}

.avatar {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 4px solid #ffffff;
  object-fit: cover;
  background: #dbeafe;
  box-shadow: 0 2px 10px rgba(30, 64, 175, 0.15);
}
.info {
  padding-bottom: 1rem;
  min-width: 0;
}
.name {
  color: #1d1d1d;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
}
.email {
  color: #1d1d1d;
  font-size: 0.9rem;
  margin: 0 0 0.15rem;
  word-break: break-word;
}
.joined {
  color: #1d1d1d;
  font-size: 0.8rem;
  margin: 0;
}
.error-state,
.loading-state {
  padding: 3rem 1rem;
  text-align: center;
  color: #1d1d1d;
}
@media (max-width: 640px) {
  .banner {
    height: 180px;
  }
  .banner::after {
    height: 90px;
  }
  .avatar {
    width: 100px;
    height: 100px;
  }
  .info {
    padding-bottom: 0.5rem;
  }
  .name {
    font-size: 1.25rem;
  }
}
</style>