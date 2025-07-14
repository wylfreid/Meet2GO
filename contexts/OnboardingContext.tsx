import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => Promise<void>;
  loading: boolean;
  isTransitioning: boolean;
  setTransitioning: (value: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const load = async () => {
      const value = await AsyncStorage.getItem('onboarding-complete');
      setIsOnboardingComplete(value === 'true');
      setLoading(false);
    };
    load();
  }, []);

  const setOnboardingComplete = async (value: boolean) => {
    await AsyncStorage.setItem('onboarding-complete', value ? 'true' : 'false');
    setIsOnboardingComplete(value);
  };

  return (
    <OnboardingContext.Provider value={{ isOnboardingComplete, setOnboardingComplete, loading, isTransitioning, setTransitioning }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
} 