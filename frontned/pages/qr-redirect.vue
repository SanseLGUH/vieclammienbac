<script setup>
    definePageMeta({
      layout: false
    });

    import { ref, onMounted } from 'vue'

    const PAGE_ID = "61587188334104"
    const FB_APP_URL = `fb://page/?id=${PAGE_ID}`
    const FB_WEB_URL = `https://www.facebook.com/${PAGE_ID}`

    const showFallback = ref(false)
    const statusText = ref("Launching the Facebook app on your device…")

    function tryOpen() {
      const start = Date.now()

      window.location.href = FB_APP_URL

      setTimeout(() => {
        if (Date.now() - start < 2500) {
          showFallback.value = true
        }
      }, 2000)

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          statusText.value = "Facebook is opening…"
        }
      })
    }

    onMounted(() => {
      tryOpen()
    })
</script>

<template>
    <div class="redirect">
      <div class="fb-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path
            d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.306h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
            fill="white"
          />
        </svg>
      </div>

      <!-- STATUS -->
      <div v-if="!showFallback">
        <div class="spinner"></div>
        <h1>Opening Facebook</h1>
        <p>{{ statusText }}</p>
      </div>

      <!-- FALLBACK -->
      <div v-else>
        <h1>Get the Facebook App</h1>
        <p>
          We couldn't open Facebook automatically. Download the app to visit this page.
        </p>

        <div class="divider"><span>download from</span></div>

        <div class="store-buttons">
          <a
            class="store-btn google"
            href="https://play.google.com/store/apps/details?id=com.facebook.katana"
            target="_blank"
          >
            Google Play
          </a>

          <a
            class="store-btn apple"
            href="https://apps.apple.com/app/facebook/id284882215"
            target="_blank"
          >
            App Store
          </a>
        </div>

        <div class="divider" style="margin-top: 20px;">
          <span>Or enter our website</span>
        </div>

        <a class="store-btn dark" href="https://vieclammienbac.com">
          vieclammienbac.com
        </a>

        <a class="store-btn dark" href="/">
          new.vieclammienbac.com
        </a>
      </div>
    </div>
</template>

<style scoped>
  .redirect {
    width: 100%;
    margin: 0 auto;
    margin-top: 50px;
    margin-bottom: 100px;

    padding: 25px;

    display: flex;
    flex-direction: column;
    align-items: center;     /* horizontal center */
    justify-content: center; /* vertical center (if height is set) */
    text-align: center;      /* center text */
  }

  .fb-icon {
    width: 72px;
    height: 72px;
    background: #1877F2;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e4e6ea;
    border-top-color: #1877F2;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 24px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  h1 {
    font-size: 20px;
    font-weight: 700;
    color: #1c1e21;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #65676b;
    line-height: 1.6;
    margin-bottom: 32px;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e4e6ea;
  }

  .divider span {
    font-size: 12px;
    color: #8a8d91;
  }

  .store-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .store-btn {
    display: flex;
    align-items: center;
    align-items: center;
    justify-content: center;
    padding: 14px;
    border-radius: 14px;
    text-decoration: none;
    font-weight: 600;
  }

  .store-btn.google {
    background: #1877F2;
    color: #fff;
  }

  .store-btn.apple {
    background: #1c1e21;
    color: #fff;
  }

  .store-btn.dark {
    margin-top: 10px;
    background-color: #1d1d1d;
    color: #fff;
  }
</style>