import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const { settings, updateSettings } = useApp();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [language, setLanguage] = useState('fr');

  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    memberSince: 'Jan 2023',
    ridesPublished: 12,
    ridesBooked: 28,
    rating: 4.9,
    reviews: 15,
    avatar: require('@/assets/images/default-avatar.png')
  };

  const accountSettings = [
    { id: 'personal', title: 'Informations personnelles', icon: 'person' as const },
    { id: 'security', title: 'Sécurité', icon: 'lock' as const },
    { id: 'payment', title: 'Méthodes de paiement', icon: 'creditcard.fill' as const },
    { id: 'notifications', title: 'Notifications', icon: 'bell' as const },
  ];
  
  const supportTopics = [
    { id: 'help', title: 'Centre d\'aide', icon: 'questionmark.circle.fill' as const },
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
              await AsyncStorage.removeItem('auth-token');
              router.replace('/login');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Erreur', 'Problème lors de la déconnexion');
            }
          },
        },
      ]
    );
  };

  const handleSettingPress = (settingId: string) => {
    switch (settingId) {
      case 'personal':
        Alert.alert('Informations personnelles', 'Page en cours de développement');
        break;
      case 'security':
        Alert.alert('Sécurité', 'Page en cours de développement');
        break;
      case 'payment':
        Alert.alert('Méthodes de paiement', 'Page en cours de développement');
        break;
      case 'notifications':
        Alert.alert('Notifications', 'Page en cours de développement');
        break;
      case 'help':
        Alert.alert('Centre d\'aide', 'Page en cours de développement');
        break;
      case 'contact':
        Alert.alert('Nous contacter', 'Page en cours de développement');
        break;
      case 'terms':
        Alert.alert('Termes et conditions', 'Page en cours de développement');
        break;
      default:
        Alert.alert('Paramètre', 'Page en cours de développement');
    }
  };

  const handleEditProfile = () => {
    Alert.alert('Modifier le profil', 'Page en cours de développement');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <ThemedView style={[styles.userSection, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
          <ThemedView style={styles.userHeader}>
            <Image source={user.avatar} style={styles.avatar} />
            <ThemedView style={styles.userInfo}>
              <ThemedText style={[styles.userName, { color: Colors[colorScheme].text }]}>{user.name}</ThemedText>
              <ThemedText style={[styles.userEmail, { color: Colors[colorScheme].text }]}>{user.email}</ThemedText>
              <ThemedText style={[styles.memberSince, { color: Colors[colorScheme].text }]}>Membre depuis {user.memberSince}</ThemedText>
            </ThemedView>
            <TouchableOpacity onPress={handleEditProfile}>
              <IconSymbol name="pencil" size={25} color={Colors[colorScheme].tint} />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.userStats}>
            <ThemedView style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: Colors[colorScheme].text }]}>{user.ridesPublished}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: Colors[colorScheme].text }]}>Trajets publiés</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: Colors[colorScheme].text }]}>{user.ridesBooked}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: Colors[colorScheme].text }]}>Trajets réservés</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: Colors[colorScheme].text }]}>{user.rating}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: Colors[colorScheme].text }]}>Note ({user.reviews} avis)</ThemedText>
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
          style={[styles.settingItem, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}
          onPress={handleLogout}
        >
          <ThemedView style={styles.settingContent}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FF3B30" />
            <ThemedText style={[styles.settingText, { color: '#FF3B30', marginLeft: 10 }]}>Se déconnecter</ThemedText>
          </ThemedView>
          <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme].icon} />
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
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
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
}); 