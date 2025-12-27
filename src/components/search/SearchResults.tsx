import React from 'react';
import { FileText, ExternalLink, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SearchResult } from '@/types/api';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface SearchResultsProps {
  results: SearchResult[];
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

const sections = [
  { id: 'classic', label: 'Classic', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'D7', label: 'D7', color: 'bg-green-500/20 text-green-400' },
  { id: 'REST', label: 'REST', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'courses', label: 'Курсы', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'user_help', label: 'Справка', color: 'bg-pink-500/20 text-pink-400' },
];

export function SearchResults({ results, activeFilters, onFilterChange }: SearchResultsProps) {
  const toggleFilter = (section: string) => {
    if (activeFilters.includes(section)) {
      onFilterChange(activeFilters.filter(f => f !== section));
    } else {
      onFilterChange([...activeFilters, section]);
    }
  };

  const filteredResults = activeFilters.length > 0
    ? results.filter(r => r.section && activeFilters.includes(r.section))
    : results;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">Фильтры:</span>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => toggleFilter(section.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
              activeFilters.includes(section.id)
                ? `${section.color} ring-1 ring-current`
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            <Tag className="w-3 h-3" />
            {section.label}
          </button>
        ))}
        {activeFilters.length > 0 && (
          <button
            onClick={() => onFilterChange([])}
            className="text-xs text-muted-foreground hover:text-foreground ml-2"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Найдено: <span className="text-foreground font-medium">{filteredResults.length}</span> документов
        {activeFilters.length > 0 && (
          <span className="text-muted-foreground"> (из {results.length})</span>
        )}
      </div>

      {/* Results list */}
      <div className="grid gap-3">
        {filteredResults.map((result, index) => (
          <ResultCard key={result.id} result={result} index={index} />
        ))}
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Документы не найдены</p>
        </div>
      )}
    </div>
  );
}

function ResultCard({ result, index }: { result: SearchResult; index: number }) {
  const section = sections.find(s => s.id === result.section);

  const handleOpen = () => {
    navigator.clipboard.writeText(result.path);
    toast({ title: 'Путь скопирован', description: result.path, duration: 2000 });
  };

  return (
    <div
      className={cn(
        'group p-4 rounded-xl bg-card border border-border',
        'hover:border-primary/30 hover:bg-secondary/50 transition-all duration-200',
        'animate-fade-up'
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary shrink-0">
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground truncate">{result.title}</h4>
            {section && (
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium', section.color)}>
                {section.label}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground font-mono truncate mb-2">{result.path}</p>

          {result.content && (
            <p className="text-sm text-muted-foreground line-clamp-2">{result.content}</p>
          )}

          {result.highlights && result.highlights.length > 0 && (
            <div className="mt-2 space-y-1">
              {result.highlights.slice(0, 2).map((highlight, i) => (
                <p
                  key={i}
                  className="text-sm text-muted-foreground bg-secondary/50 px-2 py-1 rounded"
                  dangerouslySetInnerHTML={{ __html: highlight }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-muted-foreground">
              Релевантность: <span className="text-primary font-medium">{(result.score * 100).toFixed(1)}%</span>
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleOpen}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
