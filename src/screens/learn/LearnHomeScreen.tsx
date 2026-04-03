import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { LearnStackParamList, IoniconName } from '../../types';
import { usePalette } from '../../hooks/usePalette';
import { useHighwayCode } from '../../content/highway-code/useHighwayCode';
import { useSigns } from '../../content/signs/useSigns';
import { LEGAL } from '../../config/constants';

type Nav = StackNavigationProp<LearnStackParamList>;

interface CardProps {
  icon: IoniconName;
  colour: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function LearnCard({ icon, colour, title, subtitle, onPress }: CardProps) {
  const { card, text, sub } = usePalette();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: card }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[styles.icon, { backgroundColor: `${colour}22` }]}>
        <Ionicons name={icon} size={24} color={colour} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: text }]}>{title}</Text>
        <Text style={[styles.cardSub, { color: sub }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={sub} />
    </TouchableOpacity>
  );
}

export default function LearnHomeScreen() {
  const nav = useNavigation<Nav>();
  const { bg, text, sub } = usePalette();
  const { sections, rules } = useHighwayCode();
  const { all: signs } = useSigns();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: text }]}>Learn</Text>
        <Text style={[styles.subheading, { color: sub }]}>
          Read the official rules and signs that every theory question is based on.
        </Text>

        <LearnCard
          icon="book"
          colour="#1A56A0"
          title="The Highway Code"
          subtitle={`${sections.length} sections · ${rules.length} rules`}
          onPress={() => nav.navigate('HighwayCodeList')}
        />
        <LearnCard
          icon="stop-circle"
          colour="#EA580C"
          title="Know Your Traffic Signs"
          subtitle={`${signs.length} signs and road markings`}
          onPress={() => nav.navigate('SignLibrary')}
        />

        <Text style={[styles.ogl, { color: sub }]}>
          Contains public sector information licensed under the Open Government Licence v3.0.
          Source: GOV.UK – {LEGAL.HIGHWAY_CODE_URL}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32, gap: 12 },
  heading: { fontSize: 28, fontWeight: '800' },
  subheading: { fontSize: 15, marginBottom: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  icon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 13, marginTop: 2 },
  ogl: { fontSize: 11, marginTop: 16, lineHeight: 16 },
});
