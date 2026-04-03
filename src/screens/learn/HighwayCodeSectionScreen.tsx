import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import type { HighwayCodeRule, LearnStackParamList } from '../../types';
import { usePalette } from '../../hooks/usePalette';
import { useHighwayCode } from '../../content/highway-code/useHighwayCode';
import ScreenHeader from '../../components/ScreenHeader';
import { LEGAL } from '../../config/constants';

type Route = RouteProp<LearnStackParamList, 'HighwayCodeSection'>;

export default function HighwayCodeSectionScreen() {
  const { params } = useRoute<Route>();
  const { bg, card, text, sub, primary } = usePalette();
  const hc = useHighwayCode();
  const listRef = useRef<FlatList<HighwayCodeRule>>(null);

  const section = hc.getSection(params.sectionId);
  const rules = hc.rulesForSection(params.sectionId);
  const initialIndex = params.rule
    ? Math.max(0, rules.findIndex((r) => r.rule === params.rule))
    : 0;

  // FlatList may fail to scroll to an unmeasured index for variable-height rows.
  const onScrollFail = useCallback(
    (info: { index: number }) => {
      listRef.current?.scrollToOffset({ offset: info.index * 140, animated: false });
      setTimeout(() => listRef.current?.scrollToIndex({ index: info.index, animated: true }), 50);
    },
    [],
  );

  const renderItem = ({ item }: { item: HighwayCodeRule }) => {
    const highlighted = item.rule === params.rule;
    return (
      <View
        style={[
          styles.rule,
          { backgroundColor: card },
          highlighted && { borderWidth: 1.5, borderColor: primary },
        ]}
      >
        <Text style={[styles.ruleNumber, { color: primary }]}>Rule {item.rule}</Text>
        <Text style={[styles.ruleText, { color: text }]}>{item.text}</Text>
        {item.lawRefs && item.lawRefs.length > 0 && (
          <Text style={[styles.law, { color: sub }]}>Law: {item.lawRefs.join(', ')}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScreenHeader title={section?.title ?? 'Highway Code'} />
      <FlatList
        ref={listRef}
        data={rules}
        keyExtractor={(r) => String(r.rule)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        initialScrollIndex={initialIndex > 0 ? initialIndex : undefined}
        onScrollToIndexFailed={onScrollFail}
        ListHeaderComponent={
          section && (
            <Text style={[styles.summary, { color: sub }]}>
              {section.summary} (Rules {section.ruleStart}–{section.ruleEnd})
            </Text>
          )
        }
        ListFooterComponent={
          <Text style={[styles.ogl, { color: sub }]}>
            © Crown copyright. Reproduced under the Open Government Licence v3.0. Source:{' '}
            {LEGAL.HIGHWAY_CODE_URL}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 16, paddingTop: 0, gap: 12 },
  summary: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  rule: { borderRadius: 12, padding: 16 },
  ruleNumber: { fontSize: 13, fontWeight: '800', marginBottom: 6, letterSpacing: 0.3 },
  ruleText: { fontSize: 15, lineHeight: 22 },
  law: { fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  ogl: { fontSize: 11, marginTop: 12, lineHeight: 16 },
});
