import React, { useState } from 'react';
import { CognitiveExploration, BrainProcessingResult } from '../types';
import {
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Compass,
  Cpu,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface CognitivePanelProps {
  cognitiveExploration: CognitiveExploration;
  brainDetails?: BrainProcessingResult;
}

export const CognitivePanel: React.FC<CognitivePanelProps> = ({
  cognitiveExploration,
  brainDetails,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showArchitectureDetails, setShowArchitectureDetails] = useState(false);

  const {
    explanation = '',
    conclusions = [],
    evidence = [],
    uncertainty = { level: 'low' as const, reason: '' },
    intentSummary = '',
  } = cognitiveExploration || {};

  const displayTaskName =
    intentSummary ||
    (cognitiveExploration?.taskClassification?.primaryTask
      ? cognitiveExploration.taskClassification.primaryTask.replace('_', ' ').toUpperCase()
      : 'SYNTHESIS');

  const uncertaintyLevel = uncertainty?.level || 'low';
  const uncertaintyBadge = {
    low: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'High Confidence',
      icon: CheckCircle2,
    },
    moderate: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Moderate Uncertainty',
      icon: AlertCircle,
    },
    high: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'High Uncertainty',
      icon: HelpCircle,
    },
  }[uncertaintyLevel] || {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'High Confidence',
    icon: CheckCircle2,
  };

  const UncertaintyIcon = uncertaintyBadge.icon;

  return (
    <div className="my-2.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-zinc-50/80 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <BrainCircuit className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold text-zinc-900 tracking-tight">
            FROGÉ Brain Synthesis
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200/60">
            {displayTaskName}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Calibrated Uncertainty Badge */}
          <div
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-semibold ${uncertaintyBadge.bg}`}
            title={'notes' in uncertainty ? uncertainty.notes : (uncertainty as any).reason || 'Calibrated low uncertainty'}
          >
            <UncertaintyIcon className="w-2.5 h-2.5" />
            <span>
              {uncertaintyBadge.label} (
              {'confidencePercentage' in uncertainty
                ? uncertainty.confidencePercentage
                : 95}
              %)
            </span>
          </div>

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 px-1.5 py-0.5 rounded hover:bg-zinc-100 transition-colors"
          >
            <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Main Explanations & Conclusions Preview (Always visible summary, detailed when expanded) */}
      <div className="p-3 sm:p-3.5 space-y-2.5">
        {/* Useful Explanation */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 mb-0.5">
            <Info className="w-3 h-3 text-emerald-600" />
            <span>Operational Explanation</span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed pl-4">
            {explanation}
          </p>
        </div>

        {/* Key Conclusions */}
        {(conclusions || []).length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 mb-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Core Conclusions</span>
            </div>
            <ul className="space-y-0.5 pl-4">
              {(conclusions || []).map((conc, idx) => (
                <li
                  key={idx}
                  className="text-xs text-zinc-700 flex items-start gap-1.5 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{conc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Expanded View: Verified Evidence, Uncertainty Notes, and Brain Pipeline */}
        {isExpanded && (
          <div className="pt-2.5 border-t border-zinc-100 space-y-2.5 animate-fade-in">
            {/* Supporting Evidence */}
            {(evidence || []).length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 mb-1">
                  <FileCheck className="w-3 h-3 text-blue-600" />
                  <span>Supporting Evidence & Grounding</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4">
                  {(evidence || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/70 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-zinc-800 mb-0.5">
                        <span className="truncate text-[11px]">{item.source}</span>
                        {item.verified && (
                          <span className="text-[9px] text-emerald-600 font-bold px-1 py-0.2 rounded bg-emerald-50 border border-emerald-200/50">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uncertainty Bounds */}
            <div className="p-2.5 rounded-lg bg-amber-50/40 border border-amber-200/50 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900 mb-0.5">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>Uncertainty Bounds & Edge Cases</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed pl-4">
                {'notes' in uncertainty ? uncertainty.notes : (uncertainty as any).reason || 'Calibrated low uncertainty.'}
              </p>
            </div>

            {/* Architecture Pipeline Trace (Modular Inspector) */}
            {brainDetails && (
              <div className="pt-1">
                <button
                  onClick={() => setShowArchitectureDetails(!showArchitectureDetails)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
                >
                  <Layers className="w-3 h-3 text-indigo-500" />
                  <span>
                    {showArchitectureDetails
                      ? 'Hide Modular Brain Architecture Flow'
                      : 'Inspect Modular Pipeline (Intent → Planner → Router → Tools → Verifier)'}
                  </span>
                </button>

                {showArchitectureDetails && (
                  <div className="mt-2 p-3 rounded-xl bg-zinc-900 text-zinc-200 text-xs font-mono space-y-1.5 border border-zinc-800">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1 text-[11px]">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> FROGÉ Brain Pipeline
                      </span>
                      <span className="text-zinc-400">
                        {brainDetails.executionDurationMs}ms execution
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px]">
                      <div>
                        <span className="text-indigo-400">1. Intent:</span>{' '}
                        {brainDetails.intent.primaryIntent} (confidence:{' '}
                        {(brainDetails.intent.confidence * 100).toFixed(0)}%, complexity:{' '}
                        {brainDetails.intent.complexity})
                      </div>
                      <div>
                        <span className="text-sky-400">2. Planner:</span> {brainDetails.plan.steps.length}{' '}
                        modular steps synthesized
                      </div>
                      <div>
                        <span className="text-emerald-400">3. Task Router:</span> {brainDetails.routing.route}{' '}
                        | Agents: [{brainDetails.routing.activeAgents.join(', ') || 'Direct'}]
                      </div>
                      {brainDetails.modelRouting && (
                        <div className="p-1.5 rounded bg-zinc-950/80 border border-zinc-800 space-y-0.5">
                          <div className="text-emerald-300 font-semibold flex items-center justify-between">
                            <span>4. Model Router: {brainDetails.modelRouting.selectedModelName}</span>
                            <span className="text-zinc-400 font-mono text-[9px]">
                              {brainDetails.modelRouting.selectedTier}
                            </span>
                          </div>
                          <div className="text-zinc-400 text-[10px]">
                            {brainDetails.modelRouting.routingRationale}
                          </div>
                          {brainDetails.usage && brainDetails.cost && (
                            <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-[9px] text-zinc-300 font-mono">
                              <span>
                                ⚡ {brainDetails.usage.totalTokens} tokens
                              </span>
                              <span className="text-emerald-400 font-semibold">
                                ${brainDetails.cost.totalCostUsd.toFixed(6)} ({brainDetails.cost.savingsPercentage}% savings)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <span className="text-amber-400">5. Verification:</span>{' '}
                        Factual Consistency {brainDetails.verification.factualConsistencyScore}%, Logic Soundness:{' '}
                        {brainDetails.verification.logicSoundness}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
