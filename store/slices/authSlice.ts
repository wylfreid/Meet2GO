import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAPI } from '../../services/api';

interface AuthState {
  user: any;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await AuthAPI.login(email, password);
      if (!data) {
        return rejectWithValue('Erreur de connexion');
      }
      await AsyncStorage.setItem('auth-token', data.data.token);
      await AsyncStorage.setItem('user-data', JSON.stringify(data.data.user));
      return data.data.user;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: any, { rejectWithValue }) => {
    try {
      const data = await AuthAPI.register(payload);
      if (!data) {
        return rejectWithValue('Erreur lors de l\'inscription');
      }
      // Sauvegarder le token et les données utilisateur temporaires
      // pour permettre la navigation vers verify-otp
      if (data.data && data.data.token && data.data.user) {
        await AsyncStorage.setItem('auth-token', data.data.token);
        await AsyncStorage.setItem('user-data', JSON.stringify(data.data.user));
      }
      return data.data.user; // Retourner l'utilisateur pour mettre à jour l'état Redux
    } catch (err: any) {
      if (err.errors) {
        return rejectWithValue({ message: err.message, errors: err.errors });
      }
      return rejectWithValue(err.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  const data = await AuthAPI.logout();
  // data ne peut pas être undefined ici car on retourne toujours un objet
  await AsyncStorage.removeItem('auth-token');
  await AsyncStorage.removeItem('user-data');
  return { success: true };
});

export const initializeUserFromCache = createAsyncThunk(
  'auth/initializeUserFromCache',
  async () => {
    try {
      const authToken = await AsyncStorage.getItem('auth-token');
      const userData = await AsyncStorage.getItem('user-data');
      
      if (!authToken || !userData) {
        console.log('🔒 Pas de token ou données utilisateur en cache');
        return null;
      }
      
      const user = JSON.parse(userData);
      console.log('📱 Utilisateur trouvé en cache:', user.name);
      
      // Vérifier que le token n'est pas expiré (optionnel)
      // Si tu veux une vérification plus stricte, tu peux décoder le JWT
      // Pour l'instant, on fait confiance au cache
      
      return user;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation depuis le cache:', error);
      // Nettoyer le cache en cas d'erreur
      await AsyncStorage.removeItem('auth-token');
      await AsyncStorage.removeItem('user-data');
      return null;
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await AuthAPI.getCurrentUser();
      if (!data) {
        return null;
      }
      await AsyncStorage.setItem('user-data', JSON.stringify(data.data));
      return data.data;
    } catch (err: any) {
      try {
        const userData = await AsyncStorage.getItem('user-data');
        if (userData) {
          return JSON.parse(userData);
        }
      } catch (localError) {}
      if (err.message.includes('401') || err.message.includes('Token') || err.message.includes('Unauthorized')) {
        await AsyncStorage.removeItem('auth-token');
        await AsyncStorage.removeItem('user-data');
        return null;
      }
      return null;
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const data = await AuthAPI.verifyOtp(email, otp);
      if (!data) {
        return rejectWithValue('Erreur lors de la vérification du code');
      }
      await AsyncStorage.setItem('auth-token', data.data.token);
      await AsyncStorage.setItem('user-data', JSON.stringify(data.data.user));
      return data.data.user;
    } catch (err: any) {
      if (err.errors) {
        return rejectWithValue({ message: err.message, errors: err.errors });
      }
      return rejectWithValue(err.message);
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      const data = await AuthAPI.resendOtp(email);
      if (!data) {
        return rejectWithValue('Erreur lors du renvoi du code');
      }
      return data;
    } catch (err: any) {
      if (err.errors) {
        return rejectWithValue({ message: err.message, errors: err.errors });
      }
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        // Mettre à jour l'utilisateur pour permettre la navigation vers verify-otp
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload as string;
      })
      .addCase(initializeUserFromCache.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeUserFromCache.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(initializeUserFromCache.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload as string;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload as string;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload as string;
      })
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer; 