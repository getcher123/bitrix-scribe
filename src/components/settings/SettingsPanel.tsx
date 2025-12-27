import React from 'react';
import { Settings, Globe, Clock, Zap, Timer, Bug, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export function SettingsPanel() {
  const { settings, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = React.useState(settings);
  const [hasChanges, setHasChanges] = React.useState(false);

  React.useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const handleChange = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setHasChanges(false);
    toast({ title: 'Настройки сохранены', duration: 2000 });
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          Настройки
        </h3>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Отмена
            </Button>
            <Button variant="default" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Сохранить
            </Button>
          </div>
        )}
      </div>

      {/* API Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Globe className="w-4 h-4" />
          API
        </h4>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm text-foreground">Base URL</label>
            <Input
              value={localSettings.apiBaseUrl}
              onChange={(e) => handleChange('apiBaseUrl', e.target.value)}
              placeholder="http://localhost:8000"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-foreground">Таймаут (мс)</label>
            <Input
              type="number"
              value={localSettings.timeout}
              onChange={(e) => handleChange('timeout', parseInt(e.target.value) || 30000)}
              min={1000}
              max={120000}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Timer className="w-4 h-4" />
          Отображение
        </h4>

        <div className="space-y-3">
          <ToggleOption
            icon={Zap}
            label="Быстрый режим по умолчанию"
            description="Использовать extractive режим"
            checked={localSettings.fastMode}
            onChange={(checked) => handleChange('fastMode', checked)}
          />

          <ToggleOption
            icon={Clock}
            label="Показывать тайминги"
            description="Время выполнения запросов"
            checked={localSettings.showTimings}
            onChange={(checked) => handleChange('showTimings', checked)}
          />

          <ToggleOption
            icon={Bug}
            label="Режим отладки"
            description="Дополнительная информация"
            checked={localSettings.showDebug}
            onChange={(checked) => handleChange('showDebug', checked)}
          />
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Настройки сохраняются локально в браузере.
        </p>
      </div>
    </div>
  );
}

function ToggleOption({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-lg border transition-all duration-200',
        checked
          ? 'bg-primary/10 border-primary/30'
          : 'bg-secondary/50 border-border hover:border-primary/20'
      )}
    >
      <div className={cn(
        'flex items-center justify-center w-10 h-10 rounded-lg',
        checked ? 'bg-primary/20' : 'bg-secondary'
      )}>
        <Icon className={cn('w-5 h-5', checked ? 'text-primary' : 'text-muted-foreground')} />
      </div>

      <div className="flex-1 text-left">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className={cn(
        'w-11 h-6 rounded-full transition-colors duration-200 relative',
        checked ? 'bg-primary' : 'bg-border'
      )}>
        <div className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200',
          checked ? 'translate-x-6' : 'translate-x-1'
        )} />
      </div>
    </button>
  );
}
