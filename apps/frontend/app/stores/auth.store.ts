import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useToast } from "vue-toastification";
import type { Form } from '~/types'

export const useLoginStore = defineStore('login', () => {
    const config = useRuntimeConfig()
    const toast = useToast()
    const user = ref<any>(null)
    const authenticated = ref(false)
    const isAdmin = ref(false)
    const loading = ref(false)

    const loginByGoogle = () => {
        window.location.href = `${config.public.apiURL}/auth/google/login`
    }

    const signupByEmail = async (userData: any) => {
        loading.value = true
        try {
            const response = await useApi().post('/auth/signup', userData)
            if (response.data?.user) {
                user.value = response.data.user
                isAdmin.value = response.data.user.role === 'ADMIN'
            }
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
            const response = await useApi().post('/auth/signin', credentials)
            if (response.data?.user) {
                user.value = response.data.user
                isAdmin.value = response.data.user.role === 'ADMIN'
            }
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
                const userData = response.data.user
                // Load local image override if exists
                const localImage = localStorage.getItem(`user_image_${userData.id}`)
                if (localImage) {
                    userData.image = localImage
                }
                
                user.value = userData
                isAdmin.value = userData.role === 'ADMIN'
            }
        } catch {
            user.value = null
            isAdmin.value = false
        } finally {
            loading.value = false
        }
    }

    const setLocalProfileImage = (imageUrl: string) => {
        if (!user.value?.id) return
        
        user.value.image = imageUrl
        localStorage.setItem(`user_image_${user.value.id}`, imageUrl)
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

    return { 
        user, 
        isAdmin, 
        isAuthenticated, 
        loading, 
        loginByGoogle, 
        fetchUser, 
        init, 
        logout, 
        signupByEmail, 
        loginByEmail,
        setLocalProfileImage 
    }
})