class HeaderWidget extends HTMLElement {
  connectedCallback() {
    if (!document.querySelector('#header-style')) {
      const link = document.createElement('link');
      link.id = 'header-style';
      link.rel = 'stylesheet';
      link.href = '/resources/styles/components/header.css';
      link.onload = () => this.render();
      link.onerror = () => this.render();
      document.head.appendChild(link);
    } else {
      this.render();
    }
  }

  normalize(url) {
    return url.replace(/\/$/, '') || '/';
  }

  prefetch(url) {
    // Skip if already prefetched
    if (document.querySelector(`link[rel="prefetch"][href="${url}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  smartPrefetch() {
    const pages = ['/', '/jobs', '/news'];
    const current = this.normalize(window.location.pathname);

    const pagesToPrefetch = pages.filter(
      url => this.normalize(url) !== current
    );

    const run = () => {
      pagesToPrefetch.forEach(url => this.prefetch(url));
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(run);
    } else {
      setTimeout(run, 1000);
    }
  }

  render() {
    this.innerHTML = `
      <header id="header">
        <div class="container">
          <div class="header-inner">
            <div class="logo">
              <a href="/"><img src="/resources/images/logo.png" alt="logo"></a>
            </div>
            <nav class="flex-grow">
              <ul class="header-nav nav-uppercase">
                <li><a class="nav-top-link" href="/">Trang chủ</a></li>
                <li><a class="nav-top-link" href="/jobs">Việc làm</a></li>
                <li><a class="nav-top-link" href="/news">Tin tức</a></li>
                <li><a href="/me"><div class="header-profile"></div></a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    `;

    this.smartPrefetch();
  }
}

customElements.define('vmb-header', HeaderWidget);
