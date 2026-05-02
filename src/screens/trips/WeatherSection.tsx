import React, {useEffect, useRef, useState} from 'react'
import {ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {BORDER_RADIUS, COLORS, FONTS, SPACING, fs} from '../../constants'
import {TripWeather, WeatherDay, WeatherForecast, WeatherHistorical} from '../../types'

type Props = {
    weather: TripWeather | null
    isLoading: boolean
}

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})

const fmtDayTab = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', {weekday: 'short', day: 'numeric'})

const AQI_MAP: Record<number, { label: string; color: string }> = {
    1: {label: 'Bonne', color: '#22c55e'},
    2: {label: 'Correct', color: '#84cc16'},
    3: {label: 'Modérée', color: '#f59e0b'},
    4: {label: 'Mauvais', color: '#f97316'},
    5: {label: 'Très mauvaise', color: '#ef4444'},
}

const AQI_BAR_COLORS = ['#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444']

const StatCard = ({emoji, label, value, bg, full}: {
    emoji: string; label: string; value: string; bg?: string; full?: boolean
}) => (
    <View style={[sw.statCard, full && sw.statCardFull, bg ? {backgroundColor: bg} : undefined]}>
        <Text style={sw.statEmoji}>{emoji}</Text>
        <Text style={sw.statLabel}>{label}</Text>
        <Text style={sw.statValue}>{value}</Text>
    </View>
)

const HistoricalView = ({data, arrivalDate, departureDate}: {
    data: WeatherHistorical
    arrivalDate: string | null
    departureDate: string | null
}) => (
    <View style={sw.body}>
        {arrivalDate && departureDate && (
            <View style={sw.periodRow}>
                <Text style={sw.periodText}>{fmtDate(arrivalDate)} – {fmtDate(departureDate)}</Text>
                <Text style={sw.periodSub}>Données moyennes pour la période</Text>
            </View>
        )}

        <View style={sw.gridAdviceGroup}>
            <View style={sw.grid}>
                <StatCard emoji="🌡️" label="Température" value={`${data.temp_min}°C – ${data.temp_max}°C`}
                          bg="#F0F6FE"/>
                <StatCard emoji="💧" label="Précipitations"
                          value={`${data.rainfall_days} jours (${data.rainfall_mm} mm)`} bg="#F9F5FE"/>
                <StatCard emoji="☀️" label="Durée du jour" value={`${data.daylight_hours}h`} bg="#FEF7EE"/>
                <StatCard emoji="🌫️" label="Humidité" value={`${data.humidity}%`} bg="#F3FDFA"/>
            </View>

            {!!data.advice && (
                <View style={sw.adviceBox}>
                    <Text style={sw.adviceText}>{data.advice}</Text>
                </View>
            )}
        </View>

        <Text style={sw.source}>Source : Open-Meteo</Text>
    </View>
)

const MAX_VISIBLE_TABS = 4

const ForecastView = ({data, tabsWidth, onTabsLayout}: {
    data: WeatherForecast
    tabsWidth: number
    onTabsLayout: (w: number) => void
}) => {
    const days = Object.entries(data.days).sort(([a], [b]) => a.localeCompare(b))
    const [activeDay, setActiveDay] = useState(days[0]?.[0] ?? '')

    const day: WeatherDay | undefined = data.days[activeDay]

    if (days.length === 0 || !day) return null

    const hasMore = days.length > MAX_VISIBLE_TABS
    // Si plus de 4 jours, on affiche 3.5 tabs pour que le 4ème soit à moitié visible
    const visibleCount = hasMore ? 3.5 : Math.min(days.length, MAX_VISIBLE_TABS)
    const tabGap = SPACING.xs
    const tabWidth = tabsWidth > 0
        ? (tabsWidth - tabGap * (Math.ceil(visibleCount) - 1)) / visibleCount
        : 0

    const aqiInfo = day.aqi !== null ? AQI_MAP[day.aqi] : null
    const aqiPct = day.aqi !== null ? ((day.aqi - 1) / 4) * 86 + 2 : 0

    return (
        <View style={sw.body}>
            <View onLayout={(e) => onTabsLayout(e.nativeEvent.layout.width)}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={sw.dayTabs}
                >
                    {days.map(([dateKey]) => (
                        <TouchableOpacity
                            key={dateKey}
                            style={[sw.dayTab, {width: tabWidth || undefined}, activeDay === dateKey && sw.dayTabActive]}
                            onPress={() => setActiveDay(dateKey)}
                            activeOpacity={0.7}
                        >
                            <Text style={[sw.dayTabText, activeDay === dateKey && sw.dayTabTextActive]}
                                  numberOfLines={1}>
                                {fmtDayTab(dateKey)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <View style={sw.conditionBlock}>
                {day.condition.icon ? (
                    <Image
                        source={{uri: day.condition.icon}}
                        style={sw.conditionIcon}
                    />
                ) : null}
                <Text style={sw.conditionLabel}>
                    {day.condition.text.charAt(0).toUpperCase() + day.condition.text.slice(1)}
                </Text>
                <View style={sw.conditionTempRow}>
                    <Text style={sw.conditionTempMin}>{Math.round(day.temperature.min)}°C</Text>
                    <Text style={sw.conditionTempSep}> — </Text>
                    <Text style={sw.conditionTempMax}>{Math.round(day.temperature.max)}°C</Text>
                </View>
            </View>
            <View style={sw.gridAdviceGroup}>
                <View style={sw.grid}>
                    <StatCard emoji="🍃" label="Rafales" value={`${day.wind} km/h`} bg="#F0F6FE"/>
                    <StatCard emoji="💧" label="Précipitations" value={`${day.precipitation} mm`} bg="#F9F5FE"/>
                    <StatCard emoji="☀️" label="Durée du jour" value={`${day.daylight}h`} bg="#FEF7EE"/>
                    <StatCard emoji="🌫️" label="Humidité" value={`${day.humidity}%`} bg="#F3FDFA"/>
                    {day.snow > 0 && (
                        <StatCard emoji="❄️" label="Chutes de neige" value={`${day.snow} cm`} bg="#F0F6FE" full/>
                    )}
                </View>
                {day.aqi !== null && aqiInfo && (
                    <View style={sw.aqiBlock}>
                        <View style={sw.aqiHeader}>
                            <Text style={sw.aqiLabel}>Qualité de l'air</Text>
                            <Text style={[sw.aqiValue, {color: aqiInfo.color}]}>
                                IQA {day.aqi} · {aqiInfo.label}
                            </Text>
                        </View>
                        <View style={sw.aqiBarWrap}>
                            <View style={sw.aqiBar}>
                                {AQI_BAR_COLORS.map((c, i) => (
                                    <View key={i} style={[sw.aqiSegment, {backgroundColor: c}]}/>
                                ))}
                            </View>
                            <View style={[sw.aqiDot, {left: `${aqiPct}%` as any}]}/>
                        </View>
                        <View style={sw.aqiBarLabels}>
                            <Text style={sw.aqiBarLabel}>Bonne</Text>
                            <Text style={sw.aqiBarLabel}>Modérée</Text>
                            <Text style={sw.aqiBarLabel}>Très mauvaise</Text>
                        </View>
                    </View>
                )}
                {!!day.advice && (
                    <View style={sw.adviceBox}>
                        <Text style={sw.adviceText}>{day.advice}</Text>
                    </View>
                )}
            </View>
            <View style={sw.sourceBlock}>
                <Text style={sw.source}>Source : OpenWeatherMap</Text>
                <Text style={sw.source}>Mise à jour toutes les 3 heures</Text>
            </View>
        </View>
    )
}

export default function WeatherSection({weather, isLoading}: Props) {
    const [activeIdx, setActiveIdx] = useState(0)
    const [destContainerWidth, setDestContainerWidth] = useState(0)
    const [destContentWidth, setDestContentWidth] = useState(0)
    const destNaturalMeasured = useRef(false)
    const [forecastTabsWidth, setForecastTabsWidth] = useState(0)

    useEffect(() => {
        destNaturalMeasured.current = false
        setDestContentWidth(0)
    }, [weather?.length])

    return (
        <View style={sw.card}>
            <View style={sw.cardHeader}>
                <Text style={sw.cardTitle}>Prévisions météo</Text>
            </View>

            {isLoading && (
                <View style={sw.loader}>
                    <ActivityIndicator size="small" color={COLORS.primary}/>
                    <Text style={sw.loaderText}>Chargement de la météo…</Text>
                </View>
            )}

            {!isLoading && (!weather || weather.length === 0) && (
                <View style={sw.empty}>
                    <Text style={sw.emptyText}>Aucune donnée météo disponible</Text>
                    <Text style={sw.emptySub}>Seules les destinations avec des dates renseignées s'affichent.</Text>
                </View>
            )}

            {!isLoading && weather && weather.length > 0 && (
                <>
                    {weather.length > 1 && (() => {
                        const overflows = destContentWidth > destContainerWidth && destContainerWidth > 0
                        return (
                            <View onLayout={(e) => setDestContainerWidth(e.nativeEvent.layout.width)}>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={overflows ? sw.destTabs : sw.destTabsFull}
                                    onContentSizeChange={(w) => {
                                        if (!destNaturalMeasured.current) {
                                            destNaturalMeasured.current = true
                                            setDestContentWidth(w)
                                        }
                                    }}
                                    scrollEnabled={overflows}
                                >
                                    {weather.map((w, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={[sw.destTab, !overflows && sw.destTabFlex, activeIdx === i && sw.destTabActive]}
                                            onPress={() => setActiveIdx(i)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[sw.destTabText, activeIdx === i && sw.destTabTextActive]}>
                                                {w.destination.city || w.destination.country}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )
                    })()}

                    {'forecast' in weather[activeIdx].weather ? (
                        <ForecastView
                            key={activeIdx}
                            data={weather[activeIdx].weather as WeatherForecast}
                            tabsWidth={forecastTabsWidth}
                            onTabsLayout={setForecastTabsWidth}
                        />
                    ) : (
                        <HistoricalView
                            data={weather[activeIdx].weather as WeatherHistorical}
                            arrivalDate={weather[activeIdx].destination.arrivalDate}
                            departureDate={weather[activeIdx].destination.departureDate}
                        />
                    )}
                </>
            )}
        </View>
    )
}

const sw = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
        overflow: 'hidden',
    },
    cardHeader: {
        paddingTop: SPACING.md,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm,
    },
    cardTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(12),
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    loader: {
        paddingVertical: SPACING.lg,
        alignItems: 'center',
        gap: SPACING.sm
    },
    loaderText: {
        fontFamily: FONTS.regular,
        fontSize: fs(13),
        color: COLORS.textSecondary
    },
    empty: {
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.md,
        alignItems: 'center', gap: 4
    },
    emptyText: {
        fontFamily: FONTS.medium,
        fontSize: fs(13),
        color: COLORS.text
    },
    emptySub: {
        fontFamily: FONTS.regular,
        fontSize: fs(12),
        color: COLORS.textSecondary,
        textAlign: 'center'
    },

    destTabs: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
        gap: SPACING.xs
    },
    destTabsFull: {
        flexGrow: 1,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
        gap: SPACING.xs,
    },
    destTab: {
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    destTabFlex: {flex: 1},
    destTabActive: {backgroundColor: '#1a1a2e', borderColor: '#1a1a2e'},
    destTabText: {
        fontFamily: FONTS.medium,
        fontSize: fs(13),
        color: COLORS.textSecondary
    },
    destTabTextActive: {color: '#fff'},

    body: {
        marginTop: SPACING.sm,
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        gap: SPACING.md
    },

    periodRow: {gap: 1},
    periodText: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(13),
        color: COLORS.text,
    },
    periodSub: {
        fontFamily: FONTS.regular,
        fontSize: fs(12),
        color: COLORS.textSecondary,
    },

    dayTabs: {flexDirection: 'row', gap: SPACING.xs},
    dayTab: {
        alignItems: 'center',
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dayTabActive: {backgroundColor: COLORS.primary, borderColor: COLORS.primary},
    dayTabText: {
        fontFamily: FONTS.medium,
        fontSize: fs(11),
        color: COLORS.textSecondary,
        textTransform: 'capitalize'
    },
    dayTabTextActive: {color: '#fff'},

    conditionBlock: {alignItems: 'center', gap: 4},
    conditionIcon: {width: 72, height: 72, marginVertical: -SPACING.sm},
    conditionLabel: {
        fontFamily: FONTS.medium,
        fontSize: fs(15),
        color: COLORS.text
    },
    conditionTempRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    conditionTempMin: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(18),
        color: '#3b82f6'
    },
    conditionTempSep: {
        fontFamily: FONTS.regular,
        fontSize: fs(16),
        color: COLORS.textSecondary
    },
    conditionTempMax: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(18),
        color: '#ef4444'
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.sm,
        gap: 3,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
    },
    statCardFull: {
        flex: 0,
        width: '100%',
        minWidth: undefined
    },
    statEmoji: {fontSize: 20},
    statLabel: {
        fontFamily: FONTS.regular,
        fontSize: fs(12),
        color: COLORS.textSecondary
    },
    statValue: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(14),
        color: COLORS.text
    },
    aqiBlock: {gap: SPACING.sm},
    aqiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    aqiLabel: {
        fontFamily: FONTS.regular,
        fontSize: fs(13),
        color: COLORS.textSecondary
    },
    aqiValue: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(13)
    },
    aqiBarWrap: {
        position: 'relative',
        height: 10,
        borderRadius: 5,
        overflow: 'visible'
    },
    aqiBar: {
        flexDirection: 'row',
        height: 10,
        borderRadius: 5,
        overflow: 'hidden'
    },
    aqiSegment: {flex: 1},
    aqiDot: {
        position: 'absolute',
        top: -3,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#94a3b8',
        marginLeft: -8,
    },
    aqiBarLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    aqiBarLabel: {
        fontFamily: FONTS.regular,
        fontSize: fs(10),
        color: COLORS.textSecondary
    },
    gridAdviceGroup: {gap: SPACING.sm},
    adviceBox: {
        backgroundColor: '#FDF9C8',
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderWidth: 1,
        borderColor: '#fef08a',
    },
    adviceText: {
        fontFamily: FONTS.regular,
        fontSize: fs(13),
        color: '#713f12',
        lineHeight: fs(19)
    },
    sourceBlock: {alignItems: 'center', gap: 1},
    source: {
        fontFamily: FONTS.regular,
        fontSize: fs(11),
        color: COLORS.textSecondary
    },
})
