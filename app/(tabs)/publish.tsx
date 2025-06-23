import { CustomDateTimePicker } from '@/components/ui/CustomDateTimePicker';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoogleTextInput, LocationInfo } from '@/components/GoogleTextInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const amenityOptions = [
  "Climatisation", 
  "Système audio", 
  "Chargeur téléphone", 
  "WiFi", 
  "Animaux acceptés", 
  "Espace bagages"
];

export default function PublishScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [showSeatsSelector, setShowSeatsSelector] = useState(false);
  const [isDateTimePickerVisible, setDateTimePickerVisibility] = useState(false);
  const [rideDateTime, setRideDateTime] = useState<Date | null>(null);

  const [fromLocation, setFromLocation] = useState<LocationInfo | null>(null);
  const [toLocation, setToLocation] = useState<LocationInfo | null>(null);

  const [formData, setFormData] = useState({
    seats: "",
    price: "",
    description: "",
    carMake: "",
    carModel: "",
    carYear: "",
    amenities: [] as string[],
  });

  const seatOptions = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const handleAmenityChange = (amenity: string, isSelected: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: isSelected 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleSeatSelection = (seat: string) => {
    setFormData(prev => ({ ...prev, seats: seat }));
    setShowSeatsSelector(false);
  };

  const handleSubmit = () => {
    if (!fromLocation || !toLocation || !rideDateTime || !formData.seats || !formData.price) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    Alert.alert(
      'Trajet publié !',
      `Votre trajet de ${fromLocation.address} vers ${toLocation.address} a été publié avec succès.`,
      [
        { text: 'Voir mes trajets', onPress: () => console.log('Navigate to published rides') },
        { text: 'OK', style: 'default' }
      ]
    );
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
              <ThemedView style={styles.inputRow}>
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.label}>De</ThemedText>
                  <TextInput
                    style={[styles.input, { color: Colors[colorScheme].text, backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}
                    placeholder="Ville de départ"
                    placeholderTextColor={Colors[colorScheme].icon}
                    value={fromLocation?.address || ''}
                    editable={false}
                  />
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.label}>À</ThemedText>
                  <TextInput
                    style={[styles.input, { color: Colors[colorScheme].text, backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}
                    placeholder="Ville de destination"
                    placeholderTextColor={Colors[colorScheme].icon}
                    value={toLocation?.address || ''}
                    editable={false}
                  />
                </ThemedView>
              </ThemedView>

              {/* Date and Time */}
              <ThemedView style={[styles.section, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
                <ThemedView style={styles.sectionHeader}>
                  <IconSymbol name="calendar" size={20} color={Colors[colorScheme].tint} />
                  <ThemedText style={styles.sectionTitle}>Date et heure</ThemedText>
                </ThemedView>
                <ThemedView style={styles.inputGroup}>
                  <TouchableOpacity
                    style={[styles.input, styles.dateButton, { backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}
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

              <ThemedView style={[styles.inputContainer, styles.textareaContainer]}>
                <ThemedText style={styles.label}>Description (optionnel)</ThemedText>
                <TextInput
                  style={[styles.textarea, { color: Colors[colorScheme].text, backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}
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
              <ThemedView style={styles.inputRow}>
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Places disponibles</ThemedText>
                  <ThemedView style={[styles.selectContainer, { backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}>
                    <TouchableOpacity style={styles.selectButton} onPress={() => setShowSeatsSelector(!showSeatsSelector)}>
                      <ThemedText style={styles.selectText}>
                        {formData.seats || "Sélectionner"}
                      </ThemedText>
                      <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme].icon} />
                    </TouchableOpacity>
                    {showSeatsSelector && (
                      <ThemedView style={[styles.seatsDropdown, { backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}>
                        {seatOptions.map((seat) => (
                          <TouchableOpacity
                            key={seat}
                            style={styles.seatOption}
                            onPress={() => handleSeatSelection(seat)}
                          >
                            <ThemedText style={[styles.seatOptionText, { color: Colors[colorScheme].text }]}>{seat}</ThemedText>
                          </TouchableOpacity>
                        ))}
                      </ThemedView>
                    )}
                  </ThemedView>
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Prix par place ($)</ThemedText>
                  <TextInput
                    style={[styles.input, { color: Colors[colorScheme].text, backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}
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

          {/* Vehicle Information */}
          <ThemedView style={[styles.section, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
            <ThemedView style={styles.sectionHeader}>
              <IconSymbol name="car.fill" size={20} color={Colors[colorScheme].tint} />
              <ThemedText style={styles.sectionTitle}>Informations véhicule</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.inputGroup}>
              <ThemedView style={styles.inputRow}>
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Marque</ThemedText>
                  <TextInput
                    style={[styles.input, { color: Colors[colorScheme].text, backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}
                    placeholder="ex: Honda"
                    placeholderTextColor={Colors[colorScheme].icon}
                    value={formData.carMake}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, carMake: text }))}
                  />
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Modèle</ThemedText>
                  <TextInput
                    style={[styles.input, { color: Colors[colorScheme].text, backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}
                    placeholder="ex: Civic"
                    placeholderTextColor={Colors[colorScheme].icon}
                    value={formData.carModel}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, carModel: text }))}
                  />
                </ThemedView>
              </ThemedView>
              <ThemedView style={[styles.inputContainer, styles.textareaContainer]}>
                <ThemedText style={styles.label}>Année</ThemedText>
                <TextInput
                  style={[styles.input, { color: Colors[colorScheme].text, backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border }]}
                  placeholder="ex: 2020"
                  placeholderTextColor={Colors[colorScheme].icon}
                  value={formData.carYear}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, carYear: text }))}
                  keyboardType="numeric"
                />
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Amenities */}
          <ThemedView style={[styles.section, { backgroundColor: Colors[colorScheme].card, borderColor: Colors[colorScheme].border }]}>
            <ThemedView style={styles.sectionHeader}>
              <IconSymbol name="gearshape.fill" size={20} color={Colors[colorScheme].tint} />
              <ThemedText style={styles.sectionTitle}>Équipements et fonctionnalités</ThemedText>
            </ThemedView>
            <ThemedView style={styles.amenitiesContainer}>
              {amenityOptions.map((amenity) => (
                <TouchableOpacity
                  key={amenity}
                  style={[
                    styles.amenityOption,
                    { backgroundColor: Colors[colorScheme].background, borderColor: Colors[colorScheme].border },
                    formData.amenities.includes(amenity) && { backgroundColor: Colors[colorScheme].tint + '15', borderColor: Colors[colorScheme].tint }
                  ]}
                  onPress={() => handleAmenityChange(amenity, !formData.amenities.includes(amenity))}
                >
                  <ThemedView style={[styles.checkbox,  formData.amenities.includes(amenity)  && { borderColor: Colors[colorScheme].tint }, { borderColor: Colors[colorScheme].tint }]}>
                    {formData.amenities.includes(amenity) && (
                      <IconSymbol name="checkmark" size={12} color={Colors[colorScheme].tint} />
                    )}
                  </ThemedView>
                  <ThemedText style={styles.amenityText}>{amenity}</ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={handleSubmit}
          >
            <IconSymbol name="paperplane.fill" size={20} color="white" />
            <ThemedText style={styles.submitButtonText}>Publier le trajet</ThemedText>
          </TouchableOpacity>
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
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
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
}); 