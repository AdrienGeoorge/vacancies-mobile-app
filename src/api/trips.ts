import apiClient from './client'
import { TripListItem, TripGeneralData, TripDashboard, TripForecastBudget, TripWeather } from '../types'

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

  getWeather: async (tripId: number): Promise<TripWeather> => {
    const { data } = await apiClient.get<TripWeather>(`/weather/get/${tripId}`)
    return data
  },

  delete: async (tripId: number): Promise<void> => {
    await apiClient.delete(`/trips/delete/${tripId}`)
  },

  leave: async (tripId: number): Promise<void> => {
    await apiClient.post(`/trips/leave/${tripId}`)
  },
}
