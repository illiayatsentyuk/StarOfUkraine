<script setup lang="ts">
type MeUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
}

type MeResponse = {
  user: MeUser
  message: string
  role: string
}

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

const user = ref<MeUser | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const googleAuthUrl = computed(
  () => `${config.public.apiURL}/auth/google/login`,
)

const loadProfile = async () => {
  loading.value = true
  error.value = null
  try {
    const api = useApi()
    const { data } = await api.post<MeResponse>('/auth/me')
    user.value = data.user
  } catch {
    user.value = null
    error.value = 'You are not signed in.'
  } finally {
    loading.value = false
  }
}

const logout = async () => {
  try {
    const api = useApi()
    await api.post('/auth/logout')
  } catch {
    /* cookies may already be cleared */
  }
  user.value = null
  error.value = 'You are not signed in.'
}

onMounted(async () => {
  if (route.query.oauth === 'success') {
    await router.replace({ path: '/auth', query: {} })
  }
  await loadProfile()
})
</script>

<template lang="pug">
.auth
  .auth__card
    h1.auth__title Sign in
    p.auth__lead Use your Google account. Tokens stay in HttpOnly cookies; the app sends them on API requests automatically.
    a.auth__google(
      :href="googleAuthUrl"
    )
      svg.auth__google-icon(
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="22"
        height="22"
        aria-hidden="true"
      )
        path(
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        )
        path(
          fill="#FF3D00"
          d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        )
        path(
          fill="#4CAF50"
          d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        )
        path(
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        )
      span Continue with Google

    .auth__status(v-if="loading") Checking session…
    .auth__user(v-else-if="user")
      p.auth__label Signed in as
      p.auth__email {{ user.email }}
      p.auth__name(v-if="user.name") {{ user.name }}
      button.auth__logout(type="button" @click="logout") Sign out
    p.auth__hint(v-else-if="error") {{ error }}
</template>

<style scoped lang="scss">
@use "~/assets/styles/breakpoints.scss" as *;

.auth {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  background: var(--color-bg);
  font-family: var(--font-sans);
}

.auth__card {
  width: 100%;
  max-width: 400px;
  padding: var(--space-8);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: 0 4px 24px rgba(13, 13, 13, 0.06);
}

.auth__title {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--space-3);
}

.auth__lead {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0 0 var(--space-6);
}

.auth__google {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: #f5f5f5;
    border-color: #d0d0d0;
  }
}

.auth__google-icon {
  flex-shrink: 0;
}

.auth__status,
.auth__hint {
  margin: var(--space-6) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.auth__user {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.auth__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-1);
}

.auth__email {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--space-1);
  word-break: break-all;
}

.auth__name {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-4);
}

.auth__logout {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  font-size: var(--font-size-sm);
  cursor: pointer;

  &:hover {
    background: var(--color-surface);
  }
}

@include media($md) {
  .auth__card {
    padding: var(--space-10);
  }
}
</style>
