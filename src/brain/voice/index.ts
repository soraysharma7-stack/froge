/**
 * FROGÉ Brain - Voice Architecture Subsystem Entry Point
 *
 * Exposes provider-independent STT/TTS interfaces, language catalog,
 * hardware inspectors, master voice manager, and automated regression test suite.
 */

export * from './types';
export * from './languages';
export * from './interfaces';
export * from './providers/webSpeechSTT';
export * from './providers/webSpeechTTS';
export * from './providers/devPlaceholderProvider';
export * from './voiceRegistry';
export * from './testSuite';
