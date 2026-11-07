import React from 'react';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Terminal,
  Cpu,
  GraduationCap,
  Globe,
} from 'lucide-react';
import { FrogeModeId } from '../types';
import { FROGE_MODES } from '../constants/modes';
import { FrogeLogo } from './FrogeLogo';
import { ModeSelector } from './ModeSelector';

interface WelcomeScreenProps {
  activeMode: FrogeModeId;
  onSelectMode: (mode: FrogeModeId) => void;
  onSelectPrompt: (prompt: string) => void;
  isGenerating?: boolean;
  errorModeId?: FrogeModeId | null;
  onClearError?: () => void;
  onOpenNeuralControlCenter?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  activeMode,
  onSelectMode,
  onSelectPrompt,
  isGenerating = false,
  errorModeId = null,
  onClearError,
  onOpenNeuralControlCenter,
}) => {
  const currentMode = FROGE_MODES[activeMode] || FROGE_MODES['simple-chat'];

  const webSearchStarters = [
    { title: 'Space Science', query: 'Search the web for latest discoveries in space' },
    { title: 'AI News', query: 'Search the web for the latest artificial intelligence news and breakthroughs' },
    { title: 'Quantum Tech', query: 'Search the web for recent developments in quantum computing' },
  ];

  return (
    <div
      id="froge-welcome-screen"
      className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center animate-fade-in"
    >
      {/* Visual Identity Crest & Emblem */}
      <div className="mb-6 flex flex-col items-center">
        <FrogeLogo size="lg" showBadge={true} showTagline={false} />
        <p className="mt-2 text-xs sm:text-sm font-normal text-zinc-500 max-w-md leading-relaxed">
          High-performance modular AI workspace with dynamic capability routing, cognitive explanations, and multi-model intelligence.
        </p>
      </div>

      {/* Prominent Neural Network Owner Banner */}
      {onOpenNeuralControlCenter && (
        <div className="w-full mb-6 p-4 rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-emerald-50/40 to-amber-50/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-zinc-900">Neural Network Architecture & Training</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">Owner Portal</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                8.03B decoder-only transformer architecture, LoRA training pipeline, dataset splits & 41-point evaluations.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenNeuralControlCenter}
            className="w-full sm:w-auto shrink-0 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Open Neural Network</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mode Switcher Bento Banner */}
      <div className="w-full mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-2xs text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentMode.accentColor }}
              />
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 tracking-tight">
                Current Engine: {currentMode.name}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                {currentMode.badge}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {currentMode.description}
            </p>
          </div>

          <span className="text-[11px] font-medium text-zinc-400 self-start sm:self-auto">
            Select from 6 cognitive modes
          </span>
        </div>

        {/* 6 Modes Grid with Selected, Loading, Error states */}
        <ModeSelector
          activeMode={activeMode}
          onSelectMode={onSelectMode}
          layout="grid"
          isGenerating={isGenerating}
          errorModeId={errorModeId}
          onClearError={onClearError}
        />
      </div>

      {/* Suggested Starters for Active Mode */}
      <div className="w-full text-left">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <h3 className="text-xs font-bold text-zinc-900 tracking-tight">
              Suggested for {currentMode.shortName}
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">Click any prompt to start</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(currentMode?.samplePrompts || []).map((item, idx) => (
            <button
              key={idx}
              id={`sample-prompt-${idx}`}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group text-left p-3 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-zinc-800 group-hover:text-zinc-950">
                    {item.title}
                  </span>
                  {item.category && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                      {item.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 font-normal line-clamp-2 leading-relaxed">
                  "{item.prompt}"
                </p>
              </div>

              <div className="mt-2 flex items-center justify-end text-[10px] font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                <span className="mr-1">Run prompt</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>

        {/* Live Web Search Discovery Bar */}
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-50/70 to-zinc-50 border border-blue-200/70">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-950">Live Web Search & Grounding</span>
            <span className="text-[10px] text-blue-600 font-medium">· Real-time citations</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {webSearchStarters.map((ws, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectPrompt(ws.query)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-900 border border-blue-200/80 text-zinc-700 font-medium transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{ws.title}:</span>
                <span className="text-zinc-500 font-normal italic truncate max-w-[200px] sm:max-w-none">
                  "{ws.query}"
                </span>
                <ArrowRight className="w-3 h-3 text-blue-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Feature Highlights */}
      <div className="mt-8 pt-4 border-t border-zinc-200/60 w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-zinc-50/50">
          <Globe className="w-3.5 h-3.5 text-blue-600 mb-0.5" />
          <span className="text-xs font-semibold text-zinc-800">Live Web Search</span>
          <span className="text-[10px] text-zinc-400">Verified factual citations</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-zinc-50/50">
          <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 mb-0.5" />
          <span className="text-xs font-semibold text-zinc-800">Explainable AI</span>
          <span className="text-[10px] text-zinc-400">Evidence & uncertainty</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-zinc-50/50">
          <Terminal className="w-3.5 h-3.5 text-zinc-800 mb-0.5" />
          <span className="text-xs font-semibold text-zinc-800">FROGÉ Code</span>
          <span className="text-[10px] text-zinc-400">Production TypeScript</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-zinc-50/50">
          <GraduationCap className="w-3.5 h-3.5 text-sky-600 mb-0.5" />
          <span className="text-xs font-semibold text-zinc-800">Student Mode</span>
          <span className="text-[10px] text-zinc-400">Socratic tutoring & quizzes</span>
        </div>
      </div>
    </div>
  );
};
