import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { M2GLogo } from '@/components/M2GLogo';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    
    // Simulation d'une connexion
    setTimeout(async () => {
      try {
        // Simuler une réponse de l'API
        const mockApiResponse = {
          token: 'fake-auth-token-12345',
          user: {
            email,
            name: 'John Doe',
          },
        };

        await AsyncStorage.setItem('auth-token', mockApiResponse.token);
        await AsyncStorage.setItem('user-data', JSON.stringify(mockApiResponse.user));

        router.replace('/(tabs)');
      } catch (error) {
        console.error('Login failed:', error);
        Alert.alert('Erreur', 'La connexion a échoué. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    }, 2000); // Simuler une latence réseau de 2s
  };

  const handleGoogleLogin = () => {
    Alert.alert('Connexion Google', 'Fonctionnalité à implémenter');
  };

  const handleAppleLogin = () => {
    Alert.alert('Connexion Apple', 'Fonctionnalité à implémenter');
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
            <ThemedText style={styles.title}>Meet2Go</ThemedText>
            <ThemedText style={styles.subtitle}>Connectez-vous à votre compte</ThemedText>
          </ThemedView>

          {/* Login Form */}
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

            <ThemedView style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card }]}>
              <IconSymbol name="lock.fill" size={20} color={Colors[colorScheme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[colorScheme].text }]}
                placeholder="Mot de passe"
                placeholderTextColor={Colors[colorScheme].icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <IconSymbol 
                  name={showPassword ? "eye.slash" : "eye"} 
                  size={20} 
                  color={Colors[colorScheme].icon} 
                />
              </TouchableOpacity>
            </ThemedView>

            <Link href="/forgot-password" asChild>
              <TouchableOpacity style={styles.forgotPassword}>
                <ThemedText style={[styles.forgotPasswordText, { color: Colors[colorScheme].tint }]}>
                  Mot de passe oublié ?
                </ThemedText>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity 
              style={[
                styles.loginButton, 
                { backgroundColor: Colors[colorScheme].tint },
                isLoading && { opacity: 0.7 }
              ]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ThemedText style={styles.loginButtonText}>Connexion...</ThemedText>
              ) : (
                <ThemedText style={styles.loginButtonText}>Se connecter</ThemedText>
              )}
            </TouchableOpacity>

          </ThemedView>

          {/* Footer */}
          <ThemedView style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: Colors[colorScheme].icon }]}>
              Pas encore de compte ?{' '}
            </ThemedText>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <ThemedText style={[styles.footerLink, { color: Colors[colorScheme].tint }]}>
                  S'inscrire
                </ThemedText>
              </TouchableOpacity>
            </Link>
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
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    gap: 16,
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
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
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