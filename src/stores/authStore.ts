import { create } from 'zustand'
import Keychain from 'react-native-keychain'
import { User } from '../types'
import { setAuthToken } from '../api/client'
import { authApi } from '../api/auth'

const KEYCHAIN_SERVICE = 'triplaning_auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (email: string, password: string) => Promise<void>
  register: (firstname: string, lastname: string, email: string, password: string) => Promise<void>
  loginWithToken: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
  restore: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const data = await authApi.login(email, password)
    await Keychain.setGenericPassword('token', data.token, { service: KEYCHAIN_SERVICE })
    setAuthToken(data.token)
    set({ user: data.user, token: data.token, isAuthenticated: true })
  },

  register: async (firstname, lastname, email, password) => {
    const data = await authApi.register({ firstname, lastname, email, password })
    await Keychain.setGenericPassword('token', data.token, { service: KEYCHAIN_SERVICE })
    setAuthToken(data.token)
    set({ user: data.user, token: data.token, isAuthenticated: true })
  },

  loginWithToken: async (token, user) => {
    await Keychain.setGenericPassword('token', token, { service: KEYCHAIN_SERVICE })
    setAuthToken(token)
    set({ user, token, isAuthenticated: true })
  },

  logout: async () => {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE })
    setAuthToken(null)
    set({ user: null, token: null, isAuthenticated: false })
  },

  restore: async () => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE })
      if (credentials) {
        const token = credentials.password
        setAuthToken(token)
        const user = await authApi.me()
        set({ user, token, isAuthenticated: true })
      }
    } catch {
      // Token invalide ou absent — on reste déconnecté
    } finally {
      set({ isLoading: false })
    }
  },

  refreshUser: async () => {
    const user = await authApi.me()
    set({ user })
  },
}))
