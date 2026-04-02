import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  current: number;
  total: number;
  colour?: string;
}

export default function ProgressBar({ current, total, colour = '#1A56A0' }: Props) {
  const pct = total === 0 ? 0 : Math.min(current / total, 1);
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct * 100}%` as any, backgroundColor: colour }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
