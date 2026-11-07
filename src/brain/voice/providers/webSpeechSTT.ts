/**
 * FROGÉ Brain - Web Speech API STT Provider
 *
 * Provider-independent implementation of Speech-to-Text using standard
 * browser SpeechRecognition / webkitSpeechRecognition and MediaDevices.
 */

import { ISpeechToTextProvider, STTEventListenerMap } from '../interfaces';
import {
  VoiceProviderType,
  VoiceCredentialStatus,
  VoicePermissionState,
  VoiceErrorDiagnostic,
  STTResult,
} from '../types';

export class WebSpeechSTTProvider implements ISpeechToTextProvider {
  readonly id = 'web-speech-stt';
  readonly name = 'Native Web Speech STT';
  readonly providerType: VoiceProviderType = 'web_speech';

  private recognition: any = null;
  private activeListeners: STTEventListenerMap | null = null;
  private _isListening: boolean = false;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private currentLanguage: string = 'en-US';

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  getCredentialStatus(): VoiceCredentialStatus {
    return 'native_web_speech';
  }

  async checkPermission(): Promise<VoicePermissionState> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return 'unsupported';
    }

    try {
      if (navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (status.state === 'granted') return 'granted';
        if (status.state === 'denied') return 'denied';
        return 'prompt';
      }
    } catch {
      // permissions API might not support microphone in some browsers
    }

    return 'prompt';
  }

  async requestPermission(): Promise<VoicePermissionState> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return 'unsupported';
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release immediately after verification
      stream.getTracks().forEach((track) => track.stop());
      return 'granted';
    } catch (err: any) {
      const errorName = err?.name || '';
      if (
        errorName === 'NotAllowedError' ||
        errorName === 'PermissionDeniedError'
      ) {
        return 'denied';
      }
      if (
        errorName === 'NotFoundError' ||
        errorName === 'DevicesNotFoundError'
      ) {
        return 'unavailable';
      }
      return 'denied';
    }
  }

  private startAudioLevelMonitoring(listeners: STTEventListenerMap) {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaStream = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;

        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const checkLevel = () => {
          if (!this._isListening || !this.analyser) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(1.0, avg / 128);
          listeners.onAudioLevel?.(normalized);
          this.animFrameId = requestAnimationFrame(checkLevel);
        };
        checkLevel();
      })
      .catch((e) => {
        console.warn('Microphone audio level monitoring unavailable:', e);
      });
  }

  private stopAudioLevelMonitoring() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    this.analyser = null;
  }

  async startListening(
    language: string,
    listeners: STTEventListenerMap
  ): Promise<boolean> {
    if (!this.isSupported()) {
      listeners.onError?.({
        code: 'not-supported',
        message: 'Web Speech Recognition API is not supported in this browser.',
        userFacingGuide: 'Please use Chrome, Edge, Safari, or provide text input directly.',
        recoverable: false,
      });
      return false;
    }

    // Stop any existing instance
    this.stopListening();

    this.activeListeners = listeners;
    this.currentLanguage = language;

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = language;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this._isListening = true;
        listeners.onStart?.();
        this.startAudioLevelMonitoring(listeners);
      };

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let maxConfidence = 0.85;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const transcriptPiece = res[0].transcript;
          if (res.isFinal) {
            finalTranscript += transcriptPiece;
            if (res[0].confidence) {
              maxConfidence = res[0].confidence;
            }
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        const combinedText = (finalTranscript || interimTranscript).trim();
        if (combinedText) {
          const result: STTResult = {
            transcript: combinedText,
            isFinal: !!finalTranscript && !interimTranscript,
            confidence: maxConfidence,
            language: this.currentLanguage,
            timestamp: Date.now(),
          };
          listeners.onResult?.(result);
        }
      };

      this.recognition.onerror = (event: any) => {
        const errorType = event.error;
        let diag: VoiceErrorDiagnostic;

        switch (errorType) {
          case 'not-allowed':
          case 'permission-denied':
            diag = {
              code: 'not-allowed',
              message: 'Microphone permission was denied by the user or browser.',
              userFacingGuide: 'Click the camera/mic lock icon in your browser address bar to allow microphone access, then retry.',
              recoverable: true,
            };
            break;
          case 'audio-capture':
            diag = {
              code: 'audio-capture-failed',
              message: 'No microphone was detected or audio hardware is busy.',
              userFacingGuide: 'Check that a microphone is plugged in and not exclusively in use by another application.',
              recoverable: true,
            };
            break;
          case 'no-speech':
            diag = {
              code: 'no-speech',
              message: 'No speech was detected within the timeout window.',
              userFacingGuide: 'Speak clearly into your microphone when the pulsing indicator is active.',
              recoverable: true,
            };
            break;
          case 'network':
            diag = {
              code: 'network',
              message: 'Network communication to speech recognition service failed.',
              userFacingGuide: 'Check your internet connection or switch to offline voice input.',
              recoverable: true,
            };
            break;
          default:
            diag = {
              code: 'service-unavailable',
              message: `Speech recognition error: ${errorType || 'unknown'}`,
              userFacingGuide: 'Try restarting the recording or typing your query.',
              recoverable: true,
            };
            break;
        }

        listeners.onError?.(diag);
        this._isListening = false;
        this.stopAudioLevelMonitoring();
      };

      this.recognition.onend = () => {
        this._isListening = false;
        this.stopAudioLevelMonitoring();
        listeners.onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      listeners.onError?.({
        code: 'service-unavailable',
        message: err?.message || 'Failed to initialize speech recognition',
        userFacingGuide: 'Microphone initialization failed. Please reload the page or check device settings.',
        recoverable: true,
      });
      this._isListening = false;
      this.stopAudioLevelMonitoring();
      return false;
    }
  }

  stopListening(): void {
    this._isListening = false;
    this.stopAudioLevelMonitoring();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
  }

  abortListening(): void {
    this._isListening = false;
    this.stopAudioLevelMonitoring();
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }
  }

  isListening(): boolean {
    return this._isListening;
  }
}
