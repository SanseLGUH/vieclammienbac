<template>
  <div class="page">
    <div class="container">
      <h1>XLSX TOOL TOTALLY NOT MADE BY VIET ANH OFCOURSE</h1>

      <!-- Drop Zone -->
      <div
        class="drop-zone"
        :class="{ dragover: isDragOver }"
        @click="triggerFileInput"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @drop.prevent="onDrop"
      >
        Drop XLSX files here or click to browse
        <input
          ref="fileInputRef"
          type="file"
          multiple
          accept=".xlsx"
          hidden
          @change="onFileInputChange"
        />
      </div>

      <!-- File List -->
      <div class="file-list">
        <div v-for="(file, i) in files" :key="i" class="file-item">
          <span>{{ file.name }}</span>
          <button @click="removeFile(i)">✕</button>
        </div>
      </div>

      <!-- Sheet name input -->
      <input
        v-model="sheetName"
        type="text"
        placeholder="Sheet name (required for Raw and Extract)"
      />

      <!-- Categories -->
      <div class="categories">

        <!-- Fast / Salary -->
        <div class="category" :class="{ open: openCats.fast }">
          <div class="category-header" @click="toggleCategory('fast')">
            <span class="category-badge badge-fast">Fast</span>
            <span class="category-title">Salary</span>
            <span class="category-desc">Rust · blazing fast · salary format</span>
            <span class="chevron">▼</span>
          </div>
          <div class="category-body">
            <div class="actions">
              <button class="action" :disabled="loading" @click="runJob('/convert/xlsx/salary/merge', false)">Merge → one sheet</button>
              <button class="action" :disabled="loading" @click="runJob('/convert/xlsx/salary/split', false)">Split → per sheet</button>
            </div>
          </div>
        </div>

        <!-- Accuracy / Salary -->
        <div class="category" :class="{ open: openCats.accuracy }">
          <div class="category-header" @click="toggleCategory('accuracy')">
            <span class="category-badge badge-accuracy">Accuracy</span>
            <span class="category-title">Salary</span>
            <span class="category-desc">Python · 100% formula accuracy</span>
            <span class="chevron">▼</span>
          </div>
          <div class="category-body">
            <div class="actions">
              <button class="action" :disabled="loading" @click="runJob('/convert/xlsx/accuracy/merge', false)">Merge → one sheet</button>
              <button class="action" :disabled="loading" @click="runJob('/convert/xlsx/accuracy/split', false)">Split → per sheet</button>
            </div>
          </div>
        </div>

        <!-- Raw / Any sheet -->
        <div class="category" :class="{ open: openCats.raw }">
          <div class="category-header" @click="toggleCategory('raw')">
            <span class="category-badge badge-raw">Raw</span>
            <span class="category-title">Any sheet</span>
            <span class="category-desc">Rust · generic sheet by name · requires sheet name</span>
            <span class="chevron">▼</span>
          </div>
          <div class="category-body">
            <div class="actions">
              <button class="action" :disabled="loading" @click="runJob('/convert/xlsx/raw/merge', true)">Merge → one sheet</button>
              <button class="action" :disabled="loading" @click="runJob('/convert/xlsx/raw/split', true)">Split → per sheet</button>
              <button class="action span-2" :disabled="loading" @click="runExtract">Extract sheet (one output per file)</button>
            </div>
          </div>
        </div>

      </div>

      <!-- Progress -->
      <div v-show="progressVisible" class="progress">
        <div class="progress-bar" :style="{ width: progressPct + '%' }" />
      </div>
      <div class="status" :class="statusType">{{ statusText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

definePageMeta({
  layout: false
})

const BASE = 'https://tools.vieclammienbac.com'

// ── State ──────────────────────────────────────────────────────────────────────
const fileInputRef = ref(null)
const files        = ref([])
const sheetName    = ref('')
const isDragOver   = ref(false)
const loading      = ref(false)

const openCats = reactive({ fast: true, accuracy: false, raw: false })

const progressVisible = ref(false)
const progressPct     = ref(0)
const statusText      = ref('')
const statusType      = ref('')   // '', 'ok', 'error'

// ── File handling ──────────────────────────────────────────────────────────────
function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileInputChange(e) {
  addFiles(e.target.files)
  e.target.value = ''
}

function onDrop(e) {
  isDragOver.value = false
  addFiles(e.dataTransfer.files)
}

function addFiles(newFiles) {
  for (const f of newFiles) {
    if (f.name.toLowerCase().endsWith('.xlsx')) files.value.push(f)
  }
}

function removeFile(i) {
  files.value.splice(i, 1)
}

// ── UI helpers ─────────────────────────────────────────────────────────────────
function toggleCategory(key) {
  openCats[key] = !openCats[key]
}

function showProgress(pct, text, type = '') {
  progressVisible.value = true
  progressPct.value     = pct
  statusText.value      = text
  statusType.value      = type
}

// ── Upload ─────────────────────────────────────────────────────────────────────
function uploadFile(file, index, total) {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE}/convert/xlsx/upload`)
    xhr.responseType = 'text'

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) {
        const sliceStart = (index / total) * 80
        const sliceSize  = (1 / total) * 80
        showProgress(
          sliceStart + (e.loaded / e.total) * sliceSize,
          `Uploading ${index + 1}/${total}: ${file.name}`
        )
      }
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status === 200 && data.file_id) resolve(data.file_id)
        else reject(new Error(data.error || `Upload failed (HTTP ${xhr.status})`))
      } catch {
        reject(new Error('Failed to parse upload response'))
      }
    }
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(form)
  })
}

// ── Poll ───────────────────────────────────────────────────────────────────────
async function pollResult(jobId, intervalMs = 1500, timeoutMs = 300_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, intervalMs))
    const res = await fetch(`${BASE}/convert/xlsx/result/${jobId}`)
    if (res.status === 200) return res
    if (res.status !== 404) throw new Error(`Unexpected status ${res.status} while polling`)
  }
  throw new Error('Timed out waiting for result')
}

function downloadResponse(res, filename = 'output.xlsx') {
  return res.blob().then(blob => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
  })
}

// ── Batch job ──────────────────────────────────────────────────────────────────
async function runJob(endpoint, withSheetName) {
  if (!files.value.length) { alert('Add at least one file.'); return }
  loading.value = true
  try {
    const fileIds = []
    for (let i = 0; i < files.value.length; i++)
      fileIds.push(await uploadFile(files.value[i], i, files.value.length))

    showProgress(82, 'Submitting job…')
    const sheet = sheetName.value.trim() || 'Sheet1'
    const body  = withSheetName ? { file_ids: fileIds, sheet_name: sheet } : { file_ids: fileIds }

    const jobRes = await fetch(`${BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!jobRes.ok) {
      const err = await jobRes.json().catch(() => ({}))
      throw new Error(err.error || `Job failed (HTTP ${jobRes.status})`)
    }
    const { job_id } = await jobRes.json()

    showProgress(90, 'Processing on server…')
    await downloadResponse(await pollResult(job_id))
    showProgress(100, 'Done', 'ok')
  } catch (e) {
    showProgress(0, `Error: ${e.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// ── Extract ────────────────────────────────────────────────────────────────────
async function runExtract() {
  if (!files.value.length) { alert('Add at least one file.'); return }
  const sheet = sheetName.value.trim() || 'Sheet1'
  loading.value = true
  try {
    for (let i = 0; i < files.value.length; i++) {
      const fileId = await uploadFile(files.value[i], i, files.value.length)

      showProgress(((i + 0.5) / files.value.length) * 80 + 10, `Submitting extract ${i + 1}/${files.value.length}…`)
      const jobRes = await fetch(`${BASE}/convert/xlsx/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId, sheet_name: sheet }),
      })
      if (!jobRes.ok) {
        const err = await jobRes.json().catch(() => ({}))
        throw new Error(err.error || `Extract failed (HTTP ${jobRes.status})`)
      }
      const { job_id } = await jobRes.json()

      showProgress(((i + 0.8) / files.value.length) * 80 + 10, `Waiting for result ${i + 1}/${files.value.length}…`)
      await downloadResponse(await pollResult(job_id), files.value[i].name)
    }
    showProgress(100, 'Done', 'ok')
  } catch (e) {
    showProgress(0, `Error: ${e.message}`, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

.page {
  font-family: Arial, sans-serif;
  background: #111;
  color: #eee;
  min-height: 100vh;
  padding: 40px;
  display: flex;
  justify-content: center;
}

.container {
  width: 100%;
  max-width: 900px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

/* Drop Zone */
.drop-zone {
  border: 2px dashed #444;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  border-radius: 8px;
  transition: border-color 0.2s;
}
.drop-zone.dragover { border-color: #4caf50; }

/* File list */
.file-list { margin-bottom: 4px; }

.file-item {
  display: flex;
  justify-content: space-between;
  background: #1a1a1a;
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
}
.file-item button {
  background: none;
  border: none;
  color: #f66;
  cursor: pointer;
}

/* Sheet name input */
input[type="text"] {
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  border-radius: 5px;
  border: 1px solid #444;
  background: #1a1a1a;
  color: #eee;
}

/* Categories */
.categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.category {
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #1a1a1a;
  cursor: pointer;
  user-select: none;
}
.category-header:hover { background: #222; }

.category-badge {
  font-size: 11px;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.badge-fast     { background: #1b3a1b; color: #4caf50; }
.badge-accuracy { background: #1a2a3a; color: #4a9eff; }
.badge-raw      { background: #2a2218; color: #e6a020; }

.category-title { font-weight: bold; font-size: 15px; flex: 1; }
.category-desc  { font-size: 12px; color: #777; }

.chevron {
  font-size: 12px;
  color: #555;
  transition: transform 0.2s;
}
.category.open .chevron { transform: rotate(180deg); }

.category-body {
  display: none;
  padding: 12px 16px;
  background: #161616;
  border-top: 1px solid #2a2a2a;
}
.category.open .category-body { display: block; }

/* Actions */
.actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

button.action {
  padding: 12px;
  border: 1px solid #333;
  background: #1e1e1e;
  color: #eee;
  cursor: pointer;
  border-radius: 5px;
  font-size: 13px;
  transition: background 0.15s;
}
button.action:hover    { background: #2a2a2a; }
button.action:disabled { opacity: 0.4; cursor: not-allowed; }
button.action.span-2   { grid-column: span 2; }

/* Progress */
.progress {
  height: 6px;
  background: #333;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
}
.progress-bar {
  height: 100%;
  background: #4caf50;
  transition: width 0.2s;
}

.status {
  text-align: center;
  margin-top: 8px;
  font-size: 13px;
  word-break: break-all;
}
.status.error { color: #f66; }
.status.ok    { color: #4caf50; }
</style>