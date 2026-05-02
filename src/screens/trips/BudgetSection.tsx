import React, {useState} from 'react'
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform, Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import {BudgetCategoryKey, TripBudget, TripForecastBudget} from '../../types'
import {useTripStore} from '../../stores/tripStore'
import {BORDER_RADIUS, COLORS, FONTS, SPACING, fs} from '../../constants'
import {MinusIcon, PlusIcon} from "../../utils/icons.tsx"

const CAT_CONFIG: { key: BudgetCategoryKey; label: string; emoji: string; color: string; dimColor: string }[] = [
    {key: 'accommodations', label: 'Hébergements', emoji: '🏨', color: '#79C9BF', dimColor: '#B7EEE5'},
    {key: 'transports', label: 'Transports', emoji: '✈️', color: '#6888F4', dimColor: '#C3DAFC'},
    {key: 'activities', label: 'Activités', emoji: '🎡', color: '#B48FF5', dimColor: '#DCD6FC'},
    {key: 'various-expensive', label: 'Divers', emoji: '🛍️', color: '#F1C982', dimColor: '#F9E9A6'},
    {key: 'on-site', label: 'Sur place', emoji: '🍽️', color: '#E7B3F8', dimColor: '#fae8ff'},
]

const getCatAmounts = (budget: TripBudget, key: BudgetCategoryKey) => {
    const {reserved, nonReserved} = budget.details
    const paidMap = {
        'accommodations': reserved.accommodations.amount,
        'transports': reserved.transports.amount,
        'activities': reserved.activities.amount,
        'various-expensive': reserved['various-expensive'].amount,
        'on-site': reserved['on-site'].amount,
    }
    const toPayMap = {
        'accommodations': nonReserved.accommodations,
        'transports': nonReserved.transports,
        'activities': nonReserved.activities,
        'various-expensive': nonReserved['various-expensive'],
        'on-site': 0,
    }
    const paid = paidMap[key] ?? 0
    const toPay = toPayMap[key] ?? 0
    return {paid, toPay, total: paid + toPay}
}

const fmt = (n: number) => {
    return n.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})
}

interface Props {
    tripId: number
    budget: TripBudget
    forecast: TripForecastBudget | null
    countTravelers: number
    symbol: string
}

