import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SettingsIndexScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  const settingsPages = [
    {
      id: 'personal',
      title: 'Informations personnelles',
      description: 'Modifier vos informations de base',
      icon: 'person' as const,
      route: '/settings/personal',
    },
    {
      id: 'payment',
      title: 'Méthodes de paiement',
      description: 'Gérer vos moyens de paiement',
      icon: 'creditcard.fill' as const,
      route: '/settings/payment',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configurer vos notifications',
      icon: 'bell' as const,
      route: '/settings/notifications',
    },
    {
      id: 'contact',
      title: 'Nous contacter',
      description: 'Contacter le support',
      icon: 'message' as const,
      route: '/settings/contact',
    },
    {
      id: 'terms',
      title: 'Termes et conditions',
      description: 'Conditions d\'utilisation',
      icon: 'doc.text.fill' as const,
      route: '/settings/terms',
    },
  ];

  const handlePagePress = (page: any) => {
    console.log('🔗 Navigation vers:', page.route);
    try {
      router.push(page.route);
    } catch (error) {
      console.error('❌ Erreur de navigation:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>
          Paramètres
        </ThemedText>
        <ThemedView style={{ width: 24 }} />
      </ThemedView>

      <ScrollView style={styles.content}>
        {settingsPages.map((page) => (
          <TouchableOpacity
            key={page.id}
            style={[styles.pageCard, { backgroundColor: Colors[colorScheme].cardSecondary }]}
            onPress={() => handlePagePress(page)}
          >
            <ThemedView style={styles.pageLeft}>
              <ThemedView style={[styles.pageIcon, { backgroundColor: Colors[colorScheme].card }]}>
                <IconSymbol name={page.icon} size={20} color={Colors[colorScheme].tint} />
              </ThemedView>
              <ThemedView style={styles.pageContent}>
                <ThemedText style={[styles.pageTitle, { color: Colors[colorScheme].text }]}>
                  {page.title}
                </ThemedText>
                <ThemedText style={[styles.pageDescription, { color: Colors[colorScheme].textSecondary }]}>
                  {page.description}
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme].icon} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  pageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  pageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pageContent: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  pageDescription: {
    fontSize: 14,
  },
}); 