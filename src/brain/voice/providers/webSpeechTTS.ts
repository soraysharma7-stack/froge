/**
 * FROGÉ Brain - Web Speech API TTS Provider
 *
 * Provider-independent implementation of Text-to-Speech using standard
 * browser window.speechSynthesis, supporting Play, Pause, Resume, Replay, Rate, and Voice selection.
 */

import { ITextToSpeechProvider } from '../interfaces';
import {
  VoiceProviderType,
  VoiceCredentialStatus,
  VoiceSpeakerProfile,
  TTSPlaybackOptions,
} from '../types';

export class WebSpeechTTSProvider implements ITextToSpeechProvider {
  readonly id = 'web-speech-tts';
  readonly name = 'Native Web Speech Synthesis';
  readonly providerType: VoiceProviderType = 'web_speech';

  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private lastSpokenText: string = '';
  private lastOptions: TTSPlaybackOptions | undefined = undefined;
  private _isPaused: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];
    this.cachedVoices = window.speechSynthesis.getVoices();
    return this.cachedVoices;
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined';
  }

  getCredentialStatus(): VoiceCredentialStatus {
    return 'native_web_speech';
  }

  async getAvailableVoices(language?: string): Promise<VoiceSpeakerProfile[]> {
    if (!this.isSupported()) return [];
    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : this.loadVoices();

    const filtered = language
      ? voices.filter((v) => v.lang.toLowerCase().startsWith(language.slice(0, 2).toLowerCase()))
      : voices;

    return (filtered.length > 0 ? filtered : voices).map((v) => ({
      id: v.voiceURI || v.name,
      name: v.name,
      lang: v.lang,
      gender: v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('zira')
        ? 'female'
        : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david')
        ? 'male'
        : 'neutral',
      provider: 'web_speech',
      isDefault: v.default,
    }));
  }

  /**
   * Sanitizes markdown artifacts and code blocks for fluid spoken voice.
   */
  private cleanTextForAudio(text: string): string {
    return text
      // Replace code blocks with concise descriptions
      .replace(/```[\w-]*\n([\s\S]*?)```/g, 'Code block omitted for audio.')
      // Strip inline code backticks
      .replace(/`([^`]+)`/g, '$1')
      // Strip markdown headers, bold, italics, links, lists
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/~~([^~]+)~~/g, '$1')
      .replace(/>\s+/gm, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  async speak(text: string, options?: TTSPlaybackOptions): Promise<boolean> {
    if (!this.isSupported()) {
      options?.onError?.(new Error('SpeechSynthesis is not supported in this browser environment.'));
      return false;
    }

    const cleanText = this.cleanTextForAudio(text);
    if (!cleanText) {
      options?.onError?.(new Error('Text content was empty after formatting.'));
      return false;
    }

    this.stop(); // Stop any active speech
    this.lastSpokenText = text;
    this.lastOptions = options;
    this._isPaused = false;

    return new Promise((resolve) => {
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        this.currentUtterance = utterance;

        utterance.rate = options?.rate ?? 1.0;
        utterance.pitch = options?.pitch ?? 1.0;
        utterance.volume = options?.volume ?? 1.0;

        const lang = options?.language || 'en-US';
        utterance.lang = lang;

        // Select best matching voice
        const voices = this.cachedVoices.length > 0 ? this.cachedVoices : this.loadVoices();
        if (options?.voiceId) {
          const match = voices.find((v) => (v.voiceURI || v.name) === options.voiceId);
          if (match) utterance.voice = match;
        } else {
          const langMatch = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase());
          if (langMatch) utterance.voice = langMatch;
        }

        utterance.onstart = () => {
          this._isPaused = false;
          options?.onStart?.();
        };

        utterance.onpause = () => {
          this._isPaused = true;
          options?.onPause?.();
        };

        utterance.onresume = () => {
          this._isPaused = false;
          options?.onResume?.();
        };

        utterance.onend = () => {
          this._isPaused = false;
          this.currentUtterance = null;
          options?.onEnd?.();
          resolve(true);
        };

        utterance.onerror = (e: any) => {
          this._isPaused = false;
          this.currentUtterance = null;
          // Canceled is standard when stopping manually
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            options?.onError?.(new Error(`TTS Error: ${e.error || 'Playback failed'}`));
          }
          resolve(false);
        };

        utterance.onboundary = (e: any) => {
          if (cleanText.length > 0 && e.charIndex !== undefined) {
            const progress = Math.min(1.0, e.charIndex / cleanText.length);
            options?.onProgress?.(progress);
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch (err: any) {
        options?.onError?.(err);
        resolve(false);
      }
    });
  }

  pause(): void {
    if (this.isSupported() && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      this._isPaused = true;
      this.lastOptions?.onPause?.();
    }
  }

  resume(): void {
    if (this.isSupported() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this._isPaused = false;
      this.lastOptions?.onResume?.();
    }
  }

  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
      this._isPaused = false;
      this.currentUtterance = null;
    }
  }

  async replay(): Promise<boolean> {
    if (!this.lastSpokenText) return false;
    return this.speak(this.lastSpokenText, this.lastOptions);
  }

  isSpeaking(): boolean {
    return !!(this.isSupported() && window.speechSynthesis.speaking && !window.speechSynthesis.paused);
  }

  isPaused(): boolean {
    return !!(this.isSupported() && (this._isPaused || window.speechSynthesis.paused));
  }
}
