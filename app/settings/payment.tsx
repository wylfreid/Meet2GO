import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function PaymentScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const cardBg = colorScheme === 'dark' ? '#23242a' : '#f7f7fa';
  const cardShadow = colorScheme === 'dark' ? '#000' : '#aaa';

  const [paymentMethods] = useState([
    {
      id: '1',
      type: 'card',
      name: 'Carte Visa',
      number: '**** **** **** 1234',
      expiry: '12/25',
      isDefault: true,
      icon: 'creditcard.fill' as const,
    },
    {
      id: '2',
      type: 'card',
      name: 'Carte Mastercard',
      number: '**** **** **** 5678',
      expiry: '08/26',
      isDefault: false,
      icon: 'creditcard.fill' as const,
    },
  ]);

  const handleAddPaymentMethod = () => {
    Alert.alert('Ajouter une méthode de paiement', 'Fonctionnalité à venir');
  };

  const handleDeletePaymentMethod = (method: any) => {
    Alert.alert(
      'Supprimer',
      `Êtes-vous sûr de vouloir supprimer ${method.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive' },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>
          Méthodes de paiement
        </ThemedText>
        <ThemedView style={{ width: 24 }} />
      </ThemedView>

      <ScrollView style={styles.content}>
        {/* Payment Methods */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
            Vos cartes
          </ThemedText>
          {paymentMethods.map((method) => (
            <View
              key={method.id}
              style={[
                styles.paymentCard,
                {
                  backgroundColor: cardBg,
                  shadowColor: cardShadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.18,
                  shadowRadius: 6,
                  elevation: 4,
                },
              ]}
            >
              <View style={styles.paymentRow}>
                <View style={styles.paymentLeft}>
                  <View style={[styles.paymentIcon, { backgroundColor: Colors[colorScheme].card }]}> 
                    <IconSymbol name={method.icon} size={22} color={Colors[colorScheme].tint} />
                  </View>
                  <View style={styles.paymentInfo}>
                    <ThemedText style={[styles.paymentName, { color: Colors[colorScheme].text }]}>
                      {method.name}
                    </ThemedText>
                    <ThemedText style={[styles.paymentDetails, { color: Colors[colorScheme].text, opacity: 0.6 }]}> 
                      {method.number} • Expire {method.expiry}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.paymentRight}>
                  {method.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: Colors[colorScheme].tint }]}> 
                      <ThemedText style={styles.defaultText}>Par défaut</ThemedText>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => handleDeletePaymentMethod(method)}>
                    <ThemedText style={[styles.actionText, { color: '#dc3545', marginLeft: 12 }]}>Supprimer</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ThemedView>

        {/* Add Payment Method */}
        <ThemedView style={styles.section}>
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: cardBg,
                borderColor: Colors[colorScheme].tint,
              },
            ]}
            onPress={handleAddPaymentMethod}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus" size={20} color={Colors[colorScheme].tint} />
            <ThemedText style={[styles.addText, { color: Colors[colorScheme].tint }]}>Ajouter une carte</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Payment Info */}
        <ThemedView style={styles.section}>
          <View style={[
            styles.infoCard,
            {
              backgroundColor: cardBg,
              shadowColor: cardShadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 4,
              elevation: 2,
            },
          ]}>
            <IconSymbol name="shield" size={24} color={Colors[colorScheme].tint} />
            <View style={styles.infoContent}>
              <ThemedText style={[styles.infoTitle, { color: Colors[colorScheme].text }]}>Paiements sécurisés</ThemedText>
              <ThemedText style={[styles.infoText, { color: Colors[colorScheme].text, opacity: 0.6 }]}>Vos informations de paiement sont chiffrées et sécurisées.</ThemedText>
            </View>
          </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  paymentCard: {
    borderRadius: 14,
    marginBottom: 12,
    padding: 14,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#222',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  paymentDetails: {
    fontSize: 13,
  },
  paymentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 2,
  },
  addText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    alignItems: 'flex-start',
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 