import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getWalletBalance, getTransactions, addCredits } from '@/store/slices/walletSlice';
import { RootState, AppDispatch } from '@/store';

export default function WalletScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const dispatch = useDispatch<AppDispatch>();
  const { balance, transactions, loading } = useSelector((state: RootState) => state.wallet);
  const [activeTab, setActiveTab] = useState<'credits' | 'history'>('credits');

  const creditPackages = [
    { id: 1, amount: 50, price: 5000, bonus: 0 },
    { id: 2, amount: 100, price: 10000, bonus: 5 },
    { id: 3, amount: 200, price: 20000, bonus: 25 },
    { id: 4, amount: 500, price: 50000, bonus: 75 },
  ];

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      await dispatch(getWalletBalance()).unwrap();
      await dispatch(getTransactions({ page: 1, limit: 20 })).unwrap();
    } catch (error) {
      console.error('Erreur chargement portefeuille:', error);
    }
  };

  const handlePurchaseCredits = async (packageId: number) => {
    const selectedPackage = creditPackages.find(pkg => pkg.id === packageId);
    if (!selectedPackage) return;

    Alert.alert(
      'Confirmer l\'achat',
      `Voulez-vous acheter ${selectedPackage.amount} crédits pour ${selectedPackage.price}€ ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Acheter', 
          onPress: async () => {
            try {
              await dispatch(addCredits({ 
                amount: selectedPackage.amount, 
                paymentMethod: 'stripe' 
              })).unwrap();
              
              Alert.alert(
                'Succès', 
                `Vous avez acheté ${selectedPackage.amount} crédits${selectedPackage.bonus > 0 ? ` + ${selectedPackage.bonus} bonus` : ''}`
              );
            } catch (error: any) {
              Alert.alert('Erreur', error || 'Erreur lors de l\'achat de crédits');
            }
          }
        }
      ]
    );
  };

  const handleTabChange = (tab: 'credits' | 'history') => {
    setActiveTab(tab);
  };

  const getTransactionIcon = (type: 'purchase' | 'deduction' | 'refund' | 'withdrawal') => {
    switch (type) {
      case 'purchase':
        return 'cart.fill';
      case 'deduction':
        return 'arrow.down.circle.fill';
      case 'refund':
        return 'arrow.up.circle.fill';
      case 'withdrawal':
        return 'arrow.up.circle.fill';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Portefeuille</ThemedText>
          <ThemedText style={styles.subtitle}>Gérez vos crédits et consultez votre historique</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.content}>
          <ThemedView style={[styles.balanceCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
            <ThemedView style={styles.balanceHeader}>
              <ThemedText style={[styles.balanceLabel, { color: Colors[colorScheme].text }]}>Crédits disponibles</ThemedText>
              <IconSymbol name="creditcard.fill" size={24} color={Colors[colorScheme].tint} />
            </ThemedView>
            <ThemedText style={[styles.balanceAmount, { color: Colors[colorScheme].text }]}>
              {loading ? '...' : balance.toLocaleString()} C
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.tabContainer, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'credits' && { borderBottomColor: Colors[colorScheme].tint, backgroundColor: Colors[colorScheme].card }]}
              onPress={() => handleTabChange('credits')}
            >
              <ThemedText style={[styles.tabText, { color: Colors[colorScheme].text }, activeTab === 'credits' && { color: Colors[colorScheme].tint }]}>
                Acheter des crédits
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'history' && { borderBottomColor: Colors[colorScheme].tint, backgroundColor: Colors[colorScheme].card }]}
              onPress={() => handleTabChange('history')}
            >
              <ThemedText style={[styles.tabText, { color: Colors[colorScheme].text }, activeTab === 'history' && { color: Colors[colorScheme].tint }]}>
                Historique
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {activeTab === 'credits' ? (
            <ThemedView style={styles.packagesContainer}>
              {creditPackages.map((pkg) => (
                <ThemedView key={pkg.id} style={[styles.packageCard, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
                  <ThemedText style={[styles.packageAmount, { color: Colors[colorScheme].text }]}>{pkg.amount.toLocaleString()} crédits</ThemedText>
                  {pkg.bonus > 0 && <ThemedText style={styles.packageBonus}>+ {pkg.bonus} bonus</ThemedText>}
                  <TouchableOpacity 
                    style={[styles.buyButton, { backgroundColor: Colors[colorScheme].tint }]} 
                    onPress={() => handlePurchaseCredits(pkg.id)}
                    disabled={loading}
                  >
                    <IconSymbol name="cart" size={16} color="white" />
                    <ThemedText style={styles.buyButtonText}>{pkg.price.toFixed(2)} FCFA</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              ))}
            </ThemedView>
          ) : (
            <ThemedView style={styles.historyContainer}>
              {loading ? (
                <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20 }}>
                  <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
                </View>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <ThemedView key={tx.id} style={[styles.transactionItem, { backgroundColor: Colors[colorScheme].cardSecondary, borderColor: Colors[colorScheme].border }]}>
                    <ThemedView style={[styles.transactionIcon, { backgroundColor: Colors[colorScheme].card }]}>
                      <IconSymbol 
                        name={getTransactionIcon(tx.type)}
                        size={20} 
                        color={tx.amount > 0 ? '#28a745' : '#dc3545'} 
                      />
                    </ThemedView>
                    <ThemedView style={styles.transactionDetails}>
                      <ThemedText style={[styles.transactionDescription, { color: Colors[colorScheme].text }]}>{tx.description}</ThemedText>
                      <ThemedText style={[styles.transactionDate, { color: Colors[colorScheme].text }]}>{tx.date}</ThemedText>
                    </ThemedView>
                    <ThemedText style={[styles.transactionAmount, { color: tx.amount > 0 ? '#28a745' : '#dc3545' }]}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} C
                    </ThemedText>
                  </ThemedView>
                ))
              ) : (
                <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20 }}>
                  <IconSymbol name="clock.arrow.circlepath" size={48} color={Colors[colorScheme].icon} />
                  <ThemedText style={[styles.noTransactionsText, { color: Colors[colorScheme].text }]}>Aucune transaction trouvée</ThemedText>
                </View>
              )}
            </ThemedView>
          )}
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
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  content: {
    padding: 20,
    gap: 20,
    backgroundColor: 'transparent',
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 0.5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 0.5,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.6,
  },
  packagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
    backgroundColor: 'transparent',
  },
  packageCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 0.5,
  },
  packageAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  packageBonus: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 16,
    fontWeight: '500',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  historyContainer: {
    gap: 12,
    backgroundColor: 'transparent',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    opacity: 0.6,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  noTransactionsText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
}); 