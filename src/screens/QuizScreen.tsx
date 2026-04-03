import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useQuizStore } from '../store/quizStore';
import { useProgressStore } from '../store/progressStore';
import { useQuizEngine } from '../hooks/useQuizEngine';
import { colors, useTheme } from '../theme';
import QuestionCard from '../components/QuestionCard';
import AnswerOption from '../components/AnswerOption';
import ProgressBar from '../components/ProgressBar';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Quiz'>;

export default function QuizScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { category, quizLength } = route.params;
  const t = useTheme();

  const { startQuiz, session, currentIndex, answerQuestion, nextQuestion, skipQuestion, endSession, showingResult } = useQuizStore();
  const { toggleBookmark, progress } = useProgressStore();
  const { selectQuestions } = useQuizEngine();

  useEffect(() => {
    const qs = selectQuestions(category, quizLength);
    startQuiz(qs, category);
  }, []);

  if (!session) return null;

  const q = session.questions[currentIndex];
  const answered = session.answers[currentIndex];
  const isLast = currentIndex === session.questions.length - 1;
  const isBookmarked = progress.bookmarkedIds.includes(q.id);

  const handleAnswer = (idx: number) => {
    answerQuestion(idx);
  };

  const handleNext = () => {
    if (isLast) {
      const completed = endSession();
      nav.replace('Result', { session: completed });
    } else {
      nextQuestion();
    }
  };

  const getOptionState = (idx: number) => {
    if (!showingResult) return answered === idx ? 'selected' : 'default';
    if (idx === q.correctIndex) return 'correct';
    if (answered === idx && answered !== q.correctIndex) return 'incorrect';
    return 'default';
  };

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => Alert.alert('Quit Quiz', 'Are you sure?', [
          { text: 'Cancel' },
          { text: 'Quit', style: 'destructive', onPress: () => nav.goBack() },
        ])}>
          <Ionicons name="close" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.counter, { color: t.sub }]}>
          {currentIndex + 1} / {session.questions.length}
        </Text>
        <TouchableOpacity onPress={() => toggleBookmark(q.id)} accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}>
          <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ProgressBar current={currentIndex + (showingResult ? 1 : 0)} total={session.questions.length} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <QuestionCard question={q} />

        {q.options.map((opt, idx) => (
          <AnswerOption
            key={idx}
            label={labels[idx]}
            text={opt}
            state={getOptionState(idx)}
            onPress={() => handleAnswer(idx)}
            disabled={showingResult}
          />
        ))}

        {/* Explanation */}
        {showingResult && (
          <View style={[styles.explanation, { backgroundColor: answered === q.correctIndex ? colors.successBg : colors.dangerBg }]}>
            <Text style={[styles.explanationTitle, { color: answered === q.correctIndex ? colors.success : colors.danger }]}>
              {answered === q.correctIndex ? 'Correct!' : 'Incorrect'}
            </Text>
            <Text style={[styles.explanationText, { color: t.text }]}>{q.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {!showingResult && (
          <TouchableOpacity style={styles.skipBtn} onPress={skipQuestion}>
            <Text style={{ color: t.sub, fontSize: 15 }}>Skip</Text>
          </TouchableOpacity>
        )}
        {showingResult && (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{isLast ? 'See Results' : 'Next Question'}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  counter: { fontSize: 15, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 100 },
  explanation: { borderRadius: 12, padding: 14, marginTop: 12 },
  explanationTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  explanationText: { fontSize: 14, lineHeight: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, backgroundColor: 'transparent' },
  skipBtn: { alignItems: 'center', padding: 12 },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  nextBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
