import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import type { BudgetData, User, BudgetItem } from '../interfaces'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 5000, // 5 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirect to login page
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

interface AuthResponse {
  user: User
  token: string
}

// Auth services
const auth = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', { email, password })
      return response.data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password })
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

// Budget services
const budgets = {
  create: async (data: { clientId: number; items: BudgetItem[]; total: number; pdfData: string }) => {
    try {
      const response = await api.post<BudgetData>('/budgets', data)
      return response.data
    } catch (error) {
      console.error('Create budget error:', error)
      throw error
    }
  },

  getAll: async () => {
    try {
      const response = await api.get<BudgetData[]>('/budgets')
      return response.data
    } catch (error) {
      console.error('Get budgets error:', error)
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get<BudgetData>(`/budgets/${id}`)
      return response.data
    } catch (error) {
      console.error('Get budget error:', error)
      throw error
    }
  },

  update: async (id: string, budgetData: Partial<BudgetData>) => {
    try {
      const response = await api.put<BudgetData>(`/budgets/${id}`, budgetData)
      return response.data
    } catch (error) {
      console.error('Update budget error:', error)
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/budgets/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete budget error:', error)
      throw error
    }
  },

  getPdf: async (id: number) => {
    try {
      const response = await api.get(`/budgets/${id}/pdf`, { responseType: 'blob' })
      return response.data
    } catch (error) {
      console.error('Get budget PDF error:', error)
      throw error
    }
  },

  getClient: async (clientId: number) => {
    try {
      const response = await api.get(`/clients/${clientId}`)
      return response.data
    } catch (error) {
      console.error('Get client error:', error)
      throw error
    }
  }
}

// Client services
const clients = {
  create: async (data: { name: string; company: string; phone: string }) => {
    const response = await api.post('/clients', data)
    return response.data
  },

  getAll: async () => {
    const response = await api.get('/clients')
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/clients/${id}`)
    return response.data
  },

  update: async (id: number, data: { name: string; company: string; phone: string }) => {
    const response = await api.put(`/clients/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    await api.delete(`/clients/${id}`)
  },
}

export { auth, clients, budgets }
export default api
