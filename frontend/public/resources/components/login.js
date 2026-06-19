

class AuthWidget extends HTMLElement {
  connectedCallback() {
    const styleId = 'auth-widget-style';
    if (!document.querySelector('#' + styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = this.css();
      document.head.appendChild(style);
    }
    this.render();
  }

  css() {
    return `
    .auth-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      animation: auth-fade-in 0.2s forwards;
    }
    @keyframes auth-fade-in { to { opacity: 1; } }

    .auth-box {
      background: #ffffff !important;  /* force white */
      border-radius: 10px;
      padding: 2rem 1.75rem;
      width: 340px;
      position: relative;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35);  /* strong shadow */
      color: #111;  /* force dark text */
    }
      .auth-close {
        position: absolute;
        top: 0.75rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #999;
        line-height: 1;
      }
      .auth-close:hover { color: #111; }

      .auth-tabs {
        display: flex;
        border-bottom: 1.5px solid #eee;
        margin-bottom: 1.25rem;
      }
      .auth-tab {
        flex: 1;
        padding: 0.45rem;
        text-align: center;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        color: #999;
        border-bottom: 2px solid transparent;
        margin-bottom: -1.5px;
        transition: color 0.15s;
        background: none;
        border-top: none;
        border-left: none;
        border-right: none;
        font-family: inherit;
      }
      .auth-tab.active { color: #111; border-bottom-color: #111; }

      .auth-box h2 { font-size: 1rem; font-weight: 600; margin-bottom: 0.2rem; color: #111; }
      .auth-box .auth-sub { font-size: 0.7rem; color: #999; margin-bottom: 1.25rem; }

      .auth-box label {
        display: block;
        font-size: 0.65rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 0.2rem;
      }
      .auth-box input {
        width: 100%;
        border: 1.5px solid #ddd;
        border-radius: 4px;
        padding: 0.5rem 0.7rem;
        font-family: inherit;
        font-size: 0.85rem;
        color: #111;
        outline: none;
        margin-bottom: 0.85rem;
        background: #fafaf8;
        box-sizing: border-box;
        transition: border-color 0.15s;
      }
      .auth-box input:focus { border-color: #111; background: #fff; }

      .auth-btn {
        width: 100%;
        padding: 0.6rem;
        background: #111;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s, opacity 0.15s;
      }
      .auth-btn:hover { background: #333; }
      .auth-btn:disabled { opacity: 0.4; cursor: not-allowed; }

      .auth-msg {
        font-size: 0.72rem;
        padding: 0.45rem 0.7rem;
        border-radius: 4px;
        margin-bottom: 0.85rem;
        display: none;
      }
      .auth-msg.ok  { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; display: block; }
      .auth-msg.err { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; display: block; }

      .auth-step { display: none; }
      .auth-step.active { display: block; }

      .auth-back {
        display: block;
        text-align: center;
        margin-top: 0.85rem;
        font-size: 0.7rem;
        color: #999;
        cursor: pointer;
        background: none;
        border: none;
        font-family: inherit;
        width: 100%;
      }
      .auth-back:hover { color: #111; }
    `;
  }

  render() {
    this.innerHTML = `
      <div class="auth-overlay" id="auth-overlay">
        <div class="auth-box">
          <button class="auth-close" id="auth-close">✕</button>

          <div class="auth-tabs">
            <button class="auth-tab active" id="auth-tab-reg">Đăng ký</button>
            <button class="auth-tab"        id="auth-tab-log">Đăng nhập</button>
          </div>

          <!-- REGISTER -->
          <div id="auth-panel-reg">
            <div class="auth-step active" id="auth-reg-1">
              <h2>Tạo tài khoản</h2>
              <p class="auth-sub">Điền thông tin, chúng tôi sẽ gửi mã xác nhận.</p>
              <div class="auth-msg" id="auth-reg-msg-1"></div>
              <label>Gmail</label>
              <input type="email" id="auth-reg-gmail" placeholder="you@gmail.com">
              <label>Tên người dùng</label>
              <input type="text" id="auth-reg-username" placeholder="sansel">
              <label>Mật khẩu</label>
              <input type="password" id="auth-reg-pass" placeholder="••••••••">
              <label>CCCD</label>
              <input type="text" id="auth-reg-cccd" placeholder="0123456789">
              <button class="auth-btn" id="auth-reg-btn-1">Tiếp tục →</button>
            </div>
            <div class="auth-step" id="auth-reg-2">
              <h2>Kiểm tra hộp thư</h2>
              <p class="auth-sub" id="auth-reg-hint">Mã đã được gửi tới Gmail của bạn.</p>
              <div class="auth-msg" id="auth-reg-msg-2"></div>
              <label>Mã xác nhận</label>
              <input type="number" id="auth-reg-code" placeholder="123456">
              <button class="auth-btn" id="auth-reg-btn-2">Tạo tài khoản</button>
              <button class="auth-back" id="auth-reg-back">← Quay lại</button>
            </div>
            <div class="auth-step" id="auth-reg-3">
              <h2>Thành công 🎉</h2>
              <p class="auth-sub">Tài khoản đã được tạo.</p>
              <div class="auth-msg ok" id="auth-reg-done">Đăng ký thành công!</div>
              <button class="auth-btn" id="auth-reg-to-log">Đăng nhập →</button>
            </div>
          </div>

          <!-- LOGIN -->
          <div id="auth-panel-log" style="display:none;">
            <div class="auth-step active" id="auth-log-1">
              <h2>Chào mừng trở lại</h2>
              <p class="auth-sub">Điền thông tin, chúng tôi sẽ gửi mã xác nhận.</p>
              <div class="auth-msg" id="auth-log-msg-1"></div>
              <label>Gmail</label>
              <input type="email" id="auth-log-gmail" placeholder="you@gmail.com">
              <label>Mật khẩu</label>
              <input type="password" id="auth-log-pass" placeholder="••••••••">
              <button class="auth-btn" id="auth-log-btn-1">Tiếp tục →</button>
            </div>
            <div class="auth-step" id="auth-log-2">
              <h2>Kiểm tra hộp thư</h2>
              <p class="auth-sub" id="auth-log-hint">Mã đã được gửi tới Gmail của bạn.</p>
              <div class="auth-msg" id="auth-log-msg-2"></div>
              <label>Mã xác nhận</label>
              <input type="number" id="auth-log-code" placeholder="123456">
              <button class="auth-btn" id="auth-log-btn-2">Đăng nhập</button>
              <button class="auth-back" id="auth-log-back">← Quay lại</button>
            </div>
            <div class="auth-step" id="auth-log-3">
              <h2>Đã đăng nhập ✓</h2>
              <p class="auth-sub">Bạn đã đăng nhập thành công.</p>
              <div class="auth-msg ok" id="auth-log-done">Chào mừng trở lại!</div>
            </div>
          </div>

        </div>
      </div>
    `;
    this._bindEvents();
  }

  _bindEvents() {
    const BASE = 'https://api.vieclammienbac.com';

    // fingerprint
    let fingerprint = '';
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(
      navigator.userAgent + screen.width + screen.height + navigator.language
    )).then(buf => {
      fingerprint = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('').slice(0,32);
    });

    const $ = id => this.querySelector('#' + id);

    // close / overlay click
    $('auth-close').addEventListener('click', () => this.close());
    $('auth-overlay').addEventListener('click', e => { if (e.target === $('auth-overlay')) this.close(); });

    // tabs
    $('auth-tab-reg').addEventListener('click', () => this._switchTab('reg'));
    $('auth-tab-log').addEventListener('click', () => this._switchTab('log'));

    // back buttons
    $('auth-reg-back').addEventListener('click', () => this._goStep('reg', 1));
    $('auth-log-back').addEventListener('click', () => this._goStep('log', 1));

    // go to login from reg done
    $('auth-reg-to-log').addEventListener('click', () => this._switchTab('log'));

    const msg = (id, text, type) => {
      const el = $(id);
      el.textContent = text;
      el.className = 'auth-msg ' + type;
    };
    const clearMsg = id => { const el = $(id); el.className = 'auth-msg'; el.textContent = ''; };

    // ── Register step 1 ──
    $('auth-reg-btn-1').addEventListener('click', async () => {
      clearMsg('auth-reg-msg-1');
      const gmail    = $('auth-reg-gmail').value.trim();
      const username = $('auth-reg-username').value.trim();
      const pass     = $('auth-reg-pass').value;
      const cccd     = $('auth-reg-cccd').value.trim();
      if (!gmail || !username || !pass || !cccd)
        return msg('auth-reg-msg-1', 'Vui lòng điền đầy đủ thông tin.', 'err');
      const btn = $('auth-reg-btn-1');
      btn.disabled = true; btn.textContent = 'Đang gửi…';
      try {
        const res = await fetch(BASE + '/verify-gmail', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gmail }),
        });
        const text = await res.text();
        if (!res.ok) throw new Error(text || res.statusText);
        $('auth-reg-hint').textContent = `Mã đã gửi tới ${gmail}`;
        this._goStep('reg', 2);
      } catch(e) {
        msg('auth-reg-msg-1', e.message, 'err');
      } finally {
        btn.disabled = false; btn.textContent = 'Tiếp tục →';
      }
    });

    // ── Register step 2 ──
    $('auth-reg-btn-2').addEventListener('click', async () => {
      clearMsg('auth-reg-msg-2');
      const gmail    = $('auth-reg-gmail').value.trim();
      const username = $('auth-reg-username').value.trim();
      const pass     = $('auth-reg-pass').value;
      const cccd     = $('auth-reg-cccd').value.trim();
      const code     = parseInt($('auth-reg-code').value);
      if (!code) return msg('auth-reg-msg-2', 'Nhập mã từ email của bạn.', 'err');
      const btn = $('auth-reg-btn-2');
      btn.disabled = true; btn.textContent = 'Đang tạo…';
      try {
        const res = await fetch(BASE + '/register', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cccd, gmail: { gmail, code },
            username, password: pass,
            fingerprint, birth: new Date().toISOString(),
          }),
        });
        const text = await res.text();
        if (!res.ok) throw new Error(text || res.statusText);
        $('auth-reg-done').textContent = text || 'Đăng ký thành công!';
        this._goStep('reg', 3);
      } catch(e) {
        msg('auth-reg-msg-2', e.message, 'err');
      } finally {
        btn.disabled = false; btn.textContent = 'Tạo tài khoản';
      }
    });

    // ── Login step 1 ──
    $('auth-log-btn-1').addEventListener('click', async () => {
      clearMsg('auth-log-msg-1');
      const gmail = $('auth-log-gmail').value.trim();
      const pass  = $('auth-log-pass').value;
      if (!gmail || !pass) return msg('auth-log-msg-1', 'Vui lòng điền đầy đủ thông tin.', 'err');
      const btn = $('auth-log-btn-1');
      btn.disabled = true; btn.textContent = 'Đang gửi…';
      try {
        const res = await fetch(BASE + '/verify-gmail', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gmail }),
        });
        const text = await res.text();
        if (!res.ok) throw new Error(text || res.statusText);
        $('auth-log-hint').textContent = `Mã đã gửi tới ${gmail}`;
        this._goStep('log', 2);
      } catch(e) {
        msg('auth-log-msg-1', e.message, 'err');
      } finally {
        btn.disabled = false; btn.textContent = 'Tiếp tục →';
      }
    });

    // ── Login step 2 ──
    $('auth-log-btn-2').addEventListener('click', async () => {
      clearMsg('auth-log-msg-2');
      const gmail = $('auth-log-gmail').value.trim();
      const pass  = $('auth-log-pass').value;
      const code  = parseInt($('auth-log-code').value);
      if (!code) return msg('auth-log-msg-2', 'Nhập mã từ email của bạn.', 'err');
      const btn = $('auth-log-btn-2');
      btn.disabled = true; btn.textContent = 'Đang đăng nhập…';
      try {
        const res = await fetch(BASE + '/login', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gmail: { gmail, code }, password: pass, fingerprint }),
        });
        const text = await res.text();
        if (!res.ok) throw new Error(text || res.statusText);
        $('auth-log-done').textContent = text || 'Chào mừng trở lại!';
        this._goStep('log', 3);
        // fire event so the page can react (e.g. update header)
        this.dispatchEvent(new CustomEvent('auth:login', { bubbles: true }));
      } catch(e) {
        msg('auth-log-msg-2', e.message, 'err');
      } finally {
        btn.disabled = false; btn.textContent = 'Đăng nhập';
      }
    });
  }

  _switchTab(tab) {
    this.querySelector('#auth-panel-reg').style.display = tab === 'reg' ? 'block' : 'none';
    this.querySelector('#auth-panel-log').style.display = tab === 'log' ? 'block' : 'none';
    this.querySelector('#auth-tab-reg').className = 'auth-tab' + (tab === 'reg' ? ' active' : '');
    this.querySelector('#auth-tab-log').className = 'auth-tab' + (tab === 'log' ? ' active' : '');
    // reset steps
    this._goStep('reg', 1);
    this._goStep('log', 1);
  }

  _goStep(prefix, n) {
    this.querySelectorAll(`[id^="auth-${prefix}-"]`).forEach(el => {
      if (el.classList.contains('auth-step')) el.classList.remove('active');
    });
    this.querySelector(`#auth-${prefix}-${n}`).classList.add('active');
  }

  open(tab = 'reg') {
    this.style.display = 'block';
    this._switchTab(tab);
  }

  close() {
    this.style.display = 'none';
  }
}

customElements.define('vmb-auth', AuthWidget);