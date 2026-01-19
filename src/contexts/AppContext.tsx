import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppSettings, HistoryItem, HealthResponse, SearchMode } from '@/types/api';
import { apiService } from '@/services/api';

interface AppState {
  settings: AppSettings;
  history: HistoryItem[];
  healthStatus: HealthResponse | null;
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_HISTORY'; payload: HistoryItem[] }
  | { type: 'SET_HEALTH'; payload: HealthResponse | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const defaultSettings: AppSettings = {
  apiBaseUrl: 'https://rag-bitrix-getcher.amvera.io',
  timeout: 30000,
  defaultMode: 'auto',
  showTimings: true,
  showDebug: false,
  sourceUrlPrefix: 'https://github.com/getcher123/bitrix-docs-new/blob/main/',
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

const initialState: AppState = {
  settings: loadSettings(),
  history: [],
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

    case 'SET_HISTORY':
      return { ...state, history: action.payload };

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
  refreshHistory: (limit?: number) => Promise<void>;
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

  const refreshHistory = useCallback(async (limit: number = 20) => {
    try {
      const response = await apiService.history(limit);
      dispatch({ type: 'SET_HISTORY', payload: response.items || [] });
    } catch (error) {
      dispatch({ type: 'SET_HISTORY', payload: [] });
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'History load failed' });
    }
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

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
        refreshHistory,
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
