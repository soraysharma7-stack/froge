/**
 * FROGÉ Brain - Task Classification Module
 *
 * Stage 2: Classifies the user request across the 8 fundamental FROGÉ cognitive categories:
 * 1. normal_conversation (everyday chat, greetings, general inquiries, brief notes)
 * 2. deeper_reasoning (multi-step deductive proofs, philosophical paradoxes, deep logic)
 * 3. web_research (current events, external facts, live documentation, real-world data)
 * 4. creative_generation (worldbuilding, storytelling, poetry, aesthetic metaphors)
 * 5. coding (algorithms, TypeScript, full-stack components, debugging, code audits)
 * 6. business_analysis (market sizing, SWOT, unit economics, risk matrices, roadmaps)
 * 7. education (Socratic tutoring, beginner tutorials, concept breakdown, quizzes)
 * 8. memory (preference recall, historical context retrieval, personal notes)
 */

import { IntentUnderstanding, BrainTaskType, TaskClassification } from './types';
import { FrogeModeId } from '../types';

export function classifyTask(
  intent: IntentUnderstanding,
  modeHint?: FrogeModeId
): TaskClassification {
  // FAST PATH: Level 0 Casual inputs (Hey, Hi, Thanks, Good morning, etc.)
  // MUST NEVER escalate to deeper reasoning, MAX, research, or multi-agent workflows
  if (intent.complexityTier === 0 || intent.complexityCategory === 'casual') {
    const casualScores: Record<BrainTaskType, number> = {
      normal_conversation: 1.0,
      deeper_reasoning: 0.0,
      web_research: 0.0,
      creative_generation: 0.0,
      coding: 0.0,
      business_analysis: 0.0,
      education: 0.0,
      memory: 0.0,
    };
    return {
      primaryTask: 'normal_conversation',
      secondaryTasks: [],
      confidenceScores: casualScores,
      urgency: 'standard',
      requiresDeepCognition: false,
      requiresExternalData: false,
      requiresStatePersistence: false,
      classificationRationale: 'Level 0 Casual conversation: Fast Path activated with zero deep analytical overhead.',
    };
  }

  const q = intent.normalizedQuery;

  // Initialize scoring map for all 8 task categories
  const scores: Record<BrainTaskType, number> = {
    normal_conversation: 0.1,
    deeper_reasoning: 0.05,
    web_research: 0.05,
    creative_generation: 0.05,
    coding: 0.05,
    business_analysis: 0.05,
    education: 0.05,
    memory: 0.05,
  };

  // 1. Coding & Game Engineering Signals
  const codingPatterns = [
    /\b(code|function|typescript|javascript|python|react|component|api|endpoint|sql|database|query|class|interface|algorithm|regex|bug|debug|refactor|compile|linter|unit test|git|repo|syntax|lru cache|async|await|promise|hook)\b/,
    /```/,
    /\b(const|let|var|import|export|def |fn |return )\b/,
    /\b(build a (?:football )?game website|build a website|web app|game engine|threejs|webgl|playable code)\b/,
  ];
  if (codingPatterns.some((p) => p.test(q)) || modeHint === 'froge-code') {
    scores.coding += 0.85;
  }

  // 2. Deeper Reasoning Signals
  const reasoningPatterns = [
    /\b(deduce|prove|proof|deductive|logic|paradox|game theory|nash equilibrium|second-order|first principles|axiom|counterfactual|syllogism|causality|infer|implications|fallacy)\b/,
    /\b(step by step analysis|why does .* work|compare and contrast .* rigorously)\b/,
  ];
  if (reasoningPatterns.some((p) => p.test(q)) || modeHint === 'deep-thinking') {
    scores.deeper_reasoning += 0.75;
    if (intent.complexityLevel === 'high' || intent.complexityLevel === 'expert') {
      scores.deeper_reasoning += 0.15;
    }
  }

  // 3. Web Research Signals
  const researchPatterns = [
    /\b(search|look up|latest|recent|news|current events|who won|when did|weather in|price of|documentation for|find articles|google|web research|fact check|2024|2025|2026)\b/,
    /\b(what happened in|is it true that|source for)\b/,
  ];
  if (researchPatterns.some((p) => p.test(q))) {
    scores.web_research += 0.85;
  }

  // 4. Creative Generation & Game Simulation Signals
  const creativePatterns = [
    /\b(story|poem|poetry|creative|fiction|character|vignette|worldbuilding|manifesto|metaphor|dialogue|lyrics|plot|narrative|scene|aesthetic|cinematic|prose)\b/,
    /\b(write a tale|imagine a world|compose)\b/,
    /\b(stadium image|football match video|cinematic image|cinematic video|render|visualize|concept art)\b/,
    /\b(make an? .*game|create an? .*game|football game|soccer game|game creation|3d game|playable game)\b/,
  ];
  if (creativePatterns.some((p) => p.test(q))) {
    scores.creative_generation += 0.85;
    if (q.includes('game') && !q.includes('website')) {
      // Game creation: dual-weighted across creative generation and coding
      scores.coding += 0.4;
    }
  }

  // 5. Business Analysis Signals
  const businessPatterns = [
    /\b(business|strategy|roi|swot|market size|tam|sam|som|unit economics|cac|ltv|churn|burn rate|pricing strategy|risk matrix|fmea|executive summary|investor deck|pitch|okr|kpi|ebitda|saas metrics)\b/,
    /\b(90-day roadmap|monetization|go-to-market|gtm)\b/,
  ];
  if (businessPatterns.some((p) => p.test(q)) || modeHint === 'max') {
    scores.business_analysis += 0.8;
  }

  // 6. Education & Structured Training Plan Signals
  const educationPatterns = [
    /\b(teach me|explain like|for beginners|what is|how does .* work|simple analogy|eli5|student|tutor|quiz|check my understanding|lesson|curriculum|study guide|homework)\b/,
    /\b(difference between .* and .* for a beginner)\b/,
    /\b(training plan|workout plan|drills|exercise regimen|week training|football training|coaching plan|practice schedule)\b/,
  ];
  if (educationPatterns.some((p) => p.test(q)) || modeHint === 'student-mode') {
    scores.education += 0.88;
  }

  // 7. Memory Signals
  const memoryPatterns = [
    /\b(remember|recall|my favorite|my preference|earlier you said|what did i tell you|do you remember|store this|save this to memory|my name is|note for later)\b/,
  ];
  if (memoryPatterns.some((p) => p.test(q))) {
    scores.memory += 0.85;
  }

  // 8. Normal Conversation Signals
  const normalPatterns = [
    /\b(hello|hi|hey|greetings|how are you|good morning|good evening|thanks|thank you|who are you|what can you do|help me|tell me a joke|draft a polite email|summarize this note)\b/,
  ];
  if (normalPatterns.some((p) => p.test(q))) {
    scores.normal_conversation += 0.85;
  } else if (q.length < 50 && !codingPatterns.some((p) => p.test(q))) {
    scores.normal_conversation += 0.5;
  }

  // Normalize scores to [0, 1]
  const taskTypes = Object.keys(scores) as BrainTaskType[];
  const maxScore = Math.max(...Object.values(scores));

  const normalizedScores = {} as Record<BrainTaskType, number>;
  taskTypes.forEach((t) => {
    normalizedScores[t] = Number((scores[t] / (maxScore || 1)).toFixed(2));
  });

  // Sort tasks by score
  const sortedTasks = [...taskTypes].sort((a, b) => scores[b] - scores[a]);
  const primaryTask = sortedTasks[0];
  const secondaryTasks = sortedTasks.slice(1).filter((t) => scores[t] > 0.4);

  // Deep cognition requirement check
  const requiresDeepCognition =
    (primaryTask === 'deeper_reasoning' && intent.complexityLevel !== 'low') ||
    (primaryTask === 'coding' && intent.complexityLevel !== 'low') ||
    (primaryTask === 'business_analysis' && intent.complexityLevel === 'expert');

  // External data requirement check
  const requiresExternalData = primaryTask === 'web_research';

  // State persistence requirement check
  const requiresStatePersistence =
    primaryTask === 'memory' || scores.memory > 0.4 || q.includes('remember');

  // Urgency check
  const urgency = intent.sentiment === 'urgent' ? 'high' : 'standard';

  // Formulate clear rationale
  const rationaleMap: Record<BrainTaskType, string> = {
    normal_conversation: 'Standard conversational interaction with low computational overhead.',
    deeper_reasoning: 'Requires multi-step deductive rigor, formal validation, and conceptual depth.',
    web_research: 'Involves external fact verification, real-time ground truth, or web sources.',
    creative_generation: 'Requires rich evocative vocabulary, stylistic tone direction, and imaginative synthesis.',
    coding: 'Demands precise syntax, type safety, algorithmic analysis, and modular software design.',
    business_analysis: 'Requires commercial strategy frameworks, risk quantification, and actionable roadmaps.',
    education: 'Prioritizes Socratic breakdown, first-principles analogies, and comprehension checkpoints.',
    memory: 'Requires cross-referencing persistent memory vault and contextual state recall.',
  };

  return {
    primaryTask,
    secondaryTasks,
    confidenceScores: normalizedScores,
    urgency,
    requiresDeepCognition,
    requiresExternalData,
    requiresStatePersistence,
    classificationRationale: rationaleMap[primaryTask],
  };
}
