import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getRideById } from '@/store/slices/ridesSlice';
import { RootState, AppDispatch } from '@/store';

// Fonction utilitaire pour gérer l'affichage de l'avatar
const getDriverAvatar = (driver: any) => {
  if (driver?.avatar) {
    return { uri: driver.avatar };
  }
  return require('@/assets/images/default-avatar.png');
};

export default function DriverRideDetailsScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const dispatch = useDispatch<AppDispatch>();
  const { currentRide, loading, error } = useSelector((state: RootState) => state.rides);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getRideById(id as string));
    }
  }, [id, dispatch]);

  const handleCancelRide = async () => {
    if (!currentRide) return;

    Alert.alert(
      "Annuler le trajet",
      "Êtes-vous sûr de vouloir annuler ce trajet ? Cette action ne peut pas être annulée.",
      [
        { text: "Non", style: "cancel" },
        { 
          text: "Oui, annuler", 
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);
            try {
              // TODO: Implémenter l'annulation du trajet
              Alert.alert("Trajet annulé", "Votre trajet a été annulé avec succès.");
            } catch (error: any) {
              Alert.alert("Erreur", error || "Erreur lors de l'annulation");
            } finally {
              setIsCancelling(false);
            }
          }
        }
      ]
    );
  };

  const handleEditRide = () => {
    if (!currentRide) return;

    const bookedSeats = currentRide.totalSeats - currentRide.availableSeats;
    const hasReservations = bookedSeats > 0;

    if (hasReservations) {
      // Si il y a des réservations, on limite les modifications
      Alert.alert(
        "Modification limitée",
        "Ce trajet a des réservations. Vous pouvez uniquement modifier :\n\n• La description\n• Les équipements\n• Les informations du véhicule\n\nLes modifications de l'itinéraire, de la date/heure et du prix ne sont pas autorisées pour éviter de perturber les passagers.",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Modifier les détails", 
            onPress: () => {
              router.push(`/ride/edit-limited/${currentRide.id}`);
            }
          }
        ]
      );
    } else {
      // Si pas de réservations, modification complète autorisée
      Alert.alert(
        "Modification complète",
        "Ce trajet n'a pas de réservations. Vous pouvez modifier tous les détails du trajet.",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Modifier le trajet", 
            onPress: () => {
              router.push(`/ride/edit/${currentRide.id}`);
            }
          }
        ]
      );
    }
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

  const bookedSeats = currentRide.totalSeats - currentRide.availableSeats;
  const totalEarnings = bookedSeats * currentRide.pricePerSeat;

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Stack.Screen 
        options={{ 
          title: `${currentRide.from?.address || currentRide.from} → ${currentRide.to?.address || currentRide.to}`,
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
              <ThemedText style={[styles.overviewText, { color: Colors[theme].text }]}>{currentRide.pricePerSeat} FCFA / place</ThemedText>
            </ThemedView>
            <ThemedView style={styles.overviewItem}>
              <IconSymbol name="person.3" size={24} color={Colors[theme].tint} />
              <ThemedText style={[styles.overviewText, { color: Colors[theme].text }]}>{currentRide.availableSeats} places</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Earnings Card */}
        <ThemedView style={[styles.earningsCard, { backgroundColor: Colors[theme].cardSecondary, borderColor: Colors[theme].border }]}>
          <ThemedText style={[styles.cardTitle, { color: Colors[theme].text }]}>Gains</ThemedText>
          <ThemedView style={styles.earningsGrid}>
            <ThemedView style={styles.earningsItem}>
              <IconSymbol name="person.3" size={20} color={Colors[theme].tint} />
              <ThemedText style={[styles.earningsLabel, { color: Colors[theme].text }]}>Places réservées</ThemedText>
              <ThemedText style={[styles.earningsValue, { color: Colors[theme].tint }]}>{bookedSeats}/{currentRide.totalSeats}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.earningsItem}>
              <IconSymbol name="dollarsign.circle" size={20} color={Colors[theme].tint} />
              <ThemedText style={[styles.earningsLabel, { color: Colors[theme].text }]}>Gains totaux</ThemedText>
              <ThemedText style={[styles.earningsValue, { color: Colors[theme].tint }]}>{totalEarnings} FCFA</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.progressBar}>
            <ThemedView 
              style={[
                styles.progressFill, 
                { 
                  width: `${(bookedSeats / currentRide.totalSeats) * 100}%`,
                  backgroundColor: Colors[theme].tint 
                }
              ]} 
            />
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
                <ThemedText style={[styles.routeLocation, { color: Colors[theme].text }]}>{currentRide.from?.address || currentRide.from}</ThemedText>
              </ThemedView>
            </ThemedView>
            
            {/* Stops intermédiaires */}
            {currentRide.stops && currentRide.stops.map((stop: any, index: number) => (
              <ThemedView key={index} style={styles.routeItem}>
                <ThemedView style={styles.routeMarker}>
                  <ThemedView style={[styles.routeDot, { backgroundColor: '#ffa500' }]} />
                  <ThemedView style={styles.routeLine} />
                </ThemedView>
                <ThemedView style={styles.routeDetails}>
                  <ThemedText style={[styles.routeTime, { color: Colors[theme].text }]}>Stop {index + 1}</ThemedText>
                  <ThemedText style={[styles.routeLocation, { color: Colors[theme].text }]}>{stop.address}</ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
            
            <ThemedView style={styles.routeItem}>
              <ThemedView style={styles.routeMarker}>
                <ThemedView style={[styles.routeDot, { backgroundColor: '#dc3545' }]} />
              </ThemedView>
              <ThemedView style={styles.routeDetails}>
                <ThemedText style={[styles.routeTime, { color: Colors[theme].text }]}>Arrivée</ThemedText>
                <ThemedText style={[styles.routeLocation, { color: Colors[theme].text }]}>{currentRide.to?.address || currentRide.to}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

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

        {/* Edit Status Card */}
        {bookedSeats > 0 && (
          <ThemedView style={[styles.editStatusCard, { backgroundColor: Colors[theme].cardSecondary, borderColor: Colors[theme].border }]}>
            <ThemedView style={styles.editStatusHeader}>
              <IconSymbol name="info.circle" size={20} color="#f59e0b" />
              <ThemedText style={[styles.editStatusTitle, { color: Colors[theme].text }]}>
                Modification limitée
              </ThemedText>
            </ThemedView>
            <ThemedText style={[styles.editStatusText, { color: Colors[theme].icon }]}>
              Ce trajet a {bookedSeats} réservation{bookedSeats > 1 ? 's' : ''}. Seules les informations non critiques peuvent être modifiées.
            </ThemedText>
          </ThemedView>
        )}

        {/* Action Buttons */}
        <ThemedView style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.editButton, 
              { 
                backgroundColor: bookedSeats > 0 ? Colors[theme].card : Colors[theme].tint,
                borderColor: Colors[theme].border 
              }
            ]}
            onPress={handleEditRide}
          >
            <IconSymbol 
              name="pencil" 
              size={20} 
              color={bookedSeats > 0 ? Colors[theme].tint : 'white'} 
            />
            <ThemedText style={[
              styles.editButtonText, 
              { color: bookedSeats > 0 ? Colors[theme].tint : 'white' }
            ]}>
              {bookedSeats > 0 ? 'Modifier détails' : 'Modifier'}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.cancelButton,
              { backgroundColor: '#ef4444' },
              isCancelling && { opacity: 0.7 }
            ]}
            onPress={handleCancelRide}
            disabled={isCancelling}
          >
            <IconSymbol name="xmark.circle" size={20} color="white" />
            <ThemedText style={styles.cancelButtonText}>
              {isCancelling ? 'Annulation...' : 'Annuler'}
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
  earningsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  earningsGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  earningsItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  earningsLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 5,
    textAlign: 'center',
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
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
  editStatusCard: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  editStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  editStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  editStatusText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 