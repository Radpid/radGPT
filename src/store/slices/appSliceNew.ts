import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Patient, ChatMessage } from '../../services/api';
import type { RootState } from '../store';

interface AppState {
  patient: Patient | null;
  messages: ChatMessage[];
  isAiTyping: boolean;
  isCalendarOpen: boolean;
  dateRange: { startDate: string | null; endDate: string | null };
}

const initialState: AppState = {
  patient: null,
  messages: [],
  isAiTyping: false,
  isCalendarOpen: false,
  dateRange: { startDate: null, endDate: null },
};

export const askAi = createAsyncThunk<ChatMessage, string, { state: RootState }>(
  'app/askAi',
  async (question, { getState, dispatch }) => {
    const state = getState();
    const patient = state.app.patient;
    
    // Ajouter le message utilisateur
    const userMessage: ChatMessage = { 
      id: Date.now(), 
      patient_id: patient?.id || '', 
      sender: 'user', 
      message: question,
      created_at: new Date().toISOString()
    };
    dispatch(addMessage(userMessage));

    // Simuler la réponse IA (sera remplacé par l'API réelle)
    await new Promise(resolve => setTimeout(resolve, 1500));

    let aiResponseText = "Ich bin mir nicht sicher, wie ich helfen kann. Könnten Sie das bitte umformulieren?";
    const lowerCaseQuestion = question.toLowerCase();

    if (patient) {
        if (lowerCaseQuestion.includes('zusammenfassung')) {
          aiResponseText = `Selbstverständlich. Hier ist eine Zusammenfassung der Akte von **${patient.first_name} ${patient.last_name}**:\n\n- **Hauptdiagnose:** ${patient.primary_condition}\n- **Aktueller Status:** ${patient.current_status}\n- **Wesentliche Komorbiditäten:** ${patient.comorbidities.map(c => c.name).join(', ')}.`;
        } else if (lowerCaseQuestion.includes('letzte ct')) {
          const lastCt = patient.reports.find(r => r.type === 'Radiologie');
          aiResponseText = lastCt ? `Das letzte CT Thorax/Abdomen vom **${new Date(lastCt.date).toLocaleDateString('de-DE')}** zeigt: *${lastCt.summary}*` : "In dieser Akte wurde kein CT-Bericht gefunden.";
        }
    } else {
        if (lowerCaseQuestion.includes('bitte geben sie die nummer')) {
            aiResponseText = "Selbstverständlich. Bitte geben Sie die Aktennummer in das Suchfeld auf der vorherigen Seite ein, oder direkt im Dokumenten-Panel.";
        }
    }

    const aiMessage: ChatMessage = { 
      id: Date.now() + 1, 
      patient_id: patient?.id || '', 
      sender: 'ai', 
      message: aiResponseText,
      created_at: new Date().toISOString()
    };

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
      } else {
        // Simuler le chargement d'un patient (sera remplacé par l'API)
        state.patient = null; // L'API chargera les vraies données
        state.messages = [{
          id: Date.now(),
          patient_id: action.payload,
          sender: 'ai',
          message: `Patient mit ID ${action.payload} wird geladen...`,
          created_at: new Date().toISOString()
        }];
      }
    },
    unloadPatient: (state) => {
      state.patient = null;
      state.messages = [];
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
      .addCase(askAi.pending, (state) => {
        state.isAiTyping = true;
      })
      .addCase(askAi.fulfilled, (state, action: PayloadAction<ChatMessage>) => {
        state.isAiTyping = false;
        state.messages.push(action.payload);
      })
      .addCase(askAi.rejected, (state) => {
        state.isAiTyping = false;
        state.messages.push({
          id: Date.now(),
          patient_id: state.patient?.id || '',
          sender: 'ai',
          message: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage.',
          created_at: new Date().toISOString()
        });
      });
  },
});

export const { loadPatient, unloadPatient, addMessage, openCalendar, closeCalendar, setDateRange } = appSlice.actions;
export default appSlice.reducer;
