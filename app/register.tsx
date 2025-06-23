import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
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

import { M2GLogo } from '@/components/M2GLogo';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }

    if (formData.password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    if (!acceptTerms) {
      Alert.alert('Erreur', 'Veuillez accepter les termes et conditions');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulation d'une inscription
    setTimeout(async () => {
      try {
        // Ici vous ajouteriez votre logique d'inscription réelle
        // Pour l'exemple, on sauvegarde un token factice
        await AsyncStorage.setItem('auth-token', 'fake-auth-token');
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Error during registration:', error);
        Alert.alert('Erreur', 'Problème lors de l\'inscription');
      } finally {
        setIsLoading(false);
      }
    }, 2000);
  };

  const handleGoogleRegister = () => {
    Alert.alert('Inscription Google', 'Fonctionnalité à implémenter');
  };

  const handleAppleRegister = () => {
    Alert.alert('Inscription Apple', 'Fonctionnalité à implémenter');
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
            <ThemedText style={styles.subtitle}>Créez votre compte</ThemedText>
          </ThemedView>

          {/* Register Form */}
          <ThemedView style={styles.form}>
              <ThemedView style={[styles.inputContainer, styles.halfInput, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
                <IconSymbol name="person.fill" size={20} color={Colors[colorScheme].icon} />
                <TextInput
                  style={[styles.input, { color: Colors[colorScheme].text }]}
                  placeholder="Nom complet"
                  placeholderTextColor={Colors[colorScheme].icon}
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData('firstName', value)}
                  autoCapitalize="words"
                />
            </ThemedView>

            <ThemedView style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
              <IconSymbol name="envelope.fill" size={20} color={Colors[colorScheme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[colorScheme].text }]}
                placeholder="Email"
                placeholderTextColor={Colors[colorScheme].icon}
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </ThemedView>

            <ThemedView style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
              <IconSymbol name="phone.fill" size={20} color={Colors[colorScheme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[colorScheme].text }]}
                placeholder="Téléphone"
                placeholderTextColor={Colors[colorScheme].icon}
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
              />
            </ThemedView>

            <ThemedView style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
              <IconSymbol name="lock.fill" size={20} color={Colors[colorScheme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[colorScheme].text }]}
                placeholder="Mot de passe"
                placeholderTextColor={Colors[colorScheme].icon}
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
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

            <ThemedView style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
              <IconSymbol name="lock.fill" size={20} color={Colors[colorScheme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[colorScheme].text }]}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={Colors[colorScheme].icon}
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <IconSymbol 
                  name={showConfirmPassword ? "eye.slash" : "eye"} 
                  size={20} 
                  color={Colors[colorScheme].icon} 
                />
              </TouchableOpacity>
            </ThemedView>

            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              <ThemedView style={[
                styles.checkbox, 
                { 
                  backgroundColor: acceptTerms ? Colors[colorScheme].tint : 'transparent',
                  borderColor: acceptTerms ? Colors[colorScheme].tint : Colors[colorScheme].border
                }
              ]}>
                {acceptTerms && (
                  <IconSymbol name="checkmark" size={12} color="white" />
                )}
              </ThemedView>
              <ThemedText style={[styles.termsText, { color: Colors[colorScheme].text }]}>
                J'accepte les{' '}
                <ThemedText style={[styles.termsLink, { color: Colors[colorScheme].tint }]}>
                  termes et conditions
                </ThemedText>
                {' '}et la{' '}
                <ThemedText style={[styles.termsLink, { color: Colors[colorScheme].tint }]}>
                  politique de confidentialité
                </ThemedText>
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.registerButton, 
                { backgroundColor: Colors[colorScheme].tint },
                isLoading && { opacity: 0.7 }
              ]} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ThemedText style={styles.registerButtonText}>Création du compte...</ThemedText>
              ) : (
                <ThemedText style={styles.registerButtonText}>Créer mon compte</ThemedText>
              )}
            </TouchableOpacity>


          </ThemedView>

          {/* Footer */}
          <ThemedView style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: Colors[colorScheme].icon }]}>
              Déjà un compte ?{' '}
            </ThemedText>
              <TouchableOpacity onPress={() => router.push('/login')}>
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
    marginBottom: 30,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
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
  halfInput: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
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
    marginTop: 30,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 