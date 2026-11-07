/**
 * FROGÉ Brain - Master Voice Service Registry & Hardware Inspector
 *
 * Central coordinator for:
 * - Provider-independent STT & TTS registration and fallback
 * - Hardware availability & permission inspection
 * - Multi-language preference management
 * - Play/Pause/Resume/Replay audio lifecycle
 * - Test harness states (permission-denied, mic-unavailable, missing credentials)
 */

import {
  ISpeechToTextProvider,
  ITextToSpeechProvider,
  IVoiceHardwareInspector,
  STTEventListenerMap,
} from './interfaces';
import {
  VoiceAudioState,
  VoicePermissionState,
  VoiceCredentialStatus,
  VoiceProviderType,
  VoiceLanguage,
  VoiceSessionState,
  VoiceConfig,
  VoiceErrorDiagnostic,
  STTResult,
  TTSPlaybackOptions,
} from './types';
import {
  SUPPORTED_VOICE_LANGUAGES,
  DEFAULT_VOICE_LANGUAGE,
  getVoiceLanguageByCode,
} from './languages';
import { WebSpeechSTTProvider } from './providers/webSpeechSTT';
import { WebSpeechTTSProvider } from './providers/webSpeechTTS';
import { DevPlaceholderVoiceProvider } from './providers/devPlaceholderProvider';

export class VoiceHardwareInspector implements IVoiceHardwareInspector {
  async isMicrophoneHardwareAvailable(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return false;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((d) => d.kind === 'audioinput');
    } catch {
      return false;
    }
  }

  isWebAudioSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  isSpeechSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined');
  }

  async diagnoseEnvironment(): Promise<{
    hasMicHardware: boolean;
    speechRecognitionSupported: boolean;
    speechSynthesisSupported: boolean;
    permission: VoicePermissionState;
    availableInputDevicesCount: number;
    diagnostics: string[];
  }> {
    const speechRecognitionSupported = this.isSpeechRecognitionSupported();
    const speechSynthesisSupported = this.isSpeechSynthesisSupported();
    let hasMicHardware = false;
    let availableInputDevicesCount = 0;
    let permission: VoicePermissionState = 'prompt';
    const diagnostics: string[] = [];

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter((d) => d.kind === 'audioinput');
        availableInputDevicesCount = inputs.length;
        hasMicHardware = inputs.length > 0;
      } catch (e: any) {
        diagnostics.push(`Hardware enumeration notice: ${e.message}`);
      }
    }

    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      try {
        const queryRes = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        permission = queryRes.state as VoicePermissionState;
      } catch {
        permission = 'prompt';
      }
    }

    if (!speechRecognitionSupported) {
      diagnostics.push('SpeechRecognition API not detected; cloud fallback or dev placeholder required.');
    }
    if (!speechSynthesisSupported) {
      diagnostics.push('SpeechSynthesis API not detected.');
    }
    if (!hasMicHardware && availableInputDevicesCount === 0) {
      diagnostics.push('No audio input devices found in system enumeration.');
    }

    return {
      hasMicHardware,
      speechRecognitionSupported,
      speechSynthesisSupported,
      permission,
      availableInputDevicesCount,
      diagnostics,
    };
  }
}

export class FrogeVoiceManager {
  private sttProviders: Map<VoiceProviderType, ISpeechToTextProvider> = new Map();
  private ttsProviders: Map<VoiceProviderType, ITextToSpeechProvider> = new Map();
  private activeSTTProvider: ISpeechToTextProvider;
  private activeTTSProvider: ITextToSpeechProvider;
  public hardwareInspector: VoiceHardwareInspector;

  private state: VoiceSessionState;
  private config: VoiceConfig;
  private listeners: Set<(state: VoiceSessionState) => void> = new Set();
  private audioLevelListeners: Set<(level: number) => void> = new Set();

  // Test simulation overrides
  private simulatedPermission: VoicePermissionState | null = null;
  private simulatedMicUnavailable: boolean = false;

