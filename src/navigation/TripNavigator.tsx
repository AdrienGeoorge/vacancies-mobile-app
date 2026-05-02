import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {TripStackParamList} from '../types/navigation'
import TripsListScreen from '../screens/trips/TripsListScreen'
import TripDetailScreen from '../screens/trips/TripDetailScreen'
import TripBudgetScreen from '../screens/trips/TripBudgetScreen'

const Stack = createNativeStackNavigator<TripStackParamList>()

export default function TripNavigator() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="TripsList" component={TripsListScreen}/>
            <Stack.Screen name="TripDetail" component={TripDetailScreen}/>
            <Stack.Screen name="TripBudget" component={TripBudgetScreen}/>
        </Stack.Navigator>
    )
}
