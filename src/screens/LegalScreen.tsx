import React from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity, Linking, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { usePalette } from '../hooks/usePalette';
import { LEGAL } from '../config/constants';
import { PRIVACY_POLICY, TERMS_OF_USE, type LegalDocument } from '../config/legalDocuments';
import type { RootStackParamList } from '../types';
import ScreenHeader from '../components/ScreenHeader';

type LegalRoute = RouteProp<RootStackParamList, 'Legal'>;
type LegalNav = StackNavigationProp<RootStackParamList>;

function ExternalLink({
  url,
  children,
  color,
}: {
  url: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <Text style={[styles.link, { color }]} onPress={() => Linking.openURL(url)}>
      {children}
    </Text>
  );
}

function InternalLink({
  label,
  onPress,
  color,
}: {
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button">
      <Text style={[styles.link, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DocumentView({
  document,
  text,
  sub,
}: {
  document: LegalDocument;
  text: string;
  sub: string;
}) {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {document.intro ? <Text style={[styles.p, { color: sub }]}>{document.intro}</Text> : null}
      {document.sections.map((section) => (
        <View key={section.title} style={styles.sectionBlock}>
          <Text style={[styles.h2, { color: text }]}>{section.title}</Text>
          {section.paragraphs.map((paragraph) => (
            <Text key={paragraph} style={[styles.p, { color: text }]}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

export default function LegalScreen() {
  const route = useRoute<LegalRoute>();
  const nav = useNavigation<LegalNav>();
  const { bg, text, sub, primary, card } = usePalette();
  const doc = route.params?.doc ?? 'overview';

  if (doc === 'privacy') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
        <ScreenHeader title={PRIVACY_POLICY.title} />
        <DocumentView document={PRIVACY_POLICY} text={text} sub={sub} />
      </SafeAreaView>
    );
  }

  if (doc === 'terms') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
        <ScreenHeader title={TERMS_OF_USE.title} />
        <DocumentView document={TERMS_OF_USE} text={text} sub={sub} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScreenHeader title="Legal & Licences" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.h2, { color: text }]}>Content licence</Text>
        <Text style={[styles.p, { color: text }]}>
          The Highway Code text, traffic-sign descriptions and derived practice questions in
          this app contain public sector information licensed under the{' '}
          <ExternalLink url={LEGAL.OGL_URL} color={primary}>
            Open Government Licence v3.0
          </ExternalLink>
          .
        </Text>
        <Text style={[styles.p, { color: text }]}>
          Source: <ExternalLink url={LEGAL.HIGHWAY_CODE_URL} color={primary}>The Highway Code</ExternalLink>{' '}
          and <ExternalLink url={LEGAL.TRAFFIC_SIGNS_URL} color={primary}>Know Your Traffic Signs</ExternalLink>{' '}
          on GOV.UK. © Crown copyright.
        </Text>
        <Text style={[styles.p, { color: sub }]}>
          This app is an independent study aid and is not affiliated with or endorsed by the
          DVSA, the Department for Transport, or GOV.UK.
        </Text>

        <Text style={[styles.h2, { color: text }]}>Terms & privacy</Text>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: card }]}
          onPress={() => nav.navigate('Legal', { doc: 'terms' })}
          accessibilityRole="button"
        >
          <Text style={[styles.cardTitle, { color: text }]}>Terms of Use</Text>
          <Text style={[styles.cardText, { color: sub }]}>
            Read the in-app terms that govern use of UK Theory Test and premium purchases.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: card }]}
          onPress={() => nav.navigate('Legal', { doc: 'privacy' })}
          accessibilityRole="button"
        >
          <Text style={[styles.cardTitle, { color: text }]}>Privacy Policy</Text>
          <Text style={[styles.cardText, { color: sub }]}>
            See what data the app stores, how it is used, and the services involved.
          </Text>
        </TouchableOpacity>

        <Text style={[styles.h2, { color: text }]}>Subscriptions</Text>
        <Text style={[styles.p, { color: text }]}>
          Premium is an auto-renewing subscription billed through the App Store or Google Play.
          You can manage or cancel it at any time in your device’s subscription settings. Payment
          will be charged to your store account at confirmation of purchase.
        </Text>
        <Text style={[styles.p, { color: sub }]}>
          For more detail, see the{' '}
          <InternalLink label="Terms of Use" onPress={() => nav.navigate('Legal', { doc: 'terms' })} color={primary} />
          .
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingTop: 0, gap: 12 },
  sectionBlock: { gap: 10 },
  h2: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  p: { fontSize: 14, lineHeight: 21 },
  link: { textDecorationLine: 'underline', fontSize: 14, lineHeight: 21 },
  card: { borderRadius: 14, padding: 16, gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardText: { fontSize: 13, lineHeight: 19 },
});
