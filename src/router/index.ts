import { createRouter, createWebHistory } from 'vue-router'
import BudgetList from '@/views/BudgetList.vue'
import NewBudget from '@/views/NewBudget.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'orçamentos',
      component: BudgetList,
    },
    {
      path: '/novo-orcamento',
      name: 'new-budget',
      component: NewBudget,
    }
  ],
})

export default router
