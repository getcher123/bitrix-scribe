export interface SearchResult {
  id: string;
  title: string;
  path: string;
  content: string;
  score: number;
  section?: string;
  highlights?: string[];
}

export interface AnswerResponse {
  answer: string;
  sources: Source[];
  mode: 'extractive' | 'llm' | 'search';
  timings_ms: TimingsMs;
}

export interface Source {
  title: string;
  path: string;
  url?: string;
  snippet?: string;
  relevance?: number;
}

export interface TimingsMs {
  total: number;
  retrieval?: number;
  generation?: number;
  embedding?: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    qdrant: ServiceStatus;
    bge: ServiceStatus;
    openai: ServiceStatus;
  };
  timestamp: string;
}

export interface ServiceStatus {
  status: 'ok' | 'error' | 'unknown';
  latency_ms?: number;
  message?: string;
}

export interface SearchRequest {
  query: string;
  filters?: {
    sections?: string[];
  };
  limit?: number;
}

export interface AnswerRequest {
  query: string;
  mode?: 'extractive' | 'llm' | 'search';
}

export type SearchMode = 'fast' | 'full' | 'search';

export interface HistoryItem {
  id: string;
  query: string;
  mode: SearchMode;
  timestamp: number;
  answer?: string;
  sources?: Source[];
}

export interface AppSettings {
  apiBaseUrl: string;
  timeout: number;
  fastMode: boolean;
  showTimings: boolean;
  showDebug: boolean;
  sourceUrlPrefix: string;
}
