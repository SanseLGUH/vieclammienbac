// ═══════════════════════════════════════════════════
// HARDCODED DATA — edit these
// ═══════════════════════════════════════════════════
const HARDCODED = {
    weekly: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [650000, 700000, 0, 850000, 900000, 1200000, 0] 
    },
    monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [14000000, 15500000, 13800000, 16000000, 19500000, 17000000]
    }
};
// ═══════════════════════════════════════════════════
// API — set USE_API = true and fill your endpoint
// ═══════════════════════════════════════════════════
const USE_API = false;

async function fetchFromAPI(mode) {
    const API_URL = `/api/salary?mode=${mode}`;
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        // TODO: map your response:
        // return { labels: json.dates, values: json.amounts };
        return { labels: json.labels, values: json.values };
    } catch (e) {
        console.warn('API failed, using hardcoded:', e);
        return null;
    }
}

// ═══════════════════════════════════════════════════

const graphColor = '#e8b84b';

function fmtVND(v) {
    if (v === 0) return '0đ';
    if (v >= 1000000) return (v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1) + 'tr';
    return v.toLocaleString('vi-VN') + 'đ';
}

function fmtVNDFull(v) {
    return v.toLocaleString('vi-VN') + 'đ';
}

function hexToRgba(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
}

function updateStats(values) {
    const nonZero = values.filter(v => v > 0);
    const total   = values.reduce((a, b) => a + b, 0);
    const avg     = nonZero.length ? Math.round(total / nonZero.length) : 0;
    const highest = Math.max(...nonZero);
    const lowest  = Math.min(...nonZero);
    const last    = [...values].reverse();
    const curr    = last.find(v => v > 0) || 0;
    const prev    = last.slice(1).find(v => v > 0) || 0;
    const diff    = curr - prev;

    document.getElementById('rank-total').textContent = fmtVND(total);
    document.getElementById('rank-avg').textContent   = fmtVND(avg);
    document.getElementById('stat-highest').textContent = fmtVND(highest);
    document.getElementById('stat-lowest').textContent  = fmtVND(lowest);
    document.getElementById('stat-count').textContent   = nonZero.length;

    const changeEl = document.getElementById('stat-change');
    changeEl.textContent = (diff >= 0 ? '▲ ' : '▼ ') + fmtVND(Math.abs(diff));
    changeEl.style.color = diff >= 0 ? '#66ffb2' : '#ff6666';
}

let chart = null;
let currentLabels = [];
let currentValues = [];

function buildChart(labels, values) {
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
                    tension: 0, /* sharp angular like osu */
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 400, easing: 'easeInOutQuart' },
                interaction: { mode: 'index', intersect: false },
                layout: { padding: { left: 0, right: 0, top: 4, bottom: 0 } },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: 'rgba(255,255,255,0.18)',
                            font: { family: 'Nunito', size: 9 },
                            maxTicksLimit: 8,
                            maxRotation: 0
                        },
                        border: { display: false }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.04)', drawTicks: false },
                        ticks: {
                            color: 'rgba(255,255,255,0.18)',
                            font: { family: 'Nunito', size: 9 },
                            maxTicksLimit: 3,
                            callback: v => fmtVND(v)
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

async function loadData(mode) {
    document.getElementById('graph-loading').style.display = 'flex';
    let data = null;
    if (USE_API) data = await fetchFromAPI(mode);
    if (!data) data = HARDCODED[mode];
    document.getElementById('graph-loading').style.display = 'none';
    buildChart(data.labels, data.values);
}

function switchMode(mode, btn) {
    document.querySelectorAll('.graph-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    loadData(mode);
}

// Init
loadData('weekly');