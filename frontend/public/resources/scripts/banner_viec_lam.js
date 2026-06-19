(function () {
  const API = 'https://api.vieclammienbac.com/manifest/industrials';

  const root   = document.getElementById('vlmb-banner-slider');
  const area   = document.getElementById('vlmbSlidesArea');
  const dotsEl = document.getElementById('vlmbDots');
  const prevBtn = document.getElementById('vlmbPrev');
  const nextBtn = document.getElementById('vlmbNext');
  const bar    = document.getElementById('vlmbBar');
  const card   = document.getElementById('vlmbCard');
  const logoEl = document.getElementById('vlmbLogo');
  const nameEl = document.getElementById('vlmbName');
  const descEl = document.getElementById('vlmbDesc');

  let data = [], slides = [], dots = [], cur = 0;

  /* ── BUILD SLIDER from fetched data ── */
  function buildSlider(items) {
    data = items;

    /* pick a random start */
    cur = Math.floor(Math.random() * data.length);

    /* create slides */
    data.forEach((item, i) => {
      const el = item.href ? document.createElement('a') : document.createElement('div');
      el.className = 'vlmb-slide' + (i === cur ? ' vlmb-active' : '');
      if (item.href) { el.href = item.href; el.target = '_blank'; el.rel = 'noopener'; }
      const img = document.createElement('img');
      img.src = item.banner;
      img.alt = item.name || '';
      el.appendChild(img);
      /* insert before arrows */
      area.insertBefore(el, prevBtn);
    });
    slides = area.querySelectorAll('.vlmb-slide');

    /* create dots */
    data.forEach((_, i) => {
      const d = document.createElement('span');
      d.className = 'vlmb-dot' + (i === cur ? ' vlmb-active' : '');
      d.setAttribute('role', 'button');
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.onclick = () => goTo(i);
      dotsEl.appendChild(d);
    });
    dots = Array.from(dotsEl.querySelectorAll('.vlmb-dot'));

    /* show arrows */
    prevBtn.classList.remove('vlmb-hidden');
    nextBtn.classList.remove('vlmb-hidden');

    /* init card & slider */
    updateCard(cur);
  }

  function updateCard(idx) {
    card.classList.add('vlmb-card-fade');
    setTimeout(() => {
      const item = data[idx] || {};
      logoEl.src = item.logo || '';
      logoEl.alt = item.name || '';
      nameEl.textContent = item.name || '';
      descEl.textContent = item.desc || '';
      card.classList.remove('vlmb-card-fade');
    }, 250);
  }

  function goTo(idx) {
    if (!slides.length) return;
    slides[cur].classList.remove('vlmb-active');
    slides[cur].classList.add('vlmb-prev');
    const old = cur;
    setTimeout(() => slides[old].classList.remove('vlmb-prev'), 700);
    dots[cur].classList.remove('vlmb-active');

    cur = (idx + slides.length) % slides.length;

    slides[cur].classList.add('vlmb-active');
    dots[cur].classList.add('vlmb-active');

    updateCard(cur);
  }

  function move(dir) { goTo(cur + dir); }
  prevBtn.onclick = () => move(-1);
  nextBtn.onclick = () => move(1);

  /* swipe */
  let sx = 0;
  area.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  area.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
  });

  /* ── FETCH ── */
  fetch(API)
    .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
    .then(json => {
      /*
       * Expected API shape — adjust the field mapping below if your API
       * returns different field names:
       *
       * [
       *   {
       *     "banner": "https://...",   // banner image URL
       *     "logo":   "https://...",   // logo image URL
       *     "name":   "Company name",
       *     "desc":   "Short description",
       *     "href":   "https://..."    // optional: makes slide clickable
       *   }, ...
       * ]
       *
       * If the API wraps the array (e.g. { data: [...] }), change `json` below
       * to `json.data` or whatever the wrapper key is.
       */
      const items = Array.isArray(json) ? json : (json.data || json.items || []);
      if (!items.length) throw new Error('Empty response');
      buildSlider(items);
    })
    .catch(err => {
      console.error('[vlmb-banner] Failed to load:', err);
      /* show a fallback message inside the slider */
      area.insertAdjacentHTML('afterbegin',
        '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;font-size:14px;opacity:.6;">Không thể tải dữ liệu banner.</div>'
      );
    });
})();