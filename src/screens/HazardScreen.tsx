import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, QuizSession } from '../types';
import { hazardQuestions } from '../data/hazardQuestions';
import { HAZARD_TEST } from '../config/constants';
import { shuffle } from '../utils/shuffle';
import { colors, useTheme } from '../theme';
import AnswerOption from '../components/AnswerOption';
import ProgressBar from '../components/ProgressBar';

type Nav = StackNavigationProp<RootStackParamList>;

export default function HazardScreen() {
  const nav = useNavigation<Nav>();
  const t = useTheme();
  const [questions] = useState(() => shuffle(hazardQuestions).slice(0, HAZARD_TEST.QUESTION_COUNT));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);

  const q = questions[index];
  const answered = answers[index];
  const isLast = index === questions.length - 1;
  const labels = ['A', 'B', 'C', 'D'];

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    const next = [...answers];
    next[index] = idx;
    setAnswers(next);
    setShowResult(true);
  };

  const handleNext = () => {
    if (isLast) {
      const score = answers.filter((a, i) => a === questions[i].correctIndex).length;
      const session: QuizSession = {
        id: Date.now().toString(),
        startedAt: Date.now(),
        completedAt: Date.now(),
        category: 'hazard',
        questions,
        answers,
        score,
        totalQuestions: questions.length,
      };
      nav.replace('Result', { session });
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
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => Alert.alert('Quit', 'Exit hazard practice?', [
          { text: 'Cancel' }, { text: 'Exit', style: 'destructive', onPress: () => nav.goBack() }
        ])}>
          <Ionicons name="close" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.counter, { color: t.sub }]}>{index + 1}/{questions.length}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ProgressBar current={index + (showResult ? 1 : 0)} total={questions.length} colour={colors.warning} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Image placeholder */}
        <View style={[styles.imageBox, { backgroundColor: t.card }]}>
          <Ionicons name="warning" size={48} color={colors.warning} />
          <Text style={[styles.imageLabel, { color: t.sub }]}>Hazard Scene — {q.hazardType}</Text>
        </View>

        <Text style={[styles.question, { color: t.text }]}>{q.question}</Text>

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
          <View style={[styles.explanation, { backgroundColor: answered === q.correctIndex ? colors.successBg : colors.dangerBg }]}>
            <Text style={[styles.explTitle, { color: answered === q.correctIndex ? colors.success : colors.danger }]}>
              {answered === q.correctIndex ? 'Correct!' : 'Incorrect'}
            </Text>
            <Text style={[styles.explText, { color: t.text }]}>{q.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {showResult && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{isLast ? 'See Results' : 'Next'}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
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
  explText: { fontSize: 14, lineHeight: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32 },
  nextBtn: {
    backgroundColor: colors.warning, borderRadius: 8, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 8,
  },
  nextBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
