import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../types';
import { usePalette } from '../../hooks/usePalette';
import { signInWithApple, signInWithGoogle } from '../../services/auth';
import ScreenHeader from '../../components/ScreenHeader';

type Nav = StackNavigationProp<RootStackParamList>;
type Provider = 'google' | 'apple';

/**
 * Optional sign-in. The app is fully usable as a guest; signing in only
 * enables cross-device progress sync.
 */
export default function SignInScreen() {
  const nav = useNavigation<Nav>();
  const { bg, card, text, sub, dark } = usePalette();
  const [busy, setBusy] = useState<Provider | null>(null);

  const handle = async (provider: Provider) => {
    setBusy(provider);
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithApple();
      nav.goBack();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Please try again.';
      // User-cancelled flows surface as errors; suppress those.
      if (!/cancel/i.test(msg)) Alert.alert('Sign-in failed', msg);
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScreenHeader title="Sign in" />
      <View style={styles.body}>
        <Ionicons name="cloud-upload-outline" size={48} color="#1A56A0" />
        <Text style={[styles.title, { color: text }]}>Save your progress</Text>
        <Text style={[styles.sub, { color: sub }]}>
          Sign in to back up your stats and sync across devices. You can keep using the app
          without an account.
        </Text>

        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={
              dark
                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={8}
            style={styles.appleBtn}
            onPress={() => handle('apple')}
          />
        )}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: card }]}
          onPress={() => handle('google')}
          disabled={busy !== null}
          accessibilityRole="button"
        >
          {busy === 'google' ? (
            <ActivityIndicator color={text} />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={[styles.btnText, { color: text }]}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: card }]}
          onPress={() => nav.navigate('PhoneAuth')}
          disabled={busy !== null}
          accessibilityRole="button"
        >
          <Ionicons name="call-outline" size={20} color="#1A56A0" />
          <Text style={[styles.btnText, { color: text }]}>Continue with phone number</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.later}
          onPress={() => nav.goBack()}
          accessibilityRole="button"
        >
          <Text style={[styles.laterText, { color: sub }]}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { flex: 1, padding: 24, alignItems: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  sub: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 16 },
  appleBtn: { alignSelf: 'stretch', height: 48 },
  btn: {
    alignSelf: 'stretch',
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnText: { fontSize: 15, fontWeight: '600' },
  later: { marginTop: 8, padding: 8 },
  laterText: { fontSize: 14, fontWeight: '500' },
});
