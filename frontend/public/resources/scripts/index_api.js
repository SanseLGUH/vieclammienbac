/**
 * index_api.js — fetches all dynamic data for the homepage
 * Base URL: https://api.vieclammienbac.com
 *
 * ─────────────────────────────────────────────────────────────────
 * ENDPOINT CONTRACT (what each endpoint must return)
 * ─────────────────────────────────────────────────────────────────
 *
 * GET /metadata/stats
 * → Array<{ num: string, label: string }>
 * Example:
 * [
 *   { "num": "50K+", "label": "Việc đang tuyển" },
 *   { "num": "12K+", "label": "Nhà tuyển dụng" },
 *   { "num": "200K+", "label": "Ứng viên" }
 * ]
 *
 * ─────────────────────────────────────────────────────────────────
 * GET /metadata/licenses
 * → Array<{ href: string, img: string, alt: string, label: string }>
 * Example:
 * [
 *   {
 *     "href": "https://vieclammienbac.com/wp-content/uploads/2024/12/GIAY-PHEP-HOAT-DONG-DICH-VU-VIEC-LAM.pdf",
 *     "img": "/resources/images/GIAY-PHEP-HOAT-DONG-DICH-VU-VIEC-LAM_pages-to-jpg-0001.jpg",
 *     "alt": "Giấy phép hoạt động dịch vụ việc làm",
 *     "label": "Dịch vụ việc làm"
 *   },
 *   {
 *     "href": "https://vieclammienbac.com/wp-content/uploads/2024/12/GIAY-PHEP-CHO-THUE-LAI-LAO-DONG.pdf",
 *     "img": "/resources/images/GIAY-PHEP-CHO-THUE-LAI-LAO-DONG_page-0001.jpg",
 *     "alt": "Giấy phép cho thuê lại lao động",
 *     "label": "Cho thuê lại lao động"
 *   }
 * ]
 *
 * ─────────────────────────────────────────────────────────────────
 * GET /jobs/hot
 * → Array<HotJob> (max 5–6 items, shown as large cards)
 * HotJob: {
 *   id: string,
 *   accent: string,          // hex color e.g. "#f59e0b"
 *   accent_glow: string,     // rgba e.g. "rgba(245,158,11,0.35)"
 *   gradient_from: string,   // hex for gradient start
 *   gradient_to: string,     // hex for gradient end
 *   logo_text: string,       // short abbreviation e.g. "GR"
 *   badge: string,           // e.g. "🔥 Tuyển gấp" or "✦ Mới"
 *   role: string,
 *   company: string,
 *   location: string,
 *   tags: string[],          // 2–3 skill/type tags
 *   salary_range: string,    // e.g. "18 – 28 triệu"
 *   salary_note: string,     // e.g. "/ tháng · có thưởng"
 *   apply_url: string
 * }
 *
 * ─────────────────────────────────────────────────────────────────
 * GET /jobs/latest?tab=&province=&industry=&salary=&q=
 * Query params (all optional):
 *   tab      = "" | "hot" | "new" | "highsalary" | "kcn"
 *   province = province name string
 *   industry = industry name string
 *   salary   = "0-10" | "10-20" | "20-35" | "35-999"
 *   q        = free text search
 *
 * → Array<JobRow>
 * JobRow: {
 *   id: string,
 *   gradient_from: string,
 *   gradient_to: string,
 *   logo_text: string,
 *   role: string,
 *   location: string,
 *   company: string,
 *   work_type: string,       // e.g. "Toàn thời gian" | "Ca xoay"
 *   chips: Array<{
 *     type: "hot" | "new" | "default",
 *     label: string
 *   }>,
 *   salary_main: string,     // e.g. "18 – 28 tr"
 *   salary_note: string,     // e.g. "có thưởng"
 *   apply_url: string
 * }
 *
 * ─────────────────────────────────────────────────────────────────
 * GET /metadata/provinces
 * → string[]
 * Example: ["Hà Nội", "Hải Phòng", "Bắc Ninh", "Bắc Giang", "Thái Nguyên"]
 *
 * ─────────────────────────────────────────────────────────────────
 * GET /metadata/industries
 * → string[]
 * Example: ["Sản xuất / Cơ khí", "Điện / Điện tử", "Kỹ thuật", "Kế toán", "Logistics"]
 *
 * ─────────────────────────────────────────────────────────────────
 * GET /metadata/companies_icons   (already exists)
 * → Array<{ name: string, logo_url: string, width?: string }>
 *
 * ─────────────────────────────────────────────────────────────────
 * GET /news/latest
 * → Array<NewsItem>
 * NewsItem: {
 *   id: string,
 *   featured: boolean,       // first item with featured:true gets large card layout
 *   image_url: string,
 *   category_label: string,  // e.g. "📊 Thị trường"
 *   category_bg: string,     // rgba e.g. "rgba(245,158,11,0.85)"
 *   category_color: string,  // text color e.g. "#000"
 *   title: string,
 *   excerpt: string,
 *   date: string,            // e.g. "12 tháng 3, 2025"
 *   read_time?: string,      // e.g. "5 phút đọc" (optional, shown on featured)
 *   url: string
 * }
 * ─────────────────────────────────────────────────────────────────
 */

