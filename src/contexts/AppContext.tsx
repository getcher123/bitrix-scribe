import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppSettings, HistoryItem, SearchMode, HealthStatus } from '@/types/api';
import { apiService } from '@/services/api';

interface AppState {
  settings: AppSettings;
  history: HistoryItem[];
  healthStatus: HealthStatus | null;
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_HISTORY'; payload: HistoryItem }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_HEALTH'; payload: HealthStatus | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const defaultSettings: AppSettings = {
  apiBaseUrl: 'http://localhost:8000',
  timeout: 30000,
  fastMode: true,
  showTimings: true,
  showDebug: false,
};

const loadSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem('bitrix-rag-settings');
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings;
};

const loadHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem('bitrix-rag-history');
    if (stored) {
      return JSON.parse(stored).slice(0, 10);
    }
  } catch (e) {
    console.error('Failed to load history:', e);
  }
  return [];
};

const initialState: AppState = {
  settings: loadSettings(),
  history: loadHistory(),
  healthStatus: null,
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SETTINGS':
      const newSettings = { ...state.settings, ...action.payload };
      localStorage.setItem('bitrix-rag-settings', JSON.stringify(newSettings));
      apiService.setBaseUrl(newSettings.apiBaseUrl);
      apiService.setTimeout(newSettings.timeout);
      return { ...state, settings: newSettings };

    case 'ADD_HISTORY':
      const newHistory = [action.payload, ...state.history.filter(h => h.id !== action.payload.id)].slice(0, 10);
      localStorage.setItem('bitrix-rag-history', JSON.stringify(newHistory));
      return { ...state, history: newHistory };

    case 'CLEAR_HISTORY':
      localStorage.removeItem('bitrix-rag-history');
      return { ...state, history: [] };

    case 'SET_HEALTH':
      return { ...state, healthStatus: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

interface AppContextType extends AppState {
  updateSettings: (settings: Partial<AppSettings>) => void;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  checkHealth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    apiService.setBaseUrl(state.settings.apiBaseUrl);
    apiService.setTimeout(state.settings.timeout);
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
  }, []);

  const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const historyItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    dispatch({ type: 'ADD_HISTORY', payload: historyItem });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const health = await apiService.health();
      dispatch({ type: 'SET_HEALTH', payload: health });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_HEALTH', payload: null });
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Health check failed' });
    }
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        updateSettings,
        addToHistory,
        clearHistory,
        checkHealth,
        setLoading,
        setError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
