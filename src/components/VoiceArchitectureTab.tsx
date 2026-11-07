import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Award,
  Globe,
  Sliders,
  Sparkles,
  Server,
  Layers,
  Activity,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Flame,
  Radio,
} from 'lucide-react';
import { frogeVoiceManager } from '../brain/voice/voiceRegistry';
import {
  VoiceSessionState,
  VoicePermissionState,
  VoiceProviderType,
  VoiceLanguage,
} from '../brain/voice/types';
import {
  runVoiceTestSuite,
  VoiceTestSuiteSummary,
} from '../brain/voice/testSuite';
import { SUPPORTED_VOICE_LANGUAGES, getVoiceLanguageByCode } from '../brain/voice/languages';

export const VoiceArchitectureTab: React.FC = () => {
  const [voiceState, setVoiceState] = useState<VoiceSessionState>(() =>
    frogeVoiceManager.getState()
  );
  const [activeSubTab, setActiveSubTab] = useState<
    'diagnostics' | 'stt-tester' | 'tts-tester' | 'languages' | 'error-sim' | 'test-suite'
  >('diagnostics');

  // Test Suite State
  const [testSummary, setTestSummary] = useState<VoiceTestSuiteSummary | null>(null);
  const [isRunningSuite, setIsRunningSuite] = useState(false);

  // Hardware Diagnostics State
  const [hardwareDiag, setHardwareDiag] = useState<{
    hasMicHardware: boolean;
    speechRecognitionSupported: boolean;
    speechSynthesisSupported: boolean;
    permission: VoicePermissionState;
    availableInputDevicesCount: number;
    diagnostics: string[];
  } | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // STT Live Audio Level
  const [audioLevel, setAudioLevel] = useState(0);

  // TTS Custom Tester State
  const [customTtsText, setCustomTtsText] = useState(
    'FROGÉ voice architecture provides provider-independent speech-to-text, text-to-speech, play, pause, replay, and multi-language support across all engineering modes.'
  );
  const [ttsProgress, setTtsProgress] = useState(0);

  useEffect(() => {
    const unsubState = frogeVoiceManager.subscribe((state) => {
      setVoiceState(state);
    });
    const unsubAudio = frogeVoiceManager.subscribeAudioLevel((level) => {
      setAudioLevel(level);
    });

    runHardwareDiagnostics();

    return () => {
      unsubState();
      unsubAudio();
    };
  }, []);

  const runHardwareDiagnostics = async () => {
    setIsDiagnosing(true);
    try {
      const diag = await frogeVoiceManager.hardwareInspector.diagnoseEnvironment();
      setHardwareDiag(diag);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleRunTestSuite = async () => {
    setIsRunningSuite(true);
    try {
      const summary = await runVoiceTestSuite();
      setTestSummary(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningSuite(false);
    }
  };

  const handleToggleListening = async () => {
    if (voiceState.audioState === 'listening') {
      frogeVoiceManager.stopListening();
    } else {
      await frogeVoiceManager.startListening();
    }
  };

  const handleSpeakCustom = async () => {
    if (voiceState.audioState === 'speaking') {
      frogeVoiceManager.pauseSpeaking();
    } else if (voiceState.audioState === 'paused') {
      frogeVoiceManager.resumeSpeaking();
    } else {
      setTtsProgress(0);
      await frogeVoiceManager.speak(customTtsText, {
        onProgress: (p) => setTtsProgress(p),
      });
    }
  };

  const handleReplayTts = async () => {
    setTtsProgress(0);
    await frogeVoiceManager.speak(customTtsText, {
      onProgress: (p) => setTtsProgress(p),
    });
  };

  const currentLang = getVoiceLanguageByCode(voiceState.selectedLanguage);

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 rounded-2xl shadow-sm border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold tracking-wide uppercase mb-2 border border-emerald-400/30">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Provider-Independent Voice Architecture
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              FROGÉ Universal Speech Engine
            </h2>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Provider-independent voice layer orchestrating microphone input, speech-to-text (STT),
              text-to-speech (TTS), play/pause/replay state machines, 15 international languages, and
              development fallback placeholders with zero fake functionality.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTestSuite}
              disabled={isRunningSuite}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <Award className={`w-4 h-4 ${isRunningSuite ? 'animate-spin' : ''}`} />
              {isRunningSuite ? 'Running 8 Tests...' : 'Run 8-Point Voice Test Suite'}
            </button>
          </div>
        </div>

        {/* Live Audio State Strip */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2 text-[11px] text-slate-300 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">State:</span>
            <span
              className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                voiceState.audioState === 'listening'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 animate-pulse'
                  : voiceState.audioState === 'speaking'
                  ? 'bg-teal-500/30 text-teal-300 border border-teal-400/30'
                  : voiceState.audioState === 'paused'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-400/30'
                  : voiceState.audioState === 'error'
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-400/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {voiceState.audioState}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>{currentLang.flag} {currentLang.label}</span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 font-mono">Rate: {voiceState.playbackRate}x</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-medium">{voiceState.activeProvider}</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold overflow-x-auto border border-slate-200">
        <button
          onClick={() => setActiveSubTab('diagnostics')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'diagnostics' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Hardware & Diagnostics
        </button>
        <button
          onClick={() => setActiveSubTab('stt-tester')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'stt-tester' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mic className="w-3.5 h-3.5 text-teal-600" />
          Speech-to-Text (STT)
        </button>
        <button
          onClick={() => setActiveSubTab('tts-tester')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'tts-tester' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
          Text-to-Speech (Play/Pause/Replay)
        </button>
        <button
          onClick={() => setActiveSubTab('languages')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'languages' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-sky-600" />
          Languages ({SUPPORTED_VOICE_LANGUAGES.length})
        </button>
        <button
          onClick={() => setActiveSubTab('error-sim')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'error-sim' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Permission & Error Testing
        </button>
        <button
          onClick={() => setActiveSubTab('test-suite')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'test-suite' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          Automated Suite {testSummary ? `(${testSummary.passed}/${testSummary.total})` : '(8 Points)'}
        </button>
      </div>

      {/* 1. HARDWARE & DIAGNOSTICS TAB */}
      {activeSubTab === 'diagnostics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Microphone Hardware</span>
                {hardwareDiag?.hasMicHardware ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <p className="text-lg font-bold text-slate-900">
                {hardwareDiag?.hasMicHardware ? 'Detected' : 'Not Enumerated / Prompt'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {hardwareDiag?.availableInputDevicesCount ?? 0} audio input device(s) found in navigator.mediaDevices.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Native Speech APIs</span>
                {hardwareDiag?.speechRecognitionSupported && hardwareDiag?.speechSynthesisSupported ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <p className="text-lg font-bold text-slate-900">
                {hardwareDiag?.speechRecognitionSupported ? 'STT Ready' : 'STT Fallback'} / {hardwareDiag?.speechSynthesisSupported ? 'TTS Ready' : 'TTS Fallback'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Standard Web Speech API (SpeechRecognition + SpeechSynthesisUtterance).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Credential Strategy</span>
                <Server className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-lg font-bold text-teal-700 capitalize">
                {voiceState.credentialStatus.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Native browser Web Speech handles live audio; missing cloud keys yield clear dev placeholders without fake mocks.
              </p>
            </div>
          </div>

          {/* Provider Independence Architecture Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                Decoupled Provider-Independent Interfaces
              </h4>
              <button
                onClick={runHardwareDiagnostics}
                disabled={isDiagnosing}
                className="text-xs text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isDiagnosing ? 'animate-spin' : ''}`} />
                Re-diagnose
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-emerald-600" /> ISpeechToTextProvider
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-mono">
                    {voiceState.activeProvider}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Decoupled contract for starting continuous/interim audio stream recognition, permission queries, error diagnostics, and audio amplitude telemetry.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" /> ITextToSpeechProvider
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono">
                    {voiceState.activeProvider}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Decoupled contract for synthesized spoken audio supporting play, pause, resume, replay, rate clamping (0.5x-2.0x), and voice speaker cataloging.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SPEECH-TO-TEXT (STT) TESTER TAB */}
      {activeSubTab === 'stt-tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-emerald-600" />
              Microphone Speech-to-Text Input
            </h3>

            {/* Language Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Active Speech Recognition Language
              </label>
              <select
                value={voiceState.selectedLanguage}
                onChange={(e) => frogeVoiceManager.setLanguage(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
              >
                {SUPPORTED_VOICE_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Mic Toggle Button & Visualizer */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-3">
              {/* Dynamic Waveform Visualizer */}
              <div className="flex items-center gap-1 h-12">
                {[30, 60, 90, 70, 100, 80, 50, 95, 65, 85, 45, 75].map((h, i) => {
                  const dynamicHeight = voiceState.audioState === 'listening'
                    ? Math.max(10, Math.min(100, h * (audioLevel > 0 ? audioLevel * 1.5 : 0.4)))
                    : 8;
                  return (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-100 ${
                        voiceState.audioState === 'listening'
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                          : 'bg-slate-300'
                      }`}
                      style={{ height: `${dynamicHeight}%` }}
                    />
                  );
                })}
              </div>

              <button
                id="btn-voice-tab-mic-toggle"
                onClick={handleToggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                  voiceState.audioState === 'listening'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 ring-rose-100 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200'
                }`}
                title={voiceState.audioState === 'listening' ? 'Stop Recording' : 'Start Recording'}
              >
                {voiceState.audioState === 'listening' ? (
                  <MicOff className="w-7 h-7" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
              </button>

              <span className="text-xs font-semibold text-slate-600">
                {voiceState.audioState === 'listening'
                  ? `Listening in ${currentLang.label}... Speak now!`
                  : 'Click microphone to begin real-time speech recognition'}
              </span>
            </div>

            {/* Error Banner if applicable */}
            {voiceState.lastError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{voiceState.lastError.message}</span>
                </div>
                <p className="text-rose-700 text-[11px] leading-relaxed">
                  {voiceState.lastError.userFacingGuide}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Real-time Transcript Output */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 shadow-2xs space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Live STT Stream & Telemetry
              </span>
              {voiceState.currentTranscript && (
                <button
                  onClick={() => frogeVoiceManager.clearTranscript()}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 min-h-[140px] text-slate-200 leading-relaxed overflow-y-auto">
              {voiceState.currentTranscript ? (
                <p className="whitespace-pre-wrap">{voiceState.currentTranscript}</p>
              ) : (
                <span className="text-slate-600 italic">
                  Spoken transcript will appear here in real-time as words are recognized...
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-2 border-t border-slate-800">
              <div>Language: <span className="text-emerald-400 font-bold">{voiceState.selectedLanguage}</span></div>
              <div>Audio Level: <span className="text-teal-400 font-bold">{Math.round(audioLevel * 100)}%</span></div>
              <div>Provider: <span className="text-sky-400 font-bold">{voiceState.activeProvider}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TEXT-TO-SPEECH (TTS) TESTER TAB */}
      {activeSubTab === 'tts-tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              TTS Playback Controls (Play / Pause / Replay)
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Text to Synthesize
              </label>
              <textarea
                rows={4}
                value={customTtsText}
                onChange={(e) => setCustomTtsText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 leading-relaxed font-mono"
              />
            </div>

            {/* Playback Speed Slider */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Speech Rate</span>
                <span className="font-mono font-bold text-indigo-600">{voiceState.playbackRate}x</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">0.5x</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.25"
                  value={voiceState.playbackRate}
                  onChange={(e) => frogeVoiceManager.setPlaybackRate(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-[10px] text-slate-400 font-mono">2.0x</span>
              </div>
            </div>

            {/* Play / Pause / Replay Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                id="btn-voice-tab-play"
                onClick={handleSpeakCustom}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                  voiceState.audioState === 'speaking'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {voiceState.audioState === 'speaking' ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </>
                ) : voiceState.audioState === 'paused' ? (
                  <>
                    <Play className="w-3.5 h-3.5" /> Resume
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Play
                  </>
                )}
              </button>

              <button
                id="btn-voice-tab-replay"
                onClick={handleReplayTts}
                className="py-2 px-3 rounded-xl font-bold text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Replay
              </button>

              <button
                id="btn-voice-tab-stop"
                onClick={() => frogeVoiceManager.stopSpeaking()}
                className="py-2 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <VolumeX className="w-3.5 h-3.5" /> Stop
              </button>
            </div>
          </div>

          {/* Right Column: Pre-configured Multi-language Phrases */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              Quick Multi-Language Speech Demos
            </h4>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 text-xs">
              {SUPPORTED_VOICE_LANGUAGES.slice(0, 7).map((lang) => (
                <div
                  key={lang.code}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 text-[11px]">
                      {lang.flag} {lang.label}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {lang.samplePhrase}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCustomTtsText(lang.samplePhrase);
                      frogeVoiceManager.setLanguage(lang.code);
                      frogeVoiceManager.speak(lang.samplePhrase, { language: lang.code });
                    }}
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg shrink-0 transition-colors"
                    title={`Speak in ${lang.label}`}
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. LANGUAGES CATALOG TAB */}
      {activeSubTab === 'languages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Supported Global Voice Languages ({SUPPORTED_VOICE_LANGUAGES.length})
            </h3>
            <span className="text-xs text-slate-500">
              Active: <strong className="text-emerald-700">{currentLang.flag} {currentLang.label}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SUPPORTED_VOICE_LANGUAGES.map((lang) => {
              const isSelected = voiceState.selectedLanguage === lang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => frogeVoiceManager.setLanguage(lang.code)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/20 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{lang.flag}</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                      {lang.code}
                    </span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">{lang.label}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">{lang.nativeName}</p>
                  <p className="text-[10px] text-slate-600 italic mt-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                    &quot;{lang.samplePhrase}&quot;
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. PERMISSION & ERROR TESTING TAB */}
      {activeSubTab === 'error-sim' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Microphone Permission & Hardware Error Simulator
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verify how the application reacts to permission denials, disconnected audio hardware, or missing
              cloud voice credentials in a safe, deterministic test harness.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Simulator 1: Permission Denied */}
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                <span className="text-xs font-bold text-slate-900 block">1. Permission-Denied State</span>
                <p className="text-[11px] text-slate-600">
                  Simulates user blocking microphone permission in browser settings.
                </p>
                <button
                  onClick={() => frogeVoiceManager.simulatePermissionDenied(true)}
                  className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                >
                  Simulate Denial
                </button>
              </div>

              {/* Simulator 2: Hardware Unavailable */}
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                <span className="text-xs font-bold text-slate-900 block">2. Hardware Disconnected</span>
                <p className="text-[11px] text-slate-600">
                  Simulates no audio input device found or device busy error.
                </p>
                <button
                  onClick={() => frogeVoiceManager.simulateMicrophoneUnavailable(true)}
                  className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                >
                  Simulate No Mic
                </button>
              </div>

              {/* Simulator 3: Reset */}
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                <span className="text-xs font-bold text-slate-900 block">3. Reset Hardware State</span>
                <p className="text-[11px] text-slate-600">
                  Restores normal browser permission queries and idle state.
                </p>
                <button
                  onClick={() => frogeVoiceManager.resetAll()}
                  className="w-full py-1.5 px-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>

            {/* Current Active Error Diagnostic */}
            {voiceState.lastError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-950">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Active Diagnostic: {voiceState.lastError.code}</span>
                </div>
                <p className="text-rose-800 font-mono text-[11px]">{voiceState.lastError.message}</p>
                <p className="text-rose-900 font-semibold text-[11px] bg-white/80 p-2 rounded border border-rose-200/60">
                  💡 Guide: {voiceState.lastError.userFacingGuide}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. AUTOMATED TEST SUITE TAB */}
      {activeSubTab === 'test-suite' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              8-Point Automated Voice Architecture Regression Test Suite
            </h3>
            <button
              onClick={handleRunTestSuite}
              disabled={isRunningSuite}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <Award className={`w-3.5 h-3.5 ${isRunningSuite ? 'animate-spin' : ''}`} />
              {isRunningSuite ? 'Executing Suite...' : 'Re-run 8 Tests'}
            </button>
          </div>

          {testSummary ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Test Suite Status</span>
                  <p className="text-xl font-bold text-emerald-400">
                    {testSummary.passed} / {testSummary.total} Tests Passed ({testSummary.passRate})
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">{testSummary.durationMs}ms</span>
              </div>

              <div className="space-y-2">
                {(testSummary.results || []).map((r) => (
                  <div
                    key={r.id}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                      r.passed ? 'bg-white border-emerald-200' : 'bg-rose-50 border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {r.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900">{r.testName}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-600">
                        {r.durationMs}ms
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] pl-6 leading-relaxed">
                      {r.assertionMessage}
                    </p>
                    {r.details && (
                      <p className="text-slate-400 text-[10px] pl-6 font-mono">
                        {r.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
              <Award className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <p className="font-semibold text-slate-700">Voice regression test suite ready to run.</p>
              <p className="mt-1">
                Click &quot;Run 8-Point Voice Test Suite&quot; above to verify STT/TTS abstractions, multi-language catalog, and hardware error transitions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
