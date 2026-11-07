import React, { useState } from 'react';
import {
  MessageSquare,
  BrainCircuit,
  Sparkles,
  Terminal,
  Zap,
  GraduationCap,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { FrogeModeId } from '../types';
import { FROGE_MODES, FROGE_MODE_LIST } from '../constants/modes';

interface ModeSelectorProps {
  activeMode: FrogeModeId;
  onSelectMode: (mode: FrogeModeId) => void;
  layout?: 'header-pills' | 'grid' | 'dropdown';
  className?: string;
  isGenerating?: boolean;
  errorModeId?: FrogeModeId | null;
  onClearError?: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  activeMode,
  onSelectMode,
  layout = 'header-pills',
  className = '',
  isGenerating = false,
  errorModeId = null,
  onClearError,
}) => {
  const getModeIcon = (id: FrogeModeId, iconClass = 'w-4 h-4') => {
    switch (id) {
      case 'simple-chat':
        return <MessageSquare className={iconClass} />;
      case 'deep-thinking':
        return <BrainCircuit className={iconClass} />;
      case 'froge-code':
        return <Terminal className={iconClass} />;
      case 'max':
        return <Zap className={iconClass} />;
      case 'student-mode':
        return <GraduationCap className={iconClass} />;
    }
  };

  // Header / Top Pills Layout
  if (layout === 'header-pills') {
    return (
      <div
        id="mode-selector-header"
        className={`flex items-center gap-1 p-1 bg-zinc-100/90 rounded-xl border border-zinc-200/80 overflow-x-auto no-scrollbar ${className}`}
      >
        {FROGE_MODE_LIST.map((mode) => {
          const isSelected = activeMode === mode.id;
          const isLoading = isSelected && isGenerating;
          const isError = errorModeId === mode.id;

          return (
            <button
              key={mode.id}
              id={`mode-tab-${mode.id}`}
              onClick={() => {
                if (isError && onClearError) onClearError();
                onSelectMode(mode.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap select-none relative ${
                isError
                  ? 'bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-400/20'
                  : isSelected
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold ring-1 ring-black/5'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
              }`}
              title={`${mode.name}: ${mode.tagline}`}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : isError ? (
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              ) : (
                <span
                  style={{ color: isSelected ? mode.accentColor : undefined }}
                  className={isSelected ? '' : 'text-zinc-400'}
                >
                  {getModeIcon(mode.id, 'w-3.5 h-3.5')}
                </span>
              )}

              <span>{mode.shortName}</span>

              {isSelected && !isLoading && !isError && (
                <span
                  className="w-1.5 h-1.5 rounded-full ml-0.5"
                  style={{ backgroundColor: mode.accentColor }}
                />
              )}

              {isLoading && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Grid layout for welcome screen or detailed selection panels
  return (
    <div
      id="mode-selector-grid"
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}
    >
      {FROGE_MODE_LIST.map((mode) => {
        const isSelected = activeMode === mode.id;
        const isLoading = isSelected && isGenerating;
        const isError = errorModeId === mode.id;

        return (
          <button
            key={mode.id}
            id={`mode-card-${mode.id}`}
            onClick={() => {
              if (isError && onClearError) onClearError();
              onSelectMode(mode.id);
            }}
            className={`group text-left p-4 rounded-xl border transition-all duration-150 relative flex flex-col justify-between ${
              isError
                ? 'bg-red-50/50 border-red-300 ring-2 ring-red-500/20 shadow-xs'
                : isSelected
                ? 'bg-white border-zinc-900/60 shadow-xs ring-1 ring-zinc-900/10'
                : 'bg-white/80 hover:bg-white border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isError
                        ? 'bg-red-100 text-red-600'
                        : mode.lightBg
                    }`}
                    style={{ color: isError ? undefined : mode.accentColor }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    ) : isError ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      getModeIcon(mode.id, 'w-4 h-4')
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 leading-tight">
                      {mode.name}
                    </h4>
                    <span className="text-[11px] font-medium text-zinc-400">
                      {mode.badge}
                    </span>
                  </div>
                </div>

                {/* State Indicators: Selected, Loading, Error, Switchable */}
                {isLoading ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing</span>
                  </span>
                ) : isError ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-100/80 px-2 py-0.5 rounded-md border border-red-200">
                    <AlertCircle className="w-3 h-3" />
                    <span>Error</span>
                  </span>
                ) : isSelected ? (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-2xs"
                    style={{ backgroundColor: mode.accentColor }}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Switch
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                {mode.description}
              </p>
            </div>

            {/* Bottom Status / Tagline */}
            <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 truncate max-w-[190px]">
                {mode.tagline}
              </span>
              {isError ? (
                <span className="text-[10px] font-semibold text-red-600 flex items-center gap-0.5">
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Click to retry</span>
                </span>
              ) : (
                <span
                  className="font-semibold text-[10px] uppercase tracking-wider"
                  style={{ color: isSelected ? mode.accentColor : '#a1a1aa' }}
                >
                  {isSelected ? 'Active' : 'Ready'}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
