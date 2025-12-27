import type {
  AnswerRequest,
  AnswerResponse,
  HealthStatus,
  SearchRequest,
  SearchResult,
} from '@/types/api';

const DEFAULT_TIMEOUT = 30000;

class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:8000', timeout: number = DEFAULT_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  setTimeout(timeout: number) {
    this.timeout = timeout;
  }

  private async fetchWithTimeout<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async health(): Promise<HealthStatus> {
    return this.fetchWithTimeout<HealthStatus>('/health');
  }

  async search(request: SearchRequest): Promise<SearchResult[]> {
    return this.fetchWithTimeout<SearchResult[]>('/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async answer(request: AnswerRequest): Promise<AnswerResponse> {
    return this.fetchWithTimeout<AnswerResponse>('/answer', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getOpenApiSpec(): Promise<object> {
    return this.fetchWithTimeout<object>('/openapi.json');
  }
}

export const apiService = new ApiService();
export default ApiService;
