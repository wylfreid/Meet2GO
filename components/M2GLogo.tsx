import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

export function M2GLogo({ size = 150 }: { size?: number }) {
  const colorScheme = useColorScheme() ?? 'light'; 

  // Définition des couleurs pour les deux versions du logo
  const darkLogo = {
      background: '#0D1B2A', // Bleu très sombre
      text: '#3A86FF',       // Bleu vif
      border: '#3A86FF'       // Bleu vif
  };

  const lightLogo = {
      background: '#F0F8FF', // Bleu très clair (AliceBlue)
      text: '#0D1B2A',       // Bleu très sombre
      border: '#0D1B2A'       // Bleu très sombre
  };
  
  const themeLogoColors = colorScheme === 'light' ? lightLogo : darkLogo;

  const styles = StyleSheet.create({
    logoContainer: {
      width: size,
      height: size,
      borderRadius: size / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: themeLogoColors.background,
      borderWidth: 2,
      borderColor: themeLogoColors.border,
    },
    logoText: {
      fontSize: size / 2.5,
      fontWeight: 'bold',
      color: themeLogoColors.text,
      fontFamily: 'SpaceMono', // Utilisation de la police de l'application
    },
  });

  return (
    <View style={styles.logoContainer}>
      <Text style={styles.logoText}>M2G</Text>
    </View>
  );
} 