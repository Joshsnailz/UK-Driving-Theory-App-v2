import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

let initialised = false;

/**
 * Initialise Sentry. Call once at app startup before rendering.
 * No-ops in dev or when SENTRY_DSN is not configured.
 */
export function initialiseSentry(): void {
  if (initialised) return;
  const dsn: string | undefined = Constants.expoConfig?.extra?.sentry?.dsn;
  if (!dsn) {
    if (__DEV__) console.log('[sentry] DSN not configured — skipping init');
    return;
  }
  Sentry.init({
    dsn,
    environment: __DEV__ ? 'development' : 'production',
    // Only send 20% of performance traces to stay within the free quota.
    tracesSampleRate: 0.2,
    // Don't block the JS thread on event delivery.
    enableNative: true,
  });
  initialised = true;
}

/** Re-export so callers don't need a direct @sentry/react-native import. */
export { Sentry };
