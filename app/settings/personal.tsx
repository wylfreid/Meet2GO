import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { AppDispatch, RootState } from '@/store';
import { updateUserProfile, getUserProfile } from '@/store/slices/userSlice';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function PersonalInfoScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading } = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
  });

  const handleSave = async () => {
    try {
      await dispatch(updateUserProfile({
        name: formData.name,
        phone: formData.phone,
      })).unwrap();
      
      await dispatch(getUserProfile()).unwrap();
      
      Alert.alert('Succès', 'Informations personnelles mises à jour');
      router.back();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour les informations');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>
          Informations personnelles
        </ThemedText>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <ThemedText style={[styles.saveButton, { color: Colors[colorScheme].tint }]}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
            Informations de base
          </ThemedText>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: Colors[colorScheme].text }]}>Nom complet</ThemedText>
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Votre nom complet"
              style={[styles.input, { 
                backgroundColor: Colors[colorScheme].cardSecondary,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].border
              }]}
              placeholderTextColor={Colors[colorScheme].text}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: Colors[colorScheme].text }]}>Téléphone</ThemedText>
            <TextInput
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Votre numéro de téléphone"
              keyboardType="phone-pad"
              style={[styles.input, { 
                backgroundColor: Colors[colorScheme].cardSecondary,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].border
              }]}
              placeholderTextColor={Colors[colorScheme].text}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: Colors[colorScheme].text }]}>Email</ThemedText>
            <TextInput
              value={formData.email}
              editable={false}
              placeholder="Votre adresse email"
              style={[styles.input, { 
                backgroundColor: Colors[colorScheme].cardSecondary,
                color: Colors[colorScheme].text,
                borderColor: Colors[colorScheme].border,
                opacity: 0.6
              }]}
              placeholderTextColor={Colors[colorScheme].text}
            />
            <ThemedText style={[styles.helperText, { color: Colors[colorScheme].text }]}>
              L'email ne peut pas être modifié depuis cette page
            </ThemedText>
          </ThemedView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  helperText: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
}); 