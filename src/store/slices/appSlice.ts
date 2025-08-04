import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Patient, ChatMessage, ChatRequest } from '../../services/api';
import { apiRequest } from '../../services/api';
import type { RootState } from '../store';

interface AppState {
  patient: Patient | null;
  messages: ChatMessage[];
  isAiTyping: boolean;
  isCalendarOpen: boolean;
  dateRange: { startDate: string | null; endDate: string | null };
  chatReset: boolean;
}

const initialState: AppState = {
  patient: null,
  messages: [],
  isAiTyping: false,
  isCalendarOpen: false,
  dateRange: { startDate: null, endDate: null },
  chatReset: false,
};

// Async thunk pour charger un patient par ID
export const loadPatientById = createAsyncThunk<Patient, string>(
  'app/loadPatientById',
  async (patientId: string) => {
    const patient = await apiRequest(`/patients/${patientId}`);
    return patient;
  }
);

// Async thunk pour charger l'historique des messages d'un patient
export const loadChatHistory = createAsyncThunk<ChatMessage[], string>(
  'app/loadChatHistory',
  async (patientId: string) => {
    const history = await apiRequest(`/chat/${patientId}/history`);
    return history;
  }
);

// Async thunk pour supprimer l'historique des messages d'un patient
export const clearChatHistory = createAsyncThunk<void, string>(
  'app/clearChatHistory',
  async (patientId: string) => {
    await apiRequest(`/chat/${patientId}/history`, {
      method: 'DELETE',
    });
  }
);

// Async thunk pour reset complet du chat (supprime l'historique + reset l'état)
export const resetChatCompletely = createAsyncThunk<void, void, { state: RootState }>(
  'app/resetChatCompletely',
  async (_, { getState, dispatch }) => {
    const state = getState();
    if (state.app.patient) {
      await dispatch(clearChatHistory(state.app.patient.id));
    }
  }
);

