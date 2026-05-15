// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app/',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    // Vercel sets VERCEL=1 during CI builds; Nitro emits the correct serverless bundle.
    preset: process.env.VERCEL ? 'vercel' : undefined,
  },
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
  runtimeConfig: {
    apiURL: process.env.NUXT_API_URL || process.env.API_URL,
    public: {
      apiURL:
        process.env.NUXT_PUBLIC_API_URL ||
        process.env.API_URL ||
        'https://starofukraine.onrender.com',
      socketUrl:
        process.env.NUXT_PUBLIC_SOCKET_URL ||
        process.env.SOCKET_URL ||
        'http://localhost:3001',
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
      include: ['socket.io-client', '@vueuse/core', 'vue-toastification', 'axios', 'vue-draggable-next'],
    },
  },
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.ts', name: 'English' },
      { code: 'ua', iso: 'uk-UA', file: 'ua.ts', name: 'Українська' },
    ],
    defaultLocale: 'en',
    lazy: false,
    langDir: 'app/locales',
    restructureDir: false,
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    vueI18n: './i18n.config.ts',
  },
  devServer: {
    host: '0.0.0.0',
    port: 4040,
  },
}) 