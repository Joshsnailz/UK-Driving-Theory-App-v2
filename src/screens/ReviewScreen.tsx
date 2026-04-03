import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useProgressStore } from '../store/progressStore';
import { colors, useTheme } from '../theme';
import QuestionCard from '../components/QuestionCard';
import AnswerOption from '../components/AnswerOption';

type Route = RouteProp<RootStackParamList, 'Review'>;

type Filter = 'all' | 'wrong' | 'bookmarked';

export default function ReviewScreen() {
  const nav = useNavigation();
  const { params } = useRoute<Route>();
  const { session } = params;
  const t = useTheme();
  const { toggleBookmark, progress } = useProgressStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [index, setIndex] = useState(0);

  const filtered = session.questions
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => {
      if (filter === 'wrong') return session.answers[i] !== q.correctIndex;
      if (filter === 'bookmarked') return progress.bookmarkedIds.includes(q.id);
      return true;
    });

  const current = filtered[index];
  const labels = ['A', 'B', 'C', 'D'];

  const getState = (optIdx: number) => {
    if (!current) return 'default';
    if (optIdx === current.q.correctIndex) return 'correct';
    if (session.answers[current.i] === optIdx && optIdx !== current.q.correctIndex) return 'incorrect';
    return 'default';
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: t.text }]}>Review Answers</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {(['all', 'wrong', 'bookmarked'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.tab, { backgroundColor: t.border }, filter === f && styles.tabActive]}
            onPress={() => { setFilter(f); setIndex(0); }}
          >
            <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ color: t.sub }}>No questions in this filter.</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.counter, { color: t.sub }]}>
            {index + 1} / {filtered.length}
          </Text>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.bookmarkRow}>
              <QuestionCard question={current.q} />
              <TouchableOpacity
                style={styles.bookmark}
                onPress={() => toggleBookmark(current.q.id)}
              >
                <Ionicons
                  name={progress.bookmarkedIds.includes(current.q.id) ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {current.q.options.map((opt, idx) => (
              <AnswerOption
                key={idx}
                label={labels[idx]}
                text={opt}
                state={getState(idx)}
                onPress={() => {}}
                disabled
              />
            ))}

            <View style={[styles.explanation, { backgroundColor: t.card }]}>
              <Text style={[styles.explTitle, { color: t.text }]}>Explanation</Text>
              <Text style={[styles.explText, { color: t.sub }]}>{current.q.explanation}</Text>
            </View>
          </ScrollView>

          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, { opacity: index === 0 ? 0.3 : 1 }]}
              onPress={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
            >
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, { opacity: index === filtered.length - 1 ? 0.3 : 1 }]}
              onPress={() => setIndex((i) => Math.min(filtered.length - 1, i + 1))}
              disabled={index === filtered.length - 1}
            >
              <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#FFFFFF' },
  counter: { textAlign: 'center', fontSize: 13, marginBottom: 4 },
  scroll: { padding: 16, paddingBottom: 100 },
  bookmarkRow: { position: 'relative' },
  bookmark: { position: 'absolute', top: 12, right: 12 },
  explanation: { borderRadius: 12, padding: 14, marginTop: 12 },
  explTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  explText: { fontSize: 14, lineHeight: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navRow: { position: 'absolute', bottom: 32, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 32 },
  navBtn: { backgroundColor: colors.primaryTint, padding: 14, borderRadius: 30 },
});
