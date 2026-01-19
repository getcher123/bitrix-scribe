import React from 'react';
import { BookOpen, Github, Settings, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  activeTab: 'search' | 'status' | 'eval' | 'settings';
  onTabChange: (tab: 'search' | 'status' | 'eval' | 'settings') => void;
  onLogoClick?: () => void;
}

export function Header({ activeTab, onTabChange, onLogoClick }: HeaderProps) {
  const handleLogoClick = () => {
    onLogoClick?.();
    onTabChange('search');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo - clickable to return home */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 glow-primary-soft">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h1 className="font-display font-bold text-lg text-foreground">
              Bitrix<span className="text-primary">RAG</span>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Документация с AI
            </p>
          </div>
        </button>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Button
            variant={activeTab === 'search' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('search')}
            className={cn(
              activeTab === 'search' && 'bg-secondary'
            )}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Поиск</span>
          </Button>

          <Button
            variant={activeTab === 'status' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('status')}
            className={cn(
              activeTab === 'status' && 'bg-secondary'
            )}
          >
            <Activity className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Статус</span>
          </Button>

          <Button
            variant={activeTab === 'eval' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('eval')}
            className={cn(
              activeTab === 'eval' && 'bg-secondary'
            )}
          >
            <Activity className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Eval</span>
          </Button>

          <Button
            variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('settings')}
            className={cn(
              activeTab === 'settings' && 'bg-secondary'
            )}
          >
            <Settings className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Настройки</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
