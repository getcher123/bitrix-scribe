import React from 'react';
import { Play, CheckCircle, XCircle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import type { AnswerRequest } from '@/types/api';

type EvalRow = {
  id: string;
  query: string;
  status: 'idle' | 'running' | 'ok' | 'error';
  ms?: number;
  mode?: string;
  sources?: number;
  error?: string;
};

const DEFAULT_CASES = [
  { id: 'q1', query: 'Как получить список элементов инфоблока через CIBlockElement::GetList' },
  { id: 'q2', query: 'Как создать пользователя?' },
  { id: 'q3', query: 'Где настраиваются смарт‑процессы?' },
  { id: 'q4', query: 'Как выполнить первый запрос к REST API?' },
  { id: 'q5', query: 'Как включить модуль iblock?' },
];

export function EvalPanel() {
  const { settings } = useApp();
  const [rows, setRows] = React.useState<EvalRow[]>(
    DEFAULT_CASES.map((item) => ({ ...item, status: 'idle' }))
  );
  const [isRunning, setIsRunning] = React.useState(false);
  const [mode, setMode] = React.useState<AnswerRequest['mode']>(
    settings.defaultMode === 'search' ? 'auto' : settings.defaultMode
  );

  React.useEffect(() => {
    setMode(settings.defaultMode === 'search' ? 'auto' : settings.defaultMode);
  }, [settings.defaultMode]);

  const run = async () => {
    setIsRunning(true);
    const nextRows = rows.map((row) => ({ ...row, status: 'running', error: undefined }));
    setRows(nextRows);

    for (const row of nextRows) {
      const started = performance.now();
      try {
        const response = await apiService.answer({ query: row.query, mode });
        const ms = Math.round(performance.now() - started);
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  status: 'ok',
                  ms,
                  mode: response.mode,
                  sources: response.sources?.length ?? 0,
                }
              : r
          )
        );
      } catch (error) {
        const ms = Math.round(performance.now() - started);
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  status: 'error',
                  ms,
                  error: error instanceof Error ? error.message : 'Ошибка',
                }
              : r
          )
        );
      }
    }

    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-foreground">Eval / Smoke</h3>
          <p className="text-sm text-muted-foreground">
            Прогон набора вопросов и базовых метрик ответа.
          </p>
        </div>
        <Button onClick={run} disabled={isRunning}>
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? 'В процессе…' : 'Запустить'}
        </Button>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <label className="text-muted-foreground">Режим:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as AnswerRequest['mode'])}
          className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="auto">auto</option>
          <option value="llm">llm</option>
          <option value="extractive">extractive</option>
        </select>
      </div>

      <div className="grid gap-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg border',
              row.status === 'ok' && 'border-success/30 bg-success/10',
              row.status === 'error' && 'border-destructive/30 bg-destructive/10',
              row.status === 'running' && 'border-primary/30 bg-primary/5',
              row.status === 'idle' && 'border-border bg-secondary/30'
            )}
          >
            {row.status === 'ok' && <CheckCircle className="w-4 h-4 text-success mt-0.5" />}
            {row.status === 'error' && <XCircle className="w-4 h-4 text-destructive mt-0.5" />}
            {row.status === 'running' && <Timer className="w-4 h-4 text-primary mt-0.5 animate-pulse" />}
            {row.status === 'idle' && <Timer className="w-4 h-4 text-muted-foreground mt-0.5" />}

            <div className="flex-1">
              <p className="text-sm text-foreground">{row.query}</p>
              <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                {row.ms !== undefined && <span>{row.ms} ms</span>}
                {row.mode && <span>mode: {row.mode}</span>}
                {row.sources !== undefined && <span>sources: {row.sources}</span>}
                {row.error && <span className="text-destructive">{row.error}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
