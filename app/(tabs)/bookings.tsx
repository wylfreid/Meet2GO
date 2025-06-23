import { Link } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function BookingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  const bookings = [
    {
      id: 1,
      from: "Toronto",
      to: "Montreal",
      date: "28 décembre 2024",
      time: "9:00",
      price: 45,
      status: "confirmed",
      driver: "Sarah M.",
      rating: 4.9,
      seats: 1,
    },
    {
      id: 2,
      from: "Vancouver",
      to: "Calgary",
      date: "30 décembre 2024",
      time: "14:00",
      price: 60,
      status: "upcoming",
      driver: "Mike R.",
      rating: 4.8,
      seats: 2,
    },
    {
      id: 3,
      from: "Ottawa",
      to: "Quebec City",
      date: "25 décembre 2024",
      time: "11:00",
      price: 35,
      status: "completed",
      driver: "Emma L.",
      rating: 5.0,
      seats: 1,
    },
    {
      id: 4,
      from: "Edmonton",
      to: "Winnipeg",
      date: "20 décembre 2024",
      time: "8:00",
      price: 55,
      status: "cancelled",
      driver: "John D.",
      rating: 4.7,
      seats: 1,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10b981';
      case 'upcoming':
        return '#3b82f6';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      default:
        return Colors[colorScheme].tint;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'upcoming':
        return 'À venir';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark.circle';
      case 'upcoming':
        return 'clock';
      case 'completed':
        return 'checkmark.circle.fill';
      case 'cancelled':
        return 'xmark.circle';
      default:
        return 'circle';
    }
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
          <ThemedView style={styles.headerContent}>
            <ThemedText style={[styles.title, { color: Colors[colorScheme].text }]}>Mes réservations</ThemedText>
            <ThemedText style={[styles.subtitle, { color: Colors[colorScheme].text }]}>
              {bookings.length} trajet{bookings.length > 1 ? 's' : ''} réservé{bookings.length > 1 ? 's' : ''}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.bookingsContainer}>
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/ride/${booking.id}`} asChild>
              <TouchableOpacity style={[styles.bookingCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
                <ThemedView style={styles.bookingHeader}>
                  <ThemedView style={styles.routeInfo}>
                    <ThemedText style={[styles.routeText, { color: Colors[colorScheme].text }]}>
                      {booking.from} → {booking.to}
                    </ThemedText>
                    <ThemedText style={[styles.bookingDate, { color: Colors[colorScheme].text }]}>
                      {booking.date} • {booking.time}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.statusContainer}>
                    <ThemedView style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '15' }]}>
                      <IconSymbol name={getStatusIcon(booking.status)} size={12} color={getStatusColor(booking.status)} />
                      <ThemedText style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                        {getStatusText(booking.status)}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={styles.bookingDetails}>
                  <ThemedView style={styles.driverInfo}>
                    <ThemedView style={[styles.driverAvatar, { backgroundColor: Colors[colorScheme].card }]}>
                      <IconSymbol name="person" size={16} color={Colors[colorScheme].icon} />
                    </ThemedView>
                    <ThemedView style={styles.driverDetails}>
                      <ThemedText style={[styles.driverName, { color: Colors[colorScheme].text }]}>
                        {booking.driver}
                      </ThemedText>
                      <ThemedView style={styles.ratingContainer}>
                        <IconSymbol name="star" size={12} color="#FFD700" />
                        <ThemedText style={[styles.rating, { color: Colors[colorScheme].text }]}>
                          {booking.rating}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>

                  <ThemedView style={styles.bookingFooter}>
                    <ThemedView style={styles.seatsInfo}>
                      <IconSymbol name="person" size={14} color={Colors[colorScheme].icon} />
                      <ThemedText style={[styles.seatsText, { color: Colors[colorScheme].text }]}>
                        {booking.seats} place{booking.seats > 1 ? 's' : ''}
                      </ThemedText>
                    </ThemedView>
                    <ThemedText style={[styles.price, { color: Colors[colorScheme].text }]}>
                      {booking.price}€
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </TouchableOpacity>
            </Link>
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  bookingsContainer: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
    backgroundColor: 'transparent',
  },
  bookingCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  routeInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  routeText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    opacity: 0.6,
  },
  statusContainer: {
    backgroundColor: 'transparent',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookingDetails: {
    backgroundColor: 'transparent',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  rating: {
    fontSize: 12,
    opacity: 0.7,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  seatsText: {
    fontSize: 12,
    opacity: 0.6,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 