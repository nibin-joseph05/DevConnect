import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Customer interface
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  createdAt: string;
  updatedAt: string;
}

// Customer state interface
export interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Initial state
const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
  searchQuery: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Mock data for development
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0123',
    company: 'Acme Corp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1-555-0124',
    company: 'Tech Solutions',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1-555-0125',
    company: 'Innovation Labs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Async thunk for fetching customers
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      let filteredCustomers = [...mockCustomers];
      
      // Apply search filter
      if (params.search) {
        filteredCustomers = mockCustomers.filter(customer =>
          customer.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          customer.email.toLowerCase().includes(params.search!.toLowerCase())
        );
      }
      
      // Apply pagination
      const startIndex = ((params.page || 1) - 1) * (params.limit || 10);
      const endIndex = startIndex + (params.limit || 10);
      const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
      
      return {
        customers: paginatedCustomers,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: filteredCustomers.length,
        },
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch customers');
    }
  }
);

// Async thunk for fetching customer by ID
export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (id: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const customer = mockCustomers.find(c => c.id === id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      return customer;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch customer');
    }
  }
);

// Async thunk for creating customer
export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCustomer: Customer = {
        ...customerData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return newCustomer;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create customer');
    }
  }
);

// Async thunk for updating customer
export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, ...customerData }: Partial<Customer> & { id: string }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedCustomer: Customer = {
        ...customerData as Customer,
        id,
        updatedAt: new Date().toISOString(),
      };
      
      return updatedCustomer;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update customer');
    }
  }
);

// Async thunk for deleting customer
export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete customer');
    }
  }
);

// Customer slice
const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCurrentCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.currentCustomer = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch customers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.customers;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload);
        state.error = null;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update customer
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(customer => customer.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.currentCustomer?.id === action.payload.id) {
          state.currentCustomer = action.payload;
        }
      })
      // Delete customer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(customer => customer.id !== action.payload);
        if (state.currentCustomer?.id === action.payload) {
          state.currentCustomer = null;
        }
      });
  },
});

export const { setSearchQuery, setCurrentCustomer, clearError } = customerSlice.actions;
export default customerSlice.reducer;