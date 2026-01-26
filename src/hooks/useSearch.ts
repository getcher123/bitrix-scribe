import { useState, useCallback, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { AnswerResponse, SearchResult, SearchMode } from '@/types/api';

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
  const { settings, refreshHistory, setError: setGlobalError } = useApp();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>(settings.defaultMode);
  const [isSearching, setIsSearching] = useState(false);
  const [answer, setAnswer] = useState<AnswerResponse | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(settings.defaultMode);
  }, [settings.defaultMode]);

  const search = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setGlobalError(null);
    setAnswer(null);
    setSearchResults([]);

    const startTime = performance.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor(performance.now() - startTime));
    }, 100);

    try {
      if (mode === 'search') {
        const response = await apiService.search({ query });
        setSearchResults(response.results || []);
      } else {
        const response = await apiService.answer({ query, mode });
        setAnswer(response);
      }
      await refreshHistory();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setGlobalError(errorMessage);
    } finally {
      clearInterval(interval);
      setElapsedTime(Math.floor(performance.now() - startTime));
      setIsSearching(false);
    }
  }, [query, mode, refreshHistory, setGlobalError]);

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
