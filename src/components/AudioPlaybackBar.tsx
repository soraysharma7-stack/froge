import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Globe,
  Sparkles,
} from 'lucide-react';
import { frogeVoiceManager } from '../brain/voice/voiceRegistry';
import { VoiceSessionState } from '../brain/voice/types';
import { getVoiceLanguageByCode } from '../brain/voice/languages';

interface AudioPlaybackBarProps {
  textToSpeak: string;
  messageId: string;
  className?: string;
  language?: string;
}

export const AudioPlaybackBar: React.FC<AudioPlaybackBarProps> = ({
  textToSpeak,
  messageId,
  className = '',
  language,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceSessionState>(() =>
    frogeVoiceManager.getState()
  );
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = frogeVoiceManager.subscribe((state) => {
      setVoiceState(state);
    });
    return unsubscribe;
  }, []);

  const isCurrentMessagePlaying =
    voiceState.lastSpokenText === textToSpeak &&
    (voiceState.audioState === 'speaking' || voiceState.audioState === 'paused');

  const isPlaying = isCurrentMessagePlaying && voiceState.audioState === 'speaking';
  const isPaused = isCurrentMessagePlaying && voiceState.audioState === 'paused';

  const handleTogglePlay = async () => {
    if (isPlaying) {
      frogeVoiceManager.pauseSpeaking();
    } else if (isPaused) {
      frogeVoiceManager.resumeSpeaking();
    } else {
      setPlaybackProgress(0);
      await frogeVoiceManager.speak(textToSpeak, {
        language: language || voiceState.selectedLanguage,
        rate: voiceState.playbackRate,
        onProgress: (p) => setPlaybackProgress(p),
      });
    }
  };

  const handleReplay = async () => {
    setPlaybackProgress(0);
    await frogeVoiceManager.speak(textToSpeak, {
      language: language || voiceState.selectedLanguage,
      rate: voiceState.playbackRate,
      onProgress: (p) => setPlaybackProgress(p),
    });
  };

  const handleStop = () => {
    frogeVoiceManager.stopSpeaking();
    setPlaybackProgress(0);
  };

  const handleSetRate = (rate: number) => {
    frogeVoiceManager.setPlaybackRate(rate);
    setShowSpeedMenu(false);
    // If currently playing, restart at new rate seamlessly
    if (isPlaying) {
      frogeVoiceManager.speak(textToSpeak, {
        language: language || voiceState.selectedLanguage,
        rate,
        onProgress: (p) => setPlaybackProgress(p),
      });
    }
  };

  const currentLang = getVoiceLanguageByCode(language || voiceState.selectedLanguage);

  return (
    <div
      id={`audio-player-${messageId}`}
      className={`inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 text-xs text-slate-700 shadow-2xs ${className}`}
    >
      {/* Play / Pause Main Action */}
      <button
        type="button"
        id={`btn-audio-play-${messageId}`}
        onClick={handleTogglePlay}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg font-semibold transition-all ${
          isPlaying
            ? 'bg-emerald-600 text-white shadow-2xs'
            : isPaused
            ? 'bg-amber-500 text-white shadow-2xs'
            : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/60'
        }`}
        title={isPlaying ? 'Pause Speech' : isPaused ? 'Resume Speech' : 'Listen with FROGÉ Voice'}
      >
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5" />
            <span className="text-[11px]">Pause</span>
          </>
        ) : isPaused ? (
          <>
            <Play className="w-3.5 h-3.5" />
            <span className="text-[11px]">Resume</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px]">Listen</span>
          </>
        )}
      </button>

      {/* Dynamic Waveform Indicator when active */}
      {isCurrentMessagePlaying && (
        <div className="flex items-center gap-0.5 px-1.5 h-4">
          {[40, 90, 60, 100, 50].map((h, i) => (
            <span
              key={i}
              className={`w-0.5 rounded-full transition-all ${
                isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
              style={{
                height: isPlaying ? `${h}%` : '4px',
                animationDelay: `${i * 120}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Replay Button (visible when played or active) */}
      {(isCurrentMessagePlaying || voiceState.lastSpokenText === textToSpeak) && (
        <button
          type="button"
          id={`btn-audio-replay-${messageId}`}
          onClick={handleReplay}
          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
          title="Replay from start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Speed Rate Pill & Menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
          title="Playback speed"
        >
          {voiceState.playbackRate}x
        </button>

        {showSpeedMenu && (
          <div className="absolute bottom-full left-0 mb-1 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-1 min-w-[70px] space-y-0.5 text-[11px] font-semibold">
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => handleSetRate(rate)}
                className={`w-full text-left px-2 py-0.5 rounded-md transition-colors ${
                  voiceState.playbackRate === rate
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Language Badge */}
      <span
        className="text-[10px] text-slate-500 px-1 py-0.5 rounded bg-slate-200/60 font-medium"
        title={`Language: ${currentLang.label}`}
      >
        {currentLang.flag} {currentLang.code.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
};