const API = 'https://api.vieclammienbac.com';

// ── Utilities ────────────────────────────────────────────────────

async function apiFetch(path) {
    const res = await fetch(`${API}${path}`);
    if (!res.ok) throw new Error(`${path} → ${res.status}`);
    return res.json();
}

function svgArrow() {
    return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
}

function svgExternal() {
    return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M7 7h10v10"/></svg>`;
}

// ── Banner stats ─────────────────────────────────────────────────

async function loadStats() {
    try {
        const stats = await apiFetch('/metadata/stats');
        const el = document.getElementById('banner-stats');
        el.innerHTML = stats.map(s => `
            <div class="stat">
                <span class="stat-num">${s.num}</span>
                <span class="stat-label">${s.label}</span>
            </div>
        `).join('');
    } catch (e) {
        console.error('stats:', e);
    }
}

// ── Banner licenses ───────────────────────────────────────────────

async function loadLicenses() {
    try {
        const licenses = await apiFetch('/metadata/licenses');
        const el = document.getElementById('banner-licenses');
        el.innerHTML = licenses.map(l => `
            <a class="license-card" href="${l.href}" target="_blank">
                <img class="license-img" src="${l.img}" alt="${l.alt}">
                <span class="license-label">${l.label}</span>
            </a>
        `).join('');
    } catch (e) {
        console.error('licenses:', e);
    }
}

// ── Hot job cards ────────────────────────────────────────────────

function renderHotCard(job) {
    return `
        <div class="jb-card" style="--accent:${job.accent};--accent-glow:${job.accent_glow}">
            <div class="jb-accent" style="background:linear-gradient(90deg,${job.gradient_from},${job.gradient_to})"></div>
            <div class="jb-bg-shape" style="background:${job.accent}"></div>
            <div class="jb-dot" style="background:${job.accent}"></div>
            <div class="jb-content">
                <div class="jb-logo" style="background:linear-gradient(135deg,${job.gradient_from},${job.gradient_to})">${job.logo_text}</div>
                <span class="jb-badge" style="background:${job.accent}1a;color:${job.accent}">${job.badge}</span>
                <div class="jb-role">${job.role}</div>
                <div class="jb-company">${job.company} · ${job.location}</div>
                <div class="jb-tags">
                    ${job.tags.map(t => `<div class="jb-tag">${t}</div>`).join('')}
                </div>
                <div class="jb-footer">
                    <div class="jb-salary">${job.salary_range} <small>${job.salary_note}</small></div>
                    <button class="jb-apply" onclick="window.location.href='${job.apply_url}'">
                        Ứng tuyển ${svgArrow()}
                    </button>
                </div>
            </div>
        </div>
    `;
}

const SKELETON_COUNT = 5;

function renderSkeleton() {
    return `
        <div class="jb-card jb-skeleton">
            <div class="jb-content">
                <div class="sk-logo"></div>
                <div class="sk-badge"></div>
                <div class="sk-role"></div>
                <div class="sk-company"></div>
                <div class="jb-tags">
                    <div class="sk-tag"></div>
                    <div class="sk-tag"></div>
                    <div class="sk-tag"></div>
                </div>
                <div class="jb-footer">
                    <div class="sk-salary"></div>
                    <div class="sk-btn"></div>
                </div>
            </div>
        </div>
    `;
}

async function loadHotJobs() {
    const container = document.getElementById('hot-jobs-cards');

    container.innerHTML = Array(SKELETON_COUNT).fill(renderSkeleton()).join('');

    try {
        const jobs = await apiFetch('/jobs/hot');
        container.innerHTML = jobs.map(renderHotCard).join('');

        container.querySelectorAll('.jb-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--gx', ((e.clientX - r.left - r.width / 2) * 0.4) + 'px');
                card.style.setProperty('--gy', ((e.clientY - r.top - r.height / 2) * 0.4) + 'px');
            });
        });
    } catch (e) {
        console.error('hot jobs:', e);
    }
}
// ── Jobs list ────────────────────────────────────────────────────

function renderJobRow(job) {
    const chips = job.chips.map(c =>
        `<span class="job-chip${c.type !== 'default' ? ' ' + c.type : ''}">${c.label}</span>`
    ).join('');

    return `
        <div class="job-row" data-id="${job.id}">
            <div class="job-avatar" style="background:linear-gradient(135deg,${job.gradient_from},${job.gradient_to})">${job.logo_text}</div>
            <div>
                <div class="job-role">${job.role}</div>
                <div class="job-meta">
                    <span class="job-meta-item">📍 ${job.location}</span>
                    <span class="job-meta-item">· ${job.company}</span>
                    <span class="job-meta-item">· ${job.work_type}</span>
                </div>
            </div>
            <div class="job-chips">${chips}</div>
            <div class="job-salary">
                <div class="job-salary-main">${job.salary_main}</div>
                <div class="job-salary-note">${job.salary_note}</div>
            </div>
            <button class="job-apply-btn" onclick="window.location.href='${job.apply_url}'">Ứng tuyển</button>
        </div>
    `;
}

