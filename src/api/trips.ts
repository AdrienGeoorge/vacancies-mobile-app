import apiClient from './client'
import { TripListItem, TripGeneralData, TripDashboard, TripForecastBudget } from '../types'

export const tripsApi = {
  getAll: async (userId: number): Promise<TripListItem[]> => {
    const { data } = await apiClient.get<TripListItem[]>(`/trips/all/user/${userId}`)
    return data
  },

  getGeneralData: async (tripId: number): Promise<TripGeneralData> => {
    const { data } = await apiClient.get<TripGeneralData>(`/trips/get/${tripId}/general-data`)
    return data
  },

  getDashboard: async (tripId: number): Promise<TripDashboard> => {
    const { data } = await apiClient.get<TripDashboard>(`/trips/get/${tripId}/dashboard`)
    return data
  },

  getBudgetForecast: async (tripId: number): Promise<TripForecastBudget> => {
    const { data } = await apiClient.get<TripForecastBudget>(`/trips/${tripId}/budget`)
    return data
  },

  saveBudgetForecast: async (tripId: number, forecast: TripForecastBudget): Promise<void> => {
    await apiClient.post(`/trips/${tripId}/budget`, forecast)
  },

  delete: async (tripId: number): Promise<void> => {
    await apiClient.delete(`/trips/delete/${tripId}`)
  },

  leave: async (tripId: number): Promise<void> => {
    await apiClient.post(`/trips/leave/${tripId}`)
  },
}
