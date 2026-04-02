import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  dark?: boolean;
}

export default function StatCard({ label, value, subtitle, icon, dark = false }: Props) {
  return (
    <View style={[styles.card, dark && styles.cardDark]}>
      {icon && <Ionicons name={icon} size={22} color="#1A56A0" style={styles.icon} />}
      <Text style={[styles.value, dark && styles.textDark]}>{value}</Text>
      <Text style={[styles.label, dark && styles.subDark]}>{label}</Text>
      {subtitle ? <Text style={[styles.subtitle, dark && styles.subDark]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    flex: 1,
    margin: 4,
  },
  cardDark: { backgroundColor: '#1E293B' },
  icon: { marginBottom: 4 },
  value: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  label: { fontSize: 12, color: '#64748B', marginTop: 2, textAlign: 'center' },
  subtitle: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  textDark: { color: '#F1F5F9' },
  subDark: { color: '#94A3B8' },
});
