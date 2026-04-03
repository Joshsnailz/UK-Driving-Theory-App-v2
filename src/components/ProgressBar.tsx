import React from 'react';
import { View, StyleSheet, type DimensionValue } from 'react-native';
import { colors } from '../theme';

interface Props {
  current: number;
  total: number;
  colour?: string;
}

export default function ProgressBar({ current, total, colour = colors.primary }: Props) {
  const pct = total === 0 ? 0 : Math.min(current / total, 1);
  const width: DimensionValue = `${pct * 100}%`;
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: current }}>
      <View style={[styles.fill, { width, backgroundColor: colour }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
