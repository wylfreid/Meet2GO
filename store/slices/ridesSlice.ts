import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RideAPI } from '../../services/api';

interface RidesState {
  rides: any[];
  currentRide: any | null;
  userRides: any[];
  loading: boolean;
  error: string | null;
}

const initialState: RidesState = {
  rides: [],
  currentRide: null,
  userRides: [],
  loading: false,
  error: null,
};

export const searchRides = createAsyncThunk(
  'rides/search',
  async (params: Record<string, any>, { rejectWithValue }) => {
    try {
      const data = await RideAPI.search(params);
      if (!data) {
        return rejectWithValue('Erreur lors de la recherche de trajets');
      }
      return data.data.rides || data.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getRideById = createAsyncThunk(
  'rides/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await RideAPI.getById(id);
      if (!data) {
        return rejectWithValue('Trajet non trouvé');
      }
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createRide = createAsyncThunk(
  'rides/create',
  async (payload: any, { rejectWithValue }) => {
    try {
      const data = await RideAPI.create(payload);
      if (!data) {
        return rejectWithValue('Erreur lors de la création du trajet');
      }
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getUserRides = createAsyncThunk(
  'rides/getUserRides',
  async (_, { rejectWithValue }) => {
    try {
      const data = await RideAPI.getUserRides();
      if (!data) {
        return rejectWithValue('Erreur lors du chargement de vos trajets');
      }
      return data.data.rides || data.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateRide = createAsyncThunk(
  'rides/update',
  async ({ id, payload }: { id: string; payload: any }, { rejectWithValue }) => {
    try {
      const data = await RideAPI.updateRide(id, payload);
      if (!data) {
        return rejectWithValue('Erreur lors de la mise à jour du trajet');
      }
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteRide = createAsyncThunk(
  'rides/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await RideAPI.deleteRide(id);
      if (!data) {
        return rejectWithValue('Erreur lors de la suppression du trajet');
      }
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const bookRide = createAsyncThunk(
  'rides/book',
  async (payload: any, { rejectWithValue }) => {
    try {
      const data = await RideAPI.book(payload);
      if (!data) {
        return rejectWithValue('Erreur lors de la réservation');
      }
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'rides/cancelBooking',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await RideAPI.cancelBooking(id);
      if (!data) {
        return rejectWithValue('Erreur lors de l\'annulation de la réservation');
      }
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const ridesSlice = createSlice({
  name: 'rides',
  initialState,
  reducers: {
    clearRides: (state) => {
      state.rides = [];
      state.currentRide = null;
      state.userRides = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchRides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchRides.fulfilled, (state, action) => {
        state.loading = false;
        state.rides = action.payload || [];
        state.error = null;
      })
      .addCase(searchRides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getRideById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRideById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
        state.error = null;
      })
      .addCase(getRideById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
        state.error = null;
      })
      .addCase(createRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getUserRides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserRides.fulfilled, (state, action) => {
        state.loading = false;
        state.userRides = action.payload;
        state.error = null;
      })
      .addCase(getUserRides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRide.fulfilled, (state, action) => {
        state.loading = false;
        // Mettre à jour le trajet dans userRides
        const index = state.userRides.findIndex(ride => ride.id === action.payload.id);
        if (index !== -1) {
          state.userRides[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRide.fulfilled, (state, action) => {
        state.loading = false;
        // Supprimer le trajet de userRides
        state.userRides = state.userRides.filter(ride => ride.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(bookRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
        state.error = null;
      })
      .addCase(bookRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
        state.error = null;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearRides } = ridesSlice.actions;
export default ridesSlice.reducer; 