import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowDown,
  Square,
  RotateCw,
  Eye,
  Scan,
  Monitor,
  Camera,
  Sparkles,
  X,
  Code,
  Bug,
  Zap,
} from 'lucide-react';
import { ChatMessage as ChatMessageType, FrogeModeId, StudentReportData } from '../types';
import { ChatMessage } from './ChatMessage';
import { FrogeLogo } from './FrogeLogo';
import { FROGE_MODES } from '../constants/modes';

interface ChatStreamProps {
  messages: ChatMessageType[];
  isGenerating: boolean;
  activeMode: FrogeModeId;
  isSharingScreen?: boolean;
  isAppInBackground?: boolean;
  streamResolution?: { width: number; height: number } | null;
  onEditQuery: (newQuery: string) => void;
  onRegenerate: () => void;
  onRetry?: () => void;
  onStopGeneration?: () => void;
  onShareMessage: (message: ChatMessageType) => void;
  onOpenStudentReport?: (report: StudentReportData) => void;
  onQuickScanAndAsk?: (prompt: string) => void;
  onStopSharingScreen?: () => void;
  onOpenScreenShareModal?: () => void;
}

export const ChatStream: React.FC<ChatStreamProps> = ({
  messages,
  isGenerating,
  activeMode,
  isSharingScreen = false,
  isAppInBackground = false,
  streamResolution,
  onEditQuery,
  onRegenerate,
  onRetry,
  onStopGeneration,
  onShareMessage,
  onOpenStudentReport,
  onQuickScanAndAsk,
  onStopSharingScreen,
  onOpenScreenShareModal,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const modeConfig = FROGE_MODES[activeMode] || FROGE_MODES['simple-chat'];

  // Timer while generating
  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  // Handle scroll detection
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    setIsScrolledUp(distanceFromBottom > 120);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
    setIsScrolledUp(false);
  };

  // Auto scroll to bottom when new messages or chunks arrive, unless user scrolled up
  useEffect(() => {
    if (!isScrolledUp) {
      scrollToBottom('smooth');
    }
  }, [messages, isGenerating, isSharingScreen]);

  // Determine synthesis step text based on elapsed time
  const getSynthesisStep = () => {
    if (elapsedSeconds < 0.8) return 'Analyzing prompt & intent parameters...';
    if (elapsedSeconds < 1.8) return `Synthesizing cognitive response for ${modeConfig.name}...`;
    return `Refining output & verifying evidence (${elapsedSeconds}s)...`;
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      id="froge-chat-stream"
      className="flex-1 overflow-y-auto w-full pt-4 pb-8 space-y-2 relative"
    >
      {messages.map((msg, index) => {
        const isLastAssistantMsg =
          msg.role === 'assistant' && index === messages.length - 1;

        return (
          <ChatMessage
            key={msg.id}
            message={msg}
            onEditQuery={msg.role === 'user' ? onEditQuery : undefined}
            onRegenerate={isLastAssistantMsg ? onRegenerate : undefined}
            onRetry={isLastAssistantMsg ? (onRetry || onRegenerate) : undefined}
            onShare={onShareMessage}
            onOpenStudentReport={onOpenStudentReport}
            isStreaming={isGenerating && isLastAssistantMsg && msg.status === 'streaming'}
          />
        );
      })}

      {/* Loading & Synthesis Indicator when generating (if last message isn't already streaming) */}
      {isGenerating && (!messages.length || messages[messages.length - 1].role === 'user') && (
        <div
          id="streaming-indicator"
          className="flex gap-3 md:gap-4 my-4 max-w-4xl mr-auto px-4 md:px-6 w-full animate-fade-in"
        >
          <div className="shrink-0 pt-0.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border animate-pulse"
              style={{
                backgroundColor: `${modeConfig.accentColor}15`,
                borderColor: `${modeConfig.accentColor}40`,
              }}
            >
              <FrogeLogo size="sm" showBadge={false} />
            </div>
          </div>
          <div className="flex-1 max-w-[90%] bg-white border border-zinc-200/70 p-4 rounded-2xl rounded-tl-sm shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900">FROGÉ AI</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                  style={{
                    color: modeConfig.accentColor,
                    borderColor: `${modeConfig.accentColor}30`,
                    backgroundColor: `${modeConfig.accentColor}0e`,
                  }}
                >
                  {modeConfig.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                {elapsedSeconds > 0 ? `${elapsedSeconds.toFixed(1)}s` : 'Starting...'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ backgroundColor: modeConfig.accentColor }}
                />
                <span className="text-xs font-medium text-zinc-600">
                  {getSynthesisStep()}
                </span>
              </div>

              {onStopGeneration && (
                <button
                  type="button"
                  id="btn-indicator-stop"
                  onClick={onStopGeneration}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-zinc-200/80 shadow-2xs shrink-0"
                  title="Stop generation"
                >
                  <Square className="w-3 h-3 fill-zinc-600 text-zinc-600" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Scene Watcher Below Chat (Active Multimodal Observation Strip) */}
      {isSharingScreen && (
        <div className="max-w-4xl mx-auto px-4 md:px-6 my-3 animate-fade-in select-none">
          <div className="bg-gradient-to-r from-zinc-950 via-emerald-950 to-zinc-900 rounded-2xl border border-emerald-500/40 p-3.5 shadow-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-emerald-300 tracking-wide uppercase">
                    FROGÉ Screen Eye Watching Active Scene
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-mono">
                    {streamResolution ? `${streamResolution.width}×${streamResolution.height}` : 'HD 60FPS'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  {isAppInBackground
                    ? '🟢 FROGÉ is actively observing your other apps/windows in background without stopping.'
                    : 'Real-time scene buffer connected. Click any action below to analyze your screen instantly.'}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons Below Chat */}
            <div className="flex items-center gap-1.5 flex-wrap sm:shrink-0">
              <button
                type="button"
                onClick={() =>
                  onQuickScanAndAsk &&
                  onQuickScanAndAsk('What is on my screen right now? Explain the layout, content, and any important details.')
                }
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>See Screen</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onQuickScanAndAsk &&
                  onQuickScanAndAsk('Debug the code, logs, or error stack trace displayed on this screen and provide the fixed code solution.')
                }
                className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Bug className="w-3.5 h-3.5 text-rose-400" />
                <span>Debug Code</span>
              </button>

              {onOpenScreenShareModal && (
                <button
                  type="button"
                  onClick={onOpenScreenShareModal}
                  className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors"
                  title="Open Screen Studio"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
              )}

              {onStopSharingScreen && (
                <button
                  type="button"
                  onClick={onStopSharingScreen}
                  className="p-1.5 bg-red-900/60 hover:bg-red-800 text-red-200 rounded-xl transition-colors"
                  title="Stop Screen Watching & Close Stream"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Scroll to Bottom Button */}
      {isScrolledUp && (
        <div className="sticky bottom-4 right-4 flex justify-center w-full pointer-events-none z-10 animate-fade-in">
          <button
            onClick={() => scrollToBottom('smooth')}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-900 text-white text-xs font-medium shadow-md backdrop-blur-xs transition-all active:scale-95 border border-zinc-700"
            title="Scroll to latest message"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Scroll to latest</span>
          </button>
        </div>
      )}

      <div ref={bottomRef} className="h-2" />
    </div>
  );
};
