import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import { MainTabParamList } from '../types/navigation'
import TripNavigator from './TripNavigator'
import WishlistScreen from '../screens/wishlist/WishlistScreen'
import NotificationsScreen from '../screens/notifications/NotificationsScreen'
import ProfileScreen from '../screens/profile/ProfileScreen'

const Tab = createBottomTabNavigator<MainTabParamList>()

function TabIcon({ label }: { label: string }) {
  return <Text>{label}</Text>
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="TripsTab"
        component={TripNavigator}
        options={{
          title: 'Voyages',
          tabBarIcon: ({ color }) => <TabIcon label="✈️" />,
        }}
      />
      <Tab.Screen
        name="WishlistTab"
        component={WishlistScreen}
        options={{
          title: 'Wishlist',
          tabBarIcon: () => <TabIcon label="⭐" />,
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          tabBarIcon: () => <TabIcon label="🔔" />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: () => <TabIcon label="👤" />,
        }}
      />
    </Tab.Navigator>
  )
}
