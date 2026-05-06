import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { Form } from '~/types'

export const useLoginStore = defineStore('login', () => {
    const config = useRuntimeConfig()
    const toast = useServerSafeToast()
    const user = ref<any>(null)
    const image = ref<string | null>(null)
    const authenticated = ref(false)
    const isAdmin = ref(false)
    const loading = ref(false)

    const loginByGoogle = () => {
        window.location.href = `${config.public.apiURL}/auth/google/login`
    }

    const signupByEmail = async (userData: any) => {
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
            window.location.reload()
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
            window.location.reload()
        }
    }

    // Просто запитуємо профіль — cookies браузер надішле сам
    const fetchUser = async () => {
        loading.value = true
        try {
            const response = await useApi().post('/auth/me')
            if (response.data?.user) {
                user.value = response.data.user
                isAdmin.value = response.data.user.role === 'ADMIN'
                image.value = response.data.user.image
            }
            console.log(user.value?.image)
        } catch {
            user.value = null
            isAdmin.value = false
        } finally {
            loading.value = false
        }
    }

    // Ініціалізація при старті
    const init = async () => {
        await fetchUser()  // просто пробуємо, без refresh спочатку
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
            window.location.reload()
        }
    }

    const isAuthenticated = computed(() => !!user.value)
 
    

    return { user, isAdmin, image, isAuthenticated, loading, loginByGoogle, fetchUser, init, logout, signupByEmail, loginByEmail }
})