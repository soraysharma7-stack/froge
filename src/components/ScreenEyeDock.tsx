import React, { useState } from 'react';
import {
  Video,
  ArrowUpFromLine,
  Mic,
  X,
  AppWindow,
  Sparkles,
  Camera,
  Maximize2,
  Scan,
  Check,
} from 'lucide-react';
import { VisualAttachment } from '../types';

interface ScreenEyeDockProps {
  isSharing: boolean;
  streamResolution: { width: number; height: number } | null;
  displaySurface?: string;
  isAutoObserving?: boolean;
  onOpenFullModal: () => void;
  onStopSharing: () => void;
  onCaptureFrame: (title?: string, preset?: any) => VisualAttachment | null;
  onQuickAsk: (prompt: string, attachment: VisualAttachment) => void;
  onOpenVoice?: () => void;
  onTriggerScanAnimation?: (onComplete: (frame: VisualAttachment) => void, title?: string) => void;
}

export const ScreenEyeDock: React.FC<ScreenEyeDockProps> = ({
  isSharing,
  streamResolution,
  displaySurface = 'monitor',
  isAutoObserving = false,
  onOpenFullModal,
  onStopSharing,
  onCaptureFrame,
  onQuickAsk,
  onOpenVoice,
  onTriggerScanAnimation,
}) => {
  const [flashGlow, setFlashGlow] = useState(false);
  const [showQuickBubble, setShowQuickBubble] = useState(false);
  const [isLensActive, setIsLensActive] = useState(true);

  if (!isSharing) return null;

  const handleCenterCapsuleClick = () => {
    setFlashGlow(true);
    setTimeout(() => setFlashGlow(false), 800);

    const promptText = 'Look at my current mobile screen. Explain what is visible, analyze the UI elements, and suggest the best next actions.';

    if (onTriggerScanAnimation) {
      onTriggerScanAnimation((frame) => {
        onQuickAsk(promptText, frame);
      }, 'Screen Eye Mobile Scan');
    } else {
      const snap = onCaptureFrame('Screen Snapshot', 'mobile_home');
      if (snap) {
        onQuickAsk(promptText, snap);
      }
    }
  };

  const handleShareScreenCastClick = () => {
    setShowQuickBubble((prev) => !prev);
  };

  const handleSnapAndAskCustom = (customPrompt: string) => {
    setShowQuickBubble(false);
    setFlashGlow(true);
    setTimeout(() => setFlashGlow(false), 500);

    if (onTriggerScanAnimation) {
      onTriggerScanAnimation((frame) => {
        onQuickAsk(customPrompt, frame);
      }, 'Screen Eye Scan');
    } else {
      const snap = onCaptureFrame('Screen Snapshot', 'mobile_home');
      if (snap) {
        onQuickAsk(customPrompt, snap);
      }
    }
  };

  return (
    <>
      {/* 1. Floating Top-Right Window / PIP Button (matches screenshot top-right button) */}
      <div className="fixed top-5 right-5 z-50 animate-fade-in select-none">
        <button
          type="button"
          id="btn-floating-top-pip"
          onClick={onOpenFullModal}
          className="w-12 h-12 rounded-2xl bg-white/95 hover:bg-white text-zinc-800 shadow-2xl border border-white/50 flex items-center justify-center active:scale-95 transition-all cursor-pointer backdrop-blur-md group"
          title="Open Screen Studio / Conversation Window"
        >
          <AppWindow className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>
      </div>

      {/* 2. Floating Bottom Dock Bar (matches uploaded screenshot dock) */}
      <div
        id="froge-screen-eye-dock"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-in select-none"
      >
        {/* Quick action popup bubble above dock if tapped */}
        {showQuickBubble && (
          <div className="mb-3 bg-zinc-900/95 text-white border border-zinc-700/80 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl w-72 max-w-[90vw] animate-scale-in">
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 text-[11px] font-bold text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5" />
                FROGÉ Scene Perception
              </span>
              <button
                type="button"
                onClick={() => setShowQuickBubble(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-2">
              <button
                type="button"
                onClick={() => handleSnapAndAskCustom('What is on my screen? Give me an overview.')}
                className="p-1.5 bg-zinc-800/80 hover:bg-emerald-950 text-left rounded-xl border border-zinc-700/70 text-[11px] text-zinc-200"
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => handleSnapAndAskCustom('Inspect the visible UI and find any bugs or errors.')}
                className="p-1.5 bg-zinc-800/80 hover:bg-emerald-950 text-left rounded-xl border border-zinc-700/70 text-[11px] text-zinc-200"
              >
                Debug Error
              </button>
              <button
                type="button"
                onClick={() => handleSnapAndAskCustom('Extract all text and numbers visible on this screen.')}
                className="p-1.5 bg-zinc-800/80 hover:bg-emerald-950 text-left rounded-xl border border-zinc-700/70 text-[11px] text-zinc-200"
              >
                Extract Data
              </button>
              <button
                type="button"
                onClick={() => handleSnapAndAskCustom('What is the single best next action on this screen?')}
                className="p-1.5 bg-zinc-800/80 hover:bg-emerald-950 text-left rounded-xl border border-zinc-700/70 text-[11px] text-zinc-200"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* The Exact Floating Pill Bar */}
        <div className="flex items-center gap-2 sm:gap-2.5 p-2 rounded-full bg-black/40 backdrop-blur-2xl border border-white/25 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          {/* Button 1: Video Lens Toggle */}
          <button
            type="button"
            id="dock-btn-video"
            onClick={() => setIsLensActive(!isLensActive)}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer ${
              isLensActive
                ? 'bg-white/95 text-zinc-900 hover:bg-white'
                : 'bg-zinc-800/90 text-zinc-400 hover:bg-zinc-700'
            }`}
            title="Screen Camera / Video Lens"
          >
            <Video className="w-5 h-5 fill-current" />
          </button>

          {/* Button 2: Screen Cast / Upload / Share Arrow (Light Cyan Squircle) */}
          <button
            type="button"
            id="dock-btn-share-cast"
            onClick={handleShareScreenCastClick}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-200/95 hover:bg-sky-200 text-sky-950 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
            title="Share Screen Options / Quick Scan"
          >
            <ArrowUpFromLine className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Button 3: Signature Glowing Center Capsule Pill (FROGÉ AI Eye) */}
          <button
            type="button"
            id="dock-btn-ai-glow-capsule"
            onClick={handleCenterCapsuleClick}
            className={`w-20 sm:w-24 h-11 sm:h-12 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all ${
              flashGlow
                ? 'bg-white shadow-[0_0_35px_rgba(255,255,255,0.95)] ring-4 ring-sky-300 scale-105'
                : 'bg-gradient-to-r from-sky-400 via-white to-sky-300 shadow-[0_0_26px_rgba(56,189,248,0.75)] hover:shadow-[0_0_34px_rgba(56,189,248,0.9)] animate-pulse'
            }`}
            title="🐸 FROGÉ, Look at This Screen!"
          >
            <div className="w-3 h-3 rounded-full bg-sky-600/40 animate-ping" />
          </button>

          {/* Button 4: Microphone Voice Button */}
          <button
            type="button"
            id="dock-btn-voice-mic"
            onClick={() => {
              if (onOpenVoice) onOpenVoice();
              else handleSnapAndAskCustom('Voice Prompt: What is on my screen?');
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/95 hover:bg-white text-zinc-900 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer relative"
            title="Speak to FROGÉ Voice"
          >
            <Mic className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Button 5: Close (X) Button */}
          <button
            type="button"
            id="dock-btn-close-x"
            onClick={onStopSharing}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/95 hover:bg-white text-zinc-900 hover:text-red-600 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
            title="Stop Screen Sharing & Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </>
  );
};
