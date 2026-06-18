<script setup>
const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
</script>


<template>
  <NuxtLayout name="default">
    <div class="error-page">
      <div v-if="error.statusCode === 404">
        <h1>404 - Page Not Found</h1>
        <p>Sorry, the page you're looking for doesn't exist.</p>
      </div>

      <div v-else>
        <h1>An error occurred</h1>
        <p>{{ error.message }}</p>
      </div>

      <NuxtLink to="/" class="navbar__link">
        GO HOME
      </NuxtLink>    
    </div>
  </NuxtLayout>
</template>


<style scoped>
  .error-page {
    min-height: 100vh;        /* full screen */
    display: flex;
    flex-direction: column;
    justify-content: center; /* vertical center */
    align-items: center;     /* horizontal center */
    text-align: center;      /* center text */
    gap: 12px;
  }

  .navbar__link {
    font-family: 'DM Sans', sans-serif;
    padding: .45rem .9rem;
    border-radius: 6px;
    font-size: 1.1rem;
    color: #1d1d1d;
    text-decoration: none;
    letter-spacing: 0.03em;
    transition: color 0.2s, background 0.2s;
  }

  .navbar__link:hover {
    color: #54B5FF;
    background: rgba(84, 181, 255, 0.4);
  }
</style>
