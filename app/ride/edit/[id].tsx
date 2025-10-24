import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

import { GoogleTextInput, LocationInfo } from '@/components/GoogleTextInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getRideById, updateRide } from '@/store/slices/ridesSlice';
import { RootState, AppDispatch } from '@/store';
import { uploadProfileImageAsync } from '@/services/firebase';

const amenityOptions = [
  "Climatisation", 
  "Système audio", 
  "Chargeur téléphone", 
  "WiFi", 
  "Animaux acceptés", 
  "Espace bagages"
];

type CustomCheckBoxProps = { value: boolean; onValueChange: (val: boolean) => void };

function CustomCheckBox({ value, onValueChange }: CustomCheckBoxProps) {
  return (
    <TouchableOpacity onPress={() => onValueChange(!value)}>
      <View style={{
        width: 24, height: 24, borderWidth: 2, borderColor: '#888', borderRadius: 4,
        backgroundColor: value ? '#007AFF' : '#fff', alignItems: 'center', justifyContent: 'center'
      }}>
        {value && <View style={{ width: 12, height: 12, backgroundColor: '#fff', borderRadius: 2 }} />}
      </View>
    </TouchableOpacity>
  );
}

export default function EditRideScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const dispatch = useDispatch<AppDispatch>();
  const { currentRide, loading, error } = useSelector((state: RootState) => state.rides);
  const [isSaving, setIsSaving] = useState(false);

  // États du formulaire
  const [fromLocation, setFromLocation] = useState<LocationInfo | null>(null);
  const [toLocation, setToLocation] = useState<LocationInfo | null>(null);
  const [stops, setStops] = useState<(LocationInfo | null)[]>([]);
  const [rideDateTime, setRideDateTime] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    seats: "",
    price: "",
    description: "",
    carMake: "",
    carModel: "",
    carYear: "",
    amenities: [] as string[],
  });
  const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);
  const [uploadingVehiclePhoto, setUploadingVehiclePhoto] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getRideById(id as string));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentRide) {
      // Initialiser les données du formulaire avec les données actuelles
      setFromLocation({
        address: currentRide.from?.address || currentRide.from,
        latitude: currentRide.fromLat,
        longitude: currentRide.fromLng,
      });
      setToLocation({
        address: currentRide.to?.address || currentRide.to,
        latitude: currentRide.toLat,
        longitude: currentRide.toLng,
      });
      setStops(currentRide.stops?.map((stop: any) => ({
        address: stop.address,
        latitude: stop.lat,
        longitude: stop.lng,
      })) || []);
      setRideDateTime(new Date(currentRide.departureDate));
      setFormData({
        seats: currentRide.totalSeats.toString(),
        price: currentRide.pricePerSeat.toString(),
        description: currentRide.description || "",
        carMake: currentRide.carMake || "",
        carModel: currentRide.carModel || "",
        carYear: currentRide.carYear?.toString() || "",
        amenities: currentRide.amenities || [],
      });
      setVehiclePhoto(currentRide.vehiclePhoto || null);
    }
  }, [currentRide]);

  const handleAmenityChange = (amenity: string, isSelected: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: isSelected 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const addStop = () => {
    if (stops.length < 3) {
      setStops([...stops, null]);
    }
  };

  const removeStop = (index: number) => {
    Alert.alert(
      'Supprimer le stop',
      'Êtes-vous sûr de vouloir supprimer ce stop ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => setStops(stops.filter((_, i) => i !== index))
        }
      ]
    );
  };

  const updateStop = (index: number, location: LocationInfo | null) => {
    const newStops = [...stops];
    newStops[index] = location;
    setStops(newStops);
  };

  const handlePickVehiclePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        // Stocker l'image sélectionnée localement (pas d'upload immédiat)
        setVehiclePhoto(image.uri);
      }
    } catch (error) {
      console.error('Erreur sélection image véhicule:', error);
      Alert.alert('Erreur', "Impossible de sélectionner l'image");
    }
  };

  const handleSave = async () => {
    if (!fromLocation || !toLocation || !rideDateTime) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSaving(true);
    
    try {
      let vehiclePhotoURL = vehiclePhoto;
      
      // Upload de la photo du véhicule si elle existe et n'est pas déjà une URL Firebase
      if (vehiclePhoto && !vehiclePhoto.startsWith('http')) {
        setUploadingVehiclePhoto(true);
        try {
          console.log('🚗 Upload de la photo du véhicule vers Firebase...');
          
          // Générer un ID unique pour la photo du véhicule
          const vehiclePhotoId = `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Upload vers Firebase Storage
          vehiclePhotoURL = await uploadProfileImageAsync(vehiclePhoto, vehiclePhotoId);
          console.log('✅ Upload Firebase réussi, URL:', vehiclePhotoURL);
        } catch (err) {
          console.error('Erreur upload photo véhicule:', err);
          Alert.alert('Erreur', 'Impossible d\'uploader la photo du véhicule.\n' + (err as Error).message);
          setUploadingVehiclePhoto(false);
          return;
        } finally {
          setUploadingVehiclePhoto(false);
        }
      }

      const updateData = {
        id: currentRide!.id,
        payload: {
          from: fromLocation.address,
          to: toLocation.address,
          fromLat: fromLocation.latitude,
          fromLng: fromLocation.longitude,
          toLat: toLocation.latitude,
          toLng: toLocation.longitude,
          stops: stops.filter((stop): stop is LocationInfo => stop !== null).map(stop => ({
            address: stop.address,
            lat: stop.latitude,
            lng: stop.longitude
          })),
          departureDate: rideDateTime.toISOString(),
          price: parseFloat(formData.price),
          seats: parseInt(formData.seats),
          description: formData.description,
          amenities: formData.amenities,
          carMake: formData.carMake,
          carModel: formData.carModel,
          carYear: formData.carYear ? parseInt(formData.carYear) : undefined,
          vehiclePhoto: vehiclePhotoURL,
        }
      };

      await dispatch(updateRide(updateData)).unwrap();
      
      Alert.alert(
        'Trajet modifié !',
        'Votre trajet a été modifié avec succès.',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error || 'Erreur lors de la modification du trajet');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={[styles.loadingText, { color: Colors[colorScheme].text }]}>
            Chargement...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error || !currentRide) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
        <ThemedView style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#ef4444" />
          <ThemedText style={[styles.errorText, { color: Colors[colorScheme].text }]}>
            {error || "Trajet non trouvé"}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <Stack.Screen 
        options={{ 
          title: "Modifier le trajet",
          headerShown: true,
        }} 
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.form}>
          {/* Route */}
          <ThemedView style={[styles.section, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
            <ThemedView style={styles.sectionHeader}>
              <IconSymbol name="map" size={20} color={Colors[colorScheme].tint} />
              <ThemedText style={styles.sectionTitle}>Itinéraire</ThemedText>
            </ThemedView>
            <ThemedView style={styles.inputGroup}>
              <GoogleTextInput
                initialLocation={fromLocation?.address || null}
                onLocationSelect={(loc) => setFromLocation(loc)}
                placeholder="Lieu de départ"
              />
              
              {/* Stops intermédiaires */}
              {stops.map((stop, index) => (
                <ThemedView key={index} style={[styles.stopContainer, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
                  <ThemedView style={[styles.stopInputContainer, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
                    <GoogleTextInput
                      initialLocation={stop?.address || null}
                      onLocationSelect={(loc) => updateStop(index, loc)}
                      placeholder={`Stop ${index + 1} (optionnel)`}
                    />
                  </ThemedView>
                  <TouchableOpacity
                    style={[styles.removeStopButton, { backgroundColor: Colors[colorScheme].card }]}
                    onPress={() => removeStop(index)}
                  >
                    <IconSymbol name="xmark" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </ThemedView>
              ))}
              
              {stops.length < 3 && (
                <TouchableOpacity
                  style={[styles.addStopButton, { borderColor: Colors[colorScheme].border }]}
                  onPress={addStop}
                >
                  <IconSymbol name="plus.circle" size={20} color={Colors[colorScheme].tint} />
                  <ThemedText style={[styles.addStopText, { color: Colors[colorScheme].tint }]}>
                    Ajouter un stop
                  </ThemedText>
                </TouchableOpacity>
              )}
              
              <GoogleTextInput
                initialLocation={toLocation?.address || null}
                onLocationSelect={(loc) => setToLocation(loc)}
                placeholder="Lieu d'arrivée"
              />
            </ThemedView>
          </ThemedView>

          {/* Trip Details */}
          <ThemedView style={[styles.section, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
            <ThemedView style={styles.sectionHeader}>
              <IconSymbol name="calendar" size={20} color={Colors[colorScheme].tint} />
              <ThemedText style={styles.sectionTitle}>Détails du trajet</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.inputGroup}>
              <ThemedView style={[styles.inputRow, { borderWidth: 0.5, borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].card }]}>
                <ThemedView style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card }]}>
                  <ThemedText style={styles.label}>Places disponibles</ThemedText>
                  <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                    {[1,2,3].map(n => (
                      <TouchableOpacity key={n} style={{
                        width: 40, height: 40, borderRadius: 20, borderWidth: 2,
                        borderColor: formData.seats == String(n) ? Colors[colorScheme].tint : Colors[colorScheme].border,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: formData.seats == String(n) ? Colors[colorScheme].tint : Colors[colorScheme].card
                      }} onPress={() => setFormData((prev) => ({ ...prev, seats: String(n) }))}>
                        <ThemedText style={{ color: formData.seats == String(n) ? '#fff' : Colors[colorScheme].text, fontWeight: 'bold', fontSize: 18 }}>{n}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ThemedView>
                <ThemedView style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card }]}>
                  <ThemedText style={styles.label}>Prix par place (FCFA)</ThemedText>
                  <TextInput
                    style={[styles.input, { color: Colors[colorScheme].text, backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}
                    placeholder="0"
                    placeholderTextColor={Colors[colorScheme].icon}
                    value={formData.price}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, price: text }))}
                    keyboardType="numeric"
                  />
                </ThemedView>
              </ThemedView>

              <ThemedView style={[styles.inputContainer, styles.textareaContainer, { borderWidth: 0.5, borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].card }]}>
                <ThemedText style={styles.label}>Description (optionnel)</ThemedText>
                <TextInput
                  style={[styles.textarea, { color: Colors[colorScheme].text, backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}
                  placeholder="Parlez de votre trajet, préférences de route, ou notes spéciales..."
                  placeholderTextColor={Colors[colorScheme].icon}
                  value={formData.description}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={3}
                />
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Vehicle Details */}
          <ThemedView style={[styles.section, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
            <ThemedView style={styles.sectionHeader}>
              <IconSymbol name="car.fill" size={20} color={Colors[colorScheme].tint} />
              <ThemedText style={styles.sectionTitle}>Détails du véhicule</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.inputGroup}>
              {/* Photo du véhicule */}
              <ThemedText style={styles.label}>Photo du véhicule</ThemedText>
              <TouchableOpacity onPress={handlePickVehiclePhoto} disabled={uploadingVehiclePhoto} style={{ marginBottom: 15 }}>
                {vehiclePhoto ? (
                  <View style={{ position: 'relative' }}>
                    <Image source={{ uri: vehiclePhoto }} style={{ width: '100%', height: 120, borderRadius: 10 }} />
                    {uploadingVehiclePhoto && (
                      <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <ActivityIndicator size="large" color="white" />
                        <ThemedText style={{ color: 'white', marginTop: 8 }}>Upload en cours...</ThemedText>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 120,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].card
                  }}>
                    {uploadingVehiclePhoto ? (
                      <>
                        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
                        <ThemedText style={{ color: Colors[colorScheme].icon, marginTop: 8 }}>Upload en cours...</ThemedText>
                      </>
                    ) : (
                      <>
                        <IconSymbol name="car" size={40} color={Colors[colorScheme].icon} />
                        <ThemedText style={{ color: Colors[colorScheme].icon }}>Ajouter une photo</ThemedText>
                      </>
                    )}
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                style={[styles.input, { backgroundColor: Colors[colorScheme].card, color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border, marginBottom: 10 }]}
                placeholder="Marque (ex: Ford)"
                placeholderTextColor={Colors[colorScheme].icon}
                value={formData.carMake}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, carMake: text }))}
              />
              <TextInput
                style={[styles.input, { backgroundColor: Colors[colorScheme].card, color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border, marginBottom: 10 }]}
                placeholder="Modèle (ex: Focus)"
                placeholderTextColor={Colors[colorScheme].icon}
                value={formData.carModel}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, carModel: text }))}
              />
              <TextInput
                style={[styles.input, { backgroundColor: Colors[colorScheme].card, color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border, marginBottom: 10 }]}
                placeholder="Année (ex: 2020)"
                placeholderTextColor={Colors[colorScheme].icon}
                value={formData.carYear}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, carYear: text }))}
                keyboardType="numeric"
              />
            </ThemedView>
          </ThemedView>

          {/* Amenities */}
          <ThemedView style={[styles.section, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
            <ThemedView style={styles.sectionHeader}>
              <IconSymbol name="star.fill" size={20} color={Colors[colorScheme].tint} />
              <ThemedText style={styles.sectionTitle}>Équipements disponibles</ThemedText>
            </ThemedView>
            
            <ThemedView style={[styles.amenitiesGrid, { padding: 10, borderRadius: 10, borderWidth: 0.5, borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].card }]}>
              {amenityOptions.map((amenity) => (
                <TouchableOpacity
                  key={amenity}
                  style={[
                    styles.amenityOption,
                    {
                      backgroundColor: formData.amenities.includes(amenity) 
                        ? Colors[colorScheme].tint 
                        : Colors[colorScheme].card,
                      borderColor: Colors[colorScheme].border,
                    },
                  ]}
                  onPress={() => handleAmenityChange(amenity, !formData.amenities.includes(amenity))}
                >
                  <ThemedText style={[
                    styles.amenityText,
                    { color: formData.amenities.includes(amenity) ? 'white' : Colors[colorScheme].text }
                  ]}>
                    {amenity}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Bouton de sauvegarde */}
      <TouchableOpacity
        style={[
          styles.saveButton, 
          { backgroundColor: Colors[colorScheme].tint },
          isSaving && { opacity: 0.7 }
        ]}
        onPress={handleSave}
        disabled={isSaving || uploadingVehiclePhoto}
      >
        <ThemedText style={styles.saveButtonText}>
          {isSaving || uploadingVehiclePhoto ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </ThemedText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 15,
    gap: 20,
    backgroundColor: 'transparent',
  },
  section: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 20,
    backgroundColor: 'transparent',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  inputContainer: {
    flex: 1,
  },
  textareaContainer: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textarea: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  amenityText: {
    fontSize: 14,
  },
  stopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  removeStopButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  addStopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  addStopText: {
    fontSize: 16,
    fontWeight: '500',
  },
  stopInputContainer: {
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    margin: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
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
}); 