/**
 * FROGÉ Brain - Supported Voice Languages Catalog
 *
 * Multi-language definitions for global STT and TTS support.
 */

import { VoiceLanguage } from './types';

export const SUPPORTED_VOICE_LANGUAGES: VoiceLanguage[] = [
  {
    code: 'en-US',
    label: 'English (US)',
    nativeName: 'English (United States)',
    flag: '🇺🇸',
    samplePhrase: 'Hello, I am FROGÉ. How can I assist your engineering work today?',
    defaultTtsRate: 1.0,
  },
  {
    code: 'en-GB',
    label: 'English (UK)',
    nativeName: 'English (United Kingdom)',
    flag: '🇬🇧',
    samplePhrase: 'Good day. FROGÉ is ready to assist with deep thinking and code analysis.',
    defaultTtsRate: 1.0,
  },
  {
    code: 'es-ES',
    label: 'Spanish (Spain)',
    nativeName: 'Español (España)',
    flag: '🇪🇸',
    samplePhrase: 'Hola, soy FROGÉ. ¿En qué puedo ayudarte hoy?',
    defaultTtsRate: 1.0,
  },
  {
    code: 'es-MX',
    label: 'Spanish (Mexico)',
    nativeName: 'Español (México)',
    flag: '🇲🇽',
    samplePhrase: 'Hola, bienvenido a FROGÉ. Dime cómo podemos optimizar tu flujo de trabajo.',
    defaultTtsRate: 1.0,
  },
  {
    code: 'fr-FR',
    label: 'French (France)',
    nativeName: 'Français (France)',
    flag: '🇫🇷',
    samplePhrase: 'Bonjour! Je suis FROGÉ. En quoi puis-je vous aider?',
    defaultTtsRate: 1.0,
  },
  {
    code: 'de-DE',
    label: 'German (Germany)',
    nativeName: 'Deutsch (Deutschland)',
    flag: '🇩🇪',
    samplePhrase: 'Guten Tag. Ich bin FROGÉ. Wie kann ich Ihnen behilflich sein?',
    defaultTtsRate: 1.0,
  },
  {
    code: 'it-IT',
    label: 'Italian (Italy)',
    nativeName: 'Italiano (Italia)',
    flag: '🇮🇹',
    samplePhrase: 'Ciao, sono FROGÉ. Come posso aiutarti oggi nei tuoi progetti?',
    defaultTtsRate: 1.0,
  },
  {
    code: 'pt-BR',
    label: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
    samplePhrase: 'Olá! Sou o FROGÉ. Como posso ajudar no seu desenvolvimento hoje?',
    defaultTtsRate: 1.0,
  },
  {
    code: 'ja-JP',
    label: 'Japanese (Japan)',
    nativeName: '日本語 (日本)',
    flag: '🇯🇵',
    samplePhrase: 'こんにちは、FROGÉです。どのようなご用件でしょうか？',
    defaultTtsRate: 1.05,
  },
  {
    code: 'zh-CN',
    label: 'Chinese (Simplified)',
    nativeName: '中文 (简体)',
    flag: '🇨🇳',
    samplePhrase: '您好，我是 FROGÉ。今天有什么我可以协助您的？',
    defaultTtsRate: 1.0,
  },
  {
    code: 'ko-KR',
    label: 'Korean (South Korea)',
    nativeName: '한국어 (대한민국)',
    flag: '🇰🇷',
    samplePhrase: '안녕하세요! FROGÉ입니다. 오늘 어떤 작업을 도와드릴까요?',
    defaultTtsRate: 1.0,
  },
  {
    code: 'hi-IN',
    label: 'Hindi (India)',
    nativeName: 'हिन्दी (भारत)',
    flag: '🇮🇳',
    samplePhrase: 'नमस्ते, मैं FROGÉ हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?',
    defaultTtsRate: 1.0,
  },
  {
    code: 'ar-SA',
    label: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية (السعودية)',
    flag: '🇸🇦',
    samplePhrase: 'مرحباً، أنا فروجي. كيف يمكنني مساعدتك في مهامك اليوم؟',
    defaultTtsRate: 1.0,
  },
  {
    code: 'ru-RU',
    label: 'Russian (Russia)',
    nativeName: 'Русский (Россия)',
    flag: '🇷🇺',
    samplePhrase: 'Здравствуйте, я FROGÉ. Чем я могу помочь вам сегодня?',
    defaultTtsRate: 1.0,
  },
  {
    code: 'nl-NL',
    label: 'Dutch (Netherlands)',
    nativeName: 'Nederlands (Nederland)',
    flag: '🇳🇱',
    samplePhrase: 'Hallo, ik ben FROGÉ. Waarmee kan ik u vandaag helpen?',
    defaultTtsRate: 1.0,
  },
];

export const DEFAULT_VOICE_LANGUAGE: VoiceLanguage = SUPPORTED_VOICE_LANGUAGES[0];

export function getVoiceLanguageByCode(code: string): VoiceLanguage {
  const normalized = code.toLowerCase().trim();
  const match = SUPPORTED_VOICE_LANGUAGES.find(
    (l) => l.code.toLowerCase() === normalized || l.code.toLowerCase().startsWith(normalized.slice(0, 2))
  );
  return match || DEFAULT_VOICE_LANGUAGE;
}
