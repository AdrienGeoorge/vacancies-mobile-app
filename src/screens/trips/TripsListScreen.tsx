import React, {useCallback, useEffect, useState} from 'react'
import countries from 'i18n-iso-countries'
import countriesFr from 'i18n-iso-countries/langs/fr.json'
import countriesEn from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(countriesFr)
countries.registerLocale(countriesEn)
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import {useTranslation} from 'react-i18next'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useFocusEffect} from '@react-navigation/native'
import {NativeStackNavigationProp} from '@react-navigation/native-stack'
import {TripStackParamList} from '../../types/navigation'
import {useAuthStore} from '../../stores/authStore'
import {useTripStore} from '../../stores/tripStore'
import {TripListItem, TripState, getTripStateFromInt} from '../../types'
import {BASE_URL, BORDER_RADIUS, COLORS, FONTS, SPACING, fs} from '../../constants'
import {PlusIcon, GlobeIcon, CalendarIcon} from "../../utils/icons.tsx"

type Props = {
    navigation: NativeStackNavigationProp<TripStackParamList, 'TripsList'>
}

type FilterKey = 'all' | 'upcoming' | 'ongoing' | 'past'

const FILTERS: { key: FilterKey; label: string }[] = [
    {key: 'all', label: 'Tous'},
    {key: 'upcoming', label: 'À venir'},
    {key: 'ongoing', label: 'En cours'},
    {key: 'past', label: 'Passés'},
]

const STATE_CONFIG: Record<TripState, { label: string; bg: string; color: string }> = {
    ongoing: {label: 'En cours', bg: '#f1f5f9', color: '#334155'},
    upcoming: {label: 'À venir', bg: '#ccfbf1', color: '#0f766e'},
    unplanned: {label: 'Non planifié', bg: '#fef9c3', color: '#854d0e'},
    past: {label: 'Passé', bg: '#ffe4e6', color: '#be123c'},
}

const EmptyState = () => {
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyTitle}>Aucun voyage</Text>
            <Text style={styles.emptySubtitle}>Commence par créer ton premier voyage !</Text>
        </View>
    )
}

const TripCard = ({trip, onPress}: { trip: TripListItem; onPress: () => void }) => {
    const {i18n} = useTranslation()
    const state = getTripStateFromInt(trip.state)
    const config = STATE_CONFIG[state]
    const imageUri = trip.image ? `${BASE_URL}${trip.image}` : null

    const lang = i18n.language.split('-')[0]
    const countryNames = trip.countryCodes.map(code => countries.getName(code, lang) ?? code)
    const countryLabel = countryNames.length === 0
        ? null
        : countryNames.length === 1
            ? countryNames[0]
            : countryNames.slice(0, -1).join(', ') + ' et ' + countryNames[countryNames.length - 1]

    const formatDate = (d: string | null) => {
        if (!d) return null
        return new Date(d).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short', year: 'numeric'})
    }

    const dateLabel = trip.departureDate
        ? trip.returnDate
            ? `${formatDate(trip.departureDate)} → ${formatDate(trip.returnDate)}`
            : `Départ ${formatDate(trip.departureDate)}`
        : null

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
            <View style={styles.cardImageContainer}>
                {imageUri ? (
                    <Image source={{uri: imageUri}} style={styles.cardImage} resizeMode="cover"/>
                ) : (
                    <View style={styles.cardImagePlaceholder}>
                        <Text style={styles.cardImagePlaceholderEmoji}>🏔️</Text>
                    </View>
                )}
                <View style={[styles.stateBadge, {backgroundColor: config.bg}]}>
                    <Text style={[styles.stateBadgeText, {color: config.color}]}>{config.label}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.cardName} numberOfLines={1}>{trip.name}</Text>

                {countryLabel && (
                    <View style={styles.cardMeta}>
                        <GlobeIcon/>
                        <Text style={styles.cardMetaText} numberOfLines={1}>{countryLabel}</Text>
                    </View>
                )}

                {dateLabel && (
                    <View style={styles.cardMeta}>
                        <CalendarIcon/>
                        <Text style={styles.cardMetaText}>{dateLabel}</Text>
                    </View>
                )}

                {trip.description ? (
                    <Text style={styles.cardDescription} numberOfLines={2}>{trip.description}</Text>
                ) : null}
            </View>
        </TouchableOpacity>
    )
}

