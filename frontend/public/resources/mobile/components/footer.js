class FooterWidget extends HTMLElement {
  connectedCallback() {
    if (!document.querySelector('#footer-css')) {
      const link = document.createElement('link');
      link.id = 'footer-css';
      link.rel = 'stylesheet';
      link.href = '/resources/mobile/styles/components/footer.css';
      link.onload = () => this.render();
      link.onerror = () => this.render();
      document.head.appendChild(link);
    } else {
      this.render();
    }
  }

  render() {
    this.innerHTML = `
      <footer class="site-footer">
        <div class="footer-container">
          <div class="footer-column">
            <h4>Phương châm phục vụ của chúng tôi</h4>
            <ul>
              <li><i class="ux-menu-link__icon text-center icon-checkmark"></i> Tìm việc làm cho người lao động như tìm việc làm cho chính bản thân mình, cho chính người thân của mình</li>
              <li><i class="ux-menu-link__icon text-center icon-checkmark"></i> Tìm lao động cho khách hàng như tìm lao động cho chính công ty của mình</li>
              <li><i class="fa-solid fa-hand-point-right"></i> Việc làm tốt, cuộc sống tốt</li>
            </ul>
          </div>
          <div class="footer-column">
            <h4>Thông tin phục vụ nhà tuyển dụng</h4>
            <p><i class="fa-solid fa-location-dot"></i> Số 16/562 Nguyễn Văn Linh, Phường Vĩnh Niệm, Quận Lê Chân, Thành phố Hải Phòng, Việt Nam</p>
            <p><i class="fa-solid fa-envelope"></i> Email: tuyendung@vieclamienbac.com</p>
            <p><i class="fa-solid fa-phone"></i> Hotline: 0225 3785 886</p>
            <p>MST: 0201910513</p>
          </div>
          <div class="footer-column">
            <h4>Thông tin phục vụ người lao động</h4>
            <a href="https://zalo.me/1294275958210892329">
              <p><img src="https://vieclammienbac.com/wp-content/uploads/2024/03/outputresult.png"> Zalo: Việc Làm Miền Bắc vmb</p>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61587188334104">
              <p><img src="https://vieclammienbac.com/wp-content/uploads/2024/03/icon-face.png"> Fanpage: Việc Làm Miền Bắc</p>
            </a>
            <p><img src="https://vieclammienbac.com/wp-content/uploads/2024/03/icon-mail.png"> Email: tuyendung@vieclamienbac.com</p>
            <a href="https://www.tiktok.com/@vieclammienbac15?lang=en">
              <p><img src="https://vieclammienbac.com/wp-content/uploads/2024/03/tiktok-icon.png"> TikTok: Việc Làm Miền Bắc</p>
            </a>
          </div>
        </div>
      </footer>
    `;

    this.querySelectorAll('.footer-column h4').forEach(h4 => {
      h4.addEventListener('click', () => {
        h4.parentElement.classList.toggle('open');
      });
    });
  }
}

customElements.define('vmb-footer', FooterWidget);