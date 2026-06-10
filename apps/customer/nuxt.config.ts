import { resolve } from 'path'

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  components: [{ path: '~/src/presentation/widgets', pathPrefix: false }],
  imports: {
    dirs: ['src/presentation/viewmodels/**', 'src/data/repositories', 'src/core/helpers'],
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiUrl:    process.env.NUXT_PUBLIC_API_URL    || 'http://localhost:4000/api',
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
    },
  },
  typescript: { strict: true }
})
