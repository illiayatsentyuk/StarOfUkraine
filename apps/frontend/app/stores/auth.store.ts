import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { Form, User } from '~/types'

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
            window.location.href = `${config.public.apiURL}/auth/google/login`
        }
    }

    const signupByEmail = async (userData: Partial<User> & { password?: string }) => {
        loading.value = true
        try {
            await useApi().post('/auth/signup', userData)
            await fetchUser()
        } catch {
            user.value = null
            isAdmin.value = false
            toast.error('Помилка при реєстрації')
        } finally {
            loading.value = false
            navigateTo('/')
            authenticated.value = true
            if (typeof window !== 'undefined') {
                window.location.reload()
            }
        }
    }

    const loginByEmail = async (credentials: any) => {
        loading.value = true
        try {
            await useApi().post('/auth/signin', credentials)
            await fetchUser()
        } catch {
            user.value = null
            isAdmin.value = false
            toast.error('Неправильна пошта або пароль')
        } finally {
            loading.value = false
            navigateTo('/')
            authenticated.value = true
            if (typeof window !== 'undefined') {
                window.location.reload()
            }
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
                image.value = response.data.image
                authenticated.value = true
                console.log('User fetched:', user.value)
            }

        } catch (error) {
            console.error('Fetch user failed:', error)
            user.value = null
            isAdmin.value = false
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
                window.location.reload()
            }
        }
    }

    const isAuthenticated = computed(() => !!user.value)

    const updateName = async (name: string) => {
        loading.value = true
        try {
            const response = await useApi().patch('/users/me', { name })
            if (response.data) {
                user.value = { ...user.value!, ...response.data }
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
            const response = await useApi().patch('/users/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            if (response.data) {
                user.value = { ...user.value!, ...response.data }
                image.value = response.data.image
            }
        } catch {
            toast.error('Помилка при завантаженні аватару')
        } finally {
            loading.value = false
        }
    }

    return { user, isAdmin, isJury, image, isAuthenticated, loading, loginByGoogle, fetchUser, init, logout, signupByEmail, loginByEmail, updateName, uploadAvatar }
})