import React from 'react'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {StyleSheet, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {MainTabParamList} from '../types/navigation'
import TripNavigator from './TripNavigator'
import WishlistScreen from '../screens/wishlist/WishlistScreen'
import NotificationsScreen from '../screens/notifications/NotificationsScreen'
import ProfileScreen from '../screens/profile/ProfileScreen'
import {COLORS, FONTS, fs} from '../constants'
import Svg, {Path} from 'react-native-svg'

const Tab = createBottomTabNavigator<MainTabParamList>()

function PlaneIcon({color}: { color: string }) {
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/>
        </Svg>
    )
}

function StarIcon({color}: { color: string }) {
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
        </Svg>
    )
}

function BellIcon({color}: { color: string }) {
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>
        </Svg>
    )
}

function PersonIcon({color}: { color: string }) {
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
        </Svg>
    )
}

export const TAB_BAR_HEIGHT = 62

export default function MainNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 20,
                    marginHorizontal: 20,
                    height: TAB_BAR_HEIGHT,
                    borderRadius: 30,
                    backgroundColor: '#fff',
                    borderTopWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 8},
                    shadowOpacity: 0.12,
                    shadowRadius: 20,
                    elevation: 16,
                    paddingBottom: 0,
                },
                tabBarLabelStyle: {
                    fontFamily: FONTS.medium,
                    fontSize: fs(11),
                    marginTop: 2,
                },
            }}
        >
            <Tab.Screen
                name="TripsTab"
                component={TripNavigator}
                options={{
                    title: 'Voyages',
                    tabBarIcon: ({color}) => <PlaneIcon color={color}/>,
                }}
            />
            <Tab.Screen
                name="WishlistTab"
                component={WishlistScreen}
                options={{
                    title: 'Wishlist',
                    tabBarIcon: ({color}) => <StarIcon color={color}/>,
                }}
            />
            <Tab.Screen
                name="NotificationsTab"
                component={NotificationsScreen}
                options={{
                    title: 'Notifs',
                    tabBarIcon: ({color}) => <BellIcon color={color}/>,
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    title: 'Profil',
                    tabBarIcon: ({color}) => <PersonIcon color={color}/>,
                }}
            />
        </Tab.Navigator>
    )
}

const s = StyleSheet.create({
    tabBarBg: {
        position: 'absolute',
        left: 16,
        right: 16,
        height: 62,
        borderRadius: 20,
        backgroundColor: '#fff',
    },
})
