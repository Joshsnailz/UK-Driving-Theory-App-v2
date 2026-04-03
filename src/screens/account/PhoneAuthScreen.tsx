import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../types';
import type { ConfirmationResult } from '../../services/firebase';
import { usePalette } from '../../hooks/usePalette';
import { signInWithPhone } from '../../services/auth';
import ScreenHeader from '../../components/ScreenHeader';

type Nav = StackNavigationProp<RootStackParamList>;

const E164 = /^\+[1-9]\d{6,14}$/;

export default function PhoneAuthScreen() {
  const nav = useNavigation<Nav>();
  const { bg, card, text, sub, primary } = usePalette();

  const [phone, setPhone] = useState('+44');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (!E164.test(phone)) {
      Alert.alert('Invalid number', 'Enter your number in international format, e.g. +447700900123.');
      return;
    }
    setBusy(true);
    try {
      const result = await signInWithPhone(phone);
      setConfirmation(result);
    } catch (e) {
      Alert.alert('Could not send code', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async () => {
    if (!confirmation || code.length < 6) return;
    setBusy(true);
    try {
      await confirmation.confirm(code);
      nav.navigate('Main');
    } catch (e) {
      Alert.alert('Incorrect code', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const stage = confirmation ? 'verify' : 'enter';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScreenHeader title="Phone sign-in" />
      <View style={styles.body}>
        {stage === 'enter' ? (
          <>
            <Text style={[styles.label, { color: text }]}>Mobile number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: card, color: text }]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              placeholder="+447700900123"
              placeholderTextColor={sub}
              editable={!busy}
            />
            <Text style={[styles.help, { color: sub }]}>
              We’ll send a one-time verification code. Standard SMS rates may apply.
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: primary, opacity: busy ? 0.7 : 1 }]}
              onPress={sendCode}
              disabled={busy}
              accessibilityRole="button"
            >
              {busy ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Send code</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.label, { color: text }]}>Enter the 6-digit code</Text>
            <Text style={[styles.help, { color: sub }]}>Sent to {phone}</Text>
            <TextInput
              style={[styles.input, styles.code, { backgroundColor: card, color: text }]}
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              maxLength={6}
              editable={!busy}
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: primary, opacity: busy || code.length < 6 ? 0.7 : 1 },
              ]}
              onPress={confirmCode}
              disabled={busy || code.length < 6}
              accessibilityRole="button"
            >
              {busy ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Verify</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirmation(null)} style={styles.linkBtn}>
              <Text style={[styles.link, { color: primary }]}>Use a different number</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { padding: 24, gap: 12 },
  label: { fontSize: 15, fontWeight: '600' },
  help: { fontSize: 13, lineHeight: 18 },
  input: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16 },
  code: { fontSize: 24, letterSpacing: 8, textAlign: 'center', fontWeight: '700' },
  primaryBtn: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  linkBtn: { alignSelf: 'center', padding: 8 },
  link: { fontSize: 14, fontWeight: '600' },
});
