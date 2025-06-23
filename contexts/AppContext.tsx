import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Transaction {
  id: string;
  type: "purchase" | "deduction" | "refund";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

interface AppSettings {
  theme: "light" | "dark";
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: "en" | "fr";
}

interface AppContextType {
  credits: number;
  transactions: Transaction[];
  settings: AppSettings;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number, description: string) => boolean;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
  theme: "light",
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
  language: "fr",
};

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "purchase",
    amount: 100,
    description: "Achat de crédits via Stripe",
    date: "2024-12-20",
    status: "completed",
  },
  {
    id: "2",
    type: "deduction",
    amount: -45,
    description: "Réservation: Toronto → Montreal",
    date: "2024-12-18",
    status: "completed",
  },
  {
    id: "3",
    type: "purchase",
    amount: 50,
    description: "Achat de crédits via Stripe",
    date: "2024-12-15",
    status: "completed",
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState(105);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem("rideshare-settings");
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  const addCredits = (amount: number) => {
    setCredits((prev) => prev + amount);
    addTransaction({
      type: "purchase",
      amount,
      description: "Achat de crédits via Stripe",
      date: new Date().toISOString().split("T")[0],
      status: "completed",
    });
  };

  const deductCredits = (amount: number, description: string): boolean => {
    if (credits >= amount) {
      setCredits((prev) => prev - amount);
      addTransaction({
        type: "deduction",
        amount: -amount,
        description,
        date: new Date().toISOString().split("T")[0],
        status: "completed",
      });
      return true;
    }
    return false;
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    try {
      await AsyncStorage.setItem("rideshare-settings", JSON.stringify(updatedSettings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        credits,
        transactions,
        settings,
        addCredits,
        deductCredits,
        addTransaction,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
} 