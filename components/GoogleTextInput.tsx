import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

export interface LocationInfo {
  latitude: number;
  longitude: number;
  address: string;
}

interface GoogleTextInputProps {
  initialLocation: string | null;
  onLocationSelect: (location: LocationInfo) => void;
  placeholder?: string;
  showCurrentLocation?: boolean;
}

interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const GoogleTextInput = ({
  initialLocation,
  onLocationSelect,
  placeholder = "Où allez-vous ?",
  showCurrentLocation = false,
}: GoogleTextInputProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [searchText, setSearchText] = useState(initialLocation || "");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const insets = useSafeAreaInsets();

  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_PLACES_API_KEY;

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "L'accès à la localisation est nécessaire.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        const address = data.results[0].formatted_address;
        onLocationSelect({ latitude, longitude, address });
        setSearchText(address);
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error("Error getting current location:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const performSearch = async (text: string) => {
    if (!text || text.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&key=${GOOGLE_MAPS_API_KEY}&language=fr`
      );
      const data = await response.json();
      setSearchResults(data.predictions || []);
    } catch (error) {
      console.error("Error fetching places:", error);
      setSearchResults([]);
    }
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => performSearch(text), 300) as unknown as NodeJS.Timeout;
  };

  const handleSelectPlace = async (placeId: string, description: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,formatted_address`
      );
      const data = await response.json();

      if (data.result?.geometry?.location) {
        const location: LocationInfo = {
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng,
          address: data.result.formatted_address || description,
        };
        onLocationSelect(location);
        setSearchText(location.address);
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };
  
  const styles = getStyles(colorScheme);

  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={styles.inputContainer}
      >
        <IconSymbol name="location.fill" size={20} color={Colors[colorScheme].icon} />
        <ThemedText style={styles.inputText} numberOfLines={1}>
          {searchText || placeholder}
        </ThemedText>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { paddingTop: 10 }]}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={Colors[colorScheme].text} />
            </TouchableOpacity>
            <View style={styles.searchBar}>
              <TextInput
                style={styles.modalInput}
                placeholder="Rechercher un lieu..."
                placeholderTextColor={Colors[colorScheme].icon}
                value={searchText}
                onChangeText={handleTextChange}
                autoFocus
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchText(""); setSearchResults([]); }} style={styles.clearButton}>
                  <Feather name="x" size={20} color={Colors[colorScheme].icon} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {showCurrentLocation && (
            <TouchableOpacity onPress={getCurrentLocation} disabled={isLoadingLocation} style={styles.currentLocationButton}>
              <View style={[styles.locationIcon, { backgroundColor: Colors[colorScheme].tint }]}>
                {isLoadingLocation ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Feather name="map-pin" size={16} color={Colors[colorScheme].background} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.currentLocationText}>
                  {isLoadingLocation ? "Recherche en cours..." : "Utiliser ma position actuelle"}
                </ThemedText>
                <ThemedText style={styles.currentLocationSubText}>
                  Activer la localisation pour une prise en charge précise
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={Colors[colorScheme].icon} />
            </TouchableOpacity>
          )}

          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectPlace(item.place_id, item.description)} style={styles.resultItem}>
                <ThemedText style={styles.resultMainText}>{item.structured_formatting.main_text}</ThemedText>
                <ThemedText style={styles.resultSecondaryText}>{item.structured_formatting.secondary_text}</ThemedText>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={{ padding: 16 }}>
                <ThemedText style={styles.emptyResultText}>
                  {!searchText || searchText.length < 2 ? "Commencez à taper pour rechercher" : "Aucun résultat"}
                </ThemedText>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const getStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors[colorScheme].card,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        gap: 10,
        borderWidth: 0.5,
        borderColor: Colors[colorScheme].border
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        color: Colors[colorScheme].text,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors[colorScheme].background
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors[colorScheme].border
    },
    backButton: {
        marginRight: 12
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors[colorScheme].card,
        borderRadius: 8
    },
    modalInput: {
        flex: 1,
        padding: 15,
        color: Colors[colorScheme].text,
        fontSize: 16
    },
    clearButton: {
        padding: 4
    },
    currentLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        padding: 12,
        borderRadius: 10,
        backgroundColor: Colors[colorScheme].card,
        borderWidth: 0.5,
        borderColor: Colors[colorScheme].border
    },
    locationIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors[colorScheme].text,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    currentLocationText: {
        fontSize: 16,
        fontWeight: '600'
    },
    currentLocationSubText: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 2
    },
    resultItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors[colorScheme].border
    },
    resultMainText: {
        fontSize: 16
    },
    resultSecondaryText: {
        fontSize: 14,
        color: Colors[colorScheme].icon,
        marginTop: 2
    },
    emptyResultText: {
        textAlign: 'center',
        color: Colors[colorScheme].icon
    }
}); 