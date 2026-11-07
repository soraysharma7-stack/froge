/**
 * FROGÉ Brain - Development Placeholder Voice Provider
 *
 * Provider-independent fallback when cloud voice credentials (e.g. ElevenLabs,
 * Google Cloud Speech-to-Text API key, or custom WebSocket servers) are unconfigured.
 *
 * Policy: Provides explicit diagnostic notices rather than fake functionality.
 */

import {
  ISpeechToTextProvider,
  ITextToSpeechProvider,
  STTEventListenerMap,
} from '../interfaces';
import {
  VoiceProviderType,
  VoiceCredentialStatus,
  VoicePermissionState,
  VoiceSpeakerProfile,
  TTSPlaybackOptions,
  VoiceErrorDiagnostic,
} from '../types';

export class DevPlaceholderVoiceProvider
  implements ISpeechToTextProvider, ITextToSpeechProvider
{
  readonly id = 'dev-placeholder-voice';
  readonly name = 'FROGÉ Dev Voice Placeholder';
  readonly providerType: VoiceProviderType = 'dev_placeholder';

  private _isListening = false;
  private _isSpeaking = false;
  private _isPaused = false;
  private lastSpokenText: string = '';
  private missingCredentialName: string = 'CLOUD_SPEECH_API_KEY';

  constructor(missingCredentialName = 'CLOUD_SPEECH_API_KEY') {
    this.missingCredentialName = missingCredentialName;
  }

  isSupported(): boolean {
    return true;
  }

  getCredentialStatus(): VoiceCredentialStatus {
    return 'cloud_credentials_missing';
  }

  async checkPermission(): Promise<VoicePermissionState> {
    return 'prompt';
  }

  async requestPermission(): Promise<VoicePermissionState> {
    return 'granted';
  }

  async startListening(
    language: string,
    listeners: STTEventListenerMap
  ): Promise<boolean> {
    this._isListening = true;
    listeners.onStart?.();

    // Trigger explicit diagnostic notice
    const diag: VoiceErrorDiagnostic = {
      code: 'credentials-missing',
      message: `External cloud voice STT credentials (${this.missingCredentialName}) are not configured in this environment.`,
      userFacingGuide:
        'FROGÉ falls back to native Web Speech API if available in your browser. To use cloud HD transcription, configure the appropriate API credentials in environment settings.',
      recoverable: true,
    };

    setTimeout(() => {
      listeners.onError?.(diag);
      this._isListening = false;
      listeners.onEnd?.();
    }, 400);

    return true;
  }

  stopListening(): void {
    this._isListening = false;
  }

  abortListening(): void {
    this._isListening = false;
  }

  isListening(): boolean {
    return this._isListening;
  }

  async getAvailableVoices(language?: string): Promise<VoiceSpeakerProfile[]> {
    return [
      {
        id: 'dev-placeholder-voice-1',
        name: 'Dev Diagnostic Voice (No Cloud Credentials)',
        lang: language || 'en-US',
        gender: 'neutral',
        provider: 'dev_placeholder',
        isDefault: true,
      },
    ];
  }

  async speak(text: string, options?: TTSPlaybackOptions): Promise<boolean> {
    this.lastSpokenText = text;
    this._isSpeaking = true;
    this._isPaused = false;
    options?.onStart?.();

    options?.onError?.(
      `[Dev Placeholder Notice]: Cloud TTS credentials (${this.missingCredentialName}) not found. Using browser Web Speech Synthesis fallback.`
    );

    setTimeout(() => {
      this._isSpeaking = false;
      options?.onEnd?.();
    }, 600);

    return true;
  }

  pause(): void {
    if (this._isSpeaking) {
      this._isPaused = true;
    }
  }

  resume(): void {
    if (this._isPaused) {
      this._isPaused = false;
    }
  }

  stop(): void {
    this._isSpeaking = false;
    this._isPaused = false;
  }

  async replay(): Promise<boolean> {
    return this.speak(this.lastSpokenText);
  }

  isSpeaking(): boolean {
    return this._isSpeaking;
  }

  isPaused(): boolean {
    return this._isPaused;
  }
}
