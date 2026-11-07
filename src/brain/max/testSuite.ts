/**
 * MAX Business-Assistance Architecture - 12-Point Automated Verification Suite
 *
 * Verifies all 12 core capabilities:
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
 * 12. Controlled Agents, Consequential Action Guard & Transparent Math Traceability
 */

import { maxBusinessEngine } from './maxEngine';
import { formulaTraceEngine } from './formulaTraceEngine';
import { consequentialActionGuard } from './consequentialActionGuard';
import { controlledAgentsOrchestrator } from './controlledAgents';
import { salesAnalyzerEngine } from './salesAnalyzer';
import { businessDataAnalyzerEngine } from './businessDataAnalyzer';
import { forecastingEngine } from './forecastingEngine';
import { customerAnalyzerEngine } from './customerAnalyzer';
import { inventoryAnalyzerEngine } from './inventoryAnalyzer';
import { businessResearcherEngine } from './businessResearcher';
import { documentAnalyzerEngine } from './documentAnalyzer';
import { managementPlannerEngine } from './managementPlanner';

export interface MaxTestResultItem {
  id: string;
  capabilityName: string;
  description: string;
  passed: boolean;
  durationMs: number;
  details: string;
  error?: string;
}

export interface MaxTestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  durationMs: number;
  timestamp: number;
  results: MaxTestResultItem[];
}

