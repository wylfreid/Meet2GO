import { router } from 'expo-router';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Supprimer tous les console.error du fichier
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: undefined });
    // Vérifier si l'utilisateur est connecté avant de rediriger
    const checkAuthAndNavigate = async () => {
      try {
        const userData = await AsyncStorage.getItem('user-data');
        if (userData) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      } catch (error) {
        router.replace('/login');
      }
    };
    checkAuthAndNavigate();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} onGoHome={this.handleGoHome} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onRetry, onGoHome }: { 
  error?: Error; 
  onRetry: () => void; 
  onGoHome: () => void; 
}) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <View style={[styles.content, { backgroundColor: Colors[colorScheme].card }]}>
        <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
          Oups ! Quelque chose s'est mal passé
        </Text>
        
        <Text style={[styles.message, { color: Colors[colorScheme].icon }]}>
          Une erreur inattendue s'est produite. Veuillez réessayer.
        </Text>

        {error && (
          <Text style={[styles.error, { color: Colors[colorScheme].icon }]}>
            {error.message}
          </Text>
        )}

        <View style={styles.buttons}>
          <TouchableOpacity 
            style={[styles.button, styles.retryButton, { backgroundColor: Colors[colorScheme].tint }]} 
            onPress={onRetry}
          >
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.homeButton, { borderColor: Colors[colorScheme].border }]} 
            onPress={onGoHome}
          >
            <Text style={[styles.buttonText, { color: Colors[colorScheme].text }]}>
              Accueil
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  error: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  retryButton: {
    flex: 1,
  },
  homeButton: {
    flex: 1,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 