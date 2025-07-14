import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TermsScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  const termsSections = [
    {
      id: 'general',
      title: 'Conditions générales',
      content: `1. ACCEPTATION DES CONDITIONS

En utilisant l'application Meet2Go, vous acceptez d'être lié par ces conditions générales d'utilisation.

2. DESCRIPTION DU SERVICE

Meet2Go est une plateforme de covoiturage qui met en relation conducteurs et passagers pour des trajets partagés.

3. UTILISATION DU SERVICE

Vous vous engagez à utiliser le service de manière responsable et en respectant les lois en vigueur.`,
    },
    {
      id: 'user-obligations',
      title: 'Obligations des utilisateurs',
      content: `1. INFORMATIONS EXACTES

Vous devez fournir des informations exactes et à jour lors de votre inscription et de l'utilisation du service.

2. COMPORTEMENT RESPONSABLE

Vous vous engagez à adopter un comportement respectueux envers les autres utilisateurs.

3. RESPECT DES LOIS

Vous devez respecter toutes les lois applicables lors de l'utilisation du service.`,
    },
    {
      id: 'payments',
      title: 'Paiements et facturation',
      content: `1. TARIFICATION

Les prix des trajets sont fixés par les conducteurs et peuvent inclure des frais de service.

2. PAIEMENTS

Les paiements sont traités de manière sécurisée via notre système de paiement.

3. REMBOURSEMENTS

Les conditions de remboursement sont définies dans notre politique de remboursement.`,
    },
    {
      id: 'liability',
      title: 'Responsabilité',
      content: `1. LIMITATION DE RESPONSABILITÉ

Meet2Go agit uniquement comme intermédiaire et ne peut être tenu responsable des actes des utilisateurs.

2. ASSURANCE

Il est de la responsabilité des conducteurs de s'assurer que leur véhicule est correctement assuré.

3. RÉSOLUTION DE CONFLITS

En cas de litige, nous nous efforçons de faciliter la résolution entre les parties.`,
    },
    {
      id: 'privacy',
      title: 'Confidentialité',
      content: `1. COLLECTE DE DONNÉES

Nous collectons uniquement les données nécessaires au fonctionnement du service.

2. UTILISATION DES DONNÉES

Vos données sont utilisées exclusivement pour fournir le service Meet2Go.

3. PROTECTION DES DONNÉES

Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données.`,
    },
    {
      id: 'termination',
      title: 'Résiliation',
      content: `1. RÉSILIATION PAR L'UTILISATEUR

Vous pouvez résilier votre compte à tout moment via les paramètres de votre profil.

2. RÉSILIATION PAR MEET2GO

Nous pouvons suspendre ou résilier votre compte en cas de violation des conditions.

3. EFFETS DE LA RÉSILIATION

La résiliation entraîne la suppression de vos données conformément à notre politique de confidentialité.`,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>
          Termes et conditions
        </ThemedText>
        <ThemedView style={{ width: 24 }} />
      </ThemedView>

      <ScrollView style={styles.content}>
        {/* Introduction */}
        <ThemedView style={styles.section}>
          <ThemedView style={[styles.introCard, { backgroundColor: Colors[colorScheme].cardSecondary }]}>
            <IconSymbol name="doc.text.fill" size={24} color={Colors[colorScheme].tint} />
            <ThemedView style={[styles.introContent, { backgroundColor: Colors[colorScheme].card }]}>
              <ThemedText style={[styles.introTitle, { color: Colors[colorScheme].text }]}>
                Conditions d'utilisation
              </ThemedText>
              <ThemedText style={[styles.introText, { color: Colors[colorScheme].text }]}>
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Terms Sections */}
        {termsSections.map((section) => (
          <ThemedView key={section.id} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
              {section.title}
            </ThemedText>
            <ThemedView style={[styles.termsCard, { backgroundColor: Colors[colorScheme].cardSecondary }]}>
              <ThemedText style={[styles.termsContent, { color: Colors[colorScheme].text }]}>
                {section.content}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        ))}

        {/* Contact */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
            Questions ?
          </ThemedText>
          
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: Colors[colorScheme].cardSecondary }]}
            onPress={() => router.push('/settings/contact')}
          >
            <ThemedView style={[styles.contactIcon, { backgroundColor: Colors[colorScheme].tint }]}>
              <IconSymbol name="message" size={24} color="white" />
            </ThemedView>
            <ThemedView style={[styles.contactContent, { backgroundColor: Colors[colorScheme].card }]}>
              <ThemedText style={[styles.contactTitle, { color: Colors[colorScheme].text }]}>
                Nous contacter
              </ThemedText>
              <ThemedText style={[styles.contactDescription, { color: Colors[colorScheme].text }]}>
                Si vous avez des questions sur ces conditions
              </ThemedText>
            </ThemedView>
            <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme].icon} />
          </TouchableOpacity>
        </ThemedView>

        {/* Legal Notice */}
        <ThemedView style={styles.section}>
          <ThemedView style={[styles.legalCard, { backgroundColor: Colors[colorScheme].cardSecondary }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={24} color={Colors[colorScheme].tint} />
            <ThemedView style={[styles.legalContent, { backgroundColor: Colors[colorScheme].card }]}>
              <ThemedText style={[styles.legalTitle, { color: Colors[colorScheme].text }]}>
                Avis légal
              </ThemedText>
              <ThemedText style={[styles.legalText, { color: Colors[colorScheme].text }]}>
                Ces conditions constituent un contrat légal entre vous et Meet2Go. En utilisant notre service, vous acceptez d'être lié par ces conditions.
              </ThemedText>
            </ThemedView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  introCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  introContent: {
    flex: 1,
    marginLeft: 16,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  termsCard: {
    padding: 16,
    borderRadius: 12,
  },
  termsContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
  },
  legalCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  legalContent: {
    flex: 1,
    marginLeft: 16,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  legalText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 