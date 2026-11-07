import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  ArrowRight,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Globe,
  AlertTriangle,
  ShieldAlert,
  Play,
  Pause,
  Layers,
  Activity,
  Check,
} from 'lucide-react';
import { FrogeLogo } from './FrogeLogo';
import { frogeVoiceManager } from '../brain/voice/voiceRegistry';
import { VoiceSessionState } from '../brain/voice/types';
import {
  SUPPORTED_VOICE_LANGUAGES,
  getVoiceLanguageByCode,
} from '../brain/voice/languages';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTranscript: (text: string) => void;
  onInsertToComposer: (text: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onSendTranscript,
  onInsertToComposer,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceSessionState>(() =>
    frogeVoiceManager.getState()
  );
  const [audioLevel, setAudioLevel] = useState(0);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState('');

  useEffect(() => {
    const unsubState = frogeVoiceManager.subscribe((state) => {
      setVoiceState(state);
      if (state.currentTranscript) {
        setEditableTranscript(state.currentTranscript);
      }
    });

    const unsubAudio = frogeVoiceManager.subscribeAudioLevel((level) => {
      setAudioLevel(level);
    });

    return () => {
      unsubState();
      unsubAudio();
    };
  }, []);

  // When modal opens, auto-start listening if permission allows
  useEffect(() => {
    if (isOpen) {
      setEditableTranscript('');
      frogeVoiceManager.clearTranscript();
      frogeVoiceManager.startListening();
    } else {
      frogeVoiceManager.stopListening();
      frogeVoiceManager.stopSpeaking();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentLang = getVoiceLanguageByCode(voiceState.selectedLanguage);
  const isListening = voiceState.audioState === 'listening';
  const isSpeaking = voiceState.audioState === 'speaking';
  const isPaused = voiceState.audioState === 'paused';
  const hasError = !!voiceState.lastError;

  const toggleListening = async () => {
    if (isListening) {
      frogeVoiceManager.stopListening();
    } else {
      await frogeVoiceManager.startListening();
    }
  };

  const handleSelectLanguage = (code: string) => {
    frogeVoiceManager.setLanguage(code);
    setShowLanguageMenu(false);
    // Restart recognition with new language if listening
    if (isListening) {
      frogeVoiceManager.stopListening();
      setTimeout(() => {
        frogeVoiceManager.startListening();
      }, 150);
    }
  };

  const handleInsert = () => {
    const finalTx = editableTranscript.trim() || voiceState.currentTranscript.trim();
    if (finalTx) {
      onInsertToComposer(finalTx);
      onClose();
    }
  };

  const handleSend = () => {
    const finalTx = editableTranscript.trim() || voiceState.currentTranscript.trim();
    if (finalTx) {
      onSendTranscript(finalTx);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in select-none">
      <div
        id="froge-voice-modal"
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col items-center p-6 md:p-8 relative animate-scale-in"
      >
        {/* Close Button */}
        <button
          id="btn-close-voice"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          title="Close Voice Interface"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header & Language Selector */}
        <div className="flex flex-col items-center mb-4">
          <FrogeLogo size="md" showBadge={true} />
          
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isListening
                  ? 'bg-emerald-500 animate-ping'
                  : isSpeaking
                  ? 'bg-teal-500 animate-pulse'
                  : 'bg-slate-300'
              }`}
            />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              FROGÉ Voice Engine
            </span>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                id="btn-voice-language-picker"
                type="button"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 border border-slate-200 transition-colors"
                title="Select Spoken Language"
              >
                <Globe className="w-3 h-3 text-teal-600" />
                <span>{currentLang.flag} {currentLang.label}</span>
              </button>

              {showLanguageMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 min-w-[220px] max-h-56 overflow-y-auto space-y-0.5 text-left">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Voice Language
                  </div>
                  {SUPPORTED_VOICE_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        voiceState.selectedLanguage === lang.code
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {voiceState.selectedLanguage === lang.code && (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Waveform Visualizer & Microphone Button */}
        <div className="w-full py-4 flex flex-col items-center justify-center">
          {/* Waveform Bars */}
          <div className="flex items-center justify-center gap-1.5 h-16 w-56 mb-4">
            {[35, 75, 95, 60, 100, 80, 45, 90, 65, 85, 50, 70].map((height, i) => {
              const dynamicHeight = isListening
                ? Math.max(12, Math.min(100, height * (audioLevel > 0 ? audioLevel * 1.6 : 0.35)))
                : 8;
              return (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-100 ${
                    isListening
                      ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                      : isSpeaking
                      ? 'bg-teal-500'
                      : 'bg-slate-200'
                  }`}
                  style={{
                    height: `${dynamicHeight}%`,
                  }}
                />
              );
            })}
          </div>

          {/* Main Record Action Button */}
          <button
            id="btn-voice-mic-toggle"
            type="button"
            onClick={toggleListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 ring-rose-100 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
            }`}
            title={isListening ? 'Stop listening' : 'Start speaking'}
          >
            {isListening ? (
              <MicOff className="w-7 h-7" />
            ) : (
              <Mic className="w-7 h-7 text-white" />
            )}
          </button>

          <p className="text-xs font-semibold text-slate-600 mt-3 text-center">
            {isListening
              ? `Listening in ${currentLang.label}... Speak now!`
              : voiceState.lastError
              ? voiceState.lastError.message
              : 'Click microphone to speak to FROGÉ'}
          </p>
        </div>

        {/* Error Diagnostic Card (Permission Denied or Hardware Missing) */}
        {voiceState.lastError && (
          <div className="w-full mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{voiceState.lastError.message}</span>
            </div>
            <p className="text-[11px] text-rose-700 pl-5 leading-relaxed">
              {voiceState.lastError.userFacingGuide}
            </p>
          </div>
        )}

        {/* Live Transcript Box */}
        <div className="w-full bg-slate-50 rounded-2xl p-3.5 border border-slate-200 mb-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-teal-600" />
              REAL-TIME TRANSCRIPT ({currentLang.code})
            </span>
            {(editableTranscript || voiceState.currentTranscript) && (
              <button
                type="button"
                onClick={() => {
                  setEditableTranscript('');
                  frogeVoiceManager.clearTranscript();
                }}
                className="hover:text-slate-700 flex items-center gap-1 text-[10px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
          <textarea
            id="voice-transcript-input"
            value={editableTranscript || voiceState.currentTranscript}
            onChange={(e) => {
              setEditableTranscript(e.target.value);
              frogeVoiceManager.setTranscript(e.target.value);
            }}
            placeholder="Your spoken words will appear here in real-time. You can edit this text anytime before sending..."
            className="w-full text-xs text-slate-800 bg-transparent outline-none resize-none min-h-[60px] max-h-[120px] leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleInsert}
            disabled={!editableTranscript.trim() && !voiceState.currentTranscript.trim()}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              editableTranscript.trim() || voiceState.currentTranscript.trim()
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            Insert to Composer
          </button>

          <button
            type="button"
            id="btn-voice-send"
            onClick={handleSend}
            disabled={!editableTranscript.trim() && !voiceState.currentTranscript.trim()}
            className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl shadow-xs transition-all ${
              editableTranscript.trim() || voiceState.currentTranscript.trim()
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Send to FROGÉ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
