import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/search/SearchBar';
import { AnswerDisplay } from '@/components/search/AnswerDisplay';
import { SearchResults } from '@/components/search/SearchResults';
import { HistoryPanel } from '@/components/search/HistoryPanel';
import { StatusPanel } from '@/components/status/StatusPanel';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { useSearch } from '@/hooks/useSearch';
import { useApp } from '@/contexts/AppContext';
// SearchMode removed - only LLM mode is used now
import { AlertCircle, Sparkles } from 'lucide-react';

type Tab = 'search' | 'status' | 'settings';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { settings, error: globalError } = useApp();

  const {
    query,
    setQuery,
    isSearching,
    answer,
    searchResults,
    elapsedTime,
    error,
    search,
  } = useSearch();

  const handleHistorySelect = (historyQuery: string) => {
    setQuery(historyQuery);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container px-4 md:px-6 py-8">
        {/* Global error banner */}
        {globalError && activeTab === 'search' && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 animate-fade-up">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">Ошибка подключения к API</p>
                <p className="text-sm text-muted-foreground mt-0.5">{globalError}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero section */}
            {!answer && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8 animate-fade-up">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 glow-primary mb-6">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Поиск по Bitrix документации
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Задайте вопрос и получите ответ с точными ссылками на источники
                </p>
              </div>
            )}

            {/* Search bar */}
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              onSearch={search}
              isLoading={isSearching}
              elapsedTime={elapsedTime}
            />

            {/* Error display */}
            {error && !isSearching && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 animate-fade-up">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                  <p className="text-destructive">{error}</p>
                </div>
              </div>
            )}

            {/* Results */}
            {answer && (
              <AnswerDisplay answer={answer} showTimings={settings.showTimings} elapsedTime={elapsedTime} />
            )}

            {searchResults.length > 0 && (
              <SearchResults
                results={searchResults}
                activeFilters={activeFilters}
                onFilterChange={setActiveFilters}
              />
            )}

            {/* History (when no active search) */}
            {!answer && searchResults.length === 0 && !isSearching && (
              <div className="mt-12">
                <HistoryPanel onSelect={handleHistorySelect} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'status' && (
          <div className="max-w-2xl mx-auto">
            <StatusPanel />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <SettingsPanel />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>BitrixRAG — Система поиска по документации Bitrix</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
