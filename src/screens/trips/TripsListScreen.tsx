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
import {TripListItem, getTripStateFromInt} from '../../types'
import {BASE_URL, BORDER_RADIUS, COLORS, FONTS, SPACING, fs} from '../../constants'
import {MapPinIcon, PlusIcon} from '../../utils/icons.tsx'
import LinearGradient from 'react-native-linear-gradient'

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

const PLACEHOLDER_GRADIENTS: [string, string][] = [
    ['#c2783a', '#5a2a0a'],
    ['#8e4a8a', '#3a1040'],
    ['#3a6ec2', '#0e2060'],
    ['#2aaa6a', '#0a4025'],
    ['#c23a4a', '#5a0a18'],
]

const daysUntil = (dateStr: string | null): number | null => {
    if (!dateStr) return null
    const diff = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const formatCompactDate = (d: string, withYear: boolean) =>
    new Date(d).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short', ...(withYear ? {year: 'numeric'} : {})})

const formatDateLabel = (dep: string | null, ret: string | null): string => {
    if (!dep) return 'Dates non définies'
    if (!ret) return formatCompactDate(dep, true)
    const depYear = new Date(dep).getFullYear()
    const retYear = new Date(ret).getFullYear()
    if (depYear === retYear) {
        return `${formatCompactDate(dep, false)} — ${formatCompactDate(ret, true)}`
    }
    return `${formatCompactDate(dep, true)} — ${formatCompactDate(ret, true)}`
}

const dayOfTrip = (departureDate: string | null, returnDate: string | null): {
    current: number;
    total: number
} | null => {
    if (!departureDate || !returnDate) return null
    const dep = new Date(departureDate).setHours(0, 0, 0, 0)
    const ret = new Date(returnDate).setHours(0, 0, 0, 0)
    const now = new Date().setHours(0, 0, 0, 0)
    const total = Math.round((ret - dep) / (1000 * 60 * 60 * 24))
    const current = Math.min(Math.ceil((now - dep) / (1000 * 60 * 60 * 24)) + 1, total)
    return {current: Math.max(current, 1), total}
}

const FeaturedTripCard = ({trip, onPress, lang}: { trip: TripListItem; onPress: () => void; lang: string }) => {
    const state = getTripStateFromInt(trip.state)
    const imageUri = trip.image ? `${BASE_URL}${trip.image}` : null

    const countryNames = trip.countryCodes.map(code => countries.getName(code, lang) ?? code)
    const countryLabel = countryNames.length === 0
        ? null
        : countryNames.length === 1
            ? countryNames[0]
            : countryNames.slice(0, -1).join(', ') + ' et ' + countryNames[countryNames.length - 1]

    const dateLabel = formatDateLabel(trip.departureDate, trip.returnDate)

    const dayInfo = state === 'ongoing' ? dayOfTrip(trip.departureDate, trip.returnDate) : null
    const daysAgo = state === 'past' ? Math.abs(daysUntil(trip.returnDate) ?? 0) : null
    const daysLeft = state === 'upcoming' ? daysUntil(trip.departureDate) : null

    const badgeLabel = state === 'ongoing'
        ? dayInfo ? `EN COURS · JOUR ${dayInfo.current} / ${dayInfo.total}` : 'EN COURS'
        : state === 'upcoming'
            ? daysLeft !== null ? `À VENIR · DANS ${daysLeft} JOUR${daysLeft > 1 ? 'S' : ''}` : 'À VENIR'
            : state === 'past'
                ? daysAgo !== null ? `PASSÉ · IL Y A ${daysAgo} JOUR${daysAgo > 1 ? 'S' : ''}` : 'PASSÉ'
                : 'NON PLANIFIÉ'

    return (
        <TouchableOpacity style={s.featured} onPress={onPress} activeOpacity={0.88}>
            <View style={s.featuredDark}>
                {imageUri && <Image source={{uri: imageUri}} style={s.featuredBg} resizeMode="cover"/>}
                <View style={s.featuredOverlay}/>
                <View style={s.featuredInner}>
                    <View style={s.featuredBadge}>
                        <Text style={s.featuredBadgeText}>{badgeLabel}</Text>
                    </View>
                    <View style={s.featuredBody}>
                        <Text style={s.featuredMonthYear}>{dateLabel}</Text>
                        <Text style={s.featuredName}>{trip.name}</Text>
                    </View>
                </View>
            </View>

            <View style={s.featuredWhiteBar}>
                {countryLabel && (
                    <View style={s.featuredMeta}>
                        <MapPinIcon/>
                        <Text style={s.featuredWhiteBarText} numberOfLines={1}>{countryLabel}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}

const CompactTripCard = ({trip, onPress, lang}: { trip: TripListItem; onPress: () => void; lang: string }) => {
    const state = getTripStateFromInt(trip.state)
    const imageUri = trip.image ? `${BASE_URL}${trip.image}` : null
    const placeholderGradient = PLACEHOLDER_GRADIENTS[trip.id % PLACEHOLDER_GRADIENTS.length]

    const countryNames = trip.countryCodes.map(code => countries.getName(code, lang) ?? code)
    const countryLabel = countryNames.length === 0
        ? null
        : countryNames.length === 1
            ? countryNames[0]
            : countryNames.slice(0, -1).join(', ') + ' et ' + countryNames[countryNames.length - 1]

    const dateLabel = formatDateLabel(trip.departureDate, trip.returnDate)

    const dayInfo = state === 'ongoing' ? dayOfTrip(trip.departureDate, trip.returnDate) : null
    const rightLabel = state === 'past'
        ? 'Terminé'
        : state === 'ongoing'
            ? dayInfo ? `Jour ${dayInfo.current} / ${dayInfo.total}` : null
            : state === 'upcoming'
                ? (() => {
                    const d = daysUntil(trip.departureDate);
                    return d !== null ? `Dans ${d} jour${d > 1 ? 's' : ''}` : null
                })()
                : null

    const badgeConfig = state === 'ongoing'
        ? {label: 'EN COURS', bg: '#F1F5F9', color: '#4B5669'}
        : state === 'upcoming'
            ? {label: 'À VENIR', bg: '#E9F4F2', color: '#0f766e'}
            : state === 'unplanned'
                ? {label: 'NON PLANIFIÉ', bg: '#fbf3ca', color: '#76680f'}
                : {label: 'PASSÉ', bg: '#f4e9e9', color: '#760f0f'}

    return (
        <TouchableOpacity style={s.compact} onPress={onPress} activeOpacity={0.88}>
            <View style={s.compactThumb}>
                {imageUri ? (
                    <Image source={{uri: imageUri}} style={s.compactThumbImg} resizeMode="cover"/>
                ) : (
                    <LinearGradient
                        colors={placeholderGradient}
                        start={{x: 0.5, y: 0}}
                        end={{x: 0.5, y: 1}}
                        style={s.compactThumbImg}
                    />
                )}
            </View>

            <View style={s.compactContent}>
                <View style={s.compactContentTop}>
                    <Text style={s.compactName} numberOfLines={1}>{trip.name}</Text>
                    {countryLabel ? <Text style={s.compactMeta} numberOfLines={1}>{countryLabel}</Text> : null}
                    {dateLabel ? <Text style={s.compactMeta} numberOfLines={1}>{dateLabel}</Text> : null}
                </View>
                {trip.description && (
                    <Text numberOfLines={2} style={s.compactDescription}>{trip.description}</Text>
                )}
                <View style={s.compactFooter}>
                    <View style={[s.compactBadge, {backgroundColor: badgeConfig.bg}]}>
                        <Text style={[s.compactBadgeText, {color: badgeConfig.color}]}>{badgeConfig.label}</Text>
                    </View>
                    {rightLabel && <Text style={s.compactRight}>{rightLabel}</Text>}
                </View>
            </View>
        </TouchableOpacity>
    )
}

const TripCard = ({trip, onPress, lang, featured}: {
    trip: TripListItem;
    onPress: () => void;
    lang: string;
    featured: boolean
}) => {
    if (featured) {
        return <FeaturedTripCard trip={trip} onPress={onPress} lang={lang}/>
    }
    return <CompactTripCard trip={trip} onPress={onPress} lang={lang}/>
}

const EmptyState = () => (
    <View style={s.emptyContainer}>
        <Text style={s.emptyEmoji}>🗺️</Text>
        <Text style={s.emptyTitle}>Aucun voyage</Text>
        <Text style={s.emptySubtitle}>Commence par créer ton premier voyage !</Text>
    </View>
)

export default function TripsListScreen({navigation}: Props) {
    const insets = useSafeAreaInsets()
    const {i18n} = useTranslation()
    const lang = i18n.language.split('-')[0]
    const user = useAuthStore(state => state.user)
    const {trips, isLoadingList, listError} = useTripStore()
    const [filter, setFilter] = useState<FilterKey>('all')
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (!user?.id) return
        useTripStore.getState().fetchTrips(user.id)
    }, [user])

    useFocusEffect(useCallback(() => {
        const uid = useAuthStore.getState().user?.id
        if (uid) useTripStore.getState().fetchTrips(uid)
    }, []))

    const onRefresh = useCallback(async () => {
        if (!user?.id) return
        setRefreshing(true)
        await useTripStore.getState().fetchTrips(user.id)
        setRefreshing(false)
    }, [user])

    const filtered = trips.filter(trip => {
        if (filter === 'all') return true
        const state = getTripStateFromInt(trip.state)
        if (filter === 'upcoming') return state === 'upcoming' || state === 'unplanned'
        if (filter === 'ongoing') return state === 'ongoing'
        if (filter === 'past') return state === 'past'
        return true
    })

    return (
        <View style={[s.root, {paddingTop: insets.top}]}>
            <View style={s.header}>
                <View>
                    <Text style={s.nameTitle}>Bonjour {user?.firstname ?? ''}</Text>
                    <Text style={s.headerTitle}>Mes voyages</Text>
                </View>
                <TouchableOpacity
                    style={s.addBtn}
                    onPress={() => navigation.navigate('CreateEditTrip', {})}
                    activeOpacity={0.85}
                >
                    <PlusIcon/>
                </TouchableOpacity>
            </View>

            <View style={s.filtersRow}>
                {FILTERS.map(f => (
                    <Pressable
                        key={f.key}
                        style={[s.filterPill, filter === f.key && s.filterPillActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[s.filterPillText, filter === f.key && s.filterPillTextActive]}>
                            {f.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {listError ? (
                <View style={s.loaderContainer}>
                    <Text style={s.errorText}>{listError}</Text>
                    <TouchableOpacity style={s.retryBtn}
                                      onPress={() => user?.id && useTripStore.getState().fetchTrips(user.id)}>
                        <Text style={s.retryBtnText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            ) : isLoadingList && trips.length === 0 ? (
                <View style={s.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary}/>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => String(item.id)}
                    renderItem={({item, index}) => (
                        <TripCard
                            trip={item}
                            lang={lang}
                            featured={filter === 'all' && index === 0}
                            onPress={() => navigation.navigate('TripDetail', {tripId: item.id})}
                        />
                    )}
                    ListEmptyComponent={<EmptyState/>}
                    contentContainerStyle={[
                        s.listContent,
                        filtered.length === 0 && s.listContentEmpty,
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

const s = StyleSheet.create({
    root: {flex: 1, backgroundColor: '#f8fafc'},

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    nameTitle: {
        fontFamily: FONTS.regular,
        fontSize: fs(14),
        color: COLORS.textSecondary,
    },
    headerTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(26),
        color: COLORS.text,
        letterSpacing: -1,
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
        gap: SPACING.base,
        marginBottom: SPACING.sm,
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
    filterPillTextActive: {color: '#fff'},

    loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    listContent: {paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl},
    listContentEmpty: {flex: 1},

    featured: {
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.md,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    featuredDark: {
        height: 170,
        backgroundColor: '#0d1f30',
        position: 'relative',
    },
    featuredBg: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },
    featuredOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(10,25,45,0.72)',
    },
    featuredInner: {
        flex: 1,
        padding: SPACING.md,
        justifyContent: 'space-between',
    },
    featuredBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    featuredBadgeText: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(11),
        color: '#fff',
        letterSpacing: 0.5,
    },
    featuredBody: {gap: 4},
    featuredMonthYear: {
        fontFamily: FONTS.medium,
        fontSize: fs(12),
        color: 'rgba(255,255,255,0.6)',
    },
    featuredName: {
        fontFamily: FONTS.display,
        fontSize: fs(24),
        color: '#fff',
        letterSpacing: -0.5,
        lineHeight: fs(29),
    },
    featuredWhiteBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 4,
        gap: SPACING.xs,
    },
    featuredMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        flex: 1,
    },
    featuredWhiteBarText: {
        fontFamily: FONTS.medium,
        fontSize: fs(13),
        color: COLORS.textSecondary,
        flex: 1,
    },

    compact: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
        marginBottom: SPACING.sm,
    },
    compactThumb: {
        width: 90,
        alignSelf: 'stretch',
        flexShrink: 0,
        margin: SPACING.sm + 3,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        flexDirection: 'column',
    },
    compactThumbImg: {
        flex: 1,
        width: '100%',
        minHeight: 90,
    },
    compactContent: {
        flex: 1,
        paddingLeft: SPACING.xs,
        paddingRight: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        gap: 3,
    },
    compactContentTop: {flexDirection: 'column', gap: 0},
    compactName: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(15),
        color: COLORS.text,
        letterSpacing: -0.2,
    },
    compactDescription: {
        marginVertical: 10,
        lineHeight: fs(13),
    },
    compactMeta: {
        fontFamily: FONTS.regular,
        fontSize: fs(12),
        color: COLORS.textSecondary,
    },
    compactFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    compactBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.sm,
    },
    compactBadgeText: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(10),
        letterSpacing: 0.3,
    },
    compactRight: {
        fontFamily: FONTS.medium,
        fontSize: fs(12),
        color: COLORS.textSecondary,
    },

    errorText: {
        fontFamily: FONTS.regular,
        fontSize: fs(14),
        color: COLORS.danger,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    retryBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.full,
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
