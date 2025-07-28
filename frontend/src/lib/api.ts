import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Session, 
  Message, 
  Component, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  AIGenerationRequest,
  AIGenerationResponse,
  ExportRequest,
  ExportCodeResponse,
  ApiResponse
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.removeToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/api/auth/register', data);
    this.setToken(response.data.token);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/api/auth/login', data);
    this.setToken(response.data.token);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/api/auth/logout');
    this.removeToken();
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<{ user: User }> = await this.api.get('/api/auth/profile');
    return response.data.user;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<{ user: User }> = await this.api.put('/api/auth/profile', data);
    return response.data.user;
  }

  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const response: AxiosResponse<{ valid: boolean; user: User }> = await this.api.get('/api/auth/verify');
      return response.data;
    } catch (error) {
      return { valid: false };
    }
  }

  // Session endpoints
  async getSessions(): Promise<Session[]> {
    const response: AxiosResponse<{ sessions: Session[] }> = await this.api.get('/api/sessions');
    return response.data.sessions;
  }

  async getSession(sessionId: string): Promise<Session> {
    const response: AxiosResponse<{ session: Session }> = await this.api.get(`/api/sessions/${sessionId}`);
    return response.data.session;
  }

  async createSession(data: { title: string; description?: string; tags?: string[] }): Promise<Session> {
    const response: AxiosResponse<{ session: Session }> = await this.api.post('/api/sessions', data);
    return response.data.session;
  }

  async updateSession(sessionId: string, data: Partial<Session>): Promise<Session> {
    const response: AxiosResponse<{ session: Session }> = await this.api.put(`/api/sessions/${sessionId}`, data);
    return response.data.session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.api.delete(`/api/sessions/${sessionId}`);
  }

  async addMessage(sessionId: string, data: { role: 'user' | 'assistant'; content: string; metadata?: any }): Promise<Session> {
    const response: AxiosResponse<{ session: Session }> = await this.api.post(`/api/sessions/${sessionId}/messages`, data);
    return response.data.session;
  }

  async updateComponent(sessionId: string, data: { jsx: string; css: string; metadata?: any }): Promise<Session> {
    const response: AxiosResponse<{ session: Session }> = await this.api.put(`/api/sessions/${sessionId}/component`, data);
    return response.data.session;
  }

  async getComponentHistory(sessionId: string): Promise<Component[]> {
    const response: AxiosResponse<{ history: Component[] }> = await this.api.get(`/api/sessions/${sessionId}/history`);
    return response.data.history;
  }

  async restoreComponent(sessionId: string, version: number): Promise<Session> {
    const response: AxiosResponse<{ session: Session }> = await this.api.post(`/api/sessions/${sessionId}/restore/${version}`);
    return response.data.session;
  }

  async searchSessions(query: string): Promise<Session[]> {
    const response: AxiosResponse<{ sessions: Session[] }> = await this.api.get(`/api/sessions/search/${encodeURIComponent(query)}`);
    return response.data.sessions;
  }

  async duplicateSession(sessionId: string): Promise<Session> {
    const response: AxiosResponse<{ session: Session }> = await this.api.post(`/api/sessions/${sessionId}/duplicate`);
    return response.data.session;
  }

  // AI endpoints
  async generateComponent(data: AIGenerationRequest): Promise<AIGenerationResponse> {
    const response: AxiosResponse<AIGenerationResponse> = await this.api.post('/api/ai/generate', data);
    return response.data;
  }

  async generateComponentStream(
    data: AIGenerationRequest,
    onChunk: (chunk: string) => void,
    onComplete: (result: Component) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.api.defaults.baseURL}/api/ai/generate/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to generate component');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                onError(data.error);
                return;
              }
              if (data.chunk) {
                onChunk(data.chunk);
              }
              if (data.done && data.result) {
                onComplete(data.result);
                return;
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async refineComponent(data: AIGenerationRequest): Promise<AIGenerationResponse> {
    const response: AxiosResponse<AIGenerationResponse> = await this.api.post('/api/ai/refine', data);
    return response.data;
  }

  async validateComponent(data: { jsx: string; css: string }): Promise<any> {
    const response: AxiosResponse<{ validation: any }> = await this.api.post('/api/ai/validate', data);
    return response.data.validation;
  }

  async getSuggestions(data: { currentComponent?: Component; context?: any }): Promise<string[]> {
    const response: AxiosResponse<{ suggestions: string[] }> = await this.api.post('/api/ai/suggestions', data);
    return response.data.suggestions;
  }

  // Export endpoints
  async exportComponent(data: ExportRequest): Promise<Blob> {
    const response = await this.api.post('/api/export/zip', data, {
      responseType: 'blob',
    });
    return response.data;
  }

  async exportCode(sessionId: string, format: 'full' | 'jsx' | 'css' = 'full'): Promise<ExportCodeResponse> {
    const response: AxiosResponse<ExportCodeResponse> = await this.api.get(`/api/export/code/${sessionId}?format=${format}`);
    return response.data;
  }

  async exportMultipleComponents(data: { sessionIds: string[]; projectName?: string }): Promise<Blob> {
    const response = await this.api.post('/api/export/zip/multiple', data, {
      responseType: 'blob',
    });
    return response.data;
  }

  async exportSession(sessionId: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/api/export/session/${sessionId}`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response: AxiosResponse<{ status: string; timestamp: string }> = await this.api.get('/api/health');
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService; 