import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../store/settingsStore';
import { useProgressStore } from '../store/progressStore';

export default function SettingsScreen() {
  const { darkMode, toggleDarkMode, dailyGoal, setDailyGoal, quizLength, setQuizLength } = useSettingsStore();
  const { resetProgress } = useProgressStore();

  const bg = darkMode ? '#0F172A' : '#F8FAFC';
  const card = darkMode ? '#1E293B' : '#FFFFFF';
  const text = darkMode ? '#F1F5F9' : '#1E293B';
  const sub = darkMode ? '#94A3B8' : '#64748B';

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View style={[styles.row, { backgroundColor: card }]}>
      <Text style={[styles.rowLabel, { color: text }]}>{label}</Text>
      {children}
    </View>
  );

  const SegmentedControl = ({
    options,
    selected,
    onSelect,
  }: {
    options: number[];
    selected: number;
    onSelect: (v: any) => void;
  }) => (
    <View style={styles.segment}>
      {options.map((o) => (
        <TouchableOpacity
          key={o}
          style={[styles.segBtn, selected === o && styles.segBtnActive]}
          onPress={() => onSelect(o)}
        >
          <Text style={[styles.segText, selected === o && styles.segTextActive]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleReset = () => {
    Alert.alert('Reset Progress', 'Permanently delete all progress?', [
      { text: 'Cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetProgress },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <Text style={[styles.heading, { color: text }]}>Settings</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.section, { color: sub }]}>APPEARANCE</Text>
        <Row label="Dark Mode">
          <Switch value={darkMode} onValueChange={toggleDarkMode} trackColor={{ true: '#1A56A0' }} />
        </Row>

        <Text style={[styles.section, { color: sub }]}>PRACTICE</Text>
        <Row label="Daily Goal">
          <SegmentedControl options={[10, 20, 30, 50]} selected={dailyGoal} onSelect={setDailyGoal} />
        </Row>
        <Row label="Quiz Length">
          <SegmentedControl options={[10, 20, 30]} selected={quizLength} onSelect={setQuizLength} />
        </Row>

        <Text style={[styles.section, { color: sub }]}>DATA</Text>
        <TouchableOpacity style={[styles.row, styles.dangerRow, { backgroundColor: card }]} onPress={handleReset}>
          <Text style={styles.dangerText}>Reset All Progress</Text>
        </TouchableOpacity>

        <Text style={[styles.section, { color: sub }]}>ABOUT</Text>
        <View style={[styles.row, { backgroundColor: card }]}>
          <Text style={[styles.rowLabel, { color: text }]}>Version</Text>
          <Text style={{ color: sub }}>1.0.0</Text>
        </View>
        <View style={[styles.row, { backgroundColor: card }]}>
          <Text style={[styles.rowLabel, { color: text }]}>Questions licensed under</Text>
          <Text style={{ color: sub, fontSize: 12 }}>OGL v3.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  heading: { fontSize: 26, fontWeight: '800', padding: 16, paddingBottom: 8 },
  scroll: { padding: 16, paddingBottom: 40 },
  section: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 20, marginBottom: 6 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 10, padding: 14, marginBottom: 6,
  },
  rowLabel: { fontSize: 15 },
  dangerRow: { justifyContent: 'center' },
  dangerText: { color: '#DC2626', fontWeight: '600', fontSize: 15 },
  segment: { flexDirection: 'row', gap: 4 },
  segBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#E2E8F0' },
  segBtnActive: { backgroundColor: '#1A56A0' },
  segText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  segTextActive: { color: '#FFFFFF' },
});
