<script setup>
  definePageMeta({ layout: 'admin' })

  const { public: { apiBase } } = useRuntimeConfig()

  const api = (url, opt = {}) =>
    $fetch(url, { credentials: 'include', ...opt })

  const posts = ref([])
  const loading = ref(false)
  const toast = ref(null)
  const modal = ref(null)
  const active = ref(null)

  let toastTimer

  const form = reactive({
    title: '',
    company: '',
    image: '',
    description: '',
    content: '',
    salary: ''
  })

  const showToast = (msg, type = 'ok') => {
    clearTimeout(toastTimer)
    toast.value = { msg, type }
    toastTimer = setTimeout(() => (toast.value = null), 3000)
  }

  const resetForm = () =>
    Object.assign(form, {
      title: '',
      company: '',
      image: '',
      description: '',
      content: '',
      salary: ''
    })

  const openCreate = () => { resetForm(); active.value = null; modal.value = 'create' }
  const openEdit = p => { active.value = p; Object.assign(form, p); modal.value = 'edit' }
  const openDelete = p => { active.value = p; modal.value = 'delete' }
  const closeModal = () => { modal.value = active.value = null }

  const fmt = n => n ? Number(n).toLocaleString('vi-VN') + 'đ' : '—'
  const fmtDate = s => s ? new Date(s).toLocaleDateString('vi-VN') : '—'

  const fetchPosts = async () => {
    loading.value = true
    try {
      posts.value = await api(`${apiBase}/jobs`) || []
    } catch {
      showToast('Không tải được danh sách.', 'err')
    } finally {
      loading.value = false
    }
  }

  const createPost = async () => {
    try {
      await api(`${apiBase}/jobs`, {
        method: 'POST',
        body: { ...form, salary: +form.salary }
      })
      showToast('Đã tạo bài.')
      closeModal()
      fetchPosts()
    } catch {
      showToast('Tạo bài thất bại.', 'err')
    }
  }

  const saveEdit = async () => {
    try {
      await api(`${apiBase}/jobs/${active.value.id}`, {
        method: 'PUT',
        body: {
          id: active.value.id,
          ...form,
          salary: +form.salary
        }
      })
      showToast('Đã lưu.')
      closeModal()
      fetchPosts()
    } catch {
      showToast('Lưu thất bại.', 'err')
    }
  }

  const confirmDelete = async () => {
    try {
      await api(`${apiBase}/jobs/${active.value.id}`, {
        method: 'DELETE'
      })
      showToast('Đã xóa.')
      closeModal()
      fetchPosts()
    } catch {
      showToast('Xóa thất bại.', 'err')
    }
  }

  await fetchPosts()
</script>

