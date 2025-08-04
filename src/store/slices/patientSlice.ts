import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import type { Patient } from '../../services/api';

interface PatientState {
  patients: Patient[];
  currentPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: PatientState = {
  patients: [],
  currentPatient: null,
  isLoading: false,
  error: null,
  searchQuery: '',
};

// Async thunks
export const searchPatients = createAsyncThunk(
  'patients/search',
  async (query: string) => {
    if (!query.trim()) {
      return [];
    }
    const patients = await apiRequest(`/patients/?search=${encodeURIComponent(query)}`);
    return patients;
  }
);

export const getPatient = createAsyncThunk(
  'patients/getPatient',
  async (patientId: string) => {
    const patient = await apiRequest(`/patients/${patientId}`);
    return patient;
  }
);

export const createPatient = createAsyncThunk(
  'patients/create',
  async (patientData: Omit<Patient, 'created_at' | 'reports' | 'comorbidities'>) => {
    const patient = await apiRequest('/patients/', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
    return patient;
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearCurrentPatient: (state) => {
      state.currentPatient = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search patients
      .addCase(searchPatients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchPatients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients = action.payload;
        state.error = null;
      })
      .addCase(searchPatients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search patients';
      })
      // Get patient
      .addCase(getPatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPatient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPatient = action.payload;
        state.error = null;
      })
      .addCase(getPatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get patient';
      })
      // Create patient
      .addCase(createPatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients.push(action.payload);
        state.error = null;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create patient';
      });
  },
});

export const { setSearchQuery, clearCurrentPatient, clearError } = patientSlice.actions;
export default patientSlice.reducer;
