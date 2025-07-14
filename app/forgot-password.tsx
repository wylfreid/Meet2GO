import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { M2GLogo } from '@/components/M2GLogo';
import { AuthAPI } from '@/services/api';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez saisir votre adresse email');
      return;
    }

    setIsLoading(true);
    try {
      await AuthAPI.forgotPassword(email);
      setIsLoading(false);
      Alert.alert(
        'Email envoyé',
        'Un email de réinitialisation a été envoyé à votre adresse email.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      setIsLoading(false);
      let errorMessage = 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.';
      if (error?.message) {
        errorMessage = error.message;
      }
      Alert.alert('Erreur', errorMessage);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <ThemedView style={styles.header}>
          <ThemedView style={[styles.logoContainer, { backgroundColor: 'transparent' }]}>
              <M2GLogo />
            </ThemedView>
            <ThemedText style={styles.title}>Mot de passe oublié</ThemedText>
            <ThemedText style={styles.subtitle}>
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </ThemedText>
          </ThemedView>

          {/* Form */}
          <ThemedView style={styles.form}>
            <ThemedView style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card }]}>
              <IconSymbol name="envelope.fill" size={20} color={Colors[colorScheme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[colorScheme].text }]}
                placeholder="Email"
                placeholderTextColor={Colors[colorScheme].icon}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </ThemedView>

            <TouchableOpacity 
              style={[
                styles.resetButton, 
                { backgroundColor: Colors[colorScheme].tint },
                isLoading && { opacity: 0.7 }
              ]} 
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ThemedText style={styles.resetButtonText}>Envoi en cours...</ThemedText>
              ) : (
                <ThemedText style={styles.resetButtonText}>Envoyer le lien</ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>

          {/* Footer */}
          <ThemedView style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: Colors[colorScheme].icon }]}>
              Vous vous souvenez de votre mot de passe ?{' '}
            </ThemedText>
              <TouchableOpacity onPress={() => router.back()}>
                <ThemedText style={[styles.footerLink, { color: Colors[colorScheme].tint }]}>
                  Se connecter
                </ThemedText>
              </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  resetButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 