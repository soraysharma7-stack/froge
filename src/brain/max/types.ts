/**
 * MAX - Business-Assistance Architecture
 * Core Type Definitions
 *
 * Capabilities:
 * 1. Sales Analysis
 * 2. Business Data Analysis
 * 3. Reporting
 * 4. Dashboards
 * 5. Forecasting Assistance
 * 6. Customer Analysis
 * 7. Inventory Analysis
 * 8. Business Research
 * 9. Document Analysis
 * 10. Management Assistance
 * 11. Workflow Planning
 * 12. Controlled Agents & Consequential Action Guard
 *
 * Directives:
 * - Controlled Coordination: Do not run every tool automatically.
 * - Human-in-the-loop: Require confirmation before consequential external actions.
 * - Traceability: Keep all financial/business calculations transparent and traceable.
 */

// ==========================================
// 1. CAPABILITY DOMAINS
// ==========================================

export type MaxBusinessCapability =
  | 'sales_analysis'
  | 'business_data_analysis'
  | 'reporting'
  | 'dashboards'
  | 'forecasting_assistance'
  | 'customer_analysis'
  | 'inventory_analysis'
  | 'business_research'
  | 'document_analysis'
  | 'management_assistance'
  | 'workflow_planning'
  | 'controlled_agents';

// ==========================================
// 2. TRANSPARENT FORMULA TRACEABILITY
// ==========================================

export interface FormulaVariable {
  name: string;
  symbol: string;
  value: number | string;
  unit?: string;
  source: string;
  description: string;
}

export interface CalculationStep {
  stepNumber: number;
  description: string;
  expression: string;
  evaluatedResult: string | number;
  explanation: string;
}

export interface TransparentCalculationTrace {
  calculationId: string;
  metricName: string;
  category: 'financial' | 'operational' | 'sales' | 'inventory' | 'customer' | 'valuation';
  formulaLaTeX: string;
  formulaPlain: string;
  variables: FormulaVariable[];
  steps: CalculationStep[];
  finalResult: number | string;
  formattedResult: string;
  unit: string;
  confidenceScore: number; // 0.0 - 1.0
  notesAndCaveats: string[];
  sensitivityAnalysis?: {
    variableName: string;
    lowCase: { value: number; metricResult: number };
    baseCase: { value: number; metricResult: number };
    highCase: { value: number; metricResult: number };
  }[];
}

// ==========================================
// 3. CONSEQUENTIAL ACTION GUARD (SAFETY LAYER)
// ==========================================

export type ActionRiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type ActionReversibility = 'reversible' | 'partially_reversible' | 'irreversible';
export type ActionConfirmationStatus = 'pending_confirmation' | 'approved' | 'rejected' | 'executed' | 'cancelled';

export interface ConsequentialActionRequest {
  actionId: string;
  actionType:
    | 'erp_mutation'
    | 'crm_update'
    | 'purchase_order_placement'
    | 'inventory_reorder'
    | 'budget_reallocation'
    | 'bulk_email_dispatch'
    | 'database_record_modification'
    | 'api_webhook_trigger'
    | 'contract_dispatch';
  title: string;
  description: string;
  targetSystem: string;
  riskLevel: ActionRiskLevel;
  reversibility: ActionReversibility;
  requiresUserConfirmation: boolean;
  status: ActionConfirmationStatus;
  estimatedFinancialImpactUsd?: number;
  affectedEntitiesCount?: number;
  simulationPreview: {
    beforeState: Record<string, any>;
    afterState: Record<string, any>;
    potentialDownside: string;
    rollbackPlan: string;
  };
  timestamp: number;
}

// ==========================================
// 4. CONTROLLED AGENTS ORCHESTRATION
// ==========================================

export type ControlledAgentRole =
  | 'sales_strategist'
  | 'financial_auditor'
  | 'customer_insights_analyst'
  | 'supply_chain_director'
  | 'market_researcher'
  | 'executive_workflow_coordinator';

export interface ControlledAgentPlan {
  agentRole: ControlledAgentRole;
  agentName: string;
  allocatedTask: string;
  status: 'standby' | 'invoked' | 'skipped' | 'completed';
  executionReason: string;
  requiresExternalApi: boolean;
  findings: string[];
  recommendations: string[];
}

// ==========================================
// 5. DOMAIN-SPECIFIC BUSINESS STRUCTURES
// ==========================================

// Sales Analysis
export interface SalesMetricItem {
  name: string;
  currentValue: number;
  previousValue: number;
  unit: string;
  changePercent: number;
  trend: 'up' | 'down' | 'flat';
  isHealthy: boolean;
}

export interface SalesPipelineStage {
  stageName: string;
  dealCount: number;
  pipelineValueUsd: number;
  conversionRatePercent: number;
  averageAgeDays: number;
}