export const askAi = createAsyncThunk<ChatMessage, string, { state: RootState }>(
  'app/askAi',
  async (question, { getState }) => {
    const state = getState();
    const patient = state.app.patient;
    
    let response: any;
    let aiMessage: ChatMessage;
    
    if (!patient) {
      // Requête générale sans patient
      response = await apiRequest('/chat/general', {
        method: 'POST',
        body: JSON.stringify({ message: question }),
      });
      
      aiMessage = { 
        id: response.message_id, 
        patient_id: '', 
        sender: 'ai', 
        message: response.response,
        created_at: new Date().toISOString()
      };
    } else {
      // Requête avec patient spécifique
      const dateRange = state.app.dateRange;
      const chatRequest: ChatRequest = {
        message: question,
        patient_id: patient.id,
        date_filter: (dateRange.startDate && dateRange.endDate) ? {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        } : undefined,
      };

      response = await apiRequest('/chat/', {
        method: 'POST',
        body: JSON.stringify(chatRequest),
      });

      aiMessage = { 
        id: response.message_id, 
        patient_id: patient.id, 
        sender: 'ai', 
        message: response.response,
        created_at: new Date().toISOString()
      };
    }

    return aiMessage;
  }
);

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    loadPatient: (state, action: PayloadAction<string>) => {
      if (action.payload === 'empty') {
        state.patient = null;
        state.messages = [{
          id: Date.now(),
          patient_id: '',
          sender: 'ai',
          message: 'Hallo! Ich bin hier, um Ihnen bei der Analyse radiologischer Berichte zu helfen. Bitte laden Sie eine Patientenakte, um zu beginnen.',
          created_at: new Date().toISOString()
        }];
      } else if (action.payload === 'not-found') {
        state.patient = null;
        state.messages = [{
          id: Date.now(),
          patient_id: '',
          sender: 'ai',
          message: '❌ **Kein Patient gefunden**\n\nDer gesuchte Patient konnte nicht gefunden werden. Bitte überprüfen Sie Ihre Suchanfrage und versuchen Sie es erneut.\n\n**Tipps:**\n- Verwenden Sie die vollständige Patienten-ID\n- Überprüfen Sie die Schreibweise des Namens\n- Versuchen Sie nur den Nachnamen oder Vornamen',
          created_at: new Date().toISOString()
        }];
      }
    },
    unloadPatient: (state) => {
      state.patient = null;
      state.messages = [];
    },
    resetChat: (state) => {
      state.chatReset = true;
      if (state.patient) {
        // Réinitialiser seulement le chat en gardant le patient
        state.messages = [{
          id: Date.now(),
          patient_id: state.patient.id,
          sender: 'ai',
          message: `Hallo! Ich habe die Akte von **${state.patient.first_name} ${state.patient.last_name}** geladen. Wie kann ich Ihnen helfen?\n\n**Diagnose:** ${state.patient.primary_condition}\n**Status:** ${state.patient.current_status}`,
          created_at: new Date().toISOString()
        }];
      } else {
        state.messages = [{
          id: Date.now(),
          patient_id: '',
          sender: 'ai',
          message: 'Hallo! Ich bin hier, um Ihnen bei der Analyse radiologischer Berichte zu helfen. Bitte laden Sie eine Patientenakte, um zu beginnen.',
          created_at: new Date().toISOString()
        }];
      }
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    openCalendar: (state) => {
      state.isCalendarOpen = true;
    },
    closeCalendar: (state) => {
      state.isCalendarOpen = false;
    },
    setDateRange: (state, action: PayloadAction<{ startDate: string | null; endDate: string | null }>) => {
      state.dateRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadPatientById reducers
      .addCase(loadPatientById.pending, (state) => {
        state.patient = null;
        state.messages = [{
          id: Date.now(),
          patient_id: '',
          sender: 'ai',
          message: 'Patient wird geladen...',
          created_at: new Date().toISOString()
        }];
      })
      .addCase(loadPatientById.fulfilled, (state, action: PayloadAction<Patient>) => {
        state.patient = action.payload;
        state.messages = [{
          id: Date.now(),
          patient_id: action.payload.id,
          sender: 'ai',
          message: `Hallo! Ich habe die Akte von **${action.payload.first_name} ${action.payload.last_name}** geladen. Wie kann ich Ihnen helfen?\n\n**Diagnose:** ${action.payload.primary_condition}\n**Status:** ${action.payload.current_status}`,
          created_at: new Date().toISOString()
        }];
      })
      .addCase(loadPatientById.rejected, (state) => {
        state.patient = null;
        state.messages = [{
          id: Date.now(),
          patient_id: '',
          sender: 'ai',
          message: 'Fehler beim Laden des Patienten. Bitte versuchen Sie es erneut.',
          created_at: new Date().toISOString()
        }];
      })
      // loadChatHistory reducers
      .addCase(loadChatHistory.fulfilled, (state, action: PayloadAction<ChatMessage[]>) => {
        // Ne pas charger l'historique si le chat a été réinitialisé
        if (!state.chatReset) {
          state.messages = action.payload;
        }
        state.chatReset = false; // Reset the flag after checking
      })
      // askAi reducers
      .addCase(askAi.pending, (state, action) => {
        state.isAiTyping = true;
        // Ajouter le message utilisateur
        const userMessage: ChatMessage = { 
          id: Date.now(), 
          patient_id: state.patient?.id || '', 
          sender: 'user', 
          message: action.meta.arg,
          created_at: new Date().toISOString()
        };
        state.messages.push(userMessage);
      })
      .addCase(askAi.fulfilled, (state, action: PayloadAction<ChatMessage>) => {
        state.isAiTyping = false;
        state.messages.push(action.payload);
      })
      .addCase(askAi.rejected, (state, action) => {
        state.isAiTyping = false;
        const errorMessage = action.error.message || 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage.';
        state.messages.push({
          id: Date.now(),
          patient_id: state.patient?.id || '',
          sender: 'ai',
          message: `❌ **Fehler**\n\n${errorMessage}\n\n**Tipp:** ${!state.patient ? 'Bitte laden Sie zuerst eine Patientenakte.' : 'Bitte versuchen Sie es erneut.'}`,
          created_at: new Date().toISOString()
        });
      })
      // resetChatCompletely reducers
      .addCase(resetChatCompletely.fulfilled, (state) => {
        state.chatReset = true;
        if (state.patient) {
          state.messages = [{
            id: Date.now(),
            patient_id: state.patient.id,
            sender: 'ai',
            message: `Hallo! Ich habe die Akte von **${state.patient.first_name} ${state.patient.last_name}** geladen. Wie kann ich Ihnen helfen?\n\n**Diagnose:** ${state.patient.primary_condition}\n**Status:** ${state.patient.current_status}`,
            created_at: new Date().toISOString()
          }];
        } else {
          state.messages = [{
            id: Date.now(),
            patient_id: '',
            sender: 'ai',
            message: 'Hallo! Ich bin hier, um Ihnen bei der Analyse radiologischer Berichte zu helfen. Bitte laden Sie eine Patientenakte, um zu beginnen.',
            created_at: new Date().toISOString()
          }];
        }
      });
  },
});

export const { loadPatient, unloadPatient, resetChat, addMessage, openCalendar, closeCalendar, setDateRange } = appSlice.actions;
export default appSlice.reducer;
