<script setup>
import { ref } from 'vue';

const email = ref('');
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const rememberMe = ref(false);
const errorMsg = ref('');
const step = ref('login'); // 'login' | 'login-verify' | 'register' | 'register-verify'
const otp = ref('');

const { public: { apiBase } } = useRuntimeConfig();

// ── Login ──
async function handleLogin() {
  errorMsg.value = '';
  isLoading.value = true;
  try {
    const res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.value, password: password.value }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) {
      errorMsg.value = data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.';
      return;
    }
    step.value = 'login-verify';
  } catch (err) {
    console.error('Login error:', err);
    errorMsg.value = `Lỗi: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
}

async function handleLoginVerify() {
  errorMsg.value = '';
  isLoading.value = true;
  try {
    const res = await fetch(`${apiBase}/auth/login/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.value, code: otp.value }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) {
      errorMsg.value = data?.error || 'Mã xác minh không đúng. Vui lòng thử lại.';
      return;
    }
    await navigateTo('/');
  } catch (err) {
    errorMsg.value = `Lỗi: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
}

// ── Register ──
async function handleRegister() {
  errorMsg.value = '';
  isLoading.value = true;
  try {
    const res = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.value, username: username.value, password: password.value }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) {
      errorMsg.value = data?.error || 'Đăng ký thất bại. Vui lòng thử lại.';
      return;
    }
    step.value = 'register-verify';
  } catch (err) {
    errorMsg.value = `Lỗi: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
}

