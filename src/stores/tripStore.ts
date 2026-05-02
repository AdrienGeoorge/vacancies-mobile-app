import { create } from 'zustand'
import { TripListItem, TripGeneralData, TripDashboard, TripForecastBudget, TripWeather } from '../types'
import { tripsApi } from '../api/trips'

interface TripStore {
  trips: TripListItem[]
  isLoadingList: boolean
  listError: string | null

  currentTrip: TripGeneralData | null
  currentDashboard: TripDashboard | null
  forecastBudget: TripForecastBudget | null
  isLoadingDetail: boolean
  detailError: string | null

  weather: TripWeather | null
  isLoadingWeather: boolean

  fetchTrips: (userId: number) => Promise<void>
  fetchTripDetail: (tripId: number) => Promise<void>
  fetchWeather: (tripId: number) => Promise<void>
  saveForecastBudget: (tripId: number, forecast: TripForecastBudget) => Promise<void>
  clearCurrentTrip: () => void
}

export const useTripStore = create<TripStore>((set) => ({
  trips: [],
  isLoadingList: false,
  listError: null,

  currentTrip: null,
  currentDashboard: null,
  forecastBudget: null,
  isLoadingDetail: false,
  detailError: null,

  weather: null,
  isLoadingWeather: false,

  fetchTrips: async (userId) => {
    set({ isLoadingList: true, listError: null })
    try {
      const trips = await tripsApi.getAll(userId)
      set({ trips })
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Erreur de chargement'
      set({ listError: msg })
    } finally {
      set({ isLoadingList: false })
    }
  },

  fetchTripDetail: async (tripId) => {
    set({ isLoadingDetail: true, currentTrip: null, currentDashboard: null, forecastBudget: null, detailError: null })
    try {
      const [generalData, dashboard, forecast] = await Promise.all([
        tripsApi.getGeneralData(tripId),
        tripsApi.getDashboard(tripId),
        tripsApi.getBudgetForecast(tripId),
      ])
      set({ currentTrip: generalData, currentDashboard: dashboard, forecastBudget: forecast })
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Erreur de chargement'
      set({ detailError: msg })
    } finally {
      set({ isLoadingDetail: false })
    }
  },

  fetchWeather: async (tripId) => {
    set({ isLoadingWeather: true })
    try {
      const weather = await tripsApi.getWeather(tripId)
      set({ weather })
    } catch {
      set({ weather: null })
    } finally {
      set({ isLoadingWeather: false })
    }
  },

  saveForecastBudget: async (tripId, forecast) => {
    await tripsApi.saveBudgetForecast(tripId, forecast)
    set({ forecastBudget: forecast })
  },

  clearCurrentTrip: () => set({ currentTrip: null, currentDashboard: null, forecastBudget: null, weather: null }),
}))
