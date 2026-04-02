import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

type AnswerState = 'default' | 'selected' | 'correct' | 'incorrect';

interface Props {
  label: string;
  text: string;
  state: AnswerState;
  onPress: () => void;
  disabled?: boolean;
}

const BG: Record<AnswerState, string> = {
  default: '#F8FAFC',
  selected: '#EFF6FF',
  correct: '#F0FDF4',
  incorrect: '#FEF2F2',
};

const BORDER: Record<AnswerState, string> = {
  default: '#E2E8F0',
  selected: '#1A56A0',
  correct: '#16A34A',
  incorrect: '#DC2626',
};

const LABEL_BG: Record<AnswerState, string> = {
  default: '#E2E8F0',
  selected: '#1A56A0',
  correct: '#16A34A',
  incorrect: '#DC2626',
};

const LABEL_COLOR: Record<AnswerState, string> = {
  default: '#64748B',
  selected: '#FFFFFF',
  correct: '#FFFFFF',
  incorrect: '#FFFFFF',
};

export default function AnswerOption({ label, text, state, onPress, disabled }: Props) {
  return (
    <TouchableOpacity
      style={[styles.option, { backgroundColor: BG[state], borderColor: BORDER[state] }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityLabel={`Option ${label}: ${text}`}
      accessibilityRole="button"
    >
      <View style={[styles.label, { backgroundColor: LABEL_BG[state] }]}>
        <Text style={[styles.labelText, { color: LABEL_COLOR[state] }]}>{label}</Text>
      </View>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 14,
    marginVertical: 5,
    minHeight: 52,
  },
  label: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  labelText: { fontSize: 14, fontWeight: '700' },
  text: { flex: 1, fontSize: 15, color: '#1E293B', lineHeight: 21 },
});
