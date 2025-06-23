import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// Mock data - in a real app, this would come from an API
const rideData = {
  id: 1,
  from: "Toronto",
  to: "Montreal",
  date: "28 décembre 2024",
  time: "9:00",
  price: 45,
  duration: "5h 30m",
  seats: 3,
  driver: {
    name: "Sarah Mitchell",
    rating: 4.9,
    reviews: 127,
    joinDate: "2019",
    image: "/placeholder.svg?height=80&width=80",
    verified: true,
    bio: "Conductrice expérimentée qui aime rencontrer de nouvelles personnes. Je fais régulièrement cette route pour le travail et j'aime partager le voyage !",
  },
  car: {
    make: "Honda",
    model: "Civic",
    year: "2020",
    color: "Argent",
    plate: "ABC 123",
  },
  route: [
    { location: "Centre-ville Toronto", time: "9:00" },
    { location: "Aire de repos Highway 401", time: "11:30" },
    { location: "Centre-ville Montreal", time: "14:30" },
  ],
  amenities: ["Climatisation", "Musique", "Chargeur téléphone", "Animaux acceptés"],
  policies: ["Non-fumeur", "Max 1 bagage par personne", "Être à l'heure"],
};

export default function RideDetailsScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { credits, deductCredits } = useApp();
  const [isBooking, setIsBooking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleBooking = async () => {
    if (credits < rideData.price) {
      Alert.alert("Crédits insuffisants", "Vous n'avez pas assez de crédits pour cette réservation.");
      return;
    }

    setIsBooking(true);
    
    // Simulate API call
    setTimeout(() => {
      const success = deductCredits(rideData.price, `Réservation: ${rideData.from} → ${rideData.to}`);
      
      if (success) {
        Alert.alert(
          "Réservation confirmée !",
          `Votre trajet de ${rideData.from} vers ${rideData.to} a été réservé.`,
          [
            { text: "Voir mes réservations", onPress: () => router.push('/bookings') },
            { text: "OK", style: "default" }
          ]
        );
      } else {
        Alert.alert("Erreur", "Impossible de finaliser la réservation. Veuillez réessayer.");
      }
      
      setIsBooking(false);
    }, 1500);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
      isFavorite 
        ? "Ce trajet a été retiré de vos favoris" 
        : "Ce trajet a été ajouté à vos favoris"
    );
  };

  if (!rideData) {
    return <ThemedText>Chargement...</ThemedText>;
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Stack.Screen 
        options={{ 
          title: `${rideData.from} → ${rideData.to}`,
          headerShown: true,
        }} 
      />
      <ScrollView style={{ flex: 1, marginTop: 20 }}>

        {/* Trip Overview Card */}
        <ThemedView style={[styles.overviewCard, { backgroundColor: Colors[theme].cardSecondary, borderColor: Colors[theme].border }]}>
          <ThemedText style={[styles.cardTitle, { color: Colors[theme].text }]}>Aperçu du trajet</ThemedText>
          <ThemedView style={styles.overviewGrid}>
            <ThemedView style={styles.overviewItem}>
              <IconSymbol name="calendar" size={24} color={Colors[theme].tint} />
              <ThemedText style={[styles.overviewText, { color: Colors[theme].text }]}>{rideData.date}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.overviewItem}>
              <IconSymbol name="clock" size={24} color={Colors[theme].tint} />
              <ThemedText style={[styles.overviewText, { color: Colors[theme].text }]}>{rideData.time}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.overviewItem}>
              <IconSymbol name="dollarsign.circle" size={24} color={Colors[theme].tint} />
              <ThemedText style={[styles.overviewText, { color: Colors[theme].text }]}>${rideData.price} / place</ThemedText>
            </ThemedView>
            <ThemedView style={styles.overviewItem}>
              <IconSymbol name="person.3" size={24} color={Colors[theme].tint} />
              <ThemedText style={[styles.overviewText, { color: Colors[theme].text }]}>{rideData.seats} places</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Driver Card */}
        <ThemedView style={[styles.driverCard, { backgroundColor: Colors[theme].cardSecondary, borderColor: Colors[theme].border }]}>
          <ThemedText style={[styles.cardTitle, { color: Colors[theme].text }]}>Conducteur</ThemedText>
          <ThemedView style={styles.driverHeader}>
            <ThemedView style={[styles.driverAvatar, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
              <IconSymbol name="person" size={24} color={Colors[theme].icon} />
            </ThemedView>
            <ThemedView style={styles.driverInfo}>
              <ThemedText style={[styles.driverName, { color: Colors[theme].text }]}>{rideData.driver.name}</ThemedText>
              {rideData.driver.verified && (
                <ThemedView style={styles.verifiedBadge}>
                  <IconSymbol name="checkmark" size={12} color="#10b981" />
                  <ThemedText style={styles.verifiedText}>Vérifié</ThemedText>
                </ThemedView>
              )}
              <ThemedView style={styles.ratingContainer}>
                <IconSymbol name="star" size={16} color="#FFD700" />
                <ThemedText style={[styles.rating, { color: Colors[theme].text }]}>{rideData.driver.rating} ({rideData.driver.reviews} avis)</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        
        {/* Route Card */}
        <ThemedView style={[styles.routeCard, { backgroundColor: Colors[theme].cardSecondary, borderColor: Colors[theme].border }]}>
          <ThemedText style={[styles.cardTitle, { color: Colors[theme].text }]}>Itinéraire</ThemedText>
          <ThemedView style={styles.routeInfo}>
            {rideData.route.map((stop, index) => (
              <ThemedView key={index} style={styles.routeItem}>
                <ThemedView style={styles.routeMarker}>
                  <ThemedView style={[styles.routeDot, { backgroundColor: index === 0 ? '#28a745' : index === rideData.route.length - 1 ? '#dc3545' : Colors[theme].tint }]} />
                  {index < rideData.route.length - 1 && <ThemedView style={styles.routeLine} />}
                </ThemedView>
                <ThemedView style={styles.routeDetails}>
                  <ThemedText style={[styles.routeTime, { color: Colors[theme].text }]}>{stop.time}</ThemedText>
                  <ThemedText style={[styles.routeLocation, { color: Colors[theme].text }]}>{stop.location}</ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Amenities Card */}
        <ThemedView style={[styles.amenitiesCard, { backgroundColor: Colors[theme].cardSecondary, borderColor: Colors[theme].border }]}>
          <ThemedText style={[styles.cardTitle, { color: Colors[theme].text }]}>Équipements</ThemedText>
          <ThemedView style={styles.amenitiesList}>
            {rideData.amenities.map((amenity, index) => (
              <ThemedView key={index} style={[styles.amenityItem, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
                <IconSymbol name="checkmark" size={16} color={Colors[theme].tint} />
                <ThemedText style={[styles.amenityText, { color: Colors[theme].text }]}>{amenity}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
        
        {/* Vehicle Card */}
        <ThemedView style={[styles.detailsCard, { backgroundColor: Colors[theme].cardSecondary, borderColor: Colors[theme].border }]}>
          <ThemedText style={[styles.cardTitle, { color: Colors[theme].text }]}>Véhicule</ThemedText>
          <ThemedView style={styles.carInfo}>
            <ThemedView style={[styles.carImage, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
              <IconSymbol name="car" size={32} color={Colors[theme].icon} />
            </ThemedView>
            <ThemedView style={styles.carDetails}>
              <ThemedText style={[styles.carModel, { color: Colors[theme].text }]}>{rideData.car.year} {rideData.car.make} {rideData.car.model}</ThemedText>
              <ThemedText style={[styles.carDetailsText, { color: Colors[theme].text }]}>{rideData.car.color} • {rideData.car.plate}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Policies Card */}
        <ThemedView style={[styles.detailsCard, { backgroundColor: Colors[theme].cardSecondary, borderColor: Colors[theme].border }]}>
          <ThemedText style={[styles.cardTitle, { color: Colors[theme].text }]}>Règles du trajet</ThemedText>
          <ThemedView style={styles.policiesList}>
            {rideData.policies.map((policy, index) => (
              <ThemedView key={index} style={styles.policyItem}>
                <IconSymbol name="info.circle" size={20} color={Colors[theme].icon} />
                <ThemedText style={[styles.policyText, { color: Colors[theme].text }]}>{policy}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
        
        {/* Booking Section */}
        <ThemedView style={[styles.bookingSection, { backgroundColor: Colors[theme].background, borderTopColor: Colors[theme].border }]}>
          <ThemedView style={styles.bookingPrice}>
            <ThemedText style={[styles.priceText, { color: Colors[theme].text }]}>${rideData.price}</ThemedText>
            <ThemedText style={[styles.priceLabel, { color: Colors[theme].text }]}> / place</ThemedText>
          </ThemedView>
          <ThemedView style={styles.bookingActions}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: Colors[theme].tint },
                (isBooking || credits < rideData.price) && { opacity: 0.6 }
              ]}
              onPress={handleBooking}
              disabled={isBooking || credits < rideData.price}
            >
              <IconSymbol name="cart" size={20} color="white" />
              <ThemedText style={styles.primaryButtonText}>
                {isBooking ? "Réservation..." : credits < rideData.price ? "Crédits insuffisants" : "Réserver ce trajet"}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, { borderColor: Colors[theme].border }]} onPress={handleFavorite}>
              <IconSymbol 
                name={isFavorite ? "heart.fill" : "heart"} 
                size={20} 
                color={isFavorite ? "#ef4444" : Colors[theme].tint} 
              />
              <ThemedText style={[styles.secondaryButtonText, { color: Colors[theme].text }]}>Favoris</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  overviewCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    backgroundColor: 'transparent',
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'transparent',
  },
  overviewText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  driverCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'transparent',
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  driverInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  verifiedText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  rating: {
    fontSize: 14,
    opacity: 0.7,
  },
  routeCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  routeInfo: {
    gap: 15,
    backgroundColor: 'transparent',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'transparent',
  },
  routeMarker: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: '#e5e7eb',
    marginTop: 4,
  },
  routeDetails: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  routeTime: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  routeLocation: {
    fontSize: 14,
    opacity: 0.7,
  },
  amenitiesCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: 'transparent',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    gap: 6,
  },
  amenityText: {
    fontSize: 14,
  },
  detailsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'transparent',
  },
  carImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  carDetails: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  carModel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  carDetailsText: {
    fontSize: 14,
    opacity: 0.7,
  },
  policiesList: {
    gap: 12,
    backgroundColor: 'transparent',
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'transparent',
  },
  policyText: {
    fontSize: 14,
    flex: 1,
    opacity: 0.7,
  },
  bookingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 0.5,
  },
  bookingPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'transparent',
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  priceLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 