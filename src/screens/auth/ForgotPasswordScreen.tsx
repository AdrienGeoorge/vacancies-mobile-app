import React, {useState, useRef, useEffect} from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    Platform,
    ActivityIndicator,
    ImageBackground,
    Keyboard, Pressable,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import Svg, {Path} from 'react-native-svg'
import {NativeStackNavigationProp} from '@react-navigation/native-stack'
import {useTranslation} from 'react-i18next'
import {AuthStackParamList} from '../../types/navigation'
import {authApi} from '../../api/auth'
import {COLORS, SPACING, BORDER_RADIUS, FONTS, fs} from '../../constants'

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

function CheckCircleIcon() {
    return (
        <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
            <Path stroke={COLORS.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
        </Svg>
    )
}

function ErrorCircleIcon() {
    return (
        <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
            <Path stroke={COLORS.danger} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
        </Svg>
    )
}

type Props = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>
}

export default function ForgotPasswordScreen({navigation}: Props) {
    const {t} = useTranslation()
    const insets = useSafeAreaInsets()

    const emailRef = useRef<TextInput>(null)
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const keyboardHeight = useRef(new Animated.Value(0)).current
    useEffect(() => {
        const show = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            e => Animated.timing(keyboardHeight, {
                toValue: e.endCoordinates.height,
                duration: e.duration || 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
            }).start()
        )
        const hide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            e => Animated.timing(keyboardHeight, {
                toValue: 0,
                duration: e.duration || 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
            }).start()
        )
        return () => { show.remove(); hide.remove() }
    }, [keyboardHeight])

    const validate = () => {
        if (!email.trim()) {
            setEmailError(t('validation.emailRequired'))
            return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError(t('validation.emailInvalid'))
            return false
        }
        return true
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setIsLoading(true)
        try {
            await authApi.forgotPassword(email.trim())
            setSuccess(true)
        } catch(e: any) {
            setError(e?.response?.data?.message || t('errors.generic'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ImageBackground source={require('../../assets/hero-login.jpg')} style={styles.root} resizeMode="cover">
                <View style={styles.overlay}/>

                <Animated.View style={[styles.kav, {paddingBottom: keyboardHeight}]}>
                    <View style={[styles.header, {paddingTop: insets.top + SPACING.sm}]}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                            <BackArrow/>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{t('auth.forgotScreen.title')}</Text>
                        <Text style={styles.headerSubtitle}>{t('auth.forgotScreen.subtitle')}</Text>
                    </View>

                    <View style={styles.spacer}/>

                    <Pressable onPress={Keyboard.dismiss} style={[styles.card, {paddingBottom: insets.bottom + SPACING.lg}]}>
                        {success || error ? (
                            <View style={styles.responseContainer}>
                                {error ? <ErrorCircleIcon/> : <CheckCircleIcon/>}
                                <Text style={styles.responseTitle}>{ error ? 'Oops...' : t('auth.forgotScreen.successTitle')}</Text>
                                <Text style={styles.responseSubtitle}>{error ? error : t('auth.forgotScreen.successSubtitle')}</Text>
                                <TouchableOpacity
                                    style={styles.backToLoginBtn}
                                    onPress={() => error ? setError('') : navigation.navigate('Login', {initialTab: 'login'})}
                                    activeOpacity={0.85}
                                >
                                    { error ?
                                        <Text style={styles.backToLoginText}>{t('auth.forgotScreen.retry')}</Text> :
                                        <Text style={styles.backToLoginText}>{t('auth.forgotScreen.backToLogin')}</Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.form}>
                                <Text style={styles.cardDescription}>{t('auth.forgotScreen.cardDescription')}</Text>

                                <Pressable style={[styles.inputField, emailError ? styles.inputError : null]} onPress={() => emailRef.current?.focus()}>
                                    <MailIcon/>
                                    <View style={styles.inputInner}>
                                        <Text style={styles.inputLabel}>{t('auth.email')}</Text>
                                        <TextInput
                                            ref={emailRef}
                                            style={styles.inputText}
                                            value={email}
                                            onChangeText={v => {
                                                setEmail(v)
                                                if (emailError) setEmailError('')
                                            }}
                                            placeholder={t('auth.loginScreen.emailPlaceholder')}
                                            placeholderTextColor="#D1D5DB"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            autoComplete="email"
                                            returnKeyType="send"
                                            onSubmitEditing={handleSubmit}
                                        />
                                    </View>
                                </Pressable>
                                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                                <TouchableOpacity
                                    style={styles.submitBtn}
                                    onPress={handleSubmit}
                                    disabled={isLoading}
                                    activeOpacity={0.85}
                                >
                                    {isLoading
                                        ? <ActivityIndicator color="#fff" size="small"/>
                                        : <Text style={styles.submitBtnText}>{t('auth.forgotScreen.submit')}</Text>
                                    }
                                </TouchableOpacity>

                                <Text style={styles.spamNote}>{t('auth.forgotScreen.spamNote')}</Text>

                                <View style={styles.divider}/>

                                <TouchableOpacity
                                    style={styles.backToLoginInline}
                                    onPress={() => navigation.goBack()}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.backToLoginInlineText}>{t('auth.forgotScreen.backToLogin')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Pressable>
                </Animated.View>
            </ImageBackground>
    )
}

const styles = StyleSheet.create({
    root: {flex: 1, backgroundColor: DARK_BG},
    overlay: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'},
    kav: {flex: 1},
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
        fontSize: fs(30),
        color: '#ffffff',
        letterSpacing: -0.5,
        lineHeight: fs(36),
        marginBottom: 4,
    },
    headerSubtitle: {
        fontFamily: FONTS.regular,
        fontSize: fs(15),
        color: 'rgba(255,255,255,0.7)',
        lineHeight: fs(22),
        marginTop: 8,
    },

    card: {
        backgroundColor: '#ffffff',
        borderRadius: 40,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
        overflow: 'hidden',
    },

    form: {gap: SPACING.sm},

    cardDescription: {
        fontFamily: FONTS.regular,
        fontSize: fs(15),
        color: COLORS.textSecondary,
        lineHeight: fs(18),
        marginBottom: SPACING.sm,
        paddingHorizontal: SPACING.xs,
    },
    spamNote: {
        fontFamily: FONTS.regular,
        fontSize: fs(12),
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: fs(18),
        marginTop: SPACING.xs,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.sm,
    },
    backToLoginInline: {
        alignItems: 'center',
        paddingVertical: SPACING.xs,
    },
    backToLoginInlineText: {
        fontFamily: FONTS.medium,
        fontSize: fs(14),
        color: COLORS.primary,
    },

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
    inputLabel: {fontFamily: FONTS.regular, fontSize: fs(11), color: ICON_COLOR, marginBottom: 2},
    inputText: {fontFamily: FONTS.regular, fontSize: fs(15), color: COLORS.text, padding: 0},
    errorText: {fontFamily: FONTS.regular, fontSize: fs(12), color: COLORS.danger},

    submitBtn: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primaryBorder,
        borderWidth: 2,
        paddingVertical: 16,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
        marginTop: SPACING.xs,
    },
    submitBtnText: {fontFamily: FONTS.semiBold, color: '#fff', fontSize: fs(16)},

    responseContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        gap: SPACING.md,
    },
    responseTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: fs(22),
        color: COLORS.text,
        textAlign: 'center',
    },
    responseSubtitle: {
        fontFamily: FONTS.regular,
        fontSize: fs(15),
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: fs(22),
    },
    backToLoginBtn: {
        marginTop: SPACING.sm,
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primaryBorder,
        borderWidth: 2,
        paddingVertical: 14,
        paddingHorizontal: SPACING.xl,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
    },
    backToLoginText: {fontFamily: FONTS.semiBold, color: '#fff', fontSize: fs(15)},
})
