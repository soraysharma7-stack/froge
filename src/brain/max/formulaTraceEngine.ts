/**
 * MAX Business Architecture - Transparent Formula Trace Engine
 *
 * Directives:
 * - Keep financial/business calculations completely transparent and traceable.
 * - Provide step-by-step arithmetic explanations, variable inputs with sources,
 *   standard formula notations, and sensitivity bounds.
 */

import { TransparentCalculationTrace, FormulaVariable, CalculationStep } from './types';

export class FormulaTraceEngine {
  /**
   * Trace Customer Lifetime Value (LTV)
   * Formula: LTV = (ARPU * Gross Margin) / Churn Rate
   */
  public traceLtv(arpuMonthly: number, grossMarginPercent: number, monthlyChurnPercent: number): TransparentCalculationTrace {
    const gmDecimal = grossMarginPercent / 100;
    const churnDecimal = monthlyChurnPercent / 100;
    const arpuPerMonth = arpuMonthly;
    const ltvValue = (arpuPerMonth * gmDecimal) / churnDecimal;

    const variables: FormulaVariable[] = [
      {
        name: 'Average Revenue Per User (Monthly)',
        symbol: 'ARPU',
        value: arpuMonthly,
        unit: 'USD / month',
        source: 'Billing Ledger / Stripe Cohort Data',
        description: 'Blended average monthly recurring revenue per active subscriber',
      },
      {
        name: 'Gross Margin Percentage',
        symbol: 'GM',
        value: grossMarginPercent,
        unit: '%',
        source: 'Income Statement (Revenue - COGS)',
        description: 'Percentage of revenue remaining after direct hosting and support costs',
      },
      {
        name: 'Monthly Churn Rate',
        symbol: 'c',
        value: monthlyChurnPercent,
        unit: '%',
        source: 'Customer Success Retention Cohorts',
        description: 'Percentage of subscribers canceling or downgrading per calendar month',
      },
    ];

    const steps: CalculationStep[] = [
      {
        stepNumber: 1,
        description: 'Calculate Monthly Gross Profit per Customer',
        expression: `ARPU * GrossMarginDecimal = ${arpuMonthly} * ${gmDecimal.toFixed(3)}`,
        evaluatedResult: `$${(arpuMonthly * gmDecimal).toFixed(2)}/mo`,
        explanation: 'Multiplies subscription price by gross margin to isolate net profit contribution per subscriber.',
      },
      {
        stepNumber: 2,
        description: 'Calculate Implied Customer Lifespan',
        expression: `Lifespan = 1 / ChurnRateDecimal = 1 / ${churnDecimal.toFixed(4)}`,
        evaluatedResult: `${(1 / churnDecimal).toFixed(1)} months`,
        explanation: 'Computes harmonic expectation of customer lifetime duration under constant churn model.',
      },
      {
        stepNumber: 3,
        description: 'Compute Net Customer Lifetime Value (LTV)',
        expression: `(${arpuMonthly} * ${gmDecimal.toFixed(3)}) / ${churnDecimal.toFixed(4)}`,
        evaluatedResult: `$${ltvValue.toFixed(2)}`,
        explanation: 'Combines lifetime duration with monthly gross margin contribution.',
      },
    ];

    return {
      calculationId: `calc_ltv_${Date.now()}`,
      metricName: 'Customer Lifetime Value (LTV)',
      category: 'customer',
      formulaLaTeX: '\\text{LTV} = \\frac{\\text{ARPU} \\times \\text{Gross Margin}}{\\text{Churn Rate}}',
      formulaPlain: 'LTV = (ARPU * Gross Margin %) / Monthly Churn %',
      variables,
      steps,
      finalResult: parseFloat(ltvValue.toFixed(2)),
      formattedResult: `$${ltvValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: 'USD',
      confidenceScore: 0.98,
      notesAndCaveats: [
        'Assumes uniform churn distribution across customer tenure bands.',
        'Assumes expansion revenue / net negative churn is accounted for separately in NRR.',
      ],
      sensitivityAnalysis: [
        {
          variableName: 'Monthly Churn Rate',
          lowCase: { value: monthlyChurnPercent * 1.3, metricResult: (arpuPerMonth * gmDecimal) / (churnDecimal * 1.3) },
          baseCase: { value: monthlyChurnPercent, metricResult: ltvValue },
          highCase: { value: monthlyChurnPercent * 0.7, metricResult: (arpuPerMonth * gmDecimal) / (churnDecimal * 0.7) },
        },
      ],
    };
  }

  /**
   * Trace LTV / CAC Payback Period
   * Formula: Payback (Months) = CAC / (ARPU * Gross Margin)
   */
  public traceCacPayback(cacUsd: number, arpuMonthly: number, grossMarginPercent: number): TransparentCalculationTrace {
    const gmDecimal = grossMarginPercent / 100;
    const monthlyGrossProfit = arpuMonthly * gmDecimal;
    const paybackMonths = monthlyGrossProfit > 0 ? cacUsd / monthlyGrossProfit : 0;

    const variables: FormulaVariable[] = [
      {
        name: 'Customer Acquisition Cost',
        symbol: 'CAC',
        value: cacUsd,
        unit: 'USD',
        source: 'Blended Sales & Marketing Spend / New Customers Acquired',
        description: 'Total fully-loaded cost to acquire a single paying customer',
      },
      {
        name: 'Monthly ARPU',
        symbol: 'ARPU',
        value: arpuMonthly,
        unit: 'USD / month',
        source: 'Subscription Plan Weighted Average',
        description: 'Average monthly revenue recognized per customer',
      },
      {
        name: 'Gross Margin Percentage',
        symbol: 'GM',
        value: grossMarginPercent,
        unit: '%',
        source: 'COGS Reconciliation',
        description: 'Gross margin percentage available to amortize acquisition spend',
      },
    ];

    const steps: CalculationStep[] = [
      {
        stepNumber: 1,
        description: 'Calculate Monthly Gross Profit Contribution',
        expression: `${arpuMonthly} * ${gmDecimal.toFixed(3)}`,
        evaluatedResult: `$${monthlyGrossProfit.toFixed(2)} / month`,
        explanation: 'Determines the dollar amount per customer each month that directly repays customer acquisition spend.',
      },
      {
        stepNumber: 2,
        description: 'Divide Acquisition Cost by Monthly Gross Contribution',
        expression: `${cacUsd} / ${monthlyGrossProfit.toFixed(2)}`,
        evaluatedResult: `${paybackMonths.toFixed(1)} months`,
        explanation: 'Calculates the exact elapsed duration until the business breaks even on acquisition spend.',
      },
    ];

    return {
      calculationId: `calc_payback_${Date.now()}`,
      metricName: 'CAC Payback Period',
      category: 'financial',
      formulaLaTeX: '\\text{CAC Payback} = \\frac{\\text{CAC}}{\\text{ARPU} \\times \\text{Gross Margin}}',
      formulaPlain: 'Payback (Months) = CAC / (ARPU * Gross Margin %)',
      variables,
      steps,
      finalResult: parseFloat(paybackMonths.toFixed(1)),
      formattedResult: `${paybackMonths.toFixed(1)} Months`,
      unit: 'Months',
      confidenceScore: 0.99,
      notesAndCaveats: [
        'Payback under 12 months is considered Tier-1 SaaS benchmark.',
        '12 - 18 months is acceptable for Enterprise ACVs > $50k.',
      ],
    };
  }

  /**
   * Trace Economic Order Quantity (EOQ)
   * Formula: EOQ = sqrt((2 * D * S) / H)
   */
  public traceEoq(annualDemand: number, setupCostPerOrder: number, annualHoldingCostPerUnit: number): TransparentCalculationTrace {
    const numerator = 2 * annualDemand * setupCostPerOrder;
    const eoqValue = Math.sqrt(numerator / annualHoldingCostPerUnit);

    const variables: FormulaVariable[] = [
      {
        name: 'Annual Demand',
        symbol: 'D',
        value: annualDemand,
        unit: 'units / year',
        source: 'Historical Sales Velocity & ERP Forecasts',
        description: 'Total projected demand in physical units over 12 months',
      },
      {
        name: 'Order Setup / Fixed Cost',
        symbol: 'S',
        value: setupCostPerOrder,
        unit: 'USD / order',
        source: 'Procurement Logistics & Freight Schedule',
        description: 'Fixed administrative and shipping cost incurred per replenishment batch',
      },
      {
        name: 'Annual Unit Holding Cost',
        symbol: 'H',
        value: annualHoldingCostPerUnit,
        unit: 'USD / unit / year',
        source: 'Warehouse Storage & Working Capital Cost',
        description: 'Storage, insurance, shrinkage, and capital opportunity cost per unit annually',
      },
    ];

    const steps: CalculationStep[] = [
      {
        stepNumber: 1,
        description: 'Multiply 2 * Annual Demand * Order Setup Cost',
        expression: `2 * ${annualDemand.toLocaleString()} * ${setupCostPerOrder} = ${numerator.toLocaleString()}`,
        evaluatedResult: numerator.toLocaleString(),
        explanation: 'Calculates the batch throughput coefficient balancing order frequency against fixed setup fees.',
      },
      {
        stepNumber: 2,
        description: 'Divide by Annual Holding Cost per Unit',
        expression: `${numerator.toLocaleString()} / ${annualHoldingCostPerUnit} = ${(numerator / annualHoldingCostPerUnit).toFixed(2)}`,
        evaluatedResult: (numerator / annualHoldingCostPerUnit).toFixed(2),
        explanation: 'Scales the batch size relative to unit storage expense.',
      },
      {
        stepNumber: 3,
        description: 'Extract Square Root for Optimal Lot Size',
        expression: `sqrt(${(numerator / annualHoldingCostPerUnit).toFixed(2)})`,
        evaluatedResult: `${Math.round(eoqValue).toLocaleString()} units`,
        explanation: 'Calculates the exact theoretical minimum point on the total inventory cost curve (Ordering Cost = Holding Cost).',
      },
    ];

    return {
      calculationId: `calc_eoq_${Date.now()}`,
      metricName: 'Economic Order Quantity (EOQ)',
      category: 'inventory',
      formulaLaTeX: '\\text{EOQ} = \\sqrt{\\frac{2 \\times D \\times S}{H}}',
      formulaPlain: 'EOQ = sqrt((2 * Demand * OrderCost) / HoldingCost)',
      variables,
      steps,
      finalResult: Math.round(eoqValue),
      formattedResult: `${Math.round(eoqValue).toLocaleString()} Units`,
      unit: 'Units',
      confidenceScore: 0.97,
      notesAndCaveats: [
        'Assumes stable demand rate and constant lead time.',
        'Quantity discounts from suppliers may adjust final purchase orders.',
      ],
    };
  }

  /**
   * Trace Compound Annual Growth Rate (CAGR)
   * Formula: CAGR = (Ending Value / Beginning Value)^(1 / n) - 1
   */
  public traceCagr(beginningValue: number, endingValue: number, years: number): TransparentCalculationTrace {
    const ratio = endingValue / beginningValue;
    const exponent = 1 / years;
    const cagrValue = Math.pow(ratio, exponent) - 1;
    const cagrPercent = cagrValue * 100;

    const variables: FormulaVariable[] = [
      {
        name: 'Beginning Value',
        symbol: 'BV',
        value: beginningValue,
        unit: 'USD',
        source: 'Historical Financials (Period Start)',
        description: 'Initial revenue or market size at the start of measurement window',
      },
      {
        name: 'Ending Value',
        symbol: 'EV',
        value: endingValue,
        unit: 'USD',
        source: 'Forecasted / Target Financials (Period End)',
        description: 'Terminal revenue or market size at the end of measurement window',
      },
      {
        name: 'Elapsed Horizon',
        symbol: 'n',
        value: years,
        unit: 'Years',
        source: 'Strategy Planning Timeline',
        description: 'Number of compounding periods in years',
      },
    ];

    const steps: CalculationStep[] = [
      {
        stepNumber: 1,
        description: 'Compute Cumulative Growth Multiple',
        expression: `${endingValue.toLocaleString()} / ${beginningValue.toLocaleString()} = ${ratio.toFixed(4)}x`,
        evaluatedResult: `${ratio.toFixed(4)}x`,
        explanation: 'Measures total cumulative multiple expansion across entire timeframe.',
      },
      {
        stepNumber: 2,
        description: 'Annualize by Raising to 1 / n Exponent',
        expression: `(${ratio.toFixed(4)}) ^ (1 / ${years}) = ${Math.pow(ratio, exponent).toFixed(4)}`,
        evaluatedResult: Math.pow(ratio, exponent).toFixed(4),
        explanation: 'Smoothes annual geometric compounding rate across the horizon.',
      },
      {
        stepNumber: 3,
        description: 'Subtract 1 to Determine Annualized Growth Rate %',
        expression: `(${Math.pow(ratio, exponent).toFixed(4)} - 1) * 100`,
        evaluatedResult: `${cagrPercent.toFixed(2)}%`,
        explanation: 'Converts multiplier to percentage rate.',
      },
    ];

    return {
      calculationId: `calc_cagr_${Date.now()}`,
      metricName: 'Compound Annual Growth Rate (CAGR)',
      category: 'financial',
      formulaLaTeX: '\\text{CAGR} = \\left(\\frac{\\text{EV}}{\\text{BV}}\\right)^{\\frac{1}{n}} - 1',
      formulaPlain: 'CAGR = (EndingValue / BeginningValue)^(1 / Years) - 1',
      variables,
      steps,
      finalResult: parseFloat(cagrPercent.toFixed(2)),
      formattedResult: `${cagrPercent.toFixed(2)}%`,
      unit: '%',
      confidenceScore: 0.99,
      notesAndCaveats: ['Smoothed geometric rate; does not reflect intermediate quarter-over-quarter volatility.'],
    };
  }

  /**
   * Trace EBITDA & Margins
   */
  public traceEbitda(
    revenueUsd: number,
    cogsUsd: number,
    opexExclDeprecUsd: number,
    depreciationUsd: number
  ): TransparentCalculationTrace {
    const grossProfit = revenueUsd - cogsUsd;
    const ebitda = grossProfit - opexExclDeprecUsd;
    const ebitdaMargin = (ebitda / revenueUsd) * 100;

    const variables: FormulaVariable[] = [
      {
        name: 'Gross Revenue',
        symbol: 'REV',
        value: revenueUsd,
        unit: 'USD',
        source: 'Income Statement (P&L)',
        description: 'Top-line recognized billings',
      },
      {
        name: 'Cost of Goods Sold',
        symbol: 'COGS',
        value: cogsUsd,
        unit: 'USD',
        source: 'Income Statement',
        description: 'Direct costs attributable to production / hosting',
      },
      {
        name: 'Operating Expenses (excl. D&A)',
        symbol: 'OpEx',
        value: opexExclDeprecUsd,
        unit: 'USD',
        source: 'Income Statement',
        description: 'Sales, Marketing, R&D, and General & Admin costs',
      },
      {
        name: 'Depreciation & Amortization',
        symbol: 'D&A',
        value: depreciationUsd,
        unit: 'USD',
        source: 'Cash Flow / Balance Sheet Schedules',
        description: 'Non-cash accounting depreciation of tangible assets and IP amortizations',
      },
    ];

    const steps: CalculationStep[] = [
      {
        stepNumber: 1,
        description: 'Calculate Gross Profit',
        expression: `${revenueUsd.toLocaleString()} - ${cogsUsd.toLocaleString()}`,
        evaluatedResult: `$${grossProfit.toLocaleString()}`,
        explanation: 'Subtracts direct cost of goods sold from gross revenues.',
      },
      {
        stepNumber: 2,
        description: 'Subtract Cash Operating Expenses (OpEx)',
        expression: `$${grossProfit.toLocaleString()} - $${opexExclDeprecUsd.toLocaleString()}`,
        evaluatedResult: `$${ebitda.toLocaleString()}`,
        explanation: 'Yields Earnings Before Interest, Taxes, Depreciation, and Amortization (EBITDA).',
      },
      {
        stepNumber: 3,
        description: 'Calculate EBITDA Margin %',
        expression: `($${ebitda.toLocaleString()} / $${revenueUsd.toLocaleString()}) * 100`,
        evaluatedResult: `${ebitdaMargin.toFixed(2)}%`,
        explanation: 'Measures pure operating cash profitability as a percentage of top-line revenue.',
      },
    ];

    return {
      calculationId: `calc_ebitda_${Date.now()}`,
      metricName: 'EBITDA & Operating Cash Profitability',
      category: 'financial',
      formulaLaTeX: '\\text{EBITDA} = \\text{Revenue} - \\text{COGS} - \\text{OpEx (excl. D\\&A)}',
      formulaPlain: 'EBITDA = Revenue - COGS - OpEx (excl. D&A)',
      variables,
      steps,
      finalResult: ebitda,
      formattedResult: `$${ebitda.toLocaleString()} (${ebitdaMargin.toFixed(1)}% margin)`,
      unit: 'USD',
      confidenceScore: 0.99,
      notesAndCaveats: ['Excludes non-operating income, taxes, and capital structure debt interest expenses.'],
    };
  }
}

export const formulaTraceEngine = new FormulaTraceEngine();
