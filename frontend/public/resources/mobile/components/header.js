class HeaderWidget extends HTMLElement {
  connectedCallback() {
    if (!document.querySelector('#header-style')) {
      const link = document.createElement('link');
      link.id = 'header-style';
      link.rel = 'stylesheet';
      link.href = '/resources/mobile/styles/components/header.css';
      link.onload = () => this.render();
      link.onerror = () => this.render();
      document.head.appendChild(link);
    } else {
      this.render();
    }
  }
  render() {
    this.innerHTML = `
      <nav class="mobile-bottom-nav">
        <a href="/" class="mobile-nav-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Trang chủ</span>
        </a>
        <a href="/jobs" class="mobile-nav-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          <span>Việc làm</span>
        </a>
        <a href="/news" class="mobile-nav-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"/><path d="M16 2v4"/><path d="M8 10h8"/><path d="M8 14h4"/></svg>
          <span>Tin tức</span>
        </a>
        <a href="/me" class="mobile-nav-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Cá nhân</span>
        </a>
      </nav>
    `;
    const path = window.location.pathname;
    this.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      if (btn.getAttribute('href') === path) {
        btn.classList.add('active');
      }
    });
  }
}
customElements.define('vmb-header', HeaderWidget);