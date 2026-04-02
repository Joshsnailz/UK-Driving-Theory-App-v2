import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Question, HazardQuestion } from '../types';

interface Props {
  question: Question | HazardQuestion;
  dark?: boolean;
}

export default function QuestionCard({ question, dark = false }: Props) {
  return (
    <View style={[styles.card, dark && styles.cardDark]}>
      {'imageUri' in question && question.imageUri ? (
        <View style={styles.imageContainer}>
          <Text style={styles.imagePlaceholder}>[Image: {question.imageUri}]</Text>
        </View>
      ) : null}
      <Text style={[styles.questionText, dark && styles.textDark]}>{question.question}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardDark: { backgroundColor: '#1E293B' },
  imageContainer: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  imagePlaceholder: { color: '#94A3B8', fontSize: 13 },
  questionText: { fontSize: 17, fontWeight: '600', color: '#1E293B', lineHeight: 24 },
  textDark: { color: '#F1F5F9' },
});
