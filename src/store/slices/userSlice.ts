import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthService } from '../../services/authService';
import type { User, LoginRequest } from '../../services/api';

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: LoginRequest) => {
    await AuthService.login(credentials);
    const user = await AuthService.getCurrentUser();
    return user;
  }
);

export const getCurrentUser = createAsyncThunk(
  'user/getCurrentUser',
  async () => {
    const user = await AuthService.getCurrentUser();
    return user;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
      AuthService.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get user';
      });
  },
});

export const { logout, clearError } = userSlice.actions;
export default userSlice.reducer;
