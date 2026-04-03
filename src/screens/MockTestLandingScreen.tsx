import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import { usePalette } from '../hooks/usePalette';
import { useProgress } from '../hooks/useProgress';
import { MOCK_TEST } from '../config/constants';
import PremiumGate from '../components/PremiumGate';

type Nav = StackNavigationProp<RootStackParamList>;

/**
 * Tab-root for the Mock Test tab. Explains the format and gates the start
 * button behind Premium / a rewarded-ad trial credit. The actual test runs
 * in the root-stack `MockTest` screen so it is full-screen and untabbed.
 */
export default function MockTestLandingScreen() {
  const nav = useNavigation<Nav>();
  const { bg, card, text, sub, primary } = usePalette();
  const { recentMockTests } = useProgress();

  const start = () => nav.navigate('MockTest');
  const minutes = Math.round(MOCK_TEST.DURATION_SECONDS / 60);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: text }]}>Mock Test</Text>
        <Text style={[styles.subheading, { color: sub }]}>
          {MOCK_TEST.QUESTION_COUNT} questions · {minutes} minutes · pass mark{' '}
          {MOCK_TEST.PASS_MARK}/{MOCK_TEST.QUESTION_COUNT}
        </Text>

        <View style={[styles.info, { backgroundColor: card }]}>
          <Bullet text="Questions are weighted across all DVSA topics, just like the real exam." />
          <Bullet text="No feedback until you submit – flag questions to revisit them." />
          <Bullet text="The timer ends the test automatically when it reaches zero." />
        </View>

        <PremiumGate feature="mock" onUnlockedPress={start}>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: primary }]}
            onPress={start}
            accessibilityRole="button"
          >
            <Ionicons name="play-circle" size={22} color="#FFFFFF" />
            <Text style={styles.startBtnText}>Start mock test</Text>
          </TouchableOpacity>
        </PremiumGate>

        {recentMockTests.length > 0 && (
          <>
            <Text style={[styles.section, { color: text }]}>Recent results</Text>
            {recentMockTests.slice(0, 5).map((m) => (
              <View key={m.id} style={[styles.resultRow, { backgroundColor: card }]}>
                <Ionicons
                  name={m.passed ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={m.passed ? '#16A34A' : '#DC2626'}
                />
                <Text style={[styles.resultText, { color: text }]}>
                  {m.score}/{MOCK_TEST.QUESTION_COUNT} · {m.passed ? 'Pass' : 'Fail'}
                </Text>
                <Text style={[styles.resultDate, { color: sub }]}>
                  {new Date(m.date).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Bullet({ text }: { text: string }) {
  const { text: colour } = usePalette();
  return (
    <View style={styles.bullet}>
      <Ionicons name="ellipse" size={6} color={colour} style={styles.bulletDot} />
      <Text style={[styles.bulletText, { color: colour }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32, gap: 14 },
  heading: { fontSize: 28, fontWeight: '800' },
  subheading: { fontSize: 15 },
  info: { borderRadius: 12, padding: 16, gap: 10 },
  bullet: { flexDirection: 'row', gap: 10 },
  bulletDot: { marginTop: 7 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 20 },
  startBtn: {
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  section: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  resultText: { fontSize: 14, fontWeight: '600', flex: 1 },
  resultDate: { fontSize: 12 },
});
