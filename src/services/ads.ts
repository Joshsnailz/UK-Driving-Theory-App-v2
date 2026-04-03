import { Platform } from 'react-native';
import mobileAds, {
  AdsConsent,
  AdsConsentStatus,
  MaxAdContentRating,
  TestIds,
} from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Env } from '../config/env';

/**
 * Ad-unit IDs. In development we always serve Google's test units so the
 * AdMob account is never put at risk by accidental self-clicks.
 */
export const AdUnit = {
  banner: __DEV__ || !Env.admob.bannerUnitId ? TestIds.BANNER : Env.admob.bannerUnitId,
  rewarded: __DEV__ || !Env.admob.rewardedUnitId ? TestIds.REWARDED : Env.admob.rewardedUnitId,
} as const;

let initialised = false;

/**
 * One-time AdMob bootstrap:
 *  1. Gather UMP consent (GDPR / UK GDPR) and show the consent form if required.
 *  2. On iOS, prompt for App Tracking Transparency *after* consent so the
 *     ATT dialog appears with context (per Apple HIG).
 *  3. Configure request defaults and initialise the SDK.
 */
export async function initialiseAds(): Promise<void> {
  if (initialised) return;
  initialised = true;

  try {
    const consentInfo = await AdsConsent.requestInfoUpdate();
    if (
      consentInfo.isConsentFormAvailable &&
      consentInfo.status === AdsConsentStatus.REQUIRED
    ) {
      await AdsConsent.showForm();
    }
  } catch (e) {
    // Consent failures must not block the app; we simply fall back to
    // non-personalised ads.
    console.warn('[ads] consent flow failed', e);
  }

  if (Platform.OS === 'ios') {
    try {
      await requestTrackingPermissionsAsync();
    } catch {
      // User declined or ATT unavailable – proceed with limited ads.
    }
  }

  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.PG,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
  });
  await mobileAds().initialize();
}
