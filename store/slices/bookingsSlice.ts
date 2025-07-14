import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BookingAPI } from '../../services/api';

interface Booking {
  id: string;
  rideId: string;
  userId: string;
  seats: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  ride: {
    id: string;
    from: string;
    to: string;
    date: string;
    departureTime: string;
    pricePerSeat: number;
    driver: {
      id: string;
      name: string;
      averageRating: number;
    };
  };
}

interface BookingsState {
  bookings: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
};

export const getUserBookings = createAsyncThunk(
  'bookings/getUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await BookingAPI.getUserBookings();
      return data.data.bookings || data.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getBookingById = createAsyncThunk(
  'bookings/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await BookingAPI.getBookingById(id);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await BookingAPI.cancelBooking(id);
      return { id, data: data.data };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBookings: (state) => {
      state.bookings = [];
      state.currentBooking = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
        state.error = null;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
        state.error = null;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        // Mettre à jour le statut de la réservation
        const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index].status = 'cancelled';
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking.status = 'cancelled';
        }
        state.error = null;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBookings } = bookingsSlice.actions;
export default bookingsSlice.reducer; 