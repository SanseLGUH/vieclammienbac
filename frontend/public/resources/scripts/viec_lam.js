/**
 * viec_lam.js
 * Handles tab switching, filters, and chat for the ViecLam job board.
 */

// ─── API CONFIG ───────────────────────────────────────────────────────────────
const API_BASE = 'https://api.vieclammienbac.com/posts';
const LIMIT = 10;
const RADIUS_KM = 25.0;

// ─── STATE ────────────────────────────────────────────────────────────────────
let currentOffset = 0;
let isLoading = false;
let userCoords = null;   // { lat, lng } once GPS resolves

const CATEGORY_LABELS = {
  chinh_thuc:  'Chính thức',
  chinhthuc:   'Chính thức',
  mua_vu:      'Mùa vụ',
  muavu:       'Mùa vụ',
};

// ─── GPS ──────────────────────────────────────────────────────────────────────
/**
 * Attempt to get the user's position. Resolves silently — if GPS fails or is
 * denied we just fall back to returning all posts (no lat/lng params).
 */
function initGPS() {
  if (!('geolocation' in navigator)) return;

  navigator.geolocation.getCurrentPosition(
    position => {
        userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
    },
    () => { /* permission denied or unavailable — silently ignore */ },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatDate(isoString) {
  const diffDays = Math.floor((Date.now() - new Date(isoString)) / 86_400_000);
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7)  return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return `${Math.floor(diffDays / 30)} tháng trước`;
}

/** Read current filter values from the DOM */
function getFilters() {
  // Category: collect checked checkboxes
  const categories = [...document.querySelectorAll('.checkbox-group input[type=checkbox]:checked')]
    .map(cb => cb.value)
    .filter(Boolean);

  // Date posted → from / to (ISO strings)
  const dateRadio = document.querySelector('.radio-group input[type=radio]:checked');
  let from = '';
  if (dateRadio) {
    const offsets = { '1': 1, '7': 7, '30': 30 };
    const days = offsets[dateRadio.value];
    if (days) {
      const d = new Date();
      d.setDate(d.getDate() - days);
      from = d.toISOString();
    }
  }

  // Salary (kept for future use)
  const salaryMin = document.querySelector('.number-input[data-role=min]')?.value || '';
  const salaryMax = document.querySelector('.number-input[data-role=max]')?.value || '';

  return { categories, from, salaryMin, salaryMax };
}

/** Build the fetch URL from current filters + offset */
function buildUrl(offset) {
  const { categories, from } = getFilters();
  const params = new URLSearchParams({ limit: LIMIT, start_from: offset });

  if (categories.length === 1) params.set('category', categories[0]);
  if (from) params.set('from', from);

  // Attach GPS coords when available
  if (userCoords) {
    params.set('lat', userCoords.lat);
    params.set('lng', userCoords.lng);
    params.set('radius_km', RADIUS_KM);
  }

  return `${API_BASE}?${params}`;
}

// ─── SKELETON / GRID ──────────────────────────────────────────────────────────
function showSkeletons(count) {
  const grid = document.getElementById('postsGrid');
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton';
    grid.appendChild(sk);
  }
}
function removeSkeletons() {
  document.querySelectorAll('.skeleton').forEach(s => s.remove());
}

