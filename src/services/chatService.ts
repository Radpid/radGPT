import { apiRequest } from './api';
import type { ChatMessage, ChatRequest, ChatResponse } from './api';

export class ChatService {
  static async sendMessage(chatRequest: ChatRequest): Promise<ChatResponse> {
    return apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify(chatRequest),
    });
  }

  static async getChatHistory(patientId: string): Promise<ChatMessage[]> {
    return apiRequest(`/chat/${patientId}/history`);
  }
}
