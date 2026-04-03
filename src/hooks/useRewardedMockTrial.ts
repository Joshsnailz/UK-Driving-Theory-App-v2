import { useEffect, useRef, useState, useCallback } from 'react';
import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import { AdUnit } from '../services/ads';
import { useEntitlementStore } from '../store/entitlementStore';

/**
 * Loads a single rewarded ad and exposes `show()`. When the user watches to
 * completion they are granted one mock-test trial credit. A fresh ad is
 * preloaded after each close so the button is responsive next time.
 */
export function useRewardedMockTrial() {
  const isPremium = useEntitlementStore((s) => s.isPremium);
  const grantMockTrial = useEntitlementStore((s) => s.grantMockTrial);

  const adRef = useRef<RewardedAd | null>(null);
  const [isLoaded, setLoaded] = useState(false);

  const load = useCallback(() => {
    setLoaded(false);
    const ad = RewardedAd.createForAdRequest(AdUnit.rewarded);
    adRef.current = ad;

    const subs = [
      ad.addAdEventListener(RewardedAdEventType.LOADED, () => setLoaded(true)),
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => grantMockTrial()),
      ad.addAdEventListener(AdEventType.CLOSED, () => load()),
      ad.addAdEventListener(AdEventType.ERROR, () => setLoaded(false)),
    ];
    ad.load();
    return () => subs.forEach((u) => u());
  }, [grantMockTrial]);

  useEffect(() => {
    if (isPremium) return undefined;
    return load();
  }, [isPremium, load]);

  const show = useCallback(() => {
    if (isLoaded) adRef.current?.show();
  }, [isLoaded]);

  return { isLoaded, show };
}
