import {InAppBrowser} from 'react-native-inappbrowser-reborn'
import {COLORS} from '../constants'

export async function openGoogleAuth(authUrl: string, redirectUri: string): Promise<string | null> {
    try {
        if (!await InAppBrowser.isAvailable()) return null

        const result = await InAppBrowser.openAuth(authUrl, redirectUri, {
            preferredBarTintColor: '#ffffff',
            preferredControlTintColor: COLORS.primary,
            readerMode: false,
            animated: true,
            modalEnabled: true,
            enableBarCollapsing: false,
            showTitle: false,
            toolbarColor: '#ffffff',
            enableDefaultShare: false,
        })

        if (result.type === 'success' && result.url) {
            const match = result.url.match(/[?&]code=([^&]+)/)
            return match ? decodeURIComponent(match[1]) : null
        }
        return null
    } catch {
        return null
    }
}
