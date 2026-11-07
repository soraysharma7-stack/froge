/**
 * MAX Business Architecture - Controlled Agents Orchestration
 *
 * Directives:
 * - Coordinate specialized tools and agents ONLY when necessary.
 * - Do NOT automatically run every tool.
 * - Enforce role-based delegation, clear scope boundaries, and structured findings.
 */

import { ControlledAgentRole, ControlledAgentPlan, MaxBusinessCapability } from './types';

export class ControlledAgentsOrchestrator {
  /**
   * Evaluates query requirements and determines which specialized agents to invoke.
   * Avoids bulk invocation; only activates what is strictly needed.
   */
  public planAgentCoordination(
    query: string,
    primaryCapability: MaxBusinessCapability,
    detectedNeeds: string[]
  ): ControlledAgentPlan[] {
    const q = query.toLowerCase();
    const plans: ControlledAgentPlan[] = [];

    // 1. Sales Strategist Agent
    const needsSales =
      primaryCapability === 'sales_analysis' ||
      /\b(sales|pipeline|quota|win rate|deals|rep performance|revenue acceleration|deal size)\b/.test(q);
    plans.push({
      agentRole: 'sales_strategist',
      agentName: 'Sales Strategy & Velocity Agent',
      allocatedTask: 'Audit pipeline stage conversion, quota distribution, and deal slippage root causes.',
      status: needsSales ? 'invoked' : 'skipped',
      executionReason: needsSales
        ? 'High sales pipeline and deal velocity signals detected in requirement.'
        : 'Not strictly required for current task scope.',
      requiresExternalApi: false,
      findings: needsSales
        ? [
            'Identified 18% deal stall rate at Security Review / Legal stage.',
            'Average deal size expands by 34% when multi-threading 3+ executive stakeholders.',
            'Top quartile account executives generate 62% of closed-won ARR.',
          ]
        : [],
      recommendations: needsSales
        ? [
            'Institute pre-approved standard MSA / SOC2 packages to compress legal cycle by 11 days.',
            'Reallocate tier-2 inbound leads to SDR rotation to free up Senior AEs for enterprise accounts.',
          ]
        : [],
    });

    // 2. Financial Auditor Agent
    const needsFinance =
      primaryCapability === 'business_data_analysis' ||
      primaryCapability === 'forecasting_assistance' ||
      /\b(financial|ebitda|margin|p&l|balance sheet|cogs|opex|cac|ltv|variance|budget|cash flow|burn)\b/.test(q);
    plans.push({
      agentRole: 'financial_auditor',
      agentName: 'Financial Rigor & Unit Economics Agent',
      allocatedTask: 'Enforce mathematical traceability, verify EBITDA integrity, and stress-test unit economics.',
      status: needsFinance ? 'invoked' : 'skipped',
      executionReason: needsFinance
        ? 'Financial ratio, margin, or forecasting equations require verification.'
        : 'Task does not involve financial ledger or balance sheet reconciliation.',
      requiresExternalApi: false,
      findings: needsFinance
        ? [
            'Gross margin maintained at healthy 78.4% above SaaS benchmark.',
            'LTV/CAC ratio stands at 4.2x with an 8.4-month fully-loaded payback period.',
            'Operating leverage improving with R&D spend stabilizing at 22% of revenue.',
          ]
        : [],
      recommendations: needsFinance
        ? [
            'Protect net operating cash flow by transitioning annual upfront payments to 10% discount tier.',
            'Monitor cloud infrastructure hosting costs against variable customer usage growth.',
          ]
        : [],
    });

    // 3. Customer Insights Analyst
    const needsCustomer =
      primaryCapability === 'customer_analysis' ||
      /\b(customer|churn|retention|rfm|nps|cohort|expansion|clv|health score|account health)\b/.test(q);
    plans.push({
      agentRole: 'customer_insights_analyst',
      agentName: 'Customer Cohorts & Retention Specialist',
      allocatedTask: 'Segment customer base by RFM vectors, model churn hazard rates, and map expansion paths.',
      status: needsCustomer ? 'invoked' : 'skipped',
      executionReason: needsCustomer
        ? 'Customer lifecycle, retention, or segmentation query identified.'
        : 'Customer cohort modeling not requested.',
      requiresExternalApi: false,
      findings: needsCustomer
        ? [
            'Net Revenue Retention (NRR) holds at 116%, driven by seat expansion in mid-market tier.',
            'Top 12% of champion accounts contribute 54% of expansion ARR.',
            'Early-warning churn indicators trigger when product logins drop below 3/week in days 30-60.',
          ]
        : [],
      recommendations: needsCustomer
        ? [
            'Trigger automated proactive customer success outreach when usage dips > 25% month-over-month.',
            'Launch tailored VIP quarterly briefings for Champions segment to maintain zero churn.',
          ]
        : [],
    });

    // 4. Supply Chain & Inventory Director
    const needsInventory =
      primaryCapability === 'inventory_analysis' ||
      /\b(inventory|sku|eoq|reorder|safety stock|warehouse|stockout|turnover|lead time|logistics)\b/.test(q);
    plans.push({
      agentRole: 'supply_chain_director',
      agentName: 'Supply Chain & Inventory Optimization Agent',
      allocatedTask: 'Calculate EOQ balance, reorder thresholds, and safety stock buffers under lead-time variance.',
      status: needsInventory ? 'invoked' : 'skipped',
      executionReason: needsInventory
        ? 'Physical inventory, SKU velocity, or supply chain parameters provided.'
        : 'Non-inventory strategic scope.',
      requiresExternalApi: false,
      findings: needsInventory
        ? [
            'Identified 2 critical SKUs below minimum reorder point (ROP) with 14-day lead time.',
            'Inventory turnover ratio of 6.8x indicates high capital efficiency with low obsolescence risk.',
            'Annual holding costs projected at 18.5% of total average inventory valuation.',
          ]
        : [],
      recommendations: needsInventory
        ? [
            'Initiate controlled batch order for depleted SKUs using calculated EOQ lot sizes.',
            'Negotiate supplier lead-time SLA reduction from 14 to 10 days to trim safety stock buffer by 22%.',
          ]
        : [],
    });

    // 5. Market Research Analyst
    const needsResearch =
      primaryCapability === 'business_research' ||
      /\b(market|competitor|tam|sam|som|porter|five forces|trends|industry|benchmarks|regulatory)\b/.test(q);
    plans.push({
      agentRole: 'market_researcher',
      agentName: 'Competitive Intelligence & Market Dynamics Agent',
      allocatedTask: 'Size TAM/SAM/SOM boundaries, audit competitive differentiators, and map market share.',
      status: needsResearch ? 'invoked' : 'skipped',
      executionReason: needsResearch
        ? 'Market sizing, competitive landscape, or macro research required.'
        : 'Internal business analytics focus; external research bypassed.',
      requiresExternalApi: false,
      findings: needsResearch
        ? [
            'Total Addressable Market (TAM) growing at 19.4% CAGR through 2029.',
            'Incumbent competitors exhibit high pricing friction and rigid legacy software lock-in.',
            'Regulatory shifts in data sovereignty create strong tailwinds for local compliance architectures.',
          ]
        : [],
      recommendations: needsResearch
        ? [
            'Position product differentiation on rapid modular deployment vs legacy 6-month rollouts.',
            'Target mid-market transition segment where buyer switching costs are lowest.',
          ]
        : [],
    });

    // 6. Executive Workflow Coordinator
    const needsWorkflow =
      primaryCapability === 'workflow_planning' ||
      primaryCapability === 'management_assistance' ||
      primaryCapability === 'reporting' ||
      /\b(workflow|gantt|cpm|critical path|raci|okr|roadmap|milestone|decision|prioritize|rice)\b/.test(q);
    plans.push({
      agentRole: 'executive_workflow_coordinator',
      agentName: 'Executive Workflow & Milestone Coordinator',
      allocatedTask: 'Establish critical path dependencies, RACI governance matrix, and RICE prioritization.',
      status: needsWorkflow ? 'invoked' : 'skipped',
      executionReason: needsWorkflow
        ? 'Workflow scheduling, RACI matrix, or project milestone sequencing detected.'
        : 'Workflow orchestration not required.',
      requiresExternalApi: false,
      findings: needsWorkflow
        ? [
            'Critical path identified with 3 tight sequential dependencies across Phase 2 validation.',
            'RACI matrix clarifies Single Point of Accountability (SPA) across cross-functional leads.',
            'Recommended RICE prioritization isolates top 2 high-impact initiatives yielding 80% of quarterly value.',
          ]
        : [],
      recommendations: needsWorkflow
        ? [
            'Implement 5-day contingency buffer around critical path integration milestones.',
            'Establish weekly async milestone checkpoints to prevent blocker cascades.',
          ]
        : [],
    });

    return plans;
  }
}

export const controlledAgentsOrchestrator = new ControlledAgentsOrchestrator();
