import React, {useState, useRef, useEffect} from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    ScrollView,
    Animated,
    Easing,
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
import {COLORS, SPACING, BORDER_RADIUS, FONTS, fs} from '../../constants'
import {authApi} from '../../api/auth'
import {openGoogleAuth} from '../../components/GoogleAuthWebView'
import {BackArrow, GoogleLogo, LockIcon, MailIcon, UserIcon} from "../../utils/icons.tsx"

const DARK_BG = '#1C1C1E'
const ICON_COLOR = '#9CA3AF'

const EyeIcon = ({visible}: { visible: boolean }) => {
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


type LoginFormProps = {
    onSubmit: (email: string, password: string) => Promise<void>
    onForgotPassword: () => void
}

const LoginForm = ({onSubmit, onForgotPassword}: LoginFormProps) => {
    const {t} = useTranslation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({email: '', password: ''})
    const emailRef = useRef<TextInput>(null)
    const passwordRef = useRef<TextInput>(null)
    const validate = () => {
        const e = {email: '', password: ''}
        let valid = true
        if (!email.trim()) {
            e.email = t('validation.emailRequired');
            valid = false
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            e.email = t('validation.emailInvalid');
            valid = false
        }
        if (!password) {
            e.password = t('validation.passwordRequired');
            valid = false
        }
        setErrors(e)
        return valid
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setIsLoading(true)
        try {
            await onSubmit(email.trim(), password)
        } catch (err: any) {
            Alert.alert(t('common.error'), err?.response?.data?.message || t('errors.generic'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View style={styles.form}>
            <Pressable style={[styles.inputField, errors.email ? styles.inputError : undefined]}
                       onPress={() => emailRef.current?.focus()}>
                <MailIcon/>
                <View style={styles.inputInner}>
                    <Text style={styles.inputLabel}>{t('auth.email')}</Text>
                    <TextInput
                        ref={emailRef}
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
                        textContentType="username"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        submitBehavior="submit"
                    />
                </View>
            </Pressable>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            <Pressable style={[styles.inputField, errors.password ? styles.inputError : undefined]}
                       onPress={() => passwordRef.current?.focus()}>
                <LockIcon/>
                <View style={styles.inputInner}>
                    <Text style={styles.inputLabel}>{t('auth.password')}</Text>
                    {showPassword ? (
                        <TextInput
                            ref={passwordRef}
                            style={styles.inputText}
                            value={password}
                            onChangeText={v => {
                                setPassword(v);
                                if (errors.password) setErrors(e => ({...e, password: ''}))
                            }}
                            placeholder={t('auth.loginScreen.passwordPlaceholder')}
                            placeholderTextColor="#D1D5DB"
                            secureTextEntry={false}
                            textContentType="none"
                            autoComplete="off"
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                        />
                    ) : (
                        <TextInput
                            ref={passwordRef}
                            style={styles.inputText}
                            value={password}
                            onChangeText={v => {
                                setPassword(v);
                                if (errors.password) setErrors(e => ({...e, password: ''}))
                            }}
                            onEndEditing={e => setPassword(e.nativeEvent.text)}
                            placeholder={t('auth.loginScreen.passwordPlaceholder')}
                            placeholderTextColor="#D1D5DB"
                            secureTextEntry={true}
                            textContentType="password"
                            autoComplete="off"
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                        />
                    )}
                </View>
                <TouchableOpacity onPress={() => setShowPassword(v => !v)}
                                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <EyeIcon visible={showPassword}/>
                </TouchableOpacity>
            </Pressable>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            <TouchableOpacity style={styles.forgotRow} onPress={onForgotPassword}>
                <Text style={styles.forgotText}>{t('auth.loginScreen.forgotPasswordShort')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.85}>
                {isLoading
                    ? <ActivityIndicator color="#fff" size="small"/>
                    : <Text style={styles.submitBtnText}>{t('auth.loginScreen.submit')}</Text>
                }
            </TouchableOpacity>
        </View>
    )
}

type RegisterFormProps = {
    onSubmit: (firstname: string, lastname: string, email: string, password: string) => Promise<void>
}

const RegisterForm = ({onSubmit}: RegisterFormProps) => {
    const {t} = useTranslation()
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({firstname: '', lastname: '', email: '', password: ''})
    const firstnameRef = useRef<TextInput>(null)
    const lastnameRef = useRef<TextInput>(null)
    const emailRef = useRef<TextInput>(null)
    const passwordRef = useRef<TextInput>(null)

    const validate = () => {
        const e = {firstname: '', lastname: '', email: '', password: ''}
        let valid = true
        if (!firstname.trim()) {
            e.firstname = t('validation.firstnameRequired');
            valid = false
        }
        if (!lastname.trim()) {
            e.lastname = t('validation.lastnameRequired');
            valid = false
        }
        if (!email.trim()) {
            e.email = t('validation.emailRequired');
            valid = false
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            e.email = t('validation.emailInvalid');
            valid = false
        }
        if (!password) {
            e.password = t('validation.passwordRequired');
            valid = false
        } else if (password.length < 8) {
            e.password = t('validation.passwordTooShort');
            valid = false
        }
        setErrors(e)
        return valid
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setIsLoading(true)
        try {
            await onSubmit(firstname.trim(), lastname.trim(), email.trim(), password)
        } catch (err: any) {
            Alert.alert(t('common.error'), err?.response?.data?.message || t('errors.generic'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View style={styles.form}>
            <View style={styles.nameRow}>
                <Pressable
                    style={[styles.inputField, styles.nameField, errors.firstname ? styles.inputError : undefined]}
                    onPress={() => firstnameRef.current?.focus()}>
                    <UserIcon/>
                    <View style={styles.inputInner}>
                        <Text style={styles.inputLabel}>{t('auth.firstname')}</Text>
                        <TextInput
                            ref={firstnameRef}
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
                            textContentType="givenName"
                            returnKeyType="next"
                            onSubmitEditing={() => lastnameRef.current?.focus()}
                            submitBehavior="submit"
                        />
                    </View>
                </Pressable>
                <Pressable
                    style={[styles.inputField, styles.nameField, errors.lastname ? styles.inputError : undefined]}
                    onPress={() => lastnameRef.current?.focus()}>
                    <UserIcon/>
                    <View style={styles.inputInner}>
                        <Text style={styles.inputLabel}>{t('auth.lastname')}</Text>
                        <TextInput
                            ref={lastnameRef}
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
                            textContentType="familyName"
                            returnKeyType="next"
                            onSubmitEditing={() => emailRef.current?.focus()}
                            submitBehavior="submit"
                        />
                    </View>
                </Pressable>
            </View>
            {(errors.firstname || errors.lastname) && (
                <View style={styles.nameRow}>
                    <Text style={[styles.errorText, styles.nameField]}>{errors.firstname}</Text>
                    <Text style={[styles.errorText, styles.nameField]}>{errors.lastname}</Text>
                </View>
            )}

            <Pressable style={[styles.inputField, errors.email ? styles.inputError : undefined]}
                       onPress={() => emailRef.current?.focus()}>
                <MailIcon/>
                <View style={styles.inputInner}>
                    <Text style={styles.inputLabel}>{t('auth.email')}</Text>
                    <TextInput
                        ref={emailRef}
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
                        textContentType="emailAddress"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        submitBehavior="submit"
                    />
                </View>
            </Pressable>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            <Pressable style={[styles.inputField, errors.password ? styles.inputError : undefined]}
                       onPress={() => passwordRef.current?.focus()}>
                <LockIcon/>
                <View style={styles.inputInner}>
                    <Text style={styles.inputLabel}>{t('auth.password')}</Text>
                    {showPassword ? (
                        <TextInput
                            ref={passwordRef}
                            style={styles.inputText}
                            value={password}
                            onChangeText={v => {
                                setPassword(v);
                                if (errors.password) setErrors(e => ({...e, password: ''}))
                            }}
                            placeholder={t('auth.registerScreen.passwordPlaceholder')}
                            placeholderTextColor="#D1D5DB"
                            secureTextEntry={false}
                            textContentType="none"
                            autoComplete="off"
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                        />
                    ) : (
                        <TextInput
                            ref={passwordRef}
                            style={styles.inputText}
                            value={password}
                            onChangeText={v => {
                                setPassword(v);
                                if (errors.password) setErrors(e => ({...e, password: ''}))
                            }}
                            onEndEditing={e => setPassword(e.nativeEvent.text)}
                            placeholder={t('auth.registerScreen.passwordPlaceholder')}
                            placeholderTextColor="#D1D5DB"
                            secureTextEntry={true}
                            textContentType="none"
                            autoComplete="off"
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                        />
                    )}
                </View>
                <TouchableOpacity onPress={() => setShowPassword(v => !v)}
                                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <EyeIcon visible={showPassword}/>
                </TouchableOpacity>
            </Pressable>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.85}>
                {isLoading
                    ? <ActivityIndicator color="#fff" size="small"/>
                    : <Text style={styles.submitBtnText}>{t('auth.registerScreen.submit')}</Text>
                }
            </TouchableOpacity>
        </View>
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
    const loginWithToken = useAuthStore(state => state.loginWithToken)

    const [activeTab, setActiveTab] = useState<Tab>(route.params?.initialTab ?? 'login')

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
        return () => {
            show.remove();
            hide.remove()
        }
    }, [keyboardHeight])

    const switchTab = (tab: Tab) => {
        Keyboard.dismiss()
        setActiveTab(tab)
    }

    const handleGooglePress = async () => {
        try {
            const {authUrl, redirectUri, codeVerifier} = await authApi.googleAuthUrl()
            const code = await openGoogleAuth(authUrl, redirectUri)
            if (!code) return
            const data = await authApi.googleCallback(code, codeVerifier)
            await loginWithToken(data.token, data.user)
        } catch (e: any) {
            Alert.alert(t('common.error'), e?.response?.data?.message || t('errors.generic'))
        }
    }

    const title = activeTab === 'login' ? t('auth.loginScreen.title') : t('auth.registerScreen.title')
    const subtitle = activeTab === 'login' ? t('auth.loginScreen.subtitle') : t('auth.registerScreen.subtitle')

    return (
        <ImageBackground source={require('../../assets/hero-login.jpg')} style={styles.root} resizeMode="cover">
            <View style={styles.overlay}/>
            <Animated.View style={[styles.kav, {paddingBottom: keyboardHeight}]}>
                <View style={[styles.header, {paddingTop: insets.top + SPACING.sm}]}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                        <BackArrow/>
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>{title}</Text>
                        <Text style={styles.headerSubtitle}>{subtitle}</Text>
                    </View>
                </View>

                <View style={styles.spacer}/>

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

                        {activeTab === 'login' ? (
                            <LoginForm
                                onSubmit={login}
                                onForgotPassword={() => navigation.navigate('ForgotPassword')}
                            />
                        ) : (
                            <RegisterForm onSubmit={register}/>
                        )}

                        <View style={styles.separator}>
                            <View style={styles.separatorLine}/>
                            <Text style={styles.separatorText}>
                                {activeTab === 'login' ? t('auth.orLoginWith') : t('auth.orRegisterWith')}
                            </Text>
                            <View style={styles.separatorLine}/>
                        </View>
                        <TouchableOpacity style={styles.googleBtn} onPress={handleGooglePress} activeOpacity={0.85}>
                            <GoogleLogo/>
                            <Text style={styles.googleBtnText}>{t('auth.loginScreen.googleBtn')}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Animated.View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    root: {flex: 1, backgroundColor: DARK_BG},
    overlay: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'},
    kav: {flex: 1},
    spacer: {flex: 1},

    header: {paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl},
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl
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

    card: {backgroundColor: '#ffffff', borderRadius: 40, overflow: 'hidden'},
    scroll: {paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm},

    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F2',
        borderRadius: BORDER_RADIUS.full,
        padding: 4,
        marginBottom: SPACING.lg,
    },
    tab: {flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BORDER_RADIUS.full},
    tabActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {fontFamily: FONTS.medium, fontSize: fs(14), color: '#9CA3AF'},
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
    inputLabel: {fontFamily: FONTS.regular, fontSize: fs(11), color: ICON_COLOR, marginBottom: 2},
    inputText: {fontFamily: FONTS.regular, fontSize: fs(15), color: COLORS.text, padding: 0},

    errorText: {fontFamily: FONTS.regular, fontSize: fs(12), color: COLORS.danger},

    forgotRow: {alignItems: 'flex-end'},
    forgotText: {fontFamily: FONTS.medium, fontSize: fs(13), color: COLORS.textSecondary, marginVertical: 4},

    submitBtn: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primaryBorder,
        borderWidth: 2,
        paddingVertical: 16,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
    },
    submitBtnText: {fontFamily: FONTS.semiBold, color: '#fff', fontSize: fs(16)},

    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginVertical: SPACING.lg,
    },
    separatorLine: {flex: 1, height: 1, backgroundColor: COLORS.border},
    separatorText: {fontFamily: FONTS.regular, fontSize: fs(12), color: COLORS.textSecondary},

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
    googleBtnText: {fontFamily: FONTS.medium, fontSize: fs(15), color: COLORS.text},

    backStepBtn: {alignItems: 'center', paddingVertical: 8},
    backStepText: {fontFamily: FONTS.medium, fontSize: fs(14), color: COLORS.textSecondary},
})
