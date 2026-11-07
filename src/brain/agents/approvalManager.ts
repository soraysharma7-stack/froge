/**
 * FROGÉ Agent Architecture - Human-in-the-Loop Approval Manager
 * Intercepts high-impact, mutating, or costly agent actions and requires
 * explicit operator approval before execution continues.
 */

import { AgentId, ApprovalRequest } from './types';
import { agentAuditLogger } from './logger';

export class AgentApprovalManager {
  private requests: Map<string, ApprovalRequest> = new Map();
  private listeners: Array<(req: ApprovalRequest) => void> = [];

  public createApprovalRequest(params: {
    agentId: AgentId;
    taskId: string;
    actionTitle: string;
    description: string;
    riskLevel: 'medium' | 'high' | 'critical';
    riskCategory: 'financial' | 'data_mutation' | 'external_communication' | 'code_execution' | 'policy_boundary';
    simulationDiff?: {
      before: Record<string, any>;
      after: Record<string, any>;
      impactSummary: string;
    };
    estimatedCostUsd?: number;
  }): ApprovalRequest {
    const requestId = `appr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const req: ApprovalRequest = {
      requestId,
      agentId: params.agentId,
      taskId: params.taskId,
      actionTitle: params.actionTitle,
      description: params.description,
      riskLevel: params.riskLevel,
      riskCategory: params.riskCategory,
      requestedAt: Date.now(),
      status: 'pending',
      simulationDiff: params.simulationDiff,
      estimatedCostUsd: params.estimatedCostUsd,
    };

    this.requests.set(requestId, req);

    agentAuditLogger.log(
      params.agentId,
      'approval',
      'approval',
      `🔒 APPROVAL REQUIRED: [${params.riskLevel.toUpperCase()}] "${params.actionTitle}" requires operator confirmation`,
      { requestId, riskCategory: params.riskCategory, estimatedCostUsd: params.estimatedCostUsd },
      params.taskId
    );

    this.notify(req);
    return req;
  }

  public approveRequest(requestId: string, approverName: string = 'Authorized Operator'): boolean {
    const req = this.requests.get(requestId);
    if (!req || req.status !== 'pending') return false;

    req.status = 'approved';
    req.approver = approverName;
    req.respondedAt = Date.now();

    agentAuditLogger.log(
      req.agentId,
      'approval',
      'approval',
      `✅ ACTION APPROVED: "${req.actionTitle}" approved by ${approverName}`,
      { requestId, approver: approverName },
      req.taskId
    );

    this.notify(req);
    return true;
  }

  public rejectRequest(requestId: string, reason: string = 'Operator rejected execution'): boolean {
    const req = this.requests.get(requestId);
    if (!req || req.status !== 'pending') return false;

    req.status = 'rejected';
    req.respondedAt = Date.now();

    agentAuditLogger.log(
      req.agentId,
      'warn',
      'approval',
      `❌ ACTION REJECTED: "${req.actionTitle}" was declined (${reason})`,
      { requestId, reason },
      req.taskId
    );

    this.notify(req);
    return true;
  }

  public getPendingRequests(): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter((r) => r.status === 'pending');
  }

  public getAllRequests(): ApprovalRequest[] {
    return Array.from(this.requests.values()).sort((a, b) => b.requestedAt - a.requestedAt);
  }

  public getRequest(requestId: string): ApprovalRequest | undefined {
    return this.requests.get(requestId);
  }

  public subscribe(callback: (req: ApprovalRequest) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(req: ApprovalRequest): void {
    for (const listener of this.listeners) {
      try {
        listener(req);
      } catch (e) {
        console.error('Error notifying approval listener:', e);
      }
    }
  }
}

export const agentApprovalManager = new AgentApprovalManager();
