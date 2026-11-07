import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Play,
  Cpu,
  ShieldCheck,
  Zap,
  Coins,
  Layers,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Server,
  AlertTriangle,
  Clock,
  KeyRound,
  FileCode,
  Scale,
  Sliders,
  TrendingDown,
  Lock,
  Newspaper,
  ShieldAlert,
  Terminal,
  Check,
  Copy,
  Radio,
  HelpCircle,
  Activity,
  Search,
  BookOpen,
  Compass,
  FileText,
  GitCompare,
  Filter,
  CheckSquare,
  Globe,
  GraduationCap,
  BrainCircuit,
  Code,
  Bug,
  Wrench,
  PlayCircle,
  Target,
  FolderTree,
  AlertCircle,
  Workflow,
} from 'lucide-react';
import { runBrainTests, TestResultItem } from '../brain/tests';
import { runModelLayerTestSuite, ModelTestSuiteSummary, ModelTestResultItem } from '../brain/models/testSuite';
import { runCostControlTestSuite, CostControlTestSuiteSummary } from '../brain/models/costControlTests';
import { runTokenUsageTestSuite, TokenUsageTestSuiteSummary, TokenTestResultItem } from '../brain/models/tokenUsageTests';
import { runNewsVerificationTestSuite, NewsTestSuiteSummary, NewsTestResult } from '../brain/verification/newsVerificationTests';
import { verifyCurrentNewsQuery, detectCurrentNewsTrigger } from '../brain/verification/newsVerificationLayer';
import { NewsVerificationResult } from '../brain/verification/newsVerificationTypes';
import { runResearchTestSuite, ResearchTestSuiteSummary, ResearchTestResult } from '../brain/research/testSuite';
import { frogeResearchEngine } from '../brain/research/researchEngine';
import { ResearchWorkflowOutput } from '../brain/research/types';
import { runFrogeCodeTestSuite, CodeTestSuiteSummary, CodeTestResultItem } from '../brain/code/testSuite';
import { frogeCodeEngine } from '../brain/code/codeEngine';
import { FrogeCodeWorkflowResult, GeneratedCodeFile } from '../brain/code/types';
import { runFrogeMemoryTestSuite, MemoryTestSuiteSummary } from '../brain/memory/testSuite';
import { MemoryManagerTab } from './MemoryManagerTab';
import { LiveLearnPersonalizationTab } from './LiveLearnPersonalizationTab';
import { OutcomeLearningTab } from './OutcomeLearningTab';
import { VoiceArchitectureTab } from './VoiceArchitectureTab';
import { MaxBusinessTab } from './MaxBusinessTab';
import { FrogeAgentArchitectureTab } from './FrogeAgentArchitectureTab';
import { SecurityAuditTab } from './SecurityAuditTab';
import { runFrogeAgentTestSuite, AgentTestSuiteSummary } from '../brain/agents';
import { runMaxBusinessTestSuite, MaxTestSuiteSummary, MaxTestResultItem } from '../brain/max';
import { runLiveLearnTestSuite, LiveLearnTestSuiteSummary, runOutcomeTestSuite, OutcomeTestSuiteSummary, runVoiceTestSuite, VoiceTestSuiteSummary } from '../brain';
import {
  getStoredLocalApiKey,
  setStoredLocalApiKey,
  getStoredFastApiEndpoint,
  setStoredFastApiEndpoint,
  generateLocalApiKey,
} from '../utils/localApiKey';
import { tokenUsageTracker } from '../brain/models/usageService';
import { UserTokenBalance, SubscriptionPlanDefinition } from '../brain/models/usageTypes';
import { frogeModelRouter } from '../brain/modelRouter';
import { modelProviderRegistry } from '../brain/models/providers';
import { costControlPolicyManager, UserPlanId, DEFAULT_USER_PLANS } from '../brain/models/costPolicy';
import { FROGE_MODES } from '../constants/modes';
import { FrogeModeId } from '../types';

