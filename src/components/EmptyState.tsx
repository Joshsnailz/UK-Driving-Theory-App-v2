import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  message: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

export default function EmptyState({ message, icon = 'albums-outline' }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color="#CBD5E1" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  text: { color: '#94A3B8', marginTop: 12, fontSize: 15, textAlign: 'center' },
});
