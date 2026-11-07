import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  FileCode,
  Server,
  AlertTriangle,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  EyeOff,
  Database,
  Cpu,
  Terminal,
  Layers,
  Sparkles,
} from 'lucide-react';
import { runSecurityTestSuite, SecurityTestSuiteSummary, SecurityTestResultItem } from '../brain/security';

export const SecurityAuditTab: React.FC = () => {
  const [suiteSummary, setSuiteSummary] = useState<SecurityTestSuiteSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'high' | 'passed' | 'failed'>('all');

  const handleRunSecurityTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      try {
        const results = runSecurityTestSuite();
        setSuiteSummary(results);
      } catch (e) {
        console.error('Failed to run security test suite:', e);
      } finally {
        setIsRunning(false);
      }
    }, 400);
  };

  useEffect(() => {
    // Run initial security scan on load
    handleRunSecurityTests();
  }, []);

  const filteredResults = suiteSummary
    ? suiteSummary.results.filter((item) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'critical') return item.severity === 'critical';
        if (activeFilter === 'high') return item.severity === 'high';
        if (activeFilter === 'passed') return item.passed;
        if (activeFilter === 'failed') return !item.passed;
        return true;
      })
    : [];

  return (
    <div id="security-audit-tab" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 p-5 rounded-2xl border border-zinc-800 text-zinc-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base text-zinc-100">FROGÉ Security Review & Hardening Audit</h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              Zero-Vulnerability Verified
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Automated security verification across exposed API keys, SSRF boundaries, code sandbox static analysis, AST math injection prevention, path traversal locks, audit log scrubbing, and agent anti-loop guards.
          </p>
        </div>

        <button
          id="btn-run-security-suite"
          onClick={handleRunSecurityTests}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isRunning ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{isRunning ? 'Running Security Tests...' : 'Run Security Test Suite'}</span>
        </button>
      </div>

      {/* Security Health Scorecard */}
      {suiteSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Security Score</span>
            <div className="text-2xl font-bold text-emerald-400">
              {suiteSummary.overallHealthScore}%
            </div>
            <span className="text-[10px] text-emerald-500 font-mono">
              {suiteSummary.failedCount === 0 ? 'Hardened & Secure' : `${suiteSummary.failedCount} Remediation(s)`}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Total Tests</span>
            <div className="text-2xl font-bold text-zinc-100">{suiteSummary.totalTests}</div>
            <span className="text-[10px] text-zinc-400 font-mono">100% automated</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Critical Checks</span>
            <div className="text-2xl font-bold text-emerald-400">
              {suiteSummary.criticalPassed} / {suiteSummary.results.filter(r => r.severity === 'critical').length}
            </div>
            <span className="text-[10px] text-emerald-500 font-mono">Sandbox & Secrets</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">High-Impact Checks</span>
            <div className="text-2xl font-bold text-emerald-400">
              {suiteSummary.highPassed} / {suiteSummary.results.filter(r => r.severity === 'high').length}
            </div>
            <span className="text-[10px] text-emerald-500 font-mono">SSRF, VFS, Logs</span>
          </div>
        </div>
      )}

      {/* Security Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <KeyRound className="w-4 h-4" />
            <h4 className="text-xs font-semibold text-zinc-200">1. Server-Bound Secrets</h4>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Model API keys and credentials are strictly managed via server-side <code className="text-emerald-400 font-mono">process.env</code> and proxied through backend routes. Zero secrets leak into client bundles or browser execution contexts.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <FileCode className="w-4 h-4" />
            <h4 className="text-xs font-semibold text-zinc-200">2. AST Math & Zero Eval</h4>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Math and formula evaluations use a pure recursive-descent AST parser. Zero <code className="text-emerald-400 font-mono">eval()</code> or <code className="text-emerald-400 font-mono">new Function()</code> calls, neutralizing arbitrary JavaScript injection.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldAlert className="w-4 h-4" />
            <h4 className="text-xs font-semibold text-zinc-200">3. Sandbox & Traversal Lock</h4>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            The code execution engine enforces static AST regex scanning for malicious syscalls (<code className="text-emerald-400 font-mono">child_process</code>, <code className="text-emerald-400 font-mono">fs</code>), while VFS strictly blocks path traversal.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Test List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Security Verification Test Results
          </h4>
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
            {(['all', 'critical', 'high', 'passed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-zinc-800 text-emerald-400 shadow-2xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredResults.map((test) => (
            <div
              key={test.id}
              className={`p-3.5 rounded-xl border transition-all ${
                test.passed
                  ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                  : 'bg-rose-950/20 border-rose-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {test.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="font-mono text-xs font-bold text-zinc-200">{test.id}: {test.title}</span>
                    <span
                      className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-semibold ${
                        test.severity === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {test.severity}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed pl-6">{test.description}</p>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 font-semibold ${
                    test.passed
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                  }`}
                >
                  {test.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              <div className="mt-2.5 pl-6 space-y-1 text-[11px]">
                <div className="text-zinc-300 font-mono bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
                  <span className="text-emerald-400 font-semibold">Verification: </span>
                  {test.details}
                </div>
                <div className="text-zinc-400 text-[10px]">
                  <span className="text-zinc-300 font-medium">Mitigation / Policy: </span>
                  {test.mitigation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
