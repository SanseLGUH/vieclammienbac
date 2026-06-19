const msts = [];

// ── Tab switching ────────────────────────────────────────────────
function switchTab(id, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('screen-' + id).classList.add('active');
}

// ── Tag management ───────────────────────────────────────────────
function renderTags() {
  const area = document.getElementById('tag-area');
  const input = document.getElementById('tag-input');
  area.querySelectorAll('.tag-pill').forEach(t => t.remove());
  msts.forEach((m, i) => {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.innerHTML = m + '<button onclick="removeTag(' + i + ')">×</button>';
    area.insertBefore(pill, input);
  });
  const dot = document.getElementById('count-dot');
  const cnt = document.getElementById('mst-count');
  const tabCount = document.getElementById('tab-bulk-count');
  if (msts.length) {
    dot.className = 'dot live';
    cnt.innerHTML = '<span class="counter-num">' + msts.length + '</span> MST' + (msts.length !== 1 ? 's' : '') + ' queued · max 50';
    tabCount.textContent = msts.length;
  } else {
    dot.className = 'dot';
    cnt.textContent = 'No MSTs added yet';
    tabCount.textContent = '0';
  }
}

function removeTag(i) { msts.splice(i, 1); renderTags(); }

function addMst(v) {
  v = v.trim();
  if (v && !msts.includes(v) && msts.length < 50) { msts.push(v); renderTags(); }
}

function handleTagKey(e) {
  const inp = e.target;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (inp.value.trim()) { addMst(inp.value); inp.value = ''; }
  } else if (e.key === 'Backspace' && !inp.value && msts.length) {
    msts.pop(); renderTags();
  }
}

function handlePasteInput(e) {
  const inp = e.target;
  setTimeout(() => {
    const val = inp.value;
    if (val.includes('\n') || val.includes(',') || (val.includes(' ') && val.trim().split(/\s+/).length > 1)) {
      val.split(/[\s\n,]+/).filter(Boolean).forEach(addMst);
      inp.value = '';
    }
  }, 0);
}

function clearAll() {
  msts.length = 0;
  renderTags();
  hideStatus('bulk');
  showResult('bulk-result', '', '');
}

// ── Timer logic ──────────────────────────────────────────────────
const timers = {};

function startTimer(prefix, onTick) {
  const start = Date.now();
  let ticks = 0;

  timers[prefix] = setInterval(() => {
    ticks++;
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const timerEl = document.getElementById(prefix + '-timer');
    if (timerEl) {
      timerEl.textContent = elapsed + 's';
      // color warning thresholds
      if (parseFloat(elapsed) >= 30) timerEl.className = 'status-timer danger';
      else if (parseFloat(elapsed) >= 15) timerEl.className = 'status-timer warn';
      else timerEl.className = 'status-timer';
    }
    if (onTick) onTick(parseFloat(elapsed), ticks);
  }, 100);

  return start;
}

function stopTimer(prefix) {
  clearInterval(timers[prefix]);
  delete timers[prefix];
}

function getElapsed(start) {
  return ((Date.now() - start) / 1000).toFixed(1);
}

// ── Status bar ───────────────────────────────────────────────────
function showStatus(prefix, line1, line2) {
  const bar = document.getElementById(prefix + '-status');
  if (bar) bar.classList.add('show');
  const l1 = document.getElementById(prefix + '-status-line1');
  const l2 = document.getElementById(prefix + '-status-line2');
  if (l1) l1.textContent = line1;
  if (l2) l2.textContent = line2;
}

function hideStatus(prefix) {
  const bar = document.getElementById(prefix + '-status');
  if (bar) bar.classList.remove('show');
  const th = document.getElementById(prefix + '-timeout');
  if (th) th.classList.remove('show');
  const timerEl = document.getElementById(prefix + '-timer');
  if (timerEl) { timerEl.textContent = '0.0s'; timerEl.className = 'status-timer'; }
}

function showTimeoutHint(prefix) {
  const th = document.getElementById(prefix + '-timeout');
  if (th) th.classList.add('show');
}