  constructor() {
    this.hardwareInspector = new VoiceHardwareInspector();

    // Register default providers
    const webSTT = new WebSpeechSTTProvider();
    const webTTS = new WebSpeechTTSProvider();
    const devPlaceholder = new DevPlaceholderVoiceProvider();

    this.sttProviders.set('web_speech', webSTT);
    this.sttProviders.set('dev_placeholder', devPlaceholder);

    this.ttsProviders.set('web_speech', webTTS);
    this.ttsProviders.set('dev_placeholder', devPlaceholder);

    // Initial provider selection
    if (webSTT.isSupported()) {
      this.activeSTTProvider = webSTT;
    } else {
      this.activeSTTProvider = devPlaceholder;
    }

    if (webTTS.isSupported()) {
      this.activeTTSProvider = webTTS;
    } else {
      this.activeTTSProvider = devPlaceholder;
    }

    // Load persisted config or defaults
    const savedLanguage = typeof localStorage !== 'undefined'
      ? localStorage.getItem('froge_voice_language') || DEFAULT_VOICE_LANGUAGE.code
      : DEFAULT_VOICE_LANGUAGE.code;

    const savedRate = typeof localStorage !== 'undefined'
      ? parseFloat(localStorage.getItem('froge_voice_rate') || '1.0')
      : 1.0;

    this.config = {
      defaultLanguage: savedLanguage,
      preferredTtsRate: savedRate,
      preferredPitch: 1.0,
      autoListenAfterSpeech: false,
      noiseSuppression: true,
      echoCancellation: true,
      continuousListening: true,
    };

    this.state = {
      audioState: 'idle',
      permissionState: 'prompt',
      credentialStatus: this.activeSTTProvider.getCredentialStatus(),
      selectedLanguage: savedLanguage,
      activeProvider: this.activeSTTProvider.providerType,
      currentTranscript: '',
      interimTranscript: '',
      lastSpokenText: '',
      playbackRate: savedRate,
      volumeLevel: 1.0,
      lastError: null,
      history: [],
    };
  }

  // --- STATE & EVENT SUBSCRIPTION ---

  getState(): VoiceSessionState {
    return { ...this.state };
  }

  getConfig(): VoiceConfig {
    return { ...this.config };
  }

  subscribe(listener: (state: VoiceSessionState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeAudioLevel(listener: (level: number) => void): () => void {
    this.audioLevelListeners.add(listener);
    return () => {
      this.audioLevelListeners.delete(listener);
    };
  }

  private emitState(partial: Partial<VoiceSessionState>) {
    this.state = { ...this.state, ...partial };
    const snapshot = this.getState();
    this.listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (e) {
        console.error('Error in voice listener:', e);
      }
    });
  }

  private emitAudioLevel(level: number) {
    this.audioLevelListeners.forEach((fn) => {
      try {
        fn(level);
      } catch (e) {
        console.error('Error in audio level listener:', e);
      }
    });
  }

  // --- PROVIDER REGISTRATION & SELECTION ---

  registerSTTProvider(provider: ISpeechToTextProvider) {
    this.sttProviders.set(provider.providerType, provider);
  }

  registerTTSProvider(provider: ITextToSpeechProvider) {
    this.ttsProviders.set(provider.providerType, provider);
  }

  setProvider(providerType: VoiceProviderType) {
    const stt = this.sttProviders.get(providerType);
    const tts = this.ttsProviders.get(providerType);

    if (stt) this.activeSTTProvider = stt;
    if (tts) this.activeTTSProvider = tts;

    this.emitState({
      activeProvider: providerType,
      credentialStatus: this.activeSTTProvider.getCredentialStatus(),
    });
  }

  // --- LANGUAGE MANAGEMENT ---

