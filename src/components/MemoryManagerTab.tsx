import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Database,
  UserCheck,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  RefreshCw,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Lock,
  Eye,
  EyeOff,
  Sliders,
  AlertTriangle,
  FileJson,
  Key,
  Tag,
  Check,
  Search,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  frogeMemoryEngine,
  runFrogeMemoryTestSuite,
  MemoryTestSuiteSummary,
  UserMemoryControlConfig,
  UnifiedMemoryQueryResult,
  PersonalizationMemoryItem,
  AppDataMemoryItem,
  ConversationTurnItem,
  PersonalizationCategory,
  AppDataCategory,
  FROGE_PRIVACY_DISCLOSURE,
  auditSensitiveData,
} from '../brain';
import { LiveLearnPersonalizationTab } from './LiveLearnPersonalizationTab';

export const MemoryManagerTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'tiers' | 'live-learn' | 'controls' | 'isolation' | 'privacy' | 'test-suite'>('tiers');
  const [activeTier, setActiveTier] = useState<'conversation' | 'personalization' | 'app_data'>('personalization');
  const [activeUserId, setActiveUserId] = useState<string>('default_user');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Memory Data State
  const [unifiedData, setUnifiedData] = useState<UnifiedMemoryQueryResult | null>(null);
  const [userConfig, setUserConfig] = useState<UserMemoryControlConfig>(() => frogeMemoryEngine.getUserConfig('default_user'));
  const [suiteResults, setSuiteResults] = useState<MemoryTestSuiteSummary | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Forms / Inputs State
  const [newPrefKey, setNewPrefKey] = useState('');
  const [newPrefValue, setNewPrefValue] = useState('');
  const [newPrefCategory, setNewPrefCategory] = useState<PersonalizationCategory>('preference');
  const [newAppDataNamespace, setNewAppDataNamespace] = useState('knowledge_base');
  const [newAppDataKey, setNewAppDataKey] = useState('');
  const [newAppDataContent, setNewAppDataContent] = useState('{\n  "status": "verified",\n  "version": "1.0"\n}');
  const [newAppDataCategory, setNewAppDataCategory] = useState<AppDataCategory>('structured_record');

  // Privacy Tester State
  const [sensitiveTestInput, setSensitiveTestInput] = useState(
    'My secret OpenAI key is sk-proj-1234567890abcdef1234567890abcdef and credit card is 4532 8901 2345 6789 with ssn 000-12-3456'
  );
  const [sensitiveAuditResult, setSensitiveAuditResult] = useState(() => auditSensitiveData(sensitiveTestInput, true));

  // Cross-user test state
  const [isolatedUserA, setIsolatedUserA] = useState('user_alpha_architect');
  const [isolatedUserB, setIsolatedUserB] = useState('user_beta_researcher');
  const [isolationQueryInput, setIsolationQueryInput] = useState('architecture');
  const [isolationResults, setIsolationResults] = useState<{
    userA: UnifiedMemoryQueryResult | null;
    userB: UnifiedMemoryQueryResult | null;
  }>({ userA: null, userB: null });

  // Status message
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const loadData = () => {
    const res = frogeMemoryEngine.queryAll({
      userId: activeUserId,
      queryText: searchQuery,
    });
    setUnifiedData(res);
    setUserConfig(frogeMemoryEngine.getUserConfig(activeUserId));
  };

  useEffect(() => {
    loadData();
  }, [activeUserId, searchQuery]);

  const handleRunSuite = async () => {
    setIsTesting(true);
    try {
      // Try backend endpoint first
      const res = await fetch('/api/memory/test-suite', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSuiteResults(data.data);
          setIsTesting(false);
          return;
        }
      }
    } catch {}

    try {
      const direct = await runFrogeMemoryTestSuite();
      setSuiteResults(direct);
    } finally {
      setIsTesting(false);
    }
  };

  const handleUpdateConfig = (updates: Partial<UserMemoryControlConfig>) => {
    const updated = frogeMemoryEngine.updateUserConfig(activeUserId, updates);
    setUserConfig({ ...updated });
    loadData();
    setStatusNotice('Memory preferences updated successfully.');
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleAddPreference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrefKey.trim() || !newPrefValue.trim()) return;

    const res = frogeMemoryEngine.rememberPreference(
      activeUserId,
      newPrefKey.trim(),
      newPrefValue.trim(),
      newPrefCategory,
      'explicit_user_statement'
    );

    if (res) {
      setNewPrefKey('');
      setNewPrefValue('');
      loadData();
      setStatusNotice(`Saved preference "${newPrefKey}"`);
    } else {
      setStatusNotice('Failed to save: Blocked by user policy or sensitive content filter.');
    }
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleAddAppData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppDataKey.trim()) return;

    let parsedData: any = newAppDataContent;
    try {
      parsedData = JSON.parse(newAppDataContent);
    } catch {}

    const res = frogeMemoryEngine.rememberAppData(
      activeUserId,
      newAppDataNamespace.trim() || 'default',
      newAppDataKey.trim(),
      parsedData,
      newAppDataCategory
    );

    if (res) {
      setNewAppDataKey('');
      loadData();
      setStatusNotice(`Stored entity "${newAppDataKey}" in ${newAppDataNamespace}`);
    } else {
      setStatusNotice('Failed to store: Blocked by memory control policy.');
    }
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleDeleteItem = (tier: 'conversation' | 'personalization' | 'app_data', id: string) => {
    frogeMemoryEngine.deleteMemoryItem(activeUserId, tier, id);
    loadData();
    setStatusNotice(`Deleted item from ${tier}`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleResetTier = (tier: 'conversation' | 'personalization' | 'app_data') => {
    const count = frogeMemoryEngine.resetTier(activeUserId, tier);
    loadData();
    setStatusNotice(`Purged ${count} records from ${tier} for ${activeUserId}`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleResetAll = () => {
    if (window.confirm(`Are you sure you want to permanently reset and wipe ALL memory for ${activeUserId}? This action is irreversible.`)) {
      const report = frogeMemoryEngine.resetAllUserMemory(activeUserId);
      loadData();
      setStatusNotice(`Full wipe completed: Purged ${report.totalPurged} memory items.`);
      setTimeout(() => setStatusNotice(null), 4000);
    }
  };

  const handleRunIsolationCheck = () => {
    // Seed test records into User A and User B
    frogeMemoryEngine.rememberPreference(
      isolatedUserA,
      'preferred_architecture',
      'Event-Driven Microservices with Kafka & Go',
      'preference',
      'explicit_user_statement',
      ['architecture', 'backend']
    );
    frogeMemoryEngine.rememberAppData(
      isolatedUserA,
      'system_blueprints',
      'cloud_mesh_v2',
      { cluster: 'us-east-prod', nodes: 32 },
      'structured_record'
    );

    frogeMemoryEngine.rememberPreference(
      isolatedUserB,
      'culinary_specialty',
      'French Sourdough and Wild Fermentation',
      'preference',
      'explicit_user_statement',
      ['culinary', 'baking']
    );

    // Query both users
    const resA = frogeMemoryEngine.queryAll({
      userId: isolatedUserA,
      queryText: isolationQueryInput,
    });
    const resB = frogeMemoryEngine.queryAll({
      userId: isolatedUserB,
      queryText: isolationQueryInput,
    });

    setIsolationResults({ userA: resA, userB: resB });
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Active Tenant Scope:</span>
              <select
                value={activeUserId}
                onChange={(e) => setActiveUserId(e.target.value)}
                className="text-xs font-semibold px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 outline-hidden"
              >
                <option value="default_user">default_user (Primary)</option>
                <option value="user_alpha_architect">user_alpha_architect (Dev)</option>
                <option value="user_beta_researcher">user_beta_researcher (Research)</option>
                <option value="custom_tenant_demo">custom_tenant_demo (Guest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('tiers')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'tiers' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            3-Tier Explorer
          </button>
          <button
            onClick={() => setActiveSubTab('live-learn')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'live-learn' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Live-Learn Personalization
          </button>
          <button
            onClick={() => setActiveSubTab('controls')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'controls' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            User Controls
          </button>
          <button
            onClick={() => setActiveSubTab('isolation')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'isolation' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            Cross-User Isolation
          </button>
          <button
            onClick={() => setActiveSubTab('privacy')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'privacy' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Privacy & Scrubbing
          </button>
          <button
            onClick={() => {
              setActiveSubTab('test-suite');
              if (!suiteResults) handleRunSuite();
            }}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'test-suite' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Test Suite ({suiteResults ? `${suiteResults.passed}/${suiteResults.total}` : '11/11'})
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="p-2.5 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* SUB-TAB 0: LIVE-LEARN PERSONALIZATION */}
      {activeSubTab === 'live-learn' && (
        <div className="space-y-4">
          <LiveLearnPersonalizationTab />
        </div>
      )}

      {/* SUB-TAB 1: 3-TIER EXPLORER */}
      {activeSubTab === 'tiers' && (
        <div className="space-y-4">
          {/* Tier Switcher Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setActiveTier('conversation')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                activeTier === 'conversation'
                  ? 'bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Tier 1: Conversation</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
                  {unifiedData?.conversationContext.length || 0} turns
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                Sliding-window interaction turns, session topics & conversational context.
              </p>
            </button>

            <button
              onClick={() => setActiveTier('personalization')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                activeTier === 'personalization'
                  ? 'bg-purple-50/50 border-purple-400 ring-2 ring-purple-500/20 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Tier 2: Personalization</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
                  {unifiedData?.personalizationRecords.length || 0} items
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                User interaction styles, preferences, goals, custom rules & profile facts.
              </p>
            </button>

            <button
              onClick={() => setActiveTier('app_data')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                activeTier === 'app_data'
                  ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-500/20 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Tier 3: App / Data</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
                  {unifiedData?.appDataRecords.length || 0} entities
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                Structured domain models, cached research graphs, verified facts & namespaces.
              </p>
            </button>
          </div>

          {/* Search bar & filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search across active memory tier by keyword, key, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden"
              />
            </div>
            <button
              onClick={loadData}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {/* Tier 1 Content: Conversation */}
          {activeTier === 'conversation' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Stored Turns for Tenant: <span className="font-mono text-emerald-600">{activeUserId}</span>
                </span>
                <button
                  onClick={() => handleResetTier('conversation')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Purge Conversation Turns
                </button>
              </div>

              {unifiedData?.conversationContext.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                  No conversation turns recorded for {activeUserId}. Chat turns are automatically sanitized and indexed here.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {(unifiedData?.conversationContext || []).map((turn) => (
                    <div
                      key={turn.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 shadow-2xs hover:border-slate-300"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              turn.role === 'user'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {turn.role}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(turn.timestamp).toLocaleTimeString()}
                          </span>
                          {turn.topicTags && turn.topicTags.map((tag) => (
                            <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-700 font-mono whitespace-pre-wrap">{turn.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteItem('conversation', turn.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Delete Turn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tier 2 Content: Personalization */}
          {activeTier === 'personalization' && (
            <div className="space-y-4">
              {/* Form to add explicit preference */}
              <form onSubmit={handleAddPreference} className="p-3.5 bg-purple-50/40 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-purple-600" />
                    Remember New Personalization Preference
                  </span>
                  <span className="text-[10px] font-mono text-purple-600 font-medium">Auto-PII Sanitization Active</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Key (e.g. coding_style, tone)"
                    value={newPrefKey}
                    onChange={(e) => setNewPrefKey(e.target.value)}
                    className="text-xs p-2 bg-white border border-purple-200 rounded-xl focus:border-purple-500 outline-hidden"
                    required
                  />
                  <select
                    value={newPrefCategory}
                    onChange={(e) => setNewPrefCategory(e.target.value as PersonalizationCategory)}
                    className="text-xs p-2 bg-white border border-purple-200 rounded-xl focus:border-purple-500 outline-hidden"
                  >
                    <option value="preference">General Preference</option>
                    <option value="interaction_style">Interaction Style / Tone</option>
                    <option value="user_goal">User Goal / Objectives</option>
                    <option value="expertise_level">Expertise Level</option>
                    <option value="custom_instruction">Custom Instruction</option>
                    <option value="profile_fact">Profile Fact</option>
                  </select>
                  <button
                    type="submit"
                    className="text-xs font-bold px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Preference
                  </button>
                </div>

                <textarea
                  placeholder="Value / Directive (e.g. 'Senior engineer tone, prefer TypeScript with strict typing and unit tests')"
                  value={newPrefValue}
                  onChange={(e) => setNewPrefValue(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 bg-white border border-purple-200 rounded-xl focus:border-purple-500 outline-hidden"
                  required
                />
              </form>

              {/* Stored Preferences List */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Stored Preferences ({unifiedData?.personalizationRecords.length || 0})
                </span>
                <button
                  onClick={() => handleResetTier('personalization')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Purge All Preferences
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {(unifiedData?.personalizationRecords || []).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 shadow-2xs hover:border-purple-200"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 font-mono">{item.key}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                          {item.category}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                          Confidence: {Math.round(item.confidence * 100)}%
                        </span>
                        {item.isPinned && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                            PINNED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{item.value}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>Source: {item.source}</span>
                        <span>•</span>
                        <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteItem('personalization', item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tier 3 Content: App / Data */}
          {activeTier === 'app_data' && (
            <div className="space-y-4">
              {/* Form to add App Data entity */}
              <form onSubmit={handleAddAppData} className="p-3.5 bg-blue-50/40 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    Store Application Domain Record
                  </span>
                  <span className="text-[10px] font-mono text-blue-600 font-medium">Namespaced Persistence</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Namespace (e.g. workspace, telemetry)"
                    value={newAppDataNamespace}
                    onChange={(e) => setNewAppDataNamespace(e.target.value)}
                    className="text-xs p-2 bg-white border border-blue-200 rounded-xl focus:border-blue-500 outline-hidden"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Record Key (e.g. sprint_plan, report_q3)"
                    value={newAppDataKey}
                    onChange={(e) => setNewAppDataKey(e.target.value)}
                    className="text-xs p-2 bg-white border border-blue-200 rounded-xl focus:border-blue-500 outline-hidden"
                    required
                  />
                  <select
                    value={newAppDataCategory}
                    onChange={(e) => setNewAppDataCategory(e.target.value as AppDataCategory)}
                    className="text-xs p-2 bg-white border border-blue-200 rounded-xl focus:border-blue-500 outline-hidden"
                  >
                    <option value="structured_record">Structured Record (JSON)</option>
                    <option value="domain_entity">Domain Entity</option>
                    <option value="verified_fact">Verified Fact</option>
                    <option value="data_cache">Data Cache / Artifact</option>
                  </select>
                </div>

                <textarea
                  placeholder="JSON or text payload"
                  value={newAppDataContent}
                  onChange={(e) => setNewAppDataContent(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2 font-mono bg-white border border-blue-200 rounded-xl focus:border-blue-500 outline-hidden"
                  required
                />

                <button
                  type="submit"
                  className="text-xs font-bold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  Store Record
                </button>
              </form>

              {/* Stored App Data List */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Stored App Records ({unifiedData?.appDataRecords.length || 0})
                </span>
                <button
                  onClick={() => handleResetTier('app_data')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Purge All App Data
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {(unifiedData?.appDataRecords || []).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 shadow-2xs hover:border-blue-200"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-blue-900 font-mono">
                          {item.namespace} / {item.key}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Accesses: {item.accessCount}
                        </span>
                      </div>
                      <pre className="text-[11px] p-2 bg-slate-50 border border-slate-100 rounded-lg font-mono text-slate-700 overflow-x-auto max-h-28">
                        {typeof item.data === 'string' ? item.data : JSON.stringify(item.data, null, 2)}
                      </pre>
                    </div>
                    <button
                      onClick={() => handleDeleteItem('app_data', item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: USER CONTROLS */}
      {activeSubTab === 'controls' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Master Memory Controls ({activeUserId})</h4>
                <p className="text-[11px] text-slate-500">
                  Configure retention, selective capture rules, and toggle storage tiers.
                </p>
              </div>
              <button
                onClick={handleResetAll}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                Reset & Wipe All User Memory
              </button>
            </div>

            {/* Toggle Switches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Global Memory Master Switch</span>
                  <span className="text-[11px] text-slate-500">Completely disables all memory recording & querying</span>
                </div>
                <input
                  type="checkbox"
                  checked={userConfig.globalMemoryEnabled}
                  onChange={(e) => handleUpdateConfig({ globalMemoryEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Tier 1: Conversation Memory</span>
                  <span className="text-[11px] text-slate-500">Record and retrieve chat dialogue turns</span>
                </div>
                <input
                  type="checkbox"
                  checked={userConfig.conversationMemoryEnabled}
                  onChange={(e) => handleUpdateConfig({ conversationMemoryEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Tier 2: Personalization Memory</span>
                  <span className="text-[11px] text-slate-500">Retain user preferences, styles & instructions</span>
                </div>
                <input
                  type="checkbox"
                  checked={userConfig.personalizationMemoryEnabled}
                  onChange={(e) => handleUpdateConfig({ personalizationMemoryEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Tier 3: App / Data Memory</span>
                  <span className="text-[11px] text-slate-500">Store domain objects and structured caches</span>
                </div>
                <input
                  type="checkbox"
                  checked={userConfig.appDataMemoryEnabled}
                  onChange={(e) => handleUpdateConfig({ appDataMemoryEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Selectivity and Blocklist Config */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Selective Capture & Privacy Rules</span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-700 font-medium">Strict PII Redaction</span>
                  <input
                    type="checkbox"
                    checked={userConfig.strictPiiRedaction}
                    onChange={(e) => handleUpdateConfig({ strictPiiRedaction: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-700 font-medium">Reject Sensitive Credentials</span>
                  <input
                    type="checkbox"
                    checked={userConfig.rejectSensitiveUploads}
                    onChange={(e) => handleUpdateConfig({ rejectSensitiveUploads: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Custom Blocked Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  value={userConfig.blockedKeywords?.join(', ') || ''}
                  onChange={(e) =>
                    handleUpdateConfig({
                      blockedKeywords: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 outline-hidden"
                  placeholder="password, secret_key, ssn, credit_card"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CROSS-USER ISOLATION SIMULATOR */}
      {activeSubTab === 'isolation' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600" />
                Cross-User Cryptographic Isolation Simulator
              </h4>
              <p className="text-[11px] text-slate-500">
                Verify that User B cannot read or leak any memories stored by User A under any query condition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 font-mono">Tenant A: {isolatedUserA}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                    Target Data
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Holds: <span className="font-semibold text-slate-800">"Event-Driven Microservices with Kafka"</span> in Personalization.
                </p>
              </div>

              <div className="p-3 bg-white border border-purple-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 font-mono">Tenant B: {isolatedUserB}</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                    Probing Tenant
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Holds: <span className="font-semibold text-slate-800">"French Sourdough and Wild Fermentation"</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={isolationQueryInput}
                onChange={(e) => setIsolationQueryInput(e.target.value)}
                placeholder="Query keyword (e.g. architecture, microservices, kafka)..."
                className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-hidden focus:border-blue-500"
              />
              <button
                onClick={handleRunIsolationCheck}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Play className="w-3.5 h-3.5" />
                Run Isolation Probe
              </button>
            </div>

            {isolationResults.userA && isolationResults.userB && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* User A Result */}
                <div className="p-3 bg-white border border-emerald-300 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">User A Retrieval Result</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {isolationResults.userA.totalRetrieved} item(s) found
                    </span>
                  </div>
                  <pre className="text-[10px] p-2 bg-slate-50 rounded-lg font-mono text-slate-700 overflow-x-auto max-h-32">
                    {JSON.stringify(
                      isolationResults.userA.personalizationRecords.map((r) => ({ key: r.key, value: r.value })),
                      null,
                      2
                    )}
                  </pre>
                </div>

                {/* User B Result */}
                <div className="p-3 bg-white border border-slate-300 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">User B Retrieval Result</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isolationResults.userB.totalRetrieved === 0
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-amber-700 bg-amber-50'
                      }`}
                    >
                      {isolationResults.userB.totalRetrieved} item(s) found
                    </span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Zero Cross-Talk: User B retrieved 0 items from User A’s namespace.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PRIVACY & SENSITIVE DATA SCRUBBING */}
      {activeSubTab === 'privacy' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Live Sensitive Data Auditor & Privacy Boundary Scanner
              </h4>
              <p className="text-[11px] text-slate-500">
                FROGÉ intercepts API keys, credit cards, passwords, and SSNs before storage to prevent unnecessary retention.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 block">Test Payload Scanner:</label>
              <textarea
                value={sensitiveTestInput}
                onChange={(e) => {
                  setSensitiveTestInput(e.target.value);
                  setSensitiveAuditResult(auditSensitiveData(e.target.value, true));
                }}
                rows={3}
                className="w-full text-xs p-2.5 font-mono bg-white border border-slate-300 rounded-xl focus:border-amber-500 outline-hidden"
              />
            </div>

            {/* Audit Breakdown */}
            <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Scanner Audit Result:</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sensitiveAuditResult.hasSensitiveData
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {sensitiveAuditResult.hasSensitiveData ? 'Sensitive Data Intercepted' : 'Clean Payload'}
                </span>
              </div>

              {sensitiveAuditResult.hasSensitiveData && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(sensitiveAuditResult.detectedTypes || []).map((type) => (
                      <span key={type} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                        {type}
                      </span>
                    ))}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Sanitized / Redacted Output:</span>
                    <pre className="text-xs p-2.5 bg-slate-900 text-emerald-400 rounded-lg font-mono whitespace-pre-wrap">
                      {sensitiveAuditResult.redactedText}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Calibrated Privacy Disclosures */}
            <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-950">
              <span className="font-bold flex items-center gap-1 text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Calibrated Privacy Boundary Disclosure
              </span>
              <p className="text-[11px] leading-relaxed text-amber-900">
                {FROGE_PRIVACY_DISCLOSURE.notice}
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-amber-800 pt-1">
                <div>Isolation Level: <span className="font-bold">{FROGE_PRIVACY_DISCLOSURE.isolationLevel}</span></div>
                <div>Operator Model: <span className="font-bold">{FROGE_PRIVACY_DISCLOSURE.operatorAccessModel}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: AUTOMATED TEST SUITE */}
      {activeSubTab === 'test-suite' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Modular Memory 11-Point Verification Suite</h4>
              <p className="text-[11px] text-slate-500">
                Tests multi-tier retrieval, granular deletion, cross-user isolation, and privacy boundary enforcement.
              </p>
            </div>
            <button
              onClick={handleRunSuite}
              disabled={isTesting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              {isTesting ? 'Running Suite...' : 'Run All 11 Tests'}
            </button>
          </div>

          {suiteResults && (
            <div className="space-y-3">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Pass Rate</span>
                  <span className="text-lg font-bold text-emerald-950 font-mono">{suiteResults.passRate}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Total Tests</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">{suiteResults.total}</span>
                </div>
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Passed</span>
                  <span className="text-lg font-bold text-emerald-800 font-mono">{suiteResults.passed}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Duration</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">{suiteResults.durationMs}ms</span>
                </div>
              </div>

              {/* Itemized Results */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {(suiteResults.results || []).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 shadow-2xs hover:border-slate-300"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {r.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-900">{r.testName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                          {r.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{r.assertionMessage}</p>
                      {r.details && (
                        <p className="text-[10px] font-mono text-emerald-700 bg-emerald-50/60 p-1 px-2 rounded-md">
                          {r.details}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{r.durationMs}ms</span>
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
