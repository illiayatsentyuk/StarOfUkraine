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
  ],
  veeValidate: {
    // Using built-in rules
    autoImports: true,
    componentNames: {
      Form: 'VeeForm',
      Field: 'VeeField',
    },
  },
  primevue: {
    options: {
      theme: {
        preset: 'Aura',
        options: {
          darkModeSelector: '.dark-mode'
        }
      }
    }
  },
  runtimeConfig: {
    public: {
      apiURL: process.env.API_URL || 'http://localhost:3000',
      devAdminEmail: process.env.DEV_ADMIN_EMAIL,
      devAdminPassword: process.env.DEV_ADMIN_PASSWORD,
    }
  },
  css: ["~/assets/styles/main.scss", "primeicons/primeicons.css"],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/assets/styles/breakpoints.scss" as *; @use "~/assets/styles/variables.css" as *;`,
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