import { useEffect, useRef, useState, useCallback } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { AdUnit } from '../services/ads';
import { useEntitlementStore } from '../store/entitlementStore';

/**
 * Loads an interstitial ad for the Quick Quiz entry point.
 * Call `showThenNavigate(fn)` — the callback fires after the ad closes,
 * or immediately if the user is premium or the ad failed to load.
 */
export function useQuickQuizAd() {
  const isPremium = useEntitlementStore((s) => s.isPremium);
  const adRef = useRef<InterstitialAd | null>(null);
  const [isLoaded, setLoaded] = useState(false);
  const pendingCallback = useRef<(() => void) | null>(null);

  const load = useCallback(() => {
    setLoaded(false);
    const ad = InterstitialAd.createForAdRequest(AdUnit.interstitial);
    adRef.current = ad;

    const subs = [
      ad.addAdEventListener(AdEventType.LOADED, () => setLoaded(true)),
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        pendingCallback.current?.();
        pendingCallback.current = null;
        load();
      }),
      ad.addAdEventListener(AdEventType.ERROR, () => {
        setLoaded(false);
        pendingCallback.current?.();
        pendingCallback.current = null;
      }),
    ];
    ad.load();
    return () => subs.forEach((u) => u());
  }, []);

  useEffect(() => {
    if (isPremium) return undefined;
    return load();
  }, [isPremium, load]);

  const showThenNavigate = useCallback((onDone: () => void) => {
    if (isPremium || !isLoaded) {
      onDone();
      return;
    }
    pendingCallback.current = onDone;
    adRef.current?.show();
  }, [isPremium, isLoaded]);

  return { showThenNavigate };
}
