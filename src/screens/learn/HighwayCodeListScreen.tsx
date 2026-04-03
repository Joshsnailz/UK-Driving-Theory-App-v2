import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { HighwayCodeRule, HighwayCodeSection, LearnStackParamList } from '../../types';
import { usePalette } from '../../hooks/usePalette';
import { useHighwayCode } from '../../content/highway-code/useHighwayCode';
import ScreenHeader from '../../components/ScreenHeader';

type Nav = StackNavigationProp<LearnStackParamList>;
type Row =
  | { kind: 'section'; section: HighwayCodeSection }
  | { kind: 'rule'; rule: HighwayCodeRule };

export default function HighwayCodeListScreen() {
  const nav = useNavigation<Nav>();
  const { bg, card, text, sub, border } = usePalette();
  const hc = useHighwayCode();
  const [query, setQuery] = useState('');

  const data = useMemo<Row[]>(() => {
    const q = query.trim();
    if (q.length < 2) {
      return hc.sections.map((section) => ({ kind: 'section', section }));
    }
    // Numeric query → jump straight to that rule.
    const n = Number.parseInt(q, 10);
    if (!Number.isNaN(n)) {
      const rule = hc.getRule(n);
      return rule ? [{ kind: 'rule', rule }] : [];
    }
    return hc.search(q).slice(0, 50).map((rule) => ({ kind: 'rule', rule }));
  }, [hc, query]);

  const renderItem = ({ item }: { item: Row }) => {
    if (item.kind === 'section') {
      const s = item.section;
      return (
        <TouchableOpacity
          style={[styles.row, { backgroundColor: card }]}
          onPress={() => nav.navigate('HighwayCodeSection', { sectionId: s.id })}
          accessibilityRole="button"
        >
          <View style={styles.rowBody}>
            <Text style={[styles.rowTitle, { color: text }]}>{s.title}</Text>
            <Text style={[styles.rowSub, { color: sub }]}>
              Rules {s.ruleStart}–{s.ruleEnd}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={sub} />
        </TouchableOpacity>
      );
    }
    const r = item.rule;
    return (
      <TouchableOpacity
        style={[styles.row, { backgroundColor: card }]}
        onPress={() => nav.navigate('HighwayCodeSection', { sectionId: r.sectionId, rule: r.rule })}
        accessibilityRole="button"
      >
        <View style={[styles.ruleBadge, { borderColor: border }]}>
          <Text style={[styles.ruleBadgeText, { color: text }]}>{r.rule}</Text>
        </View>
        <Text style={[styles.rowSub, styles.rulePreview, { color: text }]} numberOfLines={2}>
          {r.text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScreenHeader title="The Highway Code" />
      <View style={[styles.search, { backgroundColor: card }]}>
        <Ionicons name="search" size={18} color={sub} />
        <TextInput
          style={[styles.searchInput, { color: text }]}
          placeholder="Search rules or enter a rule number"
          placeholderTextColor={sub}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={sub} />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => (item.kind === 'section' ? item.section.id : `rule-${item.rule.rule}`)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={[styles.empty, { color: sub }]}>No rules match “{query}”.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
  list: { padding: 16, paddingTop: 8, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, gap: 12 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 13, marginTop: 2 },
  ruleBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  ruleBadgeText: { fontSize: 14, fontWeight: '700' },
  rulePreview: { flex: 1, lineHeight: 18 },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 14 },
});