// ── Result box ───────────────────────────────────────────────────
function showResult(id, msg, type) {
  const el = document.getElementById(id);
  if (!msg) { el.className = 'result-box'; el.innerHTML = ''; return; }

  const icons = { ok: { dot: 'var(--success)', label: 'Success' }, err: { dot: 'var(--danger)', label: 'Error' }, warn: { dot: 'var(--warn)', label: 'Warning' } };
  const meta = icons[type] || null;

  el.className = 'result-box show' + (type ? ' ' + type : '');
  el.innerHTML = meta
    ? `<div class="result-header">
         <span class="result-status-dot" style="background:${meta.dot}"></span>
         <span class="result-label" style="color:${meta.dot}">${meta.label}</span>
         <span class="result-elapsed" id="${id}-elapsed"></span>
       </div><div id="${id}-body"></div>`
    : `<div id="${id}-body">${msg}</div>`;

  if (meta) document.getElementById(id + '-body').textContent = msg;
}

function setResultElapsed(id, elapsed) {
  const el = document.getElementById(id + '-elapsed');
  if (el) el.textContent = elapsed + 's';
}

let timerInterval;

async function singleLookup() {
  const mstInput = document.getElementById('single-mst');
  const button = document.getElementById('single-btn');
  const mst = mstInput.value.trim();

  if (!mst) {
    showResult('single-result', '⚠️ Enter an MST.', 'err');
    return;
  }

  button.disabled = true;

  let seconds = 0;
  showResult('single-result', `⏳ Looking up... (0.0s)`, 'loading');

  timerInterval = setInterval(() => {
    seconds += 0.1;
    showResult(
      'single-result',
      `⏳ Looking up... (${seconds.toFixed(1)}s)`,
      'loading'
    );
  }, 100);

  try {
    const startTime = performance.now();

    const data = await pollLookup(mst);

    const endTime = performance.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);

    clearInterval(timerInterval);

    showResult(
      'single-result',
      `✅ Done in ${totalTime}s\n\n${JSON.stringify(data, null, 2)}`,
      'ok'
    );

  } catch (err) {
    clearInterval(timerInterval);

    showResult(
      'single-result',
      `❌ Error after ${seconds.toFixed(1)}s\n${err.message}`,
      'err'
    );

  } finally {
    button.disabled = false;
  }
}

async function pollLookup(mst) {
  const DELAY = 5000;

  const r = await fetch(`https://tools.vieclammienbac.com/taxpayer/info?mst=${encodeURIComponent(mst)}`);

  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`HTTP ${r.status}: ${errText}`);
  }

  const data = await r.json();

  if (data.status === "processing") {
    await new Promise(r => setTimeout(r, DELAY));
    return pollLookup(mst);
  }

  return data;
}

// ── Bulk lookup ──────────────────────────────────────────────────
async function bulkLookup() {
  const email = document.getElementById('bulk-email').value.trim();
  if (!msts.length) { showResult('bulk-result', 'Add at least one MST.', 'err'); return; }
  if (!email) { showResult('bulk-result', 'Enter an email address.', 'err'); return; }

  const btn = document.getElementById('bulk-btn');
  btn.disabled = true;
  showResult('bulk-result', '', '');
  document.getElementById('bulk-status').classList.add('show');
  document.getElementById('bulk-status-line1').textContent = 'Sending ' + msts.length + ' MST' + (msts.length !== 1 ? 's' : '') + '…';
  document.getElementById('bulk-status-line2').textContent = 'Submitting to server';

  const startTs = startTimer('bulk');

  try {
    const r = await fetch('https://tools.vieclammienbac.com/taxpayer/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msts, email })
    });

    stopTimer('bulk');
    const elapsed = getElapsed(startTs);
    hideStatus('bulk');

    const text = await r.text();

    if (r.ok) {
      showResult('bulk-result', 'Request accepted. Results will be sent to ' + email + '.', 'ok');
    } else {
      showResult('bulk-result', 'HTTP ' + r.status + ': ' + text, 'err');
    }
    setResultElapsed('bulk-result', elapsed);
  } catch(e) {
    stopTimer('bulk');
    const elapsed = getElapsed(startTs);
    hideStatus('bulk');
    showResult('bulk-result', 'Network error: ' + e.message, 'err');
    setResultElapsed('bulk-result', elapsed);
  } finally {
    btn.disabled = false;
  }
}