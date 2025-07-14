import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { GoogleTextInput, LocationInfo } from '@/components/GoogleTextInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { HomeAPI } from '@/services/api';
import { RootState, AppDispatch } from '@/store';

// Définition du type Ride
interface Ride {
  id: string;
  from: { address: string };
  to: { address: string };
  date: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  driver?: {
    name?: string;
    averageRating?: string | number;
  };
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  
  const [fromLocation, setFromLocation] = useState<LocationInfo | null>(null);
  const [toLocation, setToLocation] = useState<LocationInfo | null>(null);
  const [featuredRides, setFeaturedRides] = useState<Ride[]>([]);
  const [stats, setStats] = useState({
    totalRides: "0",
    totalUsers: "0",
    averageRating: "0.0",
    totalBookings: "0",
    totalEarnings: "0",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Charger les trajets populaires
      const featuredData = await HomeAPI.getFeaturedRides();
      setFeaturedRides(featuredData?.data.rides || []);

      // Charger les statistiques
      const statsData = await HomeAPI.getStats();
      setStats(statsData?.data || {
        totalRides: "0",
        totalUsers: "0",
        averageRating: "0.0",
        totalBookings: "0",
        totalEarnings: "0",
      });
    } catch (error) {
      console.error('Erreur chargement données accueil:', error);
      // Utiliser des données vides en cas d'erreur
      setFeaturedRides([]);
      setStats({
        totalRides: "0",
        totalUsers: "0",
        averageRating: "0.0",
        totalBookings: "0",
        totalEarnings: "0",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!fromLocation || !toLocation) {
      // Optionnel : afficher une alerte si les champs ne sont pas remplis
      return;
    }
    router.push('/search');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView>
            <ThemedText style={styles.greeting}>Bonjour {user?.name || '!'}</ThemedText>
            <ThemedText style={styles.subtitle}>Où voulez-vous aller aujourd'hui ?</ThemedText>
          </ThemedView>
          <Link href="/notifications" asChild>
              <TouchableOpacity style={[styles.actionCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
                <ThemedView style={[styles.actionIcon2, { backgroundColor: Colors[colorScheme].card }]}>
                  <IconSymbol name="bell" size={24} color={Colors[colorScheme].tint} />
                  {unreadCount > 0 && (
                    <ThemedView style={[styles.notificationBadge, { backgroundColor: '#ef4444' }]}>
                      <ThemedText style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
              </TouchableOpacity>
            </Link>
        </ThemedView>

        {/* Quick Search */}
        <ThemedView style={[styles.searchCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
          <ThemedView style={styles.searchInputs}>
            <GoogleTextInput
              initialLocation={fromLocation?.address || null}
              onLocationSelect={setFromLocation}
              placeholder="Départ"
              showCurrentLocation
            />
            <GoogleTextInput
              initialLocation={toLocation?.address || null}
              onLocationSelect={setToLocation}
              placeholder="Arrivée"
            />
          </ThemedView>
          <TouchableOpacity style={[styles.searchButton, { backgroundColor: Colors[colorScheme].tint }]} onPress={handleSearch}>
            <IconSymbol name="magnifyingglass" size={20} color="white" />
            <ThemedText style={styles.searchButtonText}>Rechercher</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Actions rapides</ThemedText>
          <ThemedView style={styles.quickActionsGrid}>
            <Link href="/publish" asChild>
              <TouchableOpacity style={[styles.actionCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
                <ThemedView style={[styles.actionIcon, { backgroundColor: Colors[colorScheme].card }]}>
                  <IconSymbol name="car" size={24} color={Colors[colorScheme].tint} />
                </ThemedView>
                <ThemedText style={[styles.actionTitle, { color: Colors[colorScheme].text }]}>Publier un trajet</ThemedText>
              </TouchableOpacity>
            </Link>
            <Link href="/bookings" asChild>
              <TouchableOpacity style={[styles.actionCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
                <ThemedView style={[styles.actionIcon, { backgroundColor: Colors[colorScheme].card }]}>
                  <IconSymbol name="ticket" size={24} color={Colors[colorScheme].tint} />
                </ThemedView>
                <ThemedText style={[styles.actionTitle, { color: Colors[colorScheme].text }]}>Mes réservations</ThemedText>
              </TouchableOpacity>
            </Link>
            <Link href="/published" asChild>
              <TouchableOpacity style={[styles.actionCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
                <ThemedView style={[styles.actionIcon, { backgroundColor: Colors[colorScheme].card }]}>
                  <IconSymbol name="clock.arrow.circlepath" size={24} color={Colors[colorScheme].tint} />
                </ThemedView>
                <ThemedText style={[styles.actionTitle, { color: Colors[colorScheme].text }]}>Mes trajets publiés</ThemedText>
              </TouchableOpacity>
            </Link>
          </ThemedView>
        </ThemedView>

        {/* Featured Rides */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Trajets populaires</ThemedText>
            <Link href="/search" asChild>
              <TouchableOpacity>
                <ThemedText style={[styles.seeAllText, { color: Colors[colorScheme].tint }]}>Voir tout</ThemedText>
              </TouchableOpacity>
            </Link>
          </ThemedView>
          
          <ThemedView style={styles.ridesContainer}>
            {loading ? (
              <ThemedText style={[styles.loadingText, { color: Colors[colorScheme].text }]}>Chargement des trajets...</ThemedText>
            ) : featuredRides.length > 0 ? (
              featuredRides.map((ride) => (
                <Link key={ride.id} href={`/ride/${ride.id}`} asChild>
                  <TouchableOpacity style={[styles.rideCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
                    <ThemedView style={styles.rideHeader}>
                      <ThemedView style={styles.routeInfo}>
                        <ThemedText style={[styles.routeText, { color: Colors[colorScheme].text }]}>{ride.from.address} → {ride.to.address}</ThemedText>
                        <ThemedText style={[styles.rideDate, { color: Colors[colorScheme].text }]}>{ride.date} • {ride.departureTime}</ThemedText>
                      </ThemedView>
                      <ThemedText style={[styles.ridePrice, { color: Colors[colorScheme].text }]}>{ride.pricePerSeat}€</ThemedText>
                    </ThemedView>
                    
                    <ThemedView style={styles.rideFooter}>
                      <ThemedView style={styles.driverInfo}>
                        <ThemedView style={[styles.driverAvatar, { backgroundColor: Colors[colorScheme].card }]}>
                          <IconSymbol name="person" size={12} color={Colors[colorScheme].icon} />
                        </ThemedView>
                        <ThemedText style={[styles.driverName, { color: Colors[colorScheme].text }]}>{ride.driver?.name || 'Conducteur'}</ThemedText>
                        <ThemedView style={styles.ratingContainer}>
                          <IconSymbol name="star" size={12} color="#FFD700" />
                          <ThemedText style={[styles.rating, { color: Colors[colorScheme].text }]}>{ride.driver?.averageRating || 'N/A'}</ThemedText>
                        </ThemedView>
                      </ThemedView>
                      <ThemedView style={styles.seatsInfo}>
                        <IconSymbol name="person.3" size={14} color={Colors[colorScheme].icon} />
                        <ThemedText style={[styles.seatsText, { color: Colors[colorScheme].text }]}>{ride.availableSeats} places</ThemedText>
                      </ThemedView>
                    </ThemedView>
                  </TouchableOpacity>
                </Link>
              ))
            ) : (
              <ThemedView style={styles.noRidesContainer}>
                <IconSymbol name="magnifyingglass" size={48} color={Colors[colorScheme].icon} />
                <ThemedText style={[styles.noResultsText, { color: Colors[colorScheme].icon }]}>
                  Aucun trajet trouvé
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  searchCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  searchInputs: {
    gap: 12,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
    opacity: 0.6,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: 'transparent',
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 0.5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIcon2: {
    width: 40,
    height: 40,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  ridesContainer: {
    gap: 12,
    backgroundColor: 'transparent',
    flex: 1,
    minHeight: 200,
  },
  rideCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  routeInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rideDate: {
    fontSize: 14,
    opacity: 0.6,
  },
  ridePrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  driverAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 0.5,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  noRidesText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  noRidesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: 10,
    minHeight: 200,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noRidesImage: {
    width: 150,
    height: 150,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
