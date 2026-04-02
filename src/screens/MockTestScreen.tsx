import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Category, MockTestResult } from '../types';
import { useQuizStore } from '../store/quizStore';
import { useSettingsStore } from '../store/settingsStore';
import { useQuizEngine } from '../hooks/useQuizEngine';
import { useTimer } from '../hooks/useTimer';
import { CATEGORY_CONFIG } from '../data/categories';
import QuestionCard from '../components/QuestionCard';
import AnswerOption from '../components/AnswerOption';
import TimerDisplay from '../components/TimerDisplay';

type Nav = StackNavigationProp<RootStackParamList>;

const MOCK_DURATION = 57 * 60; // 3420 seconds

export default function MockTestScreen() {
  const nav = useNavigation<Nav>();
  const dark = useSettingsStore((s) => s.darkMode);
  const { startQuiz, session, currentIndex, flaggedIndices, answerQuestion, goToQuestion, flagQuestion, endSession } = useQuizStore();
  const { selectMockTestQuestions } = useQuizEngine();
  const { secondsRemaining, start, isExpired } = useTimer(MOCK_DURATION);
  const submitted = useRef(false);
  const questionListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    const qs = selectMockTestQuestions();
    startQuiz(qs, 'mock');
    start();
  }, []);

  useEffect(() => {
    if (isExpired && !submitted.current) submitTest();
  }, [isExpired]);

  useEffect(() => {
    if (!session) return;

    questionListRef.current?.scrollToIndex({
      index: currentIndex,
      animated: true,
      viewPosition: 0.5,
    });
  }, [currentIndex, session]);

  const submitTest = () => {
    if (submitted.current) return;
    submitted.current = true;
    const completed = endSession();
    const duration = MOCK_DURATION - secondsRemaining;

    // Build category breakdown
    const breakdown: MockTestResult['categoryBreakdown'] = {} as any;
    Object.keys(CATEGORY_CONFIG).forEach((k) => {
      breakdown[k as Category] = { correct: 0, total: 0 };
    });
    completed.questions.forEach((q, i) => {
      const cat = q.category as Category;
      breakdown[cat].total += 1;
      if (completed.answers[i] === q.correctIndex) breakdown[cat].correct += 1;
    });

    const mockResult: MockTestResult = {
      id: Date.now().toString(),
      date: Date.now(),
      score: completed.score,
      passed: completed.score >= 43,
      duration,
      categoryBreakdown: breakdown,
    };

    nav.replace('Result', { session: completed, isMockTest: true, mockResult });
  };

  const confirmSubmit = () => {
    const unanswered = session?.answers.filter((a) => a === null).length ?? 0;
    Alert.alert(
      'Submit Test',
      unanswered > 0 ? `You have ${unanswered} unanswered question(s). Submit anyway?` : 'Are you ready to submit?',
      [{ text: 'Cancel' }, { text: 'Submit', onPress: submitTest }]
    );
  };

  if (!session) return null;

  const q = session.questions[currentIndex];
  const answered = session.answers[currentIndex];
  const isLastQuestion = currentIndex === session.questions.length - 1;
  const labels = ['A', 'B', 'C', 'D'];

  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? '#1E293B' : '#FFFFFF';
  const text = dark ? '#F1F5F9' : '#1E293B';
  const sub = dark ? '#94A3B8' : '#64748B';

  const handleAnswer = (idx: number) => {
    answerQuestion(idx);

    if (!isLastQuestion) {
      goToQuestion(currentIndex + 1);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TimerDisplay secondsRemaining={secondsRemaining} />
        <Text style={[styles.counter, { color: sub }]}>{currentIndex + 1}/50</Text>
        <TouchableOpacity onPress={() => flagQuestion(currentIndex)}>
          <Ionicons
            name={flaggedIndices.has(currentIndex) ? 'flag' : 'flag-outline'}
            size={22}
            color={flaggedIndices.has(currentIndex) ? '#D97706' : sub}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <QuestionCard question={q} dark={dark} />

        {q.options.map((opt, idx) => (
          <AnswerOption
            key={idx}
            label={labels[idx]}
            text={opt}
            state={answered === idx ? 'selected' : 'default'}
            onPress={() => handleAnswer(idx)}
          />
        ))}
      </ScrollView>

      {/* Question navigator grid */}
      <View style={[styles.navigator, { backgroundColor: card }]}>
        <FlatList
          ref={questionListRef}
          data={session.questions}
          keyExtractor={(_, i) => i.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: 38,
            offset: 38 * index,
            index,
          })}
          onScrollToIndexFailed={({ index }) => {
            setTimeout(() => {
              questionListRef.current?.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.5,
              });
            }, 100);
          }}
          renderItem={({ index: i }) => {
            const isAnswered = session.answers[i] !== null;
            const isFlagged = flaggedIndices.has(i);
            const isCurrent = i === currentIndex;
            return (
              <TouchableOpacity
                style={[
                  styles.dot,
                  isCurrent && styles.dotCurrent,
                  isAnswered && !isCurrent && styles.dotAnswered,
                  isFlagged && styles.dotFlagged,
                ]}
                onPress={() => goToQuestion(i)}
              >
                <Text style={[styles.dotText, (isCurrent || isAnswered) && { color: '#FFFFFF' }]}>
                  {i + 1}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
        <TouchableOpacity style={styles.submitBtn} onPress={confirmSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  counter: { fontSize: 15, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 20 },
  navigator: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  dot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center', marginHorizontal: 3,
  },
  dotAnswered: { backgroundColor: '#1A56A0' },
  dotCurrent: { backgroundColor: '#0F172A' },
  dotFlagged: { backgroundColor: '#D97706' },
  dotText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  submitBtn: {
    backgroundColor: '#1A56A0', borderRadius: 8, marginTop: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  submitText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
