<script setup>
import { ref } from 'vue';

definePageMeta({
  layout: false
});

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

// ── Submit dispatcher ──
function handleSubmit() {
  if (step.value === 'login') handleLogin();
  else if (step.value === 'login-verify') handleLoginVerify();
  else if (step.value === 'register') handleRegister();
  else if (step.value === 'register-verify') handleRegisterVerify();
}
</script>

<template>
  <div class="main-container">
    <form class="auth-card" @submit.prevent="handleSubmit">
      <template v-if="step === 'login'">
        <h2>Đăng nhập</h2>

        <label>Email</label>
        <input v-model="email" type="email" required />

        <label>Mật khẩu</label>
        <div class="password-wrap">
          <input v-model="password" :type="showPassword ? 'text' : 'password'" required />
          <button type="button" class="toggle-eye" @click="showPassword = !showPassword">
            {{ showPassword ? 'Ẩn' : 'Hiện' }}
          </button>
        </div>

        <label class="remember-row">
          <input type="checkbox" v-model="rememberMe" />
          Ghi nhớ đăng nhập
        </label>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Đang xử lý...' : 'Đăng nhập' }}
        </button>

        <p class="switch-text">
          Chưa có tài khoản?
          <a href="#" @click.prevent="goToRegister">Đăng ký</a>
        </p>
      </template>

      <!-- LOGIN VERIFY -->
      <template v-else-if="step === 'login-verify'">
        <h2>Xác minh đăng nhập</h2>
        <p class="hint">Nhập mã xác minh đã gửi tới {{ email }}</p>

        <label>Mã xác minh</label>
        <input v-model="otp" type="text" required />

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Đang xác minh...' : 'Xác minh' }}
        </button>

        <p class="switch-text">
          <a href="#" @click.prevent="backToLogin">← Quay lại đăng nhập</a>
        </p>
      </template>

      <template v-else-if="step === 'register'">
        <h2>Đăng ký</h2>

        <label>Tên đăng nhập</label>
        <input v-model="username" type="text" required />

        <label>Email</label>
        <input v-model="email" type="email" required />

        <label>Mật khẩu</label>
        <div class="password-wrap">
          <input v-model="password" :type="showPassword ? 'text' : 'password'" required />
          <button type="button" class="toggle-eye" @click="showPassword = !showPassword">
            {{ showPassword ? 'Ẩn' : 'Hiện' }}
          </button>
        </div>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Đang xử lý...' : 'Đăng ký' }}
        </button>

        <p class="switch-text">
          Đã có tài khoản?
          <a href="#" @click.prevent="goToLogin">Đăng nhập</a>
        </p>
      </template>

      <!-- REGISTER VERIFY -->
      <template v-else-if="step === 'register-verify'">
        <h2>Xác minh đăng ký</h2>
        <p class="hint">Nhập mã xác minh đã gửi tới {{ email }}</p>

        <label>Mã xác minh</label>
        <input v-model="otp" type="text" required />

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Đang xác minh...' : 'Xác minh' }}
        </button>

        <p class="switch-text">
          <a href="#" @click.prevent="backToRegister">← Quay lại đăng ký</a>
        </p>
      </template>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
    </form>
  </div>
</template>

<style scoped>
	.main-container {
	  width: 100%;
	  height: 500px;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  background: #f4f5f7;
	}

	.auth-card {
	  width: 340px;
	  background: #fff;
	  padding: 32px;
	  border-radius: 8px;
	  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	  display: flex;
	  flex-direction: column;
	}

	.auth-card h2 {
	  margin-bottom: 8px;
	  text-align: center;
	}

	.hint {
	  font-size: 13px;
	  color: #666;
	  text-align: center;
	  margin-bottom: 16px;
	}

	.auth-card label {
	  font-size: 14px;
	  margin-bottom: 4px;
	  margin-top: 10px;
	}

	.auth-card input[type="text"],
	.auth-card input[type="email"],
	.auth-card input[type="password"] {
	  padding: 10px;
	  border: 1px solid #ddd;
	  border-radius: 4px;
	  font-size: 14px;
	  width: 100%;
	}

	.password-wrap {
	  display: flex;
	  gap: 8px;
	}

	.password-wrap input {
	  flex: 1;
	}

	.toggle-eye {
	  background: none;
	  border: 1px solid #ddd;
	  border-radius: 4px;
	  padding: 0 10px;
	  font-size: 13px;
	  cursor: pointer;
	}

	.remember-row {
	  display: flex;
	  align-items: center;
	  gap: 6px;
	  font-size: 13px;
	  margin-top: 12px;
	}

	.auth-card button[type="submit"] {
	  padding: 10px;
	  background: #4f46e5;
	  color: #fff;
	  border: none;
	  border-radius: 4px;
	  cursor: pointer;
	  font-size: 14px;
	  margin-top: 16px;
	}

	.auth-card button[type="submit"]:hover {
	  background: #4338ca;
	}

	.auth-card button[type="submit"]:disabled {
	  background: #a5a4f0;
	  cursor: not-allowed;
	}

	.switch-text {
	  margin-top: 16px;
	  font-size: 13px;
	  text-align: center;
	}

	.switch-text a {
	  color: #4f46e5;
	  text-decoration: none;
	}

	.error-text {
	  margin-top: 12px;
	  font-size: 13px;
	  color: #dc2626;
	  text-align: center;
	}
</style>