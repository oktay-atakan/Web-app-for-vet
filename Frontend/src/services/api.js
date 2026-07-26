import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
})

api.interceptors.request.use((config) => {
  // useAuthStore() is called here (request time), not at module load time,
  // so it's safe despite auth.js also importing this file (circular import).
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore().clearSession()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default api