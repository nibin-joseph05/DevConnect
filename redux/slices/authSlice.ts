import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// User interface for authentication
export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
}

// Authentication state interface
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For development, return mock data
      const mockData = {
        user: {
          id: '1',
          name: credentials.email.split('@')[0],
          email: credentials.email,
          company: 'Dev Innovations Labs',
        },
        token: 'mock-jwt-token-' + Date.now(),
      };
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('authToken', mockData.token);
      await AsyncStorage.setItem('authUser', JSON.stringify(mockData.user));
      
      return mockData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: { name: string; email: string; password: string; company?: string }, { rejectWithValue }) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For development, return mock data
      const mockData = {
        user: {
          id: '1',
          name: userData.name,
          email: userData.email,
          company: userData.company || 'Dev Innovations Labs',
        },
        token: 'mock-jwt-token-' + Date.now(),
      };
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('authToken', mockData.token);
      await AsyncStorage.setItem('authUser', JSON.stringify(mockData.user));
      
      return mockData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
    }
  }
);

// Async thunk for user logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Remove token from AsyncStorage
      await AsyncStorage.removeItem('authToken');
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    }
  }
);

// Auth slice with reducers and extra reducers
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError, setUser, setToken } = authSlice.actions;
export default authSlice.reducer;