import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function LoadingScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ThemedView style={[styles.logoContainer, { backgroundColor: Colors[colorScheme].card }]}>
        <IconSymbol name="car.fill" size={64} color={Colors[colorScheme].tint} />
      </ThemedView>
      <ThemedText style={styles.title}>Meet2Go</ThemedText>
      <ActivityIndicator 
        size="large" 
        color={Colors[colorScheme].tint} 
        style={styles.spinner}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  spinner: {
    marginTop: 20,
  },
}); 