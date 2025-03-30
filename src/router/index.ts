import { createRouter, createWebHistory } from 'vue-router'
import BudgetList from '../views/BudgetList.vue'
import NewBudget from '../views/NewBudget.vue'
import PreviewBudget from '../views/PreviewBudget.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/orcamentos'
    },
    {
      path: '/orcamentos',
      name: 'budget-list',
      component: BudgetList
    },
    {
      path: '/novo-orcamento',
      name: 'new-budget',
      component: NewBudget
    },
    {
      path: '/orcamento/:id',
      name: 'preview-budget',
      component: PreviewBudget
    }
  ]
})

export default router
