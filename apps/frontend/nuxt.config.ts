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
    '@nuxtjs/i18n',
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
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.ts', name: 'English' },
      { code: 'uk', iso: 'uk-UA', file: 'uk.ts', name: 'Ukrainian' }
    ],
    defaultLocale: 'en',
    langDir: '../app/locales',
    strategy: 'prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    vueI18n: './i18n.config.ts'
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
    port: 4040,
  },
})