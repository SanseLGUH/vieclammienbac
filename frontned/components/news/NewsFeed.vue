<template>
  <section class="article-feed">
    <!-- Skeleton -->
    <div v-if="loading" class="news-list">
      <div v-for="i in 6" :key="i" class="news-card news-card--skeleton">
        <div class="news-card-thumb thumb-placeholder" />
        <div class="news-card-body">
          <span class="skeleton skeleton--sm" />
          <span class="skeleton skeleton--lg" />
          <span class="skeleton skeleton--sm" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="feed-error">
      <span>Không thể tải tin tức. Vui lòng thử lại.</span>
      <button @click="fetchNews">Thử lại</button>
    </div>

    <!-- Articles -->
    <div v-else class="news-list">
      <HomeNewsCard
        v-for="article in articles"
        :key="article.id"
        :thumbnail="article.thumbnail"
        :title="article.title"
        :description="article.description"
        :created-at="article.created_at"
        @click="handleNavigate(article.redirect)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
interface NewsPreview {
  id: string
  thumbnail: string
  title: string
  description: string
  redirect: string
  created_at: string
}

const { public: { apiBase } } = useRuntimeConfig()

const articles = ref<NewsPreview[]>([])
const loading  = ref(true)
const error    = ref<string | null>(null)

const fetchNews = async () => {
  loading.value = true
  error.value   = null
  try {
    const res = await fetch(`${apiBase}/news?limit=10&offset=0`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    articles.value = await res.json()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchNews)

const isExternalUrl = (url: string) => /^https?:\/\//.test(url)

const handleNavigate = (redirect: string) => {
  if (isExternalUrl(redirect)) {
    window.open(redirect, '_blank', 'noopener,noreferrer')
  } else {
    navigateTo(redirect)
  }
}
</script>

<style scoped>
.article-feed {
  flex: 1 1 0;
  border: 1px solid rgba(0, 0, 0, 0.07);
  background-color: #fff;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  background-color: #9c9c9c;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 500;
}

.see-all {
  font-size: 12px;
  color: #fff;
  text-decoration: none;
  opacity: 0.8;
}

.see-all:hover {
  opacity: 1;
  text-decoration: underline;
}

/* ── News list ── */
.news-list {
  padding: 10px;
  display: flex;
  flex-direction: column;
}

/* ── Skeleton ── */
.news-card--skeleton {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
  pointer-events: none;
}

.news-card--skeleton .news-card-thumb {
  flex: 0 0 90px;
  height: 66px;
  border-radius: 6px;
}

.news-card--skeleton .news-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #d0d0d0, #b8b8b8);
  border-radius: 6px;
}

.skeleton {
  display: block;
  border-radius: 4px;
  background: linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton--sm { height: 11px; width: 40%; }
.skeleton--lg { height: 14px; width: 90%; }

@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

/* ── Error state ── */
.feed-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: #888;
  font-size: 14px;
}

.feed-error button {
  padding: 6px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}

.feed-error button:hover {
  background: #f5f5f5;
}
</style>