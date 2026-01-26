import React, { useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Server, Database, Cpu, Cloud, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export function StatusPanel() {
  const { healthStatus, checkHealth, error } = useApp();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkHealth();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return 'text-success';
      case 'degraded':
        return 'text-warning';
      default:
        return 'text-destructive';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return CheckCircle;
      case 'degraded':
        return AlertCircle;
      default:
        return XCircle;
    }
  };

  const overallStatus = healthStatus?.status || 'unknown';
  const StatusIcon = getStatusIcon(overallStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Server className="w-4 h-4 text-primary" />
          System status
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('w-4 h-4 mr-1', isRefreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Overall status */}
      <div className={cn(
        'flex items-center gap-4 p-4 rounded-xl border',
        overallStatus === 'ok' || overallStatus === 'healthy' ? 'bg-success/10 border-success/30' :
        overallStatus === 'degraded' ? 'bg-warning/10 border-warning/30' :
        'bg-destructive/10 border-destructive/30'
      )}>
        <StatusIcon className={cn('w-8 h-8', getStatusColor(overallStatus))} />
        <div>
          <p className={cn('font-medium', getStatusColor(overallStatus))}>
            {overallStatus === 'ok' || overallStatus === 'healthy' ? 'Service is healthy' :
             overallStatus === 'degraded' ? 'Degraded' :
             'Service unavailable'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Updates every 30 seconds
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && !healthStatus && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Connection error</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {healthStatus && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Components</h4>
          <div className="grid gap-3">
            <InfoCard
              icon={Database}
              title="Database"
              lines={[
                `OK: ${healthStatus.database?.ok ? 'yes' : 'no'}`,
                `Dialect: ${healthStatus.database?.dialect ?? 'n/a'}`,
                `pgvector: ${healthStatus.database?.pgvector === null ? 'n/a' : healthStatus.database?.pgvector ? 'yes' : 'no'}`,
                healthStatus.database?.error ? `Error: ${healthStatus.database.error}` : '',
              ]}
            />
            <InfoCard
              icon={Folder}
              title="Indexes"
              lines={[
                `chunks: ${healthStatus.indexes_present?.chunks ? 'yes' : 'no'}`,
                `bm25: ${healthStatus.indexes_present?.bm25 ? 'yes' : 'no'}`,
              ]}
            />
            <InfoCard
              icon={Cpu}
              title="Vector search"
              lines={[
                `backend: ${healthStatus.vector_backend ?? 'n/a'}`,
                `qdrant: ${healthStatus.qdrant_url ?? 'n/a'}`,
                `collection: ${healthStatus.qdrant_collection ?? 'n/a'}`,
              ]}
            />
            <InfoCard
              icon={Cloud}
              title="LLM/Embeddings"
              lines={[
                `openai_model: ${healthStatus.openai_model ?? 'n/a'}`,
                `bge_base_url_set: ${healthStatus.bge_base_url_set ? 'yes' : 'no'}`,
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: React.ElementType;
  title: string;
  lines: string[];
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
          {lines.filter(Boolean).map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
