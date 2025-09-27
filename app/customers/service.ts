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
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCreateData {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface CustomerUpdateData extends Partial<CustomerCreateData> {
  id: string;
}

export interface CustomerListResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'company' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Customer service functions
export const customerService = {
  /**
   * Get paginated list of customers
   * @param params - Search and pagination parameters
   * @returns Promise with customer list and pagination info
   */
  getCustomers: async (params: CustomerSearchParams = {}): Promise<CustomerListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiClient.get(`/customers?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch customers');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get customer by ID
   * @param id - Customer ID
   * @returns Promise with customer data
   */
  getCustomerById: async (id: string): Promise<Customer> => {
    try {
      const response = await apiClient.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch customer');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Create new customer
   * @param customerData - Customer data
   * @returns Promise with created customer
   */
  createCustomer: async (customerData: CustomerCreateData): Promise<Customer> => {
    try {
      const response = await apiClient.post('/customers', customerData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create customer');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Update existing customer
   * @param customerData - Customer data with ID
   * @returns Promise with updated customer
   */
  updateCustomer: async (customerData: CustomerUpdateData): Promise<Customer> => {
    try {
      const { id, ...updateData } = customerData;
      const response = await apiClient.put(`/customers/${id}`, updateData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update customer');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Delete customer
   * @param id - Customer ID
   * @returns Promise with deletion result
   */
  deleteCustomer: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete customer');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Search customers by name or email
   * @param query - Search query
   * @param limit - Maximum number of results
   * @returns Promise with search results
   */
  searchCustomers: async (query: string, limit: number = 10): Promise<Customer[]> => {
    try {
      const response = await apiClient.get(`/customers/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to search customers');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Validate email format
   * @param email - Email to validate
   * @returns boolean indicating if email is valid
   */
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format
   * @param phone - Phone number to validate
   * @returns boolean indicating if phone is valid
   */
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },
};

export default customerService;
