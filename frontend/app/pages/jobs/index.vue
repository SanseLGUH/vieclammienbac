<script setup>
import { useVideoThumbnail } from '~/composables/useVideoThumbnail'

const route  = useRoute()
const router = useRouter()

const { isVideoUrl, extractVideoThumbnail } = useVideoThumbnail()
const { public: { apiBase } } = useRuntimeConfig()

const JOBS_PER_PAGE = 6

const page   = ref(Number(route.query.page)   || 1)
const radius = ref(Number(route.query.radius) || 5)
const offset = computed(() => (page.value - 1) * JOBS_PER_PAGE)

const { data, pending, error, refresh } = await useFetch(
  () => `${apiBase}/jobs?limit=${JOBS_PER_PAGE}&start=${offset.value}`,
  { server: false }
)

const jobs = ref([])

watch(data, async (raw) => {
  if (!raw) return
  const mapped = raw.map(j => ({ ...j }))
  for (const job of mapped) {
    if (job.image && isVideoUrl(job.image)) {
      try { job.image = await extractVideoThumbnail(job.image) }
      catch (e) { console.warn(`Thumbnail error ${job.id}:`, e) }
    }
  }
  jobs.value = mapped
}, { immediate: true })

watch(page, async (val) => {
  router.replace({ query: { ...route.query, page: val } })
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  await refresh()
})

watch(radius, (val) => {
  router.replace({ query: { ...route.query, radius: val } })
})

watch(() => route.query.page, (val) => {
  const n = Number(val)
  if (val && n !== page.value) page.value = n
})

watch(() => route.query.radius, (val) => {
  if (val && Number(val) !== radius.value) radius.value = Number(val)
})

const hasMore    = computed(() => jobs.value.length === JOBS_PER_PAGE)
const totalPages = computed(() => hasMore.value ? page.value + 1 : page.value)

useHead({ title: 'Việc Làm Miền Bắc – Tìm việc nhanh' })
</script>

<template>
  <div class="main-container">
    <aside class="sidebar desktop-only">
      <JobsGeoBlock
        :default-lat="20.8449"
        :default-lng="106.6881"
        :default-radius="radius"
        map-height="350px"
        :job-locations="jobs"
        @update:radius="radius = $event"
      />
      <JobsMainFilterSettings />
    </aside>

    <div class="content">
      <div class="mobile-only">
        <JobsGeoBlock
          style="margin-bottom: 10px;"
          :default-lat="20.8449"
          :default-lng="106.6881"
          :default-radius="radius"
          map-height="250px"
          :job-locations="jobs"
          @update:radius="radius = $event"
        />
        <JobsMainFilterSettings />
      </div>

      <JobsSearch />

      <div v-if="pending" class="state-msg">Đang tải...</div>
      <div v-else-if="error" class="state-msg error">Không thể tải danh sách việc làm.</div>

      <template v-else>
        <div class="page-settings">
          <JobsPageListSettings />
          <JobsPageNextPrev
            class="hide-in-mobile"
            v-model="page"
            :total="totalPages"
            dots-color="#54B5FF"
            nav-color="#54B5FF"
          />
        </div>

        <JobsList :jobs="jobs" />

        <div class="bottom-nav">
          <JobsPageNextPrev
            v-model="page"
            :total="totalPages"
            dots-color="#54B5FF"
            nav-color="#54B5FF"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  max-width: 1270px;
  margin: 10px auto 50px;
  display: flex;
  gap: 10px;
  padding: 0 15px;
  justify-content: center;
}
.sidebar {
  width: 370px;
  min-height: 700px;
  flex-shrink: 0;
}
.content {
  flex: 1;
  max-width: 900px;
  display: flex;
  flex-direction: column;
}
.page-settings {
  display: flex;
  gap: 5px;
  width: 100%;
  justify-content: center;
  margin-top: 20px;
}
.bottom-nav {
  width: 100%;
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}
.state-msg {
  text-align: center;
  padding: 40px 0;
  color: #888;
  font-size: 14px;
}
.state-msg.error { color: #e55; }
.mobile-only  { display: none; }
.desktop-only { display: block; }
@media (max-width: 960px) {
  .mobile-only  { display: block; }
  .desktop-only { display: none; }
  .hide-in-mobile { display: none; }
  .page-settings { display: inherit; }
  .main-container { flex-direction: column; }
  .content { max-width: 100%; }
}
</style>