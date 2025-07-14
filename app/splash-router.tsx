import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashRouter() {
  useEffect(() => {
    const check = async () => {
      const onboarding = await AsyncStorage.getItem('onboarding-complete');
      const token = await AsyncStorage.getItem('auth-token');
      const userData = await AsyncStorage.getItem('user-data');
      let user = null;
      try {
        user = userData ? JSON.parse(userData) : null;
      } catch {}

      if (onboarding !== 'true') {
        router.replace('/onboarding');
      } else if (!token || !user) {
        router.replace('/login');
      } else if (user && !user.isVerified) {
        router.replace({ pathname: '/verify-otp', params: { email: user.email } });
      } else {
        router.replace('/(tabs)');
      }
    };
    check();
  }, []);

  return null; // Aucun rendu visuel
} 