  setLanguage(languageCode: string) {
    const lang = getVoiceLanguageByCode(languageCode);
    this.config.defaultLanguage = lang.code;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('froge_voice_language', lang.code);
    }
    this.emitState({ selectedLanguage: lang.code });
  }

  getSelectedLanguage(): VoiceLanguage {
    return getVoiceLanguageByCode(this.state.selectedLanguage);
  }

  getAllSupportedLanguages(): VoiceLanguage[] {
    return SUPPORTED_VOICE_LANGUAGES;
  }

  // --- PLAYBACK RATE & VOLUME ---

  setPlaybackRate(rate: number) {
    const clamped = Math.max(0.5, Math.min(2.0, rate));
    this.config.preferredTtsRate = clamped;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('froge_voice_rate', clamped.toString());
    }
    this.emitState({ playbackRate: clamped });
  }

  // --- PERMISSION & HARDWARE INSPECTION ---

  async checkPermission(): Promise<VoicePermissionState> {
    if (this.simulatedPermission) {
      this.emitState({ permissionState: this.simulatedPermission });
      return this.simulatedPermission;
    }
    const perm = await this.activeSTTProvider.checkPermission();
    this.emitState({ permissionState: perm });
    return perm;
  }

  async requestPermission(): Promise<VoicePermissionState> {
    if (this.simulatedPermission) {
      this.emitState({ permissionState: this.simulatedPermission });
      return this.simulatedPermission;
    }
    if (this.simulatedMicUnavailable) {
      const diag: VoiceErrorDiagnostic = {
        code: 'audio-capture-failed',
        message: 'No microphone input hardware was detected on this device.',
        userFacingGuide: 'Please attach a microphone or check your system audio settings.',
        recoverable: true,
      };
      this.emitState({
        permissionState: 'unavailable',
        audioState: 'error',
        lastError: diag,
      });
      return 'unavailable';
    }

    const perm = await this.activeSTTProvider.requestPermission();
    this.emitState({ permissionState: perm });
    return perm;
  }

  // --- SPEECH-TO-TEXT (STT) WORKFLOW ---

  async startListening(): Promise<boolean> {
    if (this.state.audioState === 'speaking') {
      this.stopSpeaking();
    }

    // Check simulated test states first
    if (this.simulatedPermission === 'denied') {
      const diag: VoiceErrorDiagnostic = {
        code: 'not-allowed',
        message: 'Microphone permission was denied (simulated test state).',
        userFacingGuide: 'Click the camera/mic lock icon in your address bar to permit audio input.',
        recoverable: true,
      };
      this.emitState({
        audioState: 'error',
        permissionState: 'denied',
        lastError: diag,
      });
      return false;
    }

    if (this.simulatedMicUnavailable) {
      const diag: VoiceErrorDiagnostic = {
        code: 'audio-capture-failed',
        message: 'Microphone hardware unavailable or disconnected (simulated test state).',
        userFacingGuide: 'Check that a microphone is plugged in and recognized by your operating system.',
        recoverable: true,
      };
      this.emitState({
        audioState: 'error',
        permissionState: 'unavailable',
        lastError: diag,
      });
      return false;
    }

    this.emitState({
      audioState: 'listening',
      currentTranscript: '',
      interimTranscript: '',
      lastError: null,
    });

    const listeners: STTEventListenerMap = {
      onStart: () => {
        this.emitState({ audioState: 'listening', lastError: null });
      },
      onResult: (res: STTResult) => {
        this.emitState({
          currentTranscript: res.transcript,
          interimTranscript: res.isFinal ? '' : res.transcript,
          audioState: 'listening',
        });
      },
      onError: (diag: VoiceErrorDiagnostic) => {
        this.emitState({
          audioState: 'error',
          lastError: diag,
          permissionState: diag.code === 'not-allowed' ? 'denied' : this.state.permissionState,
        });
      },
      onEnd: () => {
        if (this.state.audioState === 'listening') {
          this.emitState({ audioState: 'idle' });
        }
      },
      onAudioLevel: (lvl: number) => {
        this.emitAudioLevel(lvl);
      },
    };

    return this.activeSTTProvider.startListening(this.state.selectedLanguage, listeners);
  }

  stopListening() {
    this.activeSTTProvider.stopListening();
    this.emitState({ audioState: 'idle' });
    this.emitAudioLevel(0);
  }

  abortListening() {
    this.activeSTTProvider.abortListening();
    this.emitState({ audioState: 'idle', currentTranscript: '', interimTranscript: '' });
    this.emitAudioLevel(0);
  }

  clearTranscript() {
    this.emitState({ currentTranscript: '', interimTranscript: '' });
  }

  setTranscript(text: string) {
    this.emitState({ currentTranscript: text });
  }

  // --- TEXT-TO-SPEECH (TTS) WORKFLOW ---

  async speak(text: string, options?: Partial<TTSPlaybackOptions>): Promise<boolean> {
    if (this.state.audioState === 'listening') {
      this.stopListening();
    }

    this.emitState({
      audioState: 'speaking',
      lastSpokenText: text,
      lastError: null,
    });

    const mergedOptions: TTSPlaybackOptions = {
      rate: options?.rate ?? this.state.playbackRate,
      pitch: options?.pitch ?? this.config.preferredPitch,
      volume: options?.volume ?? this.state.volumeLevel,
      language: options?.language ?? this.state.selectedLanguage,
      voiceId: options?.voiceId,
      onStart: () => {
        this.emitState({ audioState: 'speaking' });
        options?.onStart?.();
      },
      onPause: () => {
        this.emitState({ audioState: 'paused' });
        options?.onPause?.();
      },
      onResume: () => {
        this.emitState({ audioState: 'speaking' });
        options?.onResume?.();
      },
      onEnd: () => {
        this.emitState({ audioState: 'idle' });
        options?.onEnd?.();
        // Log speech history
        this.state.history.unshift({
          id: `tts_${Date.now()}`,
          type: 'tts',
          text: text.slice(0, 150),
          language: this.state.selectedLanguage,
          timestamp: Date.now(),
        });
      },
      onError: (err) => {
        const msg = typeof err === 'string' ? err : err.message;
        this.emitState({
          audioState: 'error',
          lastError: {
            code: 'service-unavailable',
            message: msg,
            userFacingGuide: 'Speech synthesis error occurred. Retrying or selecting another voice may help.',
            recoverable: true,
          },
        });
        options?.onError?.(err);
      },
      onProgress: (p) => {
        options?.onProgress?.(p);
      },
    };

    return this.activeTTSProvider.speak(text, mergedOptions);
  }

  pauseSpeaking() {
    this.activeTTSProvider.pause();
    this.emitState({ audioState: 'paused' });
  }

  resumeSpeaking() {
    this.activeTTSProvider.resume();
    this.emitState({ audioState: 'speaking' });
  }

  stopSpeaking() {
    this.activeTTSProvider.stop();
    this.emitState({ audioState: 'idle' });
  }

  async replay(): Promise<boolean> {
    if (!this.state.lastSpokenText) return false;
    return this.speak(this.state.lastSpokenText);
  }

  // --- TEST SIMULATION HOOKS ---

  simulatePermissionDenied(enabled: boolean) {
    this.simulatedPermission = enabled ? 'denied' : null;
    if (enabled) {
      this.emitState({
        permissionState: 'denied',
        lastError: {
          code: 'not-allowed',
          message: 'Microphone permission denied (Simulated for automated test verification).',
          userFacingGuide: 'In test mode: toggle off simulated denial in the test console.',
          recoverable: true,
        },
      });
    } else {
      this.emitState({ permissionState: 'prompt', lastError: null });
    }
  }

  simulateMicrophoneUnavailable(enabled: boolean) {
    this.simulatedMicUnavailable = enabled;
    if (enabled) {
      this.emitState({
        permissionState: 'unavailable',
        audioState: 'error',
        lastError: {
          code: 'audio-capture-failed',
          message: 'Microphone input hardware disconnected (Simulated test state).',
          userFacingGuide: 'In test mode: toggle off simulated hardware error.',
          recoverable: true,
        },
      });
    } else {
      this.emitState({ permissionState: 'prompt', lastError: null });
    }
  }

  resetAll() {
    this.stopListening();
    this.stopSpeaking();
    this.simulatedPermission = null;
    this.simulatedMicUnavailable = false;
    this.emitState({
      audioState: 'idle',
      permissionState: 'prompt',
      currentTranscript: '',
      interimTranscript: '',
      lastError: null,
    });
  }
}

// Global Singleton Instance
export const frogeVoiceManager = new FrogeVoiceManager();
