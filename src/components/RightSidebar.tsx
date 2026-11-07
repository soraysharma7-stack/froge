import React, { useState, useEffect } from 'react';
import {
  Search,
  Image,
  FileText,
  Globe,
  Languages,
  MapPin,
  BarChart3,
  Calculator,
  Terminal,
  Youtube,
  MoreHorizontal,
  Brain,
  Clock,
  ArrowRight,
  Layers,
  Sparkles,
  Cpu,
  Coins,
  ShieldCheck,
  Zap,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Conversation, FrogeModeId } from '../types';
import { FROGE_MODES } from '../constants/modes';
import { sessionMetricsTracker, SessionMetrics } from '../brain/modelRouter';
import { tokenUsageTracker } from '../brain/models/usageService';
import { UserTokenBalance, ConversationUsageStats } from '../brain/models/usageTypes';
import { modelProviderRegistry } from '../brain/models/providers';
import { TIER_PRICING } from '../brain/models/pricing';

interface RightSidebarProps {
  conversations: Conversation[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  activeMode: FrogeModeId;
  onSelectToolPrompt: (prompt: string) => void;
  onOpenRouterTests: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  activeModelId?: string;
  onOpenModelSelector?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  conversations,
  activeChatId,
  onSelectChat,
  activeMode,
  onSelectToolPrompt,
  onOpenRouterTests,
  activeModelId = 'fog-neural-core-v3',
  onOpenModelSelector,
}) => {
  const [metrics, setMetrics] = useState<SessionMetrics>(() =>
    sessionMetricsTracker.getMetrics()
  );
  const [tokenBalance, setTokenBalance] = useState<UserTokenBalance>(() =>
    tokenUsageTracker.getBalance()
  );
  const [convUsage, setConvUsage] = useState<ConversationUsageStats | null>(null);
  const [activeProvider, setActiveProvider] = useState(() =>
    modelProviderRegistry.getActiveProvider()
  );

  // Poll metrics and balance every 800ms
  useEffect(() => {
    const updateStats = () => {
      setMetrics(sessionMetricsTracker.getMetrics());
      setTokenBalance(tokenUsageTracker.getBalance());
      setActiveProvider(modelProviderRegistry.getActiveProvider());
      if (activeChatId) {
        setConvUsage(tokenUsageTracker.getConversationStats(activeChatId) || null);
      } else {
        setConvUsage(null);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 800);
    return () => clearInterval(interval);
  }, [activeChatId]);

  const handleAddBooster = () => {
    const updated = tokenUsageTracker.addBonusTokens(10000);
    setTokenBalance({ ...updated });
  };

  const handleRefillAllowance = () => {
    const updated = tokenUsageTracker.refillBalance();
    setTokenBalance({ ...updated });
  };

  const toolsList = [
    {
      id: 'neural-core',
      name: 'Neural Core',
      icon: Cpu,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 hover:bg-emerald-100',
      prompt: 'Inspect the 4-tier neural network architecture and trace inference flow for: ',
    },
    {
      id: 'research',
      name: 'Research',
      icon: Search,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 hover:bg-indigo-100',
      prompt: 'Perform a comprehensive research synthesis on: ',
    },
    {
      id: 'images',
      name: 'Images',
      icon: Image,
      color: 'text-pink-600',
      bg: 'bg-pink-50 hover:bg-pink-100',
      prompt: 'Generate an artistic visual concept description for: ',
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50 hover:bg-blue-100',
      prompt: 'Draft an executive document outline for: ',
    },
    {
      id: 'web-search',
      name: 'Web Search',
      icon: Globe,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 hover:bg-emerald-100',
      prompt: 'Search the live web and verify recent sources on: ',
    },
    {
      id: 'translate',
      name: 'Translate',
      icon: Languages,
      color: 'text-purple-600',
      bg: 'bg-purple-50 hover:bg-purple-100',
      prompt: 'Translate and localize the following text into Japanese & Spanish: ',
    },
    {
      id: 'maps',
      name: 'Maps',
      icon: MapPin,
      color: 'text-rose-600',
      bg: 'bg-rose-50 hover:bg-rose-100',
      prompt: 'Create a spatial map & travel itinerary for: ',
    },
    {
      id: 'charts',
      name: 'Charts',
      icon: BarChart3,
      color: 'text-amber-600',
      bg: 'bg-amber-50 hover:bg-amber-100',
      prompt: 'Generate data insights and comparative metrics for: ',
    },
    {
      id: 'calculator',
      name: 'Calculator',
      icon: Calculator,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50 hover:bg-cyan-100',
      prompt: 'Calculate exact compound interest and variance formula for: ',
    },
    {
      id: 'code-interpreter',
      name: 'Code Interpreter',
      icon: Terminal,
      color: 'text-slate-800',
      bg: 'bg-slate-100 hover:bg-slate-200',
      prompt: 'Execute and test TypeScript algorithm for: ',
    },
    {
      id: 'youtube-summary',
      name: 'YouTube Summary',
      icon: Youtube,
      color: 'text-red-600',
      bg: 'bg-red-50 hover:bg-red-100',
      prompt: 'Summarize key takeaways and timestamped outline for video: ',
    },
    {
      id: 'more',
      name: 'More',
      icon: MoreHorizontal,
      color: 'text-slate-500',
      bg: 'bg-slate-50 hover:bg-slate-100',
      prompt: 'Explore more FROGÉ Brain cognitive tools and capabilities.',
    },
  ];

  // Map active mode to model name
  const activeModeConfig = FROGE_MODES[activeMode];
  const activeModelTier = {
    'simple-chat': 'efficient_lite',
    'deep-thinking': 'deep_reasoning_standard',
    'froge-code': 'code_specialist',
    max: 'max_single_model',
    'student-mode': 'socratic_educator',
  }[activeMode] as keyof typeof TIER_PRICING;

  const currentTierInfo = TIER_PRICING[activeModelTier];

  const allowanceUsedRatio = tokenBalance.percentUsed;
  const remainingTokensFormatted = tokenBalance.remainingTokens.toLocaleString();

  return (
    <aside
      id="froge-right-sidebar"
      className="w-80 bg-white border-l border-zinc-200/70 flex flex-col h-full overflow-y-auto shrink-0 select-none hidden lg:flex"
    >
      <div className="p-3.5 space-y-4">
        {/* Token Balance & Plan Widget */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white shadow-md border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Token Balance</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono uppercase">
                    {tokenBalance.planName}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  Central Usage Service
                </div>
              </div>
            </div>

            <button
              onClick={onOpenRouterTests}
              className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded transition-colors"
            >
              Plans & Tests
            </button>
          </div>

          {/* Token Allowance Progress */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-zinc-400">Monthly Allowance</span>
              <span className="font-mono text-emerald-400 font-bold">
                {remainingTokensFormatted} left
              </span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  allowanceUsedRatio > 90
                    ? 'bg-rose-500'
                    : allowanceUsedRatio > 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(4, 100 - allowanceUsedRatio)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] text-zinc-500 mt-1 font-mono">
              <span>{tokenBalance.consumedTokens.toLocaleString()} used</span>
              <span>{tokenBalance.totalAllowance.toLocaleString()} cap</span>
            </div>
          </div>

          {/* Low token warning / Exceeded message */}
          {tokenBalance.isLimitReached && (
            <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/80 text-[11px] text-rose-300 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <span className="font-semibold">Allowance limit reached.</span>
                <p className="text-[10px] text-rose-200/80 mt-0.5">
                  You can add a free booster or switch to a higher plan.
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    onClick={handleAddBooster}
                    className="px-2 py-0.5 rounded bg-rose-800 hover:bg-rose-700 text-white text-[10px] font-bold"
                  >
                    +10k Booster
                  </button>
                  <button
                    onClick={handleRefillAllowance}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px]"
                  >
                    Refill
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-1 text-center font-mono">
            <div className="p-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/40">
              <div className="text-[8px] text-zinc-400 font-sans">Input Tokens</div>
              <div className="text-[11px] font-bold text-zinc-100">
                {tokenBalance.consumedInputTokens.toLocaleString()}
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/40">
              <div className="text-[8px] text-zinc-400 font-sans">Output Tokens</div>
              <div className="text-[11px] font-bold text-zinc-100">
                {tokenBalance.consumedOutputTokens.toLocaleString()}
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/40">
              <div className="text-[8px] text-zinc-400 font-sans">Tool Tokens</div>
              <div className="text-[11px] font-bold text-indigo-300">
                {tokenBalance.consumedToolTokens.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Estimated Model Cost */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800">
            <span className="text-zinc-400">Est. Model Cost:</span>
            <span className="font-mono font-bold text-emerald-400">
              ${tokenBalance.totalCostUsd.toFixed(5)}
            </span>
          </div>

          {/* Bonus Tokens / Top up */}
          {tokenBalance.bonusTokens > 0 && (
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-800/40">
              <span>Booster Allowance:</span>
              <span className="font-bold">+{tokenBalance.bonusTokens.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Active Mode Model Info */}
        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>FOG Neural Engine</span>
            </div>
            {onOpenModelSelector && (
              <button
                onClick={onOpenModelSelector}
                className="text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-200/70 px-2 py-0.5 rounded border border-emerald-300 transition-colors"
              >
                Switch Model
              </button>
            )}
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Selected:</span>
              <span className="font-semibold text-emerald-950 truncate max-w-[150px]">
                {activeModelId === 'fog-deep-reasoner'
                  ? 'FOG Reasoner Ultra'
                  : activeModelId === 'fog-code-matrix'
                  ? 'FOG Code Matrix'
                  : activeModelId === 'froge-model-gateway'
                  ? 'FROGÉ Model Gateway'
                  : activeModelId === 'fog-turbo-flow'
                  ? 'FOG Turbo Flow'
                  : 'FOG Neural Core v3'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Mode Tier:</span>
              <span className="font-semibold text-zinc-800 truncate max-w-[140px]" title={currentTierInfo.name}>
                {currentTierInfo.name}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-emerald-700 font-mono pt-1 border-t border-emerald-200/60 font-semibold">
              <span>100% In-Brain</span>
              <span>Zero External Keys</span>
            </div>
          </div>
        </div>

        {/* Conversation-Specific Usage (if active) */}
        {convUsage && (
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Active Chat Usage</span>
              </div>
              <span className="text-[10px] font-mono text-indigo-700 font-semibold">
                ${convUsage.totalCostUsd.toFixed(5)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
              <div className="p-1 rounded bg-white border border-indigo-100">
                <div className="text-[8px] text-zinc-400 font-sans">Prompt</div>
                <div className="font-bold text-zinc-800">{convUsage.totalInputTokens}</div>
              </div>
              <div className="p-1 rounded bg-white border border-indigo-100">
                <div className="text-[8px] text-zinc-400 font-sans">Completion</div>
                <div className="font-bold text-zinc-800">{convUsage.totalOutputTokens}</div>
              </div>
              <div className="p-1 rounded bg-white border border-indigo-100">
                <div className="text-[8px] text-zinc-400 font-sans">Tools</div>
                <div className="font-bold text-indigo-600">{convUsage.totalToolTokens}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tools Section */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold text-zinc-900 tracking-tight">Tools & Capabilities</h3>
            <button
              onClick={() => onSelectToolPrompt('Show all available FROGÉ tools and capabilities')}
              className="text-[10px] font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              Explore
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {toolsList.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  id={`tool-btn-${tool.id}`}
                  onClick={() => onSelectToolPrompt(tool.prompt)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl border border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100/80 hover:border-zinc-300 transition-all group text-center"
                >
                  <Icon className={`w-3.5 h-3.5 mb-1 ${tool.color} group-hover:scale-105 transition-transform`} />
                  <span className="text-[10px] font-medium text-zinc-700 leading-tight">
                    {tool.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Memory Section */}
        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
              <Brain className="w-3.5 h-3.5 text-emerald-600" />
              <span>Memory Vault</span>
            </div>
            <button
              onClick={() => onSelectToolPrompt('Show active user memory context and stored preferences')}
              className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View
            </button>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed mb-2">
            FROGÉ retains key preferences, code snippets and project context.
          </p>

          <div>
            <div className="flex items-center justify-between text-[10px] font-medium text-zinc-700 mb-1">
              <span>Usage</span>
              <span className="text-emerald-600 font-semibold">64%</span>
            </div>
            <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[64%]" />
            </div>
          </div>
        </div>

        {/* Recent Chats Section */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Recent Chats</span>
            </div>
            <button
              onClick={() => {
                if (conversations && conversations.length > 0) onSelectChat(conversations[0].id);
              }}
              className="text-[10px] font-medium text-zinc-400 hover:text-zinc-700"
            >
              View all
            </button>
          </div>

          <div className="space-y-0.5">
            {(conversations || []).slice(0, 5).map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition-colors ${
                  activeChatId === chat.id
                    ? 'bg-zinc-100 font-semibold text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <span className="truncate pr-2">{chat.title || 'Untitled Conversation'}</span>
                <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                  {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </button>
            ))}

            {(!conversations || conversations.length === 0) && (
              <div className="py-2 text-center text-xs text-zinc-400">
                No recent chats
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

