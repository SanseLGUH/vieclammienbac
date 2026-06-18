<template>
  <div class="admin-wrapper">

    <!-- Main -->
    <div class="admin-main">

      <!-- Top bar -->
      <header class="admin-topbar">
        <div class="topbar-left">
          <h1 class="page-title">Quản lý tin tức</h1>
          <span class="article-count" v-if="!loading">{{ articles.length }} bài</span>
        </div>
        <div class="topbar-right">
          <button class="btn btn--primary" @click="openCreate">+ Tạo mới</button>
        </div>
      </header>

      <!-- Table -->
      <div class="table-card">

        <!-- Loading -->
        <div v-if="loading" class="state-block">
          <div class="spinner" />
          <span>Đang tải...</span>
        </div>

        <!-- Error -->
        <div v-else-if="fetchError" class="state-block state-block--error">
          <span>{{ fetchError }}</span>
          <button class="btn btn--ghost" @click="fetchArticles">Thử lại</button>
        </div>

        <!-- Empty -->
        <div v-else-if="articles.length === 0" class="state-block">
          <span class="state-icon">📭</span>
          <span>Chưa có tin tức nào.</span>
          <button class="btn btn--primary" @click="openCreate">Tạo bài đầu tiên</button>
        </div>

        <!-- Table -->
        <table v-else class="news-table">
          <thead>
            <tr>
              <th class="col-thumb" />
              <th class="col-title">Tiêu đề</th>
              <th class="col-desc">Mô tả</th>
              <th class="col-date">Ngày tạo</th>
              <th class="col-actions" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="article in articles" :key="article.id" class="table-row">
              <td class="col-thumb">
                <div class="row-thumb">
                  <img v-if="article.thumbnail" :src="article.thumbnail" :alt="article.title" />
                  <div v-else class="thumb-placeholder" />
                </div>
              </td>
              <td class="col-title">
                <span class="title-text">{{ article.title }}</span>
                <a :href="article.redirect" target="_blank" rel="noopener" class="redirect-link">
                  {{ truncate(article.redirect, 40) }} ↗
                </a>
              </td>
              <td class="col-desc">
                <span class="desc-text">{{ article.description }}</span>
              </td>
              <td class="col-date">{{ formatDate(article.created_at) }}</td>
              <td class="col-actions">
                <button class="action-btn action-btn--edit" @click="openEdit(article)" title="Sửa">✏️</button>
                <button class="action-btn action-btn--delete" @click="confirmDelete(article)" title="Xóa">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Modal: Create / Edit ── -->
    <Teleport to="body">
      <div v-if="modalOpen" class="modal-backdrop" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ editingId ? 'Sửa tin tức' : 'Tạo tin tức mới' }}</h2>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">

            <div class="field">
              <label>Tiêu đề *</label>
              <input v-model="form.title" type="text" placeholder="Nhập tiêu đề..." />
            </div>

            <div class="field">
              <label>Mô tả *</label>
              <textarea v-model="form.description" rows="3" placeholder="Nhập mô tả ngắn..." />
            </div>

            <div class="field">
              <label>Thumbnail URL</label>
              <input v-model="form.thumbnail" type="text" placeholder="https://example.com/image.jpg" />
              <div v-if="form.thumbnail" class="thumb-preview">
                <img :src="form.thumbnail" alt="preview" @error="thumbError = true" />
                <span v-if="thumbError" class="thumb-error">Không tải được ảnh</span>
              </div>
            </div>

            <div class="field">
              <label>Link chuyển hướng *</label>
              <input v-model="form.redirect" type="text" placeholder="https://..." />
            </div>

            <div v-if="formError" class="alert alert--error">{{ formError }}</div>
            <div v-if="formSuccess" class="alert alert--success">✅ {{ editingId ? 'Đã cập nhật!' : 'Đã tạo thành công!' }}</div>

          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" @click="closeModal">Hủy</button>
            <button class="btn btn--primary" :disabled="submitting" @click="submit">
              {{ submitting ? 'Đang lưu...' : (editingId ? 'Lưu thay đổi' : 'Tạo tin tức') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Modal: Confirm Delete ── -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
        <div class="modal modal--sm">
          <div class="modal-header">
            <h2>Xác nhận xóa</h2>
            <button class="modal-close" @click="deleteTarget = null">✕</button>
          </div>
          <div class="modal-body">
            <p class="delete-confirm-text">
              Bạn có chắc muốn xóa bài <strong>{{ deleteTarget.title }}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div v-if="deleteError" class="alert alert--error">{{ deleteError }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" @click="deleteTarget = null">Hủy</button>
            <button class="btn btn--danger" :disabled="deleting" @click="doDelete">
              {{ deleting ? 'Đang xóa...' : 'Xóa' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'admin',
  })

  interface NewsArticle {
    id: string
    thumbnail: string
    title: string
    description: string
    redirect: string
    created_at: string
  }

  interface NewsForm {
    title: string
    description: string
    thumbnail: string
    redirect: string
  }

  const {
    public: { apiBase },
  } = useRuntimeConfig()

  // Reusable fetch helper (always sends cookies)
  const apiFetch = <T = any>(url: string, options: any = {}) =>
    $fetch<T>(url, {
      credentials: 'include',
      ...options,
    })

  // ── List ──
  const articles = ref<NewsArticle[]>([])
  const loading = ref(true)
  const fetchError = ref<string | null>(null)

  const fetchArticles = async () => {
    loading.value = true
    fetchError.value = null

    try {
      articles.value = await apiFetch<NewsArticle[]>(
        `${apiBase}/news?limit=100&offset=0`
      )
    } catch (e: any) {
      fetchError.value = e.message ?? 'Không thể tải tin tức'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchArticles)

  // ── Modal state ──
  const modalOpen = ref(false)
  const editingId = ref<string | null>(null)
  const submitting = ref(false)
  const formError = ref('')
  const formSuccess = ref(false)
  const thumbError = ref(false)

  const emptyForm = (): NewsForm => ({
    title: '',
    description: '',
    thumbnail: '',
    redirect: '',
  })

  const form = ref<NewsForm>(emptyForm())

  watch(
    () => form.value.thumbnail,
    () => {
      thumbError.value = false
    }
  )

  const openCreate = () => {
    editingId.value = null
    form.value = emptyForm()
    formError.value = ''
    formSuccess.value = false
    modalOpen.value = true
  }

  const openEdit = (article: NewsArticle) => {
    editingId.value = article.id
    form.value = {
      title: article.title,
      description: article.description,
      thumbnail: article.thumbnail,
      redirect: article.redirect,
    }

    formError.value = ''
    formSuccess.value = false
    modalOpen.value = true
  }

  const closeModal = () => {
    if (submitting.value) return
    modalOpen.value = false
  }

  const submit = async () => {
    formError.value = ''
    formSuccess.value = false

    if (!form.value.title.trim()) {
      formError.value = 'Tiêu đề không được để trống'
      return
    }

    if (!form.value.description.trim()) {
      formError.value = 'Mô tả không được để trống'
      return
    }

    if (!form.value.redirect.trim()) {
      formError.value = 'Link chuyển hướng không được để trống'
      return
    }

    submitting.value = true

    try {
      const body = {
        title: form.value.title.trim(),
        description: form.value.description.trim(),
        thumbnail: form.value.thumbnail.trim(),
        redirect: form.value.redirect.trim(),
      }

      if (editingId.value) {
        await apiFetch(`${apiBase}/news/${editingId.value}`, {
          method: 'PUT',
          body,
        })

        const idx = articles.value.findIndex(
          (a) => a.id === editingId.value
        )

        if (idx !== -1) {
          articles.value[idx] = {
            ...articles.value[idx],
            ...body,
          }
        }
      } else {
        const created = await apiFetch<NewsArticle>(
          `${apiBase}/news`,
          {
            method: 'POST',
            body,
          }
        )

        articles.value.unshift(created)
      }

      formSuccess.value = true
      setTimeout(closeModal, 900)
    } catch (e: any) {
      formError.value = e?.message ?? 'Có lỗi xảy ra, vui lòng thử lại'
    } finally {
      submitting.value = false
    }
  }

  // ── Delete ──
  const deleteTarget = ref<NewsArticle | null>(null)
  const deleting = ref(false)
  const deleteError = ref('')

  const confirmDelete = (article: NewsArticle) => {
    deleteTarget.value = article
    deleteError.value = ''
  }

  const doDelete = async () => {
    if (!deleteTarget.value) return

    deleting.value = true
    deleteError.value = ''

    try {
      await apiFetch(`${apiBase}/news/${deleteTarget.value.id}`, {
        method: 'DELETE',
      })

      articles.value = articles.value.filter(
        (a) => a.id !== deleteTarget.value!.id
      )

      deleteTarget.value = null
    } catch (e: any) {
      deleteError.value = e?.message ?? 'Xóa thất bại'
    } finally {
      deleting.value = false
    }
  }

  // ── Helpers ──
  const formatDate = (iso: string) => {
    const d = new Date(iso)

    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const truncate = (str: string, n: number) =>
    str.length > n ? str.slice(0, n) + '…' : str
</script>

<style scoped>
  /* ── Layout ── */
  .admin-wrapper {
    display: flex;
    min-height: 100vh;
    background: #f4f5f7;
    font-family: inherit;
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 20px 24px;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .brand-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #0066ff;
  }

  .sidebar-nav {
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .nav-item {
    display: block;
    padding: 9px 12px;
    border-radius: 6px;
    font-size: 13px;
    color: rgba(255,255,255,0.55);
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }

  .nav-item--active {
    background: rgba(0,102,255,0.18);
    color: #66aaff;
  }

  /* ── Main ── */
  .admin-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  /* ── Topbar ── */
  .admin-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 28px;
    background: #fff;
    border-bottom: 1px solid rgba(0,0,0,0.07);
  }

  .topbar-left {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .page-title {
    font-size: 18px;
    font-weight: 700;
    color: #1d1d1d;
    margin: 0;
  }

  .article-count {
    font-size: 13px;
    color: #888;
  }

  .topbar-right {
    display: flex;
    gap: 10px;
  }

  /* ── Buttons ── */
  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s, background 0.15s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }

  .btn--primary {
    background: #0066ff;
    color: #fff;
    border: none;
  }

  .btn--primary:hover { opacity: 0.88; }
  .btn--primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .btn--ghost {
    background: #fff;
    color: #555;
    border: 1px solid #ddd;
  }

  .btn--ghost:hover { background: #f5f5f5; }

  .btn--danger {
    background: #d63031;
    color: #fff;
    border: none;
  }

  .btn--danger:hover { opacity: 0.88; }
  .btn--danger:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Table card ── */
  .table-card {
    margin: 24px 28px;
    background: #fff;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 10px;
    overflow: hidden;
  }

  .news-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .news-table thead tr {
    background: #f8f9fa;
    border-bottom: 1px solid rgba(0,0,0,0.07);
  }

  .news-table th {
    padding: 11px 14px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  .table-row {
    border-bottom: 1px solid rgba(0,0,0,0.05);
    transition: background 0.1s;
  }

  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: #fafbff; }

  .news-table td {
    padding: 12px 14px;
    vertical-align: middle;
  }

  /* Column widths */
  .col-thumb   { width: 72px; padding-right: 0; }
  .col-title   { min-width: 200px; }
  .col-desc    { min-width: 160px; color: #555; }
  .col-date    { width: 100px; white-space: nowrap; color: #888; }
  .col-actions { width: 80px; text-align: right; }

  .row-thumb {
    width: 60px;
    height: 44px;
    border-radius: 5px;
    overflow: hidden;
    background: #e8e8e8;
  }

  .row-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .thumb-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #d8d8d8, #c4c4c4);
  }

  .title-text {
    display: block;
    font-weight: 500;
    color: #1d1d1d;
    line-height: 1.4;
    margin-bottom: 3px;
  }

  .redirect-link {
    font-size: 11px;
    color: #0066ff;
    text-decoration: none;
    opacity: 0.7;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 240px;
  }

  .redirect-link:hover { opacity: 1; text-decoration: underline; }

  .desc-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
    color: #555;
  }

  /* ── Action buttons ── */
  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px 6px;
    border-radius: 5px;
    font-size: 15px;
    transition: background 0.12s;
    line-height: 1;
  }

  .action-btn:hover { background: rgba(0,0,0,0.06); }

  /* ── State blocks ── */
  .state-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 60px 20px;
    color: #888;
    font-size: 14px;
  }

  .state-block--error { color: #cc0000; }

  .state-icon { font-size: 32px; }

  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e0e0e0;
    border-top-color: #0066ff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Modal ── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 16px;
  }

  .modal {
    background: #fff;
    border-radius: 10px;
    width: 100%;
    max-width: 560px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }

  .modal--sm { max-width: 420px; }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 24px;
    border-bottom: 1px solid rgba(0,0,0,0.07);
  }

  .modal-header h2 {
    font-size: 16px;
    font-weight: 700;
    color: #1d1d1d;
    margin: 0;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 16px;
    color: #888;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
    border-radius: 4px;
    transition: background 0.12s;
  }

  .modal-close:hover { background: rgba(0,0,0,0.06); color: #333; }

  .modal-body {
    padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .modal-footer {
    padding: 16px 24px;
    border-top: 1px solid rgba(0,0,0,0.07);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  /* ── Form fields ── */
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field label {
    font-size: 12px;
    font-weight: 700;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .field input,
  .field textarea {
    padding: 9px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    color: #1d1d1d;
    background-color: #fff;
    outline: none;
    transition: border 0.15s;
    resize: vertical;
    font-family: inherit;
  }

  .field input:focus,
  .field textarea:focus { border-color: #0066ff; }

  .thumb-preview {
    margin-top: 8px;
    width: 140px;
    height: 90px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #ddd;
    background: #f0f0f0;
    position: relative;
  }

  .thumb-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .thumb-error {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #888;
    background: #f0f0f0;
  }

  .alert {
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 13px;
  }

  .alert--error {
    background: #fff0f0;
    color: #cc0000;
    border: 1px solid #ffcccc;
  }

  .alert--success {
    background: #f0fff4;
    color: #006622;
    border: 1px solid #b3ffcc;
  }

  /* Delete confirm */
  .delete-confirm-text {
    font-size: 14px;
    color: #444;
    line-height: 1.6;
    margin: 0;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .admin-sidebar { display: none; }
    .admin-topbar  { padding: 14px 16px; }
    .table-card    { margin: 16px; }
    .col-desc      { display: none; }
    .col-date      { display: none; }
  }
</style>