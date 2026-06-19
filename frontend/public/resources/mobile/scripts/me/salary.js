import { fmtVND, fmtVNDFull, fmtShortDate, fmtDate, DAY_VI } from '/resources/scripts/me/utils.js';

const graphColor = '#e8b84b';

function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function updateStats(values) {
  const nonZero = values.filter(v => v > 0);
  const total   = values.reduce((a,b) => a+b, 0);
  const avg     = nonZero.length ? Math.round(total / nonZero.length) : 0;
  const highest = nonZero.length ? Math.max(...nonZero) : 0;
  const lowest  = nonZero.length ? Math.min(...nonZero) : 0;
  const last    = [...values].reverse();
  const curr    = last.find(v => v > 0) || 0;
  const prev    = last.slice(1).find(v => v > 0) || 0;
  const diff    = curr - prev;

  document.getElementById('rank-total').textContent   = fmtVND(total);
  document.getElementById('rank-avg').textContent     = fmtVND(avg);
  document.getElementById('stat-highest').textContent = fmtVND(highest);
  document.getElementById('stat-lowest').textContent  = fmtVND(lowest);
  document.getElementById('stat-count').textContent   = nonZero.length;

  const el = document.getElementById('stat-change');
  el.textContent = (diff >= 0 ? '▲ ' : '▼ ') + fmtVND(Math.abs(diff));
  el.style.color = diff >= 0 ? '#66ffb2' : '#ff6666';
}

let chart = null;
let currentLabels = [], currentValues = [];
let chartJsLoaded = false;

async function ensureChartJs() {
  if (chartJsLoaded || window.Chart) { chartJsLoaded = true; return; }
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  chartJsLoaded = true;
}

export async function buildChart(labels, values) {
  await ensureChartJs();

  currentLabels = labels;
  currentValues = values;

  const ctx = document.getElementById('salaryChart').getContext('2d');

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update('active');
  } else {
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: graphColor,
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: graphColor,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 1.5,
          fill: true,
          backgroundColor: (c) => {
            const g = c.chart.ctx.createLinearGradient(0, 0, 0, 120);
            g.addColorStop(0, hexToRgba(graphColor, 0.2));
            g.addColorStop(1, hexToRgba(graphColor, 0.0));
            return g;
          },
          tension: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400, easing: 'easeInOutQuart' },
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { left: 0, right: 4, top: 8, bottom: 0 } },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: 'rgba(255,255,255,0.18)',
              font: { size: 9 },
              maxTicksLimit: 6,
              maxRotation: 0,
              autoSkip: true
            },
            border: { display: false }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)', drawTicks: false },
            ticks: {
              color: 'rgba(255,255,255,0.18)',
              font: { size: 9 },
              maxTicksLimit: 4,
              callback: v => {
                if (v >= 1000000) return (v / 1000000).toFixed(1) + 'tr';
                if (v >= 1000)    return (v / 1000).toFixed(0) + 'k';
                return v;
              }
            },
            border: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            external({ chart, tooltip }) {
              const el = document.getElementById('graph-tooltip');
              if (tooltip.opacity === 0) { el.style.display = 'none'; return; }
              const idx = tooltip.dataPoints[0].dataIndex;
              document.getElementById('tt-label').textContent = currentLabels[idx];
              document.getElementById('tt-val').textContent   = fmtVNDFull(currentValues[idx]);
              el.style.display = 'block';
              const wrap = chart.canvas.parentNode.getBoundingClientRect();
              let left = tooltip.caretX - 40;
              left = Math.max(0, Math.min(left, wrap.width - 140));
              el.style.left = left + 'px';
              el.style.top  = (tooltip.caretY - 52) + 'px';
            }
          }
        }
      }
    });
  }

  updateStats(values);
}

export function salaryToChartData(periods, mode) {
  if (mode === 'weekly') {
    const p = periods[0];
    const labels = p.days.map(d => DAY_VI[d.day] || d.day);
    const values = p.days.map(d => d.amount);
    return { labels, values };
  } else {
    const reversed = [...periods].reverse();
    const labels = reversed.map(p => fmtShortDate(p.started_in));
    const values = reversed.map(p => p.total_salary);
    return { labels, values };
  }
}

export function renderPeriodList(periods, el) {
  const statusColor = { paid: '#66ffb2', pending: '#f59e0b', processing: '#60a5fa' };
  const statusLabel = { paid: 'Đã trả', pending: 'Chờ duyệt', processing: 'Đang xử lý' };

  const frag = document.createDocumentFragment();

  periods.forEach(p => {
    const card = document.createElement('div');
    card.className = 'period-card';
    card.style.marginBottom = '10px';

    const bonus = p.performance_multiplier > 1
      ? `<span class="period-bonus">+${((p.performance_multiplier - 1) * 100).toFixed(0)}% thưởng</span>`
      : '';

    const daysHtml = p.days.map(d => `
      <div class="day-chip ${d.amount === 0 ? 'day-off' : ''}">
        <span class="day-name">${DAY_VI[d.day]}</span>
        <span class="day-amt">${d.amount === 0 ? 'Nghỉ' : fmtVND(d.amount)}</span>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="period-header">
        <div class="period-dates">
          <span class="period-range">${fmtDate(p.started_in)} → ${fmtDate(p.ended_at)}</span>
          <span class="period-type">${p.type === 'weekly' ? 'Tuần' : 'Tháng'}</span>
        </div>
        <div class="period-right">
          ${bonus}
          <span class="period-status" style="color:${statusColor[p.status] || '#fff'}">${statusLabel[p.status] || p.status}</span>
          <span class="period-total">${fmtVNDFull(p.total_salary)}</span>
        </div>
      </div>
      <div class="period-days">${daysHtml}</div>
      <div class="period-rating">
        <span class="rating-stars">${'★'.repeat(Math.round(p.period_rating))}${'☆'.repeat(5 - Math.round(p.period_rating))}</span>
        <span class="rating-val">${p.period_rating.toFixed(1)}</span>
      </div>
    `;

    frag.appendChild(card);
  });

  el.appendChild(frag);
}