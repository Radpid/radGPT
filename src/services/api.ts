// Configuration de l'API
export const API_BASE_URL = 'http://localhost:8000';

// Types pour l'API
export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  patient_id: string;
  type: 'Radiologie' | 'Pathologie' | 'Arztbrief';
  title: string;
  date: string;
  doctor: string;
  summary: string;
  full_text: string;
  created_at: string;
}

export interface Comorbidity {
  id: number;
  name: string;
}

export interface Patient {
  id: string;
  last_name: string;
  first_name: string;
  birth_date: string;
  primary_condition: string;
  current_status: string;
  created_at: string;
  reports: Report[];
  comorbidities: Comorbidity[];
}

export interface ChatMessage {
  id: number;
  patient_id: string;
  sender: 'user' | 'ai';
  message: string;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ChatRequest {
  message: string;
  patient_id: string;
  date_filter?: {
    startDate: string;
    endDate: string;
  };
}

export interface ChatResponse {
  response: string;
  message_id: number;
}

// Helper pour les headers d'authentification
export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper pour les requêtes API
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expiré, rediriger vers login
      localStorage.removeItem('access_token');
      window.location.href = '/';
      return;
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
