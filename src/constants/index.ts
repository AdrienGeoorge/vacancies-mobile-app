import {Dimensions} from 'react-native'

export const API_URL = 'http://127.0.0.1:8000/api'
export const BASE_URL = 'http://127.0.0.1:8000'

const {width: SCREEN_WIDTH} = Dimensions.get('window')
const scale = SCREEN_WIDTH <= 375 ? 0.82 : Math.min(1, SCREEN_WIDTH / 390)

/** Responsive font size. Usage: fs(16) → scales relative to iPhone 15 width */
export const fs = (size: number) => Math.round(size * scale)

export const COLORS = {
    primary: '#14b8a6',      // teal-500 — oklch(70.4% 0.14 182.503)
    primaryHover: '#0d9488', // teal-600 — oklch(60% 0.118 184.704)
    primaryBorder: '#2dd4bf', // teal-400 — oklch(77.7% 0.152 181.912)
    primaryDark: '#25444C',
    primaryLight: '#ccfbf1', // teal-100
    secondary: '#6b7280',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#d97706',
    background: '#ffffff',
    surface: '#f6f6f6',
    border: '#e5e7eb',
    text: '#111827',
    textSecondary: '#6b7280',
}

export const SPACING = {
    xxs: Math.round(2 * scale),
    xs: Math.round(4 * scale),
    base: Math.round(6 * scale),
    sm: Math.round(8 * scale),
    md: Math.round(16 * scale),
    lg: Math.round(24 * scale),
    xl: Math.round(32 * scale),
    xxl: Math.round(48 * scale),
}

export const BORDER_RADIUS = {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
}

export const FONTS = {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    display: 'TenorSans',
}
