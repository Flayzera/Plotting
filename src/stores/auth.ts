import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LoginFormData } from '../validations/loginSchema'
import type { User } from '../interfaces'


export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)
  const sessionTimeout = 1000 * 60 * 60 * 24 // 24 horas

  const login = (credentials: LoginFormData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const foundUser = users.find((u: LoginFormData) => u.email === credentials.email && u.password === credentials.password)

    if (foundUser) {
      isAuthenticated.value = true
      user.value = {
        email: foundUser.email,
        lastLogin: new Date().toISOString()
      }

      // Salva a sessão com timestamp
      const session = {
        user: user.value,
        expiresAt: new Date(Date.now() + sessionTimeout).toISOString()
      }
      localStorage.setItem('session', JSON.stringify(session))
      return true
    }
    return false
  }

  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    localStorage.removeItem('session')
  }

  const register = (credentials: LoginFormData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const userExists = users.some((u: LoginFormData) => u.email === credentials.email)

    if (userExists) {
      return false
    }

    users.push(credentials)
    localStorage.setItem('users', JSON.stringify(users))
    return true
  }

  const checkAuth = () => {
    const session = localStorage.getItem('session')
    if (session) {
      const { user: sessionUser, expiresAt } = JSON.parse(session)

      // Verifica se a sessão expirou
      if (new Date(expiresAt) > new Date()) {
        isAuthenticated.value = true
        user.value = sessionUser
      } else {
        // Se expirou, faz logout
        logout()
      }
    }
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
    register,
    checkAuth
  }
})
