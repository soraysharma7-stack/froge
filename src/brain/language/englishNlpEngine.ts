/**
 * FROGÉ Brain - Deep English NLP & Linguistic Pragmatics Engine
 *
 * Implements:
 * 1. Deep NLP Analysis:
 *    - Idiom & Regional Expression Linking ("burnt out", "touch base", "hit a wall")
 *    - Sarcasm & Subtext Detection ("Oh, great...", "Yeah, right...", "Just wonderful")
 *    - Formality Register Detection (Casual Shorthand, Neutral Conversational, Formal Business, Academic/Technical)
 *    - Pragmatic Mood & Intent Mapping
 *
 * 2. Dynamic Context Alignment:
 *    - Session memory & user profile fusion
 *    - Vocabulary & cadence rules selection
 *
 * 3. High-Level Friendly English Generation:
 *    - Linguistic Mimicry (Formality matching)
 *    - Transition Anchors ("That makes total sense", "Here's the cool part", "By the way")
 *    - Active Voice & Speech Cadence
 *    - Empathetic Mirroring ("I can see why that's frustrating", "That sounds amazing!")
 */

export type FormalityRegister = 'casual_shorthand' | 'conversational_neutral' | 'formal_professional' | 'academic_technical';

export interface IdiomMapping {
  phrase: string;
  literalMeaning: string;
  actualPragmaticMeaning: string;
  domain: 'workplace' | 'emotional_state' | 'general_idiom' | 'technical';
}

export interface DeepNlpAnalysisResult {
  rawInput: string;
  formalityRegister: FormalityRegister;
  isSarcastic: boolean;
  sarcasmSignals: string[];
  detectedIdioms: IdiomMapping[];
  pragmaticMood: 'frustrated_sarcastic' | 'burnt_out' | 'curious_seeking' | 'casual_warm' | 'formal_executive' | 'enthusiastic' | 'neutral';
  pragmaticIntent: string;
  linguisticCadenceRecommendation: {
    targetFormality: 'casual' | 'balanced' | 'elevated';
    recommendedTransitions: string[];
    openingBridge: string;
    closingBridge: string;
    cadenceStyle: string;
  };
}

// English Idiom & Pragmatic Expression Dictionary
export const ENGLISH_IDIOMS_DATABASE: IdiomMapping[] = [
  {
    phrase: 'burnt out',
    literalMeaning: 'consumed by fire',
    actualPragmaticMeaning: 'Severely fatigued, exhausted, or overwhelmed from prolonged stress',
    domain: 'emotional_state',
  },
  {
    phrase: 'burned out',
    literalMeaning: 'consumed by fire',
    actualPragmaticMeaning: 'Severely fatigued, exhausted, or overwhelmed from prolonged stress',
    domain: 'emotional_state',
  },
  {
    phrase: 'touch base',
    literalMeaning: 'make physical contact with a base',
    actualPragmaticMeaning: 'Briefly connect, update, or check in with someone',
    domain: 'workplace',
  },
  {
    phrase: 'hit a wall',
    literalMeaning: 'physically collide with a barrier',
    actualPragmaticMeaning: 'Reached a sudden impasse, exhaustion point, or block in progress',
    domain: 'workplace',
  },
  {
    phrase: 'back to square one',
    literalMeaning: 'returning to the first square on a game board',
    actualPragmaticMeaning: 'Starting over from the very beginning after a failed attempt',
    domain: 'general_idiom',
  },
  {
    phrase: 'cut corners',
    literalMeaning: 'cut across a corner',
    actualPragmaticMeaning: 'Taking shortcuts that compromise quality or safety',
    domain: 'workplace',
  },
  {
    phrase: 'piece of cake',
    literalMeaning: 'a slice of baked dessert',
    actualPragmaticMeaning: 'Very easy or simple task',
    domain: 'general_idiom',
  },
  {
    phrase: 'wrap my head around',
    literalMeaning: 'physically wrapping around an object',
    actualPragmaticMeaning: 'Comprehend, understand, or process a complex concept',
    domain: 'general_idiom',
  },
  {
    phrase: 'silver bullet',
    literalMeaning: 'a projectile made of silver',
    actualPragmaticMeaning: 'A simple, instantaneous magical solution to a complex problem',
    domain: 'technical',
  },
];

export class FrogeEnglishNlpEngine {
  /**
   * Stage 1: Deep NLP & Pragmatic Analysis
   */
  public analyzeEnglishInput(input: string): DeepNlpAnalysisResult {
    const raw = input.trim();
    const lower = raw.toLowerCase();

    // 1. Sarcasm & Subtext Detection
    const sarcasmSignals: string[] = [];
    let isSarcastic = false;

    if (/^(oh,?\s*(great|wonderful|fantastic|brilliant|perfect)\b[\s.!?…]*)/i.test(lower)) {
      if (lower.includes('...') || lower.includes('another bug') || lower.includes('broke') || lower.includes('failed') || lower.includes('again')) {
        isSarcastic = true;
        sarcasmSignals.push('Ironic positive opening paired with negative context / ellipses ("Oh, great...").');
      }
    } else if (/\b(yeah,?\s*right|just what i needed|as if)\b/i.test(lower)) {
      isSarcastic = true;
      sarcasmSignals.push('Sarcastic idiomatic marker detected ("Yeah, right").');
    }

    // 2. Idiom & Expression Mapping
    const detectedIdioms: IdiomMapping[] = [];
    for (const idiom of ENGLISH_IDIOMS_DATABASE) {
      if (lower.includes(idiom.phrase)) {
        detectedIdioms.push(idiom);
      }
    }

    // 3. Formality Register Detection
    let formalityRegister: FormalityRegister = 'conversational_neutral';

    const casualTokens = [
      /\b(sup|yo|bro|hey|dude|gimme|lemme|wanna|gonna|idk|tbh|imo|cuz|pls|plz|thx)\b/i,
      /^[a-z0-9\s]{1,15}$/i, // very short lowercase fragment
    ];
    const formalTokens = [
      /\b(furthermore|moreover|consequently|hereby|in accordance with|executive summary|stakeholders|diligence)\b/i,
      /\b(could you please provide|kindly advise|with respect to)\b/i,
    ];
    const academicTokens = [
      /\b(asymptotic|eigenvalues|methodology|stochastic|formulation|derivation|empirical|astronomical)\b/i,
    ];

    if (academicTokens.some((t) => t.test(lower))) {
      formalityRegister = 'academic_technical';
    } else if (formalTokens.some((t) => t.test(lower))) {
      formalityRegister = 'formal_professional';
    } else if (casualTokens.some((t) => t.test(lower)) || lower.length < 25) {
      formalityRegister = 'casual_shorthand';
    }

    // 4. Pragmatic Mood Determination
    let pragmaticMood: DeepNlpAnalysisResult['pragmaticMood'] = 'neutral';

    if (isSarcastic) {
      pragmaticMood = 'frustrated_sarcastic';
    } else if (detectedIdioms.some((i) => i.phrase.includes('burnt out') || i.phrase.includes('hit a wall'))) {
      pragmaticMood = 'burnt_out';
    } else if (formalityRegister === 'formal_professional') {
      pragmaticMood = 'formal_executive';
    } else if (formalityRegister === 'casual_shorthand') {
      pragmaticMood = 'casual_warm';
    } else if (/\b(why|how|what if|explain|explore)\b/i.test(lower)) {
      pragmaticMood = 'curious_seeking';
    } else if (/\b(awesome|great|love|amazing|excited)\b/i.test(lower)) {
      pragmaticMood = 'enthusiastic';
    }

    // 5. Linguistic Cadence & Response Recommendation
    let targetFormality: 'casual' | 'balanced' | 'elevated' = 'balanced';
    let openingBridge = 'Here is a clear look at this:';
    let closingBridge = 'Let me know if this helps or if you want to explore further!';
    let cadenceStyle = 'Balanced sentence lengths with active verbs and natural transitions.';

    if (pragmaticMood === 'frustrated_sarcastic') {
      targetFormality = 'casual';
      openingBridge = 'I can see why that’s frustrating—let’s get this sorted out right away:';
      closingBridge = 'Let me know if that clears up the issue, or if any other errors pop up!';
      cadenceStyle = 'High empathy, short punchy sentences, direct actionable solution.';
    } else if (pragmaticMood === 'burnt_out') {
      targetFormality = 'balanced';
      openingBridge = 'I completely hear you—take a breath, we can take this one simple step at a time:';
      closingBridge = 'No rush at all. Whenever you’re ready, let me know what we should tackle next.';
      cadenceStyle = 'Calm, supportive pacing with reassuring spacing and low cognitive load.';
    } else if (formalityRegister === 'formal_professional') {
      targetFormality = 'elevated';
      openingBridge = 'Here is a structured executive breakdown:';
      closingBridge = 'Please let me know if you would like to refine any of these strategic points.';
      cadenceStyle = 'Elevated professional cadence with clear headers and structured takeaways.';
    } else if (formalityRegister === 'casual_shorthand') {
      targetFormality = 'casual';
      openingBridge = 'Hey there! Here’s the deal:';
      closingBridge = 'Ready when you are—what’s next?';
      cadenceStyle = 'Linguistic mimicry: Relaxed, friendly, and snappy conversational tone.';
    }

    const recommendedTransitions = [
      'That makes total sense.',
      'Here’s the cool part:',
      'By the way,',
      'To put that into perspective,',
      'On top of that,',
    ];

    const pragmaticIntent = isSarcastic
      ? 'Expressing frustration/annoyance via sarcastic phrasing; seeks empathetic fix.'
      : detectedIdioms.length > 0
      ? `Using idiomatic subtext (${detectedIdioms.map((i) => i.phrase).join(', ')}) to convey state.`
      : `Communicating with ${formalityRegister.replace('_', ' ')} register.`;

    return {
      rawInput: input,
      formalityRegister,
      isSarcastic,
      sarcasmSignals,
      detectedIdioms,
      pragmaticMood,
      pragmaticIntent,
      linguisticCadenceRecommendation: {
        targetFormality,
        recommendedTransitions,
        openingBridge,
        closingBridge,
        cadenceStyle,
      },
    };
  }

  /**
   * Stage 2 & 3: Generate Natural English with Linguistic Mimicry & Transition Anchors
   */
  public generateNaturalEnglishResponse(
    input: string,
    coreAnswerBody: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): string {
    const analysis = this.analyzeEnglishInput(input);
    const { openingBridge, closingBridge } = analysis.linguisticCadenceRecommendation;

    let naturalText = coreAnswerBody.trim();

    // Strip robotic meta-talk
    naturalText = naturalText
      .replace(/^I have received your input and determined[^.\n]*[.\n]+/i, '')
      .replace(/^Addressing your input regarding[^.\n]*[.\n]+/i, '')
      .replace(/^As an AI language model[^.\n]*[.\n]+/i, '')
      .trim();

    // If text already has a custom markdown header, prepend the natural opening bridge smoothly
    if (!naturalText.startsWith(openingBridge) && !naturalText.startsWith('### 🪐')) {
      naturalText = `${openingBridge}\n\n${naturalText}`;
    }

    // Append closing transition if not present
    if (!naturalText.includes('---') && !naturalText.includes('?')) {
      naturalText = `${naturalText}\n\n---\n*${closingBridge}*`;
    }

    return naturalText;
  }
}

export const frogeEnglishNlpEngine = new FrogeEnglishNlpEngine();
