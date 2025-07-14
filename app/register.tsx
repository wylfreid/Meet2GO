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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { M2GLogo } from '@/components/M2GLogo';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { register } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store';

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Validation en temps réel
    validateField(field, value);
  };

  const validateField = (field: string, value: string) => {
    let errorMessage = '';

    switch (field) {
      case 'name':
        if (!value.trim()) {
          errorMessage = 'Le nom complet est requis';
        } else if (value.trim().length < 2 || value.trim().length > 100) {
          errorMessage = 'Le nom complet doit contenir entre 2 et 100 caractères';
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) {
          errorMessage = 'Le nom ne peut contenir que des lettres et espaces';
        }
        break;

      case 'email':
        if (!value.trim()) {
          errorMessage = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = 'Adresse email invalide';
        }
        break;

      case 'phone':
        if (!value.trim()) {
          errorMessage = 'Le téléphone est requis';
        } else if (!/^(\+237)?6[0-9]{8}$/.test(value)) {
          errorMessage = 'Numéro de téléphone invalide (ex: +237690377586 ou 690377586)';
        }
        break;

      case 'password':
        if (!value) {
          errorMessage = 'Le mot de passe est requis';
        } else if (value.length < 6) {
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
        }
        // Vérifier aussi la confirmation si elle existe
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Les mots de passe ne correspondent pas' }));
        } else if (formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
        break;

      case 'confirmPassword':
        if (!value) {
          errorMessage = 'La confirmation du mot de passe est requise';
        } else if (value !== formData.password) {
          errorMessage = 'Les mots de passe ne correspondent pas';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: errorMessage }));
  };

  const validateForm = () => {
    // Valider tous les champs
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field as keyof typeof formData]);
    });

    // Vérifier s'il y a des erreurs
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return false;
    }

    // Vérifier que tous les champs sont remplis
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return false;
    }

    // Vérifier l'acceptation des termes
    if (!acceptTerms) {
      Alert.alert('Erreur', 'Veuillez accepter les termes et conditions');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      let phoneToSend = formData.phone;
      if (!phoneToSend.startsWith('+237')) {
        phoneToSend = '+237' + phoneToSend.replace(/^0+/, ''); // retire les zéros initiaux éventuels
      }
      const registerData = {
        name: formData.name,
        email: formData.email,
        phone: phoneToSend,
        password: formData.password,
      };

      const result = await dispatch(register(registerData)).unwrap();
      
      if (result) {
        // Afficher un message de confirmation
        Alert.alert(
          'Inscription réussie !',
          'Un code de vérification a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception (et vos spams).',
          [
            {
              text: 'Continuer',
              onPress: () => {
                // Ne pas rediriger automatiquement, laisser _layout.tsx gérer la navigation
              }
            }
          ]
        );
      }
    } catch (error: any) {
      // Gestion des erreurs spécifiques
      let errorMessage = 'Problème lors de l\'inscription. Veuillez réessayer.';
      
      if (error?.errors) {
        // Erreurs de validation détaillées du backend
        const errorMessages = error.errors.map((e: any) => e.msg).join('\n');
        Alert.alert('Erreur de validation', errorMessages);
        return;
      } else if (error?.message) {
        // Messages d'erreur du backend
        if (error.message.includes('compte avec cet email existe déjà')) {
          errorMessage = 'Un compte avec cet email existe déjà. Utilisez un autre email ou connectez-vous.';
        } else if (error.message.includes('Tous les champs sont requis')) {
          errorMessage = 'Veuillez remplir tous les champs obligatoires.';
        } else if (error.message.includes('Erreur lors de la création du compte')) {
          errorMessage = 'Problème de connexion au serveur. Vérifiez votre connexion internet.';
        } else if (error.message.includes('Token expired')) {
          errorMessage = 'Session expirée. Veuillez réessayer.';
        } else {
          // Utiliser le message du backend s'il est disponible
          errorMessage = error.message;
        }
      } else if (error?.status) {
        // Erreurs HTTP
        switch (error.status) {
          case 400:
            errorMessage = 'Données invalides. Vérifiez vos informations.';
            break;
          case 409:
            errorMessage = 'Un compte avec cet email existe déjà.';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          default:
            errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
        }
      }
      
      Alert.alert('Erreur d\'inscription', errorMessage);
    }
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
              <ThemedView style={[styles.inputContainer, styles.halfInput, { backgroundColor: Colors[colorScheme].card, borderColor: errors.name ? '#ff4444' : Colors[colorScheme].border }]}>
                <IconSymbol name="person.fill" size={20} color={Colors[colorScheme].icon} />
                <TextInput
                  style={[styles.input, { color: Colors[colorScheme].text }]}
                  placeholder="Nom complet"
                  placeholderTextColor={Colors[colorScheme].icon}
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  autoCapitalize="words"
                />
            </ThemedView>
            {!!errors.name && <ThemedText style={styles.errorText}>{errors.name || ''}</ThemedText>}

            <ThemedView style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card, borderColor: errors.email ? '#ff4444' : Colors[colorScheme].border }]}>
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
            {!!errors.email && <ThemedText style={styles.errorText}>{errors.email || ''}</ThemedText>}

            <ThemedView style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card, borderColor: errors.phone ? '#ff4444' : Colors[colorScheme].border }]}>
              <IconSymbol name="phone.fill" size={20} color={Colors[colorScheme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[colorScheme].text }]}
                placeholder="Téléphone (ex: 612345678)"
                placeholderTextColor={Colors[colorScheme].icon}
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
              />
            </ThemedView>
            {!!errors.phone && <ThemedText style={styles.errorText}>{errors.phone || ''}</ThemedText>}

            <ThemedView style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card, borderColor: errors.password ? '#ff4444' : Colors[colorScheme].border }]}>
              <IconSymbol name="lock.fill" size={20} color={Colors[colorScheme].icon} />
              <TextInput
                style={[styles.input, { color: Colors[colorScheme].text }]}
                placeholder="Mot de passe (min 6 caractères)"
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
            {!!errors.password && <ThemedText style={styles.errorText}>{errors.password || ''}</ThemedText>}

            <ThemedView style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card, borderColor: errors.confirmPassword ? '#ff4444' : Colors[colorScheme].border }]}>
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
            {!!errors.confirmPassword && <ThemedText style={styles.errorText}>{errors.confirmPassword || ''}</ThemedText>}

            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              <ThemedView style={[
                styles.checkbox, 
                { 
                  backgroundColor: acceptTerms ? Colors[colorScheme].tint : 'transparent',
                  borderColor: Colors[colorScheme].border
                }
              ]}>
                {acceptTerms && (
                  <IconSymbol name="checkmark" size={16} color="white" />
                )}
              </ThemedView>
              <ThemedText style={[styles.termsText, { color: Colors[colorScheme].text }]}>
                J'accepte les{' '}
                <ThemedText style={[styles.termsLink, { color: Colors[colorScheme].tint }]}>
                  termes et conditions
                </ThemedText>
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.registerButton, 
                { backgroundColor: Colors[colorScheme].tint },
                loading && { opacity: 0.7 }
              ]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <ThemedText style={styles.registerButtonText}>S'inscrire</ThemedText>
              )}
            </TouchableOpacity>

          </ThemedView>

          {/* Footer */}
          <ThemedView style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: Colors[colorScheme].icon }]}>
              Déjà un compte ?{' '}
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
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
}); 