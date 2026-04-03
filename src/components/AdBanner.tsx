import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useEntitlementStore } from '../store/entitlementStore';
import { AdUnit } from '../services/ads';

/**
 * Anchored adaptive banner. Renders nothing for Premium subscribers, and
 * collapses to zero height if the ad fails to fill so the surrounding
 * layout never jumps.
 */
export default function AdBanner() {
  const isPremium = useEntitlementStore((s) => s.isPremium);
  const [failed, setFailed] = useState(false);

  if (isPremium || failed) return null;

  return (
    <View style={styles.container} accessibilityLabel="Advertisement">
      <BannerAd
        unitId={AdUnit.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
});
