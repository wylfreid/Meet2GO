import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { api, ApiResponse, User, Ride } from './axios-config';

// Fonction utilitaire pour gérer les erreurs Axios
const handleAxiosError = (error: any, defaultMessage: string): never => {
  if (axios.isAxiosError(error)) {
    let message = defaultMessage;
    
    // Si c'est une erreur de validation, construire un message détaillé
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      const validationErrors = error.response.data.errors;
      const errorMessages = validationErrors.map((err: any) => err.msg).join(', ');
      message = errorMessages;
    } else {
      // Sinon utiliser le message du backend ou le message par défaut
      message = error.response?.data?.message || defaultMessage;
    }
    
    const newError = new Error(message);
    if (error.response?.data?.errors) {
      (newError as any).errors = error.response.data.errors;
    }
    (newError as any).status = error.response?.status;
    throw newError;
  }
  throw error;
};

// API d'authentification avec Axios
export const AuthAPI = {
  register: async (data: any): Promise<ApiResponse<{ user: User; token: string }> | undefined> => {
    try {
      const response = await api.post('/auth/register', data);
      
      // Sauvegarder le token et les données utilisateur temporaires
      if (response.data.data && response.data.data.token && response.data.data.user) {
        await AsyncStorage.setItem('auth-token', response.data.data.token);
        await AsyncStorage.setItem('user-data', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de l\'inscription');
      return undefined;
    }
  },

  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }> | undefined> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Sauvegarder le token et les données utilisateur
      await AsyncStorage.setItem('auth-token', response.data.data.token);
      await AsyncStorage.setItem('user-data', JSON.stringify(response.data.data.user));
      
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Identifiants invalides');
      return undefined;
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post('/auth/logout');
      await AsyncStorage.removeItem('auth-token');
      await AsyncStorage.removeItem('user-data');
      return { ...response.data, data: null };
    } catch (error) {
      // Pour la déconnexion, on considère que c'est un succès même si le token est expiré
      await AsyncStorage.removeItem('auth-token');
      await AsyncStorage.removeItem('user-data');
      return { success: true, message: 'Déconnexion réussie', data: null };
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<User> | undefined> => {
    try {
      const response = await api.get('/users/profile');
      await AsyncStorage.setItem('user-data', JSON.stringify(response.data.data));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Token expiré, nettoyer le cache
        await AsyncStorage.removeItem('auth-token');
        await AsyncStorage.removeItem('user-data');
      }
      handleAxiosError(error, 'Erreur lors de la récupération du profil');
      return undefined;
    }
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string; user: User }> | undefined> => {
    try {
      const response = await api.post('/auth/refresh-token');
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du rafraîchissement du token');
      return undefined;
    }
  },

  forgotPassword: async (email: string): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de l\'envoi de l\'email de réinitialisation');
      return undefined;
    }
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la réinitialisation du mot de passe');
      return undefined;
    }
  },

  verifyOtp: async (email: string, otp: string): Promise<ApiResponse<{ user: User; token: string }> | undefined> => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      
      // Sauvegarder le token et les données utilisateur après vérification
      await AsyncStorage.setItem('auth-token', response.data.data.token);
      await AsyncStorage.setItem('user-data', JSON.stringify(response.data.data.user));
      
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Code de vérification invalide');
      return undefined;
    }
  },

  resendOtp: async (email: string): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du renvoi du code');
      return undefined;
    }
  },
};

export const RideAPI = {
  search: async (params: Record<string, any>): Promise<ApiResponse<{ rides: Ride[] }> | undefined> => {
    try {
      const response = await api.get('/rides/search', { params });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la recherche');
      return undefined;
    }
  },

  create: async (payload: any): Promise<ApiResponse<Ride> | undefined> => {
    try {
      const response = await api.post('/rides', payload);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la création du trajet');
      return undefined;
    }
  },

  getById: async (id: string): Promise<ApiResponse<Ride> | undefined> => {
    try {
      const response = await api.get(`/rides/${id}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Trajet non trouvé');
      return undefined;
    }
  },

  book: async (payload: any): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.post('/rides/book', payload);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la réservation');
      return undefined;
    }
  },

  getUserRides: async (): Promise<ApiResponse<{ rides: Ride[] }> | undefined> => {
    try {
      const response = await api.get('/rides/user/rides');
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du chargement de vos trajets');
      return undefined;
    }
  },

  updateRide: async (id: string, payload: any): Promise<ApiResponse<Ride> | undefined> => {
    try {
      const response = await api.put(`/rides/${id}`, payload);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la mise à jour du trajet');
      return undefined;
    }
  },

  deleteRide: async (id: string): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.delete(`/rides/${id}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la suppression du trajet');
      return undefined;
    }
  },

  cancelBooking: async (bookingId: string): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.post(`/rides/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de l\'annulation de la réservation');
      return undefined;
    }
  },
};

export const HomeAPI = {
  getFeaturedRides: async (): Promise<ApiResponse<{ rides: Ride[] }> | undefined> => {
    try {
      const response = await api.get('/rides/featured');
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du chargement des trajets');
      return undefined;
    }
  },

  getStats: async (): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du chargement des statistiques');
      return undefined;
    }
  },
};

export const BookingAPI = {
  getUserBookings: async (): Promise<ApiResponse<any[]> | undefined> => {
    try {
      const response = await api.get('/bookings');
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du chargement des réservations');
      return undefined;
    }
  },

  getBookingById: async (id: string): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Réservation non trouvée');
      return undefined;
    }
  },

  cancelBooking: async (id: string): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.post(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de l\'annulation');
      return undefined;
    }
  },
};

export const UserAPI = {
  getProfile: async (): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du chargement du profil');
      return undefined;
    }
  },

  updateProfile: async (payload: any): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.put('/users/profile', payload);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la mise à jour du profil');
      return undefined;
    }
  },

  getFirebaseToken: async (): Promise<ApiResponse<{ token: string }> | undefined> => {
    try {
      const response = await api.post('/auth/firebase-token');
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la récupération du token Firebase');
      return undefined;
    }
  },

  getStats: async (): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du chargement des statistiques');
      return undefined;
    }
  },

  updatePreferences: async (payload: any): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.put('/users/preferences', payload);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la mise à jour des préférences');
      return undefined;
    }
  },
};

export const NotificationAPI = {
  getNotifications: async (page: number = 1, limit: number = 20): Promise<ApiResponse<{ notifications: any[]; unreadCount: number }> | undefined> => {
    try {
      const response = await api.get('/notifications', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du chargement des notifications');
      return undefined;
    }
  },

  markAsRead: async (id: string): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.post(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du marquage comme lu');
      return undefined;
    }
  },

  markAllAsRead: async (): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.post('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du marquage de toutes les notifications');
      return undefined;
    }
  },

  updatePreferences: async (preferences: any): Promise<ApiResponse<any> | undefined> => {
    try {
      const response = await api.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la mise à jour des préférences');
      return undefined;
    }
  },
};

export const WalletAPI = {
  getBalance: async (): Promise<ApiResponse<{ balance: number }> | undefined> => {
    try {
      const response = await api.get('/wallet/balance');
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du chargement du solde');
      return undefined;
    }
  },

  getTransactions: async (page: number = 1, limit: number = 20): Promise<ApiResponse<{ transactions: any[] }> | undefined> => {
    try {
      const response = await api.get('/wallet/transactions', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du chargement des transactions');
      return undefined;
    }
  },

  addCredits: async (amount: number, paymentMethod: string): Promise<ApiResponse<{ balance: number; transaction: any }> | undefined> => {
    try {
      const response = await api.post('/wallet/add-credits', {
        amount,
        paymentMethod
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de l\'ajout de crédits');
      return undefined;
    }
  },

  withdrawCredits: async (amount: number): Promise<ApiResponse<{ balance: number; transaction: any }> | undefined> => {
    try {
      const response = await api.post('/wallet/withdraw-credits', {
        amount
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erreur lors du retrait de crédits');
      return undefined;
    }
  },
}; 