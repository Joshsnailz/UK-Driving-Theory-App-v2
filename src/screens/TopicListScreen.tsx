import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Category } from '../types';
import { CATEGORY_CONFIG, ALL_CATEGORIES } from '../data/categories';
import { useSettingsStore } from '../store/settingsStore';
import { useProgressStore } from '../store/progressStore';

type Nav = StackNavigationProp<RootStackParamList>;

export default function TopicListScreen() {
  const nav = useNavigation<Nav>();
  const dark = useSettingsStore((s) => s.darkMode);
  const quizLength = useSettingsStore((s) => s.quizLength);
  const { progress } = useProgressStore();

  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? '#1E293B' : '#FFFFFF';
  const text = dark ? '#F1F5F9' : '#1E293B';
  const sub = dark ? '#94A3B8' : '#64748B';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: text }]}>Choose Topic</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={ALL_CATEGORIES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const cat = item as Category;
          const config = CATEGORY_CONFIG[cat];
          const stat = progress.categoryStats[cat];
          const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;
          return (
            <TouchableOpacity
              style={[styles.row, { backgroundColor: card }]}
              onPress={() => nav.navigate('Quiz', { category: cat, quizLength })}
            >
              <View style={[styles.icon, { backgroundColor: config.colour + '22' }]}>
                <Ionicons name={config.icon as any} size={22} color={config.colour} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.label, { color: text }]}>{config.label}</Text>
                {acc !== null && (
                  <Text style={[styles.acc, { color: acc >= 80 ? '#16A34A' : acc >= 60 ? '#D97706' : '#DC2626' }]}>
                    {acc}% accuracy
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={sub} />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  list: { padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  label: { fontSize: 15, fontWeight: '600' },
  acc: { fontSize: 13, marginTop: 2 },
});
