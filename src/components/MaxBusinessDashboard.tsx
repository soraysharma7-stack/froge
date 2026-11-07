import React, { useState } from 'react';
import {
  Zap,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  FileText,
  Briefcase,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Sliders,
  ChevronRight,
  BarChart3,
  PieChart,
  Calendar,
  Lock,
  Cpu,
} from 'lucide-react';
import { MaxBusinessPackage, ControlledAgentPlan } from '../brain/max/types';
import { FormulaTraceCard } from './FormulaTraceCard';
import { ConsequentialActionCard } from './ConsequentialActionCard';

interface MaxBusinessDashboardProps {
  businessPackage: MaxBusinessPackage;
  onRunTestPrompt?: (prompt: string) => void;
}

export const MaxBusinessDashboard: React.FC<MaxBusinessDashboardProps> = ({
  businessPackage,
  onRunTestPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'forecasting' | 'customers' | 'inventory' | 'agents' | 'traces'>('overview');
  const [forecastGrowthSlider, setForecastGrowthSlider] = useState(24.5);
  const [selectedScenario, setSelectedScenario] = useState<'Pessimistic (Bear)' | 'Base Case' | 'Optimistic (Bull)'>('Base Case');

  const { dashboard, salesAnalysis, businessDataAnalysis, forecasting, customerAnalysis, inventoryAnalysis, report, controlledAgentsEngaged, calculationTraces, consequentialActions } = businessPackage;

  // Simulated dynamic forecast based on slider
  const dynamicProjectedRevenue = Math.round(12000000 * (1 + forecastGrowthSlider / 100));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden my-4">
      {/* Top Header */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-zinc-900">MAX Business Intelligence Architecture</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                12-Capability Engine
              </span>
            </div>
            <p className="text-xs text-zinc-600">Autonomous Business Analytics, Transparent Math & Controlled Multi-Agent Coordination</p>
          </div>
        </div>

        {/* Safety & Traceability Indicators */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Action Guard Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            <span>{calculationTraces.length} Audited Traces</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-100 bg-zinc-50/70 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'overview' ? 'bg-white text-zinc-900 shadow-2xs font-semibold border border-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Overview & KPIs
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'sales' ? 'bg-white text-zinc-900 shadow-2xs font-semibold border border-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Sales & Pipeline
        </button>
        <button
          onClick={() => setActiveTab('forecasting')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'forecasting' ? 'bg-white text-zinc-900 shadow-2xs font-semibold border border-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Forecasting Simulator
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'customers' ? 'bg-white text-zinc-900 shadow-2xs font-semibold border border-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Customer RFM & NRR
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'inventory' ? 'bg-white text-zinc-900 shadow-2xs font-semibold border border-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Inventory & EOQ
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'agents' ? 'bg-white text-zinc-900 shadow-2xs font-semibold border border-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Controlled Agents ({controlledAgentsEngaged.filter((a) => a.status === 'invoked').length} Active)
        </button>
        <button
          onClick={() => setActiveTab('traces')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'traces' ? 'bg-white text-zinc-900 shadow-2xs font-semibold border border-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Transparent Math ({calculationTraces.length})
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="p-4 space-y-4 text-xs">
        {/* Consequential Action Alert Banner (if any pending actions) */}
        {consequentialActions && consequentialActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Consequential External Actions Awaiting Confirmation ({consequentialActions.length})</span>
            </div>
            {(consequentialActions || []).map((action) => (
              <ConsequentialActionCard key={action.actionId} action={action} />
            ))}
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* KPI Cards Grid */}
            {dashboard?.kpiCards && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {(dashboard.kpiCards || []).map((kpi) => (
                  <div key={kpi.id} className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                        <span className="truncate">{kpi.title}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            kpi.badgeTone === 'emerald'
                              ? 'bg-emerald-100 text-emerald-800'
                              : kpi.badgeTone === 'amber'
                              ? 'bg-amber-100 text-amber-800'
                              : kpi.badgeTone === 'rose'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {kpi.badgeText}
                        </span>
                      </div>
                      <div className="text-base font-bold text-zinc-900">{kpi.value}</div>
                    </div>
                    {kpi.subValue && <div className="text-[10px] text-zinc-500 mt-1 font-medium">{kpi.subValue}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Strategic Summary & Highlights */}
            {report && (
              <div className="p-3.5 rounded-xl border border-zinc-200 bg-white">
                <div className="font-bold text-xs text-zinc-900 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Executive Audit Briefing</span>
                </div>
                <p className="text-zinc-700 leading-relaxed text-xs mb-3">{report.executiveSummary}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-zinc-100 text-[11px]">
                  <div>
                    <span className="font-bold text-emerald-700 block mb-1">Key Operational Highlights</span>
                    <ul className="space-y-1 text-zinc-600">
                      {(report.keyHighlights || []).map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-rose-700 block mb-1">Critical Risk Signals</span>
                    <ul className="space-y-1 text-zinc-600">
                      {(report.criticalRisks || []).map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Segment Breakdown & Tabular Data */}
            {report?.tabularData && (
              <div className="rounded-xl border border-zinc-200 overflow-hidden">
                <div className="px-3.5 py-2 bg-zinc-50 border-b border-zinc-200 font-bold text-xs text-zinc-800">
                  Performance & Target Variance Matrix
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-zinc-100/70 text-zinc-600 border-b border-zinc-200">
                      <tr>
                        {(report.tabularData.headers || []).map((h, i) => (
                          <th key={i} className="py-2 px-3 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {(report.tabularData.rows || []).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-zinc-50/50">
                          {(row || []).map((cell, cIdx) => (
                            <td key={cIdx} className={`py-1.5 px-3 ${cIdx === 0 ? 'font-medium text-zinc-900' : 'text-zinc-600'}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. SALES TAB */}
        {activeTab === 'sales' && salesAnalysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-zinc-200 bg-amber-50/40">
                <span className="text-[10px] text-zinc-500 font-medium">Quarterly Revenue</span>
                <div className="text-lg font-bold text-zinc-900">${(salesAnalysis.totalRevenueUsd / 1000000).toFixed(2)}M</div>
                <span className="text-[10px] text-emerald-700 font-semibold">{salesAnalysis.quotaAttainmentPercent}% Quota Attainment</span>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 bg-emerald-50/40">
                <span className="text-[10px] text-zinc-500 font-medium">Pipeline Velocity</span>
                <div className="text-lg font-bold text-emerald-900">${salesAnalysis.pipelineVelocityUsdPerDay.toLocaleString()}/day</div>
                <span className="text-[10px] text-zinc-500">Recognized Daily Throughput</span>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 bg-indigo-50/40">
                <span className="text-[10px] text-zinc-500 font-medium">Win Rate</span>
                <div className="text-lg font-bold text-indigo-900">{salesAnalysis.winRatePercent}%</div>
                <span className="text-[10px] text-indigo-700 font-semibold">+4.4% YoY Expansion</span>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50">
                <span className="text-[10px] text-zinc-500 font-medium">Sales Cycle Length</span>
                <div className="text-lg font-bold text-zinc-900">{salesAnalysis.averageSalesCycleDays} Days</div>
                <span className="text-[10px] text-emerald-700 font-semibold">-6 Days vs Prior Quarter</span>
              </div>
            </div>

            {/* Pipeline Stage Conversions */}
            <div className="rounded-xl border border-zinc-200 overflow-hidden">
              <div className="px-3.5 py-2 bg-zinc-50 border-b border-zinc-200 font-bold text-xs text-zinc-800">
                Pipeline Stages & Conversion Funnel
              </div>
              <div className="p-3 space-y-2">
                {(salesAnalysis.pipelineStages || []).map((stage, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-900 text-xs">{stage.stageName}</div>
                        <div className="text-[10px] text-zinc-500">
                          {stage.dealCount} Deals | ${stage.pipelineValueUsd.toLocaleString()} Value | Avg {stage.averageAgeDays} days
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xs text-zinc-900">{stage.conversionRatePercent}%</span>
                      <span className="text-[10px] text-zinc-500 block">Stage Conversion</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. FORECASTING TAB */}
        {activeTab === 'forecasting' && (
          <div className="space-y-4">
            {/* Interactive Scenario Controls */}
            <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-xs text-zinc-900">Interactive Scenario Forecast Simulator</span>
                </div>
                <span className="text-xs font-bold text-amber-700">Projected: ${(dynamicProjectedRevenue / 1000000).toFixed(2)}M</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-zinc-600 mb-1">
                  <span>Simulated Annual Growth Rate: <strong>{forecastGrowthSlider.toFixed(1)}%</strong></span>
                  <span>Baseline: $12.0M</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="0.5"
                  value={forecastGrowthSlider}
                  onChange={(e) => setForecastGrowthSlider(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                {(['Pessimistic (Bear)', 'Base Case', 'Optimistic (Bull)'] as const).map((sc) => (
                  <button
                    key={sc}
                    onClick={() => {
                      setSelectedScenario(sc);
                      if (sc === 'Pessimistic (Bear)') setForecastGrowthSlider(12.0);
                      else if (sc === 'Base Case') setForecastGrowthSlider(24.5);
                      else setForecastGrowthSlider(38.0);
                    }}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      selectedScenario === sc
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Forecast Steps */}
            {forecasting && (
              <div className="rounded-xl border border-zinc-200 overflow-hidden">
                <div className="px-3.5 py-2 bg-zinc-50 border-b border-zinc-200 font-bold text-xs text-zinc-800">
                  12-Month Projected Revenue Confidence Envelope
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-3">
                  {(forecasting.monthlyProjections || []).map((m, i) => (
                    <div key={i} className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] text-zinc-500 font-medium block">{m.month}</span>
                      <span className="font-bold text-xs text-zinc-900 block">${(m.value / 1000).toFixed(0)}k</span>
                      <span className="text-[9px] text-zinc-400">
                        [${(m.lowerBound / 1000).toFixed(0)}k - ${(m.upperBound / 1000).toFixed(0)}k]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. CUSTOMERS TAB */}
        {activeTab === 'customers' && customerAnalysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-zinc-200 bg-indigo-50/40">
                <span className="text-[10px] text-zinc-500 font-medium">Net Revenue Retention (NRR)</span>
                <div className="text-lg font-bold text-indigo-900">{customerAnalysis.netRevenueRetentionPercent}%</div>
                <span className="text-[10px] text-indigo-700 font-semibold">Tier-1 SaaS Expansion</span>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 bg-emerald-50/40">
                <span className="text-[10px] text-zinc-500 font-medium">Customer Health Score</span>
                <div className="text-lg font-bold text-emerald-900">{customerAnalysis.customerHealthScore} / 100</div>
                <span className="text-[10px] text-emerald-700 font-semibold">Low Systemic Churn Risk</span>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50">
                <span className="text-[10px] text-zinc-500 font-medium">Annual Churn Rate</span>
                <div className="text-lg font-bold text-zinc-900">{customerAnalysis.annualChurnRatePercent}%</div>
                <span className="text-[10px] text-zinc-500">Avg {customerAnalysis.avgCustomerLifespanYears} yrs lifespan</span>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50">
                <span className="text-[10px] text-zinc-500 font-medium">Total Active Accounts</span>
                <div className="text-lg font-bold text-zinc-900">{customerAnalysis.totalCustomers.toLocaleString()}</div>
                <span className="text-[10px] text-zinc-500">Enterprise & Mid-Market</span>
              </div>
            </div>

            {/* RFM Segmentation Grid */}
            <div className="rounded-xl border border-zinc-200 overflow-hidden">
              <div className="px-3.5 py-2 bg-zinc-50 border-b border-zinc-200 font-bold text-xs text-zinc-800">
                RFM (Recency, Frequency, Monetary) Customer Cohort Breakdown
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 p-3">
                {(customerAnalysis.rfmSegments || []).map((seg, i) => (
                  <div key={i} className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-900">{seg.segmentName}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800">
                        {seg.percentageOfBase}% ({seg.customerCount} accounts)
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-700">
                      Avg ACV: <strong>${seg.avgMonetaryValueUsd.toLocaleString()}</strong>
                    </div>
                    <p className="text-[10px] text-zinc-500">{seg.recommendedPlaybook}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. INVENTORY TAB */}
        {activeTab === 'inventory' && inventoryAnalysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-zinc-200 bg-blue-50/40">
                <span className="text-[10px] text-zinc-500 font-medium">Inventory Turnover</span>
                <div className="text-lg font-bold text-blue-900">{inventoryAnalysis.inventoryTurnoverRatio}x</div>
                <span className="text-[10px] text-blue-700 font-semibold">{inventoryAnalysis.daysInventoryOutstandingDays} DIO Days</span>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50">
                <span className="text-[10px] text-zinc-500 font-medium">Total Inventory Valuation</span>
                <div className="text-lg font-bold text-zinc-900">${(inventoryAnalysis.totalInventoryValuationUsd / 1000000).toFixed(2)}M</div>
                <span className="text-[10px] text-zinc-500">{inventoryAnalysis.totalSkusAudited} Audited SKUs</span>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 bg-rose-50/40">
                <span className="text-[10px] text-zinc-500 font-medium">Reorder Triggers</span>
                <div className="text-lg font-bold text-rose-900">{inventoryAnalysis.skusNeedingImmediateReorder} SKUs Below ROP</div>
                <span className="text-[10px] text-rose-700 font-semibold">Stockout Mitigation Active</span>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50">
                <span className="text-[10px] text-zinc-500 font-medium">Annual Holding Cost</span>
                <div className="text-lg font-bold text-zinc-900">${inventoryAnalysis.annualHoldingCostUsd.toLocaleString()}</div>
                <span className="text-[10px] text-zinc-500">18.5% of Total Valuation</span>
              </div>
            </div>

            {/* SKU Audit Table */}
            <div className="rounded-xl border border-zinc-200 overflow-hidden">
              <div className="px-3.5 py-2 bg-zinc-50 border-b border-zinc-200 font-bold text-xs text-zinc-800">
                SKU Level Economic Order Quantity (EOQ) & Reorder Points
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-zinc-100 text-zinc-600 border-b border-zinc-200">
                    <tr>
                      <th className="py-2 px-3 font-semibold">SKU Code</th>
                      <th className="py-2 px-3 font-semibold">Name</th>
                      <th className="py-2 px-3 font-semibold">EOQ Lot Size</th>
                      <th className="py-2 px-3 font-semibold">Safety Stock</th>
                      <th className="py-2 px-3 font-semibold">ROP Threshold</th>
                      <th className="py-2 px-3 font-semibold">Current Units</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {(inventoryAnalysis.skuAudits || []).map((sku) => (
                      <tr key={sku.sku} className="hover:bg-zinc-50/50">
                        <td className="py-1.5 px-3 font-mono font-bold text-zinc-800">{sku.sku}</td>
                        <td className="py-1.5 px-3 text-zinc-900">{sku.name}</td>
                        <td className="py-1.5 px-3 font-semibold text-zinc-900">{sku.calculatedEoqUnits} units</td>
                        <td className="py-1.5 px-3 text-zinc-600">{sku.safetyStockUnits}</td>
                        <td className="py-1.5 px-3 font-semibold text-amber-800">{sku.reorderPointUnits}</td>
                        <td className="py-1.5 px-3 font-bold text-zinc-900">{sku.currentStockUnits}</td>
                        <td className="py-1.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sku.stockStatus === 'critical_stockout_risk'
                                ? 'bg-red-100 text-red-800'
                                : sku.stockStatus === 'reorder_needed'
                                ? 'bg-amber-100 text-amber-800'
                                : sku.stockStatus === 'excess_overstock'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {sku.stockStatus.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. CONTROLLED AGENTS TAB */}
        {activeTab === 'agents' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Selective Agent Coordination Protocol</strong>
                <span>
                  MAX coordinates specialized agents on-demand based on task domain. Unnecessary tools and agents are purposefully bypassed to prevent compute bloat and maintain strict operational boundaries.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(controlledAgentsEngaged || []).map((agent, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border transition-all ${
                    agent.status === 'invoked'
                      ? 'border-amber-300 bg-white shadow-xs'
                      : 'border-zinc-200 bg-zinc-50/50 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          agent.status === 'invoked' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-200 text-zinc-600'
                        }`}
                      >
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-zinc-900 block">{agent.agentName}</span>
                        <span className="text-[10px] text-zinc-500">{agent.agentRole}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        agent.status === 'invoked'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      {agent.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-600 mb-2">{agent.allocatedTask}</p>

                  {agent.findings && agent.findings.length > 0 && (
                    <div className="pt-2 border-t border-zinc-100 text-[10px] space-y-1">
                      <span className="font-bold text-zinc-700 block">Agent Findings:</span>
                      {(agent.findings || []).map((f, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-1 text-zinc-600">
                          <span className="text-amber-600">•</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. TRANSPARENT TRACES TAB */}
        {activeTab === 'traces' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Auditable Financial & Operational Arithmetic</strong>
                <span>
                  Every business calculation is decomposed into input variables, sources, LaTeX equations, and step-by-step arithmetic steps for complete governance transparency.
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {(calculationTraces || []).map((trace) => (
                <FormulaTraceCard key={trace.calculationId} trace={trace} defaultExpanded={true} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
