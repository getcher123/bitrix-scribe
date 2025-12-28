import React, { KeyboardEvent } from 'react';
import { Search, Zap, Brain, FileSearch, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SearchMode } from '@/types/api';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  onSearch: () => void;
  isLoading: boolean;
  elapsedTime: number;
}

const modes: { value: SearchMode; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'full', label: 'Полный', icon: Brain, description: 'LLM' },
  { value: 'fast', label: 'Быстро', icon: Zap, description: 'Extractive' },
  { value: 'search', label: 'Поиск', icon: FileSearch, description: 'Только документы' },
];

export function SearchBar({
  query,
  onQueryChange,
  mode,
  onModeChange,
  onSearch,
  isLoading,
  elapsedTime,
}: SearchBarProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      onSearch();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Mode selector */}
      <div className="flex items-center gap-2 justify-center">
        {modes.map(({ value, label, icon: Icon, description }) => (
          <button
            key={value}
            onClick={() => onModeChange(value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              mode === value
                ? 'bg-primary text-primary-foreground shadow-lg glow-primary-soft'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            <span className="hidden sm:inline text-xs opacity-60">({description})</span>
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex items-center gap-3 bg-card border border-border rounded-xl p-2 transition-all duration-200 focus-within:border-primary focus-within:shadow-lg focus-within:shadow-primary/10">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Задайте вопрос по Bitrix документации..."
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base"
            disabled={isLoading}
          />

          <Button
            onClick={onSearch}
            disabled={!query.trim() || isLoading}
            variant="glow"
            size="lg"
            className="shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">{(elapsedTime / 1000).toFixed(1)}s</span>
              </>
            ) : (
              <>
                <span>Ответить</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Timer indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Поиск в документации...</span>
          <span className="font-mono text-primary">{(elapsedTime / 1000).toFixed(1)}s</span>
        </div>
      )}
    </div>
  );
}
