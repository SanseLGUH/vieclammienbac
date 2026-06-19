// ─────────────────────────────────────────────
// utils.js — shared helpers
// ─────────────────────────────────────────────

export function fmtVND(v) {
  if (!v || v === 0) return '0đ';
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1) + 'tr';
  return v.toLocaleString('vi-VN') + 'đ';
}

export function fmtVNDFull(v) {
  return (v || 0).toLocaleString('vi-VN') + 'đ';
}

export function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function fmtShortDate(iso) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export const RANK_CONFIG = {
  bad:     { label: 'Yếu',    color: '#ff4d4d', bg: 'rgba(255,77,77,0.12)'  },
  mid:     { label: 'Trung bình', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  good:    { label: 'Tốt',    color: '#e8b84b', bg: 'rgba(232,184,75,0.12)' },
  perfect: { label: 'Xuất sắc', color: '#66ffb2', bg: 'rgba(102,255,178,0.12)' }
};

export const SHIFT_LABELS = {
  morning:   '🌅 Ca sáng',
  afternoon: '🌇 Ca chiều',
  evening:   '🌆 Ca tối',
  night:     '🌙 Ca đêm',
  full:      '⏱ Toàn ngày'
};

export const DAY_VI = {
  monday: 'T2', tuesday: 'T3', wednesday: 'T4',
  thursday: 'T5', friday: 'T6', saturday: 'T7', sunday: 'CN'
};