// ─── LOAD POSTS ───────────────────────────────────────────────────────────────
async function loadPosts(initial = false) {
  if (isLoading) return;
  isLoading = true;

  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) loadMoreBtn.disabled = true;
  if (initial) {
    document.getElementById('postsGrid').innerHTML = '';
    showSkeletons(LIMIT);
  }

  try {
    const res = await fetch(buildUrl(currentOffset));
    if (!res.ok) throw new Error('API error');
    const posts = await res.json();

    removeSkeletons();
    const grid = document.getElementById('postsGrid');

    posts.forEach((post, i) => {
      const card = document.createElement('div');
      card.className = 'job-card';
      card.style.animationDelay = `${i * 0.05}s`;

      const categoryLabel = CATEGORY_LABELS[post.category] || post.category || '';
      const dateStr = post.created_at ? formatDate(post.created_at) : '';

      card.innerHTML = `
        ${post.preview ? `<img src="${post.preview}" alt="${post.title}" loading="lazy" />` : ''}
        <div class="job-card-body">
          ${categoryLabel ? `<div class="job-card-category">${categoryLabel}</div>` : ''}
          <div class="job-card-title">${post.title}</div>
          ${post.address ? `<div class="job-card-desc">${truncate(post.address, 120)}</div>` : ''}
          <div class="job-card-meta">${dateStr}</div>
          <a class="job-card-btn" href="/job?post=${post.id}">Xem chi tiết →</a>
        </div>
      `;
      grid.appendChild(card);
    });

    currentOffset += posts.length;
    document.getElementById('loadMoreWrap').style.display =
      posts.length === LIMIT ? 'block' : 'none';

  } catch (e) {
    removeSkeletons();
    console.error('Failed to load posts', e);
  }

  isLoading = false;
  if (loadMoreBtn) loadMoreBtn.disabled = false;
}

function loadMore() { loadPosts(false); }

// ─── APPLY FILTERS ────────────────────────────────────────────────────────────
function applyFilters() {
  currentOffset = 0;
  loadPosts(true);
}

function truncate(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function switchTab(tab) {
  const isFilters = tab === 'filters';
  document.getElementById('tab-filters').style.display = isFilters ? 'block' : 'none';
  document.getElementById('tab-chat').style.display    = isFilters ? 'none'  : 'flex';
  document.getElementById('btn-filters').classList.toggle('tab-btn--active',  isFilters);
  document.getElementById('btn-chat').classList.toggle('tab-btn--active',    !isFilters);
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────
const chatHistory = [];   // { role: 'user'|'assistant', content: string }

function appendBubble(text, role) {
  const messages = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble--${role === 'user' ? 'user' : 'bot'}`;
  bubble.textContent = text;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

async function sendMsg() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  appendBubble(msg, 'user');
  chatHistory.push({ role: 'user', content: msg });

  // Typing indicator
  const messages = document.getElementById('chat-messages');
  const typing = document.createElement('div');
  typing.className = 'chat-bubble chat-bubble--bot chat-bubble--typing';
  typing.textContent = '...';
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a helpful job search assistant for ViecLam Mien Bac, 
a Vietnamese job board focused on Northern Vietnam factory and manufacturing jobs. 
Help users find suitable jobs, understand job postings, and navigate the site. 
Reply in the same language the user writes in (Vietnamese or English). Be concise and friendly.`,
        messages: chatHistory,
      }),
    });

    const data = await res.json();
    const reply = data.content?.find(b => b.type === 'text')?.text || 'Xin lỗi, có lỗi xảy ra.';

    typing.remove();
    appendBubble(reply, 'assistant');
    chatHistory.push({ role: 'assistant', content: reply });

  } catch (e) {
    typing.remove();
    appendBubble('Xin lỗi, không thể kết nối. Vui lòng thử lại.', 'assistant');
    console.error('Chat error:', e);
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Start GPS lookup early so coords are ready by the time user hits Apply
  initGPS();

  // Give checkboxes proper values matching API categories
  const checkboxes = document.querySelectorAll('.checkbox-group input[type=checkbox]');
  const categoryValues = ['chinh_thuc', 'mua_vu'];
  checkboxes.forEach((cb, i) => { cb.value = categoryValues[i] ?? ''; });

  // Give date radios values (days back)
  const radios = document.querySelectorAll('.radio-group input[type=radio]');
  const radioValues = ['', '1', '7', '30'];
  radios.forEach((r, i) => { r.value = radioValues[i] ?? ''; });

  // Give salary inputs data roles
  const numberInputs = document.querySelectorAll('.number-input');
  if (numberInputs[0]) numberInputs[0].dataset.role = 'min';
  if (numberInputs[1]) numberInputs[1].dataset.role = 'max';

  // Wire Apply button
  document.querySelector('.apply-btn')?.addEventListener('click', applyFilters);

  // Initial load
  loadPosts(true);
});