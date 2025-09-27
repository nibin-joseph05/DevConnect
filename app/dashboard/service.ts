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
      await AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

// Types
export interface DashboardStats {
  totalCustomers: number;
  totalLeads: number;
  totalValue: number;
  leadsByStatus: {
    New: number;
    Contacted: number;
    Converted: number;
    Lost: number;
  };
  recentLeads: Array<{
    id: string;
    title: string;
    status: string;
    value: number;
    customerName: string;
    createdAt: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    colors?: string[];
  }>;
}

// Dashboard service functions
export const dashboardService = {
  /**
   * Get dashboard statistics and data
   * @returns Promise with dashboard data
   */
  getDashboardData: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get('/dashboard');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get leads by status for pie chart
   * @returns Promise with chart data
   */
  getLeadsByStatusChart: async (): Promise<ChartData> => {
    try {
      const response = await apiClient.get('/dashboard/charts/leads-by-status');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch chart data');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get monthly revenue data for line chart
   * @returns Promise with chart data
   */
  getMonthlyRevenueChart: async (): Promise<ChartData> => {
    try {
      const response = await apiClient.get('/dashboard/charts/monthly-revenue');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch revenue data');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get total value of all leads
   * @returns Promise with total value
   */
  getTotalLeadValue: async (): Promise<number> => {
    try {
      const response = await apiClient.get('/dashboard/total-value');
      return response.data.totalValue;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch total value');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get recent activity/leads
   * @param limit - Number of recent items to fetch
   * @returns Promise with recent leads
   */
  getRecentActivity: async (limit: number = 5) => {
    try {
      const response = await apiClient.get(`/dashboard/recent-activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch recent activity');
      }
      throw new Error('Network error occurred');
    }
  },
};

export default dashboardService;
