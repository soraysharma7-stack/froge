/**
 * FROGÉ Brain - Provider-Independent Speech Interfaces
 *
 * All STT and TTS engines (Web Speech API, Cloud Providers, FROGÉ Multimodal,
 * and Dev Placeholders) adhere strictly to these decoupled interfaces.
 */

import {
  VoiceLanguage,
  VoiceAudioState,
  VoicePermissionState,
  VoiceCredentialStatus,
  VoiceSpeakerProfile,
  STTResult,
  TTSPlaybackOptions,
  VoiceErrorDiagnostic,
  VoiceProviderType,
} from './types';

export interface STTEventListenerMap {
  onStart?: () => void;
  onResult?: (result: STTResult) => void;
  onError?: (diagnostic: VoiceErrorDiagnostic) => void;
  onEnd?: () => void;
  onAudioLevel?: (level: number) => void; // 0.0 - 1.0
}

export interface ISpeechToTextProvider {
  readonly id: string;
  readonly name: string;
  readonly providerType: VoiceProviderType;

  isSupported(): boolean;
  getCredentialStatus(): VoiceCredentialStatus;
  checkPermission(): Promise<VoicePermissionState>;
  requestPermission(): Promise<VoicePermissionState>;

  startListening(
    language: string,
    listeners: STTEventListenerMap
  ): Promise<boolean>;

  stopListening(): void;
  abortListening(): void;
  isListening(): boolean;
}

export interface ITextToSpeechProvider {
  readonly id: string;
  readonly name: string;
  readonly providerType: VoiceProviderType;

  isSupported(): boolean;
  getCredentialStatus(): VoiceCredentialStatus;
  getAvailableVoices(language?: string): Promise<VoiceSpeakerProfile[]>;

  speak(text: string, options?: TTSPlaybackOptions): Promise<boolean>;
  pause(): void;
  resume(): void;
  stop(): void;
  replay(): Promise<boolean>;

  isSpeaking(): boolean;
  isPaused(): boolean;
}

export interface IVoiceHardwareInspector {
  isMicrophoneHardwareAvailable(): Promise<boolean>;
  isWebAudioSupported(): boolean;
  isSpeechRecognitionSupported(): boolean;
  isSpeechSynthesisSupported(): boolean;
  diagnoseEnvironment(): Promise<{
    hasMicHardware: boolean;
    speechRecognitionSupported: boolean;
    speechSynthesisSupported: boolean;
    permission: VoicePermissionState;
    availableInputDevicesCount: number;
    diagnostics: string[];
  }>;
}
