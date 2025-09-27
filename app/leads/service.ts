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
export interface Lead {
  id: string;
  title: string;
  description: string;
  status: 'New' | 'Contacted' | 'Converted' | 'Lost';
  value: number;
  customerId: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadCreateData {
  title: string;
  description: string;
  status: 'New' | 'Contacted' | 'Converted' | 'Lost';
  value: number;
  customerId: string;
}

export interface LeadUpdateData extends Partial<LeadCreateData> {
  id: string;
}

export interface LeadListResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LeadSearchParams {
  customerId?: string;
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: 'title' | 'status' | 'value' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Lead service functions
export const leadService = {
  /**
   * Get paginated list of leads
   * @param params - Search and pagination parameters
   * @returns Promise with lead list and pagination info
   */
  getLeads: async (params: LeadSearchParams = {}): Promise<LeadListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.customerId) queryParams.append('customerId', params.customerId);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiClient.get(`/leads?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch leads');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get lead by ID
   * @param id - Lead ID
   * @returns Promise with lead data
   */
  getLeadById: async (id: string): Promise<Lead> => {
    try {
      const response = await apiClient.get(`/leads/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch lead');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Create new lead
   * @param leadData - Lead data
   * @returns Promise with created lead
   */
  createLead: async (leadData: LeadCreateData): Promise<Lead> => {
    try {
      const response = await apiClient.post('/leads', leadData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create lead');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Update existing lead
   * @param leadData - Lead data with ID
   * @returns Promise with updated lead
   */
  updateLead: async (leadData: LeadUpdateData): Promise<Lead> => {
    try {
      const { id, ...updateData } = leadData;
      const response = await apiClient.put(`/leads/${id}`, updateData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update lead');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Delete lead
   * @param id - Lead ID
   * @returns Promise with deletion result
   */
  deleteLead: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.delete(`/leads/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete lead');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get leads by status
   * @param status - Lead status
   * @param limit - Maximum number of results
   * @returns Promise with leads
   */
  getLeadsByStatus: async (status: string, limit: number = 10): Promise<Lead[]> => {
    try {
      const response = await apiClient.get(`/leads/status/${status}?limit=${limit}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch leads by status');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get leads for a specific customer
   * @param customerId - Customer ID
   * @param params - Additional search parameters
   * @returns Promise with customer leads
   */
  getCustomerLeads: async (customerId: string, params: Omit<LeadSearchParams, 'customerId'> = {}): Promise<LeadListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('customerId', customerId);
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiClient.get(`/leads?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch customer leads');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get lead statistics
   * @returns Promise with lead statistics
   */
  getLeadStats: async () => {
    try {
      const response = await apiClient.get('/leads/stats');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch lead statistics');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Validate lead data
   * @param leadData - Lead data to validate
   * @returns object with validation result and errors
   */
  validateLeadData: (leadData: Partial<LeadCreateData>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!leadData.title || leadData.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!leadData.description || leadData.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!leadData.status) {
      errors.push('Status is required');
    } else if (!['New', 'Contacted', 'Converted', 'Lost'].includes(leadData.status)) {
      errors.push('Invalid status');
    }

    if (leadData.value === undefined || leadData.value === null) {
      errors.push('Value is required');
    } else if (leadData.value < 0) {
      errors.push('Value must be positive');
    }

    if (!leadData.customerId) {
      errors.push('Customer ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

export default leadService;
