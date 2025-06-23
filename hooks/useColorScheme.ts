import { useApp } from '@/contexts/AppContext';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
  const systemColorScheme = useSystemColorScheme();
  
  try {
    const { settings } = useApp();
    
    // Utiliser le thème des paramètres utilisateur
    return settings.theme;
  } catch (error) {
    // Si AppContext n'est pas disponible, utiliser le thème système
    return (systemColorScheme as 'light' | 'dark') || 'light';
  }
}
