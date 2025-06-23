import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';

export function InitialRedirect() {
  const segments = useSegments();
  const [hasChecked, setHasChecked] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const currentRoute = segments[0];
    
    // Capturer la route initiale
    if (!initialRoute) {
      setInitialRoute(currentRoute);
    }
    
    // Ne vérifier qu'une seule fois au démarrage et seulement si on n'est pas déjà sur une route valide
    if (!hasChecked && initialRoute) {
      checkInitialRoute();
    }
  }, [segments, hasChecked, initialRoute]);

  const checkInitialRoute = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboarding-complete');
      const authToken = await AsyncStorage.getItem('auth-token');
      const currentRoute = segments[0];

      console.log('Initial route check:', { onboardingComplete, authToken, currentRoute, initialRoute });

      // Si l'onboarding n'est pas terminé et qu'on n'est pas sur l'onboarding
      if (onboardingComplete !== 'true' && currentRoute !== 'onboarding') {
        console.log('Initial redirect to onboarding');
        router.replace('/onboarding');
        return;
      }

      // Si l'onboarding est terminé mais pas authentifié et qu'on n'est pas sur une page d'auth
      if (onboardingComplete === 'true' && !authToken && 
          !['login', 'register', 'forgot-password'].includes(currentRoute)) {
        console.log('Initial redirect to login');
        router.replace('/login');
        return;
      }

      // Si authentifié et qu'on est sur une page d'auth ou d'onboarding
      if (authToken && ['login', 'register', 'forgot-password', 'onboarding'].includes(currentRoute)) {
        console.log('Initial redirect to main app');
        router.replace('/(tabs)');
        return;
      }

      // Si on est déjà sur une route valide, ne rien faire
      console.log('Already on valid route, no redirect needed');

    } catch (error) {
      console.error('Error checking initial route:', error);
      // En cas d'erreur, rediriger vers l'onboarding seulement si on n'y est pas déjà
      if (segments[0] !== 'onboarding') {
        router.replace('/onboarding');
      }
    } finally {
      setHasChecked(true);
    }
  };

  // Ne rien rendre, c'est juste un composant de redirection initiale
  return null;
} 