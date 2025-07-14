// Configuration Firebase pour Expo/React Native
import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import { getAuth, signInWithEmailAndPassword, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAPI } from './api';

const firebaseConfig = {
  apiKey: "AIzaSyBJu6uD8tyraEn_aEVd-yPxDitcjgoke-Q",
  authDomain: "project-covoiturage-cmr.firebaseapp.com",
  projectId: "project-covoiturage-cmr",
  storageBucket: "project-covoiturage-cmr.firebasestorage.app",
  messagingSenderId: "860093861376",
  appId: "1:860093861376:web:abc562bc405d88346d12e5",
};

// Initialisation unique
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const storage = getStorage(app);
export const auth = getAuth(app);
export { signInWithEmailAndPassword };

// Fonction pour s'authentifier avec Firebase
async function authenticateWithFirebase(): Promise<void> {
  try {
    console.log('🔐 Récupération du token custom Firebase...');
    
    // Récupérer un token custom depuis le backend
    const response = await UserAPI.getFirebaseToken();
    if (!response?.data?.token) {
      throw new Error('Impossible de récupérer le token Firebase');
    }
    
    const customToken = response.data.token;
    console.log('✅ Token custom récupéré, authentification...');
    
    // S'authentifier avec le token custom
    await signInWithCustomToken(auth, customToken);
    console.log('✅ Authentification Firebase réussie avec token custom');
  } catch (error) {
    console.error('❌ Erreur authentification Firebase:', error);
    throw error;
  }
}

// Upload une image de profil et retourne l'URL publique (compatible Expo)
export async function uploadProfileImageAsync(uri: string, userId: string): Promise<string> {
  try {
    // Vérifier si l'utilisateur est déjà connecté
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('🔐 Utilisateur non connecté, authentification nécessaire');
      await authenticateWithFirebase();
    }
    
    console.log('✅ Utilisateur Firebase connecté:', auth.currentUser?.uid);
    
    // Récupère le blob à partir de l'URI locale (méthode compatible Expo)
    console.log('📁 Lecture du fichier:', uri);
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const fileName = `avatars/${userId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, fileName);
    
    console.log('📤 Upload vers Firebase Storage:', fileName);
    await uploadBytes(storageRef, blob, { 
      contentType: 'image/jpeg',
      customMetadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
      }
    });
    
    const downloadURL = await getDownloadURL(storageRef);
    console.log('✅ Upload réussi, URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('❌ Erreur upload Firebase:', error);
    throw error;
  }
} 