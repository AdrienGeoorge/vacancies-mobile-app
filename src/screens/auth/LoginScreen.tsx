import React, {useState} from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Keyboard,
    ImageBackground,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import Svg, {Path} from 'react-native-svg'
import {NativeStackNavigationProp} from '@react-navigation/native-stack'
import {RouteProp} from '@react-navigation/native'
import {useTranslation} from 'react-i18next'
import {AuthStackParamList} from '../../types/navigation'
import {useAuthStore} from '../../stores/authStore'
import {COLORS, SPACING, BORDER_RADIUS, FONTS} from '../../constants'

const DARK_BG = '#1C1C1E'
const ICON_COLOR = '#9CA3AF'

function BackArrow() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
        </Svg>
    )
}

function MailIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path stroke={ICON_COLOR} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
        </Svg>
    )
}

function LockIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path stroke={ICON_COLOR} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
        </Svg>
    )
}

function UserIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path stroke={ICON_COLOR} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
        </Svg>
    )
}

function EyeIcon({visible}: { visible: boolean }) {
    return visible ? (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path stroke={ICON_COLOR} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
            <Path stroke={ICON_COLOR} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
        </Svg>
    ) : (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path stroke={ICON_COLOR} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
        </Svg>
    )
}

function GoogleLogo() {
    return (
        <Svg width={20} height={20} viewBox="0 0 48 48">
            <Path fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <Path fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <Path fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <Path fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </Svg>
    )
}

type Tab = 'login' | 'register'

type Props = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>
    route: RouteProp<AuthStackParamList, 'Login'>
}

