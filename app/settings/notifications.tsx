import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    rideUpdates: true,
    bookingConfirmations: true,
  });

  const notificationTypes = [
    {
      title: 'Notifications push',
      key: 'pushNotifications' as keyof typeof notificationSettings,
      icon: 'bell' as const,
    },
    {
      title: 'Notifications email',
      key: 'emailNotifications' as keyof typeof notificationSettings,
      icon: 'envelope.fill' as const,
    },
    {
      title: 'Mises à jour de trajets',
      key: 'rideUpdates' as keyof typeof notificationSettings,
      icon: 'car' as const,
    },
    {
      title: 'Confirmations de réservation',
      key: 'bookingConfirmations' as keyof typeof notificationSettings,
      icon: 'checkmark' as const,
    },
  ];

  const handleToggle = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>
          Notifications
        </ThemedText>
        <ThemedView style={{ width: 24 }} />
      </ThemedView>

      <ScrollView style={styles.content}>
        {notificationTypes.map((type) => (
          <ThemedView
            key={type.key}
            style={[styles.settingItem, { backgroundColor: Colors[colorScheme].card }]}
          >
            <ThemedView style={[styles.settingLeft, { backgroundColor: Colors[colorScheme].cardSecondary }]}>
              <ThemedView style={[styles.settingIcon, { backgroundColor: Colors[colorScheme].cardSecondary }]}>
                <IconSymbol name={type.icon} size={20} color={Colors[colorScheme].tint} />
              </ThemedView>
              <ThemedText style={[styles.settingTitle, { color: Colors[colorScheme].text }]}>
                {type.title}
              </ThemedText>
            </ThemedView>
            <Switch
              value={notificationSettings[type.key]}
              onValueChange={() => handleToggle(type.key)}
              trackColor={{ false: '#767577', true: Colors[colorScheme].tint }}
              thumbColor={notificationSettings[type.key] ? '#f4f3f4' : '#f4f3f4'}
            />
          </ThemedView>
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
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingLeft: 8,
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
}); 