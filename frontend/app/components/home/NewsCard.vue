<template>
  <div class="news-card" @click="emit('click')">
    <div class="news-card-thumb">
      <img v-if="thumbnail" :src="thumbnail" :alt="title" />
      <div v-else class="thumb-placeholder" />
    </div>
    <div class="news-card-body">
      <span class="news-card-title">{{ title }}</span>
      <span class="news-card-desc">{{ description }}</span>
      <a  v-if="redirect"
        class="news-card-link"
        :href="redirect"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >
        {{ displayUrl }}
      </a>
      <span class="news-card-meta">{{ formattedDate }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  thumbnail?: string
  title: string
  description?: string
  createdAt: string
  redirect?: string
}>()

const emit = defineEmits<{ click: [] }>()

const formattedDate = computed(() => {
  const diffH = Math.floor((Date.now() - new Date(props.createdAt).getTime()) / 3_600_000)
  if (diffH < 1)  return 'Vừa xong'
  if (diffH < 24) return `${diffH} giờ trước`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'Hôm qua'
  return `${diffD} ngày trước`
})

const displayUrl = computed(() => {
  if (!props.redirect) return ''
  try {
    return new URL(props.redirect).hostname
  } catch {
    return props.redirect
  }
})
</script>

<style scoped>
.news-card {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: background 0.15s;
}
.news-card:last-child {
  border-bottom: none;
}
.news-card:hover {
  background: rgba(0, 0, 0, 0.02);
  margin: 0 -10px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 6px;
}
.news-card-thumb {
  flex: 0 0 150px;
  height: 100px;
  overflow: hidden;
  background: #e0e0e0;
}
.news-card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.thumb-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #d0d0d0, #b8b8b8);
}
.news-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.news-card-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: #1d1d1d;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.news-card-desc {
  font-size: 12px;
  color: #555;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.news-card-link {
  font-size: 11px;
  color: #0077cc;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.news-card-link:hover {
  text-decoration: underline;
}
.news-card-meta {
  font-size: 12px;
  color: #888;
  margin-top: auto;
}
</style>