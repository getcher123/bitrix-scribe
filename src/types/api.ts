import type { paths } from '@/api/schema';

export type SearchRequest =
  paths['/search']['post']['requestBody']['content']['application/json'];
export type SearchResponse =
  paths['/search']['post']['responses'][200]['content']['application/json'];
export type SearchResult = NonNullable<SearchResponse['results']>[number];

export type AnswerRequest =
  paths['/answer']['post']['requestBody']['content']['application/json'];
export type AnswerResponse =
  paths['/answer']['post']['responses'][200]['content']['application/json'];

export type HealthResponse =
  paths['/health']['get']['responses'][200]['content']['application/json'];

export type HistoryResponse =
  paths['/history']['get']['responses'][200]['content']['application/json'];
export type HistoryItem = NonNullable<HistoryResponse['items']>[number];

export type SearchMode = 'auto' | 'llm' | 'extractive' | 'search';

export interface AppSettings {
  apiBaseUrl: string;
  timeout: number;
  defaultMode: SearchMode;
  showTimings: boolean;
  showDebug: boolean;
  sourceUrlPrefix: string;
}
