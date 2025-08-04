import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ChatService } from '../../services/chatService';
import type { ChatMessage, ChatRequest } from '../../services/api';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (chatRequest: ChatRequest) => {
    await ChatService.sendMessage(chatRequest);
    // Récupérer l'historique mis à jour
    const history = await ChatService.getChatHistory(chatRequest.patient_id);
    return history;
  }
);

export const getChatHistory = createAsyncThunk(
  'chat/getHistory',
  async (patientId: string) => {
    const history = await ChatService.getChatHistory(patientId);
    return history;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to send message';
      })
      // Get chat history
      .addCase(getChatHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getChatHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
        state.error = null;
      })
      .addCase(getChatHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get chat history';
      });
  },
});

export const { clearMessages, clearError } = chatSlice.actions;
export default chatSlice.reducer;
