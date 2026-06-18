<script setup>
    definePageMeta({
      layout: false
  });
    import BrandSide from '~/components/login/BrandSide.vue';
    import LoginForm from '~/components/login/LoginForm.vue';
</script>

<template>
    <div class="main-container">
        <BrandSide />
        <LoginForm />
    </div>
</template>

<style scoped>
    .main-container {
        min-height: 100svh;
        height: 100svh;
        display: flex;
        align-items: stretch;
        background: linear-gradient(
          215deg,
          #66b2ff 0%,  #66b2ff 6%,
          #4da3ff 6%,  #4da3ff 16%,
          #338fff 16%, #338fff 28%,
          #1a7cff 28%, #1a7cff 42%,
          #0066ff 42%, #0066ff 47%,
          #0047b3 47%, #0047b3 53%,
          #0066ff 53%, #0066ff 60%,
          #1a7cff 60%, #1a7cff 72%,
          #338fff 72%, #338fff 84%,
          #4da3ff 84%, #4da3ff 94%,
          #66b2ff 94%, #66b2ff 100%
      );
        background-size: 350% 400%;
        animation: slideWave 40s linear infinite;
        font-family: 'DM Sans', sans-serif;
        position: relative;
    }

    .main-container::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 30% 60%, rgba(255,255,255,0.08) 0%, transparent 65%);
        pointer-events: none;
    }

    @keyframes slideWave {
        from { background-position: 0% 100%; }
        to   { background-position: 100% 0%; }
    }

    @media (max-width: 970px) {
        .main-container {
          flex-direction: column;
          align-items: stretch;
          min-height: 100svh;
          height: auto;
      }
    }
</style>