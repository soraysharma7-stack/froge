/**
 * FROGÉ Brain - Live-Learn Correction Detector
 *
 * Stage 1 of Live-Learn:
 * Parses user input to detect explicit corrections, stylistic feedback,
 * temporal boundaries, and preference updates.
 */

import {
  CorrectionDetectionResult,
  CorrectionType,
  StabilityClassification,
  SignalScope,
  LiveLearnSignal,
} from './liveLearnTypes';

// Explicit Stable Preference Markers
const STABLE_TRIGGER_PATTERNS = [
  /from now on/i,
  /always (?:use|write|give|provide|do|prefer|respond with)/i,
  /never (?:use|write|give|provide|do|respond with)/i,
  /my default (?:is|preference is|should be)/i,
  /i prefer (?:to have|using)?\s*([^,\.\n]+)/i,
  /set my preference to/i,
  /remember that i (?:always|prefer|use)/i,
  /going forward/i,
  /for all (?:future|my) (?:prompts|questions|queries|code)/i,
  /by default/i,
  /make sure you always/i,
];

// Ephemeral / Temporary Instruction Markers
const TEMPORARY_TRIGGER_PATTERNS = [
  /for this (?:question|query|prompt|turn|message|request) only/i,
  /just this once/i,
  /only for this/i,
  /just for now/i,
  /for now(?:,|$)/i,
  /in this (?:single|specific)?\s*(?:prompt|message|turn)/i,
  /temporarily/i,
  /this turn only/i,
  /just once/i,
  /for the moment/i,
];

// Negative Feedback & Correction Triggers
const CORRECTION_TRIGGER_PATTERNS = [
  /^(?:no|nope|wrong|incorrect|false)[,\.\s!]/i,
  /that(?:'s| is) (?:incorrect|wrong|false|not right|a mistake)/i,
  /you made a (?:mistake|error|hallucination)/i,
  /don't (?:do that|say that|use that|include that)/i,
  /stop (?:doing|using|saying|giving)/i,
  /actually,?\s+/i,
  /instead of (?:that|this|using)/i,
  /not [^,]+, (?:use|but|rather)/i,
];

// Domain & Topic Markers
const TOPIC_MARKERS: Record<string, RegExp> = {
  coding: /(?:code|typescript|javascript|python|react|functions?|syntax|compiler|api)/i,
  sql: /(?:sql|postgres|database|query|table|schema|joins?)/i,
  writing: /(?:essay|prose|tone|summary|bullet points|grammar|paragraph)/i,
  math: /(?:math|equation|calculate|formula|integral|arithmetic)/i,
};

export function detectCorrection(
  userInput: string,
  previousAssistantMessage?: string
): CorrectionDetectionResult {
  const text = (userInput || '').trim();
  const rawKeywords: string[] = [];

  if (!text) {
    return {
      isCorrection: false,
      correctionType: 'none',
      rawKeywords: [],
      extractedDirectives: [],
      reasoning: 'Input utterance is empty.',
    };
  }

  // 1. Check for temporary vs stable indicators
  const isTemporary = TEMPORARY_TRIGGER_PATTERNS.some((pattern) => {
    if (pattern.test(text)) {
      rawKeywords.push(pattern.source);
      return true;
    }
    return false;
  });

  const isStable = STABLE_TRIGGER_PATTERNS.some((pattern) => {
    if (pattern.test(text)) {
      rawKeywords.push(pattern.source);
      return true;
    }
    return false;
  });

  const isCorrection = CORRECTION_TRIGGER_PATTERNS.some((pattern) => {
    if (pattern.test(text)) {
      rawKeywords.push(pattern.source);
      return true;
    }
    return false;
  });

  // 2. Identify Topic Scope
  let detectedTopicScope: string | undefined = undefined;
  for (const [topic, regex] of Object.entries(TOPIC_MARKERS)) {
    if (regex.test(text)) {
      detectedTopicScope = topic;
      break;
    }
  }

  // 3. Extract Directives
  const directives: CorrectionDetectionResult['extractedDirectives'] = [];
  let primaryType: CorrectionType = 'none';

  // Rule A: Programming Language Preference (e.g., "From now on, always give me TypeScript examples, not JavaScript")
  const langMatch = text.match(/(?:always|prefer|use|only)?\s*(typescript|javascript|python|rust|golang|c\+\+|swift|kotlin|c#)\s*(?:examples|code|instead of|rather than|not)?\s*([a-z0-9#\+]+)?/i);
  if (langMatch && (isStable || isCorrection || isTemporary || text.toLowerCase().includes('typescript') || text.toLowerCase().includes('python'))) {
    const preferredLang = langMatch[1];
    const initialStability: StabilityClassification = isTemporary
      ? 'TEMPORARY_INSTRUCTION'
      : isStable
      ? 'STABLE_PREFERENCE'
      : 'STABLE_PREFERENCE';

    const scope: SignalScope = isTemporary ? 'session' : 'global';
    const confidence = isStable ? 0.95 : isTemporary ? 0.90 : 0.85;

    directives.push({
      key: 'preferred_programming_language',
      value: preferredLang.charAt(0).toUpperCase() + preferredLang.slice(1).toLowerCase(),
      category: 'preference',
      stability: initialStability,
      confidence,
      scope,
      topicScope: 'coding',
    });
    primaryType = 'preference_directive';
  }

  // Rule B: Response Formatting / Verbosity (e.g., "bullet points only", "keep it under 50 words", "concise")
  const verbosityMatch = text.match(/(?:bulleted? list|bullet points?|concise|brief|short|detailed|exhaustive|in-depth|under \d+ words|step-by-step)/i);
  if (verbosityMatch) {
    const val = verbosityMatch[0].toLowerCase();
    const initialStability: StabilityClassification = isTemporary
      ? 'TEMPORARY_INSTRUCTION'
      : isStable
      ? 'STABLE_PREFERENCE'
      : 'TEMPORARY_INSTRUCTION'; // Default ad-hoc format tweaks to temporary unless 'always' specified

    const scope: SignalScope = initialStability === 'STABLE_PREFERENCE' ? 'global' : 'session';
    const confidence = isStable ? 0.92 : 0.88;

    directives.push({
      key: 'response_formatting_style',
      value: val,
      category: 'interaction_style',
      stability: initialStability,
      confidence,
      scope,
      topicScope: detectedTopicScope,
    });
    if (primaryType === 'none') {
      primaryType = isTemporary ? 'temporary_instruction' : 'tone_style_correction';
    }
  }

  // Rule C: Tone & Persona (e.g., "be more casual", "no corporate jargon", "friendly tone")
  const toneMatch = text.match(/(?:formal|casual|humorous|academic|direct|technical|friendly|no (?:buzzwords|jargon|fluff))/i);
  if (toneMatch && (isCorrection || isStable || text.toLowerCase().includes('tone') || text.toLowerCase().includes('style'))) {
    const val = toneMatch[0].toLowerCase();
    const initialStability: StabilityClassification = isTemporary
      ? 'TEMPORARY_INSTRUCTION'
      : 'STABLE_PREFERENCE';

    directives.push({
      key: 'preferred_tone',
      value: val,
      category: 'interaction_style',
      stability: initialStability,
      confidence: isStable ? 0.90 : 0.80,
      scope: isTemporary ? 'session' : 'global',
      topicScope: detectedTopicScope,
    });
    if (primaryType === 'none') {
      primaryType = 'tone_style_correction';
    }
  }

  // Rule D: Direct Negative Fact/Assertion Correction (e.g. "Actually Paris is the capital, not Lyon" or "2+2=5")
  if (isCorrection && directives.length === 0) {
    const cleanedCorrection = text.replace(/^(?:no|nope|wrong|incorrect)[,\.\s!]+/i, '').trim();
    directives.push({
      key: 'user_stated_correction',
      value: cleanedCorrection,
      category: 'custom_instruction',
      stability: isTemporary ? 'TEMPORARY_INSTRUCTION' : 'STABLE_PREFERENCE',
      confidence: 0.75,
      scope: isTemporary ? 'session' : 'global',
      topicScope: detectedTopicScope,
    });
    primaryType = 'factual_correction';
  }

  const hasCorrection = isCorrection || isStable || isTemporary || directives.length > 0;

  return {
    isCorrection: hasCorrection,
    correctionType: primaryType !== 'none' ? primaryType : hasCorrection ? 'preference_directive' : 'none',
    detectedKey: directives[0]?.key,
    detectedValue: directives[0]?.value,
    rawKeywords,
    extractedDirectives: directives,
    reasoning: hasCorrection
      ? `Detected ${isTemporary ? 'temporary instruction' : isStable ? 'stable preference' : 'correction'} with ${directives.length} extracted signal(s).`
      : 'No correction or explicit preference directive found in utterance.',
  };
}
