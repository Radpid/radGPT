import { apiRequest } from './api';
import type { LoginRequest, TokenResponse, User } from './api';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<TokenResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch('http://localhost:8000/auth/token', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const tokenData: TokenResponse = await response.json();
    localStorage.setItem('access_token', tokenData.access_token);
    return tokenData;
  }

  static async getCurrentUser(): Promise<User> {
    return apiRequest('/auth/me');
  }

  static async register(userData: { name: string; email: string; password: string }): Promise<User> {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static logout(): void {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}
