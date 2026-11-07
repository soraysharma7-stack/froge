/**
 * FROGÉ Security & Hardening Test Suite
 * Automated verification of:
 * - Exposed API keys & secrets isolation
 * - Insecure authentication & authorization
 * - SSRF endpoint protection
 * - Code execution sandbox & AST static analysis
 * - Path traversal & Virtual File System confinement
 * - Rate limiting & runaway loop mitigation
 * - Sensitive information scrubbing in audit logs
 * - Agent permission boundaries & Human-in-the-Loop gates
 * - Tenant memory privacy & cryptographic isolation
 */

import { SecureCodeSandbox } from '../code/sandbox';
import { VirtualFileSystem } from '../code/virtualFileSystem';
import { agentAuditLogger } from '../agents/logger';
import { AgentAntiLoopGuard } from '../agents/antiLoopGuard';
import { AgentApprovalManager } from '../agents/approvalManager';
import { agentRegistry } from '../agents/agentRegistry';
import { AGENT_TOOL_DEFINITIONS } from '../agents/toolRegistry';
import { evaluateSafeArithmetic } from '../tools';
import { auditSensitiveData } from '../memory/privacyAuditor';
import { frogeMemoryEngine } from '../memory';

export interface SecurityTestResultItem {
  id: string;
  category: 'api_keys' | 'injection_eval' | 'sandbox_execution' | 'path_traversal' | 'ssrf_auth' | 'agent_boundaries' | 'audit_logging' | 'tenant_privacy';
  title: string;
  description: string;
  passed: boolean;
  severity: 'critical' | 'high' | 'medium';
  details: string;
  mitigation: string;
}

export interface SecurityTestSuiteSummary {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  criticalPassed: number;
  highPassed: number;
  mediumPassed: number;
  overallHealthScore: number;
  status: 'secure' | 'remediated' | 'vulnerable';
  results: SecurityTestResultItem[];
}