export interface SalesAnalysisResult {
  summary: string;
  totalRevenueUsd: number;
  quotaAttainmentPercent: number;
  winRatePercent: number;
  averageSalesCycleDays: number;
  averageDealSizeUsd: number;
  pipelineVelocityUsdPerDay: number;
  metrics: SalesMetricItem[];
  pipelineStages: SalesPipelineStage[];
  topPerformanceInsights: string[];
  bottlenecksIdentified: string[];
  calculationTraces: TransparentCalculationTrace[];
}

// Business Data Analysis (EBITDA, Ratios, Variance)
export interface FinancialRatio {
  category: 'profitability' | 'liquidity' | 'efficiency' | 'solvency';
  name: string;
  formula: string;
  value: number;
  benchmark: number;
  status: 'optimal' | 'warning' | 'critical';
  interpretation: string;
}

export interface VarianceItem {
  lineItem: string;
  budgeted: number;
  actual: number;
  varianceAmount: number;
  variancePercent: number;
  isFavorable: boolean;
  rootCause: string;
}

export interface BusinessDataAnalysisResult {
  summary: string;
  grossMarginPercent: number;
  operatingMarginPercent: number;
  netMarginPercent: number;
  ebitdaUsd: number;
  cacUsd: number;
  ltvUsd: number;
  ltvToCacRatio: number;
  cacPaybackMonths: number;
  ratios: FinancialRatio[];
  varianceReport: VarianceItem[];
  calculationTraces: TransparentCalculationTrace[];
}

// Reporting (Executive Briefs, QBRs)
export interface BusinessReport {
  reportId: string;
  title: string;
  reportType: 'executive_brief' | 'qbr' | 'board_memo' | 'audit_summary' | 'operational_review';
  executiveSummary: string;
  keyHighlights: string[];
  criticalRisks: string[];
  strategicActionItems: {
    priority: 'P0' | 'P1' | 'P2';
    owner: string;
    timeline: string;
    task: string;
    expectedImpact: string;
  }[];
  tabularData: {
    headers: string[];
    rows: (string | number)[][];
  };
  generatedAt: number;
}

// Dashboards (Visual Widget Models)
export interface DashboardKpiCard {
  id: string;
  title: string;
  value: string;
  subValue?: string;
  badgeText: string;
  badgeTone: 'emerald' | 'amber' | 'blue' | 'rose' | 'slate';
  sparklineData: number[];
  category: string;
}

export interface DashboardSegmentBreakdown {
  label: string;
  value: number;
  percentage: number;
  colorHex: string;
}

export interface BusinessDashboardData {
  dashboardTitle: string;
  period: string;
  kpiCards: DashboardKpiCard[];
  revenueTrends: { period: string; actual: number; target: number; forecast?: number }[];
  segmentBreakdowns: DashboardSegmentBreakdown[];
  regionalBreakdowns: { region: string; revenue: number; growth: number }[];
}

// Forecasting Assistance
export interface ForecastScenario {
  scenarioName: 'Pessimistic (Bear)' | 'Base Case' | 'Optimistic (Bull)';
  projectedRevenueUsd: number;
  growthRatePercent: number;
  keyAssumptions: string[];
  probabilityWeight: number; // 0.0 - 1.0
}

export interface ForecastingResult {
  horizon: string;
  methodology: 'Linear Moving Average' | 'Exponential Smoothing' | '3-Scenario Scenario Modeling' | 'Cohort Decay Model';
  baseProjection: number;
  confidenceIntervalLow: number;
  confidenceIntervalHigh: number;
  scenarios: ForecastScenario[];
  monthlyProjections: { month: string; value: number; lowerBound: number; upperBound: number }[];
  drivingFactors: string[];
  riskSensitivityNotes: string[];
  calculationTraces: TransparentCalculationTrace[];
}

// Customer Analysis (RFM & Retention)
export interface RfmSegment {
  segmentName: 'Champions' | 'Loyal Customers' | 'Potential Loyalists' | 'At Risk' | 'Hibernating' | 'Lost';
  customerCount: number;
  percentageOfBase: number;
  avgMonetaryValueUsd: number;
  recommendedPlaybook: string;
}

export interface CustomerAnalysisResult {
  totalCustomers: number;
  netRevenueRetentionPercent: number;
  grossRevenueRetentionPercent: number;
  annualChurnRatePercent: number;
  avgCustomerLifespanYears: number;
  customerHealthScore: number; // 0 - 100
  rfmSegments: RfmSegment[];
  churnDrivers: string[];
  expansionOpportunities: string[];
  calculationTraces: TransparentCalculationTrace[];
}

// Inventory Analysis
export interface InventorySkuAudit {
  sku: string;
  name: string;
  category: string;
  annualDemandUnits: number;
  orderCostUsd: number;
  holdingCostPerUnitUsd: number;
  calculatedEoqUnits: number;
  leadTimeDays: number;
  safetyStockUnits: number;
  reorderPointUnits: number;
  currentStockUnits: number;
  stockStatus: 'healthy' | 'reorder_needed' | 'critical_stockout_risk' | 'excess_overstock';
}

