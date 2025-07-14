import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NotificationAPI } from '../../services/api';

interface Notification {
  id: string;
  type: 'booking' | 'ride' | 'payment' | 'reminder' | 'review' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const data = await NotificationAPI.getNotifications(page, limit);
      if (!data) {
        return rejectWithValue('Erreur lors du chargement des notifications');
      }
      return {
        notifications: data.data.notifications || data.data || [],
        unreadCount: data.data.unreadCount || 0
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await NotificationAPI.markAsRead(id);
      if (!data) {
        return rejectWithValue('Erreur lors du marquage comme lu');
      }
      return { id, data: data.data };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const data = await NotificationAPI.markAllAsRead();
      if (!data) {
        return rejectWithValue('Erreur lors du marquage de toutes les notifications');
      }
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateNotificationPreferences = createAsyncThunk(
  'notifications/updatePreferences',
  async (preferences: any, { rejectWithValue }) => {
    try {
      const data = await NotificationAPI.updatePreferences(preferences);
      if (!data) {
        return rejectWithValue('Erreur lors de la mise à jour des préférences');
      }
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications || action.payload;
        state.unreadCount = action.payload.unreadCount || 
          (action.payload.notifications || action.payload).filter((n: Notification) => !n.read).length;
        state.error = null;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const notification = state.notifications.find(n => n.id === action.payload.id);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.error = null;
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
        state.error = null;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateNotificationPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearNotifications, addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer; 