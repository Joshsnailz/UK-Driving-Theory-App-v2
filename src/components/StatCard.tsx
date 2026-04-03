import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, useTheme } from '../theme';

interface Props {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

export default function StatCard({ label, value, subtitle, icon }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.surfaceAlt }]}>
      {icon && <Ionicons name={icon} size={22} color={colors.primary} style={styles.icon} />}
      <Text style={[styles.value, { color: t.text }]}>{value}</Text>
      <Text style={[styles.label, { color: t.sub }]}>{label}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: t.sub }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    flex: 1,
    margin: 4,
  },
  icon: { marginBottom: 4 },
  value: { fontSize: 22, fontWeight: '700' },
  label: { fontSize: 12, marginTop: 2, textAlign: 'center' },
  subtitle: { fontSize: 11, marginTop: 2 },
});