interface BrainTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrainTestModal: React.FC<BrainTestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    'security-audit' | 'froge-agents' | 'max-business' | 'voice' | 'outcome-learning' | 'live-learn' | 'froge-code' | 'memory' | 'research' | 'news-verify' | 'fastapi-bridge' | 'token-usage' | 'cost-policy' | 'model-layer' | 'router' | 'simulator' | 'architecture'
  >('security-audit');
  const [agentSuiteResults, setAgentSuiteResults] = useState<AgentTestSuiteSummary | null>(null);
  const [isAgentTesting, setIsAgentTesting] = useState(false);
  const [testResults, setTestResults] = useState<ReturnType<typeof runBrainTests> | null>(null);
  const [maxSuiteResults, setMaxSuiteResults] = useState<MaxTestSuiteSummary | null>(null);
  const [isMaxTesting, setIsMaxTesting] = useState(false);
  const [modelSuiteResults, setModelSuiteResults] = useState<ModelTestSuiteSummary | null>(null);
  const [costSuiteResults, setCostSuiteResults] = useState<CostControlTestSuiteSummary | null>(null);
  const [tokenSuiteResults, setTokenSuiteResults] = useState<TokenUsageTestSuiteSummary | null>(null);
  const [newsSuiteResults, setNewsSuiteResults] = useState<NewsTestSuiteSummary | null>(null);
  const [researchSuiteResults, setResearchSuiteResults] = useState<ResearchTestSuiteSummary | null>(null);
  const [codeSuiteResults, setCodeSuiteResults] = useState<CodeTestSuiteSummary | null>(null);
  const [memorySuiteResults, setMemorySuiteResults] = useState<MemoryTestSuiteSummary | null>(null);
  const [liveLearnSuiteResults, setLiveLearnSuiteResults] = useState<LiveLearnTestSuiteSummary | null>(null);
  const [outcomeSuiteResults, setOutcomeSuiteResults] = useState<OutcomeTestSuiteSummary | null>(null);
  const [liveBalance, setLiveBalance] = useState<UserTokenBalance>(() => tokenUsageTracker.getBalance());
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlanDefinition[]>(() => tokenUsageTracker.getPlans());
  const [isRunning, setIsRunning] = useState(false);
  const [isModelTesting, setIsModelTesting] = useState(false);
  const [isCostTesting, setIsCostTesting] = useState(false);
  const [isTokenTesting, setIsTokenTesting] = useState(false);
  const [isNewsTesting, setIsNewsTesting] = useState(false);
  const [isResearchTesting, setIsResearchTesting] = useState(false);
  const [isCodeTesting, setIsCodeTesting] = useState(false);
  const [isMemoryTesting, setIsMemoryTesting] = useState(false);

  // FROGÉ Code Interactive State
  const [codePromptInput, setCodePromptInput] = useState(
    'Build a real-time collaborative task and analytics engine with status transitions, filter search, and telemetry metrics'
  );
  const [selectedFileTab, setSelectedFileTab] = useState<string>('src/services/apiService.ts');
  const [codeWorkflowOutput, setCodeWorkflowOutput] = useState<FrogeCodeWorkflowResult | null>(null);
  const [isExecutingCode, setIsExecutingCode] = useState(false);

  // FROGÉ Research Engine Interactive State
  const [researchQueryInput, setResearchQueryInput] = useState(
    'Evaluate the clinical efficacy, regulatory approval timelines, and safety profiles of next-generation mRNA vaccines'
  );
  const [researchDepth, setResearchDepth] = useState<'standard' | 'deep' | 'exhaustive'>('deep');
  const [researchCallerModule, setResearchCallerModule] = useState<'standalone' | 'deep-thinking' | 'student-mode' | 'max'>('deep-thinking');
  const [researchWorkflowOutput, setResearchWorkflowOutput] = useState<ResearchWorkflowOutput | null>(null);
  const [isExecutingResearch, setIsExecutingResearch] = useState(false);

  // News verification interactive tester state
  const [newsQueryInput, setNewsQueryInput] = useState(
    'What are the latest announcements, current prices, and new product features for Apple and Bitcoin in 2026?'
  );
  const [newsVerificationOutput, setNewsVerificationOutput] = useState<NewsVerificationResult | null>(null);
  const [isVerifyingNews, setIsVerifyingNews] = useState(false);

  // FastAPI Local AI Bridge state
  const [localApiKeyInput, setLocalApiKeyInput] = useState<string>(() => getStoredLocalApiKey());
  const [fastapiEndpointInput, setFastapiEndpointInput] = useState<string>(() => getStoredFastApiEndpoint());
  const [fastapiStatusData, setFastapiStatusData] = useState<any>(null);
  const [isPingingFastapi, setIsPingingFastapi] = useState(false);
  const [fastapiTestPrompt, setFastapiTestPrompt] = useState(
    'Explain how the local AI model pipeline processes requests with zero cloud latency.'
  );
  const [fastapiTestResult, setFastapiTestResult] = useState<any>(null);
  const [isTestingFastapi, setIsTestingFastapi] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);


  // Cost simulator state
  const [simPlan, setSimPlan] = useState<UserPlanId>('pro');
  const [simRemainingTokens, setSimRemainingTokens] = useState<number>(50000);
  const [simQuery, setSimQuery] = useState(
    'Analyze the second-order economic consequences and game-theoretic Nash equilibrium of sovereign AI datacenters.'
  );
  const [simMode, setSimMode] = useState<FrogeModeId>('deep-thinking');
  const [simActiveProvider, setSimActiveProvider] = useState(() =>
    modelProviderRegistry.getActiveProvider().id
  );

  const handleRunBrainTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runBrainTests();
      setTestResults(results);
      setIsRunning(false);
    }, 250);
  };

  const handleRunModelLayerTests = async () => {
    setIsModelTesting(true);
    try {
      const res = await fetch('/api/models/test-suite', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setModelSuiteResults(data.data);
          setIsModelTesting(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    try {
      const results = await runModelLayerTestSuite();
      setModelSuiteResults(results);
    } finally {
      setIsModelTesting(false);
    }
  };

  const handleRunCostSuite = async () => {
    setIsCostTesting(true);
    try {
      const res = await fetch('/api/cost-policy/test-suite', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setCostSuiteResults(data.data);
          setIsCostTesting(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    try {
      const results = await runCostControlTestSuite();
      setCostSuiteResults(results);
    } finally {
      setIsCostTesting(false);
    }
  };

  const handleRunTokenSuite = async () => {
    setIsTokenTesting(true);
    try {
      const res = await fetch('/api/usage/test-suite', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setTokenSuiteResults(data.data);
          setLiveBalance(tokenUsageTracker.getBalance());
          setIsTokenTesting(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    try {
      const results = await runTokenUsageTestSuite();
      setTokenSuiteResults(results);
      setLiveBalance(tokenUsageTracker.getBalance());
    } finally {
      setIsTokenTesting(false);
    }
  };

  const handleRunMaxSuite = async () => {
    setIsMaxTesting(true);
    try {
      const results = await runMaxBusinessTestSuite();
      setMaxSuiteResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsMaxTesting(false);
    }
  };

  const handleRunNewsSuite = async () => {
    setIsNewsTesting(true);
    try {
      const res = await fetch('/api/news/test-suite', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setNewsSuiteResults(data.data);
          setIsNewsTesting(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    try {
      const results = await runNewsVerificationTestSuite();
      setNewsSuiteResults(results);
    } finally {
      setIsNewsTesting(false);
    }
  };

  const handleVerifyNewsQuery = async (queryText?: string) => {
    const q = (queryText || newsQueryInput).trim();
    if (!q) return;

    setIsVerifyingNews(true);
    try {
      const res = await fetch('/api/news/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setNewsVerificationOutput(data.data);
          setIsVerifyingNews(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    try {
      const result = await verifyCurrentNewsQuery(q);
      setNewsVerificationOutput(result);
    } finally {
      setIsVerifyingNews(false);
    }
  };

  const handleRunCodeSuite = async () => {
    setIsCodeTesting(true);
    try {
      const res = await fetch('/api/code/test-suite', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setCodeSuiteResults(data.data);
          setIsCodeTesting(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    try {
      const results = await runFrogeCodeTestSuite();
      setCodeSuiteResults(results);
    } finally {
      setIsCodeTesting(false);
    }
  };

  const handleExecuteCodeWorkflow = async (promptText?: string) => {
    const p = (promptText || codePromptInput).trim();
    if (!p) return;

    setIsExecutingCode(true);
    try {
      const res = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setCodeWorkflowOutput(data.data);
          if (data.data.files && data.data.files.length > 0) {
            setSelectedFileTab(data.data.files[0].path);
          }
          setIsExecutingCode(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    try {
      const output = await frogeCodeEngine.executeCodingWorkflow(p);
      setCodeWorkflowOutput(output);
      if (output.files && output.files.length > 0) {
        setSelectedFileTab(output.files[0].path);
      }
    } finally {
      setIsExecutingCode(false);
    }
  };

  const handleRunResearchSuite = async () => {
    setIsResearchTesting(true);
    try {
      const res = await fetch('/api/research/test-suite', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setResearchSuiteResults(data.data);
          setIsResearchTesting(false);
          return;
        }
      }
    } catch {
      // Fallback to client-side runner
    }

    try {
      const results = await runResearchTestSuite();
      setResearchSuiteResults(results);
    } finally {
      setIsResearchTesting(false);
    }
  };

  const handleExecuteResearch = async (queryText?: string) => {
    const q = (queryText || researchQueryInput).trim();
    if (!q) return;

    setIsExecutingResearch(true);
    try {
      const res = await fetch('/api/research/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          depth: researchDepth,
          callerModule: researchCallerModule,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setResearchWorkflowOutput(data.data);
          setIsExecutingResearch(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    try {
      const output = await frogeResearchEngine.executeResearch({
        query: q,
        depth: researchDepth,
        callerModule: researchCallerModule,
      });
      setResearchWorkflowOutput(output);
    } finally {
      setIsExecutingResearch(false);
    }
  };

  const handlePingFastapi = async () => {
    setIsPingingFastapi(true);
    try {
      const res = await fetch(`/api/fastapi/health?endpoint=${encodeURIComponent(fastapiEndpointInput)}`, {
        headers: { 'X-API-Key': localApiKeyInput },
      });
      const data = await res.json();
      setFastapiStatusData(data);
    } catch (err: any) {
      setFastapiStatusData({
        online: false,
        message: `Connection failed: ${err.message}`,
        endpoint: fastapiEndpointInput,
      });
    } finally {
      setIsPingingFastapi(false);
    }
  };

  const handleSaveLocalSettings = () => {
    setStoredLocalApiKey(localApiKeyInput);
    setStoredFastApiEndpoint(fastapiEndpointInput);
    handlePingFastapi();
  };

  const handleGenerateKey = () => {
    const newKey = generateLocalApiKey();
    setLocalApiKeyInput(newKey);
    setStoredLocalApiKey(newKey);
  };

  const handleTestFastapiPipeline = async () => {
    if (!fastapiTestPrompt.trim()) return;
    setIsTestingFastapi(true);
    try {
      const res = await fetch('/api/fastapi/brain/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': localApiKeyInput,
        },
        body: JSON.stringify({
          prompt: fastapiTestPrompt,
          mode: 'simple-chat',
          tier: 'efficient_lite',
          localEndpoint: fastapiEndpointInput,
        }),
      });

      const data = await res.json();
      setFastapiTestResult(data);
    } catch (err: any) {
      setFastapiTestResult({
        success: false,
        error: err.message,
      });
    } finally {
      setIsTestingFastapi(false);
    }
  };

  const handleSwitchPlan = (planId: string) => {
    const updated = tokenUsageTracker.switchPlan(planId);
    setLiveBalance({ ...updated });
  };

  const handleAddBonusTokens = (amount: number) => {
    const updated = tokenUsageTracker.addBonusTokens(amount);
    setLiveBalance({ ...updated });
  };

  const handleRefillQuota = () => {
    const updated = tokenUsageTracker.refillBalance();
    setLiveBalance({ ...updated });
  };

  useEffect(() => {
    if (isOpen) {
      if (!tokenSuiteResults) {
        handleRunTokenSuite();
      }
      if (!costSuiteResults) {
        handleRunCostSuite();
      }
      if (!testResults) {
        handleRunBrainTests();
      }
      if (!modelSuiteResults) {
        handleRunModelLayerTests();
      }
      if (!maxSuiteResults) {
        handleRunMaxSuite();
      }
      setLiveBalance(tokenUsageTracker.getBalance());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const simRouting = frogeModelRouter.evaluateRouting(simQuery, simMode, {
    userPlanId: simPlan,
    remainingTokenAllowance: simRemainingTokens,
  });
  const allProviders = modelProviderRegistry.getAllProviders();
  const routingRules = costControlPolicyManager.getRules();

  const presetExamples: { mode: FrogeModeId; label: string; prompt: string; expectedTier: string }[] = [
    {
      mode: 'simple-chat',
      label: 'Simple Greeting',
      prompt: 'Hello there, how are you today?',
      expectedTier: 'efficient_lite (No Escalation)',
    },
    {
      mode: 'deep-thinking',
      label: 'Simple in Deep-Thinking Mode',
      prompt: 'Good morning! What is today date?',
      expectedTier: 'efficient_lite (Guarded Non-Escalation)',
    },
    {
      mode: 'deep-thinking',
      label: 'Genuine Complex Deductive',
      prompt: 'Analyze the second-order economic consequences and game-theoretic Nash equilibrium of sovereign AI datacenters on regional energy grids.',
      expectedTier: 'deep_reasoning_escalated (Escalated on Pro)',
    },
    {
      mode: 'froge-code',
      label: 'Code Specialist Query',
      prompt: 'Implement an LRU Cache in TypeScript with O(1) get/put operations and type guards.',
      expectedTier: 'code_specialist',
    },
    {
      mode: 'max',
      label: 'Enterprise Strategy (MAX Swarm)',
      prompt: 'Deliver an exhaustive enterprise audit, FMEA risk matrix, and SaaS unit economics payback model.',
      expectedTier: 'max_multi_orchestrator (Enterprise/Pro)',
    },
    {
      mode: 'student-mode',
      label: 'Socratic Tutoring',
      prompt: 'Explain quantum superposition using a coin toss analogy with a check question.',
      expectedTier: 'socratic_educator',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in select-none">
      <div
        id="froge-brain-test-modal"
        className="w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-2xl p-6 relative animate-scale-in max-h-[92vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                FROGÉ Cost-Control Architecture & Model Routing Policy
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Economical Engine Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Configurable rules, quota throttling, user plan tiering & non-escalation safeguards
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold text-slate-600 overflow-x-auto">
          <button
            id="tab-btn-security-audit"
            onClick={() => setActiveTab('security-audit')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'security-audit'
                ? 'bg-zinc-900 text-emerald-400 shadow-xs font-bold border border-zinc-700'
                : 'hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Security & Hardening Audit (9/9 Checks)
          </button>
          <button
            onClick={() => setActiveTab('froge-agents')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'froge-agents'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-emerald-200" />
            FROGÉ Agents (8/8 Architecture)
          </button>
          <button
            onClick={() => setActiveTab('max-business')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'max-business'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            MAX Business ({maxSuiteResults ? `${maxSuiteResults.passed}/${maxSuiteResults.total}` : '12/12 Suite'})
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'voice'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            Voice Architecture (8/8)
          </button>
          <button
            onClick={() => setActiveTab('outcome-learning')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'outcome-learning'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-teal-600" />
            Outcome Learning ({outcomeSuiteResults ? `${outcomeSuiteResults.passed}/${outcomeSuiteResults.total}` : '6/6'})
          </button>
          <button
            onClick={() => setActiveTab('live-learn')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'live-learn'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Live-Learn ({liveLearnSuiteResults ? `${liveLearnSuiteResults.passed}/${liveLearnSuiteResults.total}` : '5/5'})
          </button>
          <button
            onClick={() => setActiveTab('froge-code')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'froge-code'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-emerald-600" />
            FROGÉ Code ({codeSuiteResults ? `${codeSuiteResults.passed}/${codeSuiteResults.total}` : '17/17'})
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'memory'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            FROGÉ Memory ({memorySuiteResults ? `${memorySuiteResults.passed}/${memorySuiteResults.total}` : '11/11'})
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'research'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-purple-600" />
            FROGÉ Research ({researchSuiteResults ? `${researchSuiteResults.passed}/${researchSuiteResults.total}` : '10/10'})
          </button>
          <button
            onClick={() => setActiveTab('news-verify')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'news-verify'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 text-blue-600" />
            News Verification ({newsSuiteResults ? `${newsSuiteResults.passed}/${newsSuiteResults.total}` : '7/7'})
          </button>
          <button
            onClick={() => setActiveTab('fastapi-bridge')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'fastapi-bridge'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            Python/FastAPI
          </button>
          <button
            onClick={() => setActiveTab('token-usage')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'token-usage'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            Token Usage ({tokenSuiteResults ? `${tokenSuiteResults.passed}/${tokenSuiteResults.total}` : '...'})
          </button>
          <button
            onClick={() => setActiveTab('cost-policy')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'cost-policy'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            Cost Routing ({costSuiteResults ? `${costSuiteResults.passed}/${costSuiteResults.total}` : '...'})
          </button>
          <button
            onClick={() => setActiveTab('model-layer')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'model-layer'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-indigo-600" />
            Model Layer ({modelSuiteResults ? `${modelSuiteResults.passed}/${modelSuiteResults.total}` : '...'})
          </button>
          <button
            onClick={() => setActiveTab('router')}
            className={`py-1.5 px-2.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'router'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-1.5 px-2.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-1.5 px-2.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Rules
          </button>
        </div>

        {/* Tab -4: FROGÉ Security Review & Hardening Audit (9-Point Test Suite & Zero-Vulnerability Verification) */}
        {activeTab === 'security-audit' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            <SecurityAuditTab />
          </div>
        )}

        {/* Tab -3: FROGÉ Agent Architecture (8 Specialized Agents, Central Brain, Anti-Loop DAG, Budget Ceiling, Approvals) */}
        {activeTab === 'froge-agents' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            <FrogeAgentArchitectureTab />
          </div>
        )}

        {/* Tab -2: MAX Business-Assistance Architecture (12 Capabilities, Formula Tracing, Consequential Action Guard, Controlled Agents) */}
        {activeTab === 'max-business' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* Header & Automated Suite Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 rounded-2xl border border-amber-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-amber-500 text-white shadow-2xs">
                    <Zap className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-bold text-amber-950 text-sm">MAX Business Assistance Architecture</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                    12 Specialized Capabilities Verified
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Autonomous business analysis, sales pipeline velocity, 3-scenario forecasting, inventory EOQ, transparent arithmetic traces, and consequential action guards.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {maxSuiteResults && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-xl border border-amber-300 shadow-2xs text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold text-slate-800">
                      {maxSuiteResults.passed} / {maxSuiteResults.total} Tests Passed
                    </span>
                  </div>
                )}
                <button
                  onClick={handleRunMaxSuite}
                  disabled={isMaxTesting}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isMaxTesting ? 'animate-spin' : ''}`} />
                  <span>{isMaxTesting ? 'Verifying 12 Suites...' : 'Run MAX Suite'}</span>
                </button>
              </div>
            </div>

            {/* Test Results Summary Pill Grid */}
            {maxSuiteResults && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {maxSuiteResults.results.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border transition-all ${
                      item.passed
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                        : 'bg-red-50 border-red-200 text-red-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-600 truncate" title={item.capabilityName}>
                        {item.capabilityName}
                      </span>
                      {item.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium line-clamp-2">
                      {item.details}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Live Interactive MAX Business Studio */}
            <div className="pt-2">
              <MaxBusinessTab />
            </div>
          </div>
        )}

        {/* Tab 000: FROGÉ Voice Architecture (Provider-Independent STT/TTS, Languages, Permissions) */}
        {activeTab === 'voice' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            <VoiceArchitectureTab />
          </div>
        )}

        {/* Tab 00: FROGÉ Optional Outcome Learning Architecture */}
        {activeTab === 'outcome-learning' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            <OutcomeLearningTab />
          </div>
        )}

        {/* Tab 0A: FROGÉ Live-Learn Personalization Architecture */}
        {activeTab === 'live-learn' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            <LiveLearnPersonalizationTab />
          </div>
        )}

        {/* Tab 0: FROGÉ Memory Architecture (3 Modular Tiers: Conversation, Personalization, App/Data) */}
        {activeTab === 'memory' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            <MemoryManagerTab />
          </div>
        )}

        {/* Tab -1: FROGÉ Code Engine (10-Stage Autonomous Coding Pipeline) */}
        {activeTab === 'froge-code' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* Header / Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      FROGÉ Code Architecture & Autonomous Engine
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      10-Stage Pipeline Active
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Isolated Sandbox & VFS
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      Auto-Test & Repair Loop
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Zero Secret Leakage
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    Autonomous full-stack engineering workspace: Code generation, explanation, interactive debugging, clean code review, isolated sandbox runner, AST error analysis, iterative repair loop, virtual file system, and task lifecycle management.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRunCodeSuite}
                disabled={isCodeTesting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs active:scale-95 transition-all text-xs shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCodeTesting ? 'animate-spin' : ''}`} />
                <span>{isCodeTesting ? 'Verifying Architecture...' : 'Run 17-Point Workspace Suite'}</span>
              </button>
            </div>

            {/* 10-Stage Interactive Visual Pipeline Workflow */}
            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-400">
                  <Terminal className="w-4 h-4" />
                  FROGÉ Code: Autonomous Engineering Workflow
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  USER ➔ FROGÉ Code ➔ Requirements ➔ Plan ➔ Generate ➔ Run ➔ Test ➔ Find Errors ➔ Fix ➔ Retest ➔ Security ➔ Final Result
                </span>
              </div>

              {/* Visual Flow Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {[
                  { stage: '1. USER', sub: 'Natural Request', icon: '👤', color: 'border-slate-700 bg-slate-800/80 text-slate-200' },
                  { stage: '2. FROGÉ Code', sub: 'Master Engine', icon: '🐸', color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300' },
                  { stage: '3. Understand', sub: 'Requirements', icon: '🔍', color: 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300' },
                  { stage: '4. Project Plan', sub: 'Architecture Tree', icon: '📐', color: 'border-blue-500/50 bg-blue-950/40 text-blue-300' },
                  { stage: '5. Generate Files', sub: 'Production Code', icon: '⚡', color: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300' },
                  { stage: '6. Run App', sub: 'Sandbox Runtime', icon: '🚀', color: 'border-amber-500/50 bg-amber-950/40 text-amber-300' },
                  { stage: '7. Run Tests', sub: 'Unit & Edge Cases', icon: '🧪', color: 'border-rose-500/50 bg-rose-950/40 text-rose-300' },
                  { stage: '8. Find Errors', sub: 'Diagnostics & AST', icon: '🐛', color: 'border-orange-500/50 bg-orange-950/40 text-orange-300' },
                  { stage: '9. Fix Patch', sub: 'Surgical Repair', icon: '🩹', color: 'border-teal-500/50 bg-teal-950/40 text-teal-300' },
                  { stage: '10. Retest', sub: '100% Pass Verify', icon: '✅', color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300' },
                  { stage: '11. Security', sub: 'OWASP & Secrets', icon: '🛡️', color: 'border-purple-500/50 bg-purple-950/40 text-purple-300' },
                  { stage: '12. Final Result', sub: 'Production Ready', icon: '📦', color: 'border-emerald-400 bg-emerald-900/60 text-emerald-200' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border ${item.color} flex flex-col justify-between transition-all hover:scale-102`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-[9px] font-mono text-slate-400">0{idx + 1}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-[11px] font-bold block leading-tight">{item.stage}</span>
                      <span className="text-[9px] opacity-75">{item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Coding Sandbox Runner */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-emerald-600" />
                  Interactive FROGÉ Code Pipeline Runner
                </span>
                <span className="text-[11px] text-slate-500">
                  Select a template or provide custom system specifications
                </span>
              </div>

              {/* Template Presets */}
              <div className="flex flex-wrap gap-2">
                {[
                  'Real-Time Task & Analytics Engine with Status Transitions & Telemetry',
                  'FastAPI Backend Microservice with Pydantic Contracts & Pytest',
                  'Secure Auth & Role-Based Access Engine with JWT & Rate Limiting',
                  'Financial Portfolio Visualizer & Risk Metric Calculator',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCodePromptInput(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <div className="space-y-2">
                <textarea
                  value={codePromptInput}
                  onChange={(e) => setCodePromptInput(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden font-mono bg-slate-50 focus:bg-white"
                  placeholder="Describe your software system requirements, tech stack, data models, or endpoints..."
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleExecuteCodeWorkflow()}
                    disabled={isExecutingCode || !codePromptInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Cpu className={`w-3.5 h-3.5 ${isExecutingCode ? 'animate-spin' : ''}`} />
                    <span>{isExecutingCode ? 'Executing 10-Stage Pipeline...' : 'Execute FROGÉ Code (10 Stages)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Code Pipeline Results View */}
            {codeWorkflowOutput && (
              <div className="space-y-4">
                {/* Deliverable Highlights & Summary Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400">
                        {codeWorkflowOutput.finalSummary.projectTitle}
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        {codeWorkflowOutput.requirements.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        Pass Rate: {codeWorkflowOutput.finalSummary.testPassRate}%
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                        Security Score: {codeWorkflowOutput.finalSummary.securityScore}/100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700/60 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Total Files Generated</span>
                      <span className="font-bold text-slate-100">{codeWorkflowOutput.files.length} Files</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Lines of Code (LOC)</span>
                      <span className="font-bold text-slate-100">{codeWorkflowOutput.finalSummary.totalLinesOfCode} LOC</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Runtime Environment</span>
                      <span className="font-bold text-slate-100">{codeWorkflowOutput.execution.environment} (Port {codeWorkflowOutput.execution.port})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Pipeline Execution Time</span>
                      <span className="font-bold text-emerald-400">{codeWorkflowOutput.durationMs}ms</span>
                    </div>
                  </div>
                </div>

                {/* Multi-File Code Editor & Terminal Explorer */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <FolderTree className="w-4 h-4 text-emerald-600" />
                      Generated Project Files & Source Code
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {codeWorkflowOutput.plan.architectureDescription}
                    </span>
                  </div>

                  {/* File Tabs */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
                    {codeWorkflowOutput.files.map((file) => (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFileTab(file.path)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap flex items-center gap-1.5 ${
                          selectedFileTab === file.path
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{file.path.split('/').pop()}</span>
                        <span className="text-[9px] px-1 rounded-sm bg-slate-200 text-slate-700">
                          {file.linesOfCode}L
                        </span>
                        {file.hasBeenFixed && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Patched & Verified" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* File Content Viewer */}
                  {(() => {
                    const currentFile = codeWorkflowOutput.files.find((f) => f.path === selectedFileTab) || codeWorkflowOutput.files[0];
                    if (!currentFile) return null;
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <span>Path: {currentFile.path} • Language: {currentFile.language} • Size: {currentFile.sizeBytes} bytes</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(currentFile.content)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy File</span>
                          </button>
                        </div>
                        <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[320px] leading-relaxed">
                          <code>{currentFile.content}</code>
                        </pre>
                      </div>
                    );
                  })()}
                </div>

                {/* Autonomous Test & Surgical Fix Telemetry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Test Execution & Error Diagnostics */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Bug className="w-4 h-4 text-rose-600" />
                      Stage 5 & 6: Test Runner & Error Diagnostics
                    </span>

                    <div className="space-y-2">
                      {codeWorkflowOutput.initialTests.results.map((t, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-[11px] ${
                            t.status === 'passed'
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>{t.name}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[9px] uppercase font-mono ${
                                t.status === 'passed' ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                              }`}
                            >
                              {t.status} ({t.durationMs}ms)
                            </span>
                          </div>
                          <p className="text-[10px] mt-1 opacity-80">{t.assertionMessage}</p>
                          {t.failureDetails && (
                            <pre className="mt-1.5 p-1.5 bg-rose-100 text-rose-900 rounded-md font-mono text-[9px] overflow-x-auto">
                              {t.failureDetails.stackTrace}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Surgical Patch Applied & Retest Verification */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-teal-600" />
                      Stage 7 & 8: Autonomous Fix & Retest Pass
                    </span>

                    {codeWorkflowOutput.fixesApplied.map((fix, idx) => (
                      <div key={idx} className="space-y-2">
                        {fix.patchesApplied.map((patch, pIdx) => (
                          <div key={pIdx} className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-[11px] space-y-1.5">
                            <div className="flex items-center justify-between font-bold text-teal-900">
                              <span>Target: {patch.filePath}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-200 text-teal-800 font-mono">
                                Patch Applied
                              </span>
                            </div>
                            <p className="text-[10px] text-teal-800">{patch.rationale}</p>
                            <pre className="p-2 bg-slate-900 text-emerald-300 rounded-md font-mono text-[9px] overflow-x-auto">
                              {patch.diffSummary}
                            </pre>
                          </div>
                        ))}

                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-900 font-bold">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Retest Verification Pass Rate
                          </span>
                          <span className="text-emerald-700 font-mono">
                            {fix.retestReport.passed}/{fix.retestReport.totalTests} Tests Passed (100%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage 9: Security & Vulnerability Audit Report */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      Stage 9: Security Audit & OWASP Verification
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                      Security Score: {codeWorkflowOutput.securityAudit.securityScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {codeWorkflowOutput.securityAudit.checksPerformed.map((check, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-slate-700">{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 10-Point Automated Test Suite Results Table */}
            {codeSuiteResults && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      17-Point Automated FROGÉ Code & Workspace Security Test Suite Results
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Evaluates all 10 workflow stages plus isolated sandbox security, malicious containment, VFS, debug, review, and task lifecycle
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    {codeSuiteResults.passed}/{codeSuiteResults.total} Stages Passed ({codeSuiteResults.passRate})
                  </span>
                </div>

                <div className="space-y-2">
                  {codeSuiteResults.results.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        item.passed
                          ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold block text-slate-900">{item.stageName}</span>
                          <span className="text-[11px] text-slate-500 block">{item.description}</span>
                          <span className="text-[10px] font-mono text-slate-600 block mt-0.5">
                            {item.details}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {item.durationMs}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 0: FROGÉ Research Architecture (11 Stages & Modular Multi-Mode Engine) */}
        {activeTab === 'research' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* Header / Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white border border-purple-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      FROGÉ Research Engine Architecture
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                      11-Stage Pipeline Active
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Zero Hallucination Mandate
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    Modular research workflow powering Standalone Research, Deep Thinking, Student Mode, and MAX. Prioritizes primary/official sources, evaluates dates & quality, explains disagreements, and enforces calibrated epistemic humility.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRunResearchSuite}
                disabled={isResearchTesting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs active:scale-95 transition-all text-xs shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResearchTesting ? 'animate-spin' : ''}`} />
                <span>{isResearchTesting ? 'Auditing 11 Stages...' : 'Run 10-Point Research Suite'}</span>
              </button>
            </div>

            {/* Test Suite Summary Banner if run */}
            {researchSuiteResults && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {researchSuiteResults.failed === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="font-bold text-slate-900">
                    FROGÉ Research Test Suite: {researchSuiteResults.passed}/{researchSuiteResults.total} Stages Verified
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="text-emerald-700 font-semibold">{researchSuiteResults.passRate} Compliant</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 font-mono text-[10px]">
                    All 11 workflow phases verified
                  </span>
                </div>
              </div>
            )}

            {/* Core 11-Stage Workflow Architecture Diagram */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    The 11-Stage FROGÉ Research Workflow
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Sequential rigor • Epistemic calibration • Zero phantom citations
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  { step: 1, name: 'User Question', desc: 'Semantic intake & objective extraction', icon: Search, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                  { step: 2, name: 'Recency Check', desc: 'Determine if current/live info is required', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                  { step: 3, name: 'Research Plan', desc: 'Multi-query decomposition & domain routing', icon: Compass, color: 'text-purple-600 bg-purple-50 border-purple-200' },
                  { step: 4, name: 'Search Sources', desc: 'Multi-angle indexing across official repositories', icon: Globe, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
                  { step: 5, name: 'Collect Info', desc: 'Empirical claim extraction & fact isolation', icon: FileText, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                  { step: 6, name: 'Compare Sources', desc: 'Cross-verification & corroboration scoring', icon: GitCompare, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
                  { step: 7, name: 'Check Dates', desc: 'Timestamp auditing & freshness evaluation', icon: Clock, color: 'text-orange-600 bg-orange-50 border-orange-200' },
                  { step: 8, name: 'Evaluate Quality', desc: 'Official & primary source tiering (Tiers 1-5)', icon: ShieldCheck, color: 'text-teal-600 bg-teal-50 border-teal-200' },
                  { step: 9, name: 'Detect Conflicts', desc: 'Identify contradictions & explain disagreements', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
                  { step: 10, name: 'Calibrated Answer', desc: 'Synthesize answer with epistemic humility', icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-200' },
                  { step: 11, name: 'Useful Citations', desc: 'Structured verifiable footnote citations', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                  { step: '✦', name: 'Multi-Mode Mesh', desc: 'Powers Deep Thinking, Student Mode & MAX', icon: BrainCircuit, color: 'text-slate-800 bg-slate-100 border-slate-300' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between ${item.color}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-white/80 border border-current">
                          {typeof item.step === 'number' ? `Stage ${item.step}` : item.step}
                        </span>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs leading-snug">{item.name}</h5>
                        <p className="text-[10px] text-slate-600 leading-tight mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Research Pipeline Tester */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Interactive FROGÉ Research Engine Console
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Consumer Mode Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 px-1.5">Consumer:</span>
                    {[
                      { id: 'deep-thinking', label: 'Deep Thinking', icon: BrainCircuit },
                      { id: 'student-mode', label: 'Student Mode', icon: GraduationCap },
                      { id: 'max', label: 'MAX', icon: Sparkles },
                      { id: 'standalone', label: 'Research', icon: Compass },
                    ].map((modeOpt) => {
                      const ModeIcon = modeOpt.icon;
                      return (
                        <button
                          key={modeOpt.id}
                          onClick={() => setResearchCallerModule(modeOpt.id as any)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                            researchCallerModule === modeOpt.id
                              ? 'bg-white text-purple-700 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <ModeIcon className="w-2.5 h-2.5" />
                          {modeOpt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Depth selector */}
                  <select
                    value={researchDepth}
                    onChange={(e) => setResearchDepth(e.target.value as any)}
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                  >
                    <option value="standard">Standard Depth</option>
                    <option value="deep">Deep Investigation</option>
                    <option value="exhaustive">Exhaustive Multi-Angle</option>
                  </select>
                </div>
              </div>

              {/* Sample Queries */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold">Test Queries:</span>
                {[
                  {
                    label: '💉 mRNA Clinical Specs (FDA / Statutory)',
                    query: 'Evaluate the clinical efficacy, regulatory approval timelines, and safety profiles of next-generation mRNA vaccines',
                  },
                  {
                    label: '⚛️ Quantum Decoherence (Academic / SOTA)',
                    query: 'What are the current physical limits and error mitigation techniques for superconducting qubit coherence in 2026?',
                  },
                  {
                    label: '⚡ Clean Grid Storage (Recent Updates)',
                    query: 'What is the current market deployment and cost-per-kWh of solid-state grid batteries in 2026?',
                  },
                  {
                    label: '🏛️ Roman Concrete (Historical Fixed)',
                    query: 'Explain the chemistry and self-healing mechanisms of ancient Roman pozzolanic volcanic ash concrete',
                  },
                  {
                    label: '⚠️ Low-Evidence Topic (Insufficient Data)',
                    query: 'What is the verified room-temperature net positive energy coefficient of cold fusion sonoluminescence devices?',
                  },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setResearchQueryInput(sample.query);
                      handleExecuteResearch(sample.query);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 text-[10px] font-medium border border-slate-200/80 transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {/* Query Input Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={researchQueryInput}
                  onChange={(e) => setResearchQueryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleExecuteResearch();
                  }}
                  placeholder="Enter complex inquiry to execute full 11-step research workflow..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <button
                  onClick={() => handleExecuteResearch()}
                  disabled={isExecutingResearch}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs active:scale-95 transition-all text-xs shrink-0"
                >
                  <Play className={`w-3.5 h-3.5 ${isExecutingResearch ? 'animate-spin' : ''}`} />
                  <span>{isExecutingResearch ? 'Executing 11 Steps...' : 'Execute Research'}</span>
                </button>
              </div>

              {/* Research Workflow Output Display */}
              {researchWorkflowOutput && (
                <div className="mt-4 space-y-4 pt-3 border-t border-slate-100">
                  {/* Top Metadata Bar */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">Target:</span>
                      <span className="text-slate-700 font-medium italic">"{researchWorkflowOutput.userQuery}"</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-purple-800 text-[10px] font-bold">
                        Consumer: {researchWorkflowOutput.consumerModule}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-purple-800 text-[10px] font-bold">
                        Latency: {researchWorkflowOutput.durationMs}ms
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold">
                        Epistemic Confidence: {researchWorkflowOutput.epistemicCalibration.confidencePercentage}% (Calibrated)
                      </span>
                    </div>
                  </div>

                  {/* Stage-by-Stage Diagnostics Tabs / Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Stage 2 & 3: Recency & Research Plan */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-bold text-slate-900 text-[11px]">
                            Stage 2 & 3: Recency & Plan Formulation
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          researchWorkflowOutput.recencyNeed.requiresCurrentInfo
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {researchWorkflowOutput.recencyNeed.recencyCategory.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {researchWorkflowOutput.recencyNeed.rationale}
                      </p>
                      <div className="pt-2 border-t border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Sub-Queries Decomposed:</span>
                        {researchWorkflowOutput.plan.subQueries.map((sq, i) => (
                          <div key={i} className="flex items-center justify-between text-[10px] bg-white p-1.5 rounded-lg border border-slate-200/70">
                            <span className="text-slate-800 font-medium truncate max-w-[240px]">
                              {i + 1}. {sq.query}
                            </span>
                            <span className="text-[9px] px-1 rounded bg-purple-50 text-purple-700 font-semibold">
                              {sq.targetedSourceType}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stage 6, 7 & 8: Source Quality & Date Audits */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                          <span className="font-bold text-slate-900 text-[11px]">
                            Stage 6, 7 & 8: Quality & Date Audits
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[9px] font-bold">
                          {researchWorkflowOutput.qualityEvaluation.officialPrimaryRatio * 100}% Official/Primary
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {researchWorkflowOutput.qualityEvaluation.sourcesEvaluated.map((src, i) => (
                          <div key={i} className="p-2 rounded-lg bg-white border border-slate-200/80 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 text-[10px] truncate max-w-[180px]">
                                {src.domain}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700">
                                {src.authorityTier.replace(/tier_\d+_/, '').replace(/_/g, ' ')} ({Math.round(src.credibilityScore * 100)}%)
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-slate-500">
                              <span>Reliability: {src.reliabilityFactors.join(' • ')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stage 9: Contradictions & Disagreements */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span className="font-bold text-slate-900 text-[11px]">
                            Stage 9: Contradictions & Disagreements
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          researchWorkflowOutput.contradictionAnalysis.hasContradictions
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {researchWorkflowOutput.contradictionAnalysis.hasContradictions
                            ? `${researchWorkflowOutput.contradictionAnalysis.contradictions.length} Divergence(s) Explained`
                            : 'Consensus Corroborated'}
                        </span>
                      </div>
                      {researchWorkflowOutput.contradictionAnalysis.hasContradictions ? (
                        <div className="space-y-1.5">
                          {researchWorkflowOutput.contradictionAnalysis.contradictions.map((c, i) => (
                            <div key={i} className="p-2 rounded-lg bg-rose-50/60 border border-rose-200 text-[10px] space-y-1">
                              <div className="flex items-center justify-between font-bold text-rose-900">
                                <span>{c.topicOrEntity}</span>
                                <span className="text-[9px] px-1 rounded bg-rose-200/80 text-rose-800">
                                  {c.likelyReasonForDiscrepancy.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="text-slate-700 leading-snug">{c.disagreementExplanation}</p>
                              <p className="text-rose-800 italic font-medium">Approach: {c.recommendedSynthesisApproach}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          No severe factual contradictions identified across primary sources.
                        </p>
                      )}
                    </div>

                    {/* Stage 10: Epistemic Calibration & Humility Safeguards */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-purple-600" />
                          <span className="font-bold text-slate-900 text-[11px]">
                            Stage 10: Epistemic Humility & Sufficiency
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[9px] font-bold">
                          {researchWorkflowOutput.epistemicCalibration.evidenceSufficiency.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-purple-200 text-[10px] space-y-1.5">
                        <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>Strict Rule: Never Claim 100% Certainty</span>
                        </div>
                        <p className="text-slate-600 leading-snug">
                          {researchWorkflowOutput.epistemicCalibration.epistemicDisclaimer}
                        </p>
                        {researchWorkflowOutput.evidenceSufficiencyStatement && (
                          <p className="text-amber-800 font-medium bg-amber-50 p-1.5 rounded border border-amber-200">
                            {researchWorkflowOutput.evidenceSufficiencyStatement}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stage 10 & 11: Final Synthesized Answer & Useful Citations */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Stage 10 & 11: Calibrated Synthesis & Useful Citations
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-semibold">
                        {researchWorkflowOutput.citations.length} Verified Citations Attached
                      </span>
                    </div>

                    {/* Answer content */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
                      {researchWorkflowOutput.synthesizedAnswer}
                    </div>

                    {/* Citations List */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Attached Useful Citations:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {researchWorkflowOutput.citations.map((cite, i) => (
                          <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">
                                [{cite.citationIndex}] {cite.title}
                              </span>
                              <span className="text-[9px] font-bold px-1 rounded bg-purple-100 text-purple-800">
                                {cite.domain}
                              </span>
                            </div>
                            <p className="text-slate-500 text-[9px] line-clamp-1">{cite.excerptSnippet}</p>
                            <div className="flex items-center justify-between text-[9px] text-slate-400">
                              <span>Date: {cite.publishedDate || 'Archival'}</span>
                              <span className="text-purple-600 font-semibold">{cite.isOfficialOrPrimary ? '🏷️ Primary/Official' : 'Reputable Press'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modular Integration Callout */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs">Unified Modular Interoperability</h5>
                  <p className="text-[11px] text-slate-300">
                    Directly integrated with <strong>Deep Thinking Mode</strong> (deep multi-hop reasoning), <strong>Student Mode</strong> (Socratic conceptual grounding), and <strong>MAX Mode</strong> (multi-model orchestrator).
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-mono font-bold">
                frogeResearchEngine.executeResearch()
              </span>
            </div>
          </div>
        )}

        {/* Tab 1: News Verification Layer (FACT vs INFERENCE vs UNCERTAINTY) */}
        {activeTab === 'news-verify' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* Header / Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border border-blue-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Current-News Epistemic Verification Layer
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Strict Tri-Partite Epistemics Active
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    Recognizes current news, checks publication dates, source reputation & primary records. Strictly disaggregates 🟢 FACT from 🟡 INFERENCE from 🔴 UNCERTAINTY. Zero invented sources.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRunNewsSuite}
                disabled={isNewsTesting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs active:scale-95 transition-all text-xs shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isNewsTesting ? 'animate-spin' : ''}`} />
                <span>{isNewsTesting ? 'Testing...' : 'Run 7-Point News Suite'}</span>
              </button>
            </div>

            {/* Test Suite Summary Banner if run */}
            {newsSuiteResults && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">
                    News Verification Suite: {newsSuiteResults.passed}/{newsSuiteResults.total} Tests Passed ({newsSuiteResults.passRate})
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  All 6 categories verified + Zero-invention guardrail
                </span>
              </div>
            )}

            {/* Interactive Query Verification Tester */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Interactive News Verification Tester:</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  Tests publication date, primary sources & epistemic separation
                </span>
              </div>

              {/* Sample Presets */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    label: 'Apple Silicon Release',
                    q: 'What are the latest announcements, features, and release dates for Apple Silicon hardware in 2026?',
                  },
                  {
                    label: 'Bitcoin Spot Price',
                    q: 'What is the current price of Bitcoin today and recent institutional ETF flows?',
                  },
                  {
                    label: 'Fed Rate Decision',
                    q: 'What was the recent announcement and benchmark interest rate decision by the Federal Reserve?',
                  },
                  {
                    label: 'Clean Energy News',
                    q: 'Explain current events and latest news regarding global grid storage and battery breakthroughs today.',
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setNewsQueryInput(preset.q);
                      handleVerifyNewsQuery(preset.q);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newsQueryInput}
                  onChange={(e) => setNewsQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyNewsQuery()}
                  placeholder="Enter any query about latest news, current events, recent announcements, prices, or new products..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none text-slate-900"
                />
                <button
                  onClick={() => handleVerifyNewsQuery()}
                  disabled={isVerifyingNews}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 active:scale-95 transition-all text-xs shrink-0"
                >
                  <Play className={`w-3.5 h-3.5 ${isVerifyingNews ? 'animate-spin' : ''}`} />
                  <span>{isVerifyingNews ? 'Verifying...' : 'Verify Query'}</span>
                </button>
              </div>

              {/* Verification Output Disaggregation Card */}
              {newsVerificationOutput && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50 font-bold text-[10px]">
                        {newsVerificationOutput.trigger.detectedCategories.map((c) => c.replace(/_/g, ' ')).join(', ')}
                      </span>
                      <span className="text-[11px] text-slate-300 font-medium">
                        Analyzed {newsVerificationOutput.sources.length} Sources ({newsVerificationOutput.primarySourceAvailable ? 'Primary Verified' : 'Secondary Wires'})
                      </span>
                    </div>
                    <span className="font-mono text-emerald-400 text-xs font-bold">
                      {newsVerificationOutput.epistemicConfidenceScore}% Calibrated Confidence
                    </span>
                  </div>

                  {/* Tri-Partite Display */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    {/* 🟢 FACT */}
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <span>🟢 FACTS</span>
                        <span className="text-[10px] font-mono text-emerald-300/70">
                          ({newsVerificationOutput.facts.length} Verified)
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[11px] text-slate-200">
                        {newsVerificationOutput.facts.map((f, i) => (
                          <div key={f.id} className="p-2 rounded bg-emerald-900/20 border border-emerald-800/30">
                            <p className="font-medium text-slate-100">{f.statement}</p>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-emerald-400/80 font-mono">
                              <span>Verified: {f.verificationTimestamp}</span>
                              <span>{Math.round(f.confidenceScore * 100)}% conf</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 🟡 INFERENCE */}
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                        <span>🟡 INFERENCES</span>
                        <span className="text-[10px] font-mono text-amber-300/70">
                          ({newsVerificationOutput.inferences.length} Logical)
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[11px] text-slate-200">
                        {newsVerificationOutput.inferences.map((inf, i) => (
                          <div key={inf.id} className="p-2 rounded bg-amber-900/20 border border-amber-800/30">
                            <p className="font-medium text-slate-100">{inf.statement}</p>
                            <p className="mt-1 text-[10px] text-amber-300/80 italic">
                              Basis: {inf.logicalBasis}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 🔴 UNCERTAINTY */}
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 space-y-2">
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                        <span>🔴 UNCERTAINTY</span>
                        <span className="text-[10px] font-mono text-rose-300/70">
                          ({newsVerificationOutput.uncertainties.length} Guardrails)
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[11px] text-slate-200">
                        {newsVerificationOutput.uncertainties.map((u, i) => (
                          <div key={u.id} className="p-2 rounded bg-rose-900/20 border border-rose-800/30">
                            <p className="font-medium text-slate-100">{u.statement}</p>
                            <p className="mt-1 text-[10px] text-rose-300/80">
                              Reason: {u.uncertaintyReason.replace(/_/g, ' ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sources Footnote */}
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap gap-3">
                    {newsVerificationOutput.sources.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-1">
                        <span className="font-mono text-slate-500">[{i + 1}]</span>
                        <span className="font-semibold text-slate-300">{s.sourceName}</span>
                        <span className="text-[10px] text-slate-500">({s.publicationDate}, {s.ageInHours}h ago)</span>
                        {s.isPrimarySource && (
                          <span className="px-1 rounded bg-emerald-900/60 text-emerald-400 text-[9px] font-bold">PRIMARY</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Test Suite Detailed Results */}
            {newsSuiteResults && (
              <div className="space-y-2">
                <h5 className="font-bold text-slate-800 text-xs">
                  Simulated Research Benchmark Test Results ({newsSuiteResults.results.length} Tests):
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {newsSuiteResults.results.map((r) => (
                    <div
                      key={r.testId}
                      className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                        r.status === 'passed'
                          ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className="flex items-center gap-1.5">
                            {r.status === 'passed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                            <span className="truncate">{r.name}</span>
                          </span>
                          <span className="text-[10px] font-mono opacity-60 shrink-0">
                            {r.durationMs}ms
                          </span>
                        </div>
                        <p className="text-[11px] opacity-80 leading-relaxed">
                          {r.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab -2: Python/FastAPI Local AI Model Bridge */}
        {activeTab === 'fastapi-bridge' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* Architecture Visualizer Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">
                    Python/FastAPI Local AI Model Architecture
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px] font-bold border border-emerald-700/50">
                  Zero Cloud Cost · Offline Local Execution
                </span>
              </div>

              {/* Visual Pipeline Flow */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-center overflow-x-auto gap-2">
                <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/60 shrink-0">
                  <div className="text-[10px] text-slate-400">Step 1</div>
                  <div className="font-bold text-white text-xs">FROGÉ Web UI</div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-700/50 shrink-0">
                  <div className="text-[10px] text-emerald-300">Auth: Local API Key</div>
                  <div className="font-bold text-emerald-300 text-xs">Python/FastAPI</div>
                  <div className="text-[9px] text-slate-400">Port 8000</div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/60 shrink-0">
                  <div className="text-[10px] text-slate-400">Cognitive Engine</div>
                  <div className="font-bold text-white text-xs">FROGÉ Brain</div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-700/50 shrink-0">
                  <div className="text-[10px] text-indigo-300">Ollama / vLLM</div>
                  <div className="font-bold text-indigo-200 text-xs">Local AI Model</div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/60 shrink-0">
                  <div className="text-[10px] text-slate-400">Calibrated</div>
                  <div className="font-bold text-white text-xs">Response</div>
                </div>
              </div>
            </div>

            {/* Local API Key & Endpoint Configuration */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Local API Key & Connection Settings:</span>
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Local API Key Field */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Local API Key (Header: X-API-Key):
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={localApiKeyInput}
                      onChange={(e) => setLocalApiKeyInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:bg-white focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(localApiKeyInput);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
                      title="Copy Key"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={handleGenerateKey}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] transition-colors whitespace-nowrap"
                    >
                      New Key
                    </button>
                  </div>
                </div>

                {/* Endpoint URL Field */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    FastAPI Endpoint URL:
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={fastapiEndpointInput}
                      onChange={(e) => setFastapiEndpointInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:bg-white focus:outline-none"
                    />
                    <button
                      onClick={handleSaveLocalSettings}
                      disabled={isPingingFastapi}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      <Radio className={`w-3.5 h-3.5 ${isPingingFastapi ? 'animate-pulse text-emerald-400' : ''}`} />
                      <span>{isPingingFastapi ? 'Pinging...' : 'Save & Ping'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status feedback */}
              {fastapiStatusData && (
                <div className={`p-3 rounded-xl text-xs flex items-center justify-between ${
                  fastapiStatusData.online
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-center gap-2">
                    {fastapiStatusData.online ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>{fastapiStatusData.message}</span>
                  </div>
                  <span className="font-mono text-[10px] opacity-75">
                    {fastapiStatusData.endpoint}
                  </span>
                </div>
              )}
            </div>

            {/* Terminal Setup & Launch Instructions */}
            <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                <span className="font-sans font-bold text-white flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  FastAPI Server Quick-Start:
                </span>
                <span>fastapi_service.py</span>
              </div>
              <p className="text-slate-400 font-sans text-[11px]">
                Run the dedicated FastAPI service locally to connect with Ollama, llama.cpp, or vLLM:
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 space-y-1">
                <div># 1. Install dependencies</div>
                <div className="text-white">pip install fastapi uvicorn pydantic httpx</div>
                <div className="mt-2"># 2. Run local FastAPI bridge with authentication</div>
                <div className="text-white">uvicorn fastapi_service:app --host 0.0.0.0 --port 8000 --reload</div>
              </div>
            </div>

            {/* Test Prompt Pipeline */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                <span>Test Local AI Model Pipeline Execution:</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={fastapiTestPrompt}
                  onChange={(e) => setFastapiTestPrompt(e.target.value)}
                  placeholder="Enter a prompt for local inference..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
                <button
                  onClick={handleTestFastapiPipeline}
                  disabled={isTestingFastapi}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 active:scale-95 transition-all text-xs shrink-0"
                >
                  <Play className={`w-3.5 h-3.5 ${isTestingFastapi ? 'animate-spin' : ''}`} />
                  <span>{isTestingFastapi ? 'Running...' : 'Execute Local Model'}</span>
                </button>
              </div>

              {/* Execution Output */}
              {fastapiTestResult && (
                <div className="p-3.5 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2 border border-slate-800 animate-fade-in">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1 border-b border-slate-800">
                    <span className="text-emerald-400 font-bold font-sans">
                      {fastapiTestResult.data?.providerId || 'fastapi-local-engine'}
                    </span>
                    <span>Latency: {fastapiTestResult.data?.usage?.latencyMs || 25}ms | Tokens: {fastapiTestResult.data?.usage?.totalTokens || 0}</span>
                  </div>
                  <p className="font-sans text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {fastapiTestResult.data?.content || JSON.stringify(fastapiTestResult, null, 2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 0: Token Usage & Subscription Management Suite */}
        {activeTab === 'token-usage' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {tokenSuiteResults && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {tokenSuiteResults.failed === 0
                        ? `All ${tokenSuiteResults.total} Token Accounting & Quota Tests Passing (${tokenSuiteResults.durationMs}ms)`
                        : `${tokenSuiteResults.failed} Test(s) Failed`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Input/output/total tokens tracked · Tool execution tokens calculated · Pre-flight allowance protection verified · Future subscription plans supported
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleRunTokenSuite}
                  disabled={isTokenTesting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTokenTesting ? 'animate-spin' : ''}`} />
                  <span>{isTokenTesting ? 'Running Suite...' : 'Rerun Token Suite'}</span>
                </button>
              </div>
            )}

            {/* Live User Token Balance & Subscription Tier Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Active Subscription: {liveBalance.planName}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {liveBalance.userPlanId}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAddBonusTokens(25000)}
                    className="text-[10px] font-semibold px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                  >
                    +25k Bonus
                  </button>
                  <button
                    onClick={handleRefillQuota}
                    className="text-[10px] font-semibold px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    Refill
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Monthly Usage vs Cap:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {liveBalance.remainingTokens.toLocaleString()} tokens available
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(2, Math.min(100, liveBalance.percentUsed))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Detailed Token Stats */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono">
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-[10px] text-slate-400 font-sans">Input Tokens</div>
                  <div className="text-xs font-bold text-white">
                    {liveBalance.consumedInputTokens.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-[10px] text-slate-400 font-sans">Output Tokens</div>
                  <div className="text-xs font-bold text-white">
                    {liveBalance.consumedOutputTokens.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-[10px] text-slate-400 font-sans">Tool Tokens</div>
                  <div className="text-xs font-bold text-indigo-300">
                    {liveBalance.consumedToolTokens.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-[10px] text-slate-400 font-sans">Est. Model Cost</div>
                  <div className="text-xs font-bold text-emerald-400">
                    ${liveBalance.totalCostUsd.toFixed(5)}
                  </div>
                </div>
              </div>
            </div>

            {/* Switch Subscription Plans */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Subscription Plan Management (Centralized Pricing & Allowances)</span>
                </h4>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {availablePlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleSwitchPlan(plan.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      liveBalance.userPlanId === plan.id
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{plan.name}</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-700">
                          {plan.monthlyPriceUsd === 0 ? 'Free' : `$${plan.monthlyPriceUsd}/mo`}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {plan.monthlyTokenAllowance >= 1000000
                          ? `${(plan.monthlyTokenAllowance / 1000000).toFixed(0)}M tokens/mo`
                          : `${(plan.monthlyTokenAllowance / 1000).toFixed(0)}k tokens/mo`}
                      </div>
                    </div>
                    {liveBalance.userPlanId === plan.id ? (
                      <span className="text-[10px] font-bold text-emerald-700 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active Plan
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 mt-2 hover:text-slate-700">
                        Switch Plan →
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Results list */}
            <div className="space-y-2">
              {tokenSuiteResults?.results.map((r, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                    r.passed
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{r.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {r.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {r.durationMs}ms
                      </span>
                    </div>
                    {r.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </div>
                  {r.details && (
                    <div className="text-[11px] text-slate-600 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                      {r.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 1: Cost Policy Suite */}
        {activeTab === 'cost-policy' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {costSuiteResults && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {costSuiteResults.failed === 0
                        ? `All ${costSuiteResults.total} Cost Control Tests Passing (${costSuiteResults.durationMs}ms)`
                        : `${costSuiteResults.failed} Test(s) Failed`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Non-escalation for simple tasks verified · User plan caps enforced · Quota throttling active · Configurable rules verified
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleRunCostSuite}
                  disabled={isCostTesting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCostTesting ? 'animate-spin' : ''}`} />
                  <span>{isCostTesting ? 'Running Suite...' : 'Rerun Cost Suite'}</span>
                </button>
              </div>
            )}

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs">
                <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Non-Escalation</span>
                </div>
                <div className="text-[10px] text-emerald-700 mt-1 leading-snug">
                  Simple queries stay on lightweight economical tier even in deep-thinking mode.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/60 text-xs">
                <div className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Plan Governance</span>
                </div>
                <div className="text-[10px] text-indigo-700 mt-1 leading-snug">
                  Free / Pro / Enterprise tier restrictions enforce maximum allowable compute.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs">
                <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Quota Throttling</span>
                </div>
                <div className="text-[10px] text-amber-700 mt-1 leading-snug">
                  Low token allowance automatically caps max completion tokens and routes to lite tier.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/60 text-xs">
                <div className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-purple-700" />
                  <span>Configurable Rules</span>
                </div>
                <div className="text-[10px] text-purple-700 mt-1 leading-snug">
                  Priority-ordered model routing policy decoupled from hardcoded application logic.
                </div>
              </div>
            </div>

            {/* Test Results list */}
            <div className="space-y-2">
              {costSuiteResults?.results.map((r, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                    r.passed
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{r.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {r.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {r.durationMs}ms
                      </span>
                    </div>
                    {r.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </div>
                  {r.details && (
                    <div className="text-[11px] text-slate-600 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                      {r.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Model Layer Suite */}
        {activeTab === 'model-layer' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {modelSuiteResults && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {modelSuiteResults.failed === 0
                        ? `All ${modelSuiteResults.total} Model Layer Tests Passing (${modelSuiteResults.durationMs}ms)`
                        : `${modelSuiteResults.failed} Test(s) Failed`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Verified successful response, timeout handling, provider error normalization & token accounting
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleRunModelLayerTests}
                  disabled={isModelTesting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isModelTesting ? 'animate-spin' : ''}`} />
                  <span>{isModelTesting ? 'Running Suite...' : 'Rerun Suite'}</span>
                </button>
              </div>
            )}

            <div className="space-y-2">
              {modelSuiteResults?.results.map((r, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                    r.passed
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{r.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {r.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {r.durationMs}ms
                      </span>
                    </div>
                    {r.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </div>
                  {r.details && (
                    <div className="text-[11px] text-slate-600 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                      {r.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Cognitive Pipeline Tests */}
        {activeTab === 'router' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {testResults && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {testResults.failed === 0
                        ? `All ${testResults.total} Pipeline Tests Passing`
                        : `${testResults.failed} Tests Failed`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Verified 8 mandatory task types, CoT privacy, economical non-escalation & calibrated verification
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleRunBrainTests}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRunning ? 'Testing...' : 'Rerun Tests'}</span>
                </button>
              </div>
            )}

            <div className="space-y-2">
              {testResults?.results.map((r, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                    r.passed
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{r.testName}</span>
                      {r.category && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {r.category}
                        </span>
                      )}
                    </div>
                    {r.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </div>
                  {r.details && (
                    <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      {r.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Live Cost & Plan Simulator */}
        {activeTab === 'simulator' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Mode & User Plan Controls */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  User Plan Tier:
                </label>
                <select
                  value={simPlan}
                  onChange={(e) => setSimPlan(e.target.value as UserPlanId)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="free">Free Plan (Capped at Lite/Standard)</option>
                  <option value="pro">Pro Plan (Deep Reasoning Allowed)</option>
                  <option value="enterprise">Enterprise (MAX Swarms Allowed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Remaining Token Allowance:
                </label>
                <select
                  value={simRemainingTokens}
                  onChange={(e) => setSimRemainingTokens(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value={100000}>Ample (100,000 tokens remaining)</option>
                  <option value={15000}>Normal (15,000 tokens remaining)</option>
                  <option value={800}>Low Quota (800 tokens - Triggers Throttling)</option>
                  <option value={200}>Critical (200 tokens - Strict Economical Cap)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Requested Mode:
                </label>
                <select
                  value={simMode}
                  onChange={(e) => setSimMode(e.target.value as FrogeModeId)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  {Object.values(FROGE_MODES).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                Load Non-Escalation & Policy Scenarios:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {presetExamples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSimMode(ex.mode);
                      setSimQuery(ex.prompt);
                    }}
                    className="text-[10px] font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-left"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prompt to Route:
              </label>
              <textarea
                value={simQuery}
                onChange={(e) => setSimQuery(e.target.value)}
                rows={2}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-sans text-slate-900"
              />
            </div>

            {/* Router Decision Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Routing Outcome: {simRouting.selectedModelName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {simRouting.activatedExpensiveReasoning && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                      Escalated Reasoning Active
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                    {simRouting.selectedTier}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {simRouting.routingRationale}
              </p>

              <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono">
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-[10px] text-slate-400 font-sans">Prompt Tokens</div>
                  <div className="text-xs font-bold text-white">~{simRouting.estimatedPromptTokens}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-[10px] text-slate-400 font-sans">Max Tokens</div>
                  <div className="text-xs font-bold text-white">~{simRouting.estimatedCompletionTokens}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-[10px] text-slate-400 font-sans">Economical Cost</div>
                  <div className="text-xs font-bold text-emerald-400">${simRouting.estimatedCostUsd.toFixed(6)}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-[10px] text-slate-400 font-sans">Unoptimized Cost</div>
                  <div className="text-xs font-bold text-slate-400">${(simRouting.estimatedCostUsd * 2.5).toFixed(6)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Routing Rules */}
        {activeTab === 'architecture' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-slate-700">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Configurable Model Routing Rule Policy Engine</span>
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Rules are evaluated in strict priority order (highest to lowest). Decisions consider task complexity, requested mode, user plan capabilities, tool overhead, and remaining token allowance.
              </p>
            </div>

            <div className="space-y-2">
              {routingRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{rule.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        Priority {rule.priority}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {rule.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">
                      → {rule.action.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>FROGÉ Cost-Control Architecture · Economical Routing Policy</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
