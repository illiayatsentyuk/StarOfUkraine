// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app/',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@nuxt/fonts',
    '@pinia/nuxt',
    '@primevue/nuxt-module',
    '@vee-validate/nuxt',
    '@alexcolls/nuxt-socket.io',
  ],
  runtimeConfig: {
    public: {
      apiURL: process.env.API_URL || 'http://localhost:4040',
    }
  },
  css: ["~/assets/styles/main.scss"],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/assets/styles/variables.css" as *;`,
        },
      },
    },
    optimizeDeps: {
      include: ['socket.io-client'],
    },
  },
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  devServer: {
    port:4040,
  },
})