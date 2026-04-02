import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Category } from '../types';
import { useSettingsStore } from '../store/settingsStore';
import { useProgress } from '../hooks/useProgress';
import { CATEGORY_CONFIG, ALL_CATEGORIES } from '../data/categories';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';

type Nav = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const dark = useSettingsStore((s) => s.darkMode);
  const quizLength = useSettingsStore((s) => s.quizLength);
  const { overallAccuracy, questionsToday, goalMet } = useProgress();
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);

  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? '#1E293B' : '#FFFFFF';
  const text = dark ? '#F1F5F9' : '#1E293B';
  const sub = dark ? '#94A3B8' : '#64748B';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: text }]}>UK Theory Test</Text>
        <Text style={[styles.subheading, { color: sub }]}>Practice & Revision</Text>

        {/* Daily goal */}
        <View style={[styles.card, { backgroundColor: card }]}>
          <View style={styles.goalRow}>
            <Text style={[styles.goalLabel, { color: text }]}>Daily Goal</Text>
            <Text style={[styles.goalCount, { color: goalMet ? '#16A34A' : '#1A56A0' }]}>
              {questionsToday}/{dailyGoal}
            </Text>
          </View>
          <ProgressBar current={questionsToday} total={dailyGoal} colour={goalMet ? '#16A34A' : '#1A56A0'} />
        </View>

        {/* Stats row */}
        <View style={styles.row}>
          <StatCard label="Accuracy" value={`${overallAccuracy}%`} icon="checkmark-circle" dark={dark} />
          <StatCard label="Today" value={questionsToday} icon="today" dark={dark} />
        </View>

        {/* Quick actions */}
        <TouchableOpacity
          style={[styles.primaryBtn]}
          onPress={() => nav.navigate('Quiz', { category: 'mixed', quizLength })}
          accessibilityLabel="Start quick practice quiz"
        >
          <Ionicons name="play-circle" size={22} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Quick Practice ({quizLength} questions)</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: card }]}
            onPress={() => nav.navigate('TopicList')}
          >
            <Ionicons name="list" size={20} color="#1A56A0" />
            <Text style={[styles.secondaryBtnText, { color: text }]}>By Topic</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: card }]}
            onPress={() => nav.navigate('Hazard')}
          >
            <Ionicons name="warning" size={20} color="#D97706" />
            <Text style={[styles.secondaryBtnText, { color: text }]}>Hazard Perception</Text>
          </TouchableOpacity>
        </View>

        {/* Category grid */}
        <Text style={[styles.sectionTitle, { color: text }]}>Topics</Text>
        <View style={styles.grid}>
          {ALL_CATEGORIES.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catCard, { backgroundColor: card }]}
                onPress={() => nav.navigate('Quiz', { category: cat as Category, quizLength })}
              >
                <View style={[styles.catIcon, { backgroundColor: config.colour + '22' }]}>
                  <Ionicons name={config.icon as any} size={20} color={config.colour} />
                </View>
                <Text style={[styles.catLabel, { color: text }]} numberOfLines={2}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 28, fontWeight: '800', marginBottom: 2 },
  subheading: { fontSize: 15, marginBottom: 16 },
  card: { borderRadius: 12, padding: 16, marginBottom: 12 },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  goalLabel: { fontSize: 15, fontWeight: '600' },
  goalCount: { fontSize: 15, fontWeight: '700' },
  row: { flexDirection: 'row', marginBottom: 12 },
  primaryBtn: {
    backgroundColor: '#1A56A0',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  secondaryBtn: {
    flex: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    gap: 6,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: '47%',
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
  },
  catIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  catLabel: { fontSize: 13, fontWeight: '600' },
});
