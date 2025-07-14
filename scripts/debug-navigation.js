const AsyncStorage = require('@react-native-async-storage/async-storage');

async function debugNavigation() {
  try {
    console.log('🔍 Debug de la navigation...');
    
    // Vérifier l'état d'AsyncStorage
    const onboardingComplete = await AsyncStorage.getItem('onboarding-complete');
    const authToken = await AsyncStorage.getItem('auth-token');
    const userData = await AsyncStorage.getItem('user-data');
    
    console.log('📋 État d\'AsyncStorage:');
    console.log('  - onboarding-complete:', onboardingComplete);
    console.log('  - auth-token:', authToken ? '✅ Présent' : '❌ Absent');
    console.log('  - user-data:', userData ? '✅ Présent' : '❌ Absent');
    
    if (userData) {
      const user = JSON.parse(userData);
      console.log('👤 Données utilisateur:');
      console.log('  - uid:', user.uid);
      console.log('  - email:', user.email);
      console.log('  - isVerified:', user.isVerified);
    }
    
    console.log('\n💡 Recommandations:');
    if (!onboardingComplete) {
      console.log('  - L\'onboarding n\'est pas terminé → devrait aller vers /onboarding');
    } else if (!authToken || !userData) {
      console.log('  - Onboarding terminé mais pas d\'auth → devrait aller vers /login');
    } else {
      console.log('  - Utilisateur connecté → devrait aller vers /(tabs)');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  }
}

debugNavigation(); 