import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import { usePalette } from '../hooks/usePalette';
import { useEntitlementStore } from '../store/entitlementStore';
import ScreenHeader from '../components/ScreenHeader';

type Nav = StackNavigationProp<RootStackParamList>;

/**
 * Presents the RevenueCat-hosted paywall for the current offering. The
 * actual layout, products and pricing are configured in the RevenueCat
 * dashboard so they can be iterated without an app update.
 */
export default function PaywallScreen() {
  const nav = useNavigation<Nav>();
  const { bg, sub } = usePalette();
  const { offering, refresh } = useEntitlementStore();

  const onDismiss = useCallback(() => nav.goBack(), [nav]);

  const onPurchaseOrRestore = useCallback(async () => {
    await refresh();
    nav.goBack();
  }, [nav, refresh]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <ScreenHeader title="Premium" />
      <View style={styles.fill}>
        <RevenueCatUI.Paywall
          options={{ offering: offering ?? undefined }}
          onDismiss={onDismiss}
          onPurchaseCompleted={onPurchaseOrRestore}
          onRestoreCompleted={onPurchaseOrRestore}
        />
      </View>
      <View style={styles.footer}>
        <Text style={[styles.legal, { color: sub }]}>
          Subscriptions renew automatically and are charged to your App Store / Google Play
          account. Manage or cancel any time in your device settings.
        </Text>
        <Text style={[styles.legal, { color: sub }]}>
          <Text style={styles.link} onPress={() => nav.navigate('Legal', { doc: 'terms' })}>
            Terms of Use
          </Text>
          {'  ·  '}
          <Text style={styles.link} onPress={() => nav.navigate('Legal', { doc: 'privacy' })}>
            Privacy Policy
          </Text>
        </Text>
        <Text style={[styles.legal, { color: sub }]}>
          Highway Code content © Crown copyright, licensed under the Open Government Licence v3.0.
        </Text>
      </View>
    </SafeAreaView>
  );
}

// Re-exported for callers that prefer the imperative full-screen presenter.
export async function presentPaywall(): Promise<boolean> {
  const result = await RevenueCatUI.presentPaywall();
  return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  fill: { flex: 1 },
  footer: { paddingHorizontal: 20, paddingVertical: 12, gap: 6 },
  legal: { fontSize: 11, lineHeight: 15, textAlign: 'center' },
  link: { textDecorationLine: 'underline' },
});
