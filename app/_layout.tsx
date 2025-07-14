import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack, useSegments, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store, RootState, AppDispatch } from '../store';
import { getCurrentUser, initializeUserFromCache } from '../store/slices/authSlice';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Colors } from '@/constants/Colors';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';

function RootLayoutNav() {
  const { settings } = useApp();
  const colorScheme = settings.theme;
  const segments = useSegments();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const { isOnboardingComplete, loading: onboardingLoading, isTransitioning } = useOnboarding();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (isTransitioning) return;
    if (!isLoading && !onboardingLoading && !authLoading) {
      const currentRoute = segments[0];
      console.log('🧭 NAV CHECK:', { currentRoute, user: user?.name, isOnboardingComplete });
      
      // Si l'onboarding n'est pas terminé, priorité à l'onboarding
      if (!isOnboardingComplete) {
        if (currentRoute !== 'onboarding') {
          console.log('📚 Redirection vers onboarding');
          router.replace('/onboarding');
        }
        return;
      }
      
      // Onboarding terminé, gestion de l'authentification
      if (!user) {
        console.log('🔒 Utilisateur non connecté');
        if (
          currentRoute !== 'login' &&
          currentRoute !== 'register' &&
          currentRoute !== 'forgot-password' &&
          currentRoute !== 'verify-otp'
        ) {
          console.log('🔀 Redirection vers login');
          router.replace('/login');
        }
      } else if (!user.isVerified) {
        console.log('📧 Utilisateur non vérifié');
        if (currentRoute !== 'verify-otp') {
          console.log('🔀 Redirection vers verify-otp');
          router.replace({ pathname: '/verify-otp', params: { email: user.email } });
        }
      } else {
        console.log('✅ Utilisateur connecté et vérifié');
        const allowedRoutes = ['(tabs)', 'settings', 'ride'];
        const isAllowedRoute = allowedRoutes.some(route => currentRoute?.startsWith(route));
        if (!isAllowedRoute && currentRoute !== '(tabs)') {
          console.log('🔀 Redirection vers tabs');
          router.replace('/(tabs)');
        }
      }
    }
  }, [isLoading, onboardingLoading, isOnboardingComplete, authLoading, segments, user, isTransitioning]);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initialisation de l\'app...');
      
      // Vérifier l'authentification indépendamment de l'onboarding
      console.log('🔍 Vérification de l\'authentification...');
      
      const authToken = await AsyncStorage.getItem('auth-token');
      const userData = await AsyncStorage.getItem('user-data');
      
      console.log('🔍 Token trouvé:', !!authToken, 'User data trouvé:', !!userData);
      
      if (authToken && userData) {
        console.log('📱 Utilisateur en cache, initialisation...');
        await dispatch(initializeUserFromCache()).unwrap();
        const userFromCache = JSON.parse(userData);
        console.log('✅ Utilisateur initialisé depuis le cache:', userFromCache.name);
        
        // Si l'utilisateur est connecté, marquer l'onboarding comme terminé
        const onboardingComplete = await AsyncStorage.getItem('onboarding-complete');
        if (onboardingComplete !== 'true') {
          console.log('📚 Marquer l\'onboarding comme terminé (utilisateur connecté)');
          await AsyncStorage.setItem('onboarding-complete', 'true');
        }
      } else if (authToken) {
        console.log('🌐 Token trouvé mais pas de cache, vérification API...');
        try {
          const userFromApi = await dispatch(getCurrentUser()).unwrap();
          console.log('✅ Utilisateur récupéré depuis l\'API:', userFromApi?.name);
          
          // Si l'utilisateur est connecté, marquer l'onboarding comme terminé
          const onboardingComplete = await AsyncStorage.getItem('onboarding-complete');
          if (onboardingComplete !== 'true') {
            console.log('📚 Marquer l\'onboarding comme terminé (utilisateur connecté)');
            await AsyncStorage.setItem('onboarding-complete', 'true');
          }
        } catch (error) {
          console.log('❌ Erreur API, nettoyage du token...');
          await AsyncStorage.removeItem('auth-token');
          await AsyncStorage.removeItem('user-data');
        }
      } else {
        console.log('🔒 Aucun token trouvé, utilisateur non connecté');
      }
      
      console.log('📚 État onboarding:', isOnboardingComplete);
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
    } finally {
      console.log('🏁 Initialisation terminée');
      setIsLoading(false);
    }
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

  if ((isLoading || onboardingLoading) && isOnboardingComplete === null) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemeProvider value={colorScheme === 'dark' ? customDarkTheme : customLightTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash-router" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="verify-otp" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="+not-found" />
        </Stack>
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
    <Provider store={store}>
      <AppProvider>
        <OnboardingProvider>
          <RootLayoutNav />
        </OnboardingProvider>
      </AppProvider>
    </Provider>
  );
}
