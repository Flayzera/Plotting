import { defineStore } from 'pinia'
import { auth } from '../services/api'
import type { User } from '../interfaces'

interface AuthState {
  user: User | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async register(email: string, password: string) {
      try {
        const response = await auth.register(email, password)
        this.setAuth(response.user, response.token)
        return response
      } catch (error) {
        console.error('Registration error:', error)
        throw error
      }
    },

    async login(email: string, password: string) {
      try {
        const response = await auth.login(email, password)
        this.setAuth(response.user, response.token)
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        return response
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },

    setAuth(user: User, token: string) {
      this.user = user
      this.token = token
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
    },
  },
})
