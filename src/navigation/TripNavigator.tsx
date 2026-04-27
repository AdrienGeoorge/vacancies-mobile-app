import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TripStackParamList } from '../types/navigation'
import TripsListScreen from '../screens/trips/TripsListScreen'

const Stack = createNativeStackNavigator<TripStackParamList>()

export default function TripNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TripsList"
        component={TripsListScreen}
        options={{ title: 'Mes voyages' }}
      />
    </Stack.Navigator>
  )
}
