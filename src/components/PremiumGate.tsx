import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import { usePalette } from '../hooks/usePalette';
import { useEntitlementStore } from '../store/entitlementStore';
import { useRewardedMockTrial } from '../hooks/useRewardedMockTrial';

type Feature = 'mock' | 'hazard';

interface Props {
  feature: Feature;
  /** Called when the user is entitled (or has spent a trial credit) and taps the CTA. */
  onUnlockedPress: () => void;
  children: React.ReactNode;
}

const COPY: Record<Feature, { title: string; body: string }> = {
  mock: {
    title: 'Mock tests are a Premium feature',
    body: 'Take unlimited timed 50-question DVSA-style mock tests, see a full topic breakdown, and remove ads.',
  },
  hazard: {
    title: 'Hazard Perception is a Premium feature',
    body: 'Practise spotting developing hazards with our scenario bank and prepare for the real clip test.',
  },
};

/**
 * Wraps a CTA so that free users see an upsell instead. Premium users (or
 * free users spending a rewarded-ad mock credit) pass straight through.
 */
export default function PremiumGate({ feature, onUnlockedPress, children }: Props) {
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { card, text, sub, primary } = usePalette();
  const { isPremium, ready, mockTrialCredits, consumeMockTrial } = useEntitlementStore();
  const rewarded = useRewardedMockTrial();

  if (isPremium) return <>{children}</>;

  const handlePrimary = () => {
    if (feature === 'mock' && mockTrialCredits > 0 && consumeMockTrial()) {
      onUnlockedPress();
      return;
    }
    nav.navigate('Paywall', { feature });
  };

  const copy = COPY[feature];

  return (
    <View style={[styles.box, { backgroundColor: card }]}>
      <Ionicons name="lock-closed" size={28} color={primary} />
      <Text style={[styles.title, { color: text }]}>{copy.title}</Text>
      <Text style={[styles.body, { color: sub }]}>{copy.body}</Text>

      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: primary }]}
        onPress={handlePrimary}
        disabled={!ready}
        accessibilityRole="button"
      >
        {!ready ? (
          <ActivityIndicator color="#FFF" />
        ) : feature === 'mock' && mockTrialCredits > 0 ? (
          <Text style={styles.primaryBtnText}>
            Start free mock test ({mockTrialCredits} left)
          </Text>
        ) : (
          <Text style={styles.primaryBtnText}>Unlock with Premium</Text>
        )}
      </TouchableOpacity>

      {feature === 'mock' && mockTrialCredits === 0 && (
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={rewarded.show}
          disabled={!rewarded.isLoaded}
          accessibilityRole="button"
        >
          <Ionicons name="play-circle-outline" size={18} color={primary} />
          <Text style={[styles.secondaryBtnText, { color: primary }]}>
            {rewarded.isLoaded ? 'Watch an ad for 1 free mock test' : 'Loading reward…'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 12, padding: 20, alignItems: 'center', gap: 8 },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  body: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 8 },
  primaryBtn: {
    alignSelf: 'stretch',
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '600' },
});
