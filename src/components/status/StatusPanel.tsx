import React, { useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Server, Database, Cpu, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import type { ServiceStatus } from '@/types/api';
import { cn } from '@/lib/utils';

const serviceInfo = {
  qdrant: { label: 'Qdrant', icon: Database, description: 'Векторная база данных' },
  bge: { label: 'BGE', icon: Cpu, description: 'Embedding модель' },
  openai: { label: 'OpenAI', icon: Cloud, description: 'LLM для генерации' },
};

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
          Статус системы
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('w-4 h-4 mr-1', isRefreshing && 'animate-spin')} />
          Обновить
        </Button>
      </div>

      {/* Overall status */}
      <div className={cn(
        'flex items-center gap-4 p-4 rounded-xl border',
        overallStatus === 'healthy' ? 'bg-success/10 border-success/30' :
        overallStatus === 'degraded' ? 'bg-warning/10 border-warning/30' :
        'bg-destructive/10 border-destructive/30'
      )}>
        <StatusIcon className={cn('w-8 h-8', getStatusColor(overallStatus))} />
        <div>
          <p className={cn('font-medium', getStatusColor(overallStatus))}>
            {overallStatus === 'healthy' ? 'Все сервисы работают' :
             overallStatus === 'degraded' ? 'Частичная деградация' :
             'Сервис недоступен'}
          </p>
          {healthStatus?.timestamp && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Последняя проверка: {new Date(healthStatus.timestamp).toLocaleTimeString('ru-RU')}
            </p>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && !healthStatus && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Ошибка подключения</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Services */}
      {healthStatus?.services && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Сервисы</h4>
          <div className="grid gap-3">
            {Object.entries(healthStatus.services).map(([key, service]) => (
              <ServiceCard
                key={key}
                serviceKey={key as keyof typeof serviceInfo}
                service={service}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceCard({
  serviceKey,
  service,
}: {
  serviceKey: keyof typeof serviceInfo;
  service: ServiceStatus;
}) {
  const info = serviceInfo[serviceKey];
  const StatusIcon = service.status === 'ok' ? CheckCircle :
                     service.status === 'error' ? XCircle : AlertCircle;

  const statusColor = service.status === 'ok' ? 'text-success' :
                      service.status === 'error' ? 'text-destructive' : 'text-warning';

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
        <info.icon className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{info.label}</span>
          <StatusIcon className={cn('w-4 h-4', statusColor)} />
        </div>
        <p className="text-xs text-muted-foreground">{info.description}</p>
      </div>

      <div className="text-right">
        {service.latency_ms !== undefined && (
          <p className="text-sm font-mono text-muted-foreground">{service.latency_ms}ms</p>
        )}
        {service.message && (
          <p className="text-xs text-muted-foreground mt-0.5 max-w-[150px] truncate">
            {service.message}
          </p>
        )}
      </div>
    </div>
  );
}
