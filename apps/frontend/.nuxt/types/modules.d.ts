import { NuxtModule, ModuleDependencyMeta } from '@nuxt/schema'
declare module '@nuxt/schema' {
  interface ModuleDependencies {
    ["@nuxt/image"]?: ModuleDependencyMeta<typeof import("@nuxt/image").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/fonts"]?: ModuleDependencyMeta<typeof import("@nuxt/fonts").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["pinia"]?: ModuleDependencyMeta<typeof import("@pinia/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@primevue/nuxt-module"]?: ModuleDependencyMeta<typeof import("@primevue/nuxt-module").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["vee-validate"]?: ModuleDependencyMeta<typeof import("@vee-validate/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxtjs/i18n"]?: ModuleDependencyMeta<typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/devtools"]?: ModuleDependencyMeta<typeof import("@nuxt/devtools").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
  }
  interface NuxtOptions {
    /**
     * Configuration for `@nuxt/image`
     */
    ["image"]: typeof import("@nuxt/image").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/fonts`
     */
    ["fonts"]: typeof import("@nuxt/fonts").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@pinia/nuxt`
     */
    ["pinia"]: typeof import("@pinia/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@primevue/nuxt-module`
     */
    ["primevue"]: typeof import("@primevue/nuxt-module").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@vee-validate/nuxt`
     */
    ["veeValidate"]: typeof import("@vee-validate/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxtjs/i18n`
     */
    ["i18n"]: typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     */
    ["devtools"]: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
  }
  interface NuxtConfig {
    /**
     * Configuration for `@nuxt/image`
     */
    ["image"]?: typeof import("@nuxt/image").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/fonts`
     */
    ["fonts"]?: typeof import("@nuxt/fonts").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@pinia/nuxt`
     */
    ["pinia"]?: typeof import("@pinia/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@primevue/nuxt-module`
     */
    ["primevue"]?: typeof import("@primevue/nuxt-module").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@vee-validate/nuxt`
     */
    ["veeValidate"]?: typeof import("@vee-validate/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxtjs/i18n`
     */
    ["i18n"]?: typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     */
    ["devtools"]?: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["@nuxt/image", Exclude<NuxtConfig["image"], boolean>] | ["@nuxt/fonts", Exclude<NuxtConfig["fonts"], boolean>] | ["@pinia/nuxt", Exclude<NuxtConfig["pinia"], boolean>] | ["@primevue/nuxt-module", Exclude<NuxtConfig["primevue"], boolean>] | ["@vee-validate/nuxt", Exclude<NuxtConfig["veeValidate"], boolean>] | ["@nuxtjs/i18n", Exclude<NuxtConfig["i18n"], boolean>] | ["@nuxt/devtools", Exclude<NuxtConfig["devtools"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
}
declare module 'nuxt/schema' {
  interface ModuleDependencies {
    ["@nuxt/image"]?: ModuleDependencyMeta<typeof import("@nuxt/image").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/fonts"]?: ModuleDependencyMeta<typeof import("@nuxt/fonts").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["pinia"]?: ModuleDependencyMeta<typeof import("@pinia/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@primevue/nuxt-module"]?: ModuleDependencyMeta<typeof import("@primevue/nuxt-module").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["vee-validate"]?: ModuleDependencyMeta<typeof import("@vee-validate/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxtjs/i18n"]?: ModuleDependencyMeta<typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/devtools"]?: ModuleDependencyMeta<typeof import("@nuxt/devtools").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
  }
  interface NuxtOptions {
    /**
     * Configuration for `@nuxt/image`
     * @see https://www.npmjs.com/package/@nuxt/image
     */
    ["image"]: typeof import("@nuxt/image").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/fonts`
     * @see https://www.npmjs.com/package/@nuxt/fonts
     */
    ["fonts"]: typeof import("@nuxt/fonts").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@pinia/nuxt`
     * @see https://www.npmjs.com/package/@pinia/nuxt
     */
    ["pinia"]: typeof import("@pinia/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@primevue/nuxt-module`
     * @see https://www.npmjs.com/package/@primevue/nuxt-module
     */
    ["primevue"]: typeof import("@primevue/nuxt-module").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@vee-validate/nuxt`
     * @see https://www.npmjs.com/package/@vee-validate/nuxt
     */
    ["veeValidate"]: typeof import("@vee-validate/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxtjs/i18n`
     * @see https://www.npmjs.com/package/@nuxtjs/i18n
     */
    ["i18n"]: typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     * @see https://www.npmjs.com/package/@nuxt/devtools
     */
    ["devtools"]: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
  }
  interface NuxtConfig {
    /**
     * Configuration for `@nuxt/image`
     * @see https://www.npmjs.com/package/@nuxt/image
     */
    ["image"]?: typeof import("@nuxt/image").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/fonts`
     * @see https://www.npmjs.com/package/@nuxt/fonts
     */
    ["fonts"]?: typeof import("@nuxt/fonts").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@pinia/nuxt`
     * @see https://www.npmjs.com/package/@pinia/nuxt
     */
    ["pinia"]?: typeof import("@pinia/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@primevue/nuxt-module`
     * @see https://www.npmjs.com/package/@primevue/nuxt-module
     */
    ["primevue"]?: typeof import("@primevue/nuxt-module").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@vee-validate/nuxt`
     * @see https://www.npmjs.com/package/@vee-validate/nuxt
     */
    ["veeValidate"]?: typeof import("@vee-validate/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxtjs/i18n`
     * @see https://www.npmjs.com/package/@nuxtjs/i18n
     */
    ["i18n"]?: typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     * @see https://www.npmjs.com/package/@nuxt/devtools
     */
    ["devtools"]?: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["@nuxt/image", Exclude<NuxtConfig["image"], boolean>] | ["@nuxt/fonts", Exclude<NuxtConfig["fonts"], boolean>] | ["@pinia/nuxt", Exclude<NuxtConfig["pinia"], boolean>] | ["@primevue/nuxt-module", Exclude<NuxtConfig["primevue"], boolean>] | ["@vee-validate/nuxt", Exclude<NuxtConfig["veeValidate"], boolean>] | ["@nuxtjs/i18n", Exclude<NuxtConfig["i18n"], boolean>] | ["@nuxt/devtools", Exclude<NuxtConfig["devtools"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
}