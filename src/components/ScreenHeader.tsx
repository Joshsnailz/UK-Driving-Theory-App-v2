import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePalette } from '../hooks/usePalette';

interface Props {
  title: string;
  /** Hide the back chevron (e.g. on tab roots). */
  hideBack?: boolean;
}

/** Lightweight header used by stack screens that opt out of the native header. */
export default function ScreenHeader({ title, hideBack }: Props) {
  const nav = useNavigation();
  const { text } = usePalette();

  return (
    <View style={styles.header}>
      {hideBack ? (
        <View style={styles.spacer} />
      ) : (
        <TouchableOpacity
          onPress={() => nav.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={text} />
        </TouchableOpacity>
      )}
      <Text style={[styles.title, { color: text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: '700', flexShrink: 1, marginHorizontal: 12 },
  spacer: { width: 24 },
});
