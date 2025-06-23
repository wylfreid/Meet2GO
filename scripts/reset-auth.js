const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage complet de l\'application...\n');

// 1. Nettoyer le cache d'Expo
console.log('1. Nettoyage du cache Expo...');
try {
  execSync('npx expo start --clear', { stdio: 'inherit' });
} catch (error) {
  console.log('Cache Expo nettoyé');
}

// 2. Nettoyer le cache Metro
console.log('2. Nettoyage du cache Metro...');
try {
  execSync('npx expo start --clear --reset-cache', { stdio: 'inherit' });
} catch (error) {
  console.log('Cache Metro nettoyé');
}

// 3. Supprimer les dossiers de cache
console.log('3. Suppression des dossiers de cache...');
const cacheDirs = [
  '.expo',
  'node_modules/.cache',
  '.metro-cache',
  '.babel-cache'
];

cacheDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ ${dir} supprimé`);
    } catch (error) {
      console.log(`⚠️ Impossible de supprimer ${dir}: ${error.message}`);
    }
  }
});

// 4. Réinstaller les dépendances
console.log('4. Réinstallation des dépendances...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dépendances réinstallées');
} catch (error) {
  console.log('⚠️ Erreur lors de la réinstallation des dépendances');
}

// 5. Réinitialiser les états d'authentification
console.log('5. Réinitialisation des états d\'authentification...');
const resetStates = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    // Supprimer les clés d'authentification
    await AsyncStorage.multiRemove([
      'onboarding-complete',
      'auth-token',
      'user-data',
      'auth-status'
    ]);
    
    console.log('✅ États d\'authentification réinitialisés');
  } catch (error) {
    console.log('⚠️ Impossible de réinitialiser les états (normal si l\'app n\'est pas en cours d\'exécution)');
  }
};

// 6. Instructions pour l'utilisateur
console.log('\n🎯 Instructions pour résoudre les problèmes de navigation :');
console.log('1. Fermez complètement l\'application Expo Go');
console.log('2. Relancez l\'application avec : npx expo start --clear');
console.log('3. Scannez le QR code dans Expo Go');
console.log('4. L\'application devrait maintenant naviguer correctement');

console.log('\n✅ Nettoyage terminé !');
console.log('💡 Si vous avez encore des problèmes, essayez de redémarrer votre appareil.');

// Exécuter la réinitialisation des états si possible
resetStates(); 