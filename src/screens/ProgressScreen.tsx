import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProgressStore } from '../store/progressStore';
import { useSettingsStore } from '../store/settingsStore';
import { useProgress } from '../hooks/useProgress';
import { CATEGORY_CONFIG, ALL_CATEGORIES } from '../data/categories';
import { Category } from '../types';
import StatCard from '../components/StatCard';

export default function ProgressScreen() {
  const dark = useSettingsStore((s) => s.darkMode);
  const { progress, resetProgress } = useProgressStore();
  const { overallAccuracy, weakCategories, questionsToday, goalMet, recentMockTests } = useProgress();

  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? '#1E293B' : '#FFFFFF';
  const text = dark ? '#F1F5F9' : '#1E293B';
  const sub = dark ? '#94A3B8' : '#64748B';

  const handleReset = () => {
    Alert.alert(
      'Reset Progress',
      'This will permanently delete all your progress, stats and bookmarks. Are you sure?',
      [
        { text: 'Cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetProgress },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <Text style={[styles.heading, { color: text }]}>Your Progress</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Overall stats */}
        <View style={styles.statsRow}>
          <StatCard label="Accuracy" value={`${overallAccuracy}%`} icon="checkmark-circle" dark={dark} />
          <StatCard label="Total Answered" value={progress.totalQuestionsAnswered} icon="help-circle" dark={dark} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Streak" value={progress.currentStreak} icon="flame" dark={dark} />
          <StatCard label="Best Streak" value={progress.longestStreak} icon="trophy" dark={dark} />
        </View>

        {/* Weak areas */}
        {weakCategories.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: text }]}>Areas to Improve</Text>
            {weakCategories.map((cat) => (
              <View key={cat} style={[styles.weakRow, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name={CATEGORY_CONFIG[cat].icon as any} size={18} color="#DC2626" />
                <Text style={styles.weakLabel}>{CATEGORY_CONFIG[cat].label}</Text>
              </View>
            ))}
          </>
        )}

        {/* Per-category stats */}
        <Text style={[styles.sectionTitle, { color: text }]}>By Category</Text>
        {ALL_CATEGORIES.map((cat) => {
          const stat = progress.categoryStats[cat as Category];
          const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;
          const config = CATEGORY_CONFIG[cat as Category];
          return (
            <View key={cat} style={[styles.catRow, { backgroundColor: card }]}>
              <View style={[styles.catDot, { backgroundColor: config.colour + '33' }]}>
                <Ionicons name={config.icon as any} size={16} color={config.colour} />
              </View>
              <Text style={[styles.catLabel, { color: text }]} numberOfLines={1}>{config.label}</Text>
              <Text style={[styles.catStat, {
                color: acc === null ? sub : acc >= 80 ? '#16A34A' : acc >= 60 ? '#D97706' : '#DC2626'
              }]}>
                {acc === null ? '—' : `${stat.correct}/${stat.total} (${acc}%)`}
              </Text>
            </View>
          );
        })}

        {/* Mock test history */}
        <Text style={[styles.sectionTitle, { color: text }]}>Mock Test History</Text>
        {recentMockTests.length === 0 ? (
          <Text style={[styles.empty, { color: sub }]}>No mock tests taken yet.</Text>
        ) : (
          recentMockTests.map((result) => (
            <View key={result.id} style={[styles.mockRow, { backgroundColor: card }]}>
              <View>
                <Text style={[styles.mockDate, { color: sub }]}>
                  {new Date(result.date).toLocaleDateString('en-GB')}
                </Text>
                <Text style={[styles.mockScore, { color: text }]}>{result.score}/50</Text>
              </View>
              <View style={[styles.passBadge, { backgroundColor: result.passed ? '#F0FDF4' : '#FEF2F2' }]}>
                <Text style={{ color: result.passed ? '#16A34A' : '#DC2626', fontWeight: '700', fontSize: 13 }}>
                  {result.passed ? 'PASS' : 'FAIL'}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Reset */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetText}>Reset All Progress</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  heading: { fontSize: 26, fontWeight: '800', padding: 16, paddingBottom: 8 },
  scroll: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  weakRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 8, padding: 10, marginBottom: 6 },
  weakLabel: { color: '#DC2626', fontSize: 14, fontWeight: '600' },
  catRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 12, marginBottom: 6, gap: 10 },
  catDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  catLabel: { flex: 1, fontSize: 14 },
  catStat: { fontSize: 13, fontWeight: '600' },
  mockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 10, padding: 14, marginBottom: 8 },
  mockDate: { fontSize: 12, marginBottom: 2 },
  mockScore: { fontSize: 18, fontWeight: '700' },
  passBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  empty: { fontSize: 14, fontStyle: 'italic' },
  resetBtn: { marginTop: 24, borderWidth: 1, borderColor: '#DC2626', borderRadius: 8, padding: 14, alignItems: 'center' },
  resetText: { color: '#DC2626', fontWeight: '600', fontSize: 15 },
});
