import axios from 'axios'
import { API_URL } from '../constants'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Stockage du token en mémoire (sera hydraté depuis Keychain au démarrage)
let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

// Intercepteur request — ajoute le JWT et la locale
apiClient.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  config.headers['X-Locale'] = 'fr' // TODO: récupérer depuis i18n
  return config
})

// Intercepteur response — gestion globale des erreurs
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expiré → déconnexion gérée par le store
      setAuthToken(null)
    }
    return Promise.reject(error)
  },
)

export default apiClient