export interface InventoryAnalysisResult {
  totalSkusAudited: number;
  totalInventoryValuationUsd: number;
  inventoryTurnoverRatio: number;
  daysInventoryOutstandingDays: number;
  annualHoldingCostUsd: number;
  skusNeedingImmediateReorder: number;
  skuAudits: InventorySkuAudit[];
  recommendations: string[];
  calculationTraces: TransparentCalculationTrace[];
}

// Business Research
export interface CompetitorProfile {
  name: string;
  marketSharePercent: number;
  coreStrength: string;
  primaryVulnerability: string;
  pricingTier: string;
}

export interface BusinessResearchResult {
  topic: string;
  tamUsdBillions: number;
  samUsdBillions: number;
  somUsdBillions: number;
  cagrPercent: number;
  porterFiveForces: {
    force: 'Competitive Rivalry' | 'Threat of New Entrants' | 'Bargaining Power of Buyers' | 'Bargaining Power of Suppliers' | 'Threat of Substitutes';
    intensity: 'Low' | 'Moderate' | 'High';
    rationale: string;
  }[];
  competitors: CompetitorProfile[];
  macroEconomicTailwinds: string[];
  regulatoryRisks: string[];
}

// Document Analysis
export interface DocumentFinding {
  sectionOrClause: string;
  findingType: 'financial_anomaly' | 'compliance_risk' | 'favorable_term' | 'missing_clause';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendedAction: string;
}

export interface DocumentAnalysisResult {
  documentName: string;
  documentType: 'p_and_l_statement' | 'balance_sheet' | 'vendor_contract' | 'nda' | 'service_level_agreement' | 'invoice_batch';
  auditStatus: 'passed_with_clean_record' | 'minor_discrepancies' | 'critical_red_flags';
  keyFinancialsExtracted?: Record<string, string | number>;
  contractTermsSummary?: {
    termLength: string;
    autoRenewal: boolean;
    liabilityCap: string;
    paymentTerms: string;
  };
  findings: DocumentFinding[];
  reconciliationNotes: string[];
}

// Management Assistance
export interface OkrGoal {
  objective: string;
  category: 'growth' | 'efficiency' | 'product' | 'people';
  keyResults: {
    krText: string;
    baseline: string;
    target: string;
    currentProgress: string;
    progressPercent: number;
  }[];
}

export interface PrioritizationItem {
  id: string;
  initiative: string;
  reach: number;
  impact: number;
  confidencePercent: number;
  effortPersonMonths: number;
  riceScore: number;
  recommendation: 'Immediate Execute' | 'Plan for Next Quarter' | 'Deprioritize / Drop';
}

export interface ManagementAssistanceResult {
  focusArea: string;
  okrFramework: OkrGoal[];
  prioritizationMatrix: PrioritizationItem[];
  resourceAllocationSummary: {
    functionArea: string;
    budgetAllocationPercent: number;
    headcountTarget: number;
  }[];
  executiveDecisionMatrix: {
    decision: string;
    pros: string[];
    cons: string[];
    mitigationStrategy: string;
    recommendedChoice: string;
  };
}

// Workflow Planning (Gantt, CPM, RACI)
export interface WorkflowTask {
  taskId: string;
  taskName: string;
  durationDays: number;
  dependencies: string[];
  isOnCriticalPath: boolean;
  raci: {
    responsible: string;
    accountable: string;
    consulted: string;
    informed: string;
  };
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed';
}

export interface WorkflowPlanningResult {
  projectName: string;
  totalProjectDurationDays: number;
  criticalPathTasks: string[];
  contingencyBufferDays: number;
  phases: {
    phaseName: string;
    startDay: number;
    endDay: number;
    deliverables: string[];
  }[];
  tasks: WorkflowTask[];
  riskMitigationPlan: {
    risk: string;
    probability: 'low' | 'medium' | 'high';
    contingencyTrigger: string;
  }[];
}

// ==========================================
// 6. COMPREHENSIVE MAX BUSINESS PACKAGE
// ==========================================

export interface MaxBusinessPackage {
  packageId: string;
  primaryCapability: MaxBusinessCapability;
  activeCapabilities: MaxBusinessCapability[];
  executiveSummary: string;
  controlledAgentsEngaged: ControlledAgentPlan[];
  calculationTraces: TransparentCalculationTrace[];
  consequentialActions: ConsequentialActionRequest[];

  // Optional domain outputs based on query intent
  salesAnalysis?: SalesAnalysisResult;
  businessDataAnalysis?: BusinessDataAnalysisResult;
  report?: BusinessReport;
  dashboard?: BusinessDashboardData;
  forecasting?: ForecastingResult;
  customerAnalysis?: CustomerAnalysisResult;
  inventoryAnalysis?: InventoryAnalysisResult;
  businessResearch?: BusinessResearchResult;
  documentAnalysis?: DocumentAnalysisResult;
  managementAssistance?: ManagementAssistanceResult;
  workflowPlanning?: WorkflowPlanningResult;

  timestamp: number;
}
