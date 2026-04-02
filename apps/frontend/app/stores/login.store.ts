import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

export const useLoginStore = defineStore('login', () => {
    const config = useRuntimeConfig()
    const user = ref<any>(null)
    const isAdmin = ref(false)
    const loading = ref(false)

    // Redirect to Google OAuth login flow
    const login = () => {
        window.location.href = `${config.public.apiURL}/auth/google/login`
    }

    // Check if user is authenticated and fetch profile
    const fetchUser = async () => {
        loading.value = true
        try {
            const response = await useApi().post('/auth/me')
            if (response.data && response.data.user) {
                user.value = response.data.user
                isAdmin.value = response.data.user.role === 'ADMIN'
            } else {
                user.value = null
                isAdmin.value = false
            }
        } catch (error) {
            user.value = null
            isAdmin.value = false
        } finally {
            loading.value = false
        }
    }

    // Logout and clear session
    const logout = async () => {
        try {
            await useApi().post('/auth/logout')
            user.value = null
            isAdmin.value = false
            window.location.reload()
        } catch (error) {
            console.error('Logout failed', error)
        }
    }

    return {
        user,
        isAdmin,
        loading,
        login,
        fetchUser,
        logout
    }
})