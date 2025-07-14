// Script pour reset complètement l'app Meet2Go
// À exécuter dans la console de développement de l'app React Native

console.log('🧹 Reset App Meet2Go');
console.log('Exécutez ce code dans la console de votre app React Native:');

const AsyncStorage = require('@react-native-async-storage/async-storage');

async function resetApp() {
  try {
    console.log('🧹 Nettoyage complet de l\'application...');
    
    // Supprimer toutes les données d'authentification
    await AsyncStorage.removeItem('auth-token');
    await AsyncStorage.removeItem('user-data');
    await AsyncStorage.removeItem('onboarding-complete');
    
    console.log('✅ Données supprimées avec succès !');
    console.log('📱 Vous pouvez maintenant tester le flux complet :');
    console.log('   1. Onboarding');
    console.log('   2. Inscription');
    console.log('   3. Vérification OTP');
    console.log('   4. Accès à l\'app principale');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

resetApp();

console.log('\n📝 Instructions:');
console.log('1. Ouvrez votre app React Native');
console.log('2. Ouvrez la console de développement (F12 ou Cmd+Option+I)');
console.log('3. Copiez-collez le code ci-dessus');
console.log('4. Redémarrez l\'app');
console.log('5. Vous devriez voir l\'onboarding comme une première installation'); 