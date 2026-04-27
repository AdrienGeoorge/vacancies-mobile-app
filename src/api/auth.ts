import { Platform } from 'react-native'
import apiClient from './client'
import { User } from '../types'

interface LoginResponse {
  token: string
  user: User
}

interface RegisterPayload {
  email: string
  password: string
  firstname: string
  lastname: string
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/login', { email, password })
    return data
  },

  register: async (payload: RegisterPayload): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/register', payload)
    return data
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/user/me')
    return data
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/password/claim', { email })
  },

  googleAuthUrl: async (): Promise<{ authUrl: string; redirectUri: string; codeVerifier: string }> => {
    const { data } = await apiClient.get<{ authUrl: string; redirectUri: string; codeVerifier: string }>('/connect/google/mobile', {
      headers: { 'X-Platform': Platform.OS },
    })
    return data
  },

  googleCallback: async (code: string, codeVerifier: string): Promise<LoginResponse> => {
    const { data } = await apiClient.get<LoginResponse>('/connect/google/mobile-check', {
      params: { code, codeVerifier },
      headers: { 'X-Platform': Platform.OS },
    })
    return data
  },
}
