import type { ExpoConfig } from 'expo/config';

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

const config: ExpoConfig = {
  name: 'UK Theory Test',
  slug: 'uk-theory-test',
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
    eas: { projectId: env('EAS_PROJECT_ID') },
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
  },
};

export default config;
