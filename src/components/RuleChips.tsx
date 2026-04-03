import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import { useHighwayCode } from '../content/highway-code/useHighwayCode';

interface Props {
  rules: readonly number[];
  dark?: boolean;
}

/**
 * Tappable chips linking a question explanation to the relevant Highway Code
 * rule(s). Tapping opens the rule in the Learn tab.
 */
export default function RuleChips({ rules, dark }: Props) {
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { getSectionForRule } = useHighwayCode();

  if (rules.length === 0) return null;

  return (
    <View style={styles.row}>
      <Text style={[styles.label, dark && styles.labelDark]}>Highway Code:</Text>
      {rules.map((r) => {
        const section = getSectionForRule(r);
        return (
          <TouchableOpacity
            key={r}
            style={styles.chip}
            onPress={() => section && nav.navigate('HighwayCodeSection', { sectionId: section.id, rule: r })}
            accessibilityRole="button"
            accessibilityLabel={`Read Highway Code rule ${r}`}
          >
            <Text style={styles.chipText}>Rule {r}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 10 },
  label: { fontSize: 12, color: '#64748B', marginRight: 2 },
  labelDark: { color: '#94A3B8' },
  chip: { backgroundColor: '#1A56A022', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 12, fontWeight: '600', color: '#1A56A0' },
});
