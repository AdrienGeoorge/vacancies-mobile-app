import Svg, {Path} from "react-native-svg"
import {COLORS, fs} from "../constants"
import React from "react"

export const PlusIcon = ({size = 22, color = '#fff', strokeWidth = 2.5}) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" d="M12 5v14M5 12h14"/>
        </Svg>
    )
}

export const MinusIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path
            d="M5 12h14"
            stroke='#000'
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
)

export const BackArrow = ({color = '#fff'}: { color?: string }) => {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
        </Svg>
    )
}

export const MailIcon = () => {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path stroke={'#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
        </Svg>
    )
}

export const CheckCircleIcon = () => {
    return (
        <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
            <Path stroke={COLORS.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
        </Svg>
    )
}

export const ErrorCircleIcon = () => {
    return (
        <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
            <Path stroke={COLORS.danger} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
        </Svg>
    )
}

export const LockIcon = () => {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path stroke={'#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
        </Svg>
    )
}

export const UserIcon = () => {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path stroke={'#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
        </Svg>
    )
}

export const GoogleLogo = () => {
    return (
        <Svg width={20} height={20} viewBox="0 0 48 48">
            <Path fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <Path fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <Path fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <Path fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </Svg>
    )
}

export const EditIcon = () => {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/>
        </Svg>
    )
}

export const MapPinIcon = () => {
    return (
        <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
            <Path stroke={COLORS.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            <Path stroke={COLORS.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
        </Svg>
    )
}

export const PlaneIcon = ({color}: { color: string }) => {
    return (
        <Svg width={fs(22)} height={fs(22)} viewBox="0 0 24 24" fill="none">
            <Path stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/>
        </Svg>
    )
}

export const StarIcon = ({color}: { color: string }) => {
    return (
        <Svg width={fs(22)} height={fs(22)} viewBox="0 0 24 24" fill="none">
            <Path stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
        </Svg>
    )
}

export const BellIcon = ({color}: { color: string }) => {
    return (
        <Svg width={fs(22)} height={fs(22)} viewBox="0 0 24 24" fill="none">
            <Path stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>
        </Svg>
    )
}
export const PersonIcon = ({color}: { color: string }) => {
    return (
        <Svg width={fs(22)} height={fs(22)} viewBox="0 0 24 24" fill="none">
            <Path stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
        </Svg>
    )
}