<script setup>
  const route  = useRoute()
  const router = useRouter()
  const { public: { apiBase } } = useRuntimeConfig()
  const JOBS_PER_PAGE = 6

  const page   = ref(Number(route.query.page)   || 1)
  const radius = ref(Number(route.query.radius) || 5)
  const offset = computed(() => (page.value - 1) * JOBS_PER_PAGE)

  // real user location — null until resolved (or denied)
  const userLat  = ref(null)
  const userLng  = ref(null)
  const geoError = ref(null)

  function requestUserLocation() {
    if (!import.meta.client || !navigator.geolocation) {
      geoError.value = 'Geolocation not supported'
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLat.value = pos.coords.latitude
        userLng.value = pos.coords.longitude
      },
      (err) => {
        geoError.value = err.message
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    )
  }

  onMounted(() => {
    requestUserLocation()
  })

  const { data, pending, error, refresh } = await useFetch(
    () => `${apiBase}/jobs?limit=${JOBS_PER_PAGE}&start=${offset.value}`,
    { server: false }
  )

  // nearby jobs — only fetch once we actually have real coords
  const { data: nearbyData, refresh: refreshNearby } = await useFetch(
    () => `${apiBase}/jobs?limit=${JOBS_PER_PAGE}&start=${offset.value}&geo=${userLat.value},${userLng.value},${radius.value}`,
    {
      server: false,
      immediate: false,
    }
  )

  const jobs = ref([])
  const NearbyJobs = ref([])

  watch(data, (raw) => {
    if (!raw) return
    jobs.value = raw.map(j => ({ ...j }))
  }, { immediate: true })

  watch(nearbyData, (raw) => {
    if (!raw) return
    NearbyJobs.value = raw.map(j => ({ ...j }))
  }, { immediate: true })

  watch([userLat, userLng], ([lat, lng]) => {
    if (lat != null && lng != null) {
      refreshNearby()
    }
  })

  watch(page, async (val) => {
    router.replace({ query: { ...route.query, page: val } })
    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    await refresh()
  })

  watch(radius, async (val) => {
    router.replace({ query: { ...route.query, radius: val } })
    if (userLat.value != null && userLng.value != null) {
      await refreshNearby()
    }
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
        :default-lat="userLat ?? 20.8449"
        :default-lng="userLng ?? 106.6881"
        :default-radius="radius"
        map-height="350px"
        :job-locations="NearbyJobs"
        @update:radius="radius = $event"
      />
      <JobsMainFilterSettings />
    </aside>

    <div class="content">
      <div class="mobile-only">
        <JobsGeoBlock
          style="margin-bottom: 10px;"
          :default-lat="userLat ?? 20.8449"
          :default-lng="userLng ?? 106.6881"
          :default-radius="radius"
          map-height="250px"
          :job-locations="NearbyJobs"
          @update:radius="radius = $event"
        />
        <JobsMainFilterSettings />
      </div>

      <JobsSearch />

      <div v-if="pending" class="state-msg">Đang tải...</div>

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

        <JobsList :jobs="NearbyJobs" />

        <div class="section-divider">
          <span>Tất cả việc làm</span>
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

<style scoped>
  .section-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0 16px;
    color: #888;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .section-divider::before,
  .section-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(0, 0, 0, 0.08);
  }
</style>