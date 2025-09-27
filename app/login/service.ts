import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your actual API URL

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      await AsyncStorage.removeItem('authToken');
      // You can dispatch a logout action here if needed
    }
    return Promise.reject(error);
  }
);

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  company?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  token: string;
}

// Auth service functions
export const authService = {
  /**
   * Authenticate user with email and password
   * @param credentials - User login credentials
   * @returns Promise with user data and token
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Register new user account
   * @param userData - User registration data
   * @returns Promise with user data and token
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Logout user and clear stored token
   */
  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  /**
   * Get current user profile
   * @returns Promise with user data
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch profile');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Check if user is authenticated
   * @returns Promise with boolean indicating auth status
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      return false;
    }
  },
};

export default authService;