export default function TripsListScreen({navigation}: Props) {
    const insets = useSafeAreaInsets()
    const userId = useAuthStore(state => state.user?.id)
    const {trips, isLoadingList, listError} = useTripStore()
    const [filter, setFilter] = useState<FilterKey>('all')
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (!userId) return
        useTripStore.getState().fetchTrips(userId)
    }, [userId])

    useFocusEffect(useCallback(() => {
        const uid = useAuthStore.getState().user?.id
        if (uid) useTripStore.getState().fetchTrips(uid)
    }, []))

    const onRefresh = useCallback(async () => {
        if (!userId) return
        setRefreshing(true)
        await useTripStore.getState().fetchTrips(userId)
        setRefreshing(false)
    }, [userId])

    const filtered = trips.filter(trip => {
        if (filter === 'all') return true
        const state = getTripStateFromInt(trip.state)
        if (filter === 'upcoming') return state === 'upcoming' || state === 'unplanned'
        if (filter === 'ongoing') return state === 'ongoing'
        if (filter === 'past') return state === 'past'
        return true
    })

    return (
        <View style={[styles.root, {paddingTop: insets.top}]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mes voyages</Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('CreateEditTrip', {})}
                    activeOpacity={0.85}
                >
                    <PlusIcon/>
                </TouchableOpacity>
            </View>

            <View style={styles.filtersRow}>
                {FILTERS.map(f => (
                    <Pressable
                        key={f.key}
                        style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[styles.filterPillText, filter === f.key && styles.filterPillTextActive]}>
                            {f.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {listError ? (
                <View style={styles.loaderContainer}>
                    <Text style={styles.errorText}>{listError}</Text>
                    <TouchableOpacity style={styles.retryBtn}
                                      onPress={() => userId && useTripStore.getState().fetchTrips(userId)}>
                        <Text style={styles.retryBtnText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            ) : isLoadingList && trips.length === 0 ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary}/>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => String(item.id)}
                    renderItem={({item}) => (
                        <TripCard
                            trip={item}
                            onPress={() => navigation.navigate('TripDetail', {tripId: item.id})}
                        />
                    )}
                    ListEmptyComponent={<EmptyState/>}
                    contentContainerStyle={[
                        styles.listContent,
                        filtered.length === 0 && styles.listContentEmpty,
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                        />
                    }
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    root: {flex: 1, backgroundColor: '#f8fafc'},

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: '#f8fafc',
    },
    headerTitle: {
        fontFamily: FONTS.display,
        fontSize: fs(26),
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    filtersRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
        gap: SPACING.xs,
        marginBottom: SPACING.md,
    },
    filterPill: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    filterPillActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterPillText: {
        fontFamily: FONTS.medium,
        fontSize: fs(13),
        color: COLORS.textSecondary,
    },
    filterPillTextActive: {
        color: '#fff',
    },

    loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},

    listContent: {paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.md},
    listContentEmpty: {flex: 1},

    card: {
        backgroundColor: '#fff',
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    cardImageContainer: {
        height: 140,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardImagePlaceholderEmoji: {fontSize: 40},
    stateBadge: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
    },
    stateBadgeText: {
        fontFamily: FONTS.medium,
        fontSize: fs(11),
    },

    cardContent: {
        padding: SPACING.md,
        gap: SPACING.xs,
    },
    cardName: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(17),
        color: COLORS.text,
        letterSpacing: -0.3,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    cardMetaText: {
        fontFamily: FONTS.regular,
        fontSize: fs(13),
        color: COLORS.textSecondary,
        flex: 1,
    },
    cardDescription: {
        fontFamily: FONTS.regular,
        fontSize: fs(13),
        color: COLORS.textSecondary,
        lineHeight: fs(17),
        marginTop: 2,
    },

    errorText: {
        fontFamily: FONTS.regular,
        fontSize: fs(14),
        color: COLORS.danger,
        textAlign: 'center',
        marginBottom: SPACING.md
    },
    retryBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.full
    },
    retryBtnText: {fontFamily: FONTS.medium, fontSize: fs(14), color: '#fff'},

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        paddingHorizontal: SPACING.xl,
    },
    emptyEmoji: {fontSize: 56},
    emptyTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(20),
        color: COLORS.text,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontFamily: FONTS.regular,
        fontSize: fs(15),
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: fs(22),
    },
})
