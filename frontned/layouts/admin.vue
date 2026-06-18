<template>
  <div class="admin-layout">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <span class="logo-icon pi pi-briefcase" />
        <span class="logo-text">Backend Controller</span>
      </div>

      <PanelMenu :model="menuItems" class="sidebar-menu" />
    </aside>

    <!-- Main -->
    <div class="main-wrapper">
      <!-- Page content -->
      <main class="content">
        <slot />
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = ref([
  {
    label: 'Dashboard',
    icon: 'pi pi-chart-bar',
    url: '/admin/dashboard',
  },
  {
    label: 'Tin tức',
    icon: 'pi pi-megaphone',
    url: '/admin/news',
  },
  {
    label: 'ViecLam',
    icon: 'pi pi-file',
    url: '/admin/jobs',
  },
  {
    label: 'Người dùng',
    icon: 'pi pi-users',
    url: '/admin/users',
  },
  {
    label: 'Cài đặt',
    icon: 'pi pi-cog',
    url: '/admin/settings',
  },
])

const breadcrumbHome = ref({ icon: 'pi pi-home', url: '/admin/dashboard' })

const breadcrumbItems = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  return segments.slice(1).map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    url: '/' + segments.slice(0, i + 2).join('/'),
  }))
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f4f6fb;
}

/* ── Sidebar ── */
.sidebar {
  width: 220px;
  background: #1d1d1d;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  border-bottom: 1px solid #2a2a45;
  color: #fff;
}

.logo-icon {
  font-size: 20px;
  color: #54B5FF;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* Override PanelMenu to match dark sidebar */
.sidebar-menu {
  flex: 1;
  border: none !important;
  background: transparent !important;
  padding: 8px 0;
}

.sidebar-menu :deep(.p-panelmenu-panel) {
  border: none;
  background: transparent;
}

.sidebar-menu :deep(.p-panelmenu-header) {
  background: transparent !important;
  border: none !important;
}

.sidebar-menu :deep(.p-panelmenu-header-content) {
  background: transparent !important;
  border: none !important;
  border-radius: 6px;
  margin: 2px 8px;
}

.sidebar-menu :deep(.p-panelmenu-header-link) {
  color: #aab0c6 !important;
  padding: 11px 14px !important;
  font-size: 13.5px;
  gap: 10px;
}

.sidebar-menu :deep(.p-panelmenu-header-link:hover),
.sidebar-menu :deep(.p-panelmenu-header.p-highlight .p-panelmenu-header-link) {
  color: #fff !important;
  background: #2a2a50 !important;
  border-radius: 6px;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-top: 1px solid #2a2a45;
  color: #aab0c6;
}

.sidebar-username {
  flex: 1;
  font-size: 13px;
}

/* ── Main ── */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-breadcrumb {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  font-size: 13px;
}

.topbar-right {
  display: flex;
  align-items: center;
}

.content {
  flex: 1;
  background-color: #3c3c3c;
  padding: 24px;
}
</style>