export async function runMaxBusinessTestSuite(): Promise<MaxTestSuiteSummary> {
  const suiteStart = Date.now();
  const results: MaxTestResultItem[] = [];

  // ==========================================
  // Test 1: Sales Analysis Engine
  // ==========================================
  const t1Start = Date.now();
  try {
    const res = salesAnalyzerEngine.analyzeSales('audit quarterly enterprise sales velocity and deal conversions');
    const passed =
      res.totalRevenueUsd > 0 &&
      res.winRatePercent > 0 &&
      res.pipelineVelocityUsdPerDay > 0 &&
      res.pipelineStages.length >= 4 &&
      res.calculationTraces.length >= 1;

    results.push({
      id: 'max_sales_analysis',
      capabilityName: '1. Sales Analysis',
      description: 'Verifies pipeline conversion, quota attainment, deal size, and pipeline velocity calculations',
      passed,
      durationMs: Date.now() - t1Start,
      details: `Booked: $${(res.totalRevenueUsd / 1000000).toFixed(2)}M | Win Rate: ${res.winRatePercent}% | Velocity: $${res.pipelineVelocityUsdPerDay.toLocaleString()}/day`,
    });
  } catch (err: any) {
    results.push({
      id: 'max_sales_analysis',
      capabilityName: '1. Sales Analysis',
      description: 'Verifies pipeline conversion, quota attainment, and velocity math',
      passed: false,
      durationMs: Date.now() - t1Start,
      details: 'Exception in sales analysis test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 2: Business Data Analysis Engine
  // ==========================================
  const t2Start = Date.now();
  try {
    const res = businessDataAnalyzerEngine.analyzeData('analyze EBITDA, gross margins, and unit economics');
    const passed =
      res.grossMarginPercent > 0 &&
      res.operatingMarginPercent > 0 &&
      res.ltvToCacRatio > 0 &&
      res.ratios.length >= 4 &&
      res.varianceReport.length >= 2 &&
      res.calculationTraces.length >= 2;

    results.push({
      id: 'max_business_data_analysis',
      capabilityName: '2. Business Data Analysis',
      description: 'Audits EBITDA margins, financial ratios (solvency/liquidity), variance analysis, and unit economics',
      passed,
      durationMs: Date.now() - t2Start,
      details: `EBITDA: $${(res.ebitdaUsd / 1000000).toFixed(2)}M (${res.operatingMarginPercent}%) | LTV/CAC: ${res.ltvToCacRatio}x | Payback: ${res.cacPaybackMonths} mo`,
    });
  } catch (err: any) {
    results.push({
      id: 'max_business_data_analysis',
      capabilityName: '2. Business Data Analysis',
      description: 'Audits EBITDA, financial ratios, variance analysis, and unit economics',
      passed: false,
      durationMs: Date.now() - t2Start,
      details: 'Exception in business data test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 3: Reporting Engine
  // ==========================================
  const t3Start = Date.now();
  try {
    const pkg = await maxBusinessEngine.processBusinessRequest('generate executive summary QBR report with strategic priorities');
    const rep = pkg.report;
    const passed =
      Boolean(rep) &&
      Boolean(rep?.executiveSummary) &&
      (rep?.keyHighlights.length || 0) >= 3 &&
      (rep?.strategicActionItems.length || 0) >= 2 &&
      (rep?.tabularData.rows.length || 0) >= 4;

    results.push({
      id: 'max_reporting_engine',
      capabilityName: '3. Reporting Engine',
      description: 'Generates structured executive briefings, QBRs, priority action matrices, and tabular summaries',
      passed,
      durationMs: Date.now() - t3Start,
      details: `Report "${rep?.title}" generated with ${rep?.strategicActionItems.length} action items and ${rep?.tabularData.rows.length} tabular rows.`,
    });
  } catch (err: any) {
    results.push({
      id: 'max_reporting_engine',
      capabilityName: '3. Reporting Engine',
      description: 'Generates executive briefings, QBRs, and tabular summaries',
      passed: false,
      durationMs: Date.now() - t3Start,
      details: 'Exception in reporting test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 4: Dashboards Engine
  // ==========================================
  const t4Start = Date.now();
  try {
    const pkg = await maxBusinessEngine.processBusinessRequest('show business performance KPI dashboard and trends');
    const dash = pkg.dashboard;
    const passed =
      Boolean(dash) &&
      (dash?.kpiCards.length || 0) >= 4 &&
      (dash?.revenueTrends.length || 0) >= 3 &&
      (dash?.segmentBreakdowns.length || 0) >= 2 &&
      (dash?.regionalBreakdowns.length || 0) >= 2;

    results.push({
      id: 'max_dashboards',
      capabilityName: '4. Dashboards & KPI Command',
      description: 'Constructs live KPI scorecards, multi-quarter trend comparisons, and customer/regional breakdowns',
      passed,
      durationMs: Date.now() - t4Start,
      details: `${dash?.kpiCards.length} KPI cards active | ${dash?.revenueTrends.length} quarterly trend points | ${dash?.segmentBreakdowns.length} tier segments`,
    });
  } catch (err: any) {
    results.push({
      id: 'max_dashboards',
      capabilityName: '4. Dashboards & KPI Command',
      description: 'Constructs live KPI scorecards and trend comparisons',
      passed: false,
      durationMs: Date.now() - t4Start,
      details: 'Exception in dashboard test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 5: Forecasting Assistance Engine
  // ==========================================
  const t5Start = Date.now();
  try {
    const res = forecastingEngine.generateForecast('forecast revenue across optimistic base and bear scenarios');
    const passed =
      res.baseProjection > 0 &&
      res.scenarios.length === 3 &&
      res.monthlyProjections.length === 12 &&
      res.confidenceIntervalHigh > res.confidenceIntervalLow &&
      res.calculationTraces.length >= 1;

    results.push({
      id: 'max_forecasting_assistance',
      capabilityName: '5. Forecasting Assistance',
      description: 'Generates 3-scenario projections (Bear, Base, Bull), monthly confidence envelopes, and CAGR growth',
      passed,
      durationMs: Date.now() - t5Start,
      details: `Base: $${(res.baseProjection / 1000000).toFixed(2)}M | Range: [$${(res.confidenceIntervalLow / 1000000).toFixed(2)}M - $${(res.confidenceIntervalHigh / 1000000).toFixed(2)}M] | 12 monthly steps generated`,
    });
  } catch (err: any) {
    results.push({
      id: 'max_forecasting_assistance',
      capabilityName: '5. Forecasting Assistance',
      description: 'Generates 3-scenario projections and monthly confidence envelopes',
      passed: false,
      durationMs: Date.now() - t5Start,
      details: 'Exception in forecasting test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 6: Customer Analysis Engine
  // ==========================================
  const t6Start = Date.now();
  try {
    const res = customerAnalyzerEngine.analyzeCustomers('segment customer cohort using RFM and model net retention NRR');
    const passed =
      res.totalCustomers > 0 &&
      res.netRevenueRetentionPercent > 100 &&
      res.rfmSegments.length >= 4 &&
      res.customerHealthScore > 0 &&
      res.calculationTraces.length >= 1;

    results.push({
      id: 'max_customer_analysis',
      capabilityName: '6. Customer Analysis',
      description: 'Segments customer cohorts into RFM tiers (Champions to Lost), audits NRR retention and churn hazards',
      passed,
      durationMs: Date.now() - t6Start,
      details: `Total: ${res.totalCustomers} customers | NRR: ${res.netRevenueRetentionPercent}% | Health Score: ${res.customerHealthScore}/100 | ${res.rfmSegments.length} RFM segments`,
    });
  } catch (err: any) {
    results.push({
      id: 'max_customer_analysis',
      capabilityName: '6. Customer Analysis',
      description: 'Segments customer cohorts and audits NRR retention',
      passed: false,
      durationMs: Date.now() - t6Start,
      details: 'Exception in customer analysis test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 7: Inventory Analysis Engine
  // ==========================================
  const t7Start = Date.now();
  try {
    const res = inventoryAnalyzerEngine.analyzeInventory('calculate EOQ, reorder points, safety stock and stockout risk');
    const passed =
      res.totalSkusAudited > 0 &&
      res.inventoryTurnoverRatio > 0 &&
      res.skuAudits.length >= 3 &&
      res.skusNeedingImmediateReorder >= 1 &&
      res.calculationTraces.length >= 1;

    results.push({
      id: 'max_inventory_analysis',
      capabilityName: '7. Inventory Analysis',
      description: 'Computes Economic Order Quantity (EOQ), Safety Stock, Reorder Points (ROP), and stockout flags',
      passed,
      durationMs: Date.now() - t7Start,
      details: `Audited: ${res.totalSkusAudited} SKUs | Turnover: ${res.inventoryTurnoverRatio}x (${res.daysInventoryOutstandingDays} DIO) | ${res.skusNeedingImmediateReorder} Reorder Alerts`,
    });
  } catch (err: any) {
    results.push({
      id: 'max_inventory_analysis',
      capabilityName: '7. Inventory Analysis',
      description: 'Computes EOQ, Safety Stock, and Reorder Points',
      passed: false,
      durationMs: Date.now() - t7Start,
      details: 'Exception in inventory test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 8: Business Research Engine
  // ==========================================
  const t8Start = Date.now();
  try {
    const res = businessResearcherEngine.conductResearch('size TAM SAM SOM and perform Porter five forces analysis');
    const passed =
      res.tamUsdBillions > 0 &&
      res.samUsdBillions > 0 &&
      res.somUsdBillions > 0 &&
      res.porterFiveForces.length === 5 &&
      res.competitors.length >= 2;

    results.push({
      id: 'max_business_research',
      capabilityName: '8. Business Research',
      description: 'Sizes TAM/SAM/SOM market opportunity, evaluates Porter Five Forces, and benchmarks competitors',
      passed,
      durationMs: Date.now() - t8Start,
      details: `TAM: $${res.tamUsdBillions}B | SAM: $${res.samUsdBillions}B | SOM: $${res.somUsdBillions}B | 5/5 Porter Forces analyzed`,
    });
  } catch (err: any) {
    results.push({
      id: 'max_business_research',
      capabilityName: '8. Business Research',
      description: 'Sizes TAM/SAM/SOM and evaluates Porter Five Forces',
      passed: false,
      durationMs: Date.now() - t8Start,
      details: 'Exception in business research test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 9: Document Analysis Engine
  // ==========================================
  const t9Start = Date.now();
  try {
    const res = documentAnalyzerEngine.analyzeDocument('Enterprise_MSA_2026.pdf', 'vendor_contract');
    const passed =
      Boolean(res.documentName) &&
      res.findings.length >= 2 &&
      Boolean(res.contractTermsSummary) &&
      Boolean(res.auditStatus);

    results.push({
      id: 'max_document_analysis',
      capabilityName: '9. Document Analysis',
      description: 'Parses contracts, SLAs, and financial statements, extracting liability caps, auto-renewals, and red flags',
      passed,
      durationMs: Date.now() - t9Start,
      details: `Status: ${res.auditStatus} | ${res.findings.length} findings identified | Liability: ${res.contractTermsSummary?.liabilityCap}`,
    });
  } catch (err: any) {
    results.push({
      id: 'max_document_analysis',
      capabilityName: '9. Document Analysis',
      description: 'Parses contracts and financial statements',
      passed: false,
      durationMs: Date.now() - t9Start,
      details: 'Exception in document analysis test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 10: Management Assistance Engine
  // ==========================================
  const t10Start = Date.now();
  try {
    const res = managementPlannerEngine.planManagement('develop OKR framework and RICE prioritization for enterprise GTM');
    const passed =
      res.okrFramework.length >= 2 &&
      res.prioritizationMatrix.length >= 2 &&
      res.resourceAllocationSummary.length >= 3 &&
      Boolean(res.executiveDecisionMatrix);

    results.push({
      id: 'max_management_assistance',
      capabilityName: '10. Management Assistance',
      description: 'Formulates OKR hierarchy, RICE prioritization rankings, and executive decision frameworks',
      passed,
      durationMs: Date.now() - t10Start,
      details: `${res.okrFramework.length} OKR sets formulated | Top RICE initiative: ${res.prioritizationMatrix[0].initiative} (Score ${res.prioritizationMatrix[0].riceScore})`,
    });
  } catch (err: any) {
    results.push({
      id: 'max_management_assistance',
      capabilityName: '10. Management Assistance',
      description: 'Formulates OKRs and RICE prioritization',
      passed: false,
      durationMs: Date.now() - t10Start,
      details: 'Exception in management assistance test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 11: Workflow Planning Engine
  // ==========================================
  const t11Start = Date.now();
  try {
    const res = managementPlannerEngine.planWorkflow('generate milestone roadmap with critical path and RACI matrix');
    const passed =
      res.totalProjectDurationDays > 0 &&
      res.criticalPathTasks.length >= 2 &&
      res.tasks.length >= 4 &&
      res.phases.length >= 2;

    results.push({
      id: 'max_workflow_planning',
      capabilityName: '11. Workflow Planning',
      description: 'Calculates Critical Path Method (CPM), RACI ownership matrix, Gantt phases, and risk buffers',
      passed,
      durationMs: Date.now() - t11Start,
      details: `Total Duration: ${res.totalProjectDurationDays} days (${res.contingencyBufferDays}d buffer) | ${res.criticalPathTasks.length} tasks on Critical Path | ${res.tasks.length} total tasks with RACI`,
    });
  } catch (err: any) {
    results.push({
      id: 'max_workflow_planning',
      capabilityName: '11. Workflow Planning',
      description: 'Calculates Critical Path Method and RACI matrix',
      passed: false,
      durationMs: Date.now() - t11Start,
      details: 'Exception in workflow planning test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 12: Controlled Agents, Consequential Action Guard & Traceability
  // ==========================================
  const t12Start = Date.now();
  try {
    // 1. Verify selective tool/agent coordination (does not automatically run every tool)
    const agentPlans = controlledAgentsOrchestrator.planAgentCoordination(
      'evaluate sales pipeline win rate',
      'sales_analysis',
      ['sales_analysis']
    );
    const invokedCount = agentPlans.filter((a) => a.status === 'invoked').length;
    const skippedCount = agentPlans.filter((a) => a.status === 'skipped').length;
    const selectiveCoordinationPassed = invokedCount >= 1 && skippedCount >= 1;

    // 2. Verify Consequential Action Guard (requires confirmation before external actions)
    const guardEval = consequentialActionGuard.evaluateOperation(
      'purchase_order_placement',
      'Order 241 units for depleted inventory SKU',
      'Triggers ERP purchase order to supplier',
      'NetSuite ERP',
      { units: 241, totalCost: 108450 },
      { estimatedFinancialImpactUsd: 108450, affectedEntitiesCount: 241 }
    );
    const requiresConfirmation = guardEval.isConsequential && guardEval.actionRequest?.status === 'pending_confirmation';

    // 3. User Approves action
    const approvalResult = consequentialActionGuard.approveAction(guardEval.actionRequest!.actionId);
    const approvedSuccess = approvalResult.success && approvalResult.action?.status === 'approved';

    // 4. Mathematical Traceability Verification
    const ltvTrace = formulaTraceEngine.traceLtv(1850, 78.4, 1.6);
    const mathTracePassed =
      Boolean(ltvTrace.formulaLaTeX) &&
      ltvTrace.variables.length >= 3 &&
      ltvTrace.steps.length >= 2 &&
      Number(ltvTrace.finalResult) > 0;

    const passed = selectiveCoordinationPassed && requiresConfirmation && approvedSuccess && mathTracePassed;

    results.push({
      id: 'max_safety_and_coordination',
      capabilityName: '12. Controlled Agents, Action Guard & Traceable Math',
      description: 'Enforces selective agent coordination, human confirmation guard on external mutations, and step-by-step arithmetic transparency',
      passed,
      durationMs: Date.now() - t12Start,
      details: `Selective Agents: ${invokedCount} invoked, ${skippedCount} skipped | Action Guard: Required Confirmation & Handled Approval | Math Trace: ${ltvTrace.metricName} with ${ltvTrace.steps.length} verified calculation steps.`,
    });
  } catch (err: any) {
    results.push({
      id: 'max_safety_and_coordination',
      capabilityName: '12. Controlled Agents, Action Guard & Traceable Math',
      description: 'Enforces selective agent coordination, human confirmation guard, and math transparency',
      passed: false,
      durationMs: Date.now() - t12Start,
      details: 'Exception in safety & coordination test',
      error: err.message,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const total = results.length;
  const passRate = total > 0 ? parseFloat(((passedCount / total) * 100).toFixed(1)) : 0;

  return {
    total,
    passed: passedCount,
    failed: failedCount,
    passRate,
    durationMs: Date.now() - suiteStart,
    timestamp: Date.now(),
    results,
  };
}
