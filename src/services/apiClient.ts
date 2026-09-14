/**
 * Cliente HTTP/API Centralizado e Agnóstico de Plataforma.
 * Prepara a arquitetura para consumo de endpoints REST/GraphQL por clientes Web e Mobile (React Native / Flutter / Ionic).
 */

export interface ApiConfig {
  baseUrl: string;
  timeoutMs: number;
  headers: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
  success: boolean;
}

class ApiClient {
  private config: ApiConfig = {
    baseUrl: (typeof process !== 'undefined' && process.env.VITE_API_BASE_URL) || '/api',
    timeoutMs: 10000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  private authToken: string | null = null;

  public setBaseUrl(url: string): void {
    this.config.baseUrl = url;
  }

  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.config.headers };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  public async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET' });
  }

  public async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  private async request<T>(path: string, init: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          ...this.getHeaders(),
          ...((init.headers as Record<string, string>) || {}),
        },
      });

      if (!response.ok) {
        let errMessage = `Erro HTTP ${response.status}`;
        try {
          const errBody = await response.json();
          if (errBody?.message) errMessage = errBody.message;
        } catch {
          // Response was not JSON
        }
        return {
          data: null,
          error: errMessage,
          status: response.status,
          success: false,
        };
      }

      const data = (await response.json()) as T;
      return {
        data,
        error: null,
        status: response.status,
        success: true,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha na conexão de rede';
      return {
        data: null,
        error: message,
        status: 0,
        success: false,
      };
    }
  }
}

export const apiClient = new ApiClient();
