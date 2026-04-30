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

export interface Currency {
    code: string
    symbol: string
    name: string
}

export interface Country {
    id: number
    name: string
    code: string
    plugTypes: string
    timezone: string
}

export interface TripDestination {
    id: number
    country: Country
    displayOrder: number
    arrivalDate: string | null
    departureDate: string | null
}

export interface TripTraveler {
    id: number
    name: string
    invited: User | null
}

export interface Trip {
    id: number
    name: string
    description: string | null
    departureDate: string | null
    returnDate: string | null
    image: string | null
    blocNotes: string | null
    shareToken: string
    currency: Currency | null
    traveler: {
        id: number
        firstname: string
        lastname: string
        email: string
        avatar: string | null
    }
    tripTravelers: TripTraveler[]
    destinations: TripDestination[]
}

export interface Accommodation {
    id: number
    name: string
    address: string | null
    zipCode: string | null
    city: string | null
    country: string | null
    description: string | null
    price: number
    originalPrice: string
    originalCurrency: Currency | null
    convertedPrice: string
    booked: boolean
    deposit: number | null
    arrivalDate: string | null
    departureDate: string | null
    payedBy: TripTraveler | null
    purchaseDate: string | null
}

export interface TransportType {
    id: number
    name: string
}

export interface Transport {
    id: number
    departure: string | null
    destination: string | null
    departureDate: string | null
    arrivalDate: string | null
    company: string | null
    description: string | null
    price: number
    originalPrice: string
    originalCurrency: Currency | null
    convertedPrice: string
    paid: boolean
    type: TransportType | null
    perPerson: boolean
    isRental: boolean
    estimatedToll: number | null
    estimatedGasoline: number | null
    payedBy: TripTraveler | null
    purchaseDate: string | null
}

export interface Activity {
    id: number
    name: string
    description: string | null
    price: number
    originalPrice: string
    originalCurrency: Currency | null
    convertedPrice: string
    booked: boolean
    date: string | null
    perPerson: boolean
    activityType: { id: number; name: string } | null
    payedBy: TripTraveler | null
    purchaseDate: string | null
}

export interface OnSiteExpense {
    id: number
    name: string
    price: number
    purchaseDate: string | null
    payedBy: TripTraveler | null
}

export interface VariousExpense {
    id: number
    name: string
    price: number
    date: string
    category: string | null
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

export type BudgetCategoryKey = 'accommodations' | 'transports' | 'activities' | 'various-expensive' | 'on-site'
export type TripForecastBudget = Partial<Record<BudgetCategoryKey, number | null>>

interface BudgetCategory {
    title: string
    description: string
    amount: number
}

export interface TripBudget {
    toPay: number
    paid: number
    total: number
    details: {
        reserved: {
            accommodations: BudgetCategory
            transports: BudgetCategory
            activities: BudgetCategory
            'various-expensive': BudgetCategory
            'on-site': BudgetCategory
        }
        nonReserved: {
            accommodations: number
            transports: number
            activities: number
            'various-expensive': number
        }
    }
}

export interface TripReimbursement {
    id: number
    fromTraveler: { id: number; name: string }
    toTraveler: { id: number; name: string }
    amount: string
    date: string | null
    description: string | null
}

export interface TripListItem {
    id: number
    name: string
    description: string | null
    departureDate: string | null
    returnDate: string | null
    image: string | null
    state: 1 | 2 | 3 | 4
    countryCodes: string[]
}

export interface TripGeneralData {
    trip: Trip & {
        accommodations: Accommodation[]
        transports: Transport[]
        activities: Activity[]
        variousExpensives: VariousExpense[]
        onSiteExpenses: OnSiteExpense[]
        planningEvents: PlanningEvent[]
        checklistItems: ChecklistItem[]
        reimbursements: TripReimbursement[]
    }
    cities: any[]
    countDaysBeforeOrAfter: false | 'ongoing' | { before: boolean; days: number }
}

export interface TripDashboard {
    countTravelers: number
    budget: TripBudget
    planning: {
        start: string | null
        end: string | null
        events: PlanningEvent[]
    }
}

export type TripState = 'ongoing' | 'upcoming' | 'unplanned' | 'past'

export function getTripStateFromInt(state: 1 | 2 | 3 | 4): TripState {
    const map: Record<number, TripState> = {1: 'ongoing', 2: 'upcoming', 3: 'unplanned', 4: 'past'}
    return map[state] ?? 'past'
}
