import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { getUserProfile, getUserStats, updateUserProfile } from '@/store/slices/userSlice';

import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RootState } from '@/store';
import { uploadProfileImageAsync } from '@/services/firebase';
import { UserAPI } from '@/services/api';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const { settings, updateSettings } = useApp();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile, stats, loading } = useSelector((state: RootState) => state.user);
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [language, setLanguage] = useState('fr');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      await dispatch(getUserProfile()).unwrap();
      await dispatch(getUserStats()).unwrap();
    } catch (error) {
      console.error('Erreur chargement données utilisateur:', error);
    }
  };

  const accountSettings = [
    { id: 'personal', title: 'Informations personnelles', icon: 'person' as const },
    { id: 'payment', title: 'Méthodes de paiement', icon: 'creditcard.fill' as const },
    { id: 'notifications', title: 'Notifications', icon: 'bell' as const },
  ];
  
  const supportTopics = [
    { id: 'contact', title: 'Nous contacter', icon: 'message' as const },
    { id: 'terms', title: 'Termes et conditions', icon: 'doc.text.fill' as const },
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔄 Début de la déconnexion depuis le profil...');
              const result = await dispatch(logout()).unwrap();
              console.log('✅ Déconnexion réussie:', result);
              // La navigation sera gérée automatiquement par _layout.tsx
            } catch (error) {
              console.error('❌ Erreur lors de la déconnexion:', error);
              Alert.alert('Erreur', 'Problème lors de la déconnexion. Veuillez réessayer.');
            }
          },
        },
      ]
    );
  };

  const handleSettingPress = (settingId: string) => {
    console.log('🔗 Tentative de navigation vers:', settingId);
    
    try {
      // Utiliser un switch pour les routes spécifiques
      switch (settingId) {
        case 'personal':
          console.log('🚀 Navigation vers /settings/personal');
          router.push('/settings/personal');
          break;
        case 'payment':
          console.log('🚀 Navigation vers /settings/payment');
          router.push('/settings/payment');
          break;
        case 'notifications':
          console.log('🚀 Navigation vers /settings/notifications');
          router.push('/settings/notifications');
          break;
        case 'contact':
          console.log('🚀 Navigation vers /settings/contact');
          router.push('/settings/contact');
          break;
        case 'terms':
          console.log('🚀 Navigation vers /settings/terms');
          router.push('/settings/terms');
          break;
        default:
          console.log('❌ Route inconnue:', settingId);
          Alert.alert('Paramètre', 'Page en cours de développement');
      }
    } catch (error) {
      console.error('❌ Erreur de navigation:', error);
      Alert.alert('Erreur', 'Impossible de naviguer vers cette page');
    }
  };

  const handleEditProfile = () => {
    console.log('🚀 Navigation vers /settings/personal');
    router.push('/settings/personal');
  };

  const handlePickProfilePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setUploading(true);
        try {
          console.log('�� Upload de l\'image vers Firebase...');
          
          // Récupère l'id utilisateur
          const userId = profile?.uid || user?.uid;
          console.log('userId utilisé:', userId);
          if (!userId) throw new Error("Impossible de trouver l'identifiant utilisateur");
          
          // Upload direct vers Firebase Storage
          const photoURL = await uploadProfileImageAsync(image.uri, userId);
          console.log('✅ Upload Firebase réussi, URL:', photoURL);
          
          // Met à jour le backend avec la nouvelle URL
          const res = await dispatch(updateUserProfile({ avatar: photoURL })).unwrap();
          console.log('updateUserProfile response:', res);
          
          // Recharge le profil
          await dispatch(getUserProfile()).unwrap();
          Alert.alert('Succès', 'Photo de profil mise à jour !');
        } catch (err) {
          console.error('Erreur upload ou updateUserProfile:', err);
          Alert.alert('Erreur', 'Impossible de mettre à jour la photo de profil.\n' + (err as Error).message);
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Erreur sélection image:', error);
      Alert.alert('Erreur', "Impossible de sélectionner l'image");
    }
  };

  // Données utilisateur avec fallback
  const userData = {
    name: profile?.name || user?.name || 'Utilisateur',
    email: profile?.email || user?.email || 'email@example.com',
    memberSince: (() => {
      if (profile?.createdAt) {
        console.log('🔄 profile.createdAt:', profile.createdAt);
        const date = new Date(profile.createdAt);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
        }
      }
      return 'Jan 2023';
    })(),
    ridesPublished: stats?.totalRides || 0,
    ridesBooked: stats?.totalBookings || 0,
    rating: profile?.rating || 0,
    reviews: stats?.totalReviews || 0,
    avatar: profile?.avatar ? { uri: profile.avatar } : require('@/assets/images/default-avatar.png')
  };

  // Log pour debug
  console.log('🖼️ Avatar du profil:', profile?.avatar);
  console.log('🖼️ Avatar affiché:', userData.avatar);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <ThemedView style={[styles.userSection, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
          <ThemedView style={styles.userHeader}>
            <TouchableOpacity onPress={handlePickProfilePhoto} disabled={uploading}>
              <Image 
                source={userData.avatar} 
                style={[styles.avatar, uploading && styles.avatarUploading]} 
              />
              {uploading && (
                <ThemedView style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
                </ThemedView>
              )}
            </TouchableOpacity>
            <ThemedView style={styles.userInfo}>
              <ThemedText style={[styles.userName, { color: Colors[colorScheme].text }]}>{userData.name}</ThemedText>
              <ThemedText style={[styles.userEmail, { color: Colors[colorScheme].text }]}>{userData.email}</ThemedText>
              <ThemedText style={[styles.memberSince, { color: Colors[colorScheme].text }]}>Membre depuis {userData.memberSince}</ThemedText>
            </ThemedView>
            <TouchableOpacity onPress={handleEditProfile}>
              <IconSymbol name="pencil" size={25} color={Colors[colorScheme].tint} />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.userStats}>
            <ThemedView style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: Colors[colorScheme].text }]}>{userData.ridesPublished}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: Colors[colorScheme].text }]}>Trajets publiés</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: Colors[colorScheme].text }]}>{userData.ridesBooked}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: Colors[colorScheme].text }]}>Trajets réservés</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: Colors[colorScheme].text }]}>{userData.rating.toFixed(1)}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: Colors[colorScheme].text }]}>Note ({userData.reviews} avis)</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Account Settings */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>Paramètres du compte</ThemedText>
          <ThemedView style={styles.settingsList}>
            {accountSettings.map((setting) => (
              <TouchableOpacity
                key={setting.id}
                style={[styles.settingItem, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}
                onPress={() => handleSettingPress(setting.id)}
              >
                <ThemedView style={styles.settingLeft}>
                  <ThemedView style={[styles.settingIcon, { backgroundColor: Colors[colorScheme].card }]}>
                    <IconSymbol name={setting.icon} size={20} color={Colors[colorScheme].tint} />
                  </ThemedView>
                  <ThemedText style={[styles.settingTitle, { color: Colors[colorScheme].text }]}>{setting.title}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.settingRight}>
                  <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme].icon} />
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* App Settings */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>Préférences</ThemedText>
          <ThemedView style={[styles.settingItem, { backgroundColor: Colors[colorScheme].cardSecondary }]}>
            <ThemedView style={styles.settingLeft}>
              <ThemedView style={[styles.settingIcon, { backgroundColor: Colors[colorScheme].card }]}>
                <IconSymbol name="moon" size={20} color={Colors[colorScheme].tint} />
              </ThemedView>
              <ThemedText style={[styles.settingTitle, { color: Colors[colorScheme].text }]}>Mode sombre</ThemedText>
            </ThemedView>
            <ThemedView style={styles.settingRight}>
              <TouchableOpacity onPress={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}>
                  <IconSymbol name={settings.theme === 'dark' ? "checkmark.square.fill" : "square"} size={24} color={Colors[colorScheme].tint}/>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        
        {/* Support */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>Support</ThemedText>
          <ThemedView style={styles.settingsList}>
            {supportTopics.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={[styles.settingItem, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}
                onPress={() => handleSettingPress(topic.id)}
              >
                <ThemedView style={styles.settingLeft}>
                  <ThemedView style={[styles.settingIcon, { backgroundColor: Colors[colorScheme].card }]}>
                    <IconSymbol name={topic.icon} size={20} color={Colors[colorScheme].tint} />
                  </ThemedView>
                  <ThemedText style={[styles.settingTitle, { color: Colors[colorScheme].text }]}>{topic.title}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.settingRight}>
                  <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme].icon} />
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Logout Button */}
        <ThemedView style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: '#dc3545' }]}
            onPress={handleLogout}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={Colors[colorScheme].text} />
            <ThemedText style={styles.logoutButtonText}>Se déconnecter</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userSection: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 16,
  },
  avatarUploading: {
    opacity: 0.5,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    paddingTop: 15,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 16,
  },
  memberSince: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 16,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  section: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  settingsList: {
    gap: 12,
    backgroundColor: 'transparent',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    flex: 1,
    justifyContent: 'space-between',
  },
  settingRight: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
}); 