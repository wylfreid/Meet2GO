import { CustomDateTimePicker } from '@/components/ui/CustomDateTimePicker';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { GoogleTextInput, LocationInfo } from '@/components/GoogleTextInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { searchRides } from '@/store/slices/ridesSlice';
import { RootState, AppDispatch } from '@/store';
import { formatFullDate, formatTime } from '@/utils/dateUtils';

export default function SearchScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const dispatch = useDispatch<AppDispatch>();
  const { rides = [], loading, error } = useSelector((state: RootState) => state.rides);
  
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("price");
  const [showFilters, setShowFilters] = useState(false);
  const [fromLocation, setFromLocation] = useState<LocationInfo | null>(null);
  const [toLocation, setToLocation] = useState<LocationInfo | null>(null);
  const [rideDate, setRideDate] = useState<Date | null>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string | null>(null);

  const timeFilters = [
    { id: 'morning', label: 'Matin (6h-12h)' },
    { id: 'afternoon', label: 'Après-midi (12h-18h)' },
    { id: 'evening', label: 'Soirée (18h-24h)' },
  ];

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

      if (selectedTimeFilter) {
        searchParams.timeFilter = selectedTimeFilter;
      }

      if (priceRange[1] < 100) {
        searchParams.maxPrice = priceRange[1];
      }

      await dispatch(searchRides(searchParams)).unwrap();
    } catch (error: any) {
      console.error('Erreur de recherche:', error);
      Alert.alert('Erreur', error || 'Erreur lors de la recherche de trajets');
    }
  };

  const handleTimeFilterPress = (filterId: string) => {
    setSelectedTimeFilter(selectedTimeFilter === filterId ? null : filterId);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };
  
  const handleDateConfirm = (date: Date) => {
    setRideDate(date);
    setPickerVisible(false);
  };

  const formatRideDate = (dateString: string) => {
    return formatFullDate(dateString);
  };

  const formatRideTime = (timeString: string) => {
    return formatTime(timeString);
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
                {rideDate ? rideDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date'} à {rideDate ? rideDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Heure'}
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
                Fourchette de prix: {priceRange[0]} - {priceRange[1]} FCFA
              </ThemedText>
              {/* Price slider would go here */}
              
              <ThemedText style={styles.filterLabel}>Heure de départ</ThemedText>
              <ThemedView style={styles.filterOptions}>
                {timeFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: selectedTimeFilter === filter.id ? Colors[colorScheme].tint : Colors[colorScheme].card,
                        borderColor: Colors[colorScheme].border,
                      },
                      {
                        borderWidth: selectedTimeFilter === filter.id ? 1 : 0.5,
                      },
                    ]}
                    onPress={() => handleTimeFilterPress(filter.id)}
                  >
                    <ThemedText style={styles.filterOptionText}>{filter.label}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
              
              <ThemedText style={styles.filterLabel}>Places disponibles</ThemedText>
              <ThemedView style={styles.filterOptions}>
                <TouchableOpacity style={[styles.filterOption, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
                  <ThemedText style={styles.filterOptionText}>1 place</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterOption, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
                  <ThemedText style={styles.filterOptionText}>2+ places</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterOption, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
                  <ThemedText style={styles.filterOptionText}>3+ places</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>

        {/* Results Header */}
        <ThemedView style={styles.resultsHeader}>
          <ThemedText style={styles.resultsTitle}>
            {loading ? 'Recherche en cours...' : `${rides.length} trajets trouvés`}
          </ThemedText>
          
          <TouchableOpacity style={styles.sortButton}>
            <ThemedText style={[styles.sortButtonText, { color: Colors[colorScheme].tint }]}>
              Trier par {sortBy === 'price' ? 'prix' : 'heure'}
            </ThemedText>
            <IconSymbol name="arrow.up.arrow.down" size={16} color={Colors[colorScheme].tint} />
          </TouchableOpacity>
        </ThemedView>

        {/* Results */}
        <ThemedView style={styles.results}>
          {rides.length === 0 && !loading ? (
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
            rides.map((ride) => (
              <Link key={ride.id} href={`/ride/${ride.id}`} asChild>
                <TouchableOpacity style={[styles.rideCard, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
                  <ThemedView style={styles.rideHeader}>
                    <ThemedView style={styles.rideInfo}>
                      <ThemedText style={styles.rideRoute}>
                        {ride.from} → {ride.to}
                      </ThemedText>
                      <ThemedText style={[styles.rideDateTime, { color: Colors[colorScheme].icon }]}>
                        {formatRideDate(ride.date)} • {formatRideTime(ride.departureTime)}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.ridePrice}>
                      <ThemedText style={styles.priceText}>€{ride.pricePerSeat}</ThemedText>
                      <ThemedText style={[styles.priceLabel, { color: Colors[colorScheme].icon }]}>par place</ThemedText>
                    </ThemedView>
                  </ThemedView>
                  
                  <ThemedView style={styles.rideDetails}>
                    <ThemedView style={styles.driverInfo}>
                      <ThemedView style={styles.avatar}>
                        <IconSymbol name="person.fill" size={16} color={Colors[colorScheme].icon} />
                      </ThemedView>
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
                          {ride.carModel || 'Voiture'}
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
}); 