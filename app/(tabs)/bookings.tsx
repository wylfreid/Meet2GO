import { Link } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getUserBookings } from '@/store/slices/bookingsSlice';
import { RootState, AppDispatch } from '@/store';

export default function BookingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const dispatch = useDispatch<AppDispatch>();
  const { bookings = [], loading, error } = useSelector((state: RootState) => state.bookings);

  useEffect(() => {
    dispatch(getUserBookings());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10b981';
      case 'pending':
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
      case 'pending':
        return 'En attente';
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
      case 'pending':
        return 'clock';
      case 'completed':
        return 'checkmark.circle.fill';
      case 'cancelled':
        return 'xmark.circle';
      default:
        return 'circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={[styles.loadingText, { color: Colors[colorScheme].text }]}>
            Chargement des réservations...
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
          <ThemedView style={styles.headerContent}>
            <ThemedText style={[styles.title, { color: Colors[colorScheme].text }]}>Mes réservations</ThemedText>
            <ThemedText style={[styles.subtitle, { color: Colors[colorScheme].text }]}>
              {bookings.length} trajet{bookings.length > 1 ? 's' : ''} réservé{bookings.length > 1 ? 's' : ''}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.bookingsContainer}>
          {bookings.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <IconSymbol name="ticket" size={48} color={Colors[colorScheme].icon} />
              <ThemedText style={[styles.emptyText, { color: Colors[colorScheme].text }]}>
                Aucune réservation
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: Colors[colorScheme].icon }]}>
                Vous n'avez pas encore de réservations
              </ThemedText>
            </ThemedView>
          ) : (
            bookings.map((booking) => (
              <Link key={booking.id} href={`/ride/${booking.rideId}`} asChild>
                <TouchableOpacity style={[styles.bookingCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
                  <ThemedView style={styles.bookingHeader}>
                    <ThemedView style={styles.routeInfo}>
                      <ThemedText style={[styles.routeText, { color: Colors[colorScheme].text }]}>
                        {booking.ride.from} → {booking.ride.to}
                      </ThemedText>
                      <ThemedText style={[styles.bookingDate, { color: Colors[colorScheme].text }]}>
                        {formatDate(booking.ride.date)} • {formatTime(booking.ride.departureTime)}
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
                          {booking.ride.driver.name}
                        </ThemedText>
                        <ThemedView style={styles.ratingContainer}>
                          <IconSymbol name="star" size={12} color="#FFD700" />
                          <ThemedText style={[styles.rating, { color: Colors[colorScheme].text }]}>
                            {booking.ride.driver.averageRating}
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
                        {booking.totalPrice}€
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </TouchableOpacity>
              </Link>
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
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.7,
  },
}); 