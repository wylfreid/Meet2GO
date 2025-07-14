import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UserAPI } from '../../services/api';

interface UserState {
  profile: any | null;
  stats: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  stats: null,
  loading: false,
  error: null,
};

export const getUserProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await UserAPI.getProfile();
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (payload: any, { rejectWithValue }) => {
    try {
      const data = await UserAPI.updateProfile(payload);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getUserStats = createAsyncThunk(
  'user/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await UserAPI.getStats();
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (payload: any, { rejectWithValue }) => {
    try {
      const data = await UserAPI.updatePreferences(payload);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.profile = null;
      state.stats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && action.payload.name) {
          state.profile = action.payload;
        } else if (state.profile) {
          state.profile = { ...state.profile, ...action.meta.arg };
        }
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile.preferences = action.payload.preferences;
        }
        state.error = null;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer; 