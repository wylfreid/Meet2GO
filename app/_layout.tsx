import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Colors } from '@/constants/Colors';
import { AppProvider, useApp } from '@/contexts/AppContext';

function RootLayoutNav() {
  const { settings } = useApp();
  const colorScheme = settings.theme;
  const segments = useSegments();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isOnboardingComplete !== null && isAuthenticated !== null && !hasInitialized) {
      handleInitialNavigation();
    }
  }, [isOnboardingComplete, isAuthenticated, hasInitialized]);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboarding-complete');
      setIsOnboardingComplete(onboardingComplete === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboardingComplete(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const authToken = await AsyncStorage.getItem('auth-token');
      setIsAuthenticated(!!authToken);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  const handleInitialNavigation = () => {
    const currentRoute = segments[0];
    const authRoutes = ['login', 'register', 'forgot-password'];

    console.log('Initial navigation check:', { 
      isOnboardingComplete, 
      isAuthenticated, 
      currentRoute 
    });

    // Si l'onboarding n'est pas terminé et qu'on n'est pas sur l'onboarding
    if (!isOnboardingComplete && currentRoute !== 'onboarding') {
      console.log('Redirecting to onboarding');
      router.replace('/onboarding');
      return;
    }

    // Si l'onboarding est terminé mais pas authentifié et qu'on n'est pas sur une page d'auth
    if (isOnboardingComplete && !isAuthenticated && !authRoutes.includes(currentRoute)) {
      console.log('Redirecting to login');
      router.replace('/login');
      return;
    }

    // Si authentifié et qu'on est sur une page d'auth ou d'onboarding
    if (isAuthenticated && (authRoutes.includes(currentRoute) || currentRoute === 'onboarding')) {
      console.log('Redirecting to main app');
      router.replace('/(tabs)');
      return;
    }

    console.log('Already on valid route, no redirect needed');
    setHasInitialized(true);
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.dark.tint,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      border: Colors.dark.border,
      notification: Colors.dark.tint,
    },
  };

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.tint,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      border: Colors.light.border,
      notification: Colors.light.tint,
    },
  };

  // Afficher un écran de chargement pendant la vérification
  if (isOnboardingComplete === null || isAuthenticated === null) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? customDarkTheme : customLightTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Onboarding */}
          <Stack.Screen name="onboarding" />
          
          {/* Pages d'authentification */}
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          
          {/* Application principale */}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="ride/[id]" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}
