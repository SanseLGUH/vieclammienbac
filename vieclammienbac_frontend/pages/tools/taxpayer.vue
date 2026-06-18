<template>
  <div>
    <Head>
      <Link rel="preconnect" href="https://fonts.googleapis.com" />
      <Link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <Link rel="icon" href="/resources/toolsfavicon.png" />
    </Head>

    <header>
      <div class="logo">BROSKY FASTEST MST CHECK IN VIETNAM! [Free API!]</div>
      <div class="header-meta">tracuunnt.gdt.gov.vn</div>
    </header>

    <div style="background: var(--border); margin: 0">
      <div class="container">
        <!-- Single lookup panel -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-tag">GET tools.vieclammienbac.com/taxpayer/info</div>
            <div class="panel-title">Single lookup</div>
            <div class="panel-sub">Query one MST directly</div>
          </div>

          <div class="field">
            <label>MST</label>
            <input
              v-model="singleMst"
              type="text"
              placeholder="022095011322"
              maxlength="14"
              @keydown.enter="singleLookup"
            />
          </div>

          <div class="btn-row" style="margin-top: 0">
            <button
              class="btn btn-primary"
              :disabled="singleLoading"
              @click="singleLookup"
            >
              {{ singleLoading ? 'Looking up…' : 'Run lookup' }}
            </button>
          </div>

          <div
            v-if="singleResult"
            class="result-box show"
            :class="singleResult.type"
          >
            <div class="result-header">
              <span
                class="result-status-dot"
                :style="{ background: resultDotColor(singleResult.type) }"
              />
              <span class="result-label">{{ singleResult.label }}</span>
              <span class="result-elapsed">{{ singleResult.elapsed }}</span>
            </div>
            <span>{{ singleResult.text }}</span>
          </div>
        </div>

        <!-- Bulk lookup panel -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-tag">POST tools.vieclammienbac.com/taxpayer/bulk</div>
            <div class="panel-title">Bulk lookup</div>
            <div class="panel-sub">Results sent to your email</div>
          </div>

          <div class="field">
            <label>MST list</label>
            <div class="tag-area" @click="focusTagInput">
              <span
                v-for="(tag, i) in tags"
                :key="i"
                class="tag-pill"
              >
                {{ tag }}
                <button type="button" @click.stop="removeTag(i)">×</button>
              </span>
              <input
                ref="tagInputRef"
                v-model="tagInput"
                type="text"
                class="tag-input"
                placeholder="Type or paste MSTs…"
                @keydown="handleTagKey"
                @input="handlePasteInput"
              />
            </div>
            <div class="tag-hint">
              Paste newline-separated list to add all at once · Enter or Space to add · max 50
            </div>
          </div>

          <div class="field">
            <label>Email</label>
            <input
              v-model="bulkEmail"
              type="email"
              placeholder="you@example.com"
            />
          </div>

          <div class="btn-row">
            <button
              class="btn btn-primary"
              :disabled="bulkLoading"
              @click="bulkLookup"
            >
              {{ bulkLoading ? 'Sending…' : 'Send request' }}
            </button>
            <button class="btn btn-ghost" @click="clearAll">Clear</button>
            <div class="count-badge">
              <span class="dot" :class="{ live: tags.length > 0 }" />
              <span v-if="tags.length > 0">{{ tags.length }} MST{{ tags.length !== 1 ? 's' : '' }}</span>
            </div>
          </div>

          <!-- Status bar -->
          <div class="status-bar" :class="{ show: bulkLoading || bulkStatusMsg }">
            <div class="status-lines">
              <div class="status-line1">{{ bulkStatusLine1 }}</div>
              <div class="status-line2">{{ bulkStatusLine2 }}</div>
            </div>
            <div
              class="status-timer"
              :class="{ warn: bulkElapsed > 10, danger: bulkElapsed > 20 }"
            >
              {{ bulkElapsed.toFixed(1) }}s
            </div>
          </div>

          <div class="timeout-hint" :class="{ show: bulkElapsed > 8 && bulkLoading }">
            Taking longer than expected…
          </div>

          <div
            v-if="bulkResult"
            class="result-box show"
            :class="bulkResult.type"
          >
            <div class="result-header">
              <span
                class="result-status-dot"
                :style="{ background: resultDotColor(bulkResult.type) }"
              />
              <span class="result-label">{{ bulkResult.label }}</span>
              <span class="result-elapsed">{{ bulkResult.elapsed }}</span>
            </div>
            <span>{{ bulkResult.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <footer />
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const singleMst = ref('')
const singleLoading = ref(false)
const singleResult = ref(null)

const tags = ref([])
const tagInput = ref('')
const bulkEmail = ref('')
const bulkLoading = ref(false)
const bulkResult = ref(null)
const bulkStatusMsg = ref(false)
const bulkStatusLine1 = ref('')
const bulkStatusLine2 = ref('')
const bulkElapsed = ref(0)

const tagInputRef = ref(null)

let bulkTimer = null
let bulkStart = null

// ── helpers ──────────────────────────────────────────────────────────────────

function resultDotColor(type) {
  return { ok: 'var(--success)', err: 'var(--danger)', warn: 'var(--warn)', loading: 'var(--accent)' }[type] ?? 'var(--text3)'
}

function formatElapsed(ms) {
  return (ms / 1000).toFixed(2) + 's'
}

function addTag(value) {
  const v = value.trim()
  if (!v || tags.value.length >= 50 || tags.value.includes(v)) return
  tags.value.push(v)
}

function removeTag(i) {
  tags.value.splice(i, 1)
}

function focusTagInput() {
  tagInputRef.value?.focus()
}

function handleTagKey(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    addTag(tagInput.value)
    tagInput.value = ''
  } else if (e.key === 'Backspace' && tagInput.value === '' && tags.value.length) {
    tags.value.pop()
  }
}

function handlePasteInput(e) {
  const raw = e.target.value
  if (raw.includes('\n') || raw.includes('\r')) {
    raw.split(/[\r\n]+/).forEach(addTag)
    tagInput.value = ''
  }
}

function clearAll() {
  tags.value = []
  tagInput.value = ''
  bulkEmail.value = ''
  bulkResult.value = null
  bulkStatusMsg.value = false
  bulkStatusLine1.value = ''
  bulkStatusLine2.value = ''
  bulkElapsed.value = 0
  clearInterval(bulkTimer)
}

// ── single lookup ─────────────────────────────────────────────────────────────

async function singleLookup() {
  const mst = singleMst.value.trim()
  if (!mst) return
  singleLoading.value = true
  singleResult.value = { type: 'loading', label: 'QUERYING', text: 'Fetching…', elapsed: '' }
  const t0 = Date.now()
  try {
    const res = await fetch(`https://tools.vieclammienbac.com/taxpayer/info?mst=${encodeURIComponent(mst)}`)
    const elapsed = formatElapsed(Date.now() - t0)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    singleResult.value = {
      type: 'ok',
      label: 'OK',
      elapsed,
      text: JSON.stringify(data, null, 2),
    }
  } catch (err) {
    singleResult.value = {
      type: 'err',
      label: 'ERROR',
      elapsed: formatElapsed(Date.now() - t0),
      text: err.message,
    }
  } finally {
    singleLoading.value = false
  }
}

// ── bulk lookup ───────────────────────────────────────────────────────────────

async function bulkLookup() {
  if (!tags.value.length || !bulkEmail.value.trim()) return
  bulkLoading.value = true
  bulkResult.value = null
  bulkStatusMsg.value = true
  bulkStatusLine1.value = 'Sending bulk request…'
  bulkStatusLine2.value = `${tags.value.length} MSTs → ${bulkEmail.value}`
  bulkElapsed.value = 0
  bulkStart = Date.now()
  bulkTimer = setInterval(() => {
    bulkElapsed.value = (Date.now() - bulkStart) / 1000
  }, 100)

  try {
    const res = await fetch('https://tools.vieclammienbac.com/taxpayer/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msts: tags.value, email: bulkEmail.value }),
    })
    const elapsed = formatElapsed(Date.now() - bulkStart)
    clearInterval(bulkTimer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    bulkStatusLine1.value = 'Request accepted'
    bulkStatusLine2.value = `Results will be emailed to ${bulkEmail.value}`
    bulkResult.value = { type: 'ok', label: 'QUEUED', elapsed, text: JSON.stringify(data, null, 2) }
  } catch (err) {
    clearInterval(bulkTimer)
    bulkStatusLine1.value = 'Request failed'
    bulkStatusLine2.value = err.message
    bulkResult.value = {
      type: 'err',
      label: 'ERROR',
      elapsed: formatElapsed(Date.now() - bulkStart),
      text: err.message,
    }
  } finally {
    bulkLoading.value = false
  }
}

onUnmounted(() => clearInterval(bulkTimer))
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0d0d0d;
  --surface: #141414;
  --surface2: #1a1a1a;
  --border: #2a2a2a;
  --border2: #333;
  --text: #e8e8e8;
  --text2: #888;
  --text3: #555;
  --accent: #c8f135;
  --accent-dim: rgba(200, 241, 53, 0.08);
  --accent-dim2: rgba(200, 241, 53, 0.15);
  --danger: #ff4444;
  --success: #44ff88;
  --warn: #ffaa44;
  --mono: 'IBM Plex Mono', monospace;
  --sans: 'IBM Plex Sans', sans-serif;
}

html { background: var(--bg); color: var(--text); font-family: var(--sans); font-size: 14px; line-height: 1.6; }
body { min-height: 100vh; padding: 0; }

header {
  border-bottom: 1px solid var(--border);
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 100;
}

.logo {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--accent);
  text-transform: uppercase;
}

.header-meta {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text3);
  letter-spacing: 0.05em;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border);
}

.panel {
  background: var(--bg);
  padding: 2rem;
}

.panel-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.panel-tag {
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  background: var(--accent-dim);
  border: 1px solid rgba(200,241,53,0.2);
  display: inline-block;
  padding: 2px 8px;
  margin-bottom: 12px;
}

.panel-title {
  font-family: var(--mono);
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.panel-sub {
  font-size: 13px;
  color: var(--text2);
  font-family: var(--mono);
}

.field { margin-bottom: 1.25rem; }

.field label {
  display: block;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text2);
  margin-bottom: 6px;
}

.field input, .field textarea {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border2);
  color: var(--text);
  font-family: var(--mono);
  font-size: 13px;
  padding: 10px 12px;
  outline: none;
  transition: border-color 0.15s;
  appearance: none;
  border-radius: 0;
}

.field input:focus, .field textarea:focus {
  border-color: var(--accent);
  background: var(--surface2);
}

