// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@tresjs/nuxt'],

  css: ['~/assets/scss/main.scss'],

  tres: {
    glsl: true,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },
})
