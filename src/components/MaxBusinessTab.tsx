import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  FileText,
  Briefcase,
  Layers,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  Play,
  Download,
  RefreshCw,
  Search,
  Sparkles,
  ChevronRight,
  Calculator,
  Compass,
} from 'lucide-react';
import { MaxBusinessCapability, MaxBusinessPackage } from '../brain/max/types';
import { maxBusinessEngine } from '../brain/max/maxEngine';
import { MaxBusinessDashboard } from './MaxBusinessDashboard';
import { ConsequentialActionCard } from './ConsequentialActionCard';
import { FormulaTraceCard } from './FormulaTraceCard';

interface MaxBusinessTabProps {
  onSendToChat?: (prompt: string) => void;
}

export const MaxBusinessTab: React.FC<MaxBusinessTabProps> = ({ onSendToChat }) => {
  const [selectedCapability, setSelectedCapability] = useState<MaxBusinessCapability>('sales_analysis');
  const [activePackage, setActivePackage] = useState<MaxBusinessPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState('');

  const capabilities: { id: MaxBusinessCapability; label: string; icon: any; desc: string }[] = [
    { id: 'sales_analysis', label: 'Sales & Pipeline', icon: TrendingUp, desc: 'Pipeline velocity, win rates, conversion funnels & quota pacing' },
    { id: 'business_data_analysis', label: 'EBITDA & Financials', icon: DollarSign, desc: 'EBITDA margins, unit economics (LTV/CAC) & variance analysis' },
    { id: 'forecasting_assistance', label: 'Scenario Forecasting', icon: Sliders, desc: '3-scenario projections, confidence bounds & Monte-Carlo modeling' },
    { id: 'customer_analysis', label: 'Customer RFM & NRR', icon: Users, desc: 'Cohort segmentation, churn hazard modeling & net retention' },
    { id: 'inventory_analysis', label: 'Inventory & EOQ', icon: Package, desc: 'Economic Order Quantity, safety stock & stockout mitigation' },
    { id: 'business_research', label: 'Market & Porter 5', icon: Compass, desc: 'TAM/SAM/SOM sizing, competitive landscape & differentiation' },
    { id: 'document_analysis', label: 'Document & Contract Audit', icon: FileText, desc: 'P&L reconciliations, liability cap extraction & SLA red-flags' },
    { id: 'management_assistance', label: 'OKRs & Prioritization', icon: Briefcase, desc: 'Quantitative OKRs, RICE matrix & executive decision frameworks' },
    { id: 'workflow_planning', label: 'Workflows & CPM', icon: Layers, desc: 'Critical Path Method, RACI governance & milestone phasing' },
    { id: 'reporting', label: 'Executive Reporting', icon: FileText, desc: 'Board memos, QBR briefings & tabular variance matrices' },
    { id: 'dashboards', label: 'Live KPI Dashboard', icon: Zap, desc: 'Interactive scorecards, sparklines & regional performance' },
    { id: 'controlled_agents', label: 'Controlled Agents & Guard', icon: ShieldAlert, desc: 'Selective agent coordination & human-in-the-loop confirmation' },
  ];

  const loadCapabilityData = async (cap: MaxBusinessCapability, queryText?: string) => {
    setIsLoading(true);
    try {
      const q = queryText || `Execute ${cap.replace(/_/g, ' ')} with transparent formula traces and controlled agent coordination`;
      const pkg = await maxBusinessEngine.processBusinessRequest(q, {
        capabilityOverride: cap,
        simulateConsequentialAction: cap === 'inventory_analysis' || cap === 'controlled_agents',
      });
      setActivePackage(pkg);
    } catch (e) {
      console.error('Failed to load MAX capability:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCapabilityData(selectedCapability);
  }, [selectedCapability]);

  const handleRunQuery = () => {
    if (!customQuery.trim()) return;
    loadCapabilityData(selectedCapability, customQuery);
  };

  return (
    <div id="max-business-workspace" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-sm">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-zinc-900">MAX Business Architecture</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Autonomous Business Intelligence
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Controlled multi-agent orchestration, transparent mathematical audits, and human-in-the-loop action guards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadCapabilityData(selectedCapability)}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Model</span>
          </button>
        </div>
      </div>

      {/* Capability Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {capabilities.map((cap) => {
          const isSelected = selectedCapability === cap.id;
          const Icon = cap.icon;
          return (
            <button
              key={cap.id}
              onClick={() => setSelectedCapability(cap.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-400/20'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-amber-600 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && <span className="w-2 h-2 rounded-full bg-amber-600" />}
              </div>
              <div>
                <span className={`font-bold text-xs block ${isSelected ? 'text-amber-950' : 'text-zinc-900'}`}>
                  {cap.label}
                </span>
                <span className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5 leading-tight">{cap.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Query Bar */}
      <div className="flex items-center gap-2 p-2 rounded-xl border border-zinc-200 bg-white shadow-2xs">
        <Search className="w-4 h-4 text-zinc-400 ml-2 shrink-0" />
        <input
          type="text"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
          placeholder={`Ask MAX to perform deep ${selectedCapability.replace(/_/g, ' ')} or scenario audit...`}
          className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden"
        />
        <button
          onClick={handleRunQuery}
          disabled={isLoading}
          className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span>Execute Audit</span>
        </button>
      </div>

      {/* Active Package Output Dashboard */}
      {isLoading ? (
        <div className="p-12 rounded-2xl border border-zinc-200 bg-white flex flex-col items-center justify-center gap-3 text-center">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
          <div>
            <div className="font-bold text-sm text-zinc-900">MAX Engine Coordinating Capability Suite...</div>
            <p className="text-xs text-zinc-500 mt-0.5">Auditing mathematical formulas, routing controlled agents, and verifying safety boundaries</p>
          </div>
        </div>
      ) : activePackage ? (
        <MaxBusinessDashboard businessPackage={activePackage} onRunTestPrompt={onSendToChat} />
      ) : null}
    </div>
  );
};