export default function LoginScreen({navigation, route}: Props) {
    const {t} = useTranslation()
    const insets = useSafeAreaInsets()
    const login = useAuthStore(state => state.login)
    const register = useAuthStore(state => state.register)

    const [activeTab, setActiveTab] = useState<Tab>(route.params?.initialTab ?? 'login')
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({firstname: '', lastname: '', email: '', password: ''})

    const switchTab = (tab: Tab) => {
        Keyboard.dismiss()
        setActiveTab(tab)
        setErrors({firstname: '', lastname: '', email: '', password: ''})
    }

    const validate = () => {
        const newErrors = {firstname: '', lastname: '', email: '', password: ''}
        let valid = true

        if (activeTab === 'register') {
            if (!firstname.trim()) {
                newErrors.firstname = t('validation.firstnameRequired');
                valid = false
            }
            if (!lastname.trim()) {
                newErrors.lastname = t('validation.lastnameRequired');
                valid = false
            }
        }

        if (!email.trim()) {
            newErrors.email = t('validation.emailRequired');
            valid = false
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = t('validation.emailInvalid');
            valid = false
        }

        if (!password) {
            newErrors.password = t('validation.passwordRequired');
            valid = false
        } else if (activeTab === 'register' && password.length < 8) {
            newErrors.password = t('validation.passwordTooShort');
            valid = false
        }

        setErrors(newErrors)
        return valid
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setIsLoading(true)
        try {
            if (activeTab === 'login') {
                await login(email.trim(), password)
            } else {
                await register(firstname.trim(), lastname.trim(), email.trim(), password)
            }
        } catch (error: any) {
            Alert.alert(t('common.error'), error?.response?.data?.message || t('errors.generic'))
        } finally {
            setIsLoading(false)
        }
    }

    const title = activeTab === 'login' ? t('auth.loginScreen.title') : t('auth.registerScreen.title')
    const subtitle = activeTab === 'login' ? t('auth.loginScreen.subtitle') : t('auth.registerScreen.subtitle')
    const submitLabel = activeTab === 'login' ? t('auth.loginScreen.submit') : t('auth.registerScreen.submit')

    return (
        <ImageBackground source={require('../../assets/hero-login.jpg')} style={styles.root} resizeMode="cover">
            <View style={styles.overlay}/>
            <View style={[styles.header, {paddingTop: insets.top + SPACING.sm}]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <BackArrow/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>

            <View style={styles.spacer}/>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={[styles.card, {paddingBottom: insets.bottom + SPACING.md}]}>
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'login' && styles.tabActive]}
                                onPress={() => switchTab('login')}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                                    {t('auth.loginTab')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'register' && styles.tabActive]}
                                onPress={() => switchTab('register')}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>
                                    {t('auth.registerTab')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.form}>
                            {activeTab === 'register' && (
                                <>
                                    <View style={styles.nameRow}>
                                        <View
                                            style={[styles.inputField, styles.nameField, errors.firstname && styles.inputError]}>
                                            <UserIcon/>
                                            <View style={styles.inputInner}>
                                                <Text style={styles.inputLabel}>{t('auth.firstname')}</Text>
                                                <TextInput
                                                    style={styles.inputText}
                                                    value={firstname}
                                                    onChangeText={v => {
                                                        setFirstname(v);
                                                        if (errors.firstname) setErrors(e => ({...e, firstname: ''}))
                                                    }}
                                                    placeholder={t('auth.registerScreen.firstnamePlaceholder')}
                                                    placeholderTextColor="#D1D5DB"
                                                    autoCapitalize="words"
                                                    autoComplete="given-name"
                                                    returnKeyType="next"
                                                />
                                            </View>
                                        </View>
                                        <View
                                            style={[styles.inputField, styles.nameField, errors.lastname && styles.inputError]}>
                                            <UserIcon/>
                                            <View style={styles.inputInner}>
                                                <Text style={styles.inputLabel}>{t('auth.lastname')}</Text>
                                                <TextInput
                                                    style={styles.inputText}
                                                    value={lastname}
                                                    onChangeText={v => {
                                                        setLastname(v);
                                                        if (errors.lastname) setErrors(e => ({...e, lastname: ''}))
                                                    }}
                                                    placeholder={t('auth.registerScreen.lastnamePlaceholder')}
                                                    placeholderTextColor="#D1D5DB"
                                                    autoCapitalize="words"
                                                    autoComplete="family-name"
                                                    returnKeyType="next"
                                                />
                                            </View>
                                        </View>
                                    </View>
                                    {(errors.firstname || errors.lastname) && (
                                        <View style={styles.nameRow}>
                                            <Text style={[styles.errorText, styles.nameField]}>{errors.firstname}</Text>
                                            <Text style={[styles.errorText, styles.nameField]}>{errors.lastname}</Text>
                                        </View>
                                    )}
                                </>
                            )}
                            <View style={[styles.inputField, errors.email && styles.inputError]}>
                                <MailIcon/>
                                <View style={styles.inputInner}>
                                    <Text style={styles.inputLabel}>{t('auth.email')}</Text>
                                    <TextInput
                                        style={styles.inputText}
                                        value={email}
                                        onChangeText={v => {
                                            setEmail(v);
                                            if (errors.email) setErrors(e => ({...e, email: ''}))
                                        }}
                                        placeholder={t('auth.loginScreen.emailPlaceholder')}
                                        placeholderTextColor="#D1D5DB"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        autoComplete="email"
                                        returnKeyType="next"
                                    />
                                </View>
                            </View>
                            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                            <View style={[styles.inputField, errors.password && styles.inputError]}>
                                <LockIcon/>
                                <View style={styles.inputInner}>
                                    <Text style={styles.inputLabel}>{t('auth.password')}</Text>
                                    <TextInput
                                        style={styles.inputText}
                                        value={password}
                                        onChangeText={v => {
                                            setPassword(v);
                                            if (errors.password) setErrors(e => ({...e, password: ''}))
                                        }}
                                        placeholder={activeTab === 'login' ? t('auth.loginScreen.passwordPlaceholder') : t('auth.registerScreen.passwordPlaceholder')}
                                        placeholderTextColor="#D1D5DB"
                                        secureTextEntry={!showPassword}
                                        autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                                        returnKeyType="done"
                                        onSubmitEditing={handleSubmit}
                                    />
                                </View>
                                <TouchableOpacity onPress={() => setShowPassword(v => !v)}
                                                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                                    <EyeIcon visible={showPassword}/>
                                </TouchableOpacity>
                            </View>
                            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

                            {activeTab === 'login' && (
                                <TouchableOpacity style={styles.forgotRow}
                                                  onPress={() => navigation.navigate('ForgotPassword')}>
                                    <Text style={styles.forgotText}>{t('auth.loginScreen.forgotPasswordShort')}</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading}
                                              activeOpacity={0.85}>
                                {isLoading
                                    ? <ActivityIndicator color="#fff" size="small"/>
                                    : <Text style={styles.submitBtnText}>{submitLabel}</Text>
                                }
                            </TouchableOpacity>
                        </View>

                        <View style={styles.separator}>
                            <View style={styles.separatorLine}/>
                            <Text style={styles.separatorText}>
                                {activeTab === 'login' ? t('auth.orLoginWith') : t('auth.orRegisterWith')}
                            </Text>
                            <View style={styles.separatorLine}/>
                        </View>
                        <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
                            <GoogleLogo/>
                            <Text style={styles.googleBtnText}>{t('auth.loginScreen.googleBtn')}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    root: {flex: 1, backgroundColor: DARK_BG},
    overlay: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'},
    spacer: {flex: 1},

    header: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    headerTitle: {
        fontFamily: FONTS.display,
        fontSize: 30,
        color: '#ffffff',
        letterSpacing: -0.5,
        lineHeight: 36,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontFamily: FONTS.regular,
        fontSize: 15,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 22,
        marginTop: 8,
    },

    card: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    scroll: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.sm,
    },

    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F2',
        borderRadius: BORDER_RADIUS.full,
        padding: 4,
        marginBottom: SPACING.lg,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.full,
    },
    tabActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {fontFamily: FONTS.medium, fontSize: 14, color: '#9CA3AF'},
    tabTextActive: {fontFamily: FONTS.semiBold, color: '#111827'},

    form: {gap: SPACING.sm},

    nameRow: {flexDirection: 'row', gap: SPACING.sm},
    nameField: {flex: 1},

    inputField: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: 10,
        gap: SPACING.sm,
    },
    inputError: {borderColor: COLORS.danger},
    inputInner: {flex: 1},
    inputLabel: {fontFamily: FONTS.regular, fontSize: 11, color: ICON_COLOR, marginBottom: 2},
    inputText: {fontFamily: FONTS.regular, fontSize: 15, color: COLORS.text, padding: 0},

    errorText: {fontFamily: FONTS.regular, fontSize: 12, color: COLORS.danger},

    forgotRow: {alignItems: 'flex-end'},
    forgotText: {fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textSecondary},

    submitBtn: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primaryBorder,
        borderWidth: 2,
        paddingVertical: 16,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
    },
    submitBtnText: {fontFamily: FONTS.semiBold, color: '#fff', fontSize: 16},

    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginVertical: SPACING.lg,
    },
    separatorLine: {flex: 1, height: 1, backgroundColor: COLORS.border},
    separatorText: {fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textSecondary},

    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.full,
        paddingVertical: 14,
        backgroundColor: '#ffffff',
    },
    googleBtnText: {fontFamily: FONTS.medium, fontSize: 15, color: COLORS.text},
})
