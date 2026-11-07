/**
 * FROGÉ Brain - Intent Understanding Module
 *
 * Stage 1: Ingests the raw user query, tokenizes semantic signals,
 * extracts entities, identifies the user's primary goal, and calculates query complexity.
 */

import { BrainRequest, IntentUnderstanding, BrainComplexityCategory } from './types';

export function understandIntent(request: BrainRequest): IntentUnderstanding {
  const query = request.query || '';
  const normalizedQuery = query.toLowerCase().trim();

  // Extract keywords and entities
  const rawWords = query
    .split(/[\s,.:;!?"'()\[\]{}]+/)
    .filter((w) => w.length > 2);

  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'what',
    'how', 'why', 'can', 'you', 'please', 'tell', 'about', 'make', 'give',
    'show', 'will', 'would', 'could', 'should', 'some', 'than', 'them',
  ]);

  const semanticKeywords = rawWords
    .map((w) => w.toLowerCase())
    .filter((w) => !stopWords.has(w))
    .slice(0, 10);

  // Entity extraction heuristics
  const detectedEntities: string[] = [];
  const entityMatches = query.match(/\b([A-Z][a-zA-Z0-9_-]+|\b(?:TypeScript|React|Python|JavaScript|AWS|Docker|Kubernetes|Google|PostgreSQL|GraphQL|OpenAI|FROGÉ)\b)/g);
  if (entityMatches) {
    entityMatches.forEach((match) => {
      const trimmed = match.trim();
      if (!detectedEntities.includes(trimmed) && trimmed.length > 2) {
        detectedEntities.push(trimmed);
      }
    });
  }

  // Check for Level 0 - Casual Greetings, Acknowledgments, Thanks (Fast Path)
  const strippedPunctuation = normalizedQuery.replace(/[\s!.,?]+$/, '').trim();
  const casualExactMatches = new Set([
    'hey',
    'hi',
    'hello',
    'hey there',
    'hi there',
    'hello there',
    'thanks',
    'thank you',
    'thanks a lot',
    'thank you so much',
    'good morning',
    'good evening',
    'good afternoon',
    'good day',
    'good night',
    'how are you',
    'how are you doing',
    "what's up",
    'whats up',
    'what is up',
    'sup',
    'yo',
    'okay',
    'ok',
    'k',
    'cool',
    'nice',
    'great',
    'bye',
    'goodbye',
    'see ya',
    'cheers',
    'namaste',
  ]);

  const isCasual =
    casualExactMatches.has(strippedPunctuation) ||
    /^(hey|hi|hello|thanks|thank you|good morning|good evening|good afternoon|how are you|what'?s up|whats up|sup|yo|ok|okay)[\s!.,?]*$/i.test(
      normalizedQuery
    );

  // Check for Level 1 - Simple questions (e.g. "What is 2+2?", "What is 5+5?", "What does HTML mean?")
  const simpleMathPattern = /^(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)\s*\??$/;
  const isSimpleQuestion =
    !isCasual &&
    (simpleMathPattern.test(strippedPunctuation) ||
      /^what (is|are) \d+\s*[\+\-\*\/]\s*\d+\??$/i.test(strippedPunctuation) ||
      /^what does [a-z0-9]+ mean\??$/i.test(strippedPunctuation) ||
      (normalizedQuery.length < 35 && /^what is [a-z0-9]+\??$/i.test(strippedPunctuation)));

  // Check for Level 4 - High Complexity (Full application, multi-source research, complex planning)
  const isHighComplexity =
    /\b(build a (complete|full|production) (app|application|website|system)|build a website|research .* deeply|research .* using multiple sources|full-stack architecture|enterprise multi-agent)\b/i.test(
      normalizedQuery
    ) || (query.length > 500 && normalizedQuery.includes('build'));

  // Check for multi-clause complexity markers (Level 3 - Complex)
  const complexMarkers = [
    'compare and contrast',
    'trade-offs',
    'step by step',
    'architecture',
    'first principles',
    'mathematical proof',
    'root cause',
    'edge cases',
    'scalability',
    'consequences',
    'game theory',
    'optimization',
    'difficult physics problem',
    'debug this',
    'debug this code',
    'solve this difficult',
  ];

  let complexMarkerHits = 0;
  complexMarkers.forEach((marker) => {
    if (normalizedQuery.includes(marker)) {
      complexMarkerHits++;
    }
  });

  // Calculate complexity score & tier
  let complexityScore = 0.3; // baseline
  let complexityCategory: BrainComplexityCategory = 'normal';
  let complexityTier: 0 | 1 | 2 | 3 | 4 = 2;
  let isFastPath = false;

  if (isCasual) {
    complexityScore = 0.05;
    complexityCategory = 'casual';
    complexityTier = 0;
    isFastPath = true;
  } else if (isSimpleQuestion) {
    complexityScore = 0.2;
    complexityCategory = 'simple';
    complexityTier = 1;
    isFastPath = true;
  } else if (isHighComplexity) {
    complexityScore = 0.95;
    complexityCategory = 'high_complexity';
    complexityTier = 4;
  } else if (complexMarkerHits > 0 || normalizedQuery.includes('debug') || normalizedQuery.includes('compare')) {
    complexityScore = Math.min(0.85, 0.65 + complexMarkerHits * 0.1);
    complexityCategory = 'complex';
    complexityTier = 3;
  } else {
    // Normal (Level 2)
    const lengthFactor = Math.min(query.length / 400, 0.3);
    complexityScore = Math.min(0.6, 0.3 + lengthFactor);
    complexityCategory = 'normal';
    complexityTier = 2;
  }

  let complexityLevel: 'low' | 'medium' | 'high' | 'expert' = 'medium';
  if (complexityTier === 0 || complexityTier === 1) complexityLevel = 'low';
  else if (complexityTier === 2) complexityLevel = 'medium';
  else if (complexityTier === 3) complexityLevel = 'high';
  else complexityLevel = 'expert';

  // -------------------------------------------------------------
  // Step 1: User Input Analysis (NLU & Intent Recognition)
  // -------------------------------------------------------------
  // A. Sentiment & Tone Detection
  let sentiment: IntentUnderstanding['sentiment'] = 'neutral';
  let detectedTone = 'balanced_and_informative';

  if (isCasual) {
    sentiment = 'casual';
    detectedTone = 'casual_friendly';
  } else if (/\b(frustrat|annoy|hate|fail|broken|stuck|terrible|horrible|why won'?t|doesn'?t work|can'?t get)\b/i.test(query)) {
    sentiment = 'frustrated';
    detectedTone = 'frustrated_needs_empathy';
  } else if (/\b(stress|overwhelm|deadline|freaking out|panic|worried|anxious)\b/i.test(query)) {
    sentiment = 'stressed';
    detectedTone = 'stressed_needs_support';
  } else if (/\b(confus|don'?t get|don'?t understand|lost|unclear|what does this mean|how is that possible)\b/i.test(query)) {
    sentiment = 'confused';
    detectedTone = 'confused_needs_clarity';
  } else if (/\b(awesome|great|love|amazing|excited|wow|yay|finally|fantastic|brilliant)\b/i.test(query)) {
    sentiment = 'excited';
    detectedTone = 'enthusiastic_and_celebratory';
  } else if (/\b(urgent|asap|critical|emergency|immediately|right now|production down)\b/i.test(query)) {
    sentiment = 'urgent';
    detectedTone = 'urgent_and_direct';
  } else if (/\b(analyze|evaluate|compare|audit|benchmark|statistics|metrics|variance)\b/i.test(query)) {
    sentiment = 'analytical';
    detectedTone = 'analytical_precision';
  } else if (/\b(why|how|what if|explain|curious|wondering|tell me about)\b/i.test(query)) {
    sentiment = 'curious';
    detectedTone = 'curious_and_exploratory';
  } else if (/\b(story|poem|imagine|write|create|compose|artistic|narrative)\b/i.test(query)) {
    sentiment = 'creative';
    detectedTone = 'imaginative_and_expressive';
  }

  // B. Entity & Parameter Extraction
  const extractedDetails: string[] = [];
  const numbersFound = query.match(/\b\d+(?:\.\d+)?\b/g);
  if (numbersFound) {
    extractedDetails.push(`Quantities: ${numbersFound.slice(0, 3).join(', ')}`);
  }

  // -------------------------------------------------------------
  // Step 2: Friendly Human Response Framing Alignment
  // -------------------------------------------------------------
  let warmOpening = 'Hello! ';
  let empathyNote: string | undefined = undefined;
  let interactiveFollowUp = 'Does this answer what you were looking for, or would you like to explore deeper?';

  if (sentiment === 'frustrated') {
    warmOpening = 'I completely understand how frustrating that can be. Let’s get this sorted out together!';
    empathyNote = 'Acknowledged difficulty and prioritized a quick, clear fix without lecturing.';
    interactiveFollowUp = 'Let me know if that clears up the issue, or if you encounter any other error messages!';
  } else if (sentiment === 'excited') {
    warmOpening = 'That sounds exciting! Happy to dive into this with you.';
    interactiveFollowUp = 'What would you like to build or explore next with this?';
  } else if (sentiment === 'confused') {
    warmOpening = 'No worries at all—let’s break this down into simple, intuitive steps:';
    empathyNote = 'Simplified complex terminology with intuitive everyday analogies.';
    interactiveFollowUp = 'Does this way of looking at it make sense, or should we walk through an example?';
  } else if (sentiment === 'casual') {
    warmOpening = 'Hey there! Great to chat with you.';
    interactiveFollowUp = 'How can I help you today?';
  } else if (sentiment === 'urgent') {
    warmOpening = 'Here is the direct solution right away:';
    interactiveFollowUp = 'Let me know if you need any adjustments or immediate next steps.';
  } else if (sentiment === 'curious') {
    warmOpening = `Great question! Here is a clear look at how this works:`;
    interactiveFollowUp = 'Would you like to explore any specific part of this in more detail?';
  }

  const conversationalAlignment = {
    warmOpening,
    empathyNote,
    interactiveFollowUp,
  };

  // Implicit needs
  const implicitNeeds: string[] = [];
  if (isCasual) {
    implicitNeeds.push('rapid_response', 'courteous_conciseness');
  } else if (isSimpleQuestion) {
    implicitNeeds.push('concise_factual_accuracy');
  } else {
    if (query.includes('?') && !normalizedQuery.includes('code')) {
      implicitNeeds.push('pedagogical_clarity');
    }
    if (normalizedQuery.includes('code') || normalizedQuery.includes('function') || normalizedQuery.includes('bug')) {
      implicitNeeds.push('type_safety', 'syntactic_correctness', 'complexity_analysis');
    }
    if (normalizedQuery.includes('business') || normalizedQuery.includes('plan') || normalizedQuery.includes('strategy')) {
      implicitNeeds.push('risk_mitigation', 'actionable_milestones');
    }
    if (normalizedQuery.includes('remember') || normalizedQuery.includes('my favorite') || normalizedQuery.includes('recall')) {
      implicitNeeds.push('state_persistence', 'context_continuity');
    }
  }

  // Extract requested action
  let requestedAction = 'explain';
  if (isCasual) {
    requestedAction = 'greet';
  } else if (/\b(list|all dates|chronological|table|enumerate)\b/i.test(normalizedQuery)) {
    requestedAction = 'list';
  } else if (/\b(calculate|compute|math|distance|solve|formula)\b/i.test(normalizedQuery)) {
    requestedAction = 'calculate';
  } else if (/\b(code|debug|write a function|refactor|script|program)\b/i.test(normalizedQuery)) {
    requestedAction = 'code';
  } else if (/\b(compare|contrast|difference between|versus|vs)\b/i.test(normalizedQuery)) {
    requestedAction = 'compare';
  } else if (/\b(summarize|summary|tldr)\b/i.test(normalizedQuery)) {
    requestedAction = 'summarize';
  }

  // Extract constraints (e.g. timeframes, formatting, languages)
  const constraints: string[] = [];
  const timeframeMatch = normalizedQuery.match(/\b(from\s+20\d\d\s+to\s+20\d\d|between\s+20\d\d\s+and\s+20\d\d|in\s+20\d\d|20\d\d\s*-\s*20\d\d)\b/i);
  if (timeframeMatch) {
    constraints.push(`Timeframe: ${timeframeMatch[0]}`);
  }
  if (/\b(table|in a table|tabular)\b/i.test(normalizedQuery)) {
    constraints.push('Format: Markdown Table');
  }
  if (/\b(short|brief|one sentence|concise)\b/i.test(normalizedQuery)) {
    constraints.push('Length: Concise');
  }

  // Determine expected output type
  let expectedOutputType: IntentUnderstanding['expectedOutputType'] = 'explanation';
  if (isCasual) {
    expectedOutputType = 'conversation';
  } else if (/\b(table|dates from|chronological|list all)\b/i.test(normalizedQuery)) {
    expectedOutputType = normalizedQuery.includes('table') || normalizedQuery.includes('dates') ? 'chronological_table' : 'list';
  } else if (isSimpleQuestion) {
    expectedOutputType = 'factual_answer';
  } else if (requestedAction === 'code') {
    expectedOutputType = 'coding_task';
  } else if (requestedAction === 'calculate') {
    expectedOutputType = 'calculation';
  }

  // Extract subject
  let extractedSubject = semanticKeywords.slice(0, 4).join(' ');
  if (normalizedQuery.includes('earth') && normalizedQuery.includes('mars')) {
    extractedSubject = 'Earth–Mars Closest Approaches and Oppositions';
  } else if (normalizedQuery.includes('photosynthesis')) {
    extractedSubject = 'Photosynthesis';
  }

  // User goal summarization
  let userGoal = '';
  if (isCasual) {
    userGoal = 'Casual greeting / conversational acknowledgment';
  } else if (isSimpleQuestion) {
    userGoal = `Provide simple answer for "${query.trim()}"`;
  } else {
    const trimmedQuery = query.length > 70 ? query.slice(0, 67) + '...' : query;
    userGoal = `Synthesize direct, high-fidelity solution for "${trimmedQuery}"`;
  }

  const confidence = Math.min(0.98, isCasual ? 0.99 : 0.75 + (semanticKeywords.length > 3 ? 0.15 : 0.05));

  return {
    rawQuery: query,
    normalizedQuery,
    detectedEntities,
    extractedSubject,
    requestedAction,
    constraints,
    expectedOutputType,
    userGoal,
    implicitNeeds,
    semanticKeywords,
    sentiment,
    detectedTone,
    conversationalAlignment,
    complexityScore: Number(complexityScore.toFixed(2)),
    complexityLevel,
    complexityCategory,
    complexityTier,
    isFastPath,
    confidence: Number(confidence.toFixed(2)),
  };
}
