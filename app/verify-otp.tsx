import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { M2GLogo } from '@/components/M2GLogo';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { verifyOtp, resendOtp } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store';

export default function VerifyOtpScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Timer pour le renvoi d'OTP
  useEffect(() => {
    let interval: any;
    
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendTimer]);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Erreur', 'Veuillez saisir le code à 6 chiffres reçu par email.');
      return;
    }

    try {
      const result = await dispatch(verifyOtp({ email: email as string, otp })).unwrap();
      
      if (result) {
        // Ne pas rediriger automatiquement, laisser _layout.tsx gérer la navigation
      }
    } catch (error: any) {
      // Gestion des erreurs spécifiques
      let errorMessage = 'Code invalide ou expiré. Veuillez réessayer.';
      
      if (error?.message) {
        // Messages d'erreur du backend
        if (error.message.includes('Code de vérification invalide')) {
          errorMessage = 'Le code saisi est incorrect. Vérifiez votre email et réessayez.';
        } else if (error.message.includes('Le code de vérification a expiré')) {
          errorMessage = 'Le code a expiré. Veuillez demander un nouveau code.';
        } else if (error.message.includes('Email et code requis')) {
          errorMessage = 'Veuillez saisir le code reçu par email.';
        } else if (error.message.includes('Utilisateur non trouvé')) {
          errorMessage = 'Aucun compte trouvé avec cet email.';
        } else if (error.message.includes('Compte déjà vérifié')) {
          errorMessage = 'Ce compte a déjà été vérifié. Vous pouvez vous connecter.';
        } else if (error.message.includes('Aucun code de vérification trouvé')) {
          errorMessage = 'Aucun code de vérification trouvé. Veuillez demander un nouveau code.';
        } else if (error.message.includes('Erreur lors de la vérification')) {
          errorMessage = 'Problème de connexion au serveur. Vérifiez votre connexion internet.';
        } else {
          // Utiliser le message du backend s'il est disponible
          errorMessage = error.message;
        }
      } else if (error?.status) {
        // Erreurs HTTP
        switch (error.status) {
          case 400:
            errorMessage = 'Code invalide. Vérifiez le code reçu par email.';
            break;
          case 404:
            errorMessage = 'Aucun compte trouvé avec cet email.';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          default:
            errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
        }
      }
      
      Alert.alert('Erreur de vérification', errorMessage);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    try {
      await dispatch(resendOtp(email as string)).unwrap();
      
    } catch (error: any) {
      let errorMessage = 'Erreur lors du renvoi du code.';
      
      if (error?.message) {
        if (error.message.includes('Utilisateur non trouvé')) {
          errorMessage = 'Aucun compte trouvé avec cet email.';
        } else if (error.message.includes('Compte déjà vérifié')) {
          errorMessage = 'Ce compte a déjà été vérifié.';
        } else if (error.message.includes('Email requis')) {
          errorMessage = 'Adresse email requise.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Erreur de renvoi', errorMessage);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={[styles.logoContainer, { backgroundColor: 'transparent' }]}>
            <M2GLogo />
          </ThemedView>
          <ThemedText style={styles.title}>Vérification du compte</ThemedText>
          <ThemedText style={styles.subtitle}>
            Un code de vérification a été envoyé à
          </ThemedText>
          <ThemedText style={[styles.email, { color: Colors[colorScheme].tint }]}>
            {email}
          </ThemedText>
        </ThemedView>

        {/* OTP Input */}
        <ThemedView style={styles.otpContainer}>
          <ThemedView style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
            <IconSymbol name="lock.shield" size={20} color={Colors[colorScheme].icon} />
            <TextInput
              style={[styles.input, { color: Colors[colorScheme].text }]}
              placeholder="Code à 6 chiffres"
              placeholderTextColor={Colors[colorScheme].icon}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              autoFocus
            />
          </ThemedView>
          
          <TouchableOpacity 
            style={[
              styles.verifyButton, 
              { backgroundColor: Colors[colorScheme].tint },
              loading && { opacity: 0.7 }
            ]} 
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <ThemedText style={styles.verifyButtonText}>Vérifier le code</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>

        {/* Footer */}
        <ThemedView style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: Colors[colorScheme].icon }]}>
            Vous n'avez pas reçu le code ?
          </ThemedText>
          <TouchableOpacity 
            style={[
              styles.resendButton,
              !canResend && { opacity: 0.5 }
            ]}
            onPress={handleResendOtp}
            disabled={loading || !canResend}
          >
            <ThemedText style={[styles.resendButtonText, { color: Colors[colorScheme].tint }]}>
              {canResend ? 'Renvoyer le code' : `Renvoyer dans ${resendTimer}s`}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  otpContainer: {
    gap: 20,
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
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 2,
  },
  verifyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 8,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  successMessage: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 