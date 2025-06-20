import { createRouter, createWebHistory } from 'vue-router'
import BudgetList from '../views/BudgetList.vue'
import NewBudget from '../views/NewBudget.vue'
import PreviewBudget from '../views/PreviewBudget.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '../stores/auth'

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
      component: BudgetList,
      meta: { requiresAuth: true }
    },
    {
      path: '/novo-orcamento',
      name: 'new-budget',
      component: NewBudget,
      meta: { requiresAuth: true }
    },
    {
      path: '/orcamento/:id',
      name: 'preview-budget',
      component: PreviewBudget,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/orcamentos')
  } else {
    next()
  }
})

export default router
