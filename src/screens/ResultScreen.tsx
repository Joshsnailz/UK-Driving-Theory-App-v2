import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Category } from '../types';
import { useProgressStore } from '../store/progressStore';
import { useSettingsStore } from '../store/settingsStore';
import { CATEGORY_CONFIG } from '../data/categories';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Result'>;

export default function ResultScreen() {
  const nav = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { session, isMockTest, mockResult } = params;
  const dark = useSettingsStore((s) => s.darkMode);
  const { recordSession, recordMockTest } = useProgressStore();

  useEffect(() => {
    recordSession(session);
    if (isMockTest && mockResult) recordMockTest(mockResult);
  }, []);

  const pct = Math.round((session.score / session.totalQuestions) * 100);
  const passed = isMockTest ? session.score >= 43 : null;

  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? '#1E293B' : '#FFFFFF';
  const text = dark ? '#F1F5F9' : '#1E293B';
  const sub = dark ? '#94A3B8' : '#64748B';

  // Category breakdown
  const catBreakdown = new Map<Category, { correct: number; total: number }>();
  session.questions.forEach((q, i) => {
    const cat = q.category as Category;
    const prev = catBreakdown.get(cat) ?? { correct: 0, total: 0 };
    const correct = session.answers[i] === q.correctIndex;
    catBreakdown.set(cat, { correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 });
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Score circle */}
        <View style={styles.scoreSection}>
          <View style={[styles.scoreCircle, { borderColor: passed === false ? '#DC2626' : '#1A56A0' }]}>
            <Text style={[styles.scoreNum, { color: passed === false ? '#DC2626' : '#1A56A0' }]}>
              {session.score}/{session.totalQuestions}
            </Text>
            <Text style={[styles.scorePct, { color: sub }]}>{pct}%</Text>
          </View>
          {isMockTest && (
            <View style={[styles.passBanner, { backgroundColor: passed ? '#F0FDF4' : '#FEF2F2' }]}>
              <Ionicons
                name={passed ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={passed ? '#16A34A' : '#DC2626'}
              />
              <Text style={[styles.passText, { color: passed ? '#16A34A' : '#DC2626' }]}>
                {passed ? 'PASS' : 'FAIL'} — Pass mark: 43/50
              </Text>
            </View>
          )}
        </View>

        {/* Category breakdown */}
        <Text style={[styles.sectionTitle, { color: text }]}>By Category</Text>
        {Array.from(catBreakdown.entries()).map(([cat, stat]) => {
          const acc = Math.round((stat.correct / stat.total) * 100);
          const config = CATEGORY_CONFIG[cat];
          return (
            <View key={cat} style={[styles.catRow, { backgroundColor: card }]}>
              <Text style={[styles.catLabel, { color: text }]} numberOfLines={1}>{config.label}</Text>
              <View style={styles.catRight}>
                <Text style={[styles.catStat, { color: acc >= 80 ? '#16A34A' : acc >= 60 ? '#D97706' : '#DC2626' }]}>
                  {stat.correct}/{stat.total}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Actions */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => nav.navigate('Review', { session })}
        >
          <Text style={styles.primaryBtnText}>Review Answers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, { backgroundColor: card }]}
          onPress={() => nav.navigate('Main')}
        >
          <Text style={[styles.secondaryBtnText, { color: text }]}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  scoreSection: { alignItems: 'center', marginVertical: 24 },
  scoreCircle: {
    width: 140, height: 140, borderRadius: 70, borderWidth: 6,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  scoreNum: { fontSize: 32, fontWeight: '800' },
  scorePct: { fontSize: 16, fontWeight: '600' },
  passBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
  },
  passText: { fontSize: 17, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  catRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 8, padding: 12, marginBottom: 6,
  },
  catLabel: { fontSize: 14, flex: 1 },
  catRight: { alignItems: 'flex-end' },
  catStat: { fontSize: 14, fontWeight: '700' },
  primaryBtn: {
    backgroundColor: '#1A56A0', borderRadius: 8, padding: 15,
    alignItems: 'center', marginTop: 20, marginBottom: 10,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { borderRadius: 8, padding: 15, alignItems: 'center' },
  secondaryBtnText: { fontSize: 16, fontWeight: '600' },
});
