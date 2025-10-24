import { CustomDateTimePicker } from '@/components/ui/CustomDateTimePicker';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Slider from '@react-native-community/slider';

import { GoogleTextInput, LocationInfo } from '@/components/GoogleTextInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { searchRides } from '@/store/slices/ridesSlice';
import { RootState, AppDispatch } from '@/store';

// Fonction utilitaire pour gérer l'affichage de l'avatar
const getDriverAvatar = (driver: any) => {
  if (driver?.avatar) {
    return { uri: driver.avatar };
  }
  return require('@/assets/images/default-avatar.png');
};

export default function SearchScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const dispatch = useDispatch<AppDispatch>();
  const { rides = [], loading, error } = useSelector((state: RootState) => state.rides);
  
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState("price");
  const [showFilters, setShowFilters] = useState(false);
  const [fromLocation, setFromLocation] = useState<LocationInfo | null>(null);
  const [toLocation, setToLocation] = useState<LocationInfo | null>(null);
  const [rideDate, setRideDate] = useState<Date | null>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [selectedSeatsFilter, setSelectedSeatsFilter] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!fromLocation || !toLocation) {
      Alert.alert('Erreur', 'Veuillez saisir les lieux de départ et d\'arrivée');
      return;
    }

    try {
      const searchParams: any = {
        from: fromLocation.address,
        to: toLocation.address,
        fromLat: fromLocation.latitude,
        fromLng: fromLocation.longitude,
        toLat: toLocation.latitude,
        toLng: toLocation.longitude,
      };

      if (rideDate) {
        searchParams.date = rideDate.toISOString().split('T')[0];
      }

      await dispatch(searchRides(searchParams)).unwrap();
    } catch (error: any) {
      console.error('Erreur de recherche:', error);
      Alert.alert('Erreur', error || 'Erreur lors de la recherche de trajets');
    }
  };

  // Filtrer les résultats selon les critères
  const filteredRides = rides.filter((ride) => {
    // Filtre par prix
    if (ride.pricePerSeat > maxPrice) {
      return false;
    }

    // Filtre par nombre de places
    if (selectedSeatsFilter && ride.availableSeats < selectedSeatsFilter) {
      return false;
    }

    return true;
  });

  // Trier les résultats filtrés
  const sortedRides = [...filteredRides].sort((a, b) => {
    if (sortBy === 'price') {
      return a.pricePerSeat - b.pricePerSeat;
    } else {
      // Trier par heure de départ
      const timeA = new Date(`2000-01-01T${a.departureTime}`);
      const timeB = new Date(`2000-01-01T${b.departureTime}`);
      return timeA.getTime() - timeB.getTime();
    }
  });

  const handleSeatsFilterPress = (seats: number) => {
    setSelectedSeatsFilter(selectedSeatsFilter === seats ? null : seats);
  };

  const handleSortPress = () => {
    setSortBy(sortBy === 'price' ? 'time' : 'price');
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };
  
  const handleDateConfirm = (date: Date) => {
    setRideDate(date);
    setPickerVisible(false);
  };

  const formatRideDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatRideTime = (timeString: string) => {
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Rechercher un trajet</ThemedText>
          
          {/* Search Form */}
          <ThemedView style={[styles.searchForm, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
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
            
            <TouchableOpacity 
              style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border, paddingVertical: 15 }]}
              onPress={() => setPickerVisible(true)}
            >
              <IconSymbol name="calendar" size={20} color={Colors[colorScheme].icon} />
              <ThemedText style={[styles.input, { color: rideDate ? Colors[colorScheme].text : Colors[colorScheme].icon }]}>
                {rideDate ? rideDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date'} et {rideDate ? rideDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Heure'}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.searchButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={handleSearch}
              disabled={loading}
            >
              <IconSymbol name="magnifyingglass" size={20} color="white" />
              <ThemedText style={styles.searchButtonText}>
                {loading ? 'Recherche...' : 'Rechercher'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Filters */}
        <ThemedView style={[styles.filtersSection, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
          <TouchableOpacity 
            style={styles.filterToggle}
            onPress={handleFilterToggle}
          >
            <ThemedText style={styles.filterTitle}>Filtres</ThemedText>
            <IconSymbol 
              name="chevron.right" 
              size={20} 
              color={Colors[colorScheme].icon}
              style={{ transform: [{ rotate: showFilters ? '90deg' : '0deg' }] }}
            />
          </TouchableOpacity>
          
          {showFilters && (
            <ThemedView style={styles.filtersContent}>
              <ThemedText style={styles.filterLabel}>
                Prix maximum: {maxPrice} FCFA
              </ThemedText>
              <ThemedView style={[styles.sliderContainer, { backgroundColor: Colors[colorScheme].card }]}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={10000}
                  value={maxPrice}
                  onSlidingComplete={(value: number) => setMaxPrice(Math.round(value))}
                  step={100}
                  minimumTrackTintColor={Colors[colorScheme].tint}
                  maximumTrackTintColor={Colors[colorScheme].border}
                  thumbTintColor={Colors[colorScheme].tint}
                />
                <ThemedView style={[styles.sliderLabels, { backgroundColor: Colors[colorScheme].card }]}>
                  <ThemedText style={[styles.sliderLabel, { color: Colors[colorScheme].icon }]}>0 FCFA</ThemedText>
                  <ThemedText style={[styles.sliderLabel, { color: Colors[colorScheme].icon }]}>10000 FCFA</ThemedText>
                </ThemedView>
              </ThemedView>
              

              
              <ThemedText style={styles.filterLabel}>Places disponibles</ThemedText>
              <ThemedView style={styles.filterOptions}>
                <TouchableOpacity 
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor: selectedSeatsFilter === 1 ? Colors[colorScheme].tint : Colors[colorScheme].card,
                      borderColor: Colors[colorScheme].border,
                    },
                    {
                      borderWidth: selectedSeatsFilter === 1 ? 1 : 0.5,
                    },
                  ]}
                  onPress={() => handleSeatsFilterPress(1)}
                >
                  <ThemedText style={[
                    styles.filterOptionText,
                    { color: selectedSeatsFilter === 1 ? 'white' : Colors[colorScheme].text }
                  ]}>1 place</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor: selectedSeatsFilter === 2 ? Colors[colorScheme].tint : Colors[colorScheme].card,
                      borderColor: Colors[colorScheme].border,
                    },
                    {
                      borderWidth: selectedSeatsFilter === 2 ? 1 : 0.5,
                    },
                  ]}
                  onPress={() => handleSeatsFilterPress(2)}
                >
                  <ThemedText style={[
                    styles.filterOptionText,
                    { color: selectedSeatsFilter === 2 ? 'white' : Colors[colorScheme].text }
                  ]}>2+ places</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor: selectedSeatsFilter === 3 ? Colors[colorScheme].tint : Colors[colorScheme].card,
                      borderColor: Colors[colorScheme].border,
                    },
                    {
                      borderWidth: selectedSeatsFilter === 3 ? 1 : 0.5,
                    },
                  ]}
                  onPress={() => handleSeatsFilterPress(3)}
                >
                  <ThemedText style={[
                    styles.filterOptionText,
                    { color: selectedSeatsFilter === 3 ? 'white' : Colors[colorScheme].text }
                  ]}>3+ places</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>

        {/* Results Header */}
        <ThemedView style={styles.resultsHeader}>
          <ThemedText style={styles.resultsTitle}>
            {loading ? 'Recherche en cours...' : `${sortedRides.length} trajets trouvés`}
          </ThemedText>
          
          <TouchableOpacity style={styles.sortButton} onPress={handleSortPress}>
            <ThemedText style={[styles.sortButtonText, { color: Colors[colorScheme].tint }]}>
              Trier par {sortBy === 'price' ? 'prix' : 'heure'}
            </ThemedText>
            <IconSymbol name="arrow.up.arrow.down" size={16} color={Colors[colorScheme].tint} />
          </TouchableOpacity>
        </ThemedView>

        {/* Results */}
        <ThemedView style={styles.results}>
          {sortedRides.length === 0 && !loading ? (
            <ThemedView style={styles.noResults}>
              <IconSymbol name="magnifyingglass" size={48} color={Colors[colorScheme].icon} />
              <ThemedText style={[styles.noResultsText, { color: Colors[colorScheme].icon }]}>
                Aucun trajet trouvé
              </ThemedText>
              <ThemedText style={[styles.noResultsSubtext, { color: Colors[colorScheme].icon }]}>
                Essayez de modifier vos critères de recherche
              </ThemedText>
            </ThemedView>
          ) : (
            sortedRides.map((ride) => (
              <Link key={ride.id} href={`/ride/${ride.id}`} asChild>
                <TouchableOpacity style={[styles.rideCard, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
                  <ThemedView style={styles.rideHeader}>
                    <ThemedView style={styles.rideInfo}>
                      <ThemedText style={styles.rideRoute}>
                        {ride.from?.address || ride.from} 
                        {ride.stops && ride.stops.length > 0 && (
                          <>
                            {ride.stops.map((stop: any, index: number) => (
                              <ThemedText key={index} style={styles.rideRoute}>
                                {' → '}{stop.address}
                              </ThemedText>
                            ))}
                            {' → '}
                          </>
                        )}
                        {ride.to?.address || ride.to}
                      </ThemedText>
                      {/* Indication si le trajet passe par la destination recherchée */}
                      {toLocation && ride.stops && ride.stops.some((stop: any) => 
                        stop.address?.toLowerCase().includes(toLocation.address.toLowerCase())
                      ) && (
                        <ThemedText style={[styles.stopIndicator, { color: Colors[colorScheme].tint }]}>
                          ⚠️ Ce trajet passe par votre destination
                        </ThemedText>
                      )}
                      <ThemedText style={[styles.rideDateTime, { color: Colors[colorScheme].icon }]}>
                        {formatRideDate(ride.date)} • {formatRideTime(ride.departureTime)}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.ridePrice}>
                      <ThemedText style={styles.priceText}>{ride.pricePerSeat} FCFA</ThemedText>
                      <ThemedText style={[styles.priceLabel, { color: Colors[colorScheme].icon }]}>par place</ThemedText>
                    </ThemedView>
                  </ThemedView>
                  
                  <ThemedView style={styles.rideDetails}>
                    <ThemedView style={styles.driverInfo}>
                      <Image 
                        source={getDriverAvatar(ride.driver)}
                        style={styles.avatar}
                      />
                      <ThemedView style={styles.driverText}>
                        <ThemedText style={styles.driverName}>{ride.driver?.name || 'Conducteur'}</ThemedText>
                        <ThemedView style={styles.ratingContainer}>
                          <IconSymbol name="star.fill" size={12} color="#FFD700" />
                          <ThemedText style={[styles.rating, { color: Colors[colorScheme].icon }]}>
                            {ride.driver?.averageRating || 'N/A'}
                          </ThemedText>
                        </ThemedView>
                      </ThemedView>
                    </ThemedView>
                    
                    <ThemedView style={styles.rideStats}>
                      <ThemedView style={styles.stat}>
                        <IconSymbol name="person.2.fill" size={14} color={Colors[colorScheme].icon} />
                        <ThemedText style={[styles.statText, { color: Colors[colorScheme].icon }]}>
                          {ride.availableSeats} place{ride.availableSeats > 1 ? 's' : ''}
                        </ThemedText>
                      </ThemedView>
                      <ThemedView style={styles.stat}>
                        <IconSymbol name="car.fill" size={14} color={Colors[colorScheme].icon} />
                        <ThemedText style={[styles.statText, { color: Colors[colorScheme].icon }]}>
                          {ride.carMake && ride.carModel ? `${ride.carMake} ${ride.carModel}` : ride.carModel || ride.carMake || 'Voiture'}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                </TouchableOpacity>
              </Link>
            ))
          )}
        </ThemedView>
      </ScrollView>

      <CustomDateTimePicker
        isVisible={isPickerVisible}
        onConfirm={handleDateConfirm}
        onCancel={() => setPickerVisible(false)}
        date={rideDate || new Date()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchForm: {
    gap: 15,
    padding: 20,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  filtersSection: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  filterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  filtersContent: {
    marginTop: 15,
    gap: 15,
    backgroundColor: 'transparent',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  sliderContainer: {
    marginBottom: 15,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderLabel: {
    fontSize: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: 'transparent',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  filterOptionText: {
    fontSize: 14,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  resultsTitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sortButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  results: {
    padding: 20,
    paddingTop: 0,
    gap: 15,
    backgroundColor: 'transparent',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noResultsSubtext: {
    fontSize: 14,
    opacity: 0.7,
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
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  rideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    backgroundColor: 'transparent',
  },
  rideRoute: {
    fontSize: 16,
    fontWeight: '600',
  },
  rideDateTime: {
    fontSize: 14,
    opacity: 0.7,
  },
  ridePrice: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  priceLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  rideDetails: {
    gap: 10,
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    backgroundColor: 'transparent',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  driverText: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  rating: {
    fontSize: 14,
    opacity: 0.7,
  },
  rideStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'transparent',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'transparent',
  },
  statText: {
    fontSize: 14,
    opacity: 0.7,
  },
  stopIndicator: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
}); 