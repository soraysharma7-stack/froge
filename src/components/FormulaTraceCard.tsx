import React, { useState } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  Layers,
  TrendingUp,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { TransparentCalculationTrace } from '../brain/max/types';

interface FormulaTraceCardProps {
  trace: TransparentCalculationTrace;
  defaultExpanded?: boolean;
}

export const FormulaTraceCard: React.FC<FormulaTraceCardProps> = ({ trace, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'financial':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'sales':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'customer':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'inventory':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      id={`formula-trace-${trace.calculationId}`}
      className="my-2.5 rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden transition-all duration-150"
    >
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-50/70 hover:bg-zinc-100/80 cursor-pointer border-b border-zinc-100 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-zinc-900 truncate">{trace.metricName}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${getCategoryColor(trace.category)}`}>
                {trace.category.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono truncate">{trace.formulaPlain}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-xs font-bold text-zinc-900">{trace.formattedResult}</span>
            <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 font-medium">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>Trace Verified</span>
            </div>
          </div>
          <button className="text-zinc-400 hover:text-zinc-700 p-1">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Step-by-Step Breakdown */}
      {isExpanded && (
        <div className="p-3.5 space-y-3.5 bg-white text-xs">
          {/* Formula Display */}
          <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{trace.formulaPlain}</span>
            </div>
            <span className="text-[10px] text-zinc-400">Confidence: {(trace.confidenceScore * 100).toFixed(0)}%</span>
          </div>

          {/* Variables Table */}
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-zinc-800 text-[11px] mb-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              <span>Audited Input Variables ({trace.variables.length})</span>
            </div>
            <div className="rounded-lg border border-zinc-200 overflow-hidden text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                  <tr>
                    <th className="py-1.5 px-2.5 font-medium">Symbol</th>
                    <th className="py-1.5 px-2.5 font-medium">Variable Name</th>
                    <th className="py-1.5 px-2.5 font-medium">Value</th>
                    <th className="py-1.5 px-2.5 font-medium">Data Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(trace.variables || []).map((v, i) => (
                    <tr key={i} className="hover:bg-zinc-50/50">
                      <td className="py-1 px-2.5 font-mono font-bold text-amber-700">{v.symbol}</td>
                      <td className="py-1 px-2.5 text-zinc-800">{v.name}</td>
                      <td className="py-1 px-2.5 font-semibold text-zinc-900">
                        {typeof v.value === 'number' ? v.value.toLocaleString() : v.value} {v.unit || ''}
                      </td>
                      <td className="py-1 px-2.5 text-zinc-500 text-[10px]">{v.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Step-by-Step Arithmetic Calculation */}
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-zinc-800 text-[11px] mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
              <span>Step-by-Step Arithmetic Deduction ({(trace.steps || []).length} Steps)</span>
            </div>
            <div className="space-y-1.5">
              {(trace.steps || []).map((step) => (
                <div key={step.stepNumber} className="p-2 rounded-lg bg-zinc-50 border border-zinc-150 flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900 text-[11px]">{step.description}</span>
                      <span className="font-mono font-bold text-emerald-700 text-[11px]">{step.evaluatedResult}</span>
                    </div>
                    <div className="font-mono text-[10px] text-zinc-600 my-0.5">{step.expression}</div>
                    <p className="text-[10px] text-zinc-500">{step.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sensitivity Bounds or Notes */}
          {trace.notesAndCaveats && trace.notesAndCaveats.length > 0 && (
            <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[10px] text-amber-900 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                {(trace.notesAndCaveats || []).map((n, i) => (
                  <p key={i}>• {n}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