async function handleRegisterVerify() {
  errorMsg.value = '';
  isLoading.value = true;
  try {
    const res = await fetch(`${apiBase}/auth/register/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.value, code: otp.value }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) {
      errorMsg.value = data?.error || 'Mã xác minh không đúng. Vui lòng thử lại.';
      return;
    }
    await navigateTo('/');
  } catch (err) {
    errorMsg.value = `Lỗi: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
}

// ── Helpers ──
function goToRegister() {
  step.value = 'register';
  otp.value = '';
  errorMsg.value = '';
  password.value = '';
  username.value = '';
}

function goToLogin() {
  step.value = 'login';
  otp.value = '';
  errorMsg.value = '';
  password.value = '';
  username.value = '';
}

function backToLogin() {
  step.value = 'login';
  otp.value = '';
  errorMsg.value = '';
}

function backToRegister() {
  step.value = 'register';
  otp.value = '';
  errorMsg.value = '';
}
</script>

<template>
  <div class="login">
    <div class="login-inner">

      <!-- ── Step: Login ── -->
      <template v-if="step === 'login'">
        <div class="login-header">
          <h2>Chào mừng trở lại</h2>
          <p>Đăng nhập để tiếp tục tìm kiếm việc làm</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="field-group">
            <label>Email</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input v-model="email" type="email" placeholder="tên@gmail.com" autocomplete="email" required />
            </div>
          </div>

          <div class="field-group">
            <label>
              Mật khẩu
              <a href="#" class="forgot-link">Quên mật khẩu?</a>
            </label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" autocomplete="current-password" required />
              <button type="button" class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="remember-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" />
              <span class="checkmark"></span>
              Ghi nhớ đăng nhập
            </label>
          </div>

          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

          <button type="submit" class="submit-btn" :class="{ loading: isLoading }" :disabled="isLoading">
            <span v-if="!isLoading">Đăng nhập</span>
            <span v-else class="spinner"></span>
          </button>
        </form>

        <p class="register-cta">
          Chưa có tài khoản?
          <a href="#" @click.prevent="goToRegister">Đăng ký miễn phí</a>
        </p>
      </template>

      <!-- ── Step: Login OTP ── -->
      <template v-else-if="step === 'login-verify'">
        <div class="login-header">
          <h2>Xác minh đăng nhập</h2>
          <p>Chúng tôi đã gửi mã 6 chữ số tới <strong>{{ email }}</strong></p>
        </div>

        <form @submit.prevent="handleLoginVerify" class="login-form">
          <div class="field-group">
            <label>Mã xác minh</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <input v-model="otp" type="text" inputmode="numeric" maxlength="6" placeholder="______" autocomplete="one-time-code" class="otp-input" required />
            </div>
          </div>

          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

          <button type="submit" class="submit-btn" :class="{ loading: isLoading }" :disabled="isLoading">
            <span v-if="!isLoading">Xác nhận</span>
            <span v-else class="spinner"></span>
          </button>
          <button type="button" class="back-btn" @click="backToLogin">← Quay lại đăng nhập</button>
        </form>
      </template>

      <!-- ── Step: Register ── -->
      <template v-else-if="step === 'register'">
        <div class="login-header">
          <h2>Tạo tài khoản</h2>
          <p>Đăng ký miễn phí để tìm kiếm việc làm</p>
        </div>

        <form @submit.prevent="handleRegister" class="login-form">
          <div class="field-group">
            <label>Email</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input v-model="email" type="email" placeholder="tên@gmail.com" autocomplete="email" required />
            </div>
          </div>

          <div class="field-group">
            <label>Tên người dùng</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input v-model="username" type="text" placeholder="nguyenvana" autocomplete="username" required />
            </div>
          </div>

          <div class="field-group">
            <label>Mật khẩu</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" autocomplete="new-password" required />
              <button type="button" class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

          <button type="submit" class="submit-btn" :class="{ loading: isLoading }" :disabled="isLoading">
            <span v-if="!isLoading">Đăng ký</span>
            <span v-else class="spinner"></span>
          </button>
        </form>

        <p class="register-cta">
          Đã có tài khoản?
          <a href="#" @click.prevent="goToLogin">Đăng nhập</a>
        </p>
      </template>

      <!-- ── Step: Register OTP ── -->
      <template v-else-if="step === 'register-verify'">
        <div class="login-header">
          <h2>Xác minh email</h2>
          <p>Chúng tôi đã gửi mã 6 chữ số tới <strong>{{ email }}</strong></p>
        </div>

        <form @submit.prevent="handleRegisterVerify" class="login-form">
          <div class="field-group">
            <label>Mã xác minh</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <input v-model="otp" type="text" inputmode="numeric" maxlength="6" placeholder="______" autocomplete="one-time-code" class="otp-input" required />
            </div>
          </div>

          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

          <button type="submit" class="submit-btn" :class="{ loading: isLoading }" :disabled="isLoading">
            <span v-if="!isLoading">Xác nhận</span>
            <span v-else class="spinner"></span>
          </button>
          <button type="button" class="back-btn" @click="backToRegister">← Quay lại đăng ký</button>
        </form>
      </template>

    </div>
  </div>
</template>

<style scoped>
.login {
  width: 460px;
  flex-shrink: 0;
  background: #222327;
  border-radius: 28px 0 0 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  box-shadow: -20px 0 60px rgba(0,0,0,0.25);
  animation: slideIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}

.login-inner {
  width: 100%;
  max-width: 380px;
}

.login-header {
  margin-bottom: 32px;
}

.login-header h2 {
  font-family: 'Bungee', cursive;
  font-size: 1.75rem;
  color: #f0f0f0;
  margin-bottom: 6px;
}

.login-header p {
  font-size: 0.875rem;
  color: #8a8d94;
  font-weight: 400;
}

.login-header p strong {
  color: #c0c3cc;
  font-weight: 500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #a0a3ac;
  letter-spacing: 0.03em;
}

.forgot-link {
  font-weight: 400;
  color: #4da3ff;
  text-decoration: none;
  font-size: 0.78rem;
  transition: color 0.2s;
}
.forgot-link:hover { color: #80bfff; }

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #555860;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  padding: 13px 14px 13px 42px;
  background: #2a2d33;
  border: 1.5px solid #333640;
  border-radius: 12px;
  color: #e8eaf0;
  font-size: 0.9rem;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.input-wrap input::placeholder { color: #4a4d58; }

.input-wrap input:focus {
  border-color: #4da3ff;
  background: #2e3240;
  box-shadow: 0 0 0 3px rgba(77,163,255,0.12);
}

.otp-input {
  letter-spacing: 0.25em;
  font-size: 1.2rem !important;
  text-align: center;
}

.toggle-pw {
  position: absolute;
  right: 13px;
  background: none;
  border: none;
  color: #555860;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.toggle-pw:hover { color: #a0a3ac; }

.remember-row { margin-top: -4px; }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.82rem;
  color: #8a8d94;
  user-select: none;
}

.checkbox-label input[type="checkbox"] { display: none; }

.checkmark {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid #444750;
  background: #2a2d33;
  transition: all 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-label input:checked ~ .checkmark {
  background: #4da3ff;
  border-color: #4da3ff;
}

.checkbox-label input:checked ~ .checkmark::after {
  content: '';
  display: block;
  width: 5px;
  height: 8px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: rotate(45deg) translate(-1px, -1px);
}

.error-msg {
  font-size: 0.82rem;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.08);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: -4px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  border-radius: 13px;
  border: none;
  background: linear-gradient(135deg, #4da3ff 0%, #0066ff 100%);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  box-shadow: 0 4px 20px rgba(0,102,255,0.3);
  margin-top: 4px;
}

.submit-btn:hover:not(.loading) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,102,255,0.45);
  background: linear-gradient(135deg, #66b2ff 0%, #1a7cff 100%);
}

.submit-btn:active:not(.loading) { transform: translateY(0); }
.submit-btn.loading { opacity: 0.8; cursor: not-allowed; }

.spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: block;
}

@keyframes spin { to { transform: rotate(360deg); } }

.back-btn {
  background: none;
  border: none;
  color: #5a5d68;
  font-size: 0.82rem;
  cursor: pointer;
  text-align: center;
  padding: 4px 0;
  transition: color 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.back-btn:hover { color: #a0a3ac; }

.register-cta {
  text-align: center;
  font-size: 0.82rem;
  color: #5a5d68;
  margin-top: 28px;
}

.register-cta a {
  color: #4da3ff;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
  transition: color 0.2s;
}
.register-cta a:hover { color: #80bfff; }

@media (max-width: 960px) {
  .login {
    width: 100%;
    flex: 1;
    flex-shrink: unset;
    border-radius: 28px 28px 0 0;
    padding: 32px 24px 40px;
    margin-top: auto;
    box-shadow: 0 -10px 40px rgba(0,0,0,0.3);
  }
  .login-inner {
    max-width: 420px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .login { padding: 28px 20px 36px; }
  .login-header { margin-bottom: 20px; }
  .login-header h2 { font-size: 1.4rem; }
  .login-form { gap: 14px; }
}
</style>