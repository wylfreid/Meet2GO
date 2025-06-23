import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'Réservation confirmée',
      message: 'Votre réservation pour le trajet Toronto → Montreal a été confirmée',
      time: 'Il y a 2h',
      read: false,
    },
    {
      id: 2,
      type: 'ride',
      title: 'Nouveau passager',
      message: 'Marie L. a réservé une place dans votre trajet Ottawa → Quebec',
      time: 'Il y a 4h',
      read: false,
    },
    {
      id: 3,
      type: 'payment',
      title: 'Paiement reçu',
      message: 'Vous avez reçu 45€ pour votre trajet Vancouver → Calgary',
      time: 'Il y a 1j',
      read: true,
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Rappel de trajet',
      message: 'Votre trajet Toronto → Montreal part dans 30 minutes',
      time: 'Il y a 1j',
      read: true,
    },
    {
      id: 5,
      type: 'review',
      title: 'Nouvel avis',
      message: 'Sarah M. vous a laissé un avis 5 étoiles',
      time: 'Il y a 2j',
      read: true,
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return 'checkmark.circle.fill';
      case 'ride':
        return 'person.2';
      case 'payment':
        return 'dollarsign.circle.fill';
      case 'reminder':
        return 'clock.fill';
      case 'review':
        return 'star';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking':
        return '#10b981';
      case 'ride':
        return '#3b82f6';
      case 'payment':
        return '#f59e0b';
      case 'reminder':
        return '#ef4444';
      case 'review':
        return '#8b5cf6';
      default:
        return Colors[colorScheme].tint;
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    Alert.alert('Succès', 'Toutes les notifications ont été marquées comme lues');
  };

  const handleNotificationPress = (notification: any) => {
    if (!notification.read) {
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
    Alert.alert(notification.title, notification.message);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].tint} />
            </TouchableOpacity>
          </Link>
          <ThemedText style={[styles.title, { color: Colors[colorScheme].text }]}>Notifications</ThemedText>
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <ThemedText style={[styles.markAllRead, { color: Colors[colorScheme].tint }]}>Tout marquer comme lu</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.notificationsContainer}>
          {notifications.map((notification) => (
            <TouchableOpacity 
              key={notification.id} 
              style={[
                styles.notificationItem, 
                { 
                  backgroundColor: notification.read ? Colors[colorScheme].cardSecondary : Colors[colorScheme].card,
                  borderColor: Colors[colorScheme].border 
                }
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <ThemedView style={[styles.notificationIcon, { backgroundColor: getNotificationColor(notification.type) + '15' }]}>
                <IconSymbol 
                  name={getNotificationIcon(notification.type)} 
                  size={20} 
                  color={getNotificationColor(notification.type)} 
                />
              </ThemedView>
              <ThemedView style={styles.notificationContent}>
                <ThemedText style={[styles.notificationTitle, { color: Colors[colorScheme].text }]}>
                  {notification.title}
                </ThemedText>
                <ThemedText style={[styles.notificationMessage, { color: Colors[colorScheme].text }]}>
                  {notification.message}
                </ThemedText>
                <ThemedText style={[styles.notificationTime, { color: Colors[colorScheme].text }]}>
                  {notification.time}
                </ThemedText>
              </ThemedView>
              {!notification.read && (
                <ThemedView style={[styles.unreadDot, { backgroundColor: Colors[colorScheme].tint }]} />
              )}
            </TouchableOpacity>
          ))}
        </ThemedView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsContainer: {
    padding: 20,
    gap: 12,
    backgroundColor: 'transparent',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.5,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
}); 