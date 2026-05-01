import axios from 'axios'

export default defineNuxtPlugin(() => {
    // Set axios defaults globally for the frontend application
    // This ensures HttpOnly cookies (access_token, refresh_token) are sent with every request
    axios.defaults.withCredentials = true
})
