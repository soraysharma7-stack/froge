import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Target,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Trash2,
  RotateCcw,
  Sliders,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  ChevronRight,
  Send,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import {
  OutcomeCategory,
  TrackedAdviceItem,
  OutcomeReport,
  PredictionEvaluation,
  CategoryCalibrationStats,
  OutcomeLearningConfig,
  OutcomeProcessingResult,
  ALL_OUTCOME_CATEGORIES,
} from '../brain/outcome';
import { frogeOutcomeManager } from '../brain/outcome/outcomeManager';
import { runOutcomeTestSuite, OutcomeTestSuiteSummary } from '../brain/outcome/outcomeTestSuite';

export const OutcomeLearningTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'simulator' | 'tasks' | 'calibration' | 'controls' | 'test-suite'>('overview');
  const [userId] = useState<string>('default_user');

  // Config & State
  const [config, setConfig] = useState<OutcomeLearningConfig>(() => frogeOutcomeManager.getConfig(userId));
  const [calibrationStats, setCalibrationStats] = useState<CategoryCalibrationStats[]>(() =>
    frogeOutcomeManager.calibrationEngine.getAllCategoryStats()
  );
  const [trackedTasks, setTrackedTasks] = useState<
    Array<{ advice: TrackedAdviceItem; report?: OutcomeReport; evaluation?: PredictionEvaluation }>
  >(() => frogeOutcomeManager.getAllTrackedAdvice(userId));
  const [pendingCheckins, setPendingCheckins] = useState<TrackedAdviceItem[]>(() =>
    frogeOutcomeManager.getPendingCheckins(userId)
  );

  // Test Suite State
  const [testResults, setTestResults] = useState<OutcomeTestSuiteSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Simulator State
  const [simQuery, setSimQuery] = useState('How do I prevent memory leaks with event listeners in React useEffect?');
  const [simAdvice, setSimAdvice] = useState('Always return a cleanup function in useEffect that removes the event listener using window.removeEventListener, passing the exact identical callback reference.');
  const [simCategory, setSimCategory] = useState<OutcomeCategory>('code_debugging');
  const [simConfidence, setSimConfidence] = useState<number>(0.90);
  const [simFollowUpHours, setSimFollowUpHours] = useState<number>(12);
  const [simUserFeedback, setSimUserFeedback] = useState('It worked perfectly! The heap snapshot confirmed memory stabilized.');
  const [simSatisfaction, setSimSatisfaction] = useState<number>(5);
  const [simActiveStep, setSimActiveStep] = useState<number>(1);
  const [simCreatedTrackResult, setSimCreatedTrackResult] = useState<OutcomeProcessingResult | null>(null);
  const [simEvaluationResult, setSimEvaluationResult] = useState<OutcomeProcessingResult | null>(null);

  // Active check-in modal state
  const [activeCheckinTask, setActiveCheckinTask] = useState<TrackedAdviceItem | null>(null);
  const [checkinFeedback, setCheckinFeedback] = useState('');
  const [checkinSatisfaction, setCheckinSatisfaction] = useState<number>(5);

  const refreshData = () => {
    setConfig(frogeOutcomeManager.getConfig(userId));
    setCalibrationStats(frogeOutcomeManager.calibrationEngine.getAllCategoryStats());
    setTrackedTasks(frogeOutcomeManager.getAllTrackedAdvice(userId));
    setPendingCheckins(frogeOutcomeManager.getPendingCheckins(userId));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleRunTestSuite = async () => {
    setIsRunningTests(true);
    try {
      const summary = await runOutcomeTestSuite();
      setTestResults(summary);
      refreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleSimulateTrack = () => {
    try {
      const res = frogeOutcomeManager.trackAdvice({
        userId,
        query: simQuery,
        adviceSummary: simAdvice.slice(0, 100),
        fullAdviceText: simAdvice,
        category: simCategory,
        predictedConfidence: simConfidence,
        followUpHours: simFollowUpHours,
      });
      setSimCreatedTrackResult(res);
      setSimActiveStep(3); // Step 3: Created follow up task
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Error tracking advice');
    }
  };

  const handleSimulateCheckin = () => {
    if (!simCreatedTrackResult) return;
    try {
      const res = frogeOutcomeManager.recordOutcomeCheckin({
        trackedAdviceId: simCreatedTrackResult.id,
        userFeedbackText: simUserFeedback,
        userSatisfactionScore: simSatisfaction,
      });
      setSimEvaluationResult(res);
      setSimActiveStep(5); // Completed evaluation and calibration
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Error recording check-in');
    }
  };

  const handleModalCheckinSubmit = () => {
    if (!activeCheckinTask || !checkinFeedback.trim()) return;
    try {
      frogeOutcomeManager.recordOutcomeCheckin({
        trackedAdviceId: activeCheckinTask.id,
        userFeedbackText: checkinFeedback,
        userSatisfactionScore: checkinSatisfaction,
      });
      setActiveCheckinTask(null);
      setCheckinFeedback('');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Error saving check-in');
    }
  };

  const handleToggleGlobal = () => {
    const updated = frogeOutcomeManager.updateConfig(userId, { enabled: !config.enabled });
    setConfig(updated);
  };

  const handleToggleCategory = (cat: OutcomeCategory) => {
    const currentCat = config.categoryOverrides[cat] || { enabled: true };
    const updated = frogeOutcomeManager.updateConfig(userId, {
      categoryOverrides: {
        ...config.categoryOverrides,
        [cat]: { ...currentCat, enabled: !currentCat.enabled },
      },
    });
    setConfig(updated);
  };

  const handleResetCalibration = (cat?: OutcomeCategory) => {
    frogeOutcomeManager.calibrationEngine.resetCategoryCalibration(cat);
    refreshData();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all tracked outcome history and reset calibration curves?')) {
      frogeOutcomeManager.clearAllOutcomeData(userId);
      refreshData();
    }
  };

  const handleDeleteTask = (id: string) => {
    frogeOutcomeManager.deleteTrackedAdvice(id);
    refreshData();
  };

  const handleDismissTask = (id: string) => {
    frogeOutcomeManager.dismissTask(id);
    refreshData();
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white p-5 rounded-2xl shadow-sm border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold tracking-wide uppercase mb-2 border border-emerald-400/30">
              <Target className="w-3.5 h-3.5" />
              Optional Outcome Learning & Calibration
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              FROGÉ Outcome Learning Architecture
            </h2>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Closed-loop empirical calibration: Tracks real-world advice efficacy across structured categories,
              applies Bayesian prior smoothing to prevent single-outcome overreaction, and enforces a strict
              <span className="text-emerald-300 font-semibold"> zero global model retraining</span> policy.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTestSuite}
              disabled={isRunningTests}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <Award className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
              {isRunningTests ? 'Running Suite...' : 'Run 6-Point Test Suite'}
            </button>
          </div>
        </div>

        {/* Workflow Breadcrumb Strip */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-2 text-[11px] text-slate-300 overflow-x-auto">
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Advice
          </span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="font-semibold text-teal-300">Track Outcome (Optional)</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="font-semibold text-amber-300">Follow-up Task</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="font-semibold text-sky-300">User Check-in</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="font-semibold text-indigo-300">Classify & Evaluate</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="font-semibold text-emerald-300">Category Calibration</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold overflow-x-auto border border-slate-200">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'overview' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-teal-600" />
          Architecture Overview
        </button>
        <button
          onClick={() => setActiveSubTab('simulator')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'simulator' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Workflow Simulator
        </button>
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'tasks' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Tracked Tasks & Check-ins ({pendingCheckins.length} Due / {trackedTasks.length} Total)
        </button>
        <button
          onClick={() => setActiveSubTab('calibration')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'calibration' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
          Category Calibration Matrix ({calibrationStats.length})
        </button>
        <button
          onClick={() => setActiveSubTab('controls')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'controls' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-slate-700" />
          Policies & User Controls
        </button>
        <button
          onClick={() => setActiveSubTab('test-suite')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'test-suite' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          Test Suite {testResults ? `(${testResults.passed}/${testResults.total})` : '(6 Points)'}
        </button>
      </div>

      {/* 1. ARCHITECTURE OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-teal-700 font-bold mb-1">
                <Target className="w-4 h-4" />
                1. Optional Opt-In Tracking
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Outcome tracking is strictly user-controlled. Users click &quot;Track outcome&quot; on actionable AI advice
                to schedule follow-up check-ins without intrusive automated background monitoring.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-indigo-700 font-bold mb-1">
                <TrendingUp className="w-4 h-4" />
                2. Category-Specific Calibration
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Performance is tracked across isolated domains (e.g., Code Debugging, System Architecture, Ops).
                A failure in one category never contaminates accuracy priors in others.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                3. Anti-Overreaction Guardrails
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bayesian Beta-Binomial smoothing prevents single outcomes from swinging confidence wildly.
                Zero global model weights are changed; adjustments are strictly in-context prompt priors.
              </p>
            </div>
          </div>

          {/* Detailed Workflow Diagram Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              Complete 7-Step Lifecycle Pipeline
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-teal-600 uppercase">Step 1</span>
                <p className="font-bold text-xs mt-0.5">AI Advice</p>
                <p className="text-[10px] text-slate-500 mt-1">Stated solution with initial confidence</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-teal-600 uppercase">Step 2</span>
                <p className="font-bold text-xs mt-0.5">Track Outcome</p>
                <p className="text-[10px] text-slate-500 mt-1">User clicks button to opt in</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-amber-600 uppercase">Step 3</span>
                <p className="font-bold text-xs mt-0.5">Follow-up Task</p>
                <p className="text-[10px] text-slate-500 mt-1">Scheduled check-in timestamp created</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-sky-600 uppercase">Step 4</span>
                <p className="font-bold text-xs mt-0.5">Check-in Intake</p>
                <p className="text-[10px] text-slate-500 mt-1">Asks user &quot;What happened later?&quot;</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Step 5</span>
                <p className="font-bold text-xs mt-0.5">Classify</p>
                <p className="text-[10px] text-slate-500 mt-1">Success, partial, unexpected failure, or blocked</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-violet-600 uppercase">Step 6</span>
                <p className="font-bold text-xs mt-0.5">Evaluate</p>
                <p className="text-[10px] text-slate-500 mt-1">Accuracy delta & causal factor diagnosis</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Step 7</span>
                <p className="font-bold text-xs mt-0.5">Calibrate</p>
                <p className="text-[10px] text-slate-500 mt-1">Bayesian category reliability update</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. WORKFLOW SIMULATOR TAB */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column: Input Configuration */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              1. Simulate AI Advice & Track Outcome
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">User Query</label>
              <input
                type="text"
                value={simQuery}
                onChange={(e) => setSimQuery(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">AI Advice / Recommended Solution</label>
              <textarea
                rows={3}
                value={simAdvice}
                onChange={(e) => setSimAdvice(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 leading-relaxed font-mono"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value as OutcomeCategory)}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  {ALL_OUTCOME_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-700 block mb-1">Predicted Conf.</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1.0"
                  value={simConfidence}
                  onChange={(e) => setSimConfidence(parseFloat(e.target.value) || 0.85)}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-700 block mb-1">Follow-up Delay (Hrs)</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={simFollowUpHours}
                  onChange={(e) => setSimFollowUpHours(parseInt(e.target.value) || 24)}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleSimulateTrack}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <Target className="w-3.5 h-3.5" />
              Choose &quot;Track Outcome&quot; & Create Task
            </button>

            {simCreatedTrackResult && (
              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-teal-900 font-bold">
                  <span>Task Created: {simCreatedTrackResult.id}</span>
                  <span className="px-2 py-0.5 bg-teal-200 rounded text-[10px]">pending_checkin</span>
                </div>
                <p className="text-[11px] text-teal-800">
                  Follow-up scheduled for: {new Date(simCreatedTrackResult.trackedAdvice.followUpDueAt).toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Step 2: Check-in Simulation */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                2. Later: Ask User &quot;What Happened?&quot;
              </h4>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">User Reported Outcome</label>
                <textarea
                  rows={2}
                  value={simUserFeedback}
                  onChange={(e) => setSimUserFeedback(e.target.value)}
                  placeholder="e.g., It fixed the leak immediately or It gave a syntax error..."
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-mono"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700">Satisfaction Score (1-5)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => setSimSatisfaction(score)}
                      className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                        simSatisfaction === score
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSimulateCheckin}
                disabled={!simCreatedTrackResult}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Outcome Check-in & Evaluate
              </button>
            </div>
          </div>

          {/* Right Column: Real-Time Results & Prompt Context */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 shadow-2xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                Pipeline Evaluation & Prompt Priors
              </span>
              <span className="text-[10px] text-slate-400">Zero Global Retraining</span>
            </div>

            {simEvaluationResult ? (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Classification:</span>
                    <span className="font-bold text-emerald-300">
                      {simEvaluationResult.evaluation?.classification}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Empirical Accuracy:</span>
                    <span className="text-white font-bold">
                      {Math.round((simEvaluationResult.evaluation?.accuracyScore || 0) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Calibration Delta:</span>
                    <span className={`font-bold ${
                      (simEvaluationResult.evaluation?.calibrationDelta || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {simEvaluationResult.evaluation?.calibrationDelta}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Key Insight:</span>
                    <span className="text-[11px] text-slate-200 text-right max-w-[200px]">
                      {simEvaluationResult.evaluation?.keyInsight}
                    </span>
                  </div>
                </div>

                {/* Updated Calibration Curve */}
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 space-y-1">
                  <span className="text-emerald-400 font-bold block text-[11px]">
                    Category Calibration ({simEvaluationResult.updatedCategoryCalibration?.category}):
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mt-1">
                    <div>Accuracy: {Math.round((simEvaluationResult.updatedCategoryCalibration?.empiricalAccuracy || 0) * 100)}%</div>
                    <div>Multiplier: {simEvaluationResult.updatedCategoryCalibration?.calibrationMultiplier}x</div>
                    <div>Brier Score: {simEvaluationResult.updatedCategoryCalibration?.brierScore}</div>
                    <div>Evals: {simEvaluationResult.updatedCategoryCalibration?.totalEvaluated}</div>
                  </div>
                </div>

                {/* Injected Prompt Context */}
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] block">INJECTED SYSTEM PROMPT CALIBRATION PRIORS:</span>
                  <pre className="p-2.5 rounded-lg bg-slate-950 text-emerald-300 text-[10px] leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-800">
                    {simEvaluationResult.injectedCalibrationHint ||
                      'No significant calibration drift detected yet. Model maintains balanced defaults.'}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 space-y-2">
                <Target className="w-8 h-8 mx-auto text-slate-600" />
                <p>Run the simulation on the left to inspect real-time classification, accuracy delta, and prompt context synthesis.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TRACKED TASKS & CHECK-INS TAB */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Tracked Advice Items & Follow-up History ({trackedTasks.length})
            </h3>
            <button
              onClick={refreshData}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {trackedTasks.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
              <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-slate-700">No tracked advice tasks yet.</p>
              <p className="mt-1">Click &quot;Track outcome&quot; on any assistant message or use the Simulator tab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(trackedTasks || []).map(({ advice, report, evaluation }) => (
                <div
                  key={advice.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                          {advice.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            advice.status === 'evaluated'
                              ? 'bg-emerald-100 text-emerald-800'
                              : advice.status === 'checkin_due'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : advice.status === 'dismissed'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {advice.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(advice.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">{advice.query}</h4>
                      <p className="text-xs text-slate-600 mt-1 font-mono bg-slate-50 p-2 rounded border border-slate-100">
                        {advice.adviceSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {advice.status !== 'evaluated' && advice.status !== 'dismissed' && (
                        <button
                          onClick={() => {
                            setActiveCheckinTask(advice);
                            setCheckinFeedback('');
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all"
                        >
                          Check In Now
                        </button>
                      )}
                      {advice.status === 'pending_checkin' && (
                        <button
                          onClick={() => handleDismissTask(advice.id)}
                          className="px-2 py-1 text-slate-500 hover:text-slate-700 text-[11px]"
                          title="Dismiss Task"
                        >
                          Dismiss
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTask(advice.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Outcome Evaluation Details if completed */}
                  {evaluation && (
                    <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-emerald-950 text-[11px]">
                        <span>Outcome: {evaluation.classification}</span>
                        <span>Accuracy: {Math.round(evaluation.accuracyScore * 100)}% (Delta: {evaluation.calibrationDelta})</span>
                      </div>
                      {report && (
                        <p className="text-slate-700 text-[11px] italic">
                          &quot;{report.userFeedbackText}&quot;
                        </p>
                      )}
                      <p className="text-emerald-900 text-[11px] font-medium">
                        {evaluation.keyInsight}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. CATEGORY CALIBRATION MATRIX TAB */}
      {activeSubTab === 'calibration' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Category-Level Calibration Matrix (Strictly Segmented)
            </h3>
            <button
              onClick={() => handleResetCalibration()}
              className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Reset All Calibrations
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(calibrationStats || []).map((stat) => (
              <div
                key={stat.category}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 uppercase">{stat.category}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      stat.calibrationBias === 'well_calibrated'
                        ? 'bg-emerald-100 text-emerald-800'
                        : stat.calibrationBias === 'overconfident'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {stat.calibrationBias}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Evaluated</span>
                    <span className="font-bold text-xs text-slate-800">{stat.totalEvaluated}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Empirical Acc.</span>
                    <span className="font-bold text-xs text-emerald-600">{Math.round(stat.empiricalAccuracy * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Brier Error</span>
                    <span className="font-bold text-xs text-slate-800">{stat.brierScore}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Multiplier</span>
                    <span className="font-bold text-xs text-indigo-600">{stat.calibrationMultiplier}x</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>95% CI: [{stat.confidenceInterval[0]}, {stat.confidenceInterval[1]}]</span>
                  <button
                    onClick={() => handleResetCalibration(stat.category)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. POLICIES & USER CONTROLS TAB */}
      {activeSubTab === 'controls' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-700" />
              Master Outcome Learning Policies
            </h3>

            {/* Global Master Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <p className="font-bold text-xs text-slate-900">Enable Optional Outcome Learning</p>
                <p className="text-[11px] text-slate-500">
                  When enabled, you can optionally choose &quot;Track outcome&quot; on AI advice to schedule follow-ups and refine category calibration.
                </p>
              </div>
              <button
                onClick={handleToggleGlobal}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  config.enabled
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {config.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Damping & Threshold Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Bayesian Damping Factor</span>
                  <span className="font-mono font-bold text-emerald-700">{config.bayesianDampingFactor}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={config.bayesianDampingFactor}
                  onChange={(e) => {
                    const updated = frogeOutcomeManager.updateConfig(userId, {
                      bayesianDampingFactor: parseFloat(e.target.value),
                    });
                    setConfig(updated);
                  }}
                  className="w-full"
                />
                <p className="text-[10px] text-slate-500">
                  Higher damping prevents single outcomes from swinging category accuracy or multipliers abruptly.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Min Samples for Prompt Injection</span>
                  <span className="font-mono font-bold text-indigo-700">{config.minimumSampleSizeForCalibrationAdjustment}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={config.minimumSampleSizeForCalibrationAdjustment}
                  onChange={(e) => {
                    const updated = frogeOutcomeManager.updateConfig(userId, {
                      minimumSampleSizeForCalibrationAdjustment: parseInt(e.target.value),
                    });
                    setConfig(updated);
                  }}
                  className="w-full"
                />
                <p className="text-[10px] text-slate-500">
                  Requires at least this many tracked evaluations before inserting custom calibration priors into system prompts.
                </p>
              </div>
            </div>

            {/* Per-Category Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block">Category Granular Toggles</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_OUTCOME_CATEGORIES.map((cat) => {
                  const isEnabled = config.categoryOverrides[cat]?.enabled !== false;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleToggleCategory(cat)}
                      className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                        isEnabled
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="font-medium text-[11px] truncate">{cat}</span>
                      <span className="text-[10px] font-bold">{isEnabled ? 'ON' : 'OFF'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy Wipe */}
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-rose-900">Purge All Tracked Outcome History</p>
                <p className="text-[11px] text-rose-700">
                  Deletes all tracked advice, outcome reports, evaluations, and resets calibration curves.
                </p>
              </div>
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
              >
                Purge All Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. AUTOMATED TEST SUITE TAB */}
      {activeSubTab === 'test-suite' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              6-Point Automated Outcome Learning Regression Test Suite
            </h3>
            <button
              onClick={handleRunTestSuite}
              disabled={isRunningTests}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5"
            >
              <Award className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
              {isRunningTests ? 'Executing...' : 'Re-run Suite'}
            </button>
          </div>

          {testResults ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Suite Summary</span>
                  <p className="text-xl font-bold text-emerald-400">
                    {testResults.passed} / {testResults.total} Tests Passed ({testResults.passRate})
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">{testResults.durationMs}ms</span>
              </div>

              <div className="space-y-2">
                {(testResults?.results || []).map((r) => (
                  <div
                    key={r.id}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                      r.passed ? 'bg-white border-emerald-200' : 'bg-rose-50 border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {r.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900">{r.testName}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-600">
                        {r.durationMs}ms
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] pl-6 leading-relaxed">
                      {r.assertionMessage}
                    </p>
                    {r.details && (
                      <p className="text-slate-400 text-[10px] pl-6 font-mono">
                        {r.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
              <Award className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <p className="font-semibold text-slate-700">Test suite ready to run.</p>
              <p className="mt-1">Click &quot;Run 6-Point Test Suite&quot; above to verify all workflow steps and mathematical invariants.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Active Check-In Popup */}
      {activeCheckinTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                Follow-up: What Happened Later?
              </h3>
              <button
                onClick={() => setActiveCheckinTask(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tracked Advice:</span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">{activeCheckinTask.query}</p>
              <p className="text-slate-600 font-mono text-[11px] bg-slate-50 p-2 rounded mt-1">
                {activeCheckinTask.adviceSummary}
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">How did it turn out?</label>
              <textarea
                rows={3}
                value={checkinFeedback}
                onChange={(e) => setCheckinFeedback(e.target.value)}
                placeholder="e.g., It worked great, or I encountered an error with..."
                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">Satisfaction (1-5)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCheckinSatisfaction(s)}
                    className={`w-7 h-7 rounded text-xs font-bold ${
                      checkinSatisfaction === s ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveCheckinTask(null)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleModalCheckinSubmit}
                disabled={!checkinFeedback.trim()}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-2xs"
              >
                Save Outcome & Calibrate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
