import { Link } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getNotifications, markAsRead, markAllAsRead } from '@/store/slices/notificationsSlice';
import { RootState, AppDispatch } from '@/store';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const dispatch = useDispatch<AppDispatch>();
  const { notifications = [], unreadCount, loading, error } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    dispatch(getNotifications({}));
  }, [dispatch]);

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

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      Alert.alert('Succès', 'Toutes les notifications ont été marquées comme lues');
    } catch (error: any) {
      Alert.alert('Erreur', error || 'Erreur lors du marquage des notifications');
    }
  };

  const handleNotificationPress = async (notification: any) => {
    if (!notification.read) {
      try {
        await dispatch(markAsRead(notification.id)).unwrap();
      } catch (error: any) {
        console.error('Erreur lors du marquage comme lu:', error);
      }
    }
    Alert.alert(notification.title, notification.message);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days}j`;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={[styles.loadingText, { color: Colors[colorScheme].text }]}>
            <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
        <ThemedView style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#ef4444" />
          <ThemedText style={[styles.errorText, { color: Colors[colorScheme].text }]}>
            Erreur: {error}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

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
          {notifications.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <IconSymbol name="bell" size={48} color={Colors[colorScheme].icon} />
              <ThemedText style={[styles.emptyText, { color: Colors[colorScheme].text }]}>
                Aucune notification
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: Colors[colorScheme].icon }]}>
                Vous n'avez pas encore de notifications
              </ThemedText>
            </ThemedView>
          ) : (
            notifications.map((notification) => (
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
                    {formatTime(notification.createdAt)}
                  </ThemedText>
                </ThemedView>
                {!notification.read && (
                  <ThemedView style={[styles.unreadDot, { backgroundColor: Colors[colorScheme].tint }]} />
                )}
              </TouchableOpacity>
            ))
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 