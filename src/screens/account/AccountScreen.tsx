import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList, IoniconName } from '../../types';
import { usePalette } from '../../hooks/usePalette';
import { useUserStore } from '../../store/userStore';
import { useProgressStore } from '../../store/progressStore';
import { signOut, deleteAccount } from '../../services/auth';
import { deleteUserData } from '../../services/progressSync';
import ScreenHeader from '../../components/ScreenHeader';

type Nav = StackNavigationProp<RootStackParamList>;

export default function AccountScreen() {
  const nav = useNavigation<Nav>();
  const { bg, card, text, sub } = usePalette();
  const user = useUserStore((s) => s.user);
  const resetProgress = useProgressStore((s) => s.resetProgress);
  const [busy, setBusy] = useState(false);

  if (!user) {
    // Should not normally be reachable – Settings routes guests to SignIn.
    nav.replace('SignIn');
    return null;
  }

  const provider = user.providerData[0]?.providerId ?? 'firebase';
  const identity = user.email ?? user.phoneNumber ?? user.uid;

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
      nav.goBack();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete account',
      'This permanently removes your account and synced progress from our servers. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await deleteUserData(user.uid);
              await deleteAccount();
              resetProgress();
              nav.navigate('Main');
            } catch (e) {
              const msg = e instanceof Error ? e.message : String(e);
              if (msg.includes('requires-recent-login')) {
                Alert.alert(
                  'Please sign in again',
                  'For security, deleting your account requires a recent sign-in. Sign out and back in, then try again.',
                );
              } else {
                Alert.alert('Could not delete account', msg);
              }
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScreenHeader title="Account" />
      <View style={[styles.card, { backgroundColor: card }]}>
        <Ionicons name="person-circle-outline" size={56} color="#1A56A0" />
        <Text style={[styles.identity, { color: text }]} numberOfLines={1}>
          {identity}
        </Text>
        <Text style={[styles.provider, { color: sub }]}>Signed in with {providerLabel(provider)}</Text>
      </View>

      <View style={styles.actions}>
        <Row
          icon="log-out-outline"
          label="Sign out"
          onPress={handleSignOut}
          card={card}
          text={text}
          disabled={busy}
        />
        <Row
          icon="trash-outline"
          label="Delete account & data"
          onPress={handleDelete}
          card={card}
          text="#DC2626"
          disabled={busy}
        />
      </View>

      {busy && <ActivityIndicator style={styles.spinner} color="#1A56A0" />}
    </SafeAreaView>
  );
}

function providerLabel(id: string): string {
  switch (id) {
    case 'google.com': return 'Google';
    case 'apple.com': return 'Apple';
    case 'phone': return 'phone number';
    default: return id;
  }
}

interface RowProps {
  icon: IoniconName;
  label: string;
  onPress: () => void;
  card: string;
  text: string;
  disabled?: boolean;
}

function Row({ icon, label, onPress, card, text, disabled }: RowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: card, opacity: disabled ? 0.6 : 1 }]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={20} color={text} />
      <Text style={[styles.rowLabel, { color: text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  card: { margin: 16, borderRadius: 12, padding: 20, alignItems: 'center', gap: 6 },
  identity: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  provider: { fontSize: 13 },
  actions: { paddingHorizontal: 16, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  spinner: { marginTop: 16 },
});
