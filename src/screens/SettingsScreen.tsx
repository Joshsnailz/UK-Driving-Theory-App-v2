import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList, IoniconName } from '../types';
import { useSettingsStore } from '../store/settingsStore';
import { useProgressStore } from '../store/progressStore';
import { useUserStore } from '../store/userStore';
import { useEntitlementStore } from '../store/entitlementStore';
import { restorePurchases } from '../services/purchases';
import { Env } from '../config/env';
import { colors, type Theme, useTheme } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;

const MANAGE_SUBSCRIPTION_URL = Platform.select({
  ios: 'https://apps.apple.com/account/subscriptions',
  android: 'https://play.google.com/store/account/subscriptions',
  default: 'https://play.google.com/store/account/subscriptions',
});

function Row({ label, theme, children }: { label: string; theme: Theme; children: React.ReactNode }) {
  return (
    <View style={[styles.row, { backgroundColor: theme.card }]}>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      {children}
    </View>
  );
}

function SegmentedControl<T extends number>({
  options,
  selected,
  onSelect,
}: {
  options: readonly T[];
  selected: T;
  onSelect: (v: T) => void;
}) {
  return (
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
}

export default function SettingsScreen() {
  const nav = useNavigation<Nav>();
  const t = useTheme();
  const { darkMode, toggleDarkMode, dailyGoal, setDailyGoal, quizLength, setQuizLength } =
    useSettingsStore();
  const { resetProgress } = useProgressStore();
  const user = useUserStore((s) => s.user);
  const isPremium = useEntitlementStore((s) => s.isPremium);
  const refreshEntitlements = useEntitlementStore((s) => s.refresh);

  const NavRow = ({
    icon,
    label,
    value,
    onPress,
  }: {
    icon: IoniconName;
    label: string;
    value?: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: t.card }]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.navLeft}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={[styles.rowLabel, { color: t.text }]}>{label}</Text>
      </View>
      <View style={styles.navRight}>
        {value && <Text style={[styles.rowValue, { color: t.sub }]}>{value}</Text>}
        <Ionicons name="chevron-forward" size={18} color={t.sub} />
      </View>
    </TouchableOpacity>
  );

  const handleReset = () => {
    Alert.alert('Reset Progress', 'Permanently delete all progress?', [
      { text: 'Cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetProgress },
    ]);
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      await refreshEntitlements();
      Alert.alert('Restore complete', 'Any previous purchases have been restored.');
    } catch (e) {
      Alert.alert('Restore failed', e instanceof Error ? e.message : 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <Text style={[styles.heading, { color: t.text }]}>Settings</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.section, { color: t.sub }]}>ACCOUNT</Text>
        <NavRow
          icon="person-circle-outline"
          label={user ? 'Account' : 'Sign in'}
          value={user ? (user.email ?? user.phoneNumber ?? 'Signed in') : 'Sync your progress'}
          onPress={() => nav.navigate(user ? 'Account' : 'SignIn')}
        />

        <Text style={[styles.section, { color: t.sub }]}>PREMIUM</Text>
        {isPremium ? (
          <NavRow
            icon="star"
            label="Manage subscription"
            value="Active"
            onPress={() => Linking.openURL(MANAGE_SUBSCRIPTION_URL)}
          />
        ) : (
          <NavRow
            icon="star-outline"
            label="Upgrade to Premium"
            value="Mock tests · Hazard · Ad-free"
            onPress={() => nav.navigate('Paywall', { feature: 'adfree' })}
          />
        )}
        <NavRow icon="refresh" label="Restore purchases" onPress={handleRestore} />

        <Text style={[styles.section, { color: t.sub }]}>APPEARANCE</Text>
        <Row label="Dark Mode" theme={t}>
          <Switch value={darkMode} onValueChange={toggleDarkMode} trackColor={{ true: colors.primary }} />
        </Row>

        <Text style={[styles.section, { color: t.sub }]}>PRACTICE</Text>
        <Row label="Daily Goal" theme={t}>
          <SegmentedControl options={[10, 20, 30, 50]} selected={dailyGoal} onSelect={setDailyGoal} />
        </Row>
        <Row label="Quiz Length" theme={t}>
          <SegmentedControl options={[10, 20, 30]} selected={quizLength} onSelect={setQuizLength} />
        </Row>

        <Text style={[styles.section, { color: t.sub }]}>DATA</Text>
        <TouchableOpacity
          style={[styles.row, styles.dangerRow, { backgroundColor: t.card }]}
          onPress={handleReset}
        >
          <Text style={styles.dangerText}>Reset All Progress</Text>
        </TouchableOpacity>

        <Text style={[styles.section, { color: t.sub }]}>ABOUT</Text>
        <NavRow icon="document-text-outline" label="Legal & Licences" onPress={() => nav.navigate('Legal')} />
        <NavRow
          icon="shield-checkmark-outline"
          label="Privacy Policy"
          onPress={() => Linking.openURL(Env.legal.privacyUrl)}
        />
        <NavRow
          icon="receipt-outline"
          label="Terms of Use"
          onPress={() => Linking.openURL(Env.legal.termsUrl)}
        />
        <Row label="Version" theme={t}>
          <Text style={{ color: t.sub }}>1.0.0</Text>
        </Row>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: 14,
    marginBottom: 6,
  },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 13 },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dangerRow: { justifyContent: 'center' },
  dangerText: { color: colors.danger, fontWeight: '600', fontSize: 15 },
  segment: { flexDirection: 'row', gap: 4 },
  segBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#E2E8F0' },
  segBtnActive: { backgroundColor: colors.primary },
  segText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  segTextActive: { color: colors.white },
});
