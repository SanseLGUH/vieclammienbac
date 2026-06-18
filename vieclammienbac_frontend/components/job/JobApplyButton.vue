<script setup>
defineProps({
  href: {
    type: String,
    default: 'https://zalo.me/1294275958210892329',
  },
  label: {
    type: String,
    default: 'Đăng ký ứng tuyển Zalo',
  },
})
</script>

<template>
  <div class="register-btn">
    <a :href="href" class="btn-register" target="_blank" rel="noopener noreferrer">
      {{ label }}
    </a>
  </div>
</template>

<style scoped>
.register-btn {
  padding: 8px 0 16px;
}

.btn-register {
  display: inline-block;
  padding: 14px 48px;
  background: #54B5FF;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-register:hover { background: #2fa0f5; }

@media (max-width: 768px) {
  .btn-register {
    width: 100%;
    text-align: center;
    padding: 14px 24px;
  }
}
</style>