let activeTab = '';

async function loadJobs() {
    const q = document.getElementById('jobs-search')?.value || '';
    const province = document.getElementById('filter-province')?.value || '';
    const industry = document.getElementById('filter-industry')?.value || '';
    const salary = document.getElementById('filter-salary')?.value || '';

    const params = new URLSearchParams({ tab: activeTab, q, province, industry, salary });

    try {
        const jobs = await apiFetch(`/jobs/latest?${params}`);
        const el = document.getElementById('jobs-list');
        el.innerHTML = jobs.length
            ? jobs.map(renderJobRow).join('')
            : '<div class="jobs-empty">Không tìm thấy việc làm phù hợp.</div>';
    } catch (e) {
        console.error('jobs list:', e);
    }
}

function setTab(btn, tab) {
    document.querySelectorAll('.jobs-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    activeTab = tab;
    loadJobs();
}

let filterDebounce;
function filterJobs() {
    clearTimeout(filterDebounce);
    filterDebounce = setTimeout(loadJobs, 280);
}

// ── Filter dropdowns ─────────────────────────────────────────────

async function loadFilters() {
    try {
        const [provinces, industries] = await Promise.all([
            apiFetch('/metadata/provinces'),
            apiFetch('/metadata/industries'),
        ]);

        const provEl = document.getElementById('filter-province');
        provinces.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p;
            provEl.appendChild(opt);
        });

        const indEl = document.getElementById('filter-industry');
        industries.forEach(i => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            indEl.appendChild(opt);
        });
    } catch (e) {
        console.error('filters:', e);
    }
}

async function initMarquee() {
    try {
        const data = await apiFetch('/metadata/companies_icons');
        const icons = Array.isArray(data) ? data : (data.icons || []);
        if (!icons.length) return;

        function buildItem(icon) {
            const item = document.createElement('div');
            item.className = 'logo-item';
            const img = document.createElement('img');
            img.dataset.src = icon.logo_url;
            img.alt = icon.name;
            img.title = icon.name;
            img.decoding = 'async';
            if (icon.width) img.style.maxWidth = icon.width;
            img.onerror = () => { item.style.display = 'none'; };
            item.appendChild(img);
            return item;
        }

        function fillTrack(trackId, list) {
            const track = document.getElementById(trackId);
            if (!track) return [];
            const fragment = document.createDocumentFragment();
            const items = list.map(buildItem);
            items.forEach(el => fragment.appendChild(el));
            items.slice(0, 6).forEach(el => fragment.appendChild(el.cloneNode(true)));
            track.appendChild(fragment);
            return items;
        }

        function lazyLoad(items, delay = 200) {
            items.forEach((item, i) => {
                setTimeout(() => {
                    const img = item.querySelector('img[data-src]');
                    if (img) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
                }, i * delay);
            });
        }

        const chunk = Math.ceil(icons.length / 3);
        const t1 = fillTrack('marqueeTrack1', icons.slice(0, chunk));
        const t2 = fillTrack('marqueeTrack2', icons.slice(chunk, chunk * 2));
        const t3 = fillTrack('marqueeTrack3', icons.slice(chunk * 2));

        lazyLoad(t1, 200);
        setTimeout(() => lazyLoad(t2, 200), 500);
        setTimeout(() => lazyLoad(t3, 200), 1000);
    } catch (e) {
        console.error('marquee:', e);
    }
}

function renderNewsCard(item) {
    const featured = item.featured ? ' featured' : '';
    const readTime = item.featured && item.read_time ? ` · ${item.read_time}` : '';
    return `
        <div class="news-card${featured}">
            <div class="news-img-wrap">
                <img src="${item.image_url}" alt="${item.title}" loading="lazy">
                <span class="news-cat-badge" style="background:${item.category_bg};color:${item.category_color}">${item.category_label}</span>
            </div>
            <div class="news-body">
                <div class="news-title">${item.title}</div>
                <div class="news-excerpt">${item.excerpt}</div>
                <div class="news-footer-row">
                    <span class="news-date">${item.date}${readTime}</span>
                    <a href="${item.url}" class="news-read-link">Đọc thêm ${svgExternal()}</a>
                </div>
            </div>
        </div>
    `;
}

async function loadNews() {
    try {
        const items = await apiFetch('/news/latest');
        document.getElementById('news-grid').innerHTML = items.map(renderNewsCard).join('');
    } catch (e) {
        console.error('news:', e);
    }
}


Promise.all([
    loadStats(),
    loadLicenses(),
    loadHotJobs(),
    loadFilters(),
    loadJobs(),
    initMarquee(),
    loadNews(),
]);