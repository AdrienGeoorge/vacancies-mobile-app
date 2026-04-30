import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ImageBackground,
    StatusBar,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useTranslation} from 'react-i18next'
import {NativeStackNavigationProp} from '@react-navigation/native-stack'
import {AuthStackParamList} from '../../types/navigation'
import {COLORS, SPACING, BORDER_RADIUS, FONTS, fs} from '../../constants'

type Props = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Landing'>
}

export default function LandingScreen({navigation}: Props) {
    const insets = useSafeAreaInsets()
    const {t} = useTranslation()
    const titleFontSize = fs(38)

    return (
        <ImageBackground
            source={require('../../assets/hero.jpg')}
            style={styles.bg}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent"/>
            <View style={styles.overlay}/>
            <View style={[styles.header, {paddingTop: insets.top + SPACING.sm}]}>
                <View style={styles.brandRow}>
                    <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain"/>
                    <Text style={styles.brandName}>Triplaning</Text>
                </View>
                <TouchableOpacity style={styles.loginBtn}
                                  onPress={() => navigation.navigate('Login', {initialTab: 'login'})}
                                  activeOpacity={0.8}>
                    <Text style={styles.loginBtnText}>{t('auth.login')}</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.content, {paddingBottom: insets.bottom + SPACING.xl}]}>
                <Text style={[styles.titleBlock, {
                    fontSize: titleFontSize,
                    lineHeight: titleFontSize + 2
                }]}>{t('auth.landing.title')}</Text>
                <Text style={styles.subtitle}>{t('auth.landing.subtitle')}</Text>
                <TouchableOpacity style={styles.ctaBtn}
                                  onPress={() => navigation.navigate('Login', {initialTab: 'register'})}
                                  activeOpacity={0.85}>
                    <Text style={styles.ctaBtnText}>{t('auth.landing.cta')}</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    bg: {flex: 1, backgroundColor: '#000'},
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    header: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        zIndex: 10,
    },
    brandRow: {flexDirection: 'row', alignItems: 'center', gap: SPACING.xs},
    logo: {width: 40, height: 40},
    brandName: {fontFamily: FONTS.semiBold, fontSize: fs(18), color: '#fff', letterSpacing: -0.3},
    loginBtn: {
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.55)',
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: 7,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    loginBtnText: {fontFamily: FONTS.medium, color: '#fff', fontSize: fs(15)},
    content: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: SPACING.lg,
    },
    titleBlock: {
        fontFamily: FONTS.semiBold,
        marginBottom: SPACING.md,
        color: '#fff',
        letterSpacing: -1,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: FONTS.regular,
        fontSize: fs(16),
        color: 'rgba(255,255,255,0.85)',
        lineHeight: fs(22),
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    ctaBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 8,
        borderColor: COLORS.primaryBorder,
        borderWidth: 2,
    },
    ctaBtnText: {fontFamily: FONTS.semiBold, color: '#fff', fontSize: fs(16), letterSpacing: 0.2},
})
