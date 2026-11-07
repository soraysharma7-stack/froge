/**
 * FROGÉ Brain - Context Relevance Filter & Anti-Contamination Subsystem
 *
 * Core Directives:
 * 1. CURRENT MESSAGE HAS ABSOLUTE PRIORITY:
 *    The latest explicit user request is ALWAYS treated as the primary task.
 * 2. NO CONTEXT CONTAMINATION:
 *    Shared keywords (e.g. "football", "plan", "realistic") are NOT sufficient
 *    evidence that two requests share the same task.
 * 3. RELEVANCE GATE:
 *    Previous conversation context may be used ONLY when it is functionally relevant
 *    to the current task (e.g. true follow-up refinement).
 *    If old context conflicts with the current request: CURRENT USER REQUEST WINS.
 */

export interface ContextRelevanceEvaluation {
  isRelevant: boolean;
  relevanceScore: number; // 0.0 (completely irrelevant/conflicting) to 1.0 (direct follow-up)
  sharedKeywords: string[];
  coreTaskConflict: boolean;
  currentTaskIntent: string;
  previousTaskIntent: string;
  reason: string;
}

export interface ContextFilterResult {
  filteredHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  activeTaskPriorityAffirmed: boolean;
  suppressedCount: number;
  evaluationLog: string[];
}

// Action & Artifact signature extractors
interface RequestSignature {
  actionType: 'game' | 'image' | 'video' | 'training_plan' | 'code' | 'writing' | 'chat' | 'unknown';
  domainTopic: string;
  isFollowUp: boolean;
}

function extractRequestSignature(text: string): RequestSignature {
  const lower = text.toLowerCase().trim();

  // Follow-up pronoun / modifier markers
  const followUpSignals = [
    /\b(it|this|that|them|previous|earlier|again|continue|more|also|instead|change it|update it|modify it|add to it)\b/i,
    /^(make it|can you make it|change the|add|now add|now make|also add)/i,
  ];
  const isFollowUp = followUpSignals.some((p) => p.test(lower)) && lower.split(/\s+/).length < 12;

  // Action / Output Type signatures
  let actionType: RequestSignature['actionType'] = 'unknown';

  if (/\b(game|play|gameplay|playable|fps game|fifa|simulator|arcade|webgl game|threejs game)\b/i.test(lower)) {
    actionType = 'game';
  } else if (/\b(training plan|workout plan|exercise plan|drills|schedule|curriculum|routine|training)\b/i.test(lower)) {
    actionType = 'training_plan';
  } else if (/\b(image|picture|photo|illustration|render|poster|wallpaper)\b/i.test(lower)) {
    actionType = 'image';
  } else if (/\b(video|clip|footage|movie|trailer|animation)\b/i.test(lower)) {
    actionType = 'video';
  } else if (/\b(build a website|write code|implement|component|api|app|function|react|typescript)\b/i.test(lower)) {
    actionType = 'code';
  } else if (/\b(story|poem|essay|prose|lyrics|manifesto)\b/i.test(lower)) {
    actionType = 'writing';
  } else if (lower.length < 40 && /\b(hi|hello|hey|thanks|ok)\b/i.test(lower)) {
    actionType = 'chat';
  }

  // Domain topic extraction (e.g. "football", "astronomy", "ecommerce")
  const stopWords = new Set([
    'make', 'create', 'build', 'bro', 'please', 'give', 'the', 'and', 'for', 'with', 'ultra', 'realistic',
    'week', 'plan', 'game', 'a', 'an', 'to', 'in', 'of', 'me', 'want', 'i', 'can', 'you'
  ]);
  const words = lower.split(/[^a-z0-9_-]+/).filter((w) => w.length > 2 && !stopWords.has(w));
  const domainTopic = words[0] || 'general';

  return { actionType, domainTopic, isFollowUp };
}

/**
 * Evaluates whether a prior conversation turn is genuinely relevant to the current request.
 * Prevents contamination where a shared keyword ("football") falsely links completely different tasks
 * (e.g. "training plan" vs "ultra-realistic football game").
 */
export function evaluateContextRelevance(
  currentQuery: string,
  pastContent: string,
  pastRole: string = 'user'
): ContextRelevanceEvaluation {
  const currentSig = extractRequestSignature(currentQuery);
  const pastSig = extractRequestSignature(pastContent);

  // Find shared tokens (excluding basic stop words)
  const currentWords = new Set(
    currentQuery.toLowerCase().split(/[^a-z0-9_-]+/).filter((w) => w.length > 3)
  );
  const pastWords = new Set(
    pastContent.toLowerCase().split(/[^a-z0-9_-]+/).filter((w) => w.length > 3)
  );
  const sharedKeywords: string[] = [];
  currentWords.forEach((w) => {
    if (pastWords.has(w)) sharedKeywords.push(w);
  });

  // TASK CONFLICT RULE:
  // If the current request explicitly specifies a distinct artifact/action (e.g. 'game')
  // and the past message had a different action (e.g. 'training_plan'),
  // they are in CONFLICT. Shared topic keywords (e.g. 'football') DO NOT override this conflict!
  const hasActionConflict =
    currentSig.actionType !== 'unknown' &&
    pastSig.actionType !== 'unknown' &&
    currentSig.actionType !== pastSig.actionType;

  if (hasActionConflict) {
    return {
      isRelevant: false,
      relevanceScore: 0.05,
      sharedKeywords,
      coreTaskConflict: true,
      currentTaskIntent: currentSig.actionType.toUpperCase(),
      previousTaskIntent: pastSig.actionType.toUpperCase(),
      reason: `Context Contamination Prevented: Shared domain keyword(s) [${sharedKeywords.join(', ')}], but current task is '${currentSig.actionType}' while past context was '${pastSig.actionType}'. Current user request has absolute priority.`,
    };
  }

  // If current request is a genuine follow-up and action types are compatible
  if (currentSig.isFollowUp && (currentSig.actionType === pastSig.actionType || currentSig.actionType === 'unknown')) {
    return {
      isRelevant: true,
      relevanceScore: 0.9,
      sharedKeywords,
      coreTaskConflict: false,
      currentTaskIntent: currentSig.actionType.toUpperCase(),
      previousTaskIntent: pastSig.actionType.toUpperCase(),
      reason: 'Valid follow-up refinement detected matching previous context.',
    };
  }

  // If both have the same specific action type and shared domain topic
  if (currentSig.actionType === pastSig.actionType && currentSig.actionType !== 'unknown') {
    return {
      isRelevant: true,
      relevanceScore: 0.75,
      sharedKeywords,
      coreTaskConflict: false,
      currentTaskIntent: currentSig.actionType.toUpperCase(),
      previousTaskIntent: pastSig.actionType.toUpperCase(),
      reason: `Compatible action type '${currentSig.actionType}' across conversational turns.`,
    };
  }

  // Default: uncoupled, zero relevance, do not allow past context to bleed
  return {
    isRelevant: false,
    relevanceScore: 0.1,
    sharedKeywords,
    coreTaskConflict: false,
    currentTaskIntent: currentSig.actionType.toUpperCase(),
    previousTaskIntent: pastSig.actionType.toUpperCase(),
    reason: 'Independent new task initiated. Previous context suppressed to preserve task integrity.',
  };
}

/**
 * Filters the conversation history for a new user query.
 * Drops contaminated or conflicting past turns so that the active user request has 100% priority.
 */
export function filterConversationContext(
  currentQuery: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): ContextFilterResult {
  if (!history || history.length === 0) {
    return {
      filteredHistory: [],
      activeTaskPriorityAffirmed: true,
      suppressedCount: 0,
      evaluationLog: ['No historical context present.'],
    };
  }

  const evaluationLog: string[] = [];
  const filteredHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  let suppressedCount = 0;

  for (let i = 0; i < history.length; i++) {
    const turn = history[i];
    const evaluation = evaluateContextRelevance(currentQuery, turn.content, turn.role);

    if (evaluation.isRelevant) {
      filteredHistory.push(turn);
      evaluationLog.push(`[ACCEPTED] Turn ${i + 1} (${turn.role}): ${evaluation.reason}`);
    } else {
      suppressedCount++;
      evaluationLog.push(`[SUPPRESSED] Turn ${i + 1} (${turn.role}): ${evaluation.reason}`);
    }
  }

  return {
    filteredHistory,
    activeTaskPriorityAffirmed: true,
    suppressedCount,
    evaluationLog,
  };
}
