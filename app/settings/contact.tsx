import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Linking } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GoogleTextInput } from '@/components/GoogleTextInput';

export default function ContactScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  const contactMethods = [
    {
      id: 'email',
      title: 'Email',
      description: 'support@meet2go.com',
      icon: 'envelope.fill' as const,
      action: () => Linking.openURL('mailto:support@meet2go.com'),
    },
    {
      id: 'phone',
      title: 'Téléphone',
      description: '+33 1 23 45 67 89',
      icon: 'phone.fill' as const,
      action: () => Linking.openURL('tel:+33123456789'),
    },
    {
      id: 'chat',
      title: 'Chat en ligne',
      description: 'Disponible 24h/24',
      icon: 'message.circle.fill' as const,
      action: () => Alert.alert('Chat', 'Chat en ligne - Fonctionnalité à venir'),
    },
  ];

  const contactTopics = [
    {
      id: 'technical',
      title: 'Problème technique',
      description: 'Bug, crash, problème d\'interface',
      icon: 'wrench.fill' as const,
    },
    {
      id: 'account',
      title: 'Problème de compte',
      description: 'Connexion, mot de passe, profil',
      icon: 'person.fill' as const,
    },
    {
      id: 'payment',
      title: 'Problème de paiement',
      description: 'Facturation, remboursement',
      icon: 'creditcard.fill' as const,
    },
    {
      id: 'safety',
      title: 'Problème de sécurité',
      description: 'Comportement inapproprié, harcèlement',
      icon: 'shield.fill' as const,
    },
    {
      id: 'other',
      title: 'Autre',
      description: 'Question générale ou autre problème',
      icon: 'questionmark.circle.fill' as const,
    },
  ];

  const handleSubmit = () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    Alert.alert(
      'Message envoyé',
      'Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.',
      [
        {
          text: 'OK',
          onPress: () => {
            setFormData({ subject: '', message: '' });
            router.back();
          },
        },
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
          Nous contacter
        </ThemedText>
        <ThemedView style={{ width: 24 }} />
      </ThemedView>

      <ScrollView style={styles.content}>
        {/* Contact Methods */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
            Méthodes de contact
          </ThemedText>
          
          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.contactCard, { backgroundColor: Colors[colorScheme].cardSecondary }]}
              onPress={method.action}
            >
              <ThemedView style={[styles.contactIcon, { backgroundColor: Colors[colorScheme].card }]}>
                <IconSymbol name={method.icon} size={20} color={Colors[colorScheme].tint} />
              </ThemedView>
              <ThemedView style={[styles.contactContent, { backgroundColor: Colors[colorScheme].card }]}>
                <ThemedText style={[styles.contactTitle, { color: Colors[colorScheme].text }]}>
                  {method.title}
                </ThemedText>
                <ThemedText style={[styles.contactDescription, { color: Colors[colorScheme].text }]}>
                  {method.description}
                </ThemedText>
              </ThemedView>
              <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme].icon} />
            </TouchableOpacity>
          ))}
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
  },
  form: {
    backgroundColor: 'transparent',
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
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  topicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 