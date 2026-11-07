/**
 * FROGÉ Brain - Voice Architecture Types & Constants
 *
 * Provider-independent interfaces and data structures for Speech-to-Text (STT),
 * Text-to-Speech (TTS), audio streaming, language selection, and permission states.
 */

export type VoiceAudioState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'paused'
  | 'error';

export type VoicePermissionState =
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'unsupported';

export type VoiceCredentialStatus =
  | 'native_web_speech'
  | 'cloud_credentials_configured'
  | 'cloud_credentials_missing'
  | 'dev_placeholder';

export type VoiceProviderType =
  | 'web_speech'
  | 'froge_multimodal'
  | 'cloud_tts'
  | 'elevenlabs'
  | 'dev_placeholder';

export interface VoiceLanguage {
  code: string; // BCP 47 tag, e.g. 'en-US'
  label: string; // 'English (US)'
  nativeName: string; // 'English (United States)'
  flag: string; // Emoji or country icon
  samplePhrase: string;
  defaultTtsRate?: number;
}

export interface VoiceSpeakerProfile {
  id: string;
  name: string;
  lang: string;
  gender: 'female' | 'male' | 'neutral';
  provider: VoiceProviderType;
  isDefault?: boolean;
}

export interface STTResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  language: string;
  timestamp: number;
}

export interface TTSPlaybackOptions {
  rate?: number; // 0.5 - 2.0 (default 1.0)
  pitch?: number; // 0.5 - 1.5 (default 1.0)
  volume?: number; // 0.0 - 1.0 (default 1.0)
  language?: string; // BCP 47 code
  voiceId?: string; // Specific speaker profile id
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (error: Error | string) => void;
  onProgress?: (progress: number) => void; // 0.0 - 1.0
}

export interface VoiceErrorDiagnostic {
  code:
    | 'not-allowed'
    | 'no-speech'
    | 'audio-capture-failed'
    | 'network'
    | 'not-supported'
    | 'service-unavailable'
    | 'device-busy'
    | 'credentials-missing';
  message: string;
  userFacingGuide: string;
  recoverable: boolean;
}

export interface VoiceSessionState {
  audioState: VoiceAudioState;
  permissionState: VoicePermissionState;
  credentialStatus: VoiceCredentialStatus;
  selectedLanguage: string;
  activeProvider: VoiceProviderType;
  currentTranscript: string;
  interimTranscript: string;
  lastSpokenText: string;
  playbackRate: number;
  volumeLevel: number;
  lastError: VoiceErrorDiagnostic | null;
  history: Array<{
    id: string;
    type: 'stt' | 'tts';
    text: string;
    language: string;
    timestamp: number;
    durationMs?: number;
  }>;
}

export interface VoiceConfig {
  defaultLanguage: string;
  preferredTtsRate: number;
  preferredPitch: number;
  autoListenAfterSpeech: boolean;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  continuousListening: boolean;
}
