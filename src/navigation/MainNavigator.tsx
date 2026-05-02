import React from 'react'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {MainTabParamList} from '../types/navigation'
import TripNavigator from './TripNavigator'
import WishlistScreen from '../screens/wishlist/WishlistScreen'
import NotificationsScreen from '../screens/notifications/NotificationsScreen'
import ProfileScreen from '../screens/profile/ProfileScreen'
import {COLORS, FONTS, fs} from '../constants'
import {PlaneIcon, StarIcon, BellIcon, PersonIcon} from '../utils/icons.tsx'

const Tab = createBottomTabNavigator<MainTabParamList>()

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