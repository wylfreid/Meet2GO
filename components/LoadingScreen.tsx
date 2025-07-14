import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function LoadingScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 