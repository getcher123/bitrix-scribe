import React from 'react';
import { Clock, RotateCcw, Brain, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import type { HistoryItem } from '@/types/api';
import { cn } from '@/lib/utils';

interface HistoryPanelProps {
  onSelect: (query: string) => void;
}

export function HistoryPanel({ onSelect }: HistoryPanelProps) {
  const { history, refreshHistory } = useApp();

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No queries yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Query history
        </h3>
        <Button variant="ghost" size="sm" onClick={() => refreshHistory()} className="text-xs text-muted-foreground">
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {history.map((item, index) => (
          <HistoryCard
            key={item.id}
            item={item}
            index={index}
            onSelect={() => onSelect(item.query || '')}
          />
        ))}
      </div>
    </div>
  );
}

function HistoryCard({
  item,
  index,
  onSelect,
}: {
  item: HistoryItem;
  index: number;
  onSelect: () => void;
}) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} h ago`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        'group w-full flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-transparent',
        'hover:bg-secondary hover:border-primary/30 transition-all duration-200 text-left',
        'animate-fade-up'
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
        <Brain className="w-4 h-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{item.query || 'n/a'}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {item.created_at ? formatTime(Date.parse(item.created_at)) : 'n/a'}
          </span>
        </div>
      </div>

      <RotateCcw className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}
