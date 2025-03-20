import { createRouter, createWebHistory } from 'vue-router'
import Budgets from '@/views/Budgets.vue'
import NewBudget from '@/views/NewBudget.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'orçamentos',
      component: Budgets,
    },
    {
      path: '/novo-orcamento',
      name: 'new-budget',
      component: NewBudget,
    }
  ],
})

export default router
