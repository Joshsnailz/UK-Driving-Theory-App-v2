import React from 'react';
import { Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePalette } from '../hooks/usePalette';
import { LEGAL } from '../config/constants';
import { Env } from '../config/env';
import ScreenHeader from '../components/ScreenHeader';

export default function LegalScreen() {
  const { bg, text, sub, primary } = usePalette();

  const Link = ({ url, children }: { url: string; children: React.ReactNode }) => (
    <Text style={[styles.link, { color: primary }]} onPress={() => Linking.openURL(url)}>
      {children}
    </Text>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScreenHeader title="Legal & Licences" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.h2, { color: text }]}>Content licence</Text>
        <Text style={[styles.p, { color: text }]}>
          The Highway Code text, traffic-sign descriptions and derived practice questions in
          this app contain public sector information licensed under the{' '}
          <Link url={LEGAL.OGL_URL}>Open Government Licence v3.0</Link>.
        </Text>
        <Text style={[styles.p, { color: text }]}>
          Source: <Link url={LEGAL.HIGHWAY_CODE_URL}>The Highway Code</Link> and{' '}
          <Link url={LEGAL.TRAFFIC_SIGNS_URL}>Know Your Traffic Signs</Link> on GOV.UK.
          © Crown copyright.
        </Text>
        <Text style={[styles.p, { color: sub }]}>
          This app is an independent study aid and is not affiliated with or endorsed by the
          DVSA, the Department for Transport, or GOV.UK.
        </Text>

        <Text style={[styles.h2, { color: text }]}>Terms & privacy</Text>
        <Text style={[styles.p, { color: text }]}>
          <Link url={Env.legal.termsUrl}>Terms of Use</Link>
          {'  ·  '}
          <Link url={Env.legal.privacyUrl}>Privacy Policy</Link>
        </Text>

        <Text style={[styles.h2, { color: text }]}>Subscriptions</Text>
        <Text style={[styles.p, { color: text }]}>
          Premium is an auto-renewing subscription billed through the App Store or Google Play.
          You can manage or cancel it at any time in your device’s subscription settings. Payment
          will be charged to your store account at confirmation of purchase.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingTop: 0, gap: 12 },
  h2: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  p: { fontSize: 14, lineHeight: 21 },
  link: { textDecorationLine: 'underline' },
});
