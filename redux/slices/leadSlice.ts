import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Lead interface
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

// Lead state interface
export interface LeadState {
  leads: Lead[];
  currentLead: Lead | null;
  loading: boolean;
  error: string | null;
  filterStatus: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Initial state
const initialState: LeadState = {
  leads: [],
  currentLead: null,
  loading: false,
  error: null,
  filterStatus: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Mock data for development
const mockLeads: Lead[] = [
  {
    id: '1',
    title: 'Website Redesign Project',
    description: 'Complete website redesign for better user experience',
    status: 'New',
    value: 15000,
    customerId: '1',
    customerName: 'John Doe',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Mobile App Development',
    description: 'Native mobile app for iOS and Android',
    status: 'Contacted',
    value: 25000,
    customerId: '2',
    customerName: 'Jane Smith',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'E-commerce Platform',
    description: 'Full-featured e-commerce solution',
    status: 'Converted',
    value: 35000,
    customerId: '3',
    customerName: 'Bob Johnson',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Data Analytics Dashboard',
    description: 'Business intelligence dashboard with real-time analytics',
    status: 'Lost',
    value: 12000,
    customerId: '1',
    customerName: 'John Doe',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Async thunk for fetching leads
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (params: { customerId?: string; page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      let filteredLeads = [...mockLeads];
      
      // Filter by customer ID
      if (params.customerId) {
        filteredLeads = mockLeads.filter(lead => lead.customerId === params.customerId);
      }
      
      // Filter by status
      if (params.status) {
        filteredLeads = filteredLeads.filter(lead => lead.status === params.status);
      }
      
      // Apply pagination
      const startIndex = ((params.page || 1) - 1) * (params.limit || 10);
      const endIndex = startIndex + (params.limit || 10);
      const paginatedLeads = filteredLeads.slice(startIndex, endIndex);
      
      return {
        leads: paginatedLeads,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: filteredLeads.length,
        },
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch leads');
    }
  }
);

// Async thunk for fetching lead by ID
export const fetchLeadById = createAsyncThunk(
  'leads/fetchLeadById',
  async (id: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const lead = mockLeads.find(l => l.id === id);
      if (!lead) {
        throw new Error('Lead not found');
      }
      
      return lead;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch lead');
    }
  }
);

// Async thunk for creating lead
export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newLead: Lead = {
        ...leadData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return newLead;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create lead');
    }
  }
);

// Async thunk for updating lead
export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, ...leadData }: Partial<Lead> & { id: string }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedLead: Lead = {
        ...leadData as Lead,
        id,
        updatedAt: new Date().toISOString(),
      };
      
      return updatedLead;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update lead');
    }
  }
);

// Async thunk for deleting lead
export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete lead');
    }
  }
);

// Lead slice
const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setFilterStatus: (state, action: PayloadAction<string | null>) => {
      state.filterStatus = action.payload;
    },
    setCurrentLead: (state, action: PayloadAction<Lead | null>) => {
      state.currentLead = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch leads
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.leads;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch lead by ID
      .addCase(fetchLeadById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLead = action.payload;
        state.error = null;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create lead
      .addCase(createLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads.unshift(action.payload);
        state.error = null;
      })
      .addCase(createLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update lead
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.leads.findIndex(lead => lead.id === action.payload.id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
        if (state.currentLead?.id === action.payload.id) {
          state.currentLead = action.payload;
        }
      })
      // Delete lead
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter(lead => lead.id !== action.payload);
        if (state.currentLead?.id === action.payload) {
          state.currentLead = null;
        }
      });
  },
});

export const { setFilterStatus, setCurrentLead, clearError } = leadSlice.actions;
export default leadSlice.reducer;