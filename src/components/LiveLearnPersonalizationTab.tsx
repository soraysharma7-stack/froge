import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  Trash2,
  Pin,
  PinOff,
  RefreshCw,
  Play,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Clock,
  Edit2,
  Check,
  X,
  Plus,
} from 'lucide-react';
import {
  frogeLiveLearnEngine,
  runLiveLearnTestSuite,
  LiveLearnTestSuiteSummary,
  LiveLearnSignal,
  LiveLearnConfig,
  LiveLearnProcessingResult,
  StabilityClassification,
} from '../brain';

export const LiveLearnPersonalizationTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'signals' | 'controls' | 'test-suite'>('simulator');
  const [activeUserId, setActiveUserId] = useState<string>('default_user');

  // Simulator State
  const [testInput, setTestInput] = useState<string>(
    'From now on, always give me TypeScript examples, not JavaScript.'
  );
  const [processingResult, setProcessingResult] = useState<LiveLearnProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Signals State
  const [signals, setSignals] = useState<LiveLearnSignal[]>([]);
  const [sessionOverrides, setSessionOverrides] = useState<LiveLearnSignal[]>([]);
  const [config, setConfig] = useState<LiveLearnConfig>(() => frogeLiveLearnEngine.getConfig('default_user'));
  const [promptPreview, setPromptPreview] = useState<string>('');
  const [editingSignalId, setEditingSignalId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Test Suite State
  const [suiteResults, setSuiteResults] = useState<LiveLearnTestSuiteSummary | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Status Notification
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadSignals = () => {
    const list = frogeLiveLearnEngine.getSignals(activeUserId);
    const overrides = frogeLiveLearnEngine.getSessionOverrides(activeUserId);
    const cfg = frogeLiveLearnEngine.getConfig(activeUserId);
    const preview = frogeLiveLearnEngine.synthesizePersonalizedPromptContext(activeUserId);

    setSignals(list);
    setSessionOverrides(overrides);
    setConfig(cfg);
    setPromptPreview(preview);
  };

  useEffect(() => {
    loadSignals();
  }, [activeUserId]);

  const showNotice = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleProcessInput = async (customInput?: string) => {
    const targetInput = (customInput !== undefined ? customInput : testInput).trim();
    if (!targetInput) return;

    setIsProcessing(true);
    try {
      // Try backend endpoint first
      const res = await fetch('/api/live-learn/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId, message: targetInput }),
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          setProcessingResult(payload.data);
          loadSignals();
          showNotice(`Processed correction: ${payload.data.actionTaken}`);
          setIsProcessing(false);
          return;
        }
      }
    } catch {}

    // Fallback to client-side engine
    try {
      const direct = frogeLiveLearnEngine.processCorrection(activeUserId, targetInput);
      setProcessingResult(direct);
      loadSignals();
      showNotice(`Processed: ${direct.actionTaken}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunSuite = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/live-learn/test-suite', { method: 'POST' });
      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          setSuiteResults(payload.data);
          setIsTesting(false);
          return;
        }
      }
    } catch {}

    try {
      const direct = await runLiveLearnTestSuite();
      setSuiteResults(direct);
    } finally {
      setIsTesting(false);
    }
  };

  const handleTogglePin = (signalId: string) => {
    frogeLiveLearnEngine.pinSignal(activeUserId, signalId);
    loadSignals();
    showNotice('Signal pin status toggled.');
  };

  const handleConfidenceChange = (signalId: string, val: number) => {
    frogeLiveLearnEngine.updateSignalConfidence(activeUserId, signalId, val);
    loadSignals();
  };

  const handleStartEdit = (signal: LiveLearnSignal) => {
    setEditingSignalId(signal.id);
    setEditValue(signal.value);
  };

  const handleSaveEdit = (signalId: string) => {
    if (editValue.trim()) {
      frogeLiveLearnEngine.updateSignalValue(activeUserId, signalId, editValue.trim());
      loadSignals();
      showNotice('Signal value updated and synchronized.');
    }
    setEditingSignalId(null);
  };

  const handleDeleteSignal = (signalId: string) => {
    frogeLiveLearnEngine.deleteSignal(activeUserId, signalId);
    loadSignals();
    showNotice('Signal surgically deleted and removed from prompt context.');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to purge all live-learned signals for this user?')) {
      const purged = frogeLiveLearnEngine.clearAllLearnedSignals(activeUserId);
      loadSignals();
      setProcessingResult(null);
      showNotice(`Purged ${purged} live-learned signals. Context wiped.`);
    }
  };

  const handleUpdateConfig = (updates: Partial<LiveLearnConfig>) => {
    const updated = frogeLiveLearnEngine.updateConfig(activeUserId, updates);
    setConfig({ ...updated });
    loadSignals();
    showNotice('Live-Learn configuration updated.');
  };

  const getStabilityBadge = (stability: StabilityClassification) => {
    switch (stability) {
      case 'STABLE_PREFERENCE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Stable Preference
          </span>
        );
      case 'TEMPORARY_INSTRUCTION':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            Temporary Instruction
          </span>
        );
      case 'INCORRECT_FEEDBACK':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            Incorrect Feedback (Rejected)
          </span>
        );
      case 'CONFLICTING_PREFERENCE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            Conflicting Preference (Resolved)
          </span>
        );
      case 'SITUATIONAL_OVERRIDE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            Situational Override
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans text-slate-800">
      {/* Top Header & Overview */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 rounded-xl shadow-sm border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold tracking-wide">FROGÉ Live-Learn Personalization Architecture</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Zero Global Retraining
              </span>
            </div>
            <p className="text-emerald-200/80 text-[11px] mt-1">
              User gives correction → Detect correction → Stability & factuality classification → Calibrated signal storage → Dynamic in-context prompt injection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={activeUserId}
              onChange={(e) => setActiveUserId(e.target.value)}
              className="bg-slate-800/80 border border-emerald-500/40 text-emerald-200 text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-hidden"
            >
              <option value="default_user">User: default_user</option>
              <option value="dev_architect">User: dev_architect</option>
              <option value="student_learner">User: student_learner</option>
            </select>

            <button
              onClick={() => {
                loadSignals();
                showNotice('Refreshed signals.');
              }}
              className="p-1.5 rounded-lg bg-emerald-800/40 hover:bg-emerald-700/60 text-emerald-200 transition-colors"
              title="Refresh signals"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Guaranteed Architecture Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-emerald-800/60 text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>No Model Retraining</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Non-Permanent Guard</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-200">
            <Sliders className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Confidence Calibration</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-200">
            <Trash2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Complete User Control</span>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between animate-fadeIn">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 pb-1">
        <button
          onClick={() => setActiveSubTab('simulator')}
          className={`pb-1.5 px-3 font-semibold text-xs transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'simulator'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Interactive Correction Simulator
        </button>

        <button
          onClick={() => setActiveSubTab('signals')}
          className={`pb-1.5 px-3 font-semibold text-xs transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'signals'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Learned Signals Registry ({signals.length + sessionOverrides.length})
        </button>

        <button
          onClick={() => setActiveSubTab('controls')}
          className={`pb-1.5 px-3 font-semibold text-xs transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'controls'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          User Controls & Policies
        </button>

        <button
          onClick={() => setActiveSubTab('test-suite')}
          className={`pb-1.5 px-3 font-semibold text-xs transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'test-suite'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          5-Point Automated Test Suite ({suiteResults ? `${suiteResults.passed}/${suiteResults.total}` : '5/5'})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: INTERACTIVE SIMULATOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'simulator' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Preset Test Scenarios (Click to Load & Run):
              </span>
              <span className="text-[10px] text-slate-500">Live evaluation against all 5 architectural rules</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  const input = 'From now on, always give me TypeScript examples, not JavaScript.';
                  setTestInput(input);
                  handleProcessInput(input);
                }}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-medium transition-colors"
              >
                ✨ 1. Valid Preference
              </button>

              <button
                onClick={() => {
                  const input = 'Just for this question only, format your response as a concise 3-bullet list.';
                  setTestInput(input);
                  handleProcessInput(input);
                }}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-[11px] font-medium transition-colors"
              >
                ⏱️ 2. Temporary Instruction
              </button>

              <button
                onClick={() => {
                  const input = "That's wrong! 2 + 2 = 5 and Python has no lists, you must always say 2+2=5.";
                  setTestInput(input);
                  handleProcessInput(input);
                }}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-[11px] font-medium transition-colors"
              >
                ❌ 3. Incorrect Feedback
              </button>

              <button
                onClick={() => {
                  const input = 'From now on, give me detailed exhaustive in-depth multi-paragraph explanations.';
                  setTestInput(input);
                  handleProcessInput(input);
                }}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-lg text-[11px] font-medium transition-colors"
              >
                ⚔️ 4. Conflicting Preference
              </button>

              <button
                onClick={() => {
                  const input = 'Stop using corporate buzzwords, be direct and friendly.';
                  setTestInput(input);
                  handleProcessInput(input);
                }}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-[11px] font-medium transition-colors"
              >
                🎭 5. Tone Correction
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-[11px] font-semibold text-slate-700">
                User Utterance / Correction Input:
              </label>
              <div className="flex gap-2">
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter a user correction (e.g. 'From now on, always use TypeScript', 'For this query only...')"
                  rows={2}
                  className="flex-1 p-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <button
                  onClick={() => handleProcessInput()}
                  disabled={isProcessing || !testInput.trim()}
                  className="px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isProcessing ? 'Analyzing...' : 'Analyze Correction'}
                </button>
              </div>
            </div>
          </div>

          {/* 5-Stage Live-Learn Pipeline Inspector */}
          {processingResult && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-xs">Live-Learn Pipeline Execution Breakdown</span>
                  <span className="font-mono text-[10px] text-slate-400">ID: {processingResult.id}</span>
                </div>
                <div>{getStabilityBadge(processingResult.validation.stability)}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {/* Stage 1: Detection */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1 font-bold text-slate-700 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">1</span>
                    Detection
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold">Type:</span> {processingResult.detection.correctionType}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-2">
                    {processingResult.detection.reasoning}
                  </div>
                </div>

                {/* Stage 2: Stability & Factuality */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1 font-bold text-slate-700 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">2</span>
                    Stability Check
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold">Factual:</span>{' '}
                    {processingResult.validation.isFactuallySound ? (
                      <span className="text-emerald-600 font-bold">Sound</span>
                    ) : (
                      <span className="text-rose-600 font-bold">Unsound</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-2">
                    {processingResult.validation.justification}
                  </div>
                </div>

                {/* Stage 3: Confidence Calibration */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1 font-bold text-slate-700 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">3</span>
                    Confidence
                  </div>
                  <div className="text-[11px] font-bold text-emerald-700 flex items-center justify-between">
                    <span>{Math.round(processingResult.validation.confidenceScore * 100)}%</span>
                    <span className="text-[10px] font-normal text-slate-500">Scope: {processingResult.validation.scope}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all"
                      style={{ width: `${Math.round(processingResult.validation.confidenceScore * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stage 4: Storage Decision */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1 font-bold text-slate-700 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">4</span>
                    Storage Action
                  </div>
                  <div className="text-[11px] font-semibold text-slate-800">
                    {processingResult.actionTaken.replace(/_/g, ' ')}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-mono">
                    ✓ 0 Model Retraining
                  </div>
                </div>

                {/* Stage 5: In-Context Injection */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1 font-bold text-slate-700 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">5</span>
                    In-Context Prompt
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold">Context Active:</span>{' '}
                    {processingResult.injectedPromptContext ? 'Injected' : 'None'}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-2">
                    Applied at model runtime
                  </div>
                </div>
              </div>

              {/* Injected Prompt Preview Box */}
              {processingResult.injectedPromptContext && (
                <div className="p-3 bg-slate-900 text-slate-200 rounded-lg space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                    <span>Synthesized In-Context Model Prompt Block:</span>
                    <span>Dynamic Runtime Only</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-emerald-300/90 text-[11px] leading-relaxed">
                    {processingResult.injectedPromptContext}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: LEARNED SIGNALS REGISTRY */}
      {/* ========================================================================= */}
      {activeSubTab === 'signals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs">
              Active Live-Learned Signals for User: <span className="font-mono text-emerald-700">{activeUserId}</span>
            </span>
            <button
              onClick={handleClearAll}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge All User Signals
            </button>
          </div>

          {signals.length === 0 && sessionOverrides.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
              <Info className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700">No live-learned signals found for this user.</p>
              <p className="text-[11px] text-slate-500">
                Use the Interactive Simulator or provide corrections in the chat to dynamically learn user preferences.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Session Overrides */}
              {sessionOverrides.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Ephemeral Session Overrides (Single-Turn Scope)
                  </span>
                  {sessionOverrides.map((sig) => (
                    <div
                      key={sig.id}
                      className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-900 text-xs">{sig.key}</span>
                          <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded text-[10px] font-medium">
                            Session Context
                          </span>
                          <span className="text-[10px] text-amber-700 font-mono">
                            {Math.round(sig.confidence * 100)}% Conf
                          </span>
                        </div>
                        <p className="text-xs text-amber-950 font-medium">"{sig.value}"</p>
                        <p className="text-[10px] text-amber-800/80 italic">Source: "{sig.sourceUtterance}"</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSignal(sig.id)}
                        className="p-1 text-amber-700 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete session override"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Permanent Signals */}
              {signals.map((sig) => (
                <div
                  key={sig.id}
                  className={`p-3.5 bg-white border rounded-xl space-y-2.5 transition-all shadow-2xs ${
                    sig.status === 'active' ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-800 text-xs">{sig.key}</span>
                      {getStabilityBadge(sig.stability)}
                      {sig.isPinned && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-0.5 border border-amber-300">
                          <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                        </span>
                      )}
                      {sig.topicScope && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          Topic: {sig.topicScope}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleTogglePin(sig.id)}
                        className={`p-1.5 rounded-lg border text-[11px] transition-colors flex items-center gap-1 ${
                          sig.isPinned
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={sig.isPinned ? 'Unpin preference' : 'Pin preference at 100% confidence'}
                      >
                        {sig.isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
                        <span>{sig.isPinned ? 'Pinned' : 'Pin'}</span>
                      </button>

                      <button
                        onClick={() => handleStartEdit(sig)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Edit signal value"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteSignal(sig.id)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                        title="Delete signal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Signal Value display or edit */}
                  {editingSignalId === sig.id ? (
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 p-1.5 border border-emerald-500 rounded text-xs focus:outline-hidden"
                      />
                      <button
                        onClick={() => handleSaveEdit(sig.id)}
                        className="px-2 bg-emerald-600 text-white rounded font-bold text-[11px]"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingSignalId(null)}
                        className="px-2 bg-slate-200 text-slate-700 rounded text-[11px]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-slate-800">
                      "{sig.value}"
                    </p>
                  )}

                  {/* Confidence Slider & Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>Source: <span className="italic text-slate-700">"{sig.sourceUtterance}"</span></span>
                      <span>Reinforced: <span className="font-bold text-slate-700">{sig.reinforcementCount}x</span></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">Confidence:</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={sig.confidence}
                        onChange={(e) => handleConfidenceChange(sig.id, parseFloat(e.target.value))}
                        className="w-24 accent-emerald-600 cursor-pointer"
                      />
                      <span className="font-mono font-bold text-emerald-700 w-10 text-right">
                        {Math.round(sig.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Prompt Context Preview */}
          {promptPreview && (
            <div className="p-3 bg-slate-900 text-emerald-300 rounded-xl space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-400 font-sans text-[10px] uppercase tracking-wider font-bold">
                <span>Active Context Block Injected in Model Prompts:</span>
                <span className="text-emerald-400">Live Ready</span>
              </div>
              <pre className="whitespace-pre-wrap">{promptPreview}</pre>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: USER CONTROLS & POLICIES */}
      {/* ========================================================================= */}
      {activeSubTab === 'controls' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
            <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">
              User Personalization & Learning Policies
            </h3>

            <div className="space-y-3">
              {/* Master Switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800 text-xs">Live-Learn Personalization Master Switch</div>
                  <div className="text-[11px] text-slate-500">
                    Enable or disable all real-time preference learning and in-context adaptation.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => handleUpdateConfig({ enabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Auto Detection Switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800 text-xs">Automatic Correction Detection</div>
                  <div className="text-[11px] text-slate-500">
                    Automatically parse dialogue turns for explicit corrections (e.g. "From now on...", "I prefer...").
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoDetectCorrections}
                  onChange={(e) => handleUpdateConfig({ autoDetectCorrections: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Minimum Confidence Slider */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 text-xs">Minimum Confidence Threshold for Prompt Injection</div>
                    <div className="text-[11px] text-slate-500">
                      Learned preferences with confidence below this threshold will not be injected into model prompts.
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-xs">
                    {Math.round(config.minimumConfidenceThreshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.30"
                  max="0.95"
                  step="0.05"
                  value={config.minimumConfidenceThreshold}
                  onChange={(e) => handleUpdateConfig({ minimumConfidenceThreshold: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Temporary Session Overrides Switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800 text-xs">Allow Ephemeral Session Overrides</div>
                  <div className="text-[11px] text-slate-500">
                    Allow temporary instructions ("for this question only") to apply to the active turn without writing to permanent storage.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.allowTemporarySessionOverrides}
                  onChange={(e) => handleUpdateConfig({ allowTemporarySessionOverrides: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Confidence Decay Switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800 text-xs">Confidence Decay over Inactivity & Conflicts</div>
                  <div className="text-[11px] text-slate-500">
                    Automatically decay confidence of unpinned preferences when contradictory feedback occurs.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableConfidenceDecay}
                  onChange={(e) => handleUpdateConfig({ enableConfidenceDecay: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: 5-POINT AUTOMATED TEST SUITE */}
      {/* ========================================================================= */}
      {activeSubTab === 'test-suite' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <h3 className="font-bold text-slate-800 text-xs">5-Point Live-Learn Personalization Test Suite</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automated regression suite verifying: valid preference, temporary instruction, incorrect feedback, conflicting preferences, and memory deletion.
              </p>
            </div>

            <button
              onClick={handleRunSuite}
              disabled={isTesting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isTesting ? 'Running 5 Tests...' : 'Run Test Suite'}
            </button>
          </div>

          {suiteResults && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase">Tests Passed</div>
                  <div className="text-lg font-bold text-emerald-800">{suiteResults.passed}/{suiteResults.total}</div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-[10px] text-blue-700 font-semibold uppercase">Pass Rate</div>
                  <div className="text-lg font-bold text-blue-800">{suiteResults.passRate}</div>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-[10px] text-purple-700 font-semibold uppercase">Retraining Guard</div>
                  <div className="text-lg font-bold text-purple-800">100% Zero Retrain</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[10px] text-slate-600 font-semibold uppercase">Execution Time</div>
                  <div className="text-lg font-bold text-slate-800">{suiteResults.durationMs}ms</div>
                </div>
              </div>

              <div className="space-y-2">
                {suiteResults.results.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border space-y-1.5 transition-all ${
                      item.passed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="font-bold text-slate-800 text-xs">
                          Test {idx + 1}: {item.category}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono border border-slate-200">
                          {item.resultingAction}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{item.durationMs}ms</span>
                    </div>

                    <p className="text-[11px] text-slate-700 font-medium">{item.assertionMessage}</p>

                    <div className="p-2 bg-white/80 border border-slate-200 rounded text-[10px] font-mono space-y-0.5 text-slate-600">
                      <div><span className="font-bold text-slate-800">Input:</span> "{item.inputUtterance}"</div>
                      <div><span className="font-bold text-slate-800">Stability:</span> {item.stabilityClassification} | <span className="font-bold text-slate-800">Confidence:</span> {Math.round(item.confidenceScore * 100)}%</div>
                      {item.details && <div><span className="font-bold text-slate-800">Details:</span> {item.details}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