.field input::placeholder, .field textarea::placeholder { color: var(--text3); }

.btn {
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 10px 20px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.15s;
  border-radius: 0;
}

.btn:hover { border-color: var(--text2); color: var(--text); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-primary { background: var(--accent); border-color: var(--accent); color: #0d0d0d; }
.btn-primary:hover { background: #d4f545; border-color: #d4f545; color: #0d0d0d; }
.btn-primary:active { transform: translateY(1px); }

.btn-ghost { border-color: transparent; color: var(--text3); padding: 10px 12px; }
.btn-ghost:hover { border-color: var(--border2); color: var(--text2); background: transparent; }

.btn-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 1.5rem;
}

.tag-area {
  background: var(--surface);
  border: 1px solid var(--border2);
  min-height: 80px;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-content: flex-start;
  cursor: text;
  transition: border-color 0.15s;
}

.tag-area:focus-within { border-color: var(--accent); background: var(--surface2); }

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--accent-dim2);
  border: 1px solid rgba(200,241,53,0.25);
  padding: 2px 8px 2px 10px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--accent);
  animation: tagIn 0.15s ease;
}

@keyframes tagIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

.tag-pill button {
  background: none;
  border: none;
  color: rgba(200,241,53,0.4);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.1s;
}

.tag-pill button:hover { color: var(--danger); }

.tag-input {
  background: none;
  border: none;
  color: var(--text);
  font-family: var(--mono);
  font-size: 13px;
  outline: none;
  min-width: 160px;
  flex: 1;
  padding: 2px 4px;
}

.tag-input::placeholder { color: var(--text3); }
.tag-hint { font-family: var(--mono); font-size: 11px; color: var(--text3); margin-top: 6px; }

.count-badge {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text3);
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text3);
  display: inline-block;
  flex-shrink: 0;
}

.dot.live { background: var(--accent); animation: pulse 2s infinite; }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.status-bar {
  display: none;
  margin-top: 1rem;
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border2);
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text2);
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.status-bar.show { display: flex; }

.status-lines { flex: 1; }
.status-line1 { color: var(--text); font-size: 12px; }
.status-line2 { color: var(--text3); font-size: 11px; margin-top: 1px; }

.status-timer {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--accent);
  font-weight: 600;
  min-width: 40px;
  text-align: right;
}

.status-timer.warn { color: var(--warn); }
.status-timer.danger { color: var(--danger); }

.timeout-hint {
  display: none;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text3);
  margin-top: 6px;
}

.timeout-hint.show { display: block; }

.result-box {
  display: none;
  margin-top: 1.25rem;
  padding: 12px;
  background: var(--surface);
  border-left: 2px solid var(--border2);
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text2);
  white-space: pre-wrap;
  word-break: break-all;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.result-box.show { display: block; }
.result-box.ok { border-left-color: var(--success); }
.result-box.err { border-left-color: var(--danger); }
.result-box.warn { border-left-color: var(--warn); }
.result-box.loading { border-left-color: var(--accent); }

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.result-status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.result-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
.result-elapsed { margin-left: auto; font-size: 11px; color: var(--text3); }

footer {
  border-top: 1px solid var(--border);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text3);
  letter-spacing: 0.05em;
  min-height: 48px;
}

@media (max-width: 640px) {
  .container { grid-template-columns: 1fr; }
  .panel { padding: 1.5rem; }
  header { padding: 0 1rem; }
}
</style>