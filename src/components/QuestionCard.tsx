import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { AnyQuestion } from '../types';
import { resolveImage } from '../content/signs/imageMap';
import { useTheme } from '../theme';

interface Props {
  question: AnyQuestion;
}

export default function QuestionCard({ question }: Props) {
  const t = useTheme();
  const source = resolveImage(question.imageUri);

  return (
    <View style={[styles.card, { backgroundColor: t.card }]}>
      {question.imageUri ? (
        <View style={[styles.imageContainer, { backgroundColor: t.isDark ? t.bg : '#F1F5F9' }]}>
          {source ? (
            <Image
              source={source}
              style={styles.image}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="Question illustration"
            />
          ) : (
            <Text style={[styles.imagePlaceholder, { color: t.sub }]}>Image unavailable</Text>
          )}
        </View>
      ) : null}
      <Text style={[styles.questionText, { color: t.text }]}>{question.question}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, marginBottom: 12 },
  imageContainer: {
    borderRadius: 8,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { fontSize: 13 },
  questionText: { fontSize: 17, fontWeight: '600', lineHeight: 24 },
});
