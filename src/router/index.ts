import { createRouter, createWebHistory } from 'vue-router'
import BudgetList from '@/views/BudgetList.vue'
import NewBudget from '@/views/NewBudget.vue'
import PreviewBudget from '@/views/PreviewBudget.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/orcamentos',
      name: 'orçamentos',
      component: BudgetList,
    },
    {
      path: '/novo-orcamento',
      name: 'new-budget',
      component: NewBudget,
    },
    {
      path: '/orcamento/:id',
      name: 'budget',
      component: PreviewBudget,
    }
  ],
})

export default router
