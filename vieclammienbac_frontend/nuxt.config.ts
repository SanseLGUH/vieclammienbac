import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'https://api.vieclammienbac.com',
    },
  },
  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'description', content: 'Việc Làm Miền Bắc – Tìm việc nhanh' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bungee&family=Syne:wght@700;800&family=Epilogue:wght@400;500;600&family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap',
        },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  modules: [
    '@pinia/nuxt',
    '@primevue/nuxt-module',
  ],
  primevue: {
    options: {
      theme: {
        preset: Aura,
      }
    }
  },
  compatibilityDate: '2024-01-01',
})