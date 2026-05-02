import React, {useEffect, useRef, useState} from 'react'
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Animated
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {NativeStackNavigationProp} from '@react-navigation/native-stack'
import {RouteProp} from '@react-navigation/native'
import {TripStackParamList} from '../../types/navigation'
import {useTripStore} from '../../stores/tripStore'
import {
    Accommodation,
    Activity, OnSiteExpense,
    PlanningEvent,
    Transport,
    VariousExpense,
} from '../../types'
import BudgetSection from './BudgetSection'
import {BASE_URL, BORDER_RADIUS, COLORS, FONTS, SPACING, fs} from '../../constants'
import {BackArrow, EditIcon} from "../../utils/icons.tsx"

type Props = {
    navigation: NativeStackNavigationProp<TripStackParamList, 'TripDetail'>
    route: RouteProp<TripStackParamList, 'TripDetail'>
}

const HEADER_HEIGHT = 280

type SectionKey = 'overview' | 'calendar' | 'accommodations' | 'transports' | 'activities' | 'expenses' | 'onSite'

const SECTIONS: { key: SectionKey; label: string }[] = [
    {key: 'overview', label: 'Tableau de bord'},
    {key: 'calendar', label: 'Planning'},
    {key: 'accommodations', label: 'Hébergements'},
    {key: 'transports', label: 'Transports',},
    {key: 'activities', label: 'Activités'},
    {key: 'expenses', label: 'Dépenses diverses'},
    {key: 'onSite', label: 'Dépenses sur place'}
]

const formatDate = (d: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})
}

const AccommodationsSection = ({items, symbol}: { items: Accommodation[]; symbol: string }) => {
    if (items.length === 0) return (
        <View style={s.emptySection}>
            <Text style={s.emptySectionText}>Aucun hébergement ajouté</Text>
        </View>
    )
    return (
        <View style={s.section}>
            {items.map(item => (
                <View key={item.id} style={s.expenseCard}>
                    <View style={s.expenseCardLeft}>
                        <Text style={s.expenseCardEmoji}>🏨</Text>
                    </View>
                    <View style={s.expenseCardContent}>
                        <Text style={s.expenseCardName}>{item.name}</Text>
                        {item.city &&
                            <Text style={s.expenseCardSub}>{item.city}{item.country ? `, ${item.country}` : ''}</Text>}
                        <Text
                            style={s.expenseCardSub}>{formatDate(item.arrivalDate)} → {formatDate(item.departureDate)}</Text>
                    </View>
                    <View style={s.expenseCardRight}>
                        <Text style={s.expenseCardAmount}>{item.price.toFixed(2)}</Text>
                        <Text style={s.expenseCardCurrency}>{symbol}</Text>
                        <View style={[s.bookedBadge, {backgroundColor: item.booked ? '#dcfce7' : '#fef9c3'}]}>
                            <Text style={[s.bookedBadgeText, {color: item.booked ? '#166534' : '#854d0e'}]}>
                                {item.booked ? 'Réservé' : 'À réserver'}
                            </Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    )
}

const TRANSPORT_EMOJIS: Record<string, string> = {
    'Avion': '✈️', 'Train': '🚆', 'Voiture': '🚗', 'Bus': '🚌',
    'Transports en commun': '🚇', 'Autre': '🚀',
}

const TransportsSection = ({items, symbol}: { items: Transport[]; symbol: string }) => {
    if (items.length === 0) return (
        <View style={s.emptySection}>
            <Text style={s.emptySectionText}>Aucun transport ajouté</Text>
        </View>
    )
    return (
        <View style={s.section}>
            {items.map(item => {
                const emoji = item.type ? (TRANSPORT_EMOJIS[item.type.name] ?? '🚌') : '🚌'
                return (
                    <View key={item.id} style={s.expenseCard}>
                        <View style={s.expenseCardLeft}>
                            <Text style={s.expenseCardEmoji}>{emoji}</Text>
                        </View>
                        <View style={s.expenseCardContent}>
                            <Text style={s.expenseCardName}>
                                {item.departure && item.destination
                                    ? `${item.departure} → ${item.destination}`
                                    : item.type?.name ?? 'Transport'}
                            </Text>
                            {item.company && <Text style={s.expenseCardSub}>{item.company}</Text>}
                            {item.departureDate &&
                                <Text style={s.expenseCardSub}>{formatDate(item.departureDate)}</Text>}
                        </View>
                        <View style={s.expenseCardRight}>
                            <Text style={s.expenseCardAmount}>{item.price.toFixed(2)}</Text>
                            <Text style={s.expenseCardCurrency}>{symbol}</Text>
                        </View>
                    </View>
                )
            })}
        </View>
    )
}

const ActivitiesSection = ({items, symbol}: { items: Activity[]; symbol: string }) => {
    if (items.length === 0) return (
        <View style={s.emptySection}>
            <Text style={s.emptySectionText}>Aucune activité ajoutée</Text>
        </View>
    )
    return (
        <View style={s.section}>
            {items.map(item => (
                <View key={item.id} style={s.expenseCard}>
                    <View style={s.expenseCardLeft}>
                        <Text style={s.expenseCardEmoji}>🎯</Text>
                    </View>
                    <View style={s.expenseCardContent}>
                        <Text style={s.expenseCardName}>{item.name}</Text>
                        {item.activityType && <Text style={s.expenseCardSub}>{item.activityType.name}</Text>}
                        {item.date && <Text style={s.expenseCardSub}>{formatDate(item.date)}</Text>}
                    </View>
                    <View style={s.expenseCardRight}>
                        <Text style={s.expenseCardAmount}>{item.price.toFixed(2)}</Text>
                        <Text style={s.expenseCardCurrency}>{symbol}</Text>
                        {item.perPerson && <Text style={s.perPersonBadge}>/ pers.</Text>}
                    </View>
                </View>
            ))}
        </View>
    )
}

const ExpensesSection = ({items, symbol}: { items: VariousExpense[]; symbol: string }) => {
    if (items.length === 0) return (
        <View style={s.emptySection}>
            <Text style={s.emptySectionText}>Aucune dépense ajoutée</Text>
        </View>
    )
    return (
        <View style={s.section}>
            {items.map(item => (
                <View key={item.id} style={s.expenseCard}>
                    <View style={s.expenseCardLeft}>
                        <Text style={s.expenseCardEmoji}>💸</Text>
                    </View>
                    <View style={s.expenseCardContent}>
                        <Text style={s.expenseCardName}>{item.name}</Text>
                        {item.category && <Text style={s.expenseCardSub}>{item.category}</Text>}
                        <Text style={s.expenseCardSub}>{formatDate(item.date)}</Text>
                    </View>
                    <View style={s.expenseCardRight}>
                        <Text style={s.expenseCardAmount}>{item.price.toFixed(2)}</Text>
                        <Text style={s.expenseCardCurrency}>{symbol}</Text>
                    </View>
                </View>
            ))}
        </View>
    )
}

const OnSiteSection = ({items, symbol}: { items: OnSiteExpense[]; symbol: string }) => {
    if (items.length === 0) return (
        <View style={s.emptySection}>
            <Text style={s.emptySectionText}>Aucune dépense ajoutée</Text>
        </View>
    )
    return (
        <View style={s.section}>
            {items.map(item => (
                <View key={item.id} style={s.expenseCard}>
                    <View style={s.expenseCardLeft}>
                        <Text style={s.expenseCardEmoji}>💸</Text>
                    </View>
                    <View style={s.expenseCardContent}>
                        <Text style={s.expenseCardName}>{item.name}</Text>
                        <Text style={s.expenseCardSub}>{formatDate(item.purchaseDate)}</Text>
                    </View>
                    <View style={s.expenseCardRight}>
                        <Text style={s.expenseCardAmount}>{item.price.toFixed(2)}</Text>
                        <Text style={s.expenseCardCurrency}>{symbol}</Text>
                    </View>
                </View>
            ))}
        </View>
    )
}

const CalendarSection = ({events}: { events: PlanningEvent[] }) => {
    const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    if (sorted.length === 0) return (
        <View style={s.emptySection}>
            <Text style={s.emptySectionText}>Aucun événement planifié</Text>
        </View>
    )

    return (
        <View style={s.section}>
            {sorted.map(event => {
                const start = new Date(event.start)
                const end = new Date(event.end)
                const sameDay = start.toDateString() === end.toDateString()
                return (
                    <View key={event.id} style={s.calEventCard}>
                        <View style={s.calEventDate}>
                            <Text style={s.calEventDay}>{start.getDate()}</Text>
                            <Text style={s.calEventMonth}>
                                {start.toLocaleDateString('fr-FR', {month: 'short'})}
                            </Text>
                        </View>
                        <View style={s.calEventContent}>
                            <Text style={s.calEventTitle}>{event.title}</Text>
                            <Text style={s.calEventTime}>
                                {start.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                                {!sameDay && ` → ${formatDate(event.end)}`}
                            </Text>
                            {event.description ? (
                                <Text style={s.calEventDesc} numberOfLines={2}>{event.description}</Text>
                            ) : null}
                        </View>
                    </View>
                )
            })}
        </View>
    )
}

export default function TripDetailScreen({navigation, route}: Props) {
    const {tripId} = route.params
    const insets = useSafeAreaInsets()
    const {
        currentTrip,
        currentDashboard,
        forecastBudget,
        isLoadingDetail,
        fetchTripDetail,
        clearCurrentTrip
    } = useTripStore()
    const [activeSection, setActiveSection] = useState<SectionKey>('overview')
    const [navBarHeight, setNavBarHeight] = useState(0)
    const [stickyTabVisible, setStickyTabVisible] = useState(false)
    const scrollY = useRef(new Animated.Value(0)).current
    const sectionsScrollRef = useRef<ScrollView>(null)

    const TABS_THRESHOLD = HEADER_HEIGHT - 25
    const naturalTabOpacity = scrollY.interpolate({
        inputRange: [TABS_THRESHOLD - 20, TABS_THRESHOLD],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    })
    const stickyTabOpacity = scrollY.interpolate({
        inputRange: [TABS_THRESHOLD - 20, TABS_THRESHOLD],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    })

    useEffect(() => {
        fetchTripDetail(tripId)
        return () => clearCurrentTrip()
    }, [clearCurrentTrip, fetchTripDetail, tripId])

    if (isLoadingDetail || !currentTrip) {
        return (
            <View style={s.loader}>
                <ActivityIndicator size="large" color={COLORS.primary}/>
            </View>
        )
    }

    const {trip, countDaysBeforeOrAfter} = currentTrip
    const {budget} = currentDashboard ?? {budget: null, planning: null}
    const symbol = trip.currency?.symbol ?? '€'

    const imageUri = trip.image ? `${BASE_URL}${trip.image}` : null

    const countries = trip.destinations
        ?.slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(d => d.country?.name)
        .filter(Boolean) ?? []

    const countryLabel = countries.length === 0
        ? null
        : countries.slice(0, -1).join(', ') + (countries.length > 1 ? ' et ' : '') + countries[countries.length - 1]

    const headerOpacity = scrollY.interpolate({
        inputRange: [HEADER_HEIGHT - 120, HEADER_HEIGHT - 80],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    })

    const daysLabel = countDaysBeforeOrAfter === false
        ? null
        : countDaysBeforeOrAfter === 'ongoing'
            ? 'C\'est le moment : bon voyage !'
            : !countDaysBeforeOrAfter.before
                ? `Départ dans ${countDaysBeforeOrAfter.days} jour${countDaysBeforeOrAfter.days > 1 ? 's' : ''}`
                : `Rentré il y a ${countDaysBeforeOrAfter.days} jour${countDaysBeforeOrAfter.days > 1 ? 's' : ''}`

    return (
        <View style={s.root}>
            <Animated.View
                style={[s.navBar, {paddingTop: insets.top, opacity: headerOpacity}]}
                onLayout={e => setNavBarHeight(e.nativeEvent.layout.height)}
            >
                <View style={s.navTitleRow}>
                    <TouchableOpacity style={s.navBackBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                        <BackArrow/>
                    </TouchableOpacity>
                    <Text style={s.navTitle} numberOfLines={1}>{trip.name}</Text>
                    <TouchableOpacity style={s.navEditBtn}
                                      onPress={() => navigation.navigate('CreateEditTrip', {tripId})}
                                      activeOpacity={0.8}>
                        <EditIcon/>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <Animated.View style={[s.stickyTabBar, {top: navBarHeight, opacity: stickyTabOpacity}]}
                           pointerEvents={stickyTabVisible ? 'auto' : 'none'}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsContent}>
                    {SECTIONS.map(sec => (
                        <TouchableOpacity
                            key={sec.key}
                            style={[s.tab, activeSection === sec.key && s.tabActive]}
                            onPress={() => setActiveSection(sec.key)}
                            activeOpacity={0.8}
                        >
                            <Text style={[s.tabLabel, activeSection === sec.key && s.tabLabelActive]}>
                                {sec.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>

            <Animated.View
                style={[
                    s.floatingButtons,
                    {
                        top: insets.top + SPACING.sm,
                        opacity: scrollY.interpolate({
                            inputRange: [HEADER_HEIGHT - 120, HEADER_HEIGHT - 80],
                            outputRange: [1, 0],
                            extrapolate: 'clamp',
                        }),
                    },
                ]}
                pointerEvents="auto">
                <TouchableOpacity style={s.floatingBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                    <BackArrow/>
                </TouchableOpacity>
                <TouchableOpacity style={s.floatingBtn} onPress={() => navigation.navigate('CreateEditTrip', {tripId})}
                                  activeOpacity={0.8}>
                    <EditIcon/>
                </TouchableOpacity>
            </Animated.View>

            <Animated.ScrollView
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: scrollY}}}],
                    {
                        useNativeDriver: true,
                        listener: (e: any) => {
                            const y = e.nativeEvent.contentOffset.y
                            setStickyTabVisible(y >= TABS_THRESHOLD - 20)
                        },
                    }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                <View style={s.coverContainer}>
                    {imageUri ? (
                        <Image source={{uri: imageUri}} style={s.cover} resizeMode="cover"/>
                    ) : (
                        <View style={[s.cover, s.coverPlaceholder]}>
                            <Text style={s.coverPlaceholderEmoji}>🏔️</Text>
                        </View>
                    )}
                    <View style={s.coverGradient}/>
                    <View style={s.coverInfo}>
                        {daysLabel && (
                            <View style={s.daysBadge}>
                                <Text style={s.daysBadgeText}>{daysLabel}</Text>
                            </View>
                        )}
                        <Text style={s.coverTitle}>{trip.name}</Text>
                        {countryLabel && <Text style={s.coverCountries}>{countryLabel}</Text>}
                    </View>
                </View>

                <View style={s.metaRow}>
                    {trip.departureDate && (
                        <View style={s.metaItem}>
                            <Text style={s.metaLabel}>Départ</Text>
                            <Text style={s.metaValue}>{formatDate(trip.departureDate)}</Text>
                        </View>
                    )}
                    {trip.returnDate && (
                        <View style={[s.metaItem, s.metaItemBordered]}>
                            <Text style={s.metaLabel}>Retour</Text>
                            <Text style={s.metaValue}>{formatDate(trip.returnDate)}</Text>
                        </View>
                    )}
                    <View style={s.metaItem}>
                        <Text style={s.metaLabel}>Voyageurs</Text>
                        <Text style={s.metaValue}>{(trip.tripTravelers?.length ?? 0) + 1}</Text>
                    </View>
                </View>

                <Animated.View style={[s.tabsScroll, {opacity: naturalTabOpacity}]}>
                    <ScrollView
                        ref={sectionsScrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.tabsContent}
                    >
                        {SECTIONS.map(sec => (
                            <TouchableOpacity
                                key={sec.key}
                                style={[s.tab, activeSection === sec.key && s.tabActive]}
                                onPress={() => setActiveSection(sec.key)}
                                activeOpacity={0.8}
                            >
                                <Text style={[s.tabLabel, activeSection === sec.key && s.tabLabelActive]}>
                                    {sec.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                <View style={[s.content, {paddingBottom: insets.bottom}]}>
                    {activeSection === 'overview' && (
                        <>
                            {trip.description ? (
                                <View style={s.descriptionSection}>
                                    <Text style={s.descriptionTitle}>Description</Text>
                                    <Text style={s.descriptionText}>{trip.description}</Text>
                                </View>
                            ) : null}
                            {budget && (
                                <BudgetSection
                                    tripId={tripId}
                                    budget={budget}
                                    forecast={forecastBudget}
                                    countTravelers={currentDashboard?.countTravelers ?? 1}
                                    symbol={symbol}
                                />
                            )}
                        </>
                    )}
                    {activeSection === 'accommodations' && (
                        <AccommodationsSection items={trip.accommodations ?? []} symbol={symbol}/>
                    )}
                    {activeSection === 'transports' && (
                        <TransportsSection items={trip.transports ?? []} symbol={symbol}/>
                    )}
                    {activeSection === 'activities' && (
                        <ActivitiesSection items={trip.activities ?? []} symbol={symbol}/>
                    )}
                    {activeSection === 'expenses' && (
                        <ExpensesSection items={trip.variousExpensives ?? []} symbol={symbol}/>
                    )}
                    {activeSection === 'onSite' && (
                        <OnSiteSection items={trip.onSiteExpenses ?? []} symbol={symbol}/>
                    )}
                    {activeSection === 'calendar' && (
                        <CalendarSection events={trip.planningEvents ?? []}/>
                    )}
                </View>
            </Animated.ScrollView>
        </View>
    )
}

const s = StyleSheet.create({
    root: {flex: 1, backgroundColor: '#f8fafc'},
    loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},

    navBar: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        backgroundColor: COLORS.primaryDark,
    },
    navTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    navBackBtn: {padding: SPACING.xs},
    navTitle: {
        flex: 1,
        fontFamily: FONTS.semiBold,
        fontSize: fs(16),
        color: '#fff',
        letterSpacing: -0.2,
    },
    navEditBtn: {padding: SPACING.xs},

    stickyTabBar: {
        position: 'absolute',
        left: 0, right: 0,
        zIndex: 99,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 4,
    },

    floatingButtons: {
        position: 'absolute',
        left: SPACING.md,
        right: SPACING.md,
        zIndex: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    floatingBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    coverContainer: {height: HEADER_HEIGHT, position: 'relative'},
    cover: {width: '100%', height: '100%'},
    coverPlaceholder: {backgroundColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center'},
    coverPlaceholderEmoji: {fontSize: 64},
    coverGradient: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    coverInfo: {
        position: 'absolute',
        bottom: SPACING.md,
        left: SPACING.md,
        right: SPACING.md,
    },
    daysBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: 11,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        marginBottom: SPACING.md
    },
    daysBadgeText: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(10.5),
        color: '#fff',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    coverTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(25),
        lineHeight: fs(28),
        color: '#fff',
        letterSpacing: -1,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: {width: 0, height: 1},
        textShadowRadius: 4,
    },
    coverCountries: {
        fontFamily: FONTS.regular,
        fontSize: fs(15),
        color: 'rgba(255,255,255,0.85)',
        marginTop: 1.5,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: {width: 0, height: 1},
        textShadowRadius: 3,
    },

    metaRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    metaItem: {flex: 1, alignItems: 'center'},
    metaItemBordered: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.border,
    },
    metaLabel: {
        fontFamily: FONTS.regular,
        fontSize: fs(11.5),
        color: COLORS.textSecondary,
        marginBottom: 2,
        textTransform: 'uppercase'
    },
    metaValue: {fontFamily: FONTS.semiBold, fontSize: fs(14), color: COLORS.text},

    tabsScroll: {backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border},
    tabsContent: {paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.xs},
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.surface,
    },
    tabActive: {backgroundColor: COLORS.primary},
    tabLabel: {fontFamily: FONTS.medium, fontSize: fs(13), color: COLORS.textSecondary},
    tabLabelActive: {color: '#fff'},

    content: {paddingTop: SPACING.md},

    section: {
        marginBottom: SPACING.md,
        backgroundColor: '#fff',
        padding: SPACING.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
    },
    sectionTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(15),
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },

    descriptionSection: {
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    descriptionTitle: {
        textTransform: 'uppercase',
        fontFamily: FONTS.semiBold,
        marginBottom: SPACING.xs,
        color: COLORS.textSecondary,
    },
    descriptionText: {
        fontFamily: FONTS.regular,
        fontSize: fs(14),
        lineHeight: fs(19),
    },

    eventRow: {flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, paddingVertical: 4},
    eventDot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: COLORS.primary, marginTop: 5,
    },
    eventContent: {flex: 1},
    eventTitle: {fontFamily: FONTS.medium, fontSize: fs(14), color: COLORS.text},
    eventDate: {fontFamily: FONTS.regular, fontSize: fs(12), color: COLORS.textSecondary},

    emptySection: {
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        padding: SPACING.lg,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptySectionText: {fontFamily: FONTS.regular, fontSize: fs(14), color: COLORS.textSecondary},

    expenseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: SPACING.sm,
    },
    expenseCardLeft: {
        width: 40, height: 40,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    expenseCardEmoji: {fontSize: 20},
    expenseCardContent: {flex: 1},
    expenseCardName: {fontFamily: FONTS.medium, fontSize: fs(14), color: COLORS.text},
    expenseCardSub: {fontFamily: FONTS.regular, fontSize: fs(12), color: COLORS.textSecondary},
    expenseCardRight: {alignItems: 'flex-end', gap: 2},
    expenseCardAmount: {fontFamily: FONTS.semiBold, fontSize: fs(15), color: COLORS.text},
    expenseCardCurrency: {fontFamily: FONTS.regular, fontSize: fs(12), color: COLORS.textSecondary},
    bookedBadge: {paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full},
    bookedBadgeText: {fontFamily: FONTS.medium, fontSize: fs(10)},
    perPersonBadge: {fontFamily: FONTS.regular, fontSize: fs(11), color: COLORS.textSecondary},

    calEventCard: {
        flexDirection: 'row',
        gap: SPACING.md,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    calEventDate: {
        width: 44, alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.xs,
    },
    calEventDay: {fontFamily: FONTS.semiBold, fontSize: fs(18), color: COLORS.primary},
    calEventMonth: {fontFamily: FONTS.regular, fontSize: fs(11), color: COLORS.primary},
    calEventContent: {flex: 1},
    calEventTitle: {fontFamily: FONTS.medium, fontSize: fs(14), color: COLORS.text},
    calEventTime: {fontFamily: FONTS.regular, fontSize: fs(12), color: COLORS.textSecondary},
    calEventDesc: {fontFamily: FONTS.regular, fontSize: fs(12), color: COLORS.textSecondary, marginTop: 2},
})
