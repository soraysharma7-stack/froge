import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Mic,
  Paperclip,
  X,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Check,
  Loader2,
  AlertCircle,
  MessageSquare,
  BrainCircuit,
  Sparkles,
  Terminal,
  Zap,
  GraduationCap,
  Monitor,
  Camera,
  Eye,
  Scan,
  Radio,
  HelpCircle,
  Globe,
} from 'lucide-react';
import { FrogeModeId, VisualAttachment } from '../types';
import { FROGE_MODES, FROGE_MODE_LIST } from '../constants/modes';

interface ComposerProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isGenerating: boolean;
  activeMode: FrogeModeId;
  onSelectMode: (mode: FrogeModeId) => void;
  onOpenVoice: () => void;
  onOpenScreenShare?: () => void;
  onQuickScanAndAsk?: (promptText?: string) => void;
  isSharingScreen?: boolean;
  isAppInBackground?: boolean;
  attachedScreenFrame?: VisualAttachment | null;
  onRemoveScreenFrame?: () => void;
  disabled?: boolean;
  errorModeId?: FrogeModeId | null;
  activeModelId?: string;
  onOpenModelSelector?: () => void;
  isWebSearchActive?: boolean;
  onToggleWebSearch?: () => void;
}

export const Composer: React.FC<ComposerProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isGenerating,
  activeMode,
  onSelectMode,
  onOpenVoice,
  onOpenScreenShare,
  onQuickScanAndAsk,
  isSharingScreen = false,
  isAppInBackground = false,
  attachedScreenFrame = null,
  onRemoveScreenFrame,
  disabled = false,
  errorModeId = null,
  activeModelId = 'fog-neural-core-v3',
  onOpenModelSelector,
  isWebSearchActive = false,
  onToggleWebSearch,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; type: string }[]>([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isMicHovered, setIsMicHovered] = useState(false);

  const currentModeConfig = FROGE_MODES[activeMode] || FROGE_MODES['simple-chat'];

  const getModeIcon = (id: FrogeModeId, iconClass = 'w-3.5 h-3.5') => {
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && (input.trim() || attachedScreenFrame)) {
        onSend();
      }
    }
  };

  const handleAddMockAttachment = (type: string, name: string) => {
    setAttachments((prev) => [...prev, { name, type }]);
    setShowAttachmentMenu(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const quickVisionPrompts = [
    { label: '🌐 Search Web', prompt: 'Search the web for the latest verified news and developments on ' },
    { label: '🐸 FROGÉ, Look at This!', prompt: 'Look at my current screen. Explain what you see, identify any key details, errors, or next actions.' },
    { label: '🐞 Debug Code/Error', prompt: 'Inspect the code or error message visible on my screen. Find the bug and show me how to fix it.' },
    { label: '✨ Explain This View', prompt: 'Explain the concepts, workflow, and structure shown on this screen in simple terms.' },
    { label: '📊 Summarize Screen', prompt: 'Summarize all key metrics, data points, or bullet items visible on my screen right now.' },
  ];

  return (
    <div className="w-full bg-white/90 backdrop-blur-md border-t border-zinc-200/70 p-3 sm:p-4 select-none">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Background Observation / Screen Eye Live Banner */}
        {isSharingScreen && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950 to-zinc-900 text-white text-xs border border-emerald-500/30 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-emerald-200">
                FROGÉ Eye Active
              </span>
              <span className="text-zinc-400 text-[11px] hidden sm:inline">
                • {isAppInBackground ? 'Watching other window in background' : 'Observing live screen stream'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onQuickScanAndAsk && onQuickScanAndAsk('Analyze what is on my screen right now and give me actionable insights.')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <Scan className="w-3 h-3" />
              <span>FROGÉ, See This!</span>
            </button>
          </div>
        )}

        {/* Attached Screen Frame / Visual context banner */}
        {attachedScreenFrame && (
          <div className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 shadow-2xs animate-fade-in">
            <div
              onClick={() => setShowPreviewModal(true)}
              className="relative w-12 h-8 rounded-lg overflow-hidden bg-zinc-900 cursor-pointer border border-emerald-300 shrink-0 group"
              title="Click to expand full screen capture"
            >
              <img
                src={attachedScreenFrame.dataUrl}
                alt="Attached screen"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                <Eye className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-950 truncate">
                  {attachedScreenFrame.title || 'Screen Frame Attached'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  {attachedScreenFrame.width}×{attachedScreenFrame.height}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 truncate">
                AI Vision will perceive this screen when sending your prompt.
              </p>
            </div>

            <button
              type="button"
              onClick={onRemoveScreenFrame}
              className="p-1 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
              title="Remove screen attachment"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Proactive "FROGÉ See This" Quick Action Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-lg shrink-0">
            <Scan className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>FROGÉ Quick:</span>
          </div>
          {quickVisionPrompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (item.label.includes('Search Web')) {
                  if (onToggleWebSearch && !isWebSearchActive) {
                    onToggleWebSearch();
                  }
                  setInput(item.prompt);
                  if (textareaRef.current) textareaRef.current.focus();
                } else if (onQuickScanAndAsk) {
                  onQuickScanAndAsk(item.prompt);
                } else {
                  setInput(item.prompt);
                  if (textareaRef.current) textareaRef.current.focus();
                }
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-900 border border-zinc-200/80 hover:border-emerald-300 text-zinc-700 font-medium whitespace-nowrap transition-all shrink-0 active:scale-95 cursor-pointer shadow-2xs"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Input Box Wrapper */}
        <div className="relative flex items-end gap-2 bg-white border border-zinc-300/80 rounded-2xl p-2 sm:p-2.5 shadow-xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/15 transition-all">
          <div className="flex-1 flex flex-col min-w-0">
            {/* Prompt Textarea */}
            <textarea
              ref={textareaRef}
              id="composer-textarea"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || isGenerating}
              placeholder={
                activeMode === 'student-mode'
                  ? 'Ask a question or request a concept review (Live Web Grounded)...'
                  : activeMode === 'froge-code'
                  ? 'Ask for code, refactoring, or bug fix (Live Web Grounded)...'
                  : activeMode === 'deep-thinking'
                  ? 'Ask complex reasoning, research, or multi-step analysis...'
                  : 'Ask FROGÉ Brain anything — live web intelligence & reasoning always on...'
              }
              className="w-full text-sm text-zinc-800 bg-transparent border-0 resize-none focus:outline-none placeholder:text-zinc-400 max-h-[180px] py-1 px-1 leading-relaxed"
            />

            {/* Bottom Controls inside composer */}
            <div className="flex items-center justify-between pt-2 px-1 border-t border-zinc-100 mt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Mode Selector Pill / Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    id="composer-mode-selector"
                    onClick={() => setShowModeDropdown(!showModeDropdown)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-100 border border-zinc-200/80 transition-colors"
                    title="Switch FROGÉ Intelligence Mode"
                  >
                    {getModeIcon(activeMode)}
                    <span className="truncate max-w-[90px] sm:max-w-none">
                      {currentModeConfig.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showModeDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowModeDropdown(false)}
                      />
                      <div className="absolute left-0 bottom-full mb-2 w-72 bg-white rounded-2xl shadow-xl border border-zinc-200 py-2 z-30 animate-scale-in">
                        <div className="px-3 py-1.5 border-b border-zinc-100 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                            FROGÉ Intelligence Modes
                          </span>
                        </div>

                        <div className="p-1 space-y-0.5">
                          {FROGE_MODE_LIST.map((mode) => {
                            const isSelected = mode.id === activeMode;
                            const isError = errorModeId === mode.id;

                            return (
                              <button
                                key={mode.id}
                                type="button"
                                onClick={() => {
                                  onSelectMode(mode.id);
                                  setShowModeDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-start justify-between gap-2 ${
                                  isSelected
                                    ? 'bg-emerald-50 text-emerald-950 font-semibold'
                                    : 'hover:bg-zinc-50 text-zinc-700'
                                }`}
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <div
                                    className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                                      isSelected
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-zinc-100 text-zinc-600'
                                    }`}
                                  >
                                    {getModeIcon(mode.id, 'w-3.5 h-3.5')}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-semibold">
                                        {mode.name}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 font-normal line-clamp-1 leading-snug mt-0.5">
                                      {mode.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center pt-0.5">
                                  {isSelected && (
                                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Active AI Model Pill */}
                {onOpenModelSelector && (
                  <button
                    type="button"
                    id="composer-model-pill"
                    onClick={onOpenModelSelector}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border-emerald-300/80 ring-1 ring-emerald-400/20"
                    title="Active FOG In-Computer Model: Click to select FOG core"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px]">
                      {activeModelId === 'fog-deep-reasoner'
                        ? 'FOG Reasoner'
                        : activeModelId === 'fog-code-matrix'
                        ? 'FOG Code'
                        : activeModelId === 'froge-model-gateway'
                        ? 'FROGÉ Gateway'
                        : activeModelId === 'fog-turbo-flow'
                        ? 'FOG Turbo'
                        : 'FOG Core v3'}
                    </span>
                    <ChevronDown className="w-2.5 h-2.5 text-emerald-600" />
                  </button>
                )}

                {/* Screen Share / Screen Eye Button */}
                {onOpenScreenShare && (
                  <button
                    type="button"
                    id="composer-screenshare-btn"
                    onClick={onOpenScreenShare}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      isSharingScreen
                        ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-300 font-semibold shadow-2xs'
                        : 'text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50/70 border border-zinc-200/60'
                    }`}
                    title={isSharingScreen ? 'Screen Eye Active - Click to manage or snap' : 'Share Screen with FROGÉ AI'}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    {isSharingScreen && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    <span className="text-[11px] hidden sm:inline">
                      {isSharingScreen ? 'Screen Eye Live' : 'Screen Eye'}
                    </span>
                  </button>
                )}

                {/* Web Intelligence Grounding - Always Active in FROGÉ Brain */}
                <div
                  id="composer-websearch-badge"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-blue-50/90 text-blue-800 border border-blue-200/80 font-semibold shadow-2xs select-none"
                  title="FROGÉ Brain Live Web Intelligence: Continuous, always-on web search, reasoning & empirical grounding"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[11px]">Live Web: Always Active</span>
                </div>

                {/* Attachment Button */}
                <div className="relative">
                  <button
                    type="button"
                    id="composer-attach-btn"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                    title="Add attachment or image"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>

                  {showAttachmentMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowAttachmentMenu(false)}
                      />
                      <div className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-200 py-1.5 z-30 text-xs animate-scale-in">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddMockAttachment('doc', 'project_specification.pdf')
                          }
                          className="w-full text-left px-3 py-2 hover:bg-zinc-50 flex items-center gap-2 text-zinc-700 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Upload Document</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAddMockAttachment('image', 'mockup_wireframe.png')
                          }
                          className="w-full text-left px-3 py-2 hover:bg-zinc-50 flex items-center gap-2 text-zinc-700 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Upload Image</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Voice Dictation Button with Animated Soundwave below */}
                <div
                  className="relative flex flex-col items-center"
                  onMouseEnter={() => setIsMicHovered(true)}
                  onMouseLeave={() => setIsMicHovered(false)}
                >
                  <button
                    type="button"
                    id="composer-voice-btn"
                    onClick={onOpenVoice}
                    className="relative p-1.5 text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer group"
                    title="Speak to FROGÉ Voice"
                  >
                    <Mic className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  </button>

                  {/* Soundwave Animation Bars Below Mic */}
                  <div className="flex items-end justify-center gap-0.5 h-1.5 w-6 mt-0.5">
                    <span
                      className={`w-0.5 bg-emerald-500 rounded-full transition-all duration-300 ${
                        isMicHovered ? 'h-2 animate-pulse' : 'h-1'
                      }`}
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className={`w-0.5 bg-emerald-400 rounded-full transition-all duration-300 ${
                        isMicHovered ? 'h-3 animate-pulse' : 'h-1.5'
                      }`}
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className={`w-0.5 bg-emerald-600 rounded-full transition-all duration-300 ${
                        isMicHovered ? 'h-2.5 animate-pulse' : 'h-1'
                      }`}
                      style={{ animationDelay: '300ms' }}
                    />
                    <span
                      className={`w-0.5 bg-emerald-500 rounded-full transition-all duration-300 ${
                        isMicHovered ? 'h-2 animate-pulse' : 'h-0.5'
                      }`}
                      style={{ animationDelay: '450ms' }}
                    />
                  </div>
                </div>
              </div>

              {/* Keyboard hint */}
              <span className="hidden sm:inline-block text-[11px] text-zinc-400 select-none">
                Press <kbd className="font-mono text-[10px] px-1 py-0.5 bg-zinc-100 rounded border border-zinc-200">↵</kbd> to send
              </span>
            </div>
          </div>

          {/* Send / Stop Action Button */}
          {isGenerating ? (
            <button
              type="button"
              id="btn-stop-generation"
              onClick={onStop}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer"
              title="Stop generation"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-send-message"
              onClick={onSend}
              disabled={(!input.trim() && !attachedScreenFrame) || disabled}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                (input.trim() || attachedScreenFrame) && !disabled
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95 shadow-2xs'
                  : 'bg-zinc-100 text-zinc-300 border border-zinc-200/60 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Disclaimer Text */}
        <p className="text-center text-[11px] text-zinc-400 mt-1">
          FROGÉ AI Vision Engine v3.8 • Autonomous Multimodal Perception
        </p>
      </div>

      {/* Lightbox Zoom for Attached Screen Frame */}
      {showPreviewModal && attachedScreenFrame && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowPreviewModal(false)}
        >
          <div className="relative max-w-4xl max-h-[85vh] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 flex flex-col">
            <div className="p-3 bg-zinc-800 flex items-center justify-between text-white text-xs">
              <span className="font-bold flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-400" />
                {attachedScreenFrame.title || 'Screen Capture Preview'}
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 hover:bg-zinc-700 rounded-lg text-zinc-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center">
              <img
                src={attachedScreenFrame.dataUrl}
                alt="Full preview"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
