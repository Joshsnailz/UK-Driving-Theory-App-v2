/**
 * Centralised, type-safe access to build-time configuration.
 *
 * Values are injected via `app.config.ts` -> `extra` and read here through
 * `expo-constants`. This keeps native plugin config and JS runtime config in
 * one place and ensures we never sprinkle `process.env` calls through the
 * codebase.
 *
 * Anything that is genuinely secret (service-account keys, server API keys)
 * MUST NOT be placed here — these values are bundled into the client.
 */
import Constants from 'expo-constants';

type Extra = {
  revenuecat: { iosKey: string; androidKey: string };
  admob: { bannerUnitId: string; rewardedUnitId: string };
  googleSignIn: { webClientId: string };
  legal: { privacyUrl: string; termsUrl: string };
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

function required(value: string | undefined, name: string): string {
  if (!value) {
    if (__DEV__) {
      console.warn(`[env] Missing config value "${name}". Using placeholder.`);
      return '';
    }
    throw new Error(`Missing required config value "${name}". See docs/SETUP.md.`);
  }
  return value;
}

export const Env = {
  revenuecat: {
    iosKey: required(extra.revenuecat?.iosKey, 'revenuecat.iosKey'),
    androidKey: required(extra.revenuecat?.androidKey, 'revenuecat.androidKey'),
  },
  admob: {
    bannerUnitId: extra.admob?.bannerUnitId ?? '',
    rewardedUnitId: extra.admob?.rewardedUnitId ?? '',
  },
  googleSignIn: {
    webClientId: required(extra.googleSignIn?.webClientId, 'googleSignIn.webClientId'),
  },
  legal: {
    privacyUrl: extra.legal?.privacyUrl ?? 'https://example.com/privacy',
    termsUrl: extra.legal?.termsUrl ?? 'https://example.com/terms',
  },
} as const;
