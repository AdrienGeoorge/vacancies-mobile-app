export type AuthStackParamList = {
  Landing: undefined
  Login: {initialTab?: 'login' | 'register'}
  ForgotPassword: undefined
}

export type TripStackParamList = {
  TripsList: undefined
  TripDetails: { tripId: number }
  TripHome: { tripId: number }
  Accommodations: { tripId: number }
  Transports: { tripId: number }
  Activities: { tripId: number }
  OnSiteExpenses: { tripId: number }
  VariousExpenses: { tripId: number }
  Calendar: { tripId: number }
  Checklist: { tripId: number }
  Balance: { tripId: number }
  Photos: { tripId: number }
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
