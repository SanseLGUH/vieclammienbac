// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/main.css'],

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
        }
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: 'https://api.vieclammienbac.com',
    },
  },

  modules: [
    '@pinia/nuxt',
  ]
})
