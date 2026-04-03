import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity, Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { LearnStackParamList, SignGroup, TrafficSign } from '../../types';
import { usePalette } from '../../hooks/usePalette';
import { useSigns, SIGN_GROUP_LABEL } from '../../content/signs/useSigns';
import { resolveImage } from '../../content/signs/imageMap';
import ScreenHeader from '../../components/ScreenHeader';

type Nav = StackNavigationProp<LearnStackParamList>;
type Route = RouteProp<LearnStackParamList, 'SignLibrary'>;

export default function SignLibraryScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { bg, card, text, sub, primary } = usePalette();
  const signs = useSigns();

  const [filter, setFilter] = useState<SignGroup | 'all'>(route.params?.group ?? 'all');

  const sections = useMemo(() => {
    const groups = filter === 'all' ? signs.groups : [filter];
    return groups
      .map((g) => ({ title: SIGN_GROUP_LABEL[g], data: signs.byGroup(g) }))
      .filter((s) => s.data.length > 0);
  }, [filter, signs]);

  const renderItem = ({ item }: { item: TrafficSign }) => {
    const src = resolveImage(item.image);
    return (
      <TouchableOpacity
        style={[styles.row, { backgroundColor: card }]}
        onPress={() => nav.navigate('SignDetail', { signId: item.id })}
        accessibilityRole="button"
        accessibilityLabel={item.name}
      >
        <View style={[styles.thumb, { backgroundColor: bg }]}>
          {src ? (
            <Image source={src} style={styles.thumbImg} resizeMode="contain" />
          ) : (
            <Ionicons name="image-outline" size={22} color={sub} />
          )}
        </View>
        <View style={styles.rowBody}>
          <Text style={[styles.rowTitle, { color: text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.rowSub, { color: sub }]} numberOfLines={2}>
            {item.meaning}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={sub} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScreenHeader title="Traffic Signs" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {(['all', ...signs.groups] as const).map((g) => {
          const active = filter === g;
          return (
            <TouchableOpacity
              key={g}
              onPress={() => setFilter(g)}
              style={[
                styles.chip,
                { backgroundColor: active ? primary : card },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, { color: active ? '#FFFFFF' : text }]}>
                {g === 'all' ? 'All' : SIGN_GROUP_LABEL[g]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, { color: sub, backgroundColor: bg }]}>
            {section.title}
          </Text>
        )}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  chips: { paddingHorizontal: 16, paddingBottom: 8, gap: 8, flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  chipText: { fontSize: 13, fontWeight: '600' },
  list: { padding: 16, paddingTop: 8, gap: 10 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingTop: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, gap: 12 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 13, marginTop: 2, lineHeight: 17 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImg: { width: 44, height: 44 },
});
