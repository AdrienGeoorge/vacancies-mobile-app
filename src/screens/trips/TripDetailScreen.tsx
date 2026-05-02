import React, {useEffect, useRef, useState} from 'react'
import {
    ActivityIndicator,
    Animated,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {NativeStackNavigationProp} from '@react-navigation/native-stack'
import {RouteProp} from '@react-navigation/native'
import {TripStackParamList} from '../../types/navigation'
import {useTripStore} from '../../stores/tripStore'
import {BudgetCategoryKey, ChecklistItem, TripBudget, TripDestination} from '../../types'
import {BASE_URL, BORDER_RADIUS, COLORS, FONTS, SPACING, fs} from '../../constants'
import {BackArrow} from "../../utils/icons.tsx"
import {TAB_BAR_HEIGHT} from '../../navigation/MainNavigator'

type Props = {
    navigation: NativeStackNavigationProp<TripStackParamList, 'TripDetail'>
    route: RouteProp<TripStackParamList, 'TripDetail'>
}

const HEADER_HEIGHT = fs(255)

type SectionKey = 'overview' | 'organisation' | 'media' | 'checklist'

const SECTIONS: { key: SectionKey; label: string }[] = [
    {key: 'overview', label: 'Tableau de bord'},
    {key: 'organisation', label: 'Organisation'},
    {key: 'media', label: 'Documents'},
    {key: 'checklist', label: 'Checklist'},
]

const formatDate = (d: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})
}

const CAT_CONFIG: {
    key: BudgetCategoryKey
    label: string
    emoji: string
    color: string
    dimColor: string
    bgColor: string
    descriptionKey: 'accommodations' | 'transports' | 'activities' | 'various-expensive' | 'on-site'
}[] = [
    {
        key: 'accommodations',
        label: 'Hébergements',
        emoji: '🏨',
        color: '#79C9BF',
        dimColor: '#B7EEE5',
        bgColor: '#f0fdfb',
        descriptionKey: 'accommodations'
    },
    {
        key: 'transports',
        label: 'Transports',
        emoji: '✈️',
        color: '#6888F4',
        dimColor: '#C3DAFC',
        bgColor: '#f0f4ff',
        descriptionKey: 'transports'
    },
    {
        key: 'activities',
        label: 'Activités',
        emoji: '🎡',
        color: '#B48FF5',
        dimColor: '#DCD6FC',
        bgColor: '#faf5ff',
        descriptionKey: 'activities'
    },
    {
        key: 'various-expensive',
        label: 'Dépenses diverses',
        emoji: '🛍️',
        color: '#F1C982',
        dimColor: '#F9E9A6',
        bgColor: '#fffbeb',
        descriptionKey: 'various-expensive'
    },
    {
        key: 'on-site',
        label: 'Dépenses sur place',
        emoji: '🍽️',
        color: '#E7B3F8',
        dimColor: '#fae8ff',
        bgColor: '#fdf4ff',
        descriptionKey: 'on-site'
    },
]

const fmt = (n: number) => n.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})

const getCatAmounts = (budget: TripBudget, key: BudgetCategoryKey) => {
    const {reserved, nonReserved} = budget.details
    const paid = reserved[key]?.amount ?? 0
    const toPay = key !== 'on-site' ? (nonReserved[key as keyof typeof nonReserved] ?? 0) : 0
    return {paid, toPay, total: paid + toPay}
}

type OrgTrip = {
    accommodations?: import('../../types').Accommodation[]
    transports?: import('../../types').Transport[]
    activities?: import('../../types').Activity[]
    variousExpensives?: import('../../types').VariousExpense[]
    onSiteExpenses?: import('../../types').OnSiteExpense[]
}

const OrganisationSection = ({trip, budget, symbol}: { trip: OrgTrip; budget: TripBudget; symbol: string }) => {
    const [expanded, setExpanded] = useState<BudgetCategoryKey | null>(null)

    const categoryItems: Record<BudgetCategoryKey, any[]> = {
        'accommodations': trip.accommodations ?? [],
        'transports': trip.transports ?? [],
        'activities': trip.activities ?? [],
        'various-expensive': trip.variousExpensives ?? [],
        'on-site': trip.onSiteExpenses ?? [],
    }

    return (
        <View style={so.container}>
            {CAT_CONFIG.map(cat => {
                const {paid, toPay} = getCatAmounts(budget, cat.key)
                const items = categoryItems[cat.key]
                const desc = budget.details.reserved[cat.key]?.description ?? null
                const isOpen = expanded === cat.key

                return (
                    <View key={cat.key} style={so.card}>
                        <TouchableOpacity
                            style={so.cardHeader}
                            onPress={() => setExpanded(isOpen ? null : cat.key)}
                            activeOpacity={0.7}
                        >
                            <View style={[so.iconBox, {backgroundColor: cat.dimColor}]}>
                                <Text style={so.iconEmoji}>{cat.emoji}</Text>
                            </View>
                            <View style={so.cardInfo}>
                                <Text style={so.cardLabel}>{cat.label}</Text>
                                {desc ? (
                                    <Text style={so.cardDesc} numberOfLines={1}>{desc}</Text>
                                ) : (
                                    <Text
                                        style={so.cardDesc}>{items.length} élément{items.length !== 1 ? 's' : ''}</Text>
                                )}
                            </View>
                            <View style={so.cardAmounts}>
                                <Text style={so.cardPaid}>{fmt(paid)} {symbol}</Text>
                                {toPay > 0 && (
                                    <Text style={so.cardToPay}>À régler : {fmt(toPay)} {symbol}</Text>
                                )}
                            </View>
                            <Text style={[so.chevron, isOpen && so.chevronOpen]}>›</Text>
                        </TouchableOpacity>

                        {isOpen && items.length > 0 && (
                            <View style={so.itemsList}>
                                {items.map((item: any) => (
                                    <View key={item.id} style={so.itemRow}>
                                        <View style={so.itemLeft}>
                                            <Text
                                                style={so.itemName}>{item.name ?? (item.departure && item.destination ? `${item.departure} → ${item.destination}` : 'Transport')}</Text>
                                            {(item.city || item.company || item.activityType?.name || item.category) && (
                                                <Text style={so.itemSub}>
                                                    {item.city ?? item.company ?? item.activityType?.name ?? item.category}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={so.itemRight}>
                                            <Text style={so.itemAmount}>{fmt(item.price)} {symbol}</Text>
                                            {(item.booked === false || item.paid === false) && (
                                                <Text style={so.itemToPay}>À régler</Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                        {isOpen && items.length === 0 && (
                            <View style={so.emptyItems}>
                                <Text style={so.emptyItemsText}>Aucun élément ajouté</Text>
                            </View>
                        )}
                    </View>
                )
            })}
        </View>
    )
}

const PLUG_IMAGES: Record<string, any> = {
    'A': require('../../assets/plug-types/A.png'),
    'B': require('../../assets/plug-types/B.png'),
    'C': require('../../assets/plug-types/C.png'),
    'D': require('../../assets/plug-types/D.png'),
    'E': require('../../assets/plug-types/E.png'),
    'F': require('../../assets/plug-types/F.png'),
    'G': require('../../assets/plug-types/G.png'),
    'H': require('../../assets/plug-types/H.png'),
    'I': require('../../assets/plug-types/I.png'),
    'J': require('../../assets/plug-types/J.png'),
    'K': require('../../assets/plug-types/K.png'),
    'L': require('../../assets/plug-types/L.png'),
    'M': require('../../assets/plug-types/M.png'),
    'N': require('../../assets/plug-types/N.png'),
    'O': require('../../assets/plug-types/O.png'),
}

const tzGetOffsetMinutes = (ianaTimezone: string): number => {
    try {
        const now = new Date()
        const getParts = (tz: string) => new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false,
        }).formatToParts(now)
        const toMs = (parts: Intl.DateTimeFormatPart[]) => {
            const get = (t: string) => parseInt(parts.find(p => p.type === t)?.value ?? '0', 10)
            return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
        }
        return (toMs(getParts(ianaTimezone)) - toMs(getParts('UTC'))) / 60000
    } catch {
        return 0
    }
}

const tzGetLocalTime = (ianaTimezone: string, date: Date): string => {
    try {
        return new Intl.DateTimeFormat('fr-FR', {
            hour: 'numeric', minute: 'numeric', timeZone: ianaTimezone,
        }).format(date)
    } catch {
        return ''
    }
}

const tzGetLocalTimeDay = (ianaTimezone: string, date: Date): string => {
    try {
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            timeZone: ianaTimezone,
        }).format(date)
    } catch {
        return ''
    }
}

const tzFormatOffset = (diffMin: number, isRange = false): string => {
    if (diffMin === 0) return isRange ? '+0h' : 'Même heure que vous'
    const absDiff = Math.abs(diffMin)
    const h = Math.floor(absDiff / 60)
    const mins = absDiff % 60
    let result = diffMin > 0 ? '+' : '-'
    result += `${h}h`
    if (mins > 0) result += mins.toString().padStart(2, '0')
    return result
}

interface TzRangeInfo {
    sameDay: boolean
    earliestTime: string
    latestTime: string
    earliestDate: string
    latestDate: string
}

const tzGetRangeInfo = (ianaList: string[], homeOffsetMin: number, now: Date): TzRangeInfo | null => {
    const offsets = ianaList.map(iana => {
        try {
            return tzGetOffsetMinutes(iana)
        } catch {
            return null
        }
    }).filter((v): v is number => v !== null)

    if (offsets.length === 0) return null

    const toFakeUTC = (offsetMin: number) =>
        new Date(now.getTime() + offsetMin * 60000 - homeOffsetMin * 60000)

    const earliest = toFakeUTC(Math.min(...offsets))
    const latest = toFakeUTC(Math.max(...offsets))

    const fmtTime = (d: Date) => new Intl.DateTimeFormat('fr-FR', {
        hour: 'numeric', minute: 'numeric', timeZone: 'UTC',
    }).format(d)
    const fmtDay = (d: Date) => new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(d)

    const sameDay = earliest.getUTCDate() === latest.getUTCDate() &&
        earliest.getUTCMonth() === latest.getUTCMonth()

    return {
        sameDay,
        earliestTime: fmtTime(earliest),
        latestTime: fmtTime(latest),
        earliestDate: fmtDay(earliest),
        latestDate: fmtDay(latest),
    }
}

const PracticalInfoSection = ({destinations}: { destinations: TripDestination[] }) => {
    const valid = destinations.filter(d => d.country && (d.country.timezone || d.country.plugTypes))
    const [activeIdx, setActiveIdx] = useState(0)
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30000)
        return () => clearInterval(id)
    }, [])

    if (valid.length === 0) return null

    const dest = valid[Math.min(activeIdx, valid.length - 1)]
    const country = dest.country!

    const plugTypes = country.plugTypes
        ? country.plugTypes.split(',').map(p => p.trim()).filter(Boolean)
        : []

    const ianaList = country.timezone
        ? country.timezone.split(',').map(tz => tz.trim()).filter(Boolean)
        : []

    const homeOffsetMin = -now.getTimezoneOffset()
    const uniqueOffsets = [...new Set(ianaList.map(tz => tzGetOffsetMinutes(tz)))]
    const isRange = uniqueOffsets.length > 1
    const minOffset = Math.min(...uniqueOffsets)
    const maxOffset = Math.max(...uniqueOffsets)
    const minOffsetDiff = minOffset - homeOffsetMin
    const maxOffsetDiff = maxOffset - homeOffsetMin
    const singleTz = ianaList[0]
    const rangeInfo = isRange ? tzGetRangeInfo(ianaList, homeOffsetMin, now) : null

    return (
        <View style={spi.card}>
            <View style={spi.cardHeader}>
                <Text style={spi.cardTitle}>Informations pratiques</Text>
                {valid.length > 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={spi.tabs}
                    >
                        {valid.map((d, i) => (
                            <TouchableOpacity
                                key={d.id}
                                style={[spi.tab, activeIdx === i && spi.tabActive]}
                                onPress={() => setActiveIdx(i)}
                                activeOpacity={0.7}
                            >
                                <Text style={[spi.tabText, activeIdx === i && spi.tabTextActive]}>
                                    {d.country!.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {ianaList.length > 0 && (
                <>
                    <View style={spi.sep}/>
                    <View style={spi.tzBlock}>
                        <Text style={spi.tzSectionLabel}>Heure locale</Text>

                        {/* Un seul timezone */}
                        {!isRange && singleTz && (
                            <View style={spi.tzRow}>
                                <View style={spi.tzLeft}>
                                    <Text style={spi.tzBigTime}>{tzGetLocalTime(singleTz, now)}</Text>
                                    <Text style={spi.tzDate}>{tzGetLocalTimeDay(singleTz, now)}</Text>
                                </View>
                                <View style={spi.tzOffsetGroup}>
                                    <View style={spi.tzOffsetBadge}>
                                        <Text style={spi.tzOffsetText}>
                                            {minOffsetDiff === 0 ? '±0h' : tzFormatOffset(minOffsetDiff)}
                                        </Text>
                                    </View>
                                    <Text style={spi.tzVsYou}>
                                        {minOffsetDiff === 0 ? 'même heure' : 'vs vous'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Range — même jour */}
                        {isRange && rangeInfo?.sameDay && (
                            <View style={spi.tzRow}>
                                <View style={spi.tzLeft}>
                                    <Text style={spi.tzIntro}>Il est entre</Text>
                                    <Text style={spi.tzBigTime}>
                                        {rangeInfo.earliestTime} – {rangeInfo.latestTime}
                                    </Text>
                                    <Text style={spi.tzDate}>{rangeInfo.earliestDate}</Text>
                                </View>
                                <View style={spi.tzOffsetGroup}>
                                    <View style={spi.tzOffsetBadge}>
                                        <Text style={spi.tzOffsetText}>{tzFormatOffset(minOffsetDiff, true)}</Text>
                                    </View>
                                    <Text style={spi.tzOffsetArrow}>↓</Text>
                                    <View style={spi.tzOffsetBadge}>
                                        <Text style={spi.tzOffsetText}>{tzFormatOffset(maxOffsetDiff, true)}</Text>
                                    </View>
                                    <Text style={spi.tzVsYou}>vs vous</Text>
                                </View>
                            </View>
                        )}

                        {/* Range — jours différents */}
                        {isRange && rangeInfo && !rangeInfo.sameDay && (
                            <>
                                <Text style={[spi.tzIntro, {marginTop: SPACING.xs}]}>Selon la région, il est
                                    entre</Text>
                                <View style={spi.tzTwoCols}>
                                    <View style={spi.tzCol}>
                                        <Text style={spi.tzBigTime}>{rangeInfo.earliestTime}</Text>
                                        <Text style={spi.tzDate}>{rangeInfo.earliestDate}</Text>
                                        <View style={spi.tzOffsetBadge}>
                                            <Text style={spi.tzOffsetText}>{tzFormatOffset(minOffsetDiff, true)}</Text>
                                        </View>
                                    </View>
                                    <View style={spi.tzColDivider}/>
                                    <View style={spi.tzCol}>
                                        <Text style={spi.tzBigTime}>{rangeInfo.latestTime}</Text>
                                        <Text style={spi.tzDate}>{rangeInfo.latestDate}</Text>
                                        <View style={spi.tzOffsetBadge}>
                                            <Text style={spi.tzOffsetText}>{tzFormatOffset(maxOffsetDiff, true)}</Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </>
            )}

            {plugTypes.length > 0 && (
                <>
                    <View style={spi.sep}/>
                    <View style={spi.plugBlock}>
                        <Text style={spi.tzSectionLabel}>Prises électriques</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={spi.plugScroll}
                        >
                            {plugTypes.map(type => (
                                <View key={type} style={spi.plugCard}>
                                    {PLUG_IMAGES[type.toUpperCase()] ? (
                                        <Image
                                            source={PLUG_IMAGES[type.toUpperCase()]}
                                            style={spi.plugImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <Text style={spi.plugLetter}>{type}</Text>
                                    )}
                                    <Text style={spi.plugTypeLabel}>Type {type}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </>
            )}
        </View>
    )
}

const MediaSection = ({blocNotes}: { blocNotes: string | null }) => (
    <View style={sm.container}>
        {[
            {label: 'Photos', emoji: '📷', content: null},
            {label: 'Documents', emoji: '📄', content: null},
            {label: 'Bloc-notes', emoji: '📝', content: blocNotes},
            {label: 'Stories & partage', emoji: '✨', content: null},
        ].map(item => (
            <View key={item.label} style={sm.block}>
                <View style={sm.blockHeader}>
                    <Text style={sm.blockEmoji}>{item.emoji}</Text>
                    <Text style={sm.blockLabel}>{item.label}</Text>
                </View>
                {item.content ? (
                    <Text style={sm.blockContent}>{item.content}</Text>
                ) : (
                    <View style={sm.blockEmpty}>
                        <Text style={sm.blockEmptyText}>Bientôt disponible</Text>
                    </View>
                )}
            </View>
        ))}
    </View>
)

const ChecklistSection = ({items}: { items: ChecklistItem[] }) => {
    if (items.length === 0) return (
        <View style={sc.empty}>
            <Text style={sc.emptyText}>Aucun élément dans la checklist</Text>
        </View>
    )

    const grouped: Record<string, ChecklistItem[]> = {}
    items.forEach(item => {
        const cat = item.category ?? 'Autre'
        if (!grouped[cat]) grouped[cat] = []
        grouped[cat].push(item)
    })

    return (
        <View style={sc.container}>
            {Object.entries(grouped).map(([cat, catItems]) => (
                <View key={cat} style={sc.group}>
                    <Text style={sc.groupTitle}>{cat}</Text>
                    {catItems.map(item => (
                        <View key={item.id} style={sc.item}>
                            <View style={[sc.checkbox, item.isChecked && sc.checkboxChecked]}>
                                {item.isChecked && <Text style={sc.checkmark}>✓</Text>}
                            </View>
                            <View style={sc.itemContent}>
                                <Text style={[sc.itemName, item.isChecked && sc.itemNameDone]}>{item.name}</Text>
                                {item.checkedBy && (
                                    <Text style={sc.itemSub}>Coché par {item.checkedBy.name}</Text>
                                )}
                            </View>
                            {item.isShared && <Text style={sc.sharedBadge}>Partagé</Text>}
                        </View>
                    ))}
                </View>
            ))}
        </View>
    )
}

function DotsIcon({color = '#fff'}: { color?: string }) {
    return (
        <View style={{flexDirection: 'row', gap: 3, alignItems: 'center', justifyContent: 'center'}}>
            {[0, 1, 2].map(i => (
                <View key={i} style={{width: 4, height: 4, borderRadius: 2, backgroundColor: color}}/>
            ))}
        </View>
    )
}

export default function TripDetailScreen({navigation, route}: Props) {
    const {tripId} = route.params
    const insets = useSafeAreaInsets()
    const {
        currentTrip,
        currentDashboard,
        isLoadingDetail,
        fetchTripDetail,
        clearCurrentTrip
    } = useTripStore()
    const [activeSection, setActiveSection] = useState<SectionKey>('overview')
    const [stickyTabVisible, setStickyTabVisible] = useState(false)
    const [menuVisible, setMenuVisible] = useState(false)
    const sectionsScrollRef = useRef<ScrollView>(null)
    const scrollY = useRef(new Animated.Value(0)).current

    const TABS_THRESHOLD = HEADER_HEIGHT + 80

    const navBarOpacity = scrollY.interpolate({
        inputRange: [HEADER_HEIGHT - 100, HEADER_HEIGHT - 30],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    })
    const naturalTabOpacity = scrollY.interpolate({
        inputRange: [TABS_THRESHOLD - 20, TABS_THRESHOLD + 20],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    })
    const stickyTabOpacity = scrollY.interpolate({
        inputRange: [TABS_THRESHOLD - 20, TABS_THRESHOLD + 20],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    })

    useEffect(() => {
        const id = scrollY.addListener(({value}) => {
            setStickyTabVisible(value > TABS_THRESHOLD)
        })
        return () => scrollY.removeListener(id)
    }, [scrollY, TABS_THRESHOLD])

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

    const daysLabel = countDaysBeforeOrAfter === false
        ? null
        : countDaysBeforeOrAfter === 'ongoing'
            ? 'C\'est le moment !'
            : !countDaysBeforeOrAfter.before
                ? `Départ dans ${countDaysBeforeOrAfter.days} jour${countDaysBeforeOrAfter.days > 1 ? 's' : ''}`
                : `Rentré il y a ${countDaysBeforeOrAfter.days} jour${countDaysBeforeOrAfter.days > 1 ? 's' : ''}`

    const NAV_BAR_HEIGHT = insets.top + 50

    return (
        <View style={s.fullScreen}>
            <Animated.View style={[s.navBar, {opacity: navBarOpacity, height: NAV_BAR_HEIGHT, paddingTop: insets.top}]}>
                <TouchableOpacity style={s.navBarBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                    <BackArrow/>
                </TouchableOpacity>
                <Text style={s.navBarTitle} numberOfLines={1}>{trip.name}</Text>
                <TouchableOpacity style={s.navBarBtn} onPress={() => setMenuVisible(true)} activeOpacity={0.8}>
                    <DotsIcon/>
                </TouchableOpacity>
            </Animated.View>

            <Animated.View
                style={[s.stickyTabBar, {opacity: stickyTabOpacity, top: NAV_BAR_HEIGHT}]}
                pointerEvents={stickyTabVisible ? 'auto' : 'none'}
            >
                <ScrollView
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

            <Animated.ScrollView
                style={[s.root, {marginBottom: insets.bottom + TAB_BAR_HEIGHT - 30}]}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: scrollY}}}],
                    {useNativeDriver: true},
                )}
                scrollEventThrottle={16}
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

                    <View style={[s.coverBar, {paddingTop: insets.top + SPACING.sm}]}>
                        <TouchableOpacity style={s.coverBarBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                            <BackArrow/>
                        </TouchableOpacity>

                        <View style={s.coverBarCenter}>
                            {daysLabel && (
                                <View style={s.daysBadge}>
                                    <Text style={s.daysBadgeText}>{daysLabel}</Text>
                                </View>
                            )}
                            <Text style={s.coverTitle} numberOfLines={2}>{trip.name}</Text>
                            {countryLabel && <Text style={s.coverCountries}>{countryLabel}</Text>}
                        </View>

                        <TouchableOpacity style={s.coverBarBtn} onPress={() => setMenuVisible(true)}
                                          activeOpacity={0.8}>
                            <DotsIcon/>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={s.infoCard}>
                    <View style={s.metaRow}>
                        {trip.departureDate && (
                            <View style={[s.metaBox, s.metaBoxDepart]}>
                                <Text style={[s.metaBoxLabel, s.metaBoxLabelDepart]}>Départ</Text>
                                <Text style={s.metaBoxValue}>{formatDate(trip.departureDate)}</Text>
                            </View>
                        )}
                        {trip.returnDate && (
                            <View style={[s.metaBox, s.metaBoxRetour]}>
                                <Text style={[s.metaBoxLabel, s.metaBoxLabelRetour]}>Retour</Text>
                                <Text style={s.metaBoxValue}>{formatDate(trip.returnDate)}</Text>
                            </View>
                        )}
                        <View style={[s.metaBox, s.metaBoxVoyageurs]}>
                            <Text style={[s.metaBoxLabel, s.metaBoxLabelVoyageurs]}>Voyageurs</Text>
                            <Text style={s.metaBoxValue}>{(trip.tripTravelers?.length ?? 0) + 1}</Text>
                        </View>
                    </View>

                    <Animated.View style={{opacity: naturalTabOpacity}}>
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
                </View>

                <View style={s.contentPadding}>
                    {activeSection === 'overview' && (
                        <>
                            {trip.description ? (
                                <View style={s.descriptionSection}>
                                    <Text style={s.descriptionTitle}>Description</Text>
                                    <Text style={s.descriptionText}>{trip.description}</Text>
                                </View>
                            ) : null}

                            {budget && (
                                <View style={s.overviewBudgetCard}>
                                    <Text style={s.cardLabel}>Budget du voyage</Text>
                                    <Text style={s.overviewBudgetAmount}>{fmt(budget.total)} {symbol}</Text>

                                    {budget.total > 0 && (
                                        <View style={s.overviewBar}>
                                            <View style={[s.overviewBarFill, {
                                                flex: budget.paid,
                                                backgroundColor: '#22c55e'
                                            }]}/>
                                            {budget.toPay > 0 && (
                                                <View style={[s.overviewBarFill, {
                                                    flex: budget.toPay,
                                                    backgroundColor: '#fbbf24'
                                                }]}/>
                                            )}
                                        </View>
                                    )}

                                    <View style={s.overviewStats}>
                                        <View style={s.overviewStat}>
                                            <Text style={s.overviewStatLabel}>Payé</Text>
                                            <Text style={s.overviewStatPaid}>{fmt(budget.paid)} {symbol}</Text>
                                        </View>
                                        <View style={s.overviewStatSep}/>
                                        <View style={s.overviewStat}>
                                            <Text style={s.overviewStatLabel}>À régler</Text>
                                            <Text style={s.overviewStatToPay}>{fmt(budget.toPay)} {symbol}</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={s.overviewBudgetBtn}
                                        onPress={() => navigation.navigate('TripBudget', {tripId, tripName: trip.name})}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={s.overviewBudgetBtnText}>Voir le détail du budget →</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <PracticalInfoSection destinations={trip.destinations ?? []}/>

                            <View style={s.infoCard2}>
                                <Text style={s.infoCard2Title}>🌤 Météo</Text>
                                <View style={s.infoCard2Empty}>
                                    <Text style={s.infoCard2EmptyText}>Bientôt disponible</Text>
                                </View>
                            </View>
                        </>
                    )}

                    {activeSection === 'organisation' && budget && (
                        <OrganisationSection trip={trip} budget={budget} symbol={symbol}/>
                    )}

                    {activeSection === 'media' && (
                        <MediaSection blocNotes={trip.blocNotes ?? null}/>
                    )}

                    {activeSection === 'checklist' && (
                        <ChecklistSection items={trip.checklistItems ?? []}/>
                    )}
                </View>
            </Animated.ScrollView>

            {menuVisible && (
                <>
                    <Pressable style={s.menuBackdrop} onPress={() => setMenuVisible(false)}/>
                    <View style={[s.menuPopover, {top: NAV_BAR_HEIGHT + 8}]}>
                        <TouchableOpacity
                            style={s.menuItem}
                            onPress={() => {
                                setMenuVisible(false)
                                navigation.navigate('CreateEditTrip', {tripId})
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={s.menuItemText}>Éditer le voyage</Text>
                        </TouchableOpacity>
                        <View style={s.menuDivider}/>
                        <TouchableOpacity
                            style={s.menuItem}
                            onPress={() => setMenuVisible(false)}
                            activeOpacity={0.7}
                        >
                            <Text style={s.menuItemText}>Exporter en PDF</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    )
}

const s = StyleSheet.create({
    fullScreen: {flex: 1, backgroundColor: '#f8fafc'},
    root: {flex: 1, backgroundColor: '#f8fafc'},
    loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},

    navBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        backgroundColor: COLORS.primaryDark,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
        gap: SPACING.md,
    },
    navBarBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    navBarTitle: {
        flex: 1,
        fontFamily: FONTS.semiBold,
        fontSize: fs(16),
        color: '#fff',
        textAlign: 'center',
    },

    stickyTabBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 19,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },

    coverContainer: {height: HEADER_HEIGHT, backgroundColor: '#c9d4e0'},
    cover: {width: '100%', height: '100%'},
    coverPlaceholder: {backgroundColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center'},
    coverPlaceholderEmoji: {fontSize: 64},
    coverGradient: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },

    coverBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
        gap: SPACING.md,
    },
    coverBarBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    coverBarCenter: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },

    daysBadge: {
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: 11,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        marginTop: 5,
        marginBottom: 10,
    },
    daysBadgeText: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(10),
        color: '#fff',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    coverTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(20),
        lineHeight: fs(24),
        color: '#fff',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    coverCountries: {
        fontFamily: FONTS.regular,
        fontSize: fs(13),
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },

    infoCard: {
        backgroundColor: '#fff',
        marginTop: -50,
        borderRadius: BORDER_RADIUS.xl,
        marginHorizontal: 20,
        overflow: 'hidden',
        padding: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 1,
    },

    titleSection: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
    },

    metaRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.xs
    },
    metaBox: {
        flex: 1,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.sm,
        gap: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    metaBoxDepart: {backgroundColor: '#fde8e2'},
    metaBoxRetour: {backgroundColor: '#dff2ee'},
    metaBoxVoyageurs: {backgroundColor: '#fef3c7'},
    metaBoxLabel: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(10),
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    metaBoxLabelDepart: {color: '#b94030'},
    metaBoxLabelRetour: {color: '#0f766e'},
    metaBoxLabelVoyageurs: {color: '#92700a'},
    metaBoxValue: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(14),
        color: COLORS.text,
    },

    tabsContent: {paddingTop: SPACING.sm, gap: SPACING.xs},
    tab: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.base,
        borderRadius: BORDER_RADIUS.full,
    },
    tabActive: {backgroundColor: '#1a1a2e'},
    tabLabel: {fontFamily: FONTS.medium, fontSize: fs(13), color: COLORS.textSecondary},
    tabLabelActive: {color: '#fff', fontFamily: FONTS.semiBold},

    contentPadding: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: 25,
    },
    content: {paddingTop: SPACING.md},


    descriptionSection: {
        marginHorizontal: SPACING.sm,
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

    overviewBudgetCard: {
        backgroundColor: '#fff',
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: SPACING.sm,
    },
    cardLabel: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(12),
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    overviewBudgetAmount: {
        fontFamily: FONTS.display,
        fontSize: fs(25),
        color: COLORS.text,
        letterSpacing: -0.8,
        marginTop: -4,
    },
    overviewBar: {
        flexDirection: 'row',
        height: 7,
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#e2e8f0',
    },
    overviewBarFill: {height: '100%'},
    overviewStats: {flexDirection: 'row', alignItems: 'center'},
    overviewStat: {flex: 1, alignItems: 'center', gap: 2},
    overviewStatSep: {width: 1, height: 32, backgroundColor: COLORS.border},
    overviewStatLabel: {fontFamily: FONTS.regular, fontSize: fs(11), color: COLORS.textSecondary},
    overviewStatPaid: {fontFamily: FONTS.semiBold, fontSize: fs(14), color: '#059669'},
    overviewStatToPay: {fontFamily: FONTS.semiBold, fontSize: fs(14), color: '#d97706'},
    overviewBudgetBtn: {
        marginTop: SPACING.xs,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    overviewBudgetBtnText: {fontFamily: FONTS.medium, fontSize: fs(13), color: COLORS.textSecondary},

    infoCard2: {
        backgroundColor: '#fff',
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoCard2Title: {fontFamily: FONTS.semiBold, fontSize: fs(14), color: COLORS.text, marginBottom: SPACING.sm},
    infoCard2Empty: {paddingVertical: SPACING.sm, alignItems: 'center'},
    infoCard2EmptyText: {fontFamily: FONTS.regular, fontSize: fs(13), color: COLORS.textSecondary},

    menuBackdrop: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        zIndex: 30,
    },
    menuPopover: {
        position: 'absolute',
        right: SPACING.md,
        zIndex: 31,
        width: fs(170),
        backgroundColor: '#fff',
        borderRadius: BORDER_RADIUS.lg,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.18,
        shadowRadius: BORDER_RADIUS.lg,
        elevation: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    menuItem: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 13,
    },
    menuItemText: {fontFamily: FONTS.regular, fontSize: fs(15), color: COLORS.text},
    menuDivider: {height: StyleSheet.hairlineWidth, backgroundColor: '#d1d5db', marginHorizontal: SPACING.sm},
})

const spi = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
        overflow: 'hidden',
    },

    cardHeader: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
        gap: SPACING.sm,
    },
    cardTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(12),
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    tabs: {gap: SPACING.xs, paddingBottom: 2},
    tab: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tabActive: {
        backgroundColor: COLORS.primaryDark,
        borderColor: COLORS.primaryDark,
    },
    tabText: {fontFamily: FONTS.medium, fontSize: fs(13), color: COLORS.textSecondary},
    tabTextActive: {color: '#fff'},

    sep: {height: 0.5, backgroundColor: COLORS.border},

    tzBlock: {
        padding: SPACING.md,
    },
    tzRow: {
        marginTop: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.sm,
    },
    tzLeft: {
        flex: 1,
        gap: 4,
    },
    tzRight: {
        alignItems: 'center',
        paddingTop: 2,
    },
    tzSectionLabel: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(11),
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    tzBigTime: {
        fontFamily: FONTS.display,
        fontSize: fs(34),
        color: COLORS.text,
        letterSpacing: -1.5,
        lineHeight: fs(38),
    },
    tzDate: {
        fontFamily: FONTS.regular,
        fontSize: fs(13),
        color: COLORS.textSecondary,
        textTransform: 'capitalize',
        lineHeight: fs(18),
    },
    tzOffsetGroup: {
        alignItems: 'center',
        gap: 4,
    },
    tzOffsetBadge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS.full,
        maxWidth: fs(50)
    },
    tzOffsetText: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(12),
        color: COLORS.primary,
        textAlign: 'center'
    },
    tzOffsetArrow: {
        fontSize: fs(12),
        color: COLORS.textSecondary,
    },
    tzVsYou: {
        fontFamily: FONTS.regular,
        fontSize: fs(10),
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    tzIntro: {
        fontFamily: FONTS.regular,
        fontSize: fs(13),
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    tzOffsetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        flexWrap: 'wrap',
        marginTop: 2,
    },
    tzTwoCols: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.sm,
        marginTop: 2,
    },
    tzCol: {
        flex: 1,
        gap: 3,
    },
    tzColAnd: {
        fontFamily: FONTS.regular,
        fontSize: fs(13),
        color: COLORS.textSecondary,
        marginTop: fs(10),
        alignSelf: 'flex-start',
    },
    tzColDivider: {
        width: 1,
        backgroundColor: COLORS.border,
        alignSelf: 'stretch',
        marginHorizontal: SPACING.xs,
    },

    plugBlock: {
        padding: SPACING.md,
        gap: SPACING.sm,
    },
    plugScroll: {gap: SPACING.sm, paddingBottom: 2},
    plugCard: {
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.sm,
        minWidth: 72,
        gap: 4,
    },
    plugImage: {width: 52, height: 52},
    plugLetter: {
        fontFamily: FONTS.display,
        fontSize: fs(26),
        color: COLORS.text,
        letterSpacing: -0.5,
        width: 52,
        height: 52,
        textAlign: 'center',
        textAlignVertical: 'center',
        lineHeight: 52,
    },
    plugTypeLabel: {
        fontFamily: FONTS.medium,
        fontSize: fs(11),
        color: COLORS.textSecondary,
    },
})

const so = StyleSheet.create({
    container: {},
    card: {
        backgroundColor: '#fff',
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        gap: SPACING.sm,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    iconEmoji: {fontSize: 22},
    cardInfo: {flex: 1},
    cardLabel: {fontFamily: FONTS.semiBold, fontSize: fs(14), color: COLORS.text},
    cardDesc: {fontFamily: FONTS.regular, fontSize: fs(12), color: COLORS.textSecondary, marginTop: 1},
    cardAmounts: {alignItems: 'flex-end'},
    cardPaid: {fontFamily: FONTS.semiBold, fontSize: fs(14), color: COLORS.text},
    cardToPay: {fontFamily: FONTS.regular, fontSize: fs(11), color: '#d97706', marginTop: 1},
    chevron: {
        fontSize: 22,
        color: COLORS.textSecondary,
        transform: [{rotate: '90deg'}],
        marginLeft: 4,
    },
    chevronOpen: {
        transform: [{rotate: '-90deg'}],
    },
    itemsList: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingHorizontal: SPACING.md,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: SPACING.sm,
    },
    itemLeft: {flex: 1},
    itemName: {fontFamily: FONTS.medium, fontSize: fs(13), color: COLORS.text},
    itemSub: {fontFamily: FONTS.regular, fontSize: fs(11), color: COLORS.textSecondary, marginTop: 1},
    itemRight: {alignItems: 'flex-end'},
    itemAmount: {fontFamily: FONTS.semiBold, fontSize: fs(13), color: COLORS.text},
    itemToPay: {fontFamily: FONTS.regular, fontSize: fs(11), color: '#d97706', marginTop: 1},
    emptyItems: {padding: SPACING.md, alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border},
    emptyItemsText: {fontFamily: FONTS.regular, fontSize: fs(13), color: COLORS.textSecondary},
})

const sm = StyleSheet.create({
    container: {},
    block: {
        backgroundColor: '#fff',
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
        overflow: 'hidden',
    },
    blockHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    blockEmoji: {fontSize: 20},
    blockLabel: {fontFamily: FONTS.semiBold, fontSize: fs(14), color: COLORS.text},
    blockContent: {
        fontFamily: FONTS.regular,
        fontSize: fs(14),
        lineHeight: fs(20),
        color: COLORS.text,
        padding: SPACING.md,
    },
    blockEmpty: {padding: SPACING.md, alignItems: 'center'},
    blockEmptyText: {fontFamily: FONTS.regular, fontSize: fs(13), color: COLORS.textSecondary},
})

const sc = StyleSheet.create({
    container: {},
    empty: {padding: SPACING.xl, alignItems: 'center'},
    emptyText: {fontFamily: FONTS.regular, fontSize: fs(14), color: COLORS.textSecondary},
    group: {marginBottom: SPACING.md},
    groupTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(12),
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: SPACING.xs,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.xs,
        gap: SPACING.sm,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    checkboxChecked: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    checkmark: {fontSize: 12, color: '#fff', fontFamily: FONTS.semiBold},
    itemContent: {flex: 1},
    itemName: {fontFamily: FONTS.medium, fontSize: fs(14), color: COLORS.text},
    itemNameDone: {color: COLORS.textSecondary, textDecorationLine: 'line-through'},
    itemSub: {fontFamily: FONTS.regular, fontSize: fs(12), color: COLORS.textSecondary, marginTop: 1},
    sharedBadge: {
        fontFamily: FONTS.medium,
        fontSize: fs(10),
        color: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.full,
    },
})
