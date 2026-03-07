import { createRouter, createWebHistory } from 'vue-router'
import Tournaments from '@/views/Tournaments/Tournaments.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: Tournaments },
  ],
})

export default router
