import React, { useMemo } from 'react';
import { Copy, ExternalLink, Clock, Cpu, Database, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnswerResponse, Source } from '@/types/api';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

interface AnswerDisplayProps {
  answer: AnswerResponse;
  showTimings: boolean;
  elapsedTime?: number;
}

// Simple markdown parser for basic formatting
function parseMarkdown(text: string, urlPrefix: string): string {
  // Escape HTML
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;
  html = html.replace(/<p><\/p>/g, '');
  
  // Links - add prefix to relative paths (not starting with http/https)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, linkUrl) => {
    const isAbsolute = /^https?:\/\//i.test(linkUrl);
    const finalUrl = isAbsolute ? linkUrl : urlPrefix + linkUrl;
    return `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
  });

  return html;
}

export function AnswerDisplay({ answer, showTimings, elapsedTime }: AnswerDisplayProps) {
  const { settings } = useApp();
  const [copied, setCopied] = React.useState(false);
  const [copiedLinks, setCopiedLinks] = React.useState(false);

  // Normalize sources - API might return different formats
  const normalizedSources = useMemo(() => {
    if (!answer.sources || !Array.isArray(answer.sources)) return [];
    
    return answer.sources.map((source, idx) => {
      // Handle string sources
      if (typeof source === 'string') {
        return { title: `Источник ${idx + 1}`, path: source, snippet: '' };
      }
      // Handle object sources with various field names
      const s = source as unknown as Record<string, unknown>;
      return {
        title: String(s.title || s.name || s.doc_title || `Источник ${idx + 1}`),
        path: String(s.path || s.url || s.source || s.file || ''),
        snippet: String(s.snippet || s.text || s.content || s.excerpt || ''),
        relevance: typeof s.relevance === 'number' ? s.relevance : typeof s.score === 'number' ? s.score : undefined,
      };
    });
  }, [answer.sources]);

  console.log('AnswerDisplay sources:', answer.sources, '→ normalized:', normalizedSources);

  const renderedAnswer = useMemo(() => parseMarkdown(answer.answer, settings.sourceUrlPrefix), [answer.answer, settings.sourceUrlPrefix]);

  const copyAnswer = async () => {
    await navigator.clipboard.writeText(answer.answer);
    setCopied(true);
    toast({ title: 'Ответ скопирован', duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLinks = async () => {
    const links = normalizedSources.map(s => s.path).filter(Boolean).join('\n');
    await navigator.clipboard.writeText(links);
    setCopiedLinks(true);
    toast({ title: 'Ссылки скопированы', duration: 2000 });
    setTimeout(() => setCopiedLinks(false), 2000);
  };

  const modeLabel = answer.mode === 'extractive' ? 'Быстрый режим' : answer.mode === 'llm' ? 'Полный режим' : 'Поиск';
  const ModeIcon = answer.mode === 'extractive' ? Cpu : Sparkles;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Answer card */}
      <div className="relative bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <ModeIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Ответ</h3>
              <p className="text-xs text-muted-foreground">{modeLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={copyAnswer}>
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div
          className="markdown-content p-6"
          dangerouslySetInnerHTML={{ __html: renderedAnswer }}
        />

        {/* Timings */}
        {showTimings && (
          <div className="flex items-center gap-4 px-6 py-3 border-t border-border bg-secondary/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Всего: {answer.timings_ms?.total ?? elapsedTime ?? 0}ms</span>
            </div>
            {answer.timings_ms?.retrieval && (
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Поиск: {answer.timings_ms.retrieval}ms</span>
              </div>
            )}
            {answer.timings_ms?.generation && (
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Генерация: {answer.timings_ms.generation}ms</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sources */}
      {normalizedSources.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Источники ({normalizedSources.length})
            </h4>
            <Button variant="ghost" size="sm" onClick={copyLinks} className="text-xs">
              {copiedLinks ? <Check className="w-3 h-3 mr-1 text-success" /> : <Copy className="w-3 h-3 mr-1" />}
              Копировать ссылки
            </Button>
          </div>

          <div className="grid gap-2">
            {normalizedSources.map((source, index) => (
              <SourceCard key={index} source={source} index={index} urlPrefix={settings.sourceUrlPrefix} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceCard({ source, index, urlPrefix }: { source: Source; index: number; urlPrefix: string }) {
  const handleOpen = () => {
    const fullUrl = urlPrefix + source.path;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(source.path);
    toast({ title: 'Путь скопирован', description: source.path, duration: 2000 });
  };

  return (
    <div
      className={cn(
        'group flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border cursor-pointer',
        'hover:bg-secondary hover:border-primary/30 transition-all duration-200',
        'animate-fade-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={handleOpen}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-mono text-sm shrink-0">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <h5 className="font-medium text-foreground truncate">{source.title}</h5>
        <p className="text-sm text-muted-foreground font-mono truncate mt-0.5">{source.path}</p>
        {source.snippet && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{source.snippet}</p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleCopyPath}
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        title="Копировать путь"
      >
        <Copy className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={(e) => { e.stopPropagation(); handleOpen(); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        title="Открыть в GitHub"
      >
        <ExternalLink className="w-4 h-4" />
      </Button>
    </div>
  );
}
