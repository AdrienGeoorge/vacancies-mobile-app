export interface User {
  id: number
  email: string
  firstname: string
  lastname: string
  username: string
  avatar: string | null
  banner: string | null
  biography: string | null
  language: string
  theme: string
  preferredCurrency: string
  privateProfile: boolean
  paypalHandle: string | null
  revolutHandle: string | null
}

export interface Trip {
  id: number
  name: string
  description: string | null
  departureDate: string
  returnDate: string
  image: string | null
  blocNotes: string | null
  shareToken: string
  currency: string
  traveler: { id: number }
  destinations?: TripDestination[]
}

export interface TripDestination {
  id: number
  country: string
  city: string
  arrivalDate: string
  departureDate: string
  displayOrder: number
}

export interface TripTraveler {
  id: number
  name: string
  invited: User | null
}

export interface Accommodation {
  id: number
  name: string
  address: string | null
  city: string | null
  country: string | null
  price: number
  booked: boolean
  arrivalDate: string
  departureDate: string
  payedBy: TripTraveler | null
  convertedPrice?: number
}

export interface Transport {
  id: number
  departure: string
  destination: string
  departureDate: string
  arrivalDate: string
  company: string | null
  price: number
  type: { id: number; name: string } | null
  paid: boolean
  perPerson: boolean
  convertedPrice?: number
}

export interface Activity {
  id: number
  name: string
  price: number
  booked: boolean
  date: string
  perPerson: boolean
  activityType: { id: number; name: string } | null
  convertedPrice?: number
}

export interface OnSiteExpense {
  id: number
  name: string
  price: number
  perPerson: boolean
  payedBy: TripTraveler | null
  convertedPrice?: number
}

export interface VariousExpense {
  id: number
  name: string
  price: number
  date: string
  category: string | null
  convertedPrice?: number
}

export interface PlanningEvent {
  id: number
  title: string
  description: string | null
  start: string
  end: string
  type: { id: number; name: string } | null
  timeToGo: string | null
}

export interface ChecklistItem {
  id: number
  name: string
  category: string
  isChecked: boolean
  isShared: boolean
  owner: TripTraveler
  checkedBy: TripTraveler | null
}

export interface WishlistItem {
  id: number
  country: string
  city: string | null
  note: string | null
}

export interface Notification {
  id: number
  message: string
  isRead: boolean
  createdAt: string
  link: string | null
}

export interface TripBudget {
  id: number
  category: string
  amount: number
}

export interface TripReimbursement {
  id: number
  fromTraveler: TripTraveler
  toTraveler: TripTraveler
  amount: number
  date: string
  description: string | null
}
