<template>
  <section class="article-feed">
    <div class="feed-header">
      <span>Tin tức</span>
      <NuxtLink to="/news" class="see-all">Xem tất cả</NuxtLink>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="news-list">
      <div v-for="i in PAGE_SIZE" :key="i" class="news-card news-card--skeleton">
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
        :redirect="article.redirect"
        :created-at="article.created_at"
        @click="handleNavigate(article.redirect)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="!loading && !error" class="pagination">
      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
        aria-label="Trang trước"
      >
        ‹
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        class="page-btn"
        :class="{ 'page-btn--active': page === currentPage, 'page-btn--ellipsis': page === '…' }"
        :disabled="page === '…'"
        @click="typeof page === 'number' && goToPage(page)"
      >
        {{ page }}
      </button>

      <button
        class="page-btn"
        :disabled="!hasNextPage"
        @click="goToPage(currentPage + 1)"
        aria-label="Trang sau"
      >
        ›
      </button>
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

const PAGE_SIZE = 8

const articles   = ref<NewsPreview[]>([])
const loading    = ref(true)
const error      = ref<string | null>(null)
const currentPage = ref(1)
const hasNextPage = ref(false)

const fetchNews = async () => {
  loading.value = true
  error.value   = null
  try {
    const offset = (currentPage.value - 1) * PAGE_SIZE
    // Fetch PAGE_SIZE + 1 to detect if a next page exists
    const res = await fetch(`${apiBase}/news?limit=${PAGE_SIZE + 1}&offset=${offset}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: NewsPreview[] = await res.json()
    hasNextPage.value = data.length > PAGE_SIZE
    articles.value    = data.slice(0, PAGE_SIZE)
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const goToPage = (page: number) => {
  if (page < 1) return
  currentPage.value = page
  fetchNews()
}

// Show at most 5 page buttons with ellipsis
const visiblePages = computed<(number | '…')[]>(() => {
  const current = currentPage.value
  // We don't know the total page count, so show current window
  // Pages: prev-1, current-1, current, current+1, next+1 (if exists)
  const pages: (number | '…')[] = []

  if (current > 2) {
    pages.push(1)
    if (current > 3) pages.push('…')
  }
  if (current > 1) pages.push(current - 1)
  pages.push(current)
  if (hasNextPage.value) pages.push(current + 1)

  return pages
})

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
.feed-error button:hover { background: #f5f5f5; }

/* ── Pagination ── */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 12px 10px;
  border-top: 0.5px solid rgba(0, 0, 0, 0.08);
}
.page-btn {
  min-width: 30px;
  height: 30px;
  padding: 0 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #444;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.page-btn:hover:not(:disabled):not(.page-btn--ellipsis) {
  background: #f0f0f0;
  border-color: #bbb;
}
.page-btn--active {
  background: #9c9c9c;
  border-color: #9c9c9c;
  color: #fff;
  font-weight: 600;
  cursor: default;
}
.page-btn--ellipsis {
  border-color: transparent;
  background: transparent;
  cursor: default;
  color: #aaa;
}
.page-btn:disabled:not(.page-btn--ellipsis) {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>