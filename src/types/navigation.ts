export type AuthStackParamList = {
  Landing: undefined
  Login: {initialTab?: 'login' | 'register'}
  ForgotPassword: undefined
}

export type TripStackParamList = {
  TripsList: undefined
  TripDetail: { tripId: number }
  TripBudget: { tripId: number; tripName: string }
  CreateEditTrip: { tripId?: number }
}

export type ProfileStackParamList = {
  Profile: { username?: string }
  Settings: undefined
}

export type MainTabParamList = {
  TripsTab: undefined
  WishlistTab: undefined
  NotificationsTab: undefined
  ProfileTab: undefined
}

export type RootStackParamList = {
  Auth: undefined
  Main: undefined
}
