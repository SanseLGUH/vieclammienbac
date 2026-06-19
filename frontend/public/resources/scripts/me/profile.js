// ─────────────────────────────────────────────
// profile.js — renders banner + about me section
// ─────────────────────────────────────────────
import { RANK_CONFIG, SHIFT_LABELS, fmtDate } from './utils.js';

export function renderBanner(me, el) {
  el.style.backgroundImage = `url(${me.profile.banner_url})`;
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  el.style.position = 'relative';
  el.innerHTML = `<div class="banner-overlay"></div>`;
}

export function renderProfile(me, company, el) {
  const rank = RANK_CONFIG[me.rank.level] || RANK_CONFIG.mid;
  const progress = me.rank.progress_percentage;
  const shift = SHIFT_LABELS[company?.shift] || company?.shift || '—';

  el.innerHTML = `
    <div class="profile-card">
      <div class="profile-left">
        <div class="avatar-wrap">
          <img class="avatar" src="${me.profile.avatar_url}" alt="${me.username}" />
        </div>
        <div class="profile-info">
          <h2 class="profile-username">${me.username}</h2>
          <p class="profile-status">${me.profile.status}</p>
          <p class="profile-bio">${me.profile.bio}</p>
          <div class="profile-tags">
            <span class="tag">${shift}</span>
            <span class="tag">⭐ ${me.rank.current_rate.toFixed(1)} / 5.0</span>
            <span class="tag">📅 Từ ${fmtDate(me.created_at)}</span>
          </div>
        </div>
      </div>

      <div class="profile-right">
        <div class="profile-stats-row">
          <div class="stat-block">
            <span class="stat-num">${me.stats.total_shifts}</span>
            <span class="stat-lbl">Ca đã làm</span>
          </div>
          <div class="stat-block">
            <span class="stat-num">${(me.stats.reliability_score * 100).toFixed(0)}%</span>
            <span class="stat-lbl">Độ tin cậy</span>
          </div>
        </div>
        <div class="rank-progress-wrap">
          <div class="rank-progress-label">
            <span>Tiến độ rank</span>
            <span style="color:${rank.color}">${progress}%</span>
          </div>
          <div class="rank-progress-bar">
            <div class="rank-progress-fill" style="width:${progress}%; background:${rank.color};"></div>
          </div>
          <div class="rank-progress-label">
            <span style="color:rgba(255,255,255,0.3)">Hiện tại: ${rank.label}</span>
            <span style="color:rgba(255,255,255,0.3)">Tiếp theo: ${me.rank.next_tier_limit}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="company-bar">
      <span class="company-bar-label">Đang làm việc tại</span>
      <span class="company-bar-name">${company?.name || '—'}</span>
      <span class="company-bar-dot">·</span>
      <span class="company-bar-meta">${shift}</span>
      <span class="company-bar-dot">·</span>
      <span class="company-bar-meta">📍 ${company?.pickup_point?.name || '—'}</span>
    </div>
  `;
}