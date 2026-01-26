import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import Index from './Index';

vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    settings: { showTimings: false },
    error: 'API unavailable',
  }),
}));

vi.mock('@/hooks/useSearch', () => ({
  useSearch: () => ({
    query: '',
    setQuery: vi.fn(),
    mode: 'auto',
    setMode: vi.fn(),
    isSearching: false,
    answer: null,
    searchResults: [],
    elapsedTime: 0,
    error: null,
    search: vi.fn(),
    clear: vi.fn(),
  }),
}));

vi.mock('@/components/layout/Header', () => ({
  Header: () => <div>Header</div>,
}));

vi.mock('@/components/search/SearchBar', () => ({
  SearchBar: () => <div>SearchBar</div>,
}));

vi.mock('@/components/search/AnswerDisplay', () => ({
  AnswerDisplay: () => <div>AnswerDisplay</div>,
}));

vi.mock('@/components/search/SearchResults', () => ({
  SearchResults: () => <div>SearchResults</div>,
}));

vi.mock('@/components/search/HistoryPanel', () => ({
  HistoryPanel: () => <div>HistoryPanel</div>,
}));

vi.mock('@/components/status/StatusPanel', () => ({
  StatusPanel: () => <div>StatusPanel</div>,
}));

vi.mock('@/components/settings/SettingsPanel', () => ({
  SettingsPanel: () => <div>SettingsPanel</div>,
}));

vi.mock('@/components/eval/EvalPanel', () => ({
  EvalPanel: () => <div>EvalPanel</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: ReactNode }) => <button>{children}</button>,
}));

describe('Index', () => {
  it('renders global API error banner', () => {
    render(<Index />);
    expect(screen.getByText('API connection error')).toBeInTheDocument();
  });
});