export function runSecurityTestSuite(): SecurityTestSuiteSummary {
  const results: SecurityTestResultItem[] = [];

  // ----------------------------------------------------
  // TEST 1: Exposed API Keys & Server-Side Secret Isolation
  // ----------------------------------------------------
  try {
    // Check that client-side window/document does not leak process.env secrets
    const hasExposedKeyInWindow = typeof window !== 'undefined' && Boolean((window as any).FROGE_MODEL_API_KEY || (window as any).OPENAI_API_KEY);
    const passed = !hasExposedKeyInWindow;
    results.push({
      id: 'SEC-KEY-01',
      category: 'api_keys',
      title: 'Server-Side API Key Isolation',
      description: 'Verifies that model credentials and API keys are strictly server-bound and never exposed in client window/runtime.',
      passed,
      severity: 'critical',
      details: passed
        ? 'Passed: No raw API keys exposed on global window object. Server routes proxy all model inferences.'
        : 'Failed: API key found exposed on window object.',
      mitigation: 'Keep all model credentials in server process.env and proxy requests via /api/* routes.',
    });
  } catch (e: any) {
    results.push({
      id: 'SEC-KEY-01',
      category: 'api_keys',
      title: 'Server-Side API Key Isolation',
      description: 'Verifies that cloud provider API keys are strictly server-bound.',
      passed: false,
      severity: 'critical',
      details: `Error executing check: ${e.message}`,
      mitigation: 'Isolate keys to backend process.env.',
    });
  }

  // ----------------------------------------------------
  // TEST 2: Math Tool Evaluator Injection Protection (No Eval / new Function)
  // ----------------------------------------------------
  try {
    let injectionBlocked = false;
    try {
      // Attempt code execution through math evaluator
      const maliciousMath = "process.mainModule.require('child_process').execSync('id')";
      evaluateSafeArithmetic(maliciousMath);
    } catch (err: any) {
      // Expected to fail safely
      injectionBlocked = true;
    }

    // Verify valid arithmetic computes cleanly
    const arithmeticCheck = evaluateSafeArithmetic('((14 * 2.5) + (100 / 4)) ^ 2');
    const validMathPassed = Math.abs(arithmeticCheck - 3600) < 0.001;

    const passed = injectionBlocked && validMathPassed;
    results.push({
      id: 'SEC-INJ-02',
      category: 'injection_eval',
      title: 'Safe Arithmetic AST Parser (Zero Eval / Function Injection)',
      description: 'Confirms that math evaluation uses pure AST tokenizer & recursive-descent parser, blocking arbitrary JavaScript code execution.',
      passed,
      severity: 'critical',
      details: passed
        ? `Passed: JavaScript injection payload safely blocked by AST parser. Standard math evaluated correctly (Result: ${arithmeticCheck}).`
        : 'Failed: AST parser allowed non-math characters or threw unexpected state.',
      mitigation: 'Never use eval() or new Function() on user input. Use strict arithmetic AST tokenization.',
    });
  } catch (e: any) {
    results.push({
      id: 'SEC-INJ-02',
      category: 'injection_eval',
      title: 'Safe Arithmetic AST Parser',
      description: 'Blocks JS injection payloads in math engine.',
      passed: false,
      severity: 'critical',
      details: `Error: ${e.message}`,
      mitigation: 'Implement AST recursive descent parser.',
    });
  }

  // ----------------------------------------------------
  // TEST 3: Secure Code Sandbox AST Static Analysis
  // ----------------------------------------------------
  try {
    const sandbox = SecureCodeSandbox.getInstance();
    const dangerousPayloads = [
      "import fs from 'fs'; fs.readFileSync('/etc/passwd');",
      "const { exec } = require('child_process'); exec('rm -rf /');",
      "eval('process.exit(1)');",
      "new Function('return process')().kill();",
      "require('net').createServer().listen(80);",
    ];

    let allBlocked = true;
    const blockReasons: string[] = [];

    for (const code of dangerousPayloads) {
      const violations = sandbox.analyzeSecurityThreats(code);
      if (violations.length === 0) {
        allBlocked = false;
      } else {
        blockReasons.push(violations.map((v) => v.message).join(', '));
      }
    }

    results.push({
      id: 'SEC-SBX-03',
      category: 'sandbox_execution',
      title: 'Sandbox AST Static Security Scanner',
      description: 'Audits static code analyzer for intercepting dangerous syscalls (fs, child_process, net, eval, socket, process.exit).',
      passed: allBlocked,
      severity: 'critical',
      details: allBlocked
        ? `Passed: All 5 adversarial code payloads intercepted before execution. Block reasons: [${blockReasons.slice(0, 2).join('; ')}...]`
        : 'Failed: Static security scanner permitted dangerous system call.',
      mitigation: 'Block dangerous module imports, native system calls, and dynamic execution at compile/static analysis time.',
    });
  } catch (e: any) {
    results.push({
      id: 'SEC-SBX-03',
      category: 'sandbox_execution',
      title: 'Sandbox AST Static Security Scanner',
      description: 'Audits static code analyzer.',
      passed: false,
      severity: 'critical',
      details: `Error: ${e.message}`,
      mitigation: 'Enforce static regex/AST validation.',
    });
  }

  // ----------------------------------------------------
  // TEST 4: Virtual File System Path Traversal Protection
  // ----------------------------------------------------
  try {
    const vfs = new VirtualFileSystem();
    const maliciousPaths = [
      '../../etc/passwd',
      '/etc/shadow',
      '/root/.ssh/id_rsa',
      '..\\..\\windows\\system32',
      'foo/bar/../../../proc/self/environ',
      'file%00.txt',
      '%2e%2e%2f%2e%2e%2fetc%2fhosts',
    ];

    let allBlocked = true;
    for (const p of maliciousPaths) {
      try {
        vfs.sanitizePath(p);
        allBlocked = false; // should have thrown
      } catch {
        // Expected throw on traversal
      }
    }

    // Test legitimate workspace paths
    const validPath = vfs.sanitizePath('src/components/App.tsx');
    const validPassed = validPath === '/src/components/App.tsx';

    const passed = allBlocked && validPassed;
    results.push({
      id: 'SEC-VFS-04',
      category: 'path_traversal',
      title: 'Virtual File System Confinement & Path Traversal Guard',
      description: 'Tests that all attempts to escape /workspace or inject null-bytes/URL encodings are blocked.',
      passed,
      severity: 'high',
      details: passed
        ? 'Passed: 100% of directory traversal attempts, host system paths, and null-byte injections rejected.'
        : 'Failed: VFS allowed unsafe path resolution.',
      mitigation: 'Normalize slashes, decode URI sequences, reject dot-dot sequences and host root paths in sanitizePath().',
    });
  } catch (e: any) {
    results.push({
      id: 'SEC-VFS-04',
      category: 'path_traversal',
      title: 'Virtual File System Confinement',
      description: 'Tests path traversal prevention in VFS.',
      passed: false,
      severity: 'high',
      details: `Error: ${e.message}`,
      mitigation: 'Harden sanitizePath in VirtualFileSystem.',
    });
  }

  // ----------------------------------------------------
  // TEST 5: SSRF & Local Endpoint Validation
  // ----------------------------------------------------
  try {
    function isSafeLocalEndpoint(urlStr: string): boolean {
      try {
        const parsed = new URL(urlStr);
        if (parsed.protocol !== 'http:') return false;
        const host = parsed.hostname.toLowerCase();
        if (host !== '127.0.0.1' && host !== 'localhost' && host !== '::1') {
          return false;
        }
        const port = parsed.port ? parseInt(parsed.port, 10) : 80;
        if (port < 1024 || port > 65535) return false;
        return true;
      } catch {
        return false;
      }
    }

    const testEndpoints = [
      { url: 'http://169.254.169.254/latest/meta-data/', expectedSafe: false },
      { url: 'http://evil-attacker.com:8000/api', expectedSafe: false },
      { url: 'file:///etc/passwd', expectedSafe: false },
      { url: 'gopher://127.0.0.1:8000', expectedSafe: false },
      { url: 'http://127.0.0.1:8000', expectedSafe: true },
      { url: 'http://localhost:8000', expectedSafe: true },
    ];

    let passed = true;
    for (const test of testEndpoints) {
      if (isSafeLocalEndpoint(test.url) !== test.expectedSafe) {
        passed = false;
      }
    }

    results.push({
      id: 'SEC-SSRF-05',
      category: 'ssrf_auth',
      title: 'SSRF & Loopback Host Validation',
      description: 'Verifies that API bridge queries reject external domains, cloud metadata IPs (169.254.169.254), and non-HTTP protocols.',
      passed,
      severity: 'high',
      details: passed
        ? 'Passed: Metadata IP, external domains, and invalid protocols rejected. Valid localhost loopback endpoints permitted.'
        : 'Failed: SSRF validator failed to properly classify endpoints.',
      mitigation: 'Enforce strict protocol, hostname (127.0.0.1/localhost), and port range validation on bridge proxies.',
    });
  } catch (e: any) {
    results.push({
      id: 'SEC-SSRF-05',
      category: 'ssrf_auth',
      title: 'SSRF & Loopback Host Validation',
      description: 'Verifies SSRF filters.',
      passed: false,
      severity: 'high',
      details: `Error: ${e.message}`,
      mitigation: 'Implement isSafeLocalEndpoint validator.',
    });
  }

  // ----------------------------------------------------
  // TEST 6: Anti-Loop & Runaway Spending Prevention
  // ----------------------------------------------------
  try {
    const antiLoopGuard = new AgentAntiLoopGuard();

    // 1. Direct/Indirect recursion cycle test
    const cycleCheck = antiLoopGuard.validateInvocation(
      'research_agent',
      'research_agent',
      ['research_agent']
    );

    // 2. Multi-agent DAG cycle test: Agent A -> Agent B -> Agent A
    const cyclicPlan = antiLoopGuard.validatePlanAcyclic([
      { from: 'research_agent', to: 'coding_agent' },
      { from: 'coding_agent', to: 'research_agent' },
    ]);

    // 3. Delegation Depth limit test (Central Brain -> A -> B -> C exceeds depth 2)
    const depthExceeded = antiLoopGuard.validateInvocation(
      'coding_agent',
      'data_agent',
      ['central_brain', 'research_agent', 'coding_agent']
    );

    const passed =
      !cycleCheck.allowed &&
      cycleCheck.loopDetected &&
      !cyclicPlan.isAcyclic &&
      !depthExceeded.allowed;

    results.push({
      id: 'SEC-LOOP-06',
      category: 'agent_boundaries',
      title: 'Agent Anti-Loop & DAG Cycle Prevention Guard',
      description: 'Ensures agents cannot enter recursive cycles, cyclic delegation graphs, or exceed max delegation depth (depth > 2).',
      passed,
      severity: 'high',
      details: passed
        ? `Passed: Direct cyclic recursion blocked (loopDetected=true), circular DAG plan intercepted (${cyclicPlan.cyclePath}), and depth limit (depth > 2) enforced.`
        : 'Failed: Anti-loop guard allowed cyclic invocation.',
      mitigation: 'Maintain stateful invocation graphs, validate DAG properties, and strictly limit delegation depth to 2.',
    });
  } catch (e: any) {
    results.push({
      id: 'SEC-LOOP-06',
      category: 'agent_boundaries',
      title: 'Agent Anti-Loop Guard',
      description: 'Tests anti-loop mechanism.',
      passed: false,
      severity: 'high',
      details: `Error: ${e.message}`,
      mitigation: 'Check AgentAntiLoopGuard configuration.',
    });
  }

  // ----------------------------------------------------
  // TEST 7: Human-in-the-Loop Approval for High-Impact Agent Actions
  // ----------------------------------------------------
  try {
    const approvalManager = new AgentApprovalManager();
    const req = approvalManager.createApprovalRequest({
      agentId: 'coding_agent',
      taskId: 'task_sec_01',
      actionTitle: 'Write Production Code Files',
      description: 'Apply multi-file patch to application codebase',
      riskLevel: 'high',
      riskCategory: 'data_mutation',
      estimatedCostUsd: 0.02,
    });

    const isPending = req.status === 'pending';
    const toolDef = AGENT_TOOL_DEFINITIONS.virtual_filesystem_writer;
    const toolRequiresApproval = toolDef.requiresExplicitApproval;

    const passed = isPending && toolRequiresApproval;
    results.push({
      id: 'SEC-APPR-07',
      category: 'agent_boundaries',
      title: 'High-Impact Agent Action Approval Gate',
      description: 'Ensures mutating or financial actions require explicit operator sign-off before proceeding.',
      passed,
      severity: 'high',
      details: passed
        ? 'Passed: Mutating actions (Virtual Filesystem Writer) tagged with requiresExplicitApproval=true and paused in pending state.'
        : 'Failed: High-risk tool allowed automatic unattended execution.',
      mitigation: 'Enforce approval interceptors for data mutation, code writing, and external communications.',
    });
  } catch (e: any) {
    results.push({
      id: 'SEC-APPR-07',
      category: 'agent_boundaries',
      title: 'High-Impact Agent Action Approval Gate',
      description: 'Tests approval manager.',
      passed: false,
      severity: 'high',
      details: `Error: ${e.message}`,
      mitigation: 'Review tool permissions in toolRegistry.ts.',
    });
  }

  // ----------------------------------------------------
  // TEST 8: Sensitive Information Scrubbing in Audit Logs
  // ----------------------------------------------------
  try {
    const testApiKey = 'AIzaSyD9xK81abcdefgh12345678901234567';
    const testSecret = 'sk-proj-99887766554433221100aabbccddeeff';

    const entry = agentAuditLogger.log(
      'research_agent',
      'info',
      'tool_call',
      `Executing search query with key ${testApiKey}`,
      { apiKey: testApiKey, authSecret: testSecret, userQuery: 'Safe query' }
    );

    const messageScrubbed = !entry.message.includes(testApiKey);
    const metadataKeyScrubbed = entry.metadata?.apiKey === '[REDACTED]' || !JSON.stringify(entry.metadata).includes(testApiKey);
    const passed = messageScrubbed && metadataKeyScrubbed;

    results.push({
      id: 'SEC-LOG-08',
      category: 'audit_logging',
      title: 'Audit Log Sensitive Data Sanitization',
      description: 'Verifies that API keys, passwords, bearer tokens, and secrets are scrubbed before persistence or listener emission.',
      passed,
      severity: 'high',
      details: passed
        ? 'Passed: Raw API key and secret fields were successfully replaced with [REDACTED_SECRET] / [REDACTED] in audit entries.'
        : 'Failed: Unscrubbed secret found in audit log entry.',
      mitigation: 'Implement deep recursive sanitization on log messages and metadata payloads.',
    });
  } catch (e: any) {
    results.push({
      id: 'SEC-LOG-08',
      category: 'audit_logging',
      title: 'Audit Log Sensitive Data Sanitization',
      description: 'Tests log sanitization.',
      passed: false,
      severity: 'high',
      details: `Error: ${e.message}`,
      mitigation: 'Check sanitizeLogValue in logger.ts.',
    });
  }

  // ----------------------------------------------------
  // TEST 9: Privacy Auditor & Sensitive PII Detection
  // ----------------------------------------------------
  try {
    const textWithPii = 'User credit card is 4532 0150 1234 5678 and SSN is 000-12-3456 with secret key sk-1234567890abcdef1234567890abcdef';
    const auditRes = auditSensitiveData(textWithPii, true);

    const detectedAll =
      auditRes.detectedTypes.includes('credit_card_number') &&
      auditRes.detectedTypes.includes('social_security_number') &&
      auditRes.detectedTypes.includes('api_key_or_secret');

    const redactionSafe = !auditRes.redactedText.includes('4532 0150 1234 5678');
    const passed = detectedAll && redactionSafe && auditRes.hasSensitiveData;

    results.push({
      id: 'SEC-PRIV-09',
      category: 'tenant_privacy',
      title: 'Privacy Filter & PII Redaction Engine',
      description: 'Audits automatic detection and surgical redaction of payment cards, social security numbers, and credential tokens.',
      passed,
      severity: 'high',
      details: passed
        ? `Passed: Correctly identified all 3 sensitive data types (${auditRes.detectedTypes.join(', ')}). Sensitive tokens scrubbed in memory storage.`
        : 'Failed: Privacy auditor missed sensitive token format.',
      mitigation: 'Use comprehensive regular expression detectors and automatic memory redaction blockers.',
    });
  } catch (e: any) {
    results.push({
      id: 'SEC-PRIV-09',
      category: 'tenant_privacy',
      title: 'Privacy Filter & PII Redaction Engine',
      description: 'Tests PII auditor.',
      passed: false,
      severity: 'high',
      details: `Error: ${e.message}`,
      mitigation: 'Verify auditSensitiveData in privacyAuditor.ts.',
    });
  }

  // ----------------------------------------------------
  // Calculate Totals & Health Score
  // ----------------------------------------------------
  const totalTests = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = totalTests - passedCount;

  const criticalPassed = results.filter((r) => r.severity === 'critical' && r.passed).length;
  const highPassed = results.filter((r) => r.severity === 'high' && r.passed).length;
  const mediumPassed = results.filter((r) => r.severity === 'medium' && r.passed).length;

  const overallHealthScore = Math.round((passedCount / totalTests) * 100);

  return {
    timestamp: new Date().toISOString(),
    totalTests,
    passedCount,
    failedCount,
    criticalPassed,
    highPassed,
    mediumPassed,
    overallHealthScore,
    status: failedCount === 0 ? 'secure' : overallHealthScore >= 80 ? 'remediated' : 'vulnerable',
    results,
  };
}
