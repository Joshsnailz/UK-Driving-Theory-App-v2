import type { ExpoConfig } from 'expo/config';
import { withAndroidManifest, withAndroidStyles } from '@expo/config-plugins';

/**
 * Dynamic Expo config.
 *
 * Native plugins for Firebase, Google Sign-In, AdMob, RevenueCat and Apple
 * Authentication are configured here so that `expo prebuild` / EAS Build can
 * generate the iOS and Android projects without manual native edits.
 *
 * Environment variables are read at build time from `.env` (local) or EAS
 * secrets (CI). See `.env.example` and `docs/SETUP.md`.
 */

const env = (key: string, fallback = ''): string => process.env[key] ?? fallback;
const hasSentryUploadConfig =
  Boolean(env('SENTRY_ORG')) &&
  Boolean(env('SENTRY_PROJECT')) &&
  Boolean(env('SENTRY_AUTH_TOKEN'));

const config: ExpoConfig = {
  name: 'UK Theory Test',
  slug: 'uk-theory-test',
  owner: 'joshsnailz',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  scheme: 'uktheory',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    bundleIdentifier: env('IOS_BUNDLE_ID', 'com.joshsnailz.uktheory'),
    supportsTablet: true,
    usesAppleSignIn: true,
    googleServicesFile: env('GOOGLE_SERVICES_PLIST', './GoogleService-Info.plist'),
    infoPlist: {
      NSUserTrackingUsageDescription:
        'We use your data to show you more relevant ads. You can change this at any time in Settings.',
    },
  },
  android: {
    package: env('ANDROID_PACKAGE', 'com.joshsnailz.uktheory'),
    googleServicesFile: env('GOOGLE_SERVICES_JSON', './google-services.json'),
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: ['com.google.android.gms.permission.AD_ID'],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-dev-client',
    'expo-apple-authentication',
    'expo-tracking-transparency',
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    ...(hasSentryUploadConfig
      ? [[
          '@sentry/react-native/expo',
          {
            organization: env('SENTRY_ORG'),
            project: env('SENTRY_PROJECT'),
          },
        ] as const]
      : []),
    '@react-native-google-signin/google-signin',
    [
      'expo-build-properties',
      {
        ios: { useFrameworks: 'static' },
        android: { extraMavenRepos: ['../../node_modules/@notifee/react-native/android/libs'] },
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: env('ADMOB_ANDROID_APP_ID', 'ca-app-pub-3940256099942544~3347511713'),
        iosAppId: env('ADMOB_IOS_APP_ID', 'ca-app-pub-3940256099942544~1458002511'),
        userTrackingUsageDescription:
          'We use your data to show you more relevant ads. You can change this at any time in Settings.',
      },
    ],
  ],
  extra: {
    eas: { projectId: env('EAS_PROJECT_ID', '06dd7425-4600-4e8e-a629-b50428cf6241') },
    revenuecat: {
      iosKey: env('REVENUECAT_IOS_KEY'),
      androidKey: env('REVENUECAT_ANDROID_KEY'),
    },
    admob: {
      bannerUnitId: env('ADMOB_BANNER_UNIT_ID'),
      rewardedUnitId: env('ADMOB_REWARDED_UNIT_ID'),
    },
    googleSignIn: {
      webClientId: env('GOOGLE_WEB_CLIENT_ID'),
    },
    legal: {
      privacyUrl: env('PRIVACY_POLICY_URL'),
      termsUrl: env('TERMS_URL'),
    },
    sentry: {
      dsn: env('SENTRY_DSN'),
    },
  },
};

// ─── Inline config plugins ────────────────────────────────────────────────────
// Kept inline (rather than separate files) so that @expo/config can resolve
// them when compiling app.config.ts without a separate TS build step.

/**
 * Removes Android style attributes deprecated in Android 15 (API 35) when
 * edge-to-edge is enforced: statusBarColor, navigationBarColor, and
 * enforceNavigationBarContrast.
 */
const withEdgeToEdgeStyles = (cfg: ExpoConfig): ExpoConfig =>
  withAndroidStyles(cfg, (mod) => {
    const styles: Array<{ $: { name: string }; item?: Array<{ $: { name: string }; _?: string }> }> =
      mod.modResults.resources.style ?? [];

    const deprecated = new Set(['android:statusBarColor', 'android:navigationBarColor']);

    for (const style of styles) {
      if (!style.item) continue;
      style.item = style.item.filter((item) => !deprecated.has(item.$.name));
      const contrast = style.item.find(
        (item) => item.$.name === 'android:enforceNavigationBarContrast',
      );
      if (contrast) contrast._ = 'false';
    }

    return mod;
  }) as ExpoConfig;

/**
 * Declares the app as resizable so Android 16+ large-screen devices (tablets,
 * foldables) do not apply the orientation-override compatibility mode.
 */
const withLargeScreenSupport = (cfg: ExpoConfig): ExpoConfig =>
  withAndroidManifest(cfg, (mod) => {
    const app = mod.modResults.manifest.application?.[0];
    if (!app) return mod;
    const main = app.activity?.find((a: { $: Record<string, string> }) => a.$['android:name'] === '.MainActivity');
    if (main) main.$['android:resizeableActivity'] = 'true';
    return mod;
  }) as ExpoConfig;

export default withLargeScreenSupport(withEdgeToEdgeStyles(config));
