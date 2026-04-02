import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { formatTime } from '../utils/formatTime';

interface Props {
  secondsRemaining: number;
  urgent?: boolean;
}

export default function TimerDisplay({ secondsRemaining, urgent }: Props) {
  const isUrgent = urgent ?? secondsRemaining < 300;
  return (
    <Text style={[styles.timer, isUrgent && styles.urgent]}>{formatTime(secondsRemaining)}</Text>
  );
}

const styles = StyleSheet.create({
  timer: { fontSize: 20, fontWeight: '700', color: '#1A56A0', fontVariant: ['tabular-nums'] },
  urgent: { color: '#DC2626' },
});
