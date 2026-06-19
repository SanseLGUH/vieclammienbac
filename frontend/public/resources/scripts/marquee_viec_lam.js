  const API_URL = 'https://api.vieclammienbac.com/manifest/marquee';
  const SPEED = 50; // seconds — change this to adjust speed

  function buildGroup(companies) {
    const group = document.createElement('div');
    group.className = 'marquee-group';
    companies.forEach(company => {
      const item = document.createElement('div');
      item.className = 'logo-item';
      if (company.logo_url) {
        const img = document.createElement('img');
        img.src = company.logo_url;
        img.alt = company.name;
        img.onerror = () => img.replaceWith(document.createTextNode(company.name));
        item.appendChild(img);
      } else {
        item.textContent = company.name;
      }
      group.appendChild(item);
    });
    return group;
  }

  function startAnimation(track) {
    // Force reflow to ensure correct width is measured after fonts/content load
    track.style.animation = 'none';
    track.offsetWidth; // trigger reflow
    track.style.animation = '';
    track.style.setProperty('--scroll-duration', SPEED + 's');
    track.classList.add('running');

    // Pause on hover
    track.addEventListener('mouseenter', () => track.classList.add('paused'));
    track.addEventListener('mouseleave', () => track.classList.remove('paused'));
  }

  async function loadMarquee() {
    const track = document.getElementById('track');

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const companies = data.companies;
      if (!companies || companies.length === 0) throw new Error('No companies');

      track.innerHTML = '';
      track.appendChild(buildGroup(companies));
      track.appendChild(buildGroup(companies));

      // Wait for fonts to finish loading before starting animation
      await document.fonts.ready;
      startAnimation(track);

    } catch (err) {
      document.getElementById('status').textContent = 'Could not load partners.';
      console.error('Marquee fetch failed:', err);
    }
  }

  loadMarquee();