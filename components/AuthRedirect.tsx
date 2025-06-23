import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';

export function AuthRedirect() {
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [lastRoute, setLastRoute] = useState<string | null>(null);

  useEffect(() => {
    const currentRoute = segments[0];
    
    // Éviter les redirections en boucle en vérifiant si on a déjà redirigé vers cette route
    if (lastRoute === currentRoute) {
      return;
    }

    setLastRoute(currentRoute);
    
    if (!hasRedirected) {
      checkAuthAndRedirect();
    }
  }, [segments, hasRedirected, lastRoute]);

  const checkAuthAndRedirect = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboarding-complete');
      const authToken = await AsyncStorage.getItem('auth-token');

      const currentRoute = segments[0];
      const authRoutes = ['login', 'register', 'forgot-password'];

      // Si l'onboarding n'est pas terminé et qu'on n'est pas sur l'onboarding
      if (onboardingComplete !== 'true' && currentRoute !== 'onboarding') {
        console.log('Redirecting to onboarding');
        router.replace('/onboarding');
        setHasRedirected(true);
        return;
      }

      // Si l'onboarding est terminé mais pas authentifié et qu'on n'est pas sur une page d'auth
      if (onboardingComplete === 'true' && !authToken && !authRoutes.includes(currentRoute)) {
        console.log('Redirecting to login');
        router.replace('/login');
        setHasRedirected(true);
        return;
      }

      // Si authentifié et qu'on est sur une page d'auth ou d'onboarding
      if (authToken && (authRoutes.includes(currentRoute) || currentRoute === 'onboarding')) {
        console.log('Redirecting to main app');
        router.replace('/(tabs)');
        setHasRedirected(true);
        return;
      }

      // Permettre la navigation libre entre les pages d'authentification
      if (onboardingComplete === 'true' && !authToken && authRoutes.includes(currentRoute)) {
        setHasRedirected(false); // Réinitialiser pour permettre la navigation entre auth pages
      }

    } catch (error) {
      console.error('Error checking auth status:', error);
      // En cas d'erreur, rediriger vers l'onboarding seulement si on n'y est pas déjà
      if (segments[0] !== 'onboarding') {
        router.replace('/onboarding');
        setHasRedirected(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Ne rien rendre, c'est juste un composant de redirection
  return null;
} 