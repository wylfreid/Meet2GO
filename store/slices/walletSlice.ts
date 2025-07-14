import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { WalletAPI } from '../../services/api';

interface Transaction {
  id: string;
  type: 'purchase' | 'deduction' | 'refund' | 'withdrawal';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: 0,
  transactions: [],
  loading: false,
  error: null,
};

export const getWalletBalance = createAsyncThunk(
  'wallet/getBalance',
  async (_, { rejectWithValue }) => {
    try {
      const data = await WalletAPI.getBalance();
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getTransactions = createAsyncThunk(
  'wallet/getTransactions',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const data = await WalletAPI.getTransactions(page, limit);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addCredits = createAsyncThunk(
  'wallet/addCredits',
  async ({ amount, paymentMethod }: { amount: number; paymentMethod: string }, { rejectWithValue }) => {
    try {
      const data = await WalletAPI.addCredits(amount, paymentMethod);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const withdrawCredits = createAsyncThunk(
  'wallet/withdrawCredits',
  async (amount: number, { rejectWithValue }) => {
    try {
      const data = await WalletAPI.withdrawCredits(amount);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWallet: (state) => {
      state.balance = 0;
      state.transactions = [];
      state.error = null;
    },
    updateBalance: (state, action) => {
      state.balance = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.error = null;
      })
      .addCase(getWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.error = null;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addCredits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCredits.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.transactions.unshift(action.payload.transaction);
        state.error = null;
      })
      .addCase(addCredits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(withdrawCredits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(withdrawCredits.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.transactions.unshift(action.payload.transaction);
        state.error = null;
      })
      .addCase(withdrawCredits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWallet, updateBalance } = walletSlice.actions;
export default walletSlice.reducer; 