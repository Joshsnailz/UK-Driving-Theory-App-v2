import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Question, QuizSession } from '../types';
import { hazardQuestions } from '../data/hazardQuestions';
import { useSettingsStore } from '../store/settingsStore';
import { shuffle } from '../utils/shuffle';
import AnswerOption from '../components/AnswerOption';
import ProgressBar from '../components/ProgressBar';

type Nav = StackNavigationProp<RootStackParamList>;

export default function HazardScreen() {
  const nav = useNavigation<Nav>();
  const dark = useSettingsStore((s) => s.darkMode);
  const [questions] = useState(() => shuffle(hazardQuestions).slice(0, 10));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);

  const q = questions[index];
  const answered = answers[index];
  const isLast = index === questions.length - 1;
  const labels = ['A', 'B', 'C', 'D'];

  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? '#1E293B' : '#FFFFFF';
  const text = dark ? '#F1F5F9' : '#1E293B';
  const sub = dark ? '#94A3B8' : '#64748B';

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    const next = [...answers];
    next[index] = idx;
    setAnswers(next);
    setShowResult(true);
  };

  const handleNext = () => {
    if (isLast) {
      // Convert to QuizSession-compatible format for ResultScreen
      const score = answers.filter((a, i) => a === questions[i].correctIndex).length;
      const fakeSession: QuizSession = {
        id: Date.now().toString(),
        startedAt: Date.now(),
        completedAt: Date.now(),
        category: 'hazard',
        questions: questions as unknown as Question[],
        answers,
        score,
        totalQuestions: questions.length,
      };
      nav.replace('Result', { session: fakeSession });
    } else {
      setIndex((i) => i + 1);
      setShowResult(false);
    }
  };

  const getOptionState = (idx: number) => {
    if (!showResult) return answered === idx ? 'selected' : 'default';
    if (idx === q.correctIndex) return 'correct';
    if (answered === idx && answered !== q.correctIndex) return 'incorrect';
    return 'default';
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => Alert.alert('Quit', 'Exit hazard practice?', [
          { text: 'Cancel' }, { text: 'Exit', style: 'destructive', onPress: () => nav.goBack() }
        ])}>
          <Ionicons name="close" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.counter, { color: sub }]}>{index + 1}/{questions.length}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ProgressBar current={index + (showResult ? 1 : 0)} total={questions.length} colour="#D97706" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Image placeholder */}
        <View style={[styles.imageBox, { backgroundColor: card }]}>
          <Ionicons name="warning" size={48} color="#D97706" />
          <Text style={[styles.imageLabel, { color: sub }]}>Hazard Scene — {q.hazardType}</Text>
        </View>

        <Text style={[styles.question, { color: text }]}>{q.question}</Text>

        {q.options.map((opt, idx) => (
          <AnswerOption
            key={idx}
            label={labels[idx]}
            text={opt}
            state={getOptionState(idx)}
            onPress={() => handleAnswer(idx)}
            disabled={showResult}
          />
        ))}

        {showResult && (
          <View style={[styles.explanation, { backgroundColor: answered === q.correctIndex ? '#F0FDF4' : '#FEF2F2' }]}>
            <Text style={[styles.explTitle, { color: answered === q.correctIndex ? '#16A34A' : '#DC2626' }]}>
              {answered === q.correctIndex ? 'Correct!' : 'Incorrect'}
            </Text>
            <Text style={styles.explText}>{q.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {showResult && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{isLast ? 'See Results' : 'Next'}</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  counter: { fontSize: 15, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 100 },
  imageBox: { borderRadius: 12, height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  imageLabel: { fontSize: 13, marginTop: 8 },
  question: { fontSize: 17, fontWeight: '600', marginBottom: 16, lineHeight: 24 },
  explanation: { borderRadius: 12, padding: 14, marginTop: 12 },
  explTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  explText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32 },
  nextBtn: {
    backgroundColor: '#D97706', borderRadius: 8, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 8,
  },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
