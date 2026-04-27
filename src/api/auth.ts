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

  googleAuthUrl: async (): Promise<{ url: string }> => {
    const { data } = await apiClient.get<{ url: string }>('/connect/google')
    return data
  },
}