<template>
  <Transition name="toast">
    <div v-if="toast" :class="['toast', toast.type]">{{ toast.msg }}</div>
  </Transition>

  <div class="header">
    <span>Quản lý bài đăng</span>
    <button class="btn primary" @click="openCreate">+ Tạo bài mới</button>
  </div>

  <div class="panel">
    <div v-if="loading" class="empty">Đang tải...</div>
    <div v-else-if="!posts.length" class="empty">Chưa có bài nào. <button class="link" @click="openCreate">Tạo ngay</button></div>

    <table v-else>
      <thead>
        <tr>
          <th>Hình</th>
          <th>Tiêu đề</th>
          <th>Công ty</th>
          <th>Lương</th>
          <th>Ngày tạo</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in posts" :key="p.id">
          <td><img v-if="p.image" :src="p.image" class="thumb" /></td>
          <td class="bold">{{ p.title }}</td>
          <td>{{ p.company }}</td>
          <td>{{ fmt(p.salary) }}</td>
          <td class="muted">{{ fmtDate(p.created_at) }}</td>
          <td class="actions">
            <button class="btn sm" @click="openEdit(p)">Sửa</button>
            <button class="btn sm danger" @click="openDelete(p)">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <Teleport to="body">
    <div v-if="modal === 'create' || modal === 'edit'" class="overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-head">
          <span>{{ modal === 'create' ? 'Tạo bài mới' : 'Chỉnh sửa' }}</span>
          <button class="close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <label>Tiêu đề<input v-model="form.title" /></label>
          <label>Công ty<input v-model="form.company" /></label>
          <label>URL hình<input v-model="form.image" /></label>
          <label>Lương (VNĐ)<input v-model="form.salary" type="number" /></label>
          <label>Mô tả ngắn<textarea v-model="form.description" rows="3" /></label>
          <label>Nội dung<textarea v-model="form.content" rows="8" /></label>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="closeModal">Hủy</button>
          <button class="btn primary" @click="modal === 'create' ? createPost() : saveEdit()">
            {{ modal === 'create' ? 'Tạo bài' : 'Lưu' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="modal === 'delete'" class="overlay" @click.self="closeModal">
      <div class="modal" style="max-width:380px">
        <div class="modal-head">
          <span>Xác nhận xóa</span>
          <button class="close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <p>Xóa bài <strong>{{ active?.title }}</strong>? Không thể hoàn tác.</p>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="closeModal">Hủy</button>
          <button class="btn danger" @click="confirmDelete">Xóa</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
  * { box-sizing: border-box; }

  .header {
    max-width: 1260px;
    margin: 0 auto;
    height: 52px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e5e5e5;
    font-weight: 600;
    font-size: 15px;
    color: #111;
    background: #fff;
  }

  .panel {
    max-width: 1260px;
    margin: 20px auto;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    overflow: hidden;
  }

  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { background: #f7f7f7; }
  th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid #e5e5e5; }
  td { padding: 10px 14px; border-bottom: 1px solid #f0f0f0; color: #333; vertical-align: middle; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover { background: #fafafa; }

  .bold  { font-weight: 500; color: #111; }
  .muted { color: #aaa; }

  .thumb { width: 50px; height: 32px; object-fit: cover; border-radius: 4px; display: block; }

  .actions { white-space: nowrap; }
  .actions .btn { margin-right: 6px; }

  .empty { padding: 60px; text-align: center; color: #aaa; font-size: 14px; }

  /* Buttons */
  .btn { padding: 6px 14px; border-radius: 5px; font-size: 13px; cursor: pointer; border: 1px solid #d5d5d5; background: #fff; color: #333; transition: background .1s; }
  .btn:hover { background: #f5f5f5; }
  .btn.primary { background: #111; color: #fff; border-color: #111; }
  .btn.primary:hover { background: #333; }
  .btn.danger { color: #d93025; border-color: #f0c0bd; }
  .btn.danger:hover { background: #fff5f5; }
  .btn.sm { padding: 4px 10px; font-size: 12px; }
  .link { background: none; border: none; color: #111; cursor: pointer; text-decoration: underline; font-size: 14px; padding: 0; }

  /* Modal */
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.3); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
  .modal { background: #fff; border-radius: 8px; width: 100%; max-width: 580px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; border: 1px solid #e5e5e5; }
  .modal-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e5e5e5; font-weight: 600; font-size: 14px; color: #111; }
  .close { background: none; border: none; color: #aaa; font-size: 16px; cursor: pointer; line-height: 1; padding: 0; }
  .close:hover { color: #333; }
  .modal-body { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
  .modal-body label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-weight: 600; color: #666; }
  .modal-body input, .modal-body textarea { border: 1px solid #ddd; border-radius: 5px; padding: 8px 10px; font-size: 13px; color: #111; background-color: #fff; font-family: inherit; outline: none; resize: vertical; }
  .modal-body input:focus, .modal-body textarea:focus { border-color: #999; }
  .modal-body p { font-size: 14px; color: #444; line-height: 1.6; margin: 0; }
  .modal-foot { padding: 14px 20px; border-top: 1px solid #e5e5e5; display: flex; justify-content: flex-end; gap: 8px; }

  /* Toast */
  .toast { position: fixed; bottom: 24px; right: 20px; z-index: 2000; padding: 10px 18px; border-radius: 6px; font-size: 13px; pointer-events: none; border: 1px solid; }
  .toast.ok  { background: #f6faf7; color: #2a7a4a; border-color: #cce8d8; }
  .toast.err { background: #fff5f5; color: #c0392b; border-color: #f0c0bd; }
  .toast-enter-active, .toast-leave-active { transition: opacity .2s, transform .2s; }
  .toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(6px); }

  @media (max-width: 768px) {
    th:nth-child(3), td:nth-child(3),
    th:nth-child(5), td:nth-child(5) { display: none; }
  }
</style>