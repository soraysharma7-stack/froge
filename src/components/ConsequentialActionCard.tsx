import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Lock,
  Layers,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { ConsequentialActionRequest, ActionConfirmationStatus } from '../brain/max/types';
import { consequentialActionGuard } from '../brain/max/consequentialActionGuard';

interface ConsequentialActionCardProps {
  action: ConsequentialActionRequest;
  onStatusChange?: (updatedAction: ConsequentialActionRequest) => void;
}

export const ConsequentialActionCard: React.FC<ConsequentialActionCardProps> = ({
  action,
  onStatusChange,
}) => {
  const [currentStatus, setCurrentStatus] = useState<ActionConfirmationStatus>(action.status);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = consequentialActionGuard.approveAction(action.actionId);
      setIsProcessing(false);
      if (res.success && res.action) {
        setCurrentStatus('approved');
        setFeedbackMessage(res.message);
        if (onStatusChange) onStatusChange(res.action);
      }
    }, 400);
  };

  const handleReject = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = consequentialActionGuard.rejectAction(action.actionId, 'Blocked by operator in MAX confirmation panel');
      setIsProcessing(false);
      if (res.success && res.action) {
        setCurrentStatus('rejected');
        setFeedbackMessage(res.message);
        if (onStatusChange) onStatusChange(res.action);
      }
    }, 300);
  };

  return (
    <div
      id={`consequential-action-${action.actionId}`}
      className={`my-3 rounded-xl border-2 transition-all duration-200 overflow-hidden text-xs ${
        currentStatus === 'pending_confirmation'
          ? 'border-amber-300 bg-amber-50/30 shadow-xs'
          : currentStatus === 'approved'
          ? 'border-emerald-300 bg-emerald-50/20'
          : 'border-zinc-300 bg-zinc-50 opacity-90'
      }`}
    >
      {/* Header Banner */}
      <div className="px-3.5 py-2.5 bg-white border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              currentStatus === 'pending_confirmation'
                ? 'bg-amber-100 text-amber-800'
                : currentStatus === 'approved'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            {currentStatus === 'pending_confirmation' ? (
              <ShieldAlert className="w-4 h-4" />
            ) : currentStatus === 'approved' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 text-xs">{action.title}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getRiskBadge(action.riskLevel)}`}>
                {action.riskLevel.toUpperCase()} RISK
              </span>
            </div>
            <span className="text-[10px] text-zinc-500">Target: {action.targetSystem}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              currentStatus === 'pending_confirmation'
                ? 'bg-amber-100 text-amber-800 animate-pulse'
                : currentStatus === 'approved'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            {currentStatus === 'pending_confirmation'
              ? 'Awaiting Approval'
              : currentStatus === 'approved'
              ? 'Authorized & Executed'
              : 'Declined / Blocked'}
          </span>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-3.5 space-y-3 bg-white/80">
        <p className="text-zinc-700 leading-relaxed text-xs">{action.description}</p>

        {/* Impact & Scope Grid */}
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200">
            <span className="text-zinc-500 text-[10px] block">Financial Impact</span>
            <span className="font-bold text-zinc-900">
              {action.estimatedFinancialImpactUsd
                ? `$${action.estimatedFinancialImpactUsd.toLocaleString()}`
                : 'Zero Direct Cost'}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200">
            <span className="text-zinc-500 text-[10px] block">Entities Affected</span>
            <span className="font-bold text-zinc-900">{action.affectedEntitiesCount || 1} Record(s)</span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200">
            <span className="text-zinc-500 text-[10px] block">Reversibility</span>
            <span className="font-bold capitalize text-zinc-900">{action.reversibility.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Before vs After Simulation Preview */}
        {action.simulationPreview && (
          <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px]">
            <div className="font-semibold text-zinc-800 text-[11px] mb-1 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-zinc-500" />
              <span>Simulated State Transition Preview</span>
            </div>
            <div className="grid grid-cols-2 gap-2 my-1">
              <div className="p-1.5 rounded bg-zinc-100 text-zinc-700 font-mono text-[10px]">
                <span className="font-bold text-zinc-500 block mb-0.5">Current State:</span>
                {JSON.stringify(action.simulationPreview.beforeState, null, 1)}
              </div>
              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-900 font-mono text-[10px]">
                <span className="font-bold text-emerald-700 block mb-0.5">Projected State:</span>
                {JSON.stringify(action.simulationPreview.afterState, null, 1)}
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              <strong className="text-zinc-700">Downside Notice:</strong> {action.simulationPreview.potentialDownside}
            </p>
          </div>
        )}

        {/* Feedback Message */}
        {feedbackMessage && (
          <div
            className={`p-2.5 rounded-lg text-[11px] flex items-start gap-1.5 ${
              currentStatus === 'approved'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
            }`}
          >
            {currentStatus === 'approved' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
            )}
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Confirmation Action Buttons */}
        {currentStatus === 'pending_confirmation' && (
          <div className="pt-2 flex items-center justify-between border-t border-zinc-200">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Explicit operator confirmation required by safety protocol</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                id={`reject-btn-${action.actionId}`}
                onClick={handleReject}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                <span>Decline / Cancel</span>
              </button>
              <button
                id={`approve-btn-${action.actionId}`}
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                {isProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Authorize & Execute</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
