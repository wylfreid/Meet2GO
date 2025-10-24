import { CustomDateTimePicker } from '@/components/ui/CustomDateTimePicker';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';

// Fonction utilitaire pour formater la date sans décalage UTC
const formatDateForBackend = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

import { GoogleTextInput, LocationInfo } from '@/components/GoogleTextInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createRide } from '@/store/slices/ridesSlice';
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

export default function PublishScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.rides);
  
  const [isDateTimePickerVisible, setDateTimePickerVisibility] = useState(false);
  const [rideDateTime, setRideDateTime] = useState<Date | null>(null);

  const [fromLocation, setFromLocation] = useState<LocationInfo | null>(null);
  const [toLocation, setToLocation] = useState<LocationInfo | null>(null);
  const [stops, setStops] = useState<(LocationInfo | null)[]>([]);

  const [formData, setFormData] = useState({
    seats: "",
    price: "",
    description: "",
    carMake: "",
    carModel: "",
    carYear: "",
    amenities: [] as string[],
  });

  const [acceptRules, setAcceptRules] = useState(false);
  const [skipVehicle, setSkipVehicle] = useState(false);
  const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [emptySeats, setEmptySeats] = useState('');
  const [uploadingVehiclePhoto, setUploadingVehiclePhoto] = useState(false);

  const handleAmenityChange = (amenity: string, isSelected: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: isSelected 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  // Vérifier si le formulaire est complet
  const isFormComplete = () => {
    return !!(
      fromLocation && 
      toLocation && 
      rideDateTime && 
      formData.seats && 
      formData.price && 
      acceptRules
    );
  };

  // Ajouter un stop intermédiaire
  const addStop = () => {
    if (stops.length < 3) { // Limiter à 3 stops maximum
      setStops([...stops, null as LocationInfo | null]);
    }
  };

  // Supprimer un stop
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

  // Mettre à jour un stop
  const updateStop = (index: number, location: LocationInfo | null) => {
    const newStops = [...stops];
    newStops[index] = location;
    setStops(newStops);
  };

  const handleSubmit = async () => {
    // Validation des champs obligatoires
    const missingFields = [];
    if (!fromLocation) missingFields.push('Lieu de départ');
    if (!toLocation) missingFields.push('Lieu d\'arrivée');
    if (!rideDateTime) missingFields.push('Date et heure');
    if (!formData.seats) missingFields.push('Places disponibles');
    if (!formData.price) missingFields.push('Prix par place');
    
    if (missingFields.length > 0) {
      Alert.alert('Champs manquants', `Veuillez remplir : ${missingFields.join(', ')}`);
      return;
    }

    // Validation du prix
    if (parseFloat(formData.price) <= 0) {
      Alert.alert('Erreur', 'Le prix doit être supérieur à 0');
      return;
    }

    // Validation de la date (pas de trajets dans le passé)
    const now = new Date();
    if (rideDateTime && rideDateTime <= now) {
      Alert.alert('Erreur', 'La date et l\'heure du trajet doivent être dans le futur');
      return;
    }

    // Validation des coordonnées GPS
    if (!fromLocation?.latitude || !fromLocation?.longitude || !toLocation?.latitude || !toLocation?.longitude) {
      Alert.alert('Erreur', 'Veuillez sélectionner des adresses valides avec des coordonnées GPS');
      return;
    }

    try {
      let vehiclePhotoURL = null;
      
      // Upload de la photo du véhicule si elle existe
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
      } else if (vehiclePhoto) {
        // Si c'est déjà une URL Firebase, l'utiliser directement
        vehiclePhotoURL = vehiclePhoto;
      }

      const rideData: any = {
        from: fromLocation!.address,
        to: toLocation!.address,
        fromLat: fromLocation!.latitude,
        fromLng: fromLocation!.longitude,
        toLat: toLocation!.latitude,
        toLng: toLocation!.longitude,
        stops: stops.filter(stop => stop !== null).map(stop => ({
          address: stop!.address,
          lat: stop!.latitude,
          lng: stop!.longitude
        })),
        departureDate: formatDateForBackend(rideDateTime!), // Format date locale sans UTC
        price: parseFloat(formData.price),
        seats: parseInt(formData.seats),
        description: formData.description,
        amenities: formData.amenities,
      };

      // Ajouter les champs optionnels seulement s'ils ne sont pas vides
      if (vehicleMake.trim()) {
        rideData.carMake = vehicleMake;
      }
      if (vehicleModel.trim()) {
        rideData.carModel = vehicleModel;
      }
      if (vehicleType.trim()) {
        rideData.carType = vehicleType;
      }
      if (vehicleColor.trim()) {
        rideData.carColor = vehicleColor;
      }
      if (vehicleYear.trim()) {
        rideData.carYear = parseInt(vehicleYear);
      }
      if (vehiclePlate.trim()) {
        rideData.carPlate = vehiclePlate;
      }
      
      // Ajouter la photo du véhicule si elle existe
      if (vehiclePhotoURL) {
        rideData.vehiclePhoto = vehiclePhotoURL;
      }

      console.log( "rideData", rideData);

      const result = await dispatch(createRide(rideData)).unwrap();
      
      if (result) {
        Alert.alert(
          'Trajet publié !',
          `Votre trajet de ${fromLocation.address} vers ${toLocation.address} a été publié avec succès.`,
          [
            { 
              text: 'Voir mes trajets', 
              onPress: () => router.push('/(tabs)/published') 
            },
            { text: 'OK', style: 'default' }
          ]
        );
        
        // Réinitialiser le formulaire
        setFromLocation(null);
        setToLocation(null);
        setRideDateTime(null);
        setFormData({
          seats: "",
          price: "",
          description: "",
          carMake: "",
          carModel: "",
          carYear: "",
          amenities: [],
        });
        setVehiclePhoto(null);
        setVehicleMake('');
        setVehicleModel('');
        setVehicleType('');
        setVehicleColor('');
        setVehicleYear('');
        setVehiclePlate('');
        setSkipVehicle(false);
      }
    } catch (error: any) {
      console.error('Erreur de publication:', error);
      console.log('Message d\'erreur:', error);
      
      // L'erreur est directement la chaîne de caractères du backend
      const errorMessage = typeof error === 'string' ? error : error.message || 'Erreur lors de la publication du trajet';
      
      // Gestion spécifique des erreurs
      if (errorMessage.includes('Crédits insuffisants') || errorMessage.includes('5 crédits requis')) {
        Alert.alert(
          'Crédits insuffisants',
          'Vous devez avoir au moins 5 crédits pour publier un trajet. Vous pouvez acheter des crédits dans votre portefeuille.',
          [
            { text: 'Voir mon portefeuille', onPress: () => router.push('/(tabs)/wallet') },
            { text: 'OK', style: 'default' }
          ]
        );
      } else {
        // Afficher le message d'erreur du backend
        Alert.alert('Erreur de validation', errorMessage);
      }
    }
  };

  const showDateTimePicker = () => {
    setDateTimePickerVisibility(true);
  };

  const hideDateTimePicker = () => {
    setDateTimePickerVisibility(false);
  };

  const handleConfirmDateTime = (date: Date) => {
    setRideDateTime(date);
    hideDateTimePicker();
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Publier votre trajet</ThemedText>
        </ThemedView>

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
                showCurrentLocation
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
              <IconSymbol name="location" size={20} color={Colors[colorScheme].tint} />
              <ThemedText style={styles.sectionTitle}>Détails du trajet</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.inputGroup}>
              

              {/* Date and Time */}
              <ThemedView style={[styles.section, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
                <ThemedView style={styles.sectionHeader}>
                  <IconSymbol name="calendar" size={20} color={Colors[colorScheme].tint} />
                  <ThemedText style={styles.sectionTitle}>Date et heure</ThemedText>
                </ThemedView>
                <ThemedView style={styles.inputGroup}>
                  <TouchableOpacity
                    style={[styles.input, styles.dateButton, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}
                    onPress={showDateTimePicker}
                  >
                    <ThemedText style={[styles.dateButtonText, { color: rideDateTime ? Colors[colorScheme].text : Colors[colorScheme].icon }]}>
                      {rideDateTime
                        ? rideDateTime.toLocaleString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : "Sélectionner la date et l'heure"}
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>

              <CustomDateTimePicker
                isVisible={isDateTimePickerVisible}
                onConfirm={handleConfirmDateTime}
                onCancel={hideDateTimePicker}
                date={rideDateTime || new Date()}
              />

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

          {/* Pricing & Seats */}
          <ThemedView style={[styles.section, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
            <ThemedView style={styles.sectionHeader}>
              <IconSymbol name="person.fill" size={20} color={Colors[colorScheme].tint} />
              <ThemedText style={styles.sectionTitle}>Prix et disponibilité</ThemedText>
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
            </ThemedView>
          </ThemedView>

          {/* Car Details */}
          <ThemedView style={[styles.section, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
            <ThemedView style={styles.sectionHeader}>
              <IconSymbol name="car.fill" size={20} color={Colors[colorScheme].tint} />
              <ThemedText style={styles.sectionTitle}>Détails du véhicule</ThemedText>
            </ThemedView>
            <ThemedText style={{ marginBottom: 10, color: Colors[colorScheme].text, opacity: 0.7 }}>
              Cela vous aide à obtenir plus de réservations et facilite l'identification de votre véhicule lors du départ.
            </ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <CustomCheckBox value={skipVehicle} onValueChange={setSkipVehicle} />
              <ThemedText style={{ marginLeft: 8 }}>Passer</ThemedText>
            </View>
            <TouchableOpacity onPress={handlePickVehiclePhoto} disabled={skipVehicle} style={{ marginBottom: 12 }}>
              {vehiclePhoto ? (
                <View style={{ position: 'relative' }}>
                  <Image source={{ uri: vehiclePhoto }} style={{ width: '100%', height: 120, borderRadius: 10 }} />
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
                  <IconSymbol name="car" size={40} color={Colors[colorScheme].icon} />
                  <ThemedText style={{ color: Colors[colorScheme].icon }}>Ajouter une photo</ThemedText>
                </View>
              )}
            </TouchableOpacity>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: Colors[colorScheme].card, color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border, marginBottom: 10, padding: 16 }
              ]}
              placeholder="Marque (ex: Ford)"
              placeholderTextColor={Colors[colorScheme].icon}
              value={vehicleMake}
              onChangeText={setVehicleMake}
              editable={!skipVehicle}
            />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: Colors[colorScheme].card, color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border, marginBottom: 10, padding: 16 }
              ]}
              placeholder="Modèle (ex: Focus)"
              placeholderTextColor={Colors[colorScheme].icon}
              value={vehicleModel}
              onChangeText={setVehicleModel}
              editable={!skipVehicle}
            />
            <ThemedView style={[{ borderWidth: 1, borderColor: Colors[colorScheme].border, borderRadius: 10, paddingHorizontal: 10, marginBottom: 10, backgroundColor: Colors[colorScheme].card }]}>
            <Picker
              selectedValue={vehicleType}
              onValueChange={setVehicleType}
              enabled={!skipVehicle}
              style={[
                {
                  backgroundColor: Colors[colorScheme].card,
                  color: Colors[colorScheme].text,
                  
                },
              ]}
            >
              
              <Picker.Item label="Type" value="" />
              <Picker.Item label="Sedan" value="sedan" />
              <Picker.Item label="SUV" value="suv" />
              <Picker.Item label="Hatchback" value="hatchback" />
              <Picker.Item label="Van" value="van" />
              <Picker.Item label="Autre" value="other" />
            </Picker>
            </ThemedView>

            <ThemedView style={[{ borderWidth: 1, borderColor: Colors[colorScheme].border, borderRadius: 10, paddingHorizontal: 10, marginBottom: 10, backgroundColor: Colors[colorScheme].card }]}>
            <Picker
              selectedValue={vehicleColor}
              onValueChange={setVehicleColor}
              enabled={!skipVehicle}
              style={
                {
                  backgroundColor: Colors[colorScheme].card,
                  color: Colors[colorScheme].text,
                }
              }
            >
              <Picker.Item label="Couleur" value="" />
              <Picker.Item label="Noir" value="black" />
              <Picker.Item label="Blanc" value="white" />
              <Picker.Item label="Gris" value="gray" />
              <Picker.Item label="Bleu" value="blue" />
              <Picker.Item label="Rouge" value="red" />
              <Picker.Item label="Autre" value="other" />
            </Picker>
            </ThemedView>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: Colors[colorScheme].card, color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border, marginBottom: 10, padding: 16 }
              ]}
              placeholder="YYYY"
              placeholderTextColor={Colors[colorScheme].icon}
              value={vehicleYear}
              onChangeText={setVehicleYear}
              editable={!skipVehicle}
              keyboardType="numeric"
            />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: Colors[colorScheme].card, color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border, marginBottom: 10, padding: 16 }
              ]}
              placeholder="POP 123"
              placeholderTextColor={Colors[colorScheme].icon}
              value={vehiclePlate}
              onChangeText={setVehiclePlate}
              editable={!skipVehicle}
            />
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

          {/* Rules when posting a trip */}
          <View style={{ marginVertical: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <CustomCheckBox value={acceptRules} onValueChange={setAcceptRules} />
              <ThemedText style={{ marginLeft: 8, flex: 1 }}>
                J'accepte ces règles, à la <ThemedText style={{ textDecorationLine: 'underline' }}>Politique de résiliation du trajet</ThemedText>, aux <ThemedText style={{ textDecorationLine: 'underline' }}>Conditions d'utilisation</ThemedText> et à la <ThemedText style={{ textDecorationLine: 'underline' }}>Politique de confidentialité</ThemedText>, et <ThemedText style={{ fontWeight: 'bold' }}>je comprends que mon compte pourrait être suspendu si je viole les règles</ThemedText>
              </ThemedText>
            </View>
            <ThemedView style={[styles.costInfo, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
              <IconSymbol name="info.circle" size={16} color={Colors[colorScheme].tint} />
              <ThemedText style={[styles.costText, { color: Colors[colorScheme].text }]}>
                Coût de publication : 5 crédits
              </ThemedText>
            </ThemedView>
          </View>

        </ThemedView>
      </ScrollView>

      {/* Bouton principal en bas */}
      <TouchableOpacity
        style={[
          styles.submitButton, 
          { 
            backgroundColor: !isFormComplete() ? Colors[colorScheme].icon : Colors[colorScheme].tint,
            opacity: !isFormComplete() ? 0.5 : 1
          }
        ]}
        onPress={handleSubmit}
        disabled={loading || uploadingVehiclePhoto || !isFormComplete()}
      >
        <ThemedText style={[
          styles.submitButtonText,
          { color: !isFormComplete() ? Colors[colorScheme].text : 'white' }
        ]}>
          {loading || uploadingVehiclePhoto ? 'Publication...' : !isFormComplete() ? 'Compléter le formulaire' : 'Publier le trajet'}
        </ThemedText>
      </TouchableOpacity>
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
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
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
  dateButton: {
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
  },
  textarea: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectContainer: {
    borderRadius: 10,
    borderWidth: 1,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  selectText: {
    fontSize: 16,
  },
  seatsDropdown: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  seatOption: {
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  seatOptionText: {
    fontSize: 16,
  },
  amenitiesContainer: {
    gap: 12,
    backgroundColor: 'transparent',
  },
  amenityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  amenityText: {
    fontSize: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  seatText: {
    fontSize: 16,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  costInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 0.5,
    gap: 8,
  },
  costText: {
    fontSize: 14,
    opacity: 0.8,
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
}); 