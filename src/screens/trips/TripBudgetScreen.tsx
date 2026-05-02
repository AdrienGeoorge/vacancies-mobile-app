import React from 'react'
import {ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {NativeStackNavigationProp} from '@react-navigation/native-stack'
import {RouteProp} from '@react-navigation/native'
import {TripStackParamList} from '../../types/navigation'
import {useTripStore} from '../../stores/tripStore'
import BudgetSection from './BudgetSection'
import {COLORS, FONTS, SPACING, fs} from '../../constants'
import {BackArrow} from '../../utils/icons.tsx'
import {TAB_BAR_HEIGHT} from '../../navigation/MainNavigator'

type Props = {
    navigation: NativeStackNavigationProp<TripStackParamList, 'TripBudget'>
    route: RouteProp<TripStackParamList, 'TripBudget'>
}

export default function TripBudgetScreen({navigation, route}: Props) {
    const {tripId, tripName} = route.params
    const insets = useSafeAreaInsets()
    const {currentDashboard, forecastBudget, isLoadingDetail} = useTripStore()

    const budget = currentDashboard?.budget ?? null
    const symbol = '€'

    return (
        <View style={s.fullScreen}>
            <View style={[s.header, {paddingTop: insets.top + SPACING.sm}]}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                    <BackArrow color={COLORS.text}/>
                </TouchableOpacity>

                <View style={s.headerCenter}>
                    <Text style={s.headerLabel} numberOfLines={1}>{tripName}</Text>
                    <Text style={s.headerTitle}>Budget</Text>
                </View>

                <View style={s.headerRight}/>
            </View>

            {isLoadingDetail || !budget ? (
                <View style={s.loader}>
                    <ActivityIndicator size="large" color={COLORS.primary}/>
                </View>
            ) : (
                <ScrollView
                    style={s.scroll}
                    contentContainerStyle={[s.content, {paddingBottom: insets.bottom + TAB_BAR_HEIGHT + SPACING.lg}]}
                    showsVerticalScrollIndicator={false}
                >
                    <BudgetSection
                        tripId={tripId}
                        budget={budget}
                        forecast={forecastBudget}
                        countTravelers={currentDashboard?.countTravelers ?? 1}
                        symbol={symbol}
                    />
                </ScrollView>
            )}
        </View>
    )
}

const s = StyleSheet.create({
    fullScreen: {flex: 1, backgroundColor: '#f8fafc'},
    loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},

    header: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
        gap: SPACING.md,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'flex-start',
    },
    headerLabel: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(11),
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 1,
    },
    headerTitle: {
        fontFamily: FONTS.display,
        fontSize: fs(22),
        color: COLORS.text,
        letterSpacing: -0.3,
    },
    headerRight: {
        width: 38,
        flexShrink: 0,
    },

    scroll: {flex: 1},
    content: {
        padding: SPACING.md,
    },
})
