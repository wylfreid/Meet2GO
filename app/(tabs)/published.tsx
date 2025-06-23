import { Link } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function PublishedScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  const publishedRides = [
    {
      id: 1,
      from: "Toronto",
      to: "Montreal",
      date: "28 décembre 2024",
      time: "9:00",
      price: 45,
      status: "active",
      seats: 4,
      bookedSeats: 2,
      earnings: 90,
    },
    {
      id: 2,
      from: "Vancouver",
      to: "Calgary",
      date: "30 décembre 2024",
      time: "14:00",
      price: 60,
      status: "active",
      seats: 3,
      bookedSeats: 1,
      earnings: 60,
    },
    {
      id: 3,
      from: "Ottawa",
      to: "Quebec City",
      date: "25 décembre 2024",
      time: "11:00",
      price: 35,
      status: "completed",
      seats: 4,
      bookedSeats: 4,
      earnings: 140,
    },
    {
      id: 4,
      from: "Edmonton",
      to: "Winnipeg",
      date: "20 décembre 2024",
      time: "8:00",
      price: 55,
      status: "cancelled",
      seats: 3,
      bookedSeats: 0,
      earnings: 0,
    },
  ];

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

  const totalEarnings = publishedRides.reduce((sum, ride) => sum + ride.earnings, 0);
  const activeRides = publishedRides.filter(ride => ride.status === 'active').length;

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
              {publishedRides.length} trajet{publishedRides.length > 1 ? 's' : ''} publié{publishedRides.length > 1 ? 's' : ''}
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
            <ThemedText style={[styles.statNumber, { color: Colors[colorScheme].text }]}>{totalEarnings}€</ThemedText>
            <ThemedText style={[styles.statLabel, { color: Colors[colorScheme].text }]}>Gains totaux</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.ridesContainer}>
          {publishedRides.map((ride) => (
            <Link key={ride.id} href={`/ride/${ride.id}`} asChild>
              <TouchableOpacity style={[styles.rideCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
                <ThemedView style={styles.rideHeader}>
                  <ThemedView style={styles.routeInfo}>
                    <ThemedText style={[styles.routeText, { color: Colors[colorScheme].text }]}>
                      {ride.from} → {ride.to}
                    </ThemedText>
                    <ThemedText style={[styles.rideDate, { color: Colors[colorScheme].text }]}>
                      {ride.date} • {ride.time}
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
                        {ride.bookedSeats}/{ride.seats} places réservées
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.progressBar}>
                      <ThemedView 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${(ride.bookedSeats / ride.seats) * 100}%`,
                            backgroundColor: Colors[colorScheme].tint 
                          }
                        ]} 
                      />
                    </ThemedView>
                  </ThemedView>

                  <ThemedView style={styles.rideFooter}>
                    <ThemedView style={styles.priceInfo}>
                      <ThemedText style={[styles.priceLabel, { color: Colors[colorScheme].text }]}>Prix par place</ThemedText>
                      <ThemedText style={[styles.price, { color: Colors[colorScheme].text }]}>{ride.price}€</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.earningsInfo}>
                      <ThemedText style={[styles.earningsLabel, { color: Colors[colorScheme].text }]}>Gains</ThemedText>
                      <ThemedText style={[styles.earnings, { color: Colors[colorScheme].text }]}>{ride.earnings}€</ThemedText>
                    </ThemedView>
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
}); 