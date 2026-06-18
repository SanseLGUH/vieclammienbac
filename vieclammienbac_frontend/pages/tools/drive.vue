<template>
  <div class="layout">
    <header>
      <div class="brand">
        <div class="brand-name">/ drive</div>
        <div class="brand-sub">drive.vieclammienbac.com</div>
      </div>
      <div class="header-meta">
        <span class="file-count">{{ fileCountLabel }}</span>
        <button class="btn-ghost" @click="loadFiles">↻ refresh</button>
      </div>
    </header>

    <!-- Upload zone -->
    <label
      class="upload-zone"
      :class="{ dragging: isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <div class="upload-icon">⬆</div>
      <div class="upload-text">drop files here or <span>click to upload</span></div>
      <input type="file" multiple @change="onFileInput" />
    </label>

    <!-- Upload progress items -->
    <div v-if="uploads.length" class="upload-progress active">
      <div v-for="u in uploads" :key="u.uid" class="progress-item">
        <span class="progress-filename">{{ u.name }}</span>
        <div class="progress-bar-wrap">
          <div class="progress-bar" :style="{ width: u.pct + '%', background: u.barColor }" />
        </div>
        <span class="progress-pct" :style="{ color: u.statusColor }">{{ u.statusText }}</span>
        <button class="btn-abort" :disabled="u.aborted" @click="abortUpload(u)">✕</button>
      </div>
    </div>

    <!-- File list -->
    <div class="files-list">
      <template v-if="listState === 'loading'">
        <div class="empty"><div class="empty-icon">◻</div>loading…</div>
      </template>
      <template v-else-if="listState === 'error'">
        <div class="error-msg">failed to load files — {{ listError }}</div>
      </template>
      <template v-else-if="fileList.length === 0">
        <div class="empty"><div class="empty-icon">◻</div>no files yet</div>
      </template>
      <template v-else>
        <div
          v-for="(f, i) in fileList"
          :key="f.id"
          class="file-item"
          :style="{ animationDelay: i * 30 + 'ms' }"
        >
          <div class="file-info">
            <div class="file-name" :title="f.name">{{ f.name }}</div>
            <div class="file-meta">{{ formatSize(f.size) }}</div>
          </div>
          <div class="file-actions">
            <button class="btn-share" @click="openShareModal(f)">share ↗</button>
            <a class="btn-dl" :href="shareUrl(f)" download title="Download">↓</a>
          </div>
        </div>
      </template>
    </div>

    <!-- Share modal -->
    <div class="modal-overlay" :class="{ open: modalOpen }" @click.self="closeModal">
      <div class="modal">
        <div class="modal-title">share file</div>
        <div class="modal-file">{{ modal.name }}</div>
        <div class="url-box">
          <input class="url-input" :value="modal.url" readonly />
          <button class="btn-copy" :class="{ copied: modal.copied }" @click="copyUrl">
            {{ modal.copied ? 'copied!' : 'copy' }}
          </button>
        </div>
        <div class="modal-actions">
          <a class="modal-dl-link" :href="modal.url">↓ download instead</a>
          <button class="btn-close" @click="closeModal">close</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" :class="{ show: toastVisible }">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

definePageMeta({ layout: false })

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap' },
  ],
})

const BASE       = 'https://drive.vieclammienbac.com'
const CHUNK_SIZE = 5 * 1024 * 1024
const PARALLEL   = 6

// ── File list ──────────────────────────────────────────────────────────────────
const fileList  = ref([])
const listState = ref('loading')   // 'loading' | 'ok' | 'error'
const listError = ref('')

const fileCountLabel = computed(() => {
  if (listState.value === 'loading') return '...'
  if (listState.value === 'error')   return 'error'
  const n = fileList.value.length
  return `${n} file${n !== 1 ? 's' : ''}`
})

async function loadFiles() {
  listState.value = 'loading'
  try {
    const res   = await fetch(`${BASE}/list`)
    fileList.value = await res.json()
    listState.value = 'ok'
  } catch (e) {
    listError.value = e.message
    listState.value = 'error'
  }
}

function shareUrl(f) {
  return `${BASE}/download?id=${f.id}`
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i]
}

// ── Upload drag/drop ───────────────────────────────────────────────────────────
const isDragging = ref(false)

function onDrop(e) {
  isDragging.value = false
  handleFiles(e.dataTransfer.files)
}

function onFileInput(e) {
  handleFiles(e.target.files)
  e.target.value = ''
}

function handleFiles(files) {
  ;[...files].forEach(uploadFile)
}

// ── Uploads list ───────────────────────────────────────────────────────────────
const uploads = ref([])

function createUploadEntry(file) {
  const uid = Date.now() + Math.random()
  const entry = reactive({
    uid,
    name:        file.name,
    pct:         0,
    statusText:  'init…',
    statusColor: 'var(--muted)',
    barColor:    'var(--accent)',
    aborted:     false,
    // internal
    _uploadId:   null,
    _objectPath: null,
    _xhrs:       new Set(),
  })
  uploads.value.push(entry)
  return entry
}

function removeEntry(entry) {
  const i = uploads.value.indexOf(entry)
  if (i !== -1) uploads.value.splice(i, 1)
}

// ── Abort ──────────────────────────────────────────────────────────────────────
async function abortUpload(entry) {
  if (entry.aborted) return
  entry.aborted = true
  entry._xhrs.forEach(x => x.abort())
  entry._xhrs.clear()
  if (entry._uploadId) {
    const params = new URLSearchParams({ upload_id: entry._uploadId, object_path: entry._objectPath })
    try { await fetch(`${BASE}/upload/abort?${params}`, { method: 'DELETE' }) } catch (_) {}
  }
  entry.statusText  = 'aborted'
  entry.barColor    = 'var(--muted)'
  entry.statusColor = 'var(--muted)'
  setTimeout(() => removeEntry(entry), 800)
}

// beforeunload — beacon abort for all active uploads
function onBeforeUnload() {
  uploads.value.forEach(u => {
    if (u._uploadId) {
      const params = new URLSearchParams({ upload_id: u._uploadId, object_path: u._objectPath })
      navigator.sendBeacon(`${BASE}/upload/abort?${params}`, '')
    }
  })
}

// ── Upload a single part ───────────────────────────────────────────────────────
function uploadPart(entry, uploadId, objectPath, partNumber, offset, end, file, onProgress) {
  return new Promise((resolve, reject) => {
    const slice  = file.slice(offset, end)
    const params = new URLSearchParams({ upload_id: uploadId, object_path: objectPath, part_number: partNumber })

    const xhr = new XMLHttpRequest()
    entry._xhrs.add(xhr)

    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(e.loaded) }

    xhr.onload = () => {
      entry._xhrs.delete(xhr)
      if (xhr.status === 200) {
        onProgress(end - offset)
        try { resolve(JSON.parse(xhr.responseText)) }
        catch { reject(new Error('bad JSON from server')) }
      } else {
        let msg = `part ${partNumber} failed: ${xhr.status}`
        try { msg = JSON.parse(xhr.responseText).error ?? msg } catch (_) {}
        reject(new Error(msg))
      }
    }
    xhr.onerror = () => { entry._xhrs.delete(xhr); reject(new Error(`part ${partNumber} network error`)) }
    xhr.onabort = () => { entry._xhrs.delete(xhr); reject(new Error('aborted')) }

    xhr.open('PUT', `${BASE}/upload/chunk?${params}`)
    xhr.setRequestHeader('Content-Range', `bytes ${offset}-${end - 1}/${file.size}`)
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    xhr.send(slice)
  })
}

// ── Main upload ────────────────────────────────────────────────────────────────
async function uploadFile(file) {
  const entry = createUploadEntry(file)

  try {
    // Init
    const initRes = await fetch(`${BASE}/upload/init`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ filename: file.name }),
    })
    if (!initRes.ok) throw new Error('init failed')
    const { upload_id, object_path } = await initRes.json()
    entry._uploadId   = upload_id
    entry._objectPath = object_path

    // Build chunks
    const chunks = []
    let offset = 0, partNum = 1
    while (offset < file.size) {
      const end = Math.min(offset + CHUNK_SIZE, file.size)
      chunks.push({ partNumber: partNum++, offset, end })
      offset = end
    }

    const chunkProgress = new Array(chunks.length).fill(0)
    const parts         = []
    let   idx           = 0
    const startTime     = Date.now()

    function onChunkProgress(chunkIdx, loaded) {
      chunkProgress[chunkIdx] = loaded
      const totalUploaded = chunkProgress.reduce((a, b) => a + b, 0)
      const elapsed = (Date.now() - startTime) / 1000
      const speed   = elapsed > 0.5
        ? ' · ' + ((totalUploaded / elapsed) / 1024 / 1024).toFixed(1) + ' MB/s'
        : ''
      entry.pct        = Math.min(100, Math.round((totalUploaded / file.size) * 100))
      entry.statusText = entry.pct + '%' + speed
    }

    async function worker() {
      while (idx < chunks.length) {
        if (entry.aborted) return
        const chunk    = chunks[idx++]
        const chunkIdx = chunk.partNumber - 1
        const data     = await uploadPart(
          entry, upload_id, object_path,
          chunk.partNumber, chunk.offset, chunk.end,
          file,
          loaded => onChunkProgress(chunkIdx, loaded),
        )
        if (entry.aborted) return
        parts.push({ part_number: data.part_number, e_tag: data.e_tag })
      }
    }

    await Promise.all(Array.from({ length: Math.min(PARALLEL, chunks.length) }, worker))
    if (entry.aborted) return

    // Complete
    entry.statusText  = 'finishing…'
    entry.statusColor = 'var(--muted2)'
    const sorted      = parts.sort((a, b) => a.part_number - b.part_number)
    const completeRes = await fetch(`${BASE}/upload/complete`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ upload_id, object_path, parts: sorted }),
    })
    if (!completeRes.ok) throw new Error('complete failed')

    entry._uploadId   = null
    entry.pct         = 100
    entry.statusText  = '✓'
    entry.statusColor = 'var(--accent)'
    entry.barColor    = 'var(--accent)'

    setTimeout(() => { removeEntry(entry); loadFiles() }, 800)

  } catch (e) {
    if (entry.aborted) return
    entry.statusText  = '✗'
    entry.statusColor = 'var(--danger)'
    entry.barColor    = 'var(--danger)'
    showToast(`upload failed — ${e.message}`)
    entry._uploadId   = null
  }
}

// ── Share modal ────────────────────────────────────────────────────────────────
const modalOpen = ref(false)
const modal     = reactive({ name: '', url: '', copied: false })

function openShareModal(f) {
  modal.name   = f.name
  modal.url    = shareUrl(f)
  modal.copied = false
  modalOpen.value = true
}

function closeModal() { modalOpen.value = false }

async function copyUrl() {
  await navigator.clipboard.writeText(modal.url)
  modal.copied = true
  showToast('link copied to clipboard')
  setTimeout(() => { modal.copied = false }, 2000)
}

// ── Toast ──────────────────────────────────────────────────────────────────────
const toastVisible = ref(false)
const toastMsg     = ref('')
let   toastTimer   = null

function showToast(msg) {
  toastMsg.value     = msg
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 2200)
}

// ── Keyboard ───────────────────────────────────────────────────────────────────
function onKeydown(e) { if (e.key === 'Escape') closeModal() }

onMounted(() => {
  loadFiles()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('beforeunload', onBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', onBeforeUnload)
})
</script>

<style scoped>
:root {
  --bg: #0d0d0d;
  --surface: #141414;
  --surface2: #1a1a1a;
  --border: rgba(255,255,255,0.07);
  --border-hover: rgba(255,255,255,0.15);
  --text: #f5f5f5;
  --muted: #555;
  --muted2: #888;
  --accent: #e8ff47;
  --accent-dim: rgba(232,255,71,0.1);
  --accent-dim2: rgba(232,255,71,0.05);
  --danger: #ff4757;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* Grid bg on the page root */
.layout {
  font-family: 'DM Mono', monospace;
  background: #0d0d0d;
  color: #f5f5f5;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
  width: 100%;
  margin: 0 auto;
  padding: 48px 32px 80px;
}

.layout::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.brand { display: flex; flex-direction: column; gap: 4px; }

.brand-name {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.5px;
  color: var(--text);
}

.brand-sub { font-size: 11px; color: var(--muted2); letter-spacing: 0.05em; }

.header-meta { display: flex; align-items: center; gap: 16px; }

.file-count { font-size: 11px; color: var(--muted2); letter-spacing: 0.05em; }

.btn-ghost {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 6px 14px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted2);
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all 0.15s;
}
.btn-ghost:hover { border-color: var(--border-hover); color: var(--text); }

/* Upload zone */
.upload-zone {
  position: relative;
  z-index: 1;
  border: 1px dashed var(--border);
  padding: 28px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 32px;
  transition: all 0.2s;
  background: var(--surface);
  overflow: hidden;
  width: 100%;
  display: block;
}

.upload-zone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent-dim2);
  opacity: 0;
  transition: opacity 0.2s;
}

.upload-zone:hover::before,
.upload-zone.dragging::before { opacity: 1; }

.upload-zone:hover,
.upload-zone.dragging { border-color: var(--accent); }

.upload-zone input { display: none; }

.upload-icon { font-size: 22px; margin-bottom: 8px; opacity: 0.4; }

.upload-text { font-size: 12px; color: var(--muted2); letter-spacing: 0.05em; }
.upload-text span { color: var(--accent); }

/* Progress */
.upload-progress {
  position: relative;
  z-index: 1;
  display: none;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}
.upload-progress.active { display: flex; }

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: var(--muted2);
}

.progress-filename {
  font-size: 11px;
  color: var(--muted2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.progress-bar-wrap {
  flex: 1;
  height: 2px;
  background: var(--surface2);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--accent);
  width: 0%;
  transition: width 0.15s;
}

.progress-pct {
  font-size: 10px;
  color: var(--muted);
  min-width: 64px;
  text-align: right;
}

.btn-abort {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 2px 8px;
  background: transparent;
  border: 1px solid rgba(255,71,87,0.3);
  color: var(--danger);
  cursor: pointer;
  flex-shrink: 0;
}
.btn-abort:disabled { opacity: 0.4; cursor: not-allowed; }

/* Files list */
.files-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.file-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  transition: all 0.15s;
  animation: fadeIn 0.2s ease forwards;
  opacity: 0;
}

@keyframes fadeIn { to { opacity: 1; } }

.file-item:hover { border-color: var(--border-hover); background: var(--surface2); }

.file-info { overflow: hidden; }

.file-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text);
  margin-bottom: 3px;
}

.file-meta { font-size: 10px; color: var(--muted); letter-spacing: 0.04em; }

.file-actions { display: flex; gap: 6px; align-items: center; }

.btn-share {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 6px 14px;
  background: var(--accent-dim);
  border: 1px solid rgba(232,255,71,0.2);
  color: var(--accent);
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-share:hover { background: var(--accent); color: #000; border-color: var(--accent); }

.btn-dl {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted2);
  cursor: pointer;
  text-decoration: none;
  letter-spacing: 0.03em;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 5px;
}
.btn-dl:hover { border-color: var(--border-hover); color: var(--text); }

/* Toast */
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--surface2);
  border: 1px solid var(--border-hover);
  padding: 10px 20px;
  font-size: 12px;
  color: var(--accent);
  letter-spacing: 0.04em;
  opacity: 0;
  transition: all 0.2s;
  pointer-events: none;
  z-index: 100;
  white-space: nowrap;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

/* Empty / error */
.empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.05em;
  border: 1px solid var(--border);
  background: var(--surface);
}
.empty-icon { font-size: 28px; margin-bottom: 12px; opacity: 0.3; }

.error-msg {
  padding: 14px 16px;
  background: rgba(255,71,87,0.07);
  border: 1px solid rgba(255,71,87,0.2);
  color: var(--danger);
  font-size: 12px;
  letter-spacing: 0.03em;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}
.modal-overlay.open { opacity: 1; pointer-events: all; }

.modal {
  background: var(--surface);
  border: 1px solid var(--border-hover);
  padding: 28px;
  width: 100%;
  max-width: 480px;
  margin: 20px;
  transform: translateY(12px);
  transition: transform 0.2s;
}
.modal-overlay.open .modal { transform: translateY(0); }

.modal-title {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 6px;
}

.modal-file {
  font-size: 11px;
  color: var(--muted2);
  margin-bottom: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.url-box { display: flex; gap: 8px; margin-bottom: 16px; }

.url-input {
  flex: 1;
  background: #0d0d0d;
  border: 1px solid var(--border);
  color: var(--muted2);
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 8px 12px;
  outline: none;
  letter-spacing: 0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.url-input:focus { border-color: var(--border-hover); }

.btn-copy {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 8px 16px;
  background: var(--accent);
  border: none;
  color: #000;
  cursor: pointer;
  font-weight: 500;
  letter-spacing: 0.03em;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-copy:hover { background: #d4eb3a; }
.btn-copy.copied { background: #64ff96; }

.modal-actions { display: flex; justify-content: space-between; align-items: center; }

.modal-dl-link {
  font-size: 11px;
  color: var(--muted2);
  text-decoration: none;
  letter-spacing: 0.03em;
  transition: color 0.15s;
}
.modal-dl-link:hover { color: var(--text); }

.btn-close {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 6px 14px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted2);
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: all 0.15s;
}
.btn-close:hover { border-color: var(--border-hover); color: var(--text); }

@media (max-width: 600px) {
  .layout { padding: 24px 16px 60px; }
  header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .file-item { grid-template-columns: 1fr auto; }
  .btn-dl { display: none; }
}
</style>