import { ModelTier, TokenUsage, CostBreakdown } from './types';

/**
 * Model Tier Pricing Specifications (USD per 1 Million Tokens)
 * Standard industry benchmark rates (e.g. Flash Lite vs Flash vs Pro / Sonnet / o3-mini)
 */
export const TIER_PRICING: Record<
  ModelTier,
  {
    name: string;
    modelAlias: string;
    inputPricePerMillion: number;
    outputPricePerMillion: number;
    baselineComparisonTier: ModelTier;
  }
> = {
  efficient_lite: {
    name: 'FOG Neural Core v3 (Fast Lite)',
    modelAlias: 'fog-turbo-flow',
    inputPricePerMillion: 0.0,
    outputPricePerMillion: 0.0,
    baselineComparisonTier: 'deep_reasoning_escalated',
  },
  deep_reasoning_standard: {
    name: 'FOG Deep Reasoner Ultra',
    modelAlias: 'fog-deep-reasoner',
    inputPricePerMillion: 0.0,
    outputPricePerMillion: 0.0,
    baselineComparisonTier: 'deep_reasoning_escalated',
  },
  deep_reasoning_escalated: {
    name: 'FOG Deep Axiom Pro (Extended Thinking)',
    modelAlias: 'fog-deep-reasoner',
    inputPricePerMillion: 0.0,
    outputPricePerMillion: 0.0,
    baselineComparisonTier: 'deep_reasoning_escalated',
  },
  code_specialist: {
    name: 'FOG Code Matrix Pro (AST & Architecture)',
    modelAlias: 'fog-code-matrix',
    inputPricePerMillion: 0.0,
    outputPricePerMillion: 0.0,
    baselineComparisonTier: 'deep_reasoning_escalated',
  },
  max_single_model: {
    name: 'FOG MAX Executive Brain',
    modelAlias: 'fog-neural-core-v3',
    inputPricePerMillion: 0.0,
    outputPricePerMillion: 0.0,
    baselineComparisonTier: 'max_multi_orchestrator',
  },
  max_multi_orchestrator: {
    name: 'FOG Multi-Core Swarm Brain',
    modelAlias: 'fog-neural-core-v3',
    inputPricePerMillion: 0.0,
    outputPricePerMillion: 0.0,
    baselineComparisonTier: 'max_multi_orchestrator',
  },
  socratic_educator: {
    name: 'FOG Socratic Educator Brain',
    modelAlias: 'fog-neural-core-v3',
    inputPricePerMillion: 0.0,
    outputPricePerMillion: 0.0,
    baselineComparisonTier: 'deep_reasoning_escalated',
  },
};

/**
 * FOG Proprietary In-Computer Neural Models (फॉग कंपनी द्वारा निर्मित मॉडल)
 * 100% In-Computer Brain Processing - Zero External Cloud API Dependency
 */
export const FOG_MODELS: Record<
  string,
  {
    name: string;
    id: string;
    badge: string;
    inputPricePerMillion: number;
    outputPricePerMillion: number;
    description: string;
    accentColor: string;
  }
> = {
  'fog-neural-core-v3': {
    name: 'FOG Neural Core v3 (Flagship In-Computer Brain)',
    id: 'fog-neural-core-v3',
    badge: '100% On-Device Neural Core',
    inputPricePerMillion: 0.0,
    outputPricePerMillion: 0.0,
    description: 'फॉग कंपनी द्वारा निर्मित फ्लैगशिप न्यूरल मॉडल। समस्त इंटेलिजेंस और तर्क कंप्यूटर के आंतरिक न्यूरल आर्किटेक्चर में प्रोसेस होता है।',
    accentColor: '#10B981',
  },
  'fog-deep-reasoner': {
    name: 'FOG Deep Reasoner Ultra',
    id: 'fog-deep-reasoner',
    badge: 'Axiomatic Logic & Deduction',
    inputPricePerMillion: 0.0,
    outputPricePerMillion: 0.0,
    description: 'फॉग का उच्च-स्तरीय लॉजिकल और गणितीय विश्लेषण इंजन। जटिल समस्याओं का प्रथम सिद्धांतों से विश्लेषण।',
    accentColor: '#6366F1',
  },
  'fog-code-matrix': {
    name: 'FOG Code Matrix Pro',
    id: 'fog-code-matrix',
    badge: 'AST Syntax & Systems Code',
    inputPricePerMillion: 0.0,
    outputPricePerMillion: 0.0,
    description: 'फॉग का डेडिकेटेड कोड जनरेशन, डीबगिंग और सॉफ्टवेयर सिस्टम आर्किटेक्चर मॉडल।',
    accentColor: '#0EA5E9',
  },
  'fog-creative-pulse': {
    name: 'FOG Creative Pulse',
    id: 'fog-creative-pulse',
    badge: 'Generative Expressive Engine',
    inputPricePerMillion: 0.0,
    outputPricePerMillion: 0.0,
    description: 'फॉग का क्रिएटिव, लिटरेरी और मल्टीमॉडल कांसेप्ट डिजाइन मॉडल।',
    accentColor: '#EC4899',
  },
  'fog-turbo-flow': {
    name: 'FOG Turbo Flow (Sub-Millisecond)',
    id: 'fog-turbo-flow',
    badge: 'Zero-Latency Direct Stream',
    inputPricePerMillion: 0.0,
    outputPricePerMillion: 0.0,
    description: 'कंप्यूटर की मेमोरी में तुरंत रिस्पॉन्स देने वाला अल्ट्रा-फास्ट फॉग मॉडल।',
    accentColor: '#F59E0B',
  },
};

// Aliased for any legacy imports
export const CLAUDE_MODELS = FOG_MODELS;

/**
 * Fast subword/character token estimator (~4 chars per token for English / code)
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  // Subword heuristic: 1 token ≈ 3.8 to 4 characters
  const charEstimate = Math.ceil(trimmed.length / 3.8);
  const wordCount = trimmed.split(/\s+/).length;
  // Adjust for spaces and punctuation
  return Math.max(wordCount, charEstimate);
}

/**
 * Calculate token cost breakdown and savings vs unoptimized baseline
 */
export function calculateTierCost(tier: ModelTier, usage: TokenUsage): CostBreakdown {
  const pricing = TIER_PRICING[tier] || TIER_PRICING.efficient_lite;
  const baselinePricing = TIER_PRICING[pricing.baselineComparisonTier] || pricing;

  const inputCostUsd = (usage.promptTokens / 1_000_000) * pricing.inputPricePerMillion;
  const outputCostUsd = (usage.completionTokens / 1_000_000) * pricing.outputPricePerMillion;
  const totalCostUsd = inputCostUsd + outputCostUsd;

  // Compute what this would have cost with an unoptimized baseline (e.g. monolithic expensive model)
  const baselineInputCost = (usage.promptTokens / 1_000_000) * baselinePricing.inputPricePerMillion;
  const baselineOutputCost = (usage.completionTokens / 1_000_000) * baselinePricing.outputPricePerMillion;
  const baselineTotalCost = baselineInputCost + baselineOutputCost;

  const costSavingsVsBaselineUsd = Math.max(0, baselineTotalCost - totalCostUsd);
  const savingsPercentage =
    baselineTotalCost > 0
      ? Math.round((costSavingsVsBaselineUsd / baselineTotalCost) * 100)
      : 0;

  return {
    inputCostUsd: Number(inputCostUsd.toFixed(7)),
    outputCostUsd: Number(outputCostUsd.toFixed(7)),
    totalCostUsd: Number(totalCostUsd.toFixed(7)),
    costPerMillionInput: pricing.inputPricePerMillion,
    costPerMillionOutput: pricing.outputPricePerMillion,
    costSavingsVsBaselineUsd: Number(costSavingsVsBaselineUsd.toFixed(7)),
    savingsPercentage,
    currency: 'USD',
  };
}
