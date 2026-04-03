import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { LearnStackParamList } from '../../types';
import { usePalette } from '../../hooks/usePalette';
import { useSigns, SIGN_GROUP_LABEL } from '../../content/signs/useSigns';
import { resolveImage } from '../../content/signs/imageMap';
import ScreenHeader from '../../components/ScreenHeader';
import RuleChips from '../../components/RuleChips';
import { LEGAL } from '../../config/constants';

type Route = RouteProp<LearnStackParamList, 'SignDetail'>;

export default function SignDetailScreen() {
  const { params } = useRoute<Route>();
  const { bg, card, text, sub } = usePalette();
  const signs = useSigns();

  const sign = signs.get(params.signId);
  const src = resolveImage(sign?.image);

  if (!sign) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
        <ScreenHeader title="Sign not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScreenHeader title={SIGN_GROUP_LABEL[sign.group]} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.imageBox, { backgroundColor: card }]}>
          {src ? (
            <Image source={src} style={styles.image} resizeMode="contain" />
          ) : (
            <Ionicons name="image-outline" size={48} color={sub} />
          )}
        </View>

        <Text style={[styles.name, { color: text }]}>{sign.name}</Text>
        <Text style={[styles.meaning, { color: text }]}>{sign.meaning}</Text>

        {sign.highwayCodeRules && sign.highwayCodeRules.length > 0 && (
          <>
            <Text style={[styles.subhead, { color: sub }]}>Related Highway Code rules</Text>
            <RuleChips rules={sign.highwayCodeRules} />
          </>
        )}

        <Text style={[styles.ogl, { color: sub }]}>
          © Crown copyright. Reproduced from “Know Your Traffic Signs” under the Open Government
          Licence v3.0. Source: {LEGAL.TRAFFIC_SIGNS_URL}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingTop: 0 },
  imageBox: {
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  image: { width: '70%', height: '70%' },
  name: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  meaning: { fontSize: 16, lineHeight: 24 },
  subhead: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  ogl: { fontSize: 11, marginTop: 24, lineHeight: 16 },
});
