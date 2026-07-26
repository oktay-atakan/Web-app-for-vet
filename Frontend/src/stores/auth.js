import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('vetapp_token') || null,
    user: JSON.parse(localStorage.getItem('vetapp_user') || 'null'),
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    role: (state) => state.user?.role,
  },

  actions: {
    async login (email, password) {
      const { data } = await api.post('/auth/login', { email, password })
      this.token = data.token
      this.user = data.user
      localStorage.setItem('vetapp_token', data.token)
      localStorage.setItem('vetapp_user', JSON.stringify(data.user))
    },

    logout () {
      this.clearSession()
    },

    clearSession () {
      this.token = null
      this.user = null
      localStorage.removeItem('vetapp_token')
      localStorage.removeItem('vetapp_user')
    },
  },
})