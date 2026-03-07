import { createRouter, createWebHistory } from 'vue-router'
import HeaderCompetition from '@/components/AppComponents/HeaderCompetition.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: HeaderCompetition },
  ],
})

export default router
