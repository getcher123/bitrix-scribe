import { useState, useCallback } from 'react';
import { apiService } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { AnswerResponse, SearchResult, SearchMode, Source } from '@/types/api';

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  mode: SearchMode;
  setMode: (mode: SearchMode) => void;
  isSearching: boolean;
  answer: AnswerResponse | null;
  searchResults: SearchResult[];
  elapsedTime: number;
  error: string | null;
  search: () => Promise<void>;
  clear: () => void;
}

export function useSearch(): UseSearchReturn {
  const { settings, addToHistory, setError: setGlobalError } = useApp();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('full');
  const [isSearching, setIsSearching] = useState(false);
  const [answer, setAnswer] = useState<AnswerResponse | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setGlobalError(null);
    setAnswer(null);
    setSearchResults([]);

    const startTime = performance.now();
    let interval: NodeJS.Timeout;

    interval = setInterval(() => {
      setElapsedTime(Math.floor(performance.now() - startTime));
    }, 100);

    try {
      if (mode === 'search') {
        const results = await apiService.search({ query });
        setSearchResults(results);
        addToHistory({ query, mode });
      } else {
        const apiMode = mode === 'fast' ? 'extractive' : 'llm';
        const response = await apiService.answer({ query, mode: apiMode });
        setAnswer(response);
        addToHistory({
          query,
          mode,
          answer: response.answer,
          sources: response.sources,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setGlobalError(errorMessage);
    } finally {
      clearInterval(interval);
      setElapsedTime(Math.floor(performance.now() - startTime));
      setIsSearching(false);
    }
  }, [query, mode, addToHistory, setGlobalError]);

  const clear = useCallback(() => {
    setQuery('');
    setAnswer(null);
    setSearchResults([]);
    setError(null);
    setElapsedTime(0);
  }, []);

  return {
    query,
    setQuery,
    mode,
    setMode,
    isSearching,
    answer,
    searchResults,
    elapsedTime,
    error,
    search,
    clear,
  };
}
