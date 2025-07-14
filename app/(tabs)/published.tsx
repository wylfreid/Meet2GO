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
import { getUserRides, clearRides } from '@/store/slices/ridesSlice';
import { RootState, AppDispatch } from '@/store';

export default function PublishedScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const dispatch = useDispatch<AppDispatch>();
  const { userRides = [], loading, error } = useSelector((state: RootState) => state.rides);

  useEffect(() => {
    // Nettoyer les erreurs précédentes
    dispatch(clearRides());
    dispatch(getUserRides());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
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
      case 'active':
        return 'Actif';
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
      case 'active':
        return 'play.circle';
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

  const calculateEarnings = (ride: any) => {
    const bookedSeats = ride.totalSeats - ride.availableSeats;
    return bookedSeats * ride.pricePerSeat;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={[styles.loadingText, { color: Colors[colorScheme].text }]}>
            Chargement de vos trajets...
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

  const totalEarnings = userRides.reduce((sum, ride) => sum + calculateEarnings(ride), 0);
  const activeRides = userRides.filter(ride => ride.status === 'active').length;

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
            <ThemedText style={[styles.title, { color: Colors[colorScheme].text }]}>Mes trajets publiés</ThemedText>
            <ThemedText style={[styles.subtitle, { color: Colors[colorScheme].text }]}>
              {userRides.length} trajet{userRides.length > 1 ? 's' : ''} publié{userRides.length > 1 ? 's' : ''}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Stats */}
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={[styles.statCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
            <IconSymbol name="play.circle" size={24} color={Colors[colorScheme].tint} />
            <ThemedText style={[styles.statNumber, { color: Colors[colorScheme].text }]}>{activeRides}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: Colors[colorScheme].text }]}>Trajets actifs</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.statCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
            <IconSymbol name="dollarsign.circle" size={24} color={Colors[colorScheme].tint} />
            <ThemedText style={[styles.statNumber, { color: Colors[colorScheme].text }]}>{totalEarnings} FCFA</ThemedText>
            <ThemedText style={[styles.statLabel, { color: Colors[colorScheme].text }]}>Gains totaux</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.ridesContainer}>
          {userRides.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <IconSymbol name="clock.arrow.circlepath" size={48} color={Colors[colorScheme].icon} />
              <ThemedText style={[styles.emptyText, { color: Colors[colorScheme].text }]}>
                Aucun trajet publié
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: Colors[colorScheme].icon }]}>
                Publiez votre premier trajet pour commencer
              </ThemedText>
            </ThemedView>
          ) : (
            userRides.map((ride) => {
              const bookedSeats = ride.totalSeats - ride.availableSeats;
              const earnings = calculateEarnings(ride);
              
              return (
                <Link key={ride.id} href={`/ride/${ride.id}`} asChild>
                  <TouchableOpacity style={[styles.rideCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
                    <ThemedView style={styles.rideHeader}>
                      <ThemedView style={styles.routeInfo}>
                        <ThemedText style={[styles.routeText, { color: Colors[colorScheme].text }]}>
                          {ride.from} → {ride.to}
                        </ThemedText>
                        <ThemedText style={[styles.rideDate, { color: Colors[colorScheme].text }]}>
                          {formatDate(ride.date)} • {formatTime(ride.departureTime)}
                        </ThemedText>
                      </ThemedView>
                      <ThemedView style={styles.statusContainer}>
                        <ThemedView style={[styles.statusBadge, { backgroundColor: getStatusColor(ride.status) + '15' }]}>
                          <IconSymbol name={getStatusIcon(ride.status)} size={12} color={getStatusColor(ride.status)} />
                          <ThemedText style={[styles.statusText, { color: getStatusColor(ride.status) }]}>
                            {getStatusText(ride.status)}
                          </ThemedText>
                        </ThemedView>
                      </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.rideDetails}>
                      <ThemedView style={styles.seatsInfo}>
                        <ThemedView style={styles.seatsContainer}>
                          <IconSymbol name="person.3" size={16} color={Colors[colorScheme].icon} />
                          <ThemedText style={[styles.seatsText, { color: Colors[colorScheme].text }]}>
                            {bookedSeats}/{ride.totalSeats} places réservées
                          </ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.progressBar}>
                          <ThemedView 
                            style={[
                              styles.progressFill, 
                              { 
                                width: `${(bookedSeats / ride.totalSeats) * 100}%`,
                                backgroundColor: Colors[colorScheme].tint 
                              }
                            ]} 
                          />
                        </ThemedView>
                      </ThemedView>

                      <ThemedView style={styles.rideFooter}>
                        <ThemedView style={styles.priceInfo}>
                          <ThemedText style={[styles.priceLabel, { color: Colors[colorScheme].text }]}>Prix par place</ThemedText>
                          <ThemedText style={[styles.price, { color: Colors[colorScheme].text }]}>{ride.pricePerSeat}€</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.earningsInfo}>
                          <ThemedText style={[styles.earningsLabel, { color: Colors[colorScheme].text }]}>Gains</ThemedText>
                          <ThemedText style={[styles.earnings, { color: Colors[colorScheme].text }]}>{earnings}€</ThemedText>
                        </ThemedView>
                      </ThemedView>
                    </ThemedView>
                  </TouchableOpacity>
                </Link>
              );
            })
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
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  ridesContainer: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
    backgroundColor: 'transparent',
  },
  rideCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
  },
  rideHeader: {
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
  rideDate: {
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
  rideDetails: {
    backgroundColor: 'transparent',
  },
  seatsInfo: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  seatsText: {
    fontSize: 14,
    marginLeft: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  priceInfo: {
    backgroundColor: 'transparent',
  },
  priceLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  earningsInfo: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  earningsLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  earnings: {
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
    fontSize: 14,
    opacity: 0.7,
  },
}); 