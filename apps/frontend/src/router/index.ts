import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import Step3DashboardPage from '@/views/Step3DashboardPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Step3Dashboard', component: Step3DashboardPage },
    { path: '/home', name: 'Home', component: HomePage },
  ],
})

export default router
