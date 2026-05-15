import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { User } from '~/types'

export const useLoginStore = defineStore('login', () => {
    const config = useRuntimeConfig()
    const toast = useServerSafeToast()
    const user = ref<User | null>(null)
    const image = ref<string | null>(null)
    const authenticated = ref(false)
    const isAdmin = ref(false)
    const isJury = ref(false)
    const loading = ref(false)

    const loginByGoogle = () => {
        if (typeof window !== 'undefined') {
            const url = `${config.public.apiURL}/auth/google/login`
            window.location.href = url
        }
    }

    const signupByEmail = async (userData: Partial<User> & { password?: string }) => {
        loading.value = true
        try {
            await useApi().post('/auth/signup', userData)
            await fetchUser()
            navigateTo('/')
            authenticated.value = true
            if (typeof window !== 'undefined') {
                window.location.reload()
            }
        } catch (error: any) {
            user.value = null
            isAdmin.value = false
            const msg = error.response?.data?.message || 'Помилка при реєстрації'
            toast.error(msg)
            throw error
        } finally {
            loading.value = false
        }
    }

    const loginByEmail = async (credentials: any) => {
        loading.value = true
        try {
            await useApi().post('/auth/signin', credentials)
            await fetchUser()
            navigateTo('/')
            authenticated.value = true
            if (typeof window !== 'undefined') {
                window.location.reload()
            }
        } catch (error: any) {
            user.value = null
            isAdmin.value = false
            const msg = error.response?.data?.message || 'Неправильна пошта або пароль'
            toast.error(msg)
            throw error
        } finally {
            loading.value = false
        }
    }

    const fetchUser = async () => {
        loading.value = true
        try {
            const response = await useApi().post('/auth/me')
            if (response.data) {
                user.value = response.data
                isAdmin.value = response.data.role === 'ADMIN'
                isJury.value = response.data.role === 'JURY'
                image.value = response.data.image ?? null
                authenticated.value = true
            }
        } catch {
            // 401 is expected for unauthenticated visitors on public pages
            user.value = null
            isAdmin.value = false
            isJury.value = false
            image.value = null
            authenticated.value = false
        } finally {
            loading.value = false
        }
    }

    const init = async () => {
        await fetchUser()
    }

    const logout = async () => {
        try {
            await useApi().post('/auth/logout')
        } catch {
            toast.error('Помилка при виході')
        } finally {
            user.value = null
            isAdmin.value = false
            authenticated.value = false
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem('activeTeamId')
                navigateTo(useLocalePath()('/'))
                window.location.reload()
            }
        }
    }

    const isAuthenticated = computed(() => !!user.value)

    const updateName = async (name: string) => {
        loading.value = true
        try {
            const response = await useApi().patch('/users/me', { name })
            if (response.data && user.value) {
                user.value = { ...user.value, ...response.data }
            }
        } catch {
            toast.error('Помилка при оновленні імені')
        } finally {
            loading.value = false
        }
    }

    const uploadAvatar = async (file: File) => {
        loading.value = true
        try {
            const formData = new FormData()
            formData.append('file', file)
            const response = await useApi().patch('/users/me/avatar', formData)
            if (response.data && user.value) {
                user.value = { ...user.value, ...response.data }
                image.value = response.data.image
            }
        } catch {
            toast.error('Помилка при завантаженні аватару')
        } finally {
            loading.value = false
        }
    }

    const userTeam = computed(() => {
        if (!user.value) return null
        return user.value.teamsAsCaptain?.[0] || user.value.teamsAsMember?.[0] || null
    })

    const hasTeam = computed(() => !!userTeam.value)

    return { user, isAdmin, isJury, image, isAuthenticated, hasTeam, userTeam, loading, loginByGoogle, fetchUser, init, logout, signupByEmail, loginByEmail, updateName, uploadAvatar }
})