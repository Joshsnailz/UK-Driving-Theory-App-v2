import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Category } from '../types';
import { CATEGORY_CONFIG } from '../data/categories';

interface Props {
  category: Category;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ category, size = 'md' }: Props) {
  const config = CATEGORY_CONFIG[category];
  return (
    <View style={[styles.badge, { backgroundColor: config.colour + '22' }, size === 'sm' && styles.sm]}>
      <Text style={[styles.text, { color: config.colour }, size === 'sm' && styles.smText]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  sm: { paddingHorizontal: 6, paddingVertical: 2 },
  text: { fontSize: 13, fontWeight: '600' },
  smText: { fontSize: 11 },
});
