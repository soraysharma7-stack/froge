/**
 * FROGÉ Brain - Full Next-Level Cognitive Pipeline
 *
 * Architecture:
 * User Input
 *    │
 *    ▼
 * ┌─────────────────────────────────────────┐
 * │ 1. Guardrail & Safety Check             │
 * └────────────────────┬────────────────────┘
 *                      │
 *                      ▼
 * ┌─────────────────────────────────────────┐
 * │ 2. Intent & Sentiment Classifier        │
 * │    (Determines persona tone & state)    │
 * └────────────────────┬────────────────────┘
 *                      │
 *                      ▼
 * ┌─────────────────────────────────────────┐
 * │ 3. Context & Memory Fusion              │
 * │    (Merges past chat history + user info│
 * └────────────────────┬────────────────────┘
 *                      │
 *                      ▼
 * ┌─────────────────────────────────────────┐
 * │ 4. Response Generation                  │
 * │    (Applies persona, warmth, and logic) │
 * └─────────────────────────────────────────┘
 */

import { FrogeModeId } from '../../types';
import { frogeKnowledgeEngine } from '../knowledge/knowledgeEngine';

export type PipelineTopicCategory =
  | 'Greeting'
  | 'Technical Problem'
  | 'Small Talk'
  | 'Billing Issue'
  | 'Factual / Science Question'
  | 'Creative Writing'
  | 'Deep Research'
  | 'Business / Strategy'
  | 'Education / Study';

export type EmotionalState =
  | 'Frustrated'
  | 'Curious'
  | 'Confused'
  | 'Stressed'
  | 'Excited'
  | 'Casual'
  | 'Urgent'
  | 'Analytical'
  | 'Neutral';

export interface GuardrailCheckResult {
  isSafe: boolean;
  violationReason?: string;
  sanitizedText: string;
  safetyScore: number; // 0 to 100
}

export interface IntentSentimentResult {
  topicCategory: PipelineTopicCategory;
  emotionalState: EmotionalState;
  emotionalStateScore: number; // 0.0 to 1.0 (intensity)
  toneResponseStyle: {
    empathyLevel: 'high' | 'medium' | 'standard';
    sentenceLength: 'short' | 'moderate' | 'detailed';
    energyLevel: 'enthusiastic' | 'supportive' | 'calm' | 'direct' | 'warm';
    guidanceRule: string;
  };
  detectedEntities: string[];
}

export interface ContextMemoryFusionResult {
  shortTermFacts: Record<string, string>;
  isSubjectChange: boolean;
  implicitFollowUp: boolean;
  mergedContextSummary: string;
  activeTopic: string;
}

export interface PersonaInstructions {
  tone: 'Warm, encouraging, empathetic, clear, grounded';
  rules: string[];
}

export interface NextLevelPipelineResult {
  stage1_guardrail: GuardrailCheckResult;
  stage2_intentSentiment: IntentSentimentResult;
  stage3_contextMemory: ContextMemoryFusionResult;
  stage4_personaInstructions: PersonaInstructions;
  finalSynthesizedContent: string;
}

export const FROGE_PERSONA_INSTRUCTIONS: PersonaInstructions = {
  tone: 'Warm, encouraging, empathetic, clear, grounded',
  rules: [
    'Never say "As an AI..." or "I am programmed to..."',
    'Acknowledge feelings first before giving instructions.',
    'Keep sentences varied in length so the rhythm sounds natural.',
    'Use clear spacing and bolding for readability.',
    'End with a natural, conversational interactive question or next step.',
  ],
};

export class NextLevelCognitivePipeline {
  /**
   * Stage 1: Guardrail & Safety Fast Classifier
   */
  public checkSafety(input: string): GuardrailCheckResult {
    const raw = input.trim();
    const lower = raw.toLowerCase();

    // Dangerous patterns
    const dangerousPatterns = [
      /\b(how to (make|build) (a bomb|explosive|weapon))\b/i,
      /\b(cyberattack|exploit bank|ddos script)\b/i,
      /\b(self-harm|commit suicide)\b/i,
    ];

    for (const pat of dangerousPatterns) {
      if (pat.test(lower)) {
        return {
          isSafe: false,
          violationReason: 'Safety Policy: Harmful or dangerous request detected.',
          sanitizedText: 'I cannot fulfill requests that involve harm, violence, or dangerous activities.',
          safetyScore: 0,
        };
      }
    }

    return {
      isSafe: true,
      sanitizedText: raw,
      safetyScore: 100,
    };
  }

  /**
   * Stage 2: Intent & Sentiment Classifier (Tone/State Mapping)
   */
  public classifyIntentAndSentiment(input: string): IntentSentimentResult {
    const lower = input.toLowerCase().trim();

    // 1. Topic Routing
    let topicCategory: PipelineTopicCategory = 'Small Talk';
    if (/^(hey|hi|hello|good morning|good evening|good afternoon|howdy|sup|yo)\b/i.test(lower)) {
      topicCategory = 'Greeting';
    } else if (/\b(bug|error|exception|fail|crash|debug|syntax|typescript|python|react|function|code|api|server|404|500)\b/i.test(lower)) {
      topicCategory = 'Technical Problem';
    } else if (/\b(billing|invoice|subscription|refund|payment|credit card|charge|price tier)\b/i.test(lower)) {
      topicCategory = 'Billing Issue';
    } else if (/\b(mars|planet|earth|solar system|sun|physics|biology|chemistry|science|space|astronomy|formula)\b/i.test(lower)) {
      topicCategory = 'Factual / Science Question';
    } else if (/\b(story|poem|lyrics|novel|dialogue|creative|imagine|character)\b/i.test(lower)) {
      topicCategory = 'Creative Writing';
    } else if (/\b(research|investigate|multi-source|market trend|history of|compare in detail)\b/i.test(lower)) {
      topicCategory = 'Deep Research';
    } else if (/\b(revenue|margin|profit|forecast|strategy|churn|cac|ltv|business|sales)\b/i.test(lower)) {
      topicCategory = 'Business / Strategy';
    } else if (/\b(explain|teach me|how does|learn|study|concept|homework|quiz)\b/i.test(lower)) {
      topicCategory = 'Education / Study';
    }

    // 2. Emotional State Mapping
    let emotionalState: EmotionalState = 'Neutral';
    let emotionalStateScore = 0.5;

    if (/\b(frustrated|frustrating|frustration|annoyed|annoying|hate|broken|stuck|terrible|why won'?t|doesn'?t work|can'?t get)\b/i.test(lower) || lower.includes('frustrat') || lower.includes('annoy')) {
      emotionalState = 'Frustrated';
      emotionalStateScore = 0.9;
    } else if (/\b(stress|stressed|stressful|overwhelmed|overwhelming|deadline|panic|worried|anxious|emergency)\b/i.test(lower) || lower.includes('stress')) {
      emotionalState = 'Stressed';
      emotionalStateScore = 0.85;
    } else if (/\b(confused|confusing|confusion|don'?t understand|lost|what does this mean|how is that possible)\b/i.test(lower) || lower.includes('confus')) {
      emotionalState = 'Confused';
      emotionalStateScore = 0.8;
    } else if (/\b(awesome|great|love|amazing|excited|exciting|wow|finally|fantastic|yay)\b/i.test(lower) || lower.includes('excit')) {
      emotionalState = 'Excited';
      emotionalStateScore = 0.9;
    } else if (/^(hey|hi|hello|cool|nice|thanks|thank you)\b/i.test(lower)) {
      emotionalState = 'Casual';
      emotionalStateScore = 0.7;
    } else if (/\b(urgent|asap|critical|immediately|right now)\b/i.test(lower)) {
      emotionalState = 'Urgent';
      emotionalStateScore = 0.95;
    } else if (/\b(why|how does|what if|wondering|tell me about)\b/i.test(lower)) {
      emotionalState = 'Curious';
      emotionalStateScore = 0.8;
    } else if (/\b(metrics|benchmark|variance|evaluate|statistics)\b/i.test(lower)) {
      emotionalState = 'Analytical';
      emotionalStateScore = 0.75;
    }

    // 3. Tone & Response Style Policy
    const toneResponseStyle: IntentSentimentResult['toneResponseStyle'] = {
      empathyLevel: emotionalState === 'Frustrated' || emotionalState === 'Stressed' ? 'high' : emotionalState === 'Confused' ? 'medium' : 'standard',
      sentenceLength: emotionalState === 'Frustrated' || emotionalState === 'Urgent' ? 'short' : 'moderate',
      energyLevel:
        emotionalState === 'Excited'
          ? 'enthusiastic'
          : emotionalState === 'Frustrated' || emotionalState === 'Stressed'
          ? 'supportive'
          : emotionalState === 'Casual'
          ? 'warm'
          : emotionalState === 'Urgent'
          ? 'direct'
          : 'calm',
      guidanceRule:
        emotionalState === 'Frustrated'
          ? 'Acknowledge frustration first with high empathy, then deliver an immediate, clean fix in short sentences.'
          : emotionalState === 'Curious'
          ? 'Respond with enthusiasm and structured, insightful explanations.'
          : emotionalState === 'Confused'
          ? 'Break concepts down into simple, intuitive steps with everyday analogies.'
          : 'Be warm, encouraging, clear, and grounded with zero robotic boilerplate.',
    };

    // 4. Entity Extraction
    const detectedEntities: string[] = [];
    const entityMatches = input.match(/\b([A-Z][a-zA-Z0-9_-]+|\b\d+(?:\.\d+)?\b)/g);
    if (entityMatches) {
      detectedEntities.push(...entityMatches.slice(0, 5));
    }

    return {
      topicCategory,
      emotionalState,
      emotionalStateScore,
      toneResponseStyle,
      detectedEntities,
    };
  }

  /**
   * Stage 3: Context & Memory Fusion (State Tracking)
   */
  public fuseContextAndMemory(
    currentInput: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): ContextMemoryFusionResult {
    const lower = currentInput.toLowerCase();
    const shortTermFacts: Record<string, string> = {};

    // Extract user preferences / facts from history
    for (const item of history) {
      const hLower = item.content.toLowerCase();
      if (item.role === 'user') {
        const nameMatch = hLower.match(/my name is ([a-z]+)/i);
        if (nameMatch) shortTermFacts['userName'] = nameMatch[1];
        if (hLower.includes('typescript')) shortTermFacts['preferredLanguage'] = 'TypeScript';
        if (hLower.includes('python')) shortTermFacts['preferredLanguage'] = 'Python';
      }
    }

    // Check if current input is a subject change or follow-up
    const followUpSignals = [
      /\b(it|this|that|them|previous|earlier|again|continue|more|also|instead|change it|update it|modify it|add to it)\b/i,
      /^(make it|can you make it|change the|add|now add|now make|also add)/i,
    ];
    const isFollowUp = followUpSignals.some((p) => p.test(lower)) && currentInput.split(/\s+/).length < 15;
    const isSubjectChange = !isFollowUp && history.length > 0 && currentInput.length > 25;

    const activeTopic = currentInput.slice(0, 40);
    const mergedContextSummary = isFollowUp
      ? `Follow-up to previous turn with continued focus on active subject.`
      : `Current primary topic: "${activeTopic}".`;

    return {
      shortTermFacts,
      isSubjectChange,
      implicitFollowUp: isFollowUp,
      mergedContextSummary,
      activeTopic,
    };
  }

  /**
   * Stage 4: Friendly Response Generation
   */
  public generateFriendlyResponse(
    input: string,
    mode: FrogeModeId = 'simple-chat',
    history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): NextLevelPipelineResult {
    // 1. Guardrail
    const stage1_guardrail = this.checkSafety(input);
    if (!stage1_guardrail.isSafe) {
      return {
        stage1_guardrail,
        stage2_intentSentiment: {
          topicCategory: 'Technical Problem',
          emotionalState: 'Neutral',
          emotionalStateScore: 0,
          toneResponseStyle: {
            empathyLevel: 'standard',
            sentenceLength: 'short',
            energyLevel: 'direct',
            guidanceRule: 'Direct safety refusal.',
          },
          detectedEntities: [],
        },
        stage3_contextMemory: {
          shortTermFacts: {},
          isSubjectChange: false,
          implicitFollowUp: false,
          mergedContextSummary: 'Safety block triggered.',
          activeTopic: 'Safety Policy',
        },
        stage4_personaInstructions: FROGE_PERSONA_INSTRUCTIONS,
        finalSynthesizedContent: stage1_guardrail.sanitizedText,
      };
    }

    // 2. Intent & Sentiment
    const stage2_intentSentiment = this.classifyIntentAndSentiment(input);

    // 3. Context & Memory Fusion
    const stage3_contextMemory = this.fuseContextAndMemory(input, history);

    // 4. Generate Friendly Response applying Persona Rules
    const directKnowledge = frogeKnowledgeEngine.query(input);
    let bodyContent = '';

    if (directKnowledge && directKnowledge.matched) {
      bodyContent = directKnowledge.content;
    } else {
      // Warm response framing
      const emotion = stage2_intentSentiment.emotionalState;
      let warmGreeting = '';

      if (emotion === 'Frustrated') {
        warmGreeting = 'I hear you—that sounds frustrating! Let’s get this sorted out right away.\n\n';
      } else if (emotion === 'Excited') {
        warmGreeting = 'That sounds awesome! Happy to dive into this with you.\n\n';
      } else if (emotion === 'Confused') {
        warmGreeting = 'No worries at all—let’s break this down step-by-step so it’s super clear:\n\n';
      } else if (emotion === 'Casual') {
        warmGreeting = 'Hey there! Great to chat with you.\n\n';
      }

      bodyContent = `${warmGreeting}**${input.trim()}** is an important question. Here is a clear, straightforward breakdown of how it works:\n\n- **Core Mechanism**: Focus on the fundamental rules and direct logic governing the problem.\n- **Practical Steps**: Apply actionable steps cleanly without extra complexity.`;
    }

    // Interactive Closing
    const interactiveClosing =
      stage2_intentSentiment.topicCategory === 'Technical Problem'
        ? '\n\n---\n*Let me know if this solves the issue or if you want to test edge cases together!*'
        : stage2_intentSentiment.topicCategory === 'Factual / Science Question'
        ? '\n\n---\n*Would you like to explore the mathematics or any specific part of this in deeper detail?*'
        : '\n\n---\n*Does this answer what you were looking for, or should we explore the next step?*';

    const finalSynthesizedContent = `${bodyContent}${bodyContent.includes('---') ? '' : interactiveClosing}`;

    return {
      stage1_guardrail,
      stage2_intentSentiment,
      stage3_contextMemory,
      stage4_personaInstructions: FROGE_PERSONA_INSTRUCTIONS,
      finalSynthesizedContent,
    };
  }
}

export const nextLevelCognitivePipeline = new NextLevelCognitivePipeline();
