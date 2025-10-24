import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

export const API_URL = 'http://10.125.154.113:3000/api';

// Configuration Axios avec intercepteurs
const createApiInstance = (): AxiosInstance => {
  const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Intercepteur pour ajouter le token automatiquement
  api.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem('auth-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur pour gérer les erreurs et refresh token
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Essayer de rafraîchir le token
          const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
            headers: {
              'Authorization': `Bearer ${await AsyncStorage.getItem('auth-token')}`
            }
          });

          const newToken = refreshResponse.data.data.token;
          await AsyncStorage.setItem('auth-token', newToken);
          await AsyncStorage.setItem('user-data', JSON.stringify(refreshResponse.data.data.user));

          // Retenter la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Si le refresh échoue, nettoyer et rediriger vers login
          await AsyncStorage.removeItem('auth-token');
          await AsyncStorage.removeItem('user-data');
          throw refreshError;
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};

export const api = createApiInstance();

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: string;
  credits: number;
  rating: number;
  isVerified: boolean;
}

export interface Ride {
  id: string;
  from: { address: string; lat: number; lng: number };
  to: { address: string; lat: number; lng: number };
  date: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  status: string;
} 