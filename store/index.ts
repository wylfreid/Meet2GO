import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import ridesReducer from './slices/ridesSlice';
import userReducer from './slices/userSlice';
import walletReducer from './slices/walletSlice';
import bookingsReducer from './slices/bookingsSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rides: ridesReducer,
    user: userReducer,
    wallet: walletReducer,
    bookings: bookingsReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 