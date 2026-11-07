/**
 * MAX Business Architecture - Consequential Action Safety Guard
 *
 * Directives:
 * - Do not automatically run every tool.
 * - Require user confirmation before consequential external actions.
 * - Inspect payloads, evaluate risk level, simulate before/after state,
 *   and prevent unintended data mutations, API writes, or financial disbursements.
 */

import { ConsequentialActionRequest, ActionRiskLevel, ActionReversibility } from './types';

export class ConsequentialActionGuard {
  private pendingActions: Map<string, ConsequentialActionRequest> = new Map();
  private auditLog: ConsequentialActionRequest[] = [];

  /**
   * Determine if an operation represents a consequential external action
   */
  public evaluateOperation(
    actionType: ConsequentialActionRequest['actionType'],
    title: string,
    description: string,
    targetSystem: string,
    payload: Record<string, any>,
    options?: {
      estimatedFinancialImpactUsd?: number;
      affectedEntitiesCount?: number;
      customRiskLevel?: ActionRiskLevel;
      reversibility?: ActionReversibility;
    }
  ): { isConsequential: boolean; actionRequest?: ConsequentialActionRequest } {
    // High-consequence action signatures
    const highRiskTypes = [
      'erp_mutation',
      'purchase_order_placement',
      'budget_reallocation',
      'bulk_email_dispatch',
      'contract_dispatch',
    ];

    const isConsequential =
      highRiskTypes.includes(actionType) ||
      (options?.estimatedFinancialImpactUsd ?? 0) > 500 ||
      (options?.affectedEntitiesCount ?? 0) > 10;

    let riskLevel: ActionRiskLevel = options?.customRiskLevel || 'moderate';
    if ((options?.estimatedFinancialImpactUsd ?? 0) > 10000 || actionType === 'budget_reallocation') {
      riskLevel = 'critical';
    } else if (actionType === 'bulk_email_dispatch' && (options?.affectedEntitiesCount ?? 0) > 50) {
      riskLevel = 'high';
    } else if (actionType === 'crm_update' && (options?.affectedEntitiesCount ?? 0) <= 5) {
      riskLevel = 'low';
    }

    const reversibility: ActionReversibility =
      options?.reversibility || (actionType === 'bulk_email_dispatch' || actionType === 'contract_dispatch' ? 'irreversible' : 'partially_reversible');

    const actionId = `action_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const actionRequest: ConsequentialActionRequest = {
      actionId,
      actionType,
      title,
      description,
      targetSystem,
      riskLevel,
      reversibility,
      requiresUserConfirmation: isConsequential,
      status: isConsequential ? 'pending_confirmation' : 'approved',
      estimatedFinancialImpactUsd: options?.estimatedFinancialImpactUsd,
      affectedEntitiesCount: options?.affectedEntitiesCount,
      simulationPreview: {
        beforeState: payload.beforeState || { status: 'current_active', modifiedRecords: 0 },
        afterState: payload.afterState || { status: 'pending_execution', modifiedRecords: options?.affectedEntitiesCount || 1 },
        potentialDownside:
          options?.estimatedFinancialImpactUsd && options.estimatedFinancialImpactUsd > 0
            ? `Disburses or shifts $${options.estimatedFinancialImpactUsd.toLocaleString()} from available working capital.`
            : `Mutates live data records in ${targetSystem} with potential downstream operational disruption.`,
        rollbackPlan:
          reversibility === 'irreversible'
            ? 'Cannot be automatically rolled back. Requires manual administrative intervention.'
            : 'Automated snapshot available for 24 hours. Can revert via MAX system recovery.',
      },
      timestamp: Date.now(),
    };

    if (isConsequential) {
      this.pendingActions.set(actionId, actionRequest);
    }
    this.auditLog.push(actionRequest);

    return { isConsequential, actionRequest };
  }

  /**
   * User Approves the Action
   */
  public approveAction(actionId: string): { success: boolean; action?: ConsequentialActionRequest; message: string } {
    const action = this.pendingActions.get(actionId);
    if (!action) {
      return { success: false, message: `Action ${actionId} not found or already resolved.` };
    }

    action.status = 'approved';
    this.pendingActions.delete(actionId);
    return {
      success: true,
      action,
      message: `Action "${action.title}" confirmed by user and authorized for execution on ${action.targetSystem}.`,
    };
  }

  /**
   * User Rejects the Action
   */
  public rejectAction(actionId: string, reason?: string): { success: boolean; action?: ConsequentialActionRequest; message: string } {
    const action = this.pendingActions.get(actionId);
    if (!action) {
      return { success: false, message: `Action ${actionId} not found or already resolved.` };
    }

    action.status = 'rejected';
    this.pendingActions.delete(actionId);
    return {
      success: true,
      action,
      message: `Action "${action.title}" was blocked by user. Reason: ${reason || 'User declined execution'}. Target system was not modified.`,
    };
  }

  /**
   * List all pending action requests waiting for confirmation
   */
  public getPendingActions(): ConsequentialActionRequest[] {
    return Array.from(this.pendingActions.values());
  }

  /**
   * List entire audit log
   */
  public getAuditLog(): ConsequentialActionRequest[] {
    return [...this.auditLog];
  }
}

export const consequentialActionGuard = new ConsequentialActionGuard();
