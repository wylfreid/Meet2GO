import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getRideById, bookRide } from '@/store/slices/ridesSlice';
import { RootState, AppDispatch } from '@/store';

export default function RideDetailsScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { credits, deductCredits } = useApp();
  const dispatch = useDispatch<AppDispatch>();
  const { currentRide, loading, error } = useSelector((state: RootState) => state.rides);
  const [isBooking, setIsBooking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getRideById(id as string));
    }
  }, [id, dispatch]);

  const handleBooking = async () => {
    if (!currentRide) return;

    if (credits < currentRide.pricePerSeat) {
      Alert.alert("Crédits insuffisants", "Vous n'avez pas assez de crédits pour cette réservation.");
      return;
    }

    setIsBooking(true);
    
    try {
      const result = await dispatch(bookRide({
        rideId: currentRide.id,
        seats: 1,
        totalPrice: currentRide.pricePerSeat
      })).unwrap();
      
      if (result) {
        const success = deductCredits(currentRide.pricePerSeat, `Réservation: ${currentRide.from} → ${currentRide.to}`);
        
        if (success) {
          Alert.alert(
            "Réservation confirmée !",
            `Votre trajet de ${currentRide.from} vers ${currentRide.to} a été réservé.`,
            [
              { text: "Voir mes réservations", onPress: () => router.push('/bookings') },
              { text: "OK", style: "default" }
            ]
          );
        } else {
          Alert.alert("Erreur", "Impossible de finaliser la réservation. Veuillez réessayer.");
        }
      }
    } catch (error: any) {
      Alert.alert("Erreur", error || "Erreur lors de la réservation");
    } finally {
      setIsBooking(false);
    }
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

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <Stack.Screen 
          options={{ 
            title: "Chargement...",
            headerShown: true,
          }} 
        />
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={[styles.loadingText, { color: Colors[theme].text }]}>
            Chargement du trajet...
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (error || !currentRide) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <Stack.Screen 
          options={{ 
            title: "Erreur",
            headerShown: true,
          }} 
        />
        <ThemedView style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#ef4444" />
          <ThemedText style={[styles.errorText, { color: Colors[theme].text }]}>
            {error || "Trajet non trouvé"}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

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

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Stack.Screen 
        options={{ 
          title: `${currentRide.from} → ${currentRide.to}`,
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
              <ThemedText style={[styles.overviewText, { color: Colors[theme].text }]}>{formatDate(currentRide.date)}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.overviewItem}>
              <IconSymbol name="clock" size={24} color={Colors[theme].tint} />
              <ThemedText style={[styles.overviewText, { color: Colors[theme].text }]}>{formatTime(currentRide.departureTime)}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.overviewItem}>
              <IconSymbol name="dollarsign.circle" size={24} color={Colors[theme].tint} />
              <ThemedText style={[styles.overviewText, { color: Colors[theme].text }]}>{currentRide.pricePerSeat}€ / place</ThemedText>
            </ThemedView>
            <ThemedView style={styles.overviewItem}>
              <IconSymbol name="person.3" size={24} color={Colors[theme].tint} />
              <ThemedText style={[styles.overviewText, { color: Colors[theme].text }]}>{currentRide.availableSeats} places</ThemedText>
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
              <ThemedText style={[styles.driverName, { color: Colors[theme].text }]}>{currentRide.driver?.name || 'Conducteur'}</ThemedText>
              {currentRide.driver?.verified && (
                <ThemedView style={styles.verifiedBadge}>
                  <IconSymbol name="checkmark" size={12} color="#10b981" />
                  <ThemedText style={styles.verifiedText}>Vérifié</ThemedText>
                </ThemedView>
              )}
              <ThemedView style={styles.ratingContainer}>
                <IconSymbol name="star" size={16} color="#FFD700" />
                <ThemedText style={[styles.rating, { color: Colors[theme].text }]}>
                  {currentRide.driver?.averageRating || 'N/A'} ({currentRide.driver?.reviews || 0} avis)
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        
        {/* Route Card */}
        <ThemedView style={[styles.routeCard, { backgroundColor: Colors[theme].cardSecondary, borderColor: Colors[theme].border }]}>
          <ThemedText style={[styles.cardTitle, { color: Colors[theme].text }]}>Itinéraire</ThemedText>
          <ThemedView style={styles.routeInfo}>
            <ThemedView style={styles.routeItem}>
              <ThemedView style={styles.routeMarker}>
                <ThemedView style={[styles.routeDot, { backgroundColor: '#28a745' }]} />
                <ThemedView style={styles.routeLine} />
              </ThemedView>
              <ThemedView style={styles.routeDetails}>
                <ThemedText style={[styles.routeTime, { color: Colors[theme].text }]}>{formatTime(currentRide.departureTime)}</ThemedText>
                <ThemedText style={[styles.routeLocation, { color: Colors[theme].text }]}>{currentRide.from}</ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.routeItem}>
              <ThemedView style={styles.routeMarker}>
                <ThemedView style={[styles.routeDot, { backgroundColor: '#dc3545' }]} />
              </ThemedView>
              <ThemedView style={styles.routeDetails}>
                <ThemedText style={[styles.routeTime, { color: Colors[theme].text }]}>Arrivée</ThemedText>
                <ThemedText style={[styles.routeLocation, { color: Colors[theme].text }]}>{currentRide.to}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Amenities Card */}
        {currentRide.amenities && currentRide.amenities.length > 0 && (
          <ThemedView style={[styles.amenitiesCard, { backgroundColor: Colors[theme].cardSecondary, borderColor: Colors[theme].border }]}>
            <ThemedText style={[styles.cardTitle, { color: Colors[theme].text }]}>Équipements</ThemedText>
            <ThemedView style={styles.amenitiesList}>
              {currentRide.amenities.map((amenity: string, index: number) => (
                <ThemedView key={index} style={[styles.amenityItem, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
                  <IconSymbol name="checkmark" size={16} color={Colors[theme].tint} />
                  <ThemedText style={[styles.amenityText, { color: Colors[theme].text }]}>{amenity}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>
        )}
        
        {/* Vehicle Card */}
        {(currentRide.carMake || currentRide.carModel) && (
          <ThemedView style={[styles.detailsCard, { backgroundColor: Colors[theme].cardSecondary, borderColor: Colors[theme].border }]}>
            <ThemedText style={[styles.cardTitle, { color: Colors[theme].text }]}>Véhicule</ThemedText>
            <ThemedView style={styles.carInfo}>
              <ThemedView style={[styles.carImage, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
                <IconSymbol name="car" size={32} color={Colors[theme].icon} />
              </ThemedView>
              <ThemedView style={styles.carDetails}>
                <ThemedText style={[styles.carModel, { color: Colors[theme].text }]}>
                  {currentRide.carYear} {currentRide.carMake} {currentRide.carModel}
                </ThemedText>
                <ThemedText style={[styles.carDetailsText, { color: Colors[theme].text }]}>
                  {currentRide.carColor || 'Couleur non spécifiée'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        {/* Description Card */}
        {currentRide.description && (
          <ThemedView style={[styles.detailsCard, { backgroundColor: Colors[theme].cardSecondary, borderColor: Colors[theme].border }]}>
            <ThemedText style={[styles.cardTitle, { color: Colors[theme].text }]}>Description</ThemedText>
            <ThemedText style={[styles.descriptionText, { color: Colors[theme].text }]}>
              {currentRide.description}
            </ThemedText>
          </ThemedView>
        )}

        {/* Action Buttons */}
        <ThemedView style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.favoriteButton, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}
            onPress={handleFavorite}
          >
            <IconSymbol 
              name={isFavorite ? "heart.fill" : "heart"} 
              size={24} 
              color={isFavorite ? "#ef4444" : Colors[theme].icon} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.bookButton,
              { backgroundColor: Colors[theme].tint },
              isBooking && { opacity: 0.7 }
            ]}
            onPress={handleBooking}
            disabled={isBooking}
          >
            <ThemedText style={styles.bookButtonText}>
              {isBooking ? 'Réservation...' : `Réserver (${currentRide.pricePerSeat}€)`}
            </ThemedText>
          </TouchableOpacity>
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
  descriptionText: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 0.5,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
  },
}); 