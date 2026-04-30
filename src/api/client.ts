import axios from 'axios'
import { API_URL } from '../constants'
import { tokenStorage } from './tokenStorage'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function setAuthToken(token: string | null) {
  tokenStorage.set(token)
}

// Intercepteur request — lit le token depuis tokenStorage (survit au Fast Refresh)
apiClient.interceptors.request.use(config => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['X-Locale'] = 'fr'
  return config
})

// Intercepteur response — gestion globale des erreurs
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      tokenStorage.set(null)
    }
    return Promise.reject(error)
  },
)

export default apiClient