export default function BudgetSection({tripId, budget, forecast, countTravelers, symbol}: Props) {
    const saveForecastBudget = useTripStore(s => s.saveForecastBudget)
    const [modalVisible, setModalVisible] = useState(false)
    const [localForecast, setLocalForecast] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)
    const totalForecast = CAT_CONFIG.reduce((sum, c) => {
        const v = forecast?.[c.key]
        return sum + (v != null ? v : 0)
    }, 0)
    const hasForecast = totalForecast > 0
    const globalPercent = hasForecast ? (budget.total / totalForecast) * 100 : 0
    const isGlobalOver = hasForecast && budget.total > totalForecast

    const openModal = () => {
        const init: Record<string, string> = {}
        CAT_CONFIG.forEach(c => {
            const v = forecast?.[c.key]
            init[c.key] = v != null ? String(v) : ''
        })
        setLocalForecast(init)
        setModalVisible(true)
    }

    const handleSave = async () => {
        setSaving(true)
        const data: TripForecastBudget = {}
        CAT_CONFIG.forEach(c => {
            const raw = localForecast[c.key]?.replace(',', '.') ?? ''
            const v = raw !== '' ? parseFloat(raw) : null
            data[c.key] = (v != null && !isNaN(v)) ? v : null
        })
        try {
            await saveForecastBudget(tripId, data)
            setModalVisible(false)
        } catch {
            Alert.alert('Erreur', 'Impossible de sauvegarder le budget prévisionnel.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <View>
            <View style={s.summaryCard}>
                <View style={s.summaryTop}>
                    <Text style={s.summaryTitle}>Budget total</Text>
                    <TouchableOpacity onPress={openModal} style={s.editBtn}>
                        <Text style={s.editBtnText}>
                            {hasForecast ? 'Modifier le budget' : 'Définir un budget'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={s.summaryAmountRow}>
                    <Text style={[s.summaryAmount]}>
                        {fmt(budget.total)} {symbol}
                    </Text>
                    {hasForecast && (
                        <Text style={s.summaryForecastLabel}> / {fmt(totalForecast)} {symbol}</Text>
                    )}
                </View>

                {hasForecast && (
                    <>
                        <View style={s.globalTrack}>
                            <View style={{
                                width: `${Math.min(globalPercent, 100)}%` as any,
                                height: '100%',
                                flexDirection: 'row',
                                overflow: 'hidden',
                                borderRadius: 5,
                            }}>
                                {CAT_CONFIG.map(cat => {
                                    const {total} = getCatAmounts(budget, cat.key)
                                    if (total === 0) return null
                                    return (
                                        <View key={cat.key} style={{flex: total, backgroundColor: cat.color}}/>
                                    )
                                })}
                            </View>
                        </View>
                        <View style={s.globalFooter}>
                            {
                                !isGlobalOver && (
                                    <Text style={[s.globalPercent, isGlobalOver && {color: '#ef4444'}]}>
                                        {globalPercent.toFixed(0)}% du budget
                                    </Text>
                                )
                            }
                            {isGlobalOver && (
                                <View style={s.badge}>
                                    <Text style={s.badgeText}>
                                        Budget dépassé de {fmt(budget.total - totalForecast)} {symbol}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                )}

                <View style={s.divider}/>

                <View style={s.statsRow}>
                    <View style={s.statItem}>
                        <Text style={s.statLabel}>Payé</Text>
                        <Text style={[s.statValue, {color: '#059669'}]}>{fmt(budget.paid)} {symbol}</Text>
                    </View>
                    <View style={s.statSep}/>
                    <View style={s.statItem}>
                        <Text style={s.statLabel}>À régler</Text>
                        <Text style={[s.statValue, {color: '#d97706'}]}>{fmt(budget.toPay)} {symbol}</Text>
                    </View>
                    {countTravelers > 1 && (
                        <>
                            <View style={s.statSep}/>
                            <View style={s.statItem}>
                                <Text style={s.statLabel}>Par pers.</Text>
                                <Text style={s.statValue}>{fmt(budget.total / countTravelers)} {symbol}</Text>
                            </View>
                        </>
                    )}
                </View>
            </View>

            {CAT_CONFIG.map(cat => {
                const {paid, toPay, total} = getCatAmounts(budget, cat.key)
                const catForecast = forecast?.[cat.key] ?? null
                if (total === 0 && catForecast == null) return null

                const isOver = catForecast != null && total > catForecast
                const catPct = catForecast ? Math.min((total / catForecast) * 100, 100) : null
                const paidShare = total > 0 ? paid / total : 1

                return (
                    <View key={cat.key} style={s.catCard}>
                        <View style={s.catHeader}>
                            <Text style={s.catEmoji}>{cat.emoji}</Text>
                            <View style={s.catHeaderMid}>
                                <Text style={s.catLabel}>{cat.label}</Text>
                                {toPay > 0 && (
                                    <Text style={s.catToPay}>À régler : {fmt(toPay)} {symbol}</Text>
                                )}
                            </View>
                            <View style={s.catAmounts}>
                                <Text style={[s.catTotal, isOver && {color: '#ef4444'}]}>
                                    {fmt(total)} {symbol}
                                </Text>
                                {catForecast != null && (
                                    <Text style={s.catForecast}>/ {fmt(catForecast)} {symbol}</Text>
                                )}
                            </View>
                        </View>

                        <View style={s.catTrack}>
                            {isOver ? (
                                <View style={[s.catFill, {width: '100%' as any, backgroundColor: '#ef4444'}]}/>
                            ) : catPct != null ? (
                                <View style={[s.catFill, {
                                    width: `${catPct}%` as any,
                                    flexDirection: 'row',
                                    overflow: 'hidden'
                                }]}>
                                    <View style={{flex: paidShare, backgroundColor: cat.color}}/>
                                    <View style={{flex: 1 - paidShare, backgroundColor: cat.dimColor}}/>
                                </View>
                            ) : (
                                <View style={[s.catFill, {
                                    width: '100%' as any,
                                    flexDirection: 'row',
                                    overflow: 'hidden'
                                }]}>
                                    <View style={{flex: paidShare, backgroundColor: cat.color}}/>
                                    {toPay > 0 && <View style={{flex: 1 - paidShare, backgroundColor: cat.dimColor}}/>}
                                </View>
                            )}
                        </View>

                        {catPct != null && (
                            <View style={s.catFooter}>
                                <Text style={[s.catPct, isOver && {color: '#ef4444'}]}>
                                    {isOver
                                        ? `${((total / catForecast!) * 100).toFixed(0)}%`
                                        : `${catPct.toFixed(0)}%`}
                                </Text>
                                {isOver && (
                                    <View style={s.badge}>
                                        <Text style={s.badgeText}>
                                            Dépassé de {fmt(total - catForecast!)} {symbol}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                )
            })}

            <Modal visible={modalVisible} animationType="slide" transparent
                   onRequestClose={() => setModalVisible(false)}>
                <Pressable style={s.modalOverlay} onPress={() => setModalVisible(false)}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalSheet}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Budget prévisionnel</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={s.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
                            <Text style={s.modalHint}>
                                Définissez le budget prévu pour chaque catégorie. Laissez vide pour ne pas fixer de
                                limite.
                            </Text>
                            {CAT_CONFIG.map((cat, key) => (
                                <View key={cat.key}
                                      style={[s.modalRow, {borderBottomWidth: key === CAT_CONFIG.length - 1 ? 0 : 1}]}>
                                    <Text style={s.modalRowEmoji}>{cat.emoji}</Text>
                                    <Text style={s.modalRowLabel}>{cat.label}</Text>
                                    <View style={s.modalRowInput}>
                                        <TouchableOpacity style={s.modalInputButton} onPress={() => setLocalForecast(p => ({...p, [cat.key]: (parseInt(p[cat.key], 10) - 50).toString()}))}>
                                            <MinusIcon/>
                                        </TouchableOpacity>
                                        <View style={s.modalInputWrap}>
                                            <TextInput
                                                style={s.modalInput}
                                                value={localForecast[cat.key] ?? ''}
                                                onChangeText={v => setLocalForecast(p => ({...p, [cat.key]: v}))}
                                                placeholder="—"
                                                placeholderTextColor={COLORS.textSecondary}
                                                keyboardType="decimal-pad"
                                            />
                                            <Text style={s.modalInputSuffix}>{symbol}</Text>
                                        </View>
                                        <TouchableOpacity style={s.modalInputButton} onPress={() => setLocalForecast(p => ({...p, [cat.key]: (parseInt(p[cat.key], 10) + 50).toString()}))}>
                                            <PlusIcon size={16} color={'#000'} strokeWidth={1.5}/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={s.modalFooter}>
                            <TouchableOpacity style={[s.saveBtn, saving && {opacity: 0.6}]} onPress={handleSave}
                                              disabled={saving}>
                                <Text style={s.saveBtnText}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </View>
    )
}

const s = StyleSheet.create({
    summaryCard: {
        backgroundColor: '#fff',
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        borderRadius: BORDER_RADIUS.xl,
    },
    summaryTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs},
    summaryTitle: {fontFamily: FONTS.semiBold, fontSize: fs(15), color: COLORS.text},
    editBtn: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: '#f1f5f9',
    },
    editBtnText: {fontFamily: FONTS.medium, fontSize: fs(12), color: COLORS.textSecondary},
    summaryAmountRow: {flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.sm},
    summaryAmount: {fontFamily: FONTS.display, fontSize: fs(26), color: COLORS.text, letterSpacing: -0.5},
    summaryForecastLabel: {fontFamily: FONTS.regular, fontSize: fs(14), color: COLORS.textSecondary},

    globalTrack: {height: 10, backgroundColor: '#e2e8f0', borderRadius: 5, overflow: 'hidden'},
    globalFill: {height: '100%', borderRadius: 5},
    globalFooter: {flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 6},
    globalPercent: {fontFamily: FONTS.semiBold, fontSize: fs(13), color: COLORS.text},

    divider: {height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm},

    statsRow: {flexDirection: 'row', alignItems: 'center'},
    statItem: {flex: 1, alignItems: 'center'},
    statSep: {width: 1, height: 32, backgroundColor: COLORS.border},
    statLabel: {fontFamily: FONTS.regular, fontSize: fs(11), color: COLORS.textSecondary, marginBottom: 2},
    statValue: {fontFamily: FONTS.semiBold, fontSize: fs(14), color: COLORS.text},

    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeWarn: {backgroundColor: '#fef3c7'},
    badgeText: {fontFamily: FONTS.medium, fontSize: fs(11), color: '#be123c'},

    catCard: {
        backgroundColor: '#fff',
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
        borderRadius: BORDER_RADIUS.xl,
    },
    catHeader: {flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm},
    catEmoji: {fontSize: 20, width: 28, textAlign: 'center'},
    catHeaderMid: {flex: 1},
    catLabel: {fontFamily: FONTS.semiBold, fontSize: fs(14), color: COLORS.text},
    catToPay: {fontFamily: FONTS.regular, fontSize: fs(12), color: '#d97706', marginTop: 1},
    catAmounts: {alignItems: 'flex-end'},
    catTotal: {fontFamily: FONTS.semiBold, fontSize: fs(14), color: COLORS.text},
    catForecast: {fontFamily: FONTS.regular, fontSize: fs(11), color: COLORS.textSecondary, marginTop: 1},

    catTrack: {height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginTop: SPACING.sm},
    catFill: {height: '100%', borderRadius: 4},

    catFooter: {flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 6},
    catPct: {fontFamily: FONTS.medium, fontSize: fs(12), color: COLORS.textSecondary},

    modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end'},
    modalSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: {fontFamily: FONTS.semiBold, fontSize: fs(17), color: COLORS.text},
    modalClose: {fontFamily: FONTS.regular, fontSize: fs(18), color: COLORS.textSecondary, padding: 4},
    modalBody: {padding: SPACING.md},
    modalHint: {
        fontFamily: FONTS.regular,
        fontSize: fs(13),
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
        lineHeight: fs(19),
    },
    modalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: SPACING.sm,
    },
    modalRowEmoji: {fontSize: 20, width: 28, textAlign: 'center'},
    modalRowLabel: {flex: 1, fontFamily: FONTS.medium, fontSize: fs(14), color: COLORS.text},
    modalRowInput: {display: 'flex', flexDirection: 'row', gap: 6},
    modalInputButton: {
        backgroundColor: '#f6f6f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.sm,
        borderRadius: 10,
        width: 30,
    },
    modalInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: SPACING.sm,
        backgroundColor: '#f8fafc',
        minWidth: 110,
    },
    modalInput: {
        flex: 1,
        fontFamily: FONTS.regular,
        fontSize: fs(14),
        color: COLORS.text,
        paddingVertical: 8,
        textAlign: 'right',
    },
    modalInputSuffix: {
        fontFamily: FONTS.regular,
        fontSize: fs(14),
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    modalFooter: {
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.xl,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveBtnText: {fontFamily: FONTS.semiBold, fontSize: fs(15), color: '#fff'},
})
