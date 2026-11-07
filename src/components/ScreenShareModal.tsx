import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Video,
  VideoOff,
  Camera,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  Bug,
  Layout,
  FileSpreadsheet,
  HelpCircle,
  Eye,
  Check,
  Radio,
  KeyRound,
  ShieldCheck,
  Layers,
  ArrowRight,
  RefreshCw,
  Zap,
  Scan,
  Code,
  LineChart,
  Smartphone,
} from 'lucide-react';
import { VisualAttachment } from '../types';

interface ScreenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSharing: boolean;
  stream: MediaStream | null;
  streamResolution: { width: number; height: number } | null;
  displaySurface?: string;
  isAutoObserving: boolean;
  onStartSharing: () => Promise<boolean>;
  onStopSharing: () => void;
  onCaptureFrame: (title?: string, preset?: any) => VisualAttachment;
  onTriggerScanAnimation?: (onComplete: (frame: VisualAttachment) => void, title?: string, preset?: any) => void;
  onToggleAutoObserve: () => void;
  onSendWithScreen: (prompt: string, attachment: VisualAttachment) => void;
  onAttachToComposer: (attachment: VisualAttachment) => void;
  onDockScreenEye: () => void;
}

export const ScreenShareModal: React.FC<ScreenShareModalProps> = ({
  isOpen,
  onClose,
  isSharing,
  stream,
  streamResolution,
  displaySurface = 'monitor',
  isAutoObserving,
  onStartSharing,
  onStopSharing,
  onCaptureFrame,
  onTriggerScanAnimation,
  onToggleAutoObserve,
  onSendWithScreen,
  onAttachToComposer,
  onDockScreenEye,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<VisualAttachment | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeScenePreset, setActiveScenePreset] = useState<'mobile_home' | 'active_app' | 'code_ide' | 'finance' | 'ui_design'>('mobile_home');

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, isOpen]);

  if (!isOpen) return null;

  const handleTakeSnapshot = (preset = activeScenePreset) => {
    setIsCapturing(true);
    const snap = onCaptureFrame('Screen Snapshot', preset);
    if (snap) {
      setCapturedSnapshot(snap);
    }
    setTimeout(() => setIsCapturing(false), 300);
  };

  const handleTriggerDeviceScanAndAnalyze = (promptText = 'Analyze this scene in depth with FROGÉ Brain and provide findings, key insights, and actions.') => {
    if (onTriggerScanAnimation) {
      onClose();
      onTriggerScanAnimation((frame) => {
        onSendWithScreen(promptText, frame);
      }, 'Device Screen Scan', activeScenePreset);
    } else {
      const snap = onCaptureFrame('Screen Snapshot', activeScenePreset);
      onSendWithScreen(promptText, snap);
      onClose();
    }
  };

  const handleExecuteQuickAction = (promptText: string) => {
    if (onTriggerScanAnimation && !capturedSnapshot) {
      onClose();
      onTriggerScanAnimation((frame) => {
        onSendWithScreen(promptText, frame);
      }, 'Device Scene Scan', activeScenePreset);
      return;
    }

    let snap = capturedSnapshot;
    if (!snap) {
      snap = onCaptureFrame('Screen Snapshot', activeScenePreset);
    }
    if (snap) {
      onSendWithScreen(promptText, snap);
      onClose();
    }
  };

  const handleCustomSend = () => {
    if (!customPrompt.trim()) return;
    const promptToSend = customPrompt.trim();
    setCustomPrompt('');

    if (onTriggerScanAnimation && !capturedSnapshot) {
      onClose();
      onTriggerScanAnimation((frame) => {
        onSendWithScreen(promptToSend, frame);
      }, 'Device Scene Scan', activeScenePreset);
      return;
    }

    let snap = capturedSnapshot;
    if (!snap) {
      snap = onCaptureFrame('Screen Snapshot', activeScenePreset);
    }
    if (snap) {
      onSendWithScreen(promptToSend, snap);
      onClose();
    }
  };

  const quickActions = [
    {
      id: 'explain',
      icon: <Eye className="w-4 h-4 text-emerald-600" />,
      label: 'Explain Active Scene',
      desc: 'Understand full context & workflow',
      prompt: 'Analyze what is currently shown on my screen in detail. Break down the key sections, concepts, visible text, and active workflows.',
    },
    {
      id: 'debug',
      icon: <Bug className="w-4 h-4 text-rose-600" />,
      label: 'Debug Code & Errors',
      desc: 'Find bugs, trace logs & syntax issues',
      prompt: 'Inspect the code, console logs, or error stack trace displayed on my screen. Diagnose the root cause and provide clear, corrected code solutions.',
    },
    {
      id: 'ui_review',
      icon: <Layout className="w-4 h-4 text-indigo-600" />,
      label: 'UI / UX Design Audit',
      desc: 'Evaluate layout, hierarchy & contrast',
      prompt: 'Perform a comprehensive UI/UX critique of the interface on my screen. Evaluate visual hierarchy, accessibility, spacing, alignment, and offer polish suggestions.',
    },
    {
      id: 'extract_data',
      icon: <FileSpreadsheet className="w-4 h-4 text-amber-600" />,
      label: 'Extract Data & Tables',
      desc: 'OCR metrics into structured tables',
      prompt: 'Extract all data, numbers, tables, and key metrics visible on this screen into organized Markdown tables and key-value summaries.',
    },
    {
      id: 'next_step',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      label: 'What To Do Next',
      desc: 'Actionable step-by-step guidance',
      prompt: 'Based on the state and application visible on my screen right now, what is the single best next action or sequence of steps I should execute?',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/70 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-zinc-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
                  FROGÉ Screen Eye — Scene Perception & Scanner
                </h2>
                {isSharing ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE PERCEPTION ({streamResolution ? `${streamResolution.width}x${streamResolution.height}` : 'HD'})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Ready to Scan
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500">
                AI visual perception with full device laser scan animation & FROGÉ Vision Engine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dedicated API Key badge */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100 border border-zinc-200/80 text-[11px] text-zinc-700"
              title="FROGÉ AI operates with its built-in server-side Vision Engine"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-zinc-800">Vision Brain:</span>
              <span className="text-emerald-600 font-bold">Online</span>
            </div>

            {isSharing && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onStopSharing();
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Stop screen sharing and close modal"
                >
                  <VideoOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Stop & Close</span>
                </button>

                <button
                  type="button"
                  onClick={onDockScreenEye}
                  className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60 rounded-xl transition-colors"
                  title="Dock to corner widget while chatting"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-xl transition-colors cursor-pointer"
              title="Close Screen Eye Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Main Video Viewport & Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Video Canvas View */}
            <div className="lg:col-span-8 flex flex-col space-y-3">
              {/* High-Impact Hero Action: Instant Device Holographic Scan */}
              <div className="p-4 bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-500/30 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      ⚡ Instant Holographic Scene Scanner
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Runs laser radar sweep animation on your device & triggers deep FROGÉ Brain visual analysis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTriggerDeviceScanAndAnalyze()}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 rounded-xl text-xs font-extrabold shadow-lg transition-all active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Scan className="w-4 h-4" />
                  <span>Scan Device Scene Now</span>
                </button>
              </div>

              {/* Viewport / Video Box */}
              <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-inner flex items-center justify-center group">
                {isSharing && stream ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-contain"
                    />

                    {/* Overlay Live Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-white text-xs shadow-lg">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span className="font-mono font-semibold text-[11px]">
                        {displaySurface === 'browser' ? 'Browser Tab' : displaySurface === 'window' ? 'App Window' : 'Screen Stream'}
                      </span>
                      {streamResolution && (
                        <span className="text-zinc-400 text-[10px]">
                          {streamResolution.width}×{streamResolution.height}
                        </span>
                      )}
                    </div>

                    {/* Snapshot Flash Overlay */}
                    {isCapturing && (
                      <div className="absolute inset-0 bg-white/40 animate-ping pointer-events-none" />
                    )}

                    {/* Quick Snapshot button on video hover */}
                    <div className="absolute bottom-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleTakeSnapshot()}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-lg transition-all active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Snap Frame
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-4">
                    <div className="relative w-16 h-16 mx-auto rounded-3xl bg-zinc-800 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg">
                      <Scan className="w-8 h-8 animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-zinc-100">
                        Live Scene Vision Perception Ready
                      </h3>
                      <p className="text-xs text-zinc-400 max-w-md mx-auto">
                        Share your browser tab, desktop IDE, or trigger an instant holographic device scan to let FROGÉ AI inspect errors, explain diagrams, or review code.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleTriggerDeviceScanAndAnalyze()}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Scan className="w-4 h-4" />
                        Scan Scene with Animation
                      </button>

                      <button
                        type="button"
                        onClick={() => onStartSharing()}
                        className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl font-semibold text-xs shadow-sm transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Video className="w-4 h-4 text-emerald-400" />
                        Live Display Share
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Scene Presets for Testing & Quick Perception */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                  Select Scene Source / Scenario:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveScenePreset('mobile_home');
                      handleTakeSnapshot('mobile_home');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${
                      activeScenePreset === 'mobile_home'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">Mobile Home</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveScenePreset('code_ide');
                      handleTakeSnapshot('code_ide');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${
                      activeScenePreset === 'code_ide'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">IDE Code Error</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveScenePreset('finance');
                      handleTakeSnapshot('finance');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                      activeScenePreset === 'finance'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <LineChart className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">Finance Metric</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveScenePreset('ui_design');
                      handleTakeSnapshot('ui_design');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                      activeScenePreset === 'ui_design'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">UI/UX Layout</span>
                  </button>
                </div>
              </div>

              {/* Stream Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                <div className="flex items-center gap-2">
                  {isSharing ? (
                    <button
                      type="button"
                      onClick={onStopSharing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                    >
                      <VideoOff className="w-3.5 h-3.5" />
                      Stop Sharing
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onStartSharing()}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Live Screen
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleTakeSnapshot()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    Snap Frame
                  </button>

                  <button
                    type="button"
                    onClick={onToggleAutoObserve}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isAutoObserving
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                    title="Continuously observe screen changes during study or coding"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isAutoObserving ? 'animate-spin text-amber-600' : 'text-zinc-500'}`}
                    />
                    {isAutoObserving ? 'Auto-Observing (8s)' : 'Auto-Observe Mode'}
                  </button>
                </div>

                {/* Dock & Send to Chat shortcuts */}
                {capturedSnapshot && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onAttachToComposer(capturedSnapshot);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      <Check className="w-3 h-3 text-emerald-400" />
                      Attach to Chat
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: 1-Click AI Actions & Custom Question Prompt */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              {/* Snapshot Thumbnail Preview */}
              {capturedSnapshot ? (
                <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      Captured Snapshot Ready
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {capturedSnapshot.width}×{capturedSnapshot.height}
                    </span>
                  </div>
                  <div className="h-24 w-full rounded-xl overflow-hidden border border-emerald-200 bg-zinc-950 flex items-center justify-center">
                    <img
                      src={capturedSnapshot.dataUrl}
                      alt="Screen frame"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-xs text-zinc-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    How FROGÉ Vision Works
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Click any quick action below to instantly analyze the scene with device laser scan animation, or ask a custom question.
                  </p>
                </div>
              )}

              {/* 1-Click Quick Insights */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                  1-Click AI Screen Actions
                </span>
                <div className="space-y-1.5">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleExecuteQuickAction(action.prompt)}
                      className="w-full text-left p-2.5 rounded-xl border border-zinc-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 bg-white transition-all group flex items-start gap-2.5 shadow-2xs cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-zinc-100 group-hover:bg-white transition-colors shrink-0 mt-0.5">
                        {action.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900 group-hover:text-emerald-900">
                            {action.label}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-emerald-600 transition-colors" />
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {action.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Question on this screen */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                  Ask Anything About This Scene
                </span>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Find any bugs or explain this diagram..."
                    className="w-full text-xs text-zinc-800 bg-white border border-zinc-200 rounded-xl p-2.5 pr-10 focus:border-emerald-500 focus:outline-none resize-none leading-relaxed shadow-2xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCustomSend();
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={!customPrompt.trim()}
                    onClick={handleCustomSend}
                    className="absolute right-2 bottom-2.5 p-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/80 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Zero Leak Privacy:</strong> Screen frames are sent securely to server-side multimodal processing only.
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            FROGÉ AI Vision Engine v3.8
          </span>
        </div>
      </div>
    </div>
  );
};
