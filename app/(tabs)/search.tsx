import { CustomDateTimePicker } from '@/components/ui/CustomDateTimePicker';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoogleTextInput, LocationInfo } from '@/components/GoogleTextInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const mockRides = [
  {
    id: 1,
    from: "Toronto",
    to: "Montreal",
    date: "Dec 28, 2024",
    time: "9:00 AM",
    price: 45,
    driver: "Sarah M.",
    rating: 4.9,
    seats: 3,
    car: "Honda Civic 2020",
    image: "/placeholder.svg?height=50&width=50",
    duration: "5h 30m",
  },
  {
    id: 2,
    from: "Toronto",
    to: "Montreal",
    date: "Dec 28, 2024",
    time: "2:00 PM",
    price: 50,
    driver: "Mike R.",
    rating: 4.8,
    seats: 2,
    car: "Toyota Camry 2019",
    image: "/placeholder.svg?height=50&width=50",
    duration: "5h 45m",
  },
  {
    id: 3,
    from: "Toronto",
    to: "Montreal",
    date: "Dec 29, 2024",
    time: "11:00 AM",
    price: 40,
    driver: "Emma L.",
    rating: 5.0,
    seats: 4,
    car: "Nissan Altima 2021",
    image: "/placeholder.svg?height=50&width=50",
    duration: "5h 20m",
  },
];

export default function SearchScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [priceRange, setPriceRange] = useState([0, 100]);
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

  const handleSearch = () => {
    if (!fromLocation || !toLocation) {
      Alert.alert('Erreur', 'Veuillez saisir les lieux de départ et d\'arrivée');
      return;
    }
    
    Alert.alert('Recherche', `Recherche de trajets de ${fromLocation.address} vers ${toLocation.address}`);
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
              style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border, paddingVertical: 15 }]}
              onPress={() => setPickerVisible(true)}
            >
              <IconSymbol name="calendar" size={20} color={Colors[colorScheme].icon} />
              <ThemedText style={[styles.input, { color: rideDate ? Colors[colorScheme].text : Colors[colorScheme].icon }]}>
                {rideDate ? rideDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date'}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.searchButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={handleSearch}
            >
              <IconSymbol name="magnifyingglass" size={20} color="white" />
              <ThemedText style={styles.searchButtonText}>Rechercher</ThemedText>
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
                Fourchette de prix: ${priceRange[0]} - ${priceRange[1]}
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
                        backgroundColor: selectedTimeFilter === filter.id ? Colors[colorScheme].tint : Colors[colorScheme].background,
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
                <TouchableOpacity style={[styles.filterOption, { backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}>
                  <ThemedText style={styles.filterOptionText}>1 place</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterOption, { backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}>
                  <ThemedText style={styles.filterOptionText}>2+ places</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterOption, { backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}>
                  <ThemedText style={styles.filterOptionText}>3+ places</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>

        {/* Results Header */}
        <ThemedView style={styles.resultsHeader}>
          <ThemedText style={styles.resultsCount}>{mockRides.length} trajets trouvés</ThemedText>
          <TouchableOpacity style={styles.sortButton}>
            <ThemedText style={styles.sortText}>Trier par prix</ThemedText>
            <IconSymbol name="arrow.up.arrow.down" size={16} color={Colors[colorScheme].icon} />
          </TouchableOpacity>
        </ThemedView>

        {/* Ride Results */}
        <ThemedView style={styles.resultsContainer}>
          {mockRides.map((ride) => (
            <Link href={`/ride/${ride.id}`} key={ride.id} asChild>
              <TouchableOpacity style={[styles.rideCard, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
                <ThemedView style={styles.rideHeader}>
                  <ThemedView style={styles.driverInfo}>
                    <ThemedView style={[styles.driverAvatar, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
                      <IconSymbol name="person.fill" size={20} color={Colors[colorScheme].icon} />
                    </ThemedView>
                    <ThemedView>
                      <ThemedText style={styles.driverName}>{ride.driver}</ThemedText>
                      <ThemedView style={styles.ratingContainer}>
                        <IconSymbol name="star.fill" size={12} color="#FFD700" />
                        <ThemedText style={styles.rating}>{ride.rating}</ThemedText>
                      </ThemedView>
                      <ThemedText style={styles.carInfo}>{ride.car}</ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <ThemedView style={styles.priceContainer}>
                    <ThemedText style={[styles.price, { color: Colors[colorScheme].tint }]}>${ride.price}</ThemedText>
                    <ThemedText style={styles.priceLabel}>par place</ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={styles.rideDetails}>
                  <ThemedView style={styles.routeInfo}>
                    <IconSymbol name="location" size={16} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.routeText}>{ride.from} → {ride.to}</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.routeInfo}>
                    <IconSymbol name="clock" size={16} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.routeText}>
                      {ride.time} • {ride.duration}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.routeInfo}>
                    <IconSymbol name="person.fill" size={16} color={Colors[colorScheme].icon} />
                    <ThemedText style={styles.routeText}>{ride.seats} places disponibles</ThemedText>
                  </ThemedView>
                </ThemedView>

                <TouchableOpacity style={[styles.viewButton, { backgroundColor: Colors[colorScheme].tint }]}>
                  <ThemedText style={styles.viewButtonText}>Voir les détails</ThemedText>
                </TouchableOpacity>
              </TouchableOpacity>
            </Link>
          ))}
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
  resultsCount: {
    fontSize: 16,
    opacity: 0.7,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sortText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultsContainer: {
    padding: 20,
    paddingTop: 0,
    gap: 15,
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
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
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
  carInfo: {
    fontSize: 12,
    opacity: 0.6,
  },
  priceContainer: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  price: {
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
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'transparent',
  },
  routeText: {
    fontSize: 14,
    opacity: 0.7,
  },
  viewButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 