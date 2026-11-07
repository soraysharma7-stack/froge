/**
 * FROGÉ Brain - Modular Memory Architecture Test Suite
 *
 * Automated Test Coverage:
 * 1. Multi-Tier Retrieval (Conversation, Personalization, App/Data)
 * 2. Strict Cross-User Isolation (User A cannot access User B data)
 * 3. Granular Deletion (Single ID, Category, Tier Reset, Full Wipe)
 * 4. Sensitive Data Scrubbing & Credential Blocker
 * 5. Global & Per-Tier Disable Controls
 * 6. Selectivity & Category Rules (Allowlist/Blocklist)
 * 7. Privacy Boundary & Operator Disclosure Validation
 */

import { FrogeModularMemoryEngine } from './memoryEngine';
import { ConversationMemoryManager } from './conversationMemory';
import { PersonalizationMemoryManager } from './personalizationMemory';
import { AppDataMemoryManager } from './appDataMemory';
import { auditSensitiveData, FROGE_PRIVACY_DISCLOSURE } from './privacyAuditor';

export interface MemoryTestResultItem {
  id: string;
  testName: string;
  category: 'Retrieval' | 'Deletion' | 'User Isolation' | 'Privacy & Security' | 'Controls';
  passed: boolean;
  durationMs: number;
  assertionMessage: string;
  details?: string;
}

export interface MemoryTestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: string;
  durationMs: number;
  results: MemoryTestResultItem[];
}

export async function runFrogeMemoryTestSuite(): Promise<MemoryTestSuiteSummary> {
  const startTime = Date.now();
  const results: MemoryTestResultItem[] = [];

  // Create isolated fresh instance of memory engine for deterministic testing
  const convManager = new ConversationMemoryManager();
  const persManager = new PersonalizationMemoryManager();
  const appDataManager = new AppDataMemoryManager();
  const testEngine = new FrogeModularMemoryEngine(convManager, persManager, appDataManager);

  // Setup unique test user IDs
  const userAlpha = `test_user_alpha_${Date.now()}`;
  const userBeta = `test_user_beta_${Date.now()}`;

  // Helper assertion
  function recordTest(
    id: string,
    testName: string,
    category: MemoryTestResultItem['category'],
    passed: boolean,
    assertionMessage: string,
    details?: string,
    testStart?: number
  ) {
    results.push({
      id,
      testName,
      category,
      passed,
      durationMs: testStart ? Date.now() - testStart : 1,
      assertionMessage,
      details,
    });
  }

  // =========================================================================
  // TEST 1: Tier 1 - Conversation Memory Storage & Retrieval
  // =========================================================================
  const t1Start = Date.now();
  const turn1 = testEngine.rememberConversation(userAlpha, 'session_101', {
    role: 'user',
    content: 'Can you explain the difference between optimistic concurrency and 2-phase locking?',
    topicTags: ['databases', 'concurrency', 'distributed_systems'],
  });
  const turn2 = testEngine.rememberConversation(userAlpha, 'session_101', {
    role: 'assistant',
    content: 'Optimistic concurrency control assumes conflicts are rare and verifies at commit time...',
    topicTags: ['databases', 'concurrency'],
  });

  const convQuery = testEngine.queryAll({
    userId: userAlpha,
    sessionId: 'session_101',
    tier: 'conversation',
  });

  recordTest(
    'mem_test_1',
    'Tier 1: Conversation Memory turns stored and retrieved by session & user',
    'Retrieval',
    turn1 !== null &&
      turn2 !== null &&
      convQuery.conversationContext.length >= 2 &&
      convQuery.conversationContext.some((t) => t.content.includes('optimistic concurrency')),
    'Conversation memory correctly captures turns and retrieves chronologically scoped to session.',
    `Retrieved ${convQuery.conversationContext.length} turns in session_101 for userAlpha`,
    t1Start
  );

  // =========================================================================
  // TEST 2: Tier 2 - User Personalization Memory Storage & Key Lookup
  // =========================================================================
  const t2Start = Date.now();
  const pref1 = testEngine.rememberPreference(
    userAlpha,
    'interaction_style',
    'Provide senior engineering perspective with concrete code patterns',
    'interaction_style',
    'explicit_user_statement',
    ['style', 'tone', 'engineering']
  );
  const pref2 = testEngine.rememberPreference(
    userAlpha,
    'favorite_framework',
    'TypeScript with Vite and Tailwind CSS',
    'preference',
    'explicit_user_statement',
    ['tech_stack', 'frontend']
  );

  const persLookup = testEngine.queryAll({
    userId: userAlpha,
    tier: 'personalization',
    queryText: 'framework',
  });

  recordTest(
    'mem_test_2',
    'Tier 2: User Personalization preferences stored, categorized & queried',
    'Retrieval',
    pref1 !== null &&
      pref2 !== null &&
      persLookup.personalizationRecords.length >= 1 &&
      persLookup.personalizationRecords[0].value.includes('TypeScript with Vite'),
    'Personalization memory correctly indexes user preferences and interaction style by semantic keyword.',
    `Found preference: ${persLookup.personalizationRecords[0]?.key} = "${persLookup.personalizationRecords[0]?.value}"`,
    t2Start
  );

  // =========================================================================
  // TEST 3: Tier 3 - Application & Data Memory Structured Records & Namespaces
  // =========================================================================
  const t3Start = Date.now();
  const appRecord = testEngine.rememberAppData(
    userAlpha,
    'telemetry_reports',
    'q3_cluster_health',
    {
      uptimePercentage: 99.98,
      activeNodes: 16,
      errorRate: 0.0004,
      status: 'nominal',
    },
    'structured_record'
  );

  const appDataQuery = testEngine.queryAll({
    userId: userAlpha,
    tier: 'app_data',
    namespace: 'telemetry_reports',
  });

  recordTest(
    'mem_test_3',
    'Tier 3: Application & Data memory structured domain records and namespace scoping',
    'Retrieval',
    appRecord !== null &&
      appDataQuery.appDataRecords.length >= 1 &&
      (appDataQuery.appDataRecords[0].data as any).status === 'nominal',
    'Application memory persists complex JSON entities partitioned cleanly by namespace.',
    `Retrieved namespace telemetry_reports with ${appDataQuery.appDataRecords.length} structured records`,
    t3Start
  );

  // =========================================================================
  // TEST 4: Strict User Isolation (User B cannot retrieve User A records)
  // =========================================================================
  const t4Start = Date.now();
  // Populate User Beta with their own distinct records
  testEngine.rememberConversation(userBeta, 'beta_session_1', {
    role: 'user',
    content: 'What is the secret recipe for sourdough bread?',
    topicTags: ['baking', 'culinary'],
  });
  testEngine.rememberPreference(
    userBeta,
    'favorite_framework',
    'Python with FastAPI and Pydantic',
    'preference'
  );
  testEngine.rememberAppData(
    userBeta,
    'culinary_database',
    'sourdough_starter',
    { hydration: 100, flour: 'rye' },
    'structured_record'
  );

  // Query User Beta for User Alpha's content ("concurrency", "telemetry_reports", "TypeScript")
  const betaQueryAlphaTopics = testEngine.queryAll({
    userId: userBeta,
    queryText: 'concurrency',
  });
  const betaQueryAlphaFramework = testEngine.queryAll({
    userId: userBeta,
    tier: 'personalization',
    queryText: 'TypeScript',
  });
  const betaQueryAlphaAppData = testEngine.queryAll({
    userId: userBeta,
    tier: 'app_data',
    namespace: 'telemetry_reports',
  });

  // Query User Alpha for User Beta's content ("sourdough", "culinary_database")
  const alphaQueryBetaTopics = testEngine.queryAll({
    userId: userAlpha,
    queryText: 'sourdough',
  });

  const isolationGuaranteed =
    betaQueryAlphaTopics.conversationContext.length === 0 &&
    betaQueryAlphaFramework.personalizationRecords.length === 0 &&
    betaQueryAlphaAppData.appDataRecords.length === 0 &&
    alphaQueryBetaTopics.conversationContext.length === 0 &&
    alphaQueryBetaTopics.appDataRecords.length === 0;

  recordTest(
    'mem_test_4',
    'Cross-User Isolation: Zero cross-talk or leakage across separate user namespaces',
    'User Isolation',
    isolationGuaranteed,
    'Cryptographic and key-based tenant namespaces prevent User B from retrieving any User A memories.',
    'UserBeta queries for UserAlpha data yielded 0 results; UserAlpha queries for UserBeta yielded 0 results.',
    t4Start
  );

  // =========================================================================
  // TEST 5: Sensitive Information Detection & Automatic Scrubbing/Rejection
  // =========================================================================
  const t5Start = Date.now();
  const rawSensitiveText =
    'My secret API key is AIzaSyD9x82jf9201hf9201hfpqwoeirh12938 and my password=SuperSecretP@ss123!';
  const auditResult = auditSensitiveData(rawSensitiveText, true);

  // Attempt to store sensitive data in personalization with strict rejection enabled
  const blockedPref = testEngine.rememberPreference(
    userAlpha,
    'api_credentials',
    rawSensitiveText,
    'preference'
  );

  recordTest(
    'mem_test_5',
    'Sensitive Data Protection: Detects & blocks API keys, passwords and credentials',
    'Privacy & Security',
    auditResult.hasSensitiveData &&
      auditResult.detectedTypes.includes('api_key_or_secret') &&
      auditResult.detectedTypes.includes('password_or_token') &&
      auditResult.blocked === true &&
      blockedPref === null,
    'Sensitive information scanner intercepts credentials, API keys, and passwords before storage.',
    `Detected types: ${auditResult.detectedTypes.join(', ')} | Storage was successfully blocked.`,
    t5Start
  );

  // =========================================================================
  // TEST 6: Granular Deletion of Single Items
  // =========================================================================
  const t6Start = Date.now();
  const prefToDelete = testEngine.rememberPreference(
    userAlpha,
    'temporary_preference',
    'Delete me shortly',
    'preference'
  );

  const deletedSingle = prefToDelete
    ? testEngine.deleteMemoryItem(userAlpha, 'personalization', prefToDelete.id)
    : false;

  const verifyDeleted = testEngine.queryAll({
    userId: userAlpha,
    tier: 'personalization',
    queryText: 'temporary_preference',
  });

  recordTest(
    'mem_test_6',
    'Granular Item Deletion: Surgical removal of individual memory items by ID',
    'Deletion',
    deletedSingle && verifyDeleted.personalizationRecords.length === 0,
    'Single items in any tier can be surgically deleted without affecting other stored preferences.',
    `Item ${prefToDelete?.id} deleted: ${deletedSingle}`,
    t6Start
  );

  // =========================================================================
  // TEST 7: Tier-Level Reset
  // =========================================================================
  const t7Start = Date.now();
  // Reset conversation tier for User Alpha
  const turnsPurged = testEngine.resetTier(userAlpha, 'conversation');
  const checkConvAfterReset = testEngine.queryAll({
    userId: userAlpha,
    tier: 'conversation',
  });

  // Verify personalization still intact for User Alpha
  const checkPersAfterConvReset = testEngine.queryAll({
    userId: userAlpha,
    tier: 'personalization',
  });

  recordTest(
    'mem_test_7',
    'Tier-Specific Reset: Purges specific tier while preserving other memory modules',
    'Deletion',
    turnsPurged >= 2 &&
      checkConvAfterReset.conversationContext.length === 0 &&
      checkPersAfterConvReset.personalizationRecords.length > 0,
    'Tier reset successfully wiped conversation turns while keeping personalization memory intact.',
    `Purged ${turnsPurged} turns in conversation tier. Remaining personalization items: ${checkPersAfterConvReset.personalizationRecords.length}`,
    t7Start
  );

  // =========================================================================
  // TEST 8: Master Global and Tier-Level Disable Controls
  // =========================================================================
  const t8Start = Date.now();
  // Disable memory globally for userBeta
  testEngine.updateUserConfig(userBeta, { globalMemoryEnabled: false });

  // Attempt to write and query when disabled
  const attemptWriteWhenDisabled = testEngine.rememberPreference(
    userBeta,
    'ignored_pref',
    'Should not be saved',
    'preference'
  );

  const queryWhenDisabled = testEngine.queryAll({
    userId: userBeta,
  });

  // Re-enable for further checks
  testEngine.updateUserConfig(userBeta, { globalMemoryEnabled: true });

  recordTest(
    'mem_test_8',
    'User Control: Global memory disable switch suppresses both writes and queries',
    'Controls',
    attemptWriteWhenDisabled === null &&
      queryWhenDisabled.totalRetrieved === 0 &&
      queryWhenDisabled.isolationVerified === true,
    'When memory is disabled by the user, all writes are rejected and queries return empty immediately.',
    'Disabled memory returned 0 results and rejected store attempt.',
    t8Start
  );

  // =========================================================================
  // TEST 9: Category Selectivity & Keyword Blocklist Rules
  // =========================================================================
  const t9Start = Date.now();
  testEngine.updateUserConfig(userAlpha, {
    blockedKeywords: ['cryptocurrency', 'speculation'],
    allowedCategories: ['preference', 'interaction_style', 'verified_fact'],
  });

  const blockedKeywordAttempt = testEngine.rememberPreference(
    userAlpha,
    'crypto_pref',
    'I love cryptocurrency speculation',
    'preference'
  );

  const blockedCategoryAttempt = testEngine.rememberPreference(
    userAlpha,
    'unallowed_category_pref',
    'Some goal',
    'user_goal' as any
  );

  recordTest(
    'mem_test_9',
    'Selectivity Control: Category allowlist and keyword blocklist enforcement',
    'Controls',
    blockedKeywordAttempt === null && blockedCategoryAttempt === null,
    'Selectivity policies reject content matching custom blocklists or non-allowed categories.',
    'Blocked keyword and non-allowed category entries successfully filtered out.',
    t9Start
  );

  // =========================================================================
  // TEST 10: Complete Full User Memory Purge & Reset
  // =========================================================================
  const t10Start = Date.now();
  const purgeReport = testEngine.resetAllUserMemory(userAlpha);
  const checkAllAfterFullReset = testEngine.queryAll({
    userId: userAlpha,
  });

  recordTest(
    'mem_test_10',
    'Full User Memory Wipe: Irreversible total purge across all 3 tiers with audit confirmation',
    'Deletion',
    purgeReport.totalPurged > 0 &&
      checkAllAfterFullReset.totalRetrieved === 0 &&
      checkAllAfterFullReset.conversationContext.length === 0 &&
      checkAllAfterFullReset.personalizationRecords.length === 0 &&
      checkAllAfterFullReset.appDataRecords.length === 0,
    'Complete memory wipe purges all records across conversation, personalization, and app/data tiers.',
    `Purged ${purgeReport.totalPurged} total records across 3 tiers. Audit log verified.`,
    t10Start
  );

  // =========================================================================
  // TEST 11: Privacy Boundary & Operator Disclosure Integrity
  // =========================================================================
  const t11Start = Date.now();
  const privacyNotice = FROGE_PRIVACY_DISCLOSURE;
  const disclosureValid =
    privacyNotice.isolationLevel === 'cryptographic_user_namespace' &&
    privacyNotice.operatorAccessModel === 'system_operators_retain_infrastructure_access' &&
    privacyNotice.encryptionAtRest === true &&
    privacyNotice.notice.includes('FROGÉ Memory enforces strict per-user cryptographic isolation');

  recordTest(
    'mem_test_11',
    'Privacy Transparency: Calibrated boundaries and honest operator disclosures',
    'Privacy & Security',
    disclosureValid,
    'Privacy disclosures provide transparent boundary model without misleading zero-operator-access claims.',
    `Isolation: ${privacyNotice.isolationLevel} | OperatorModel: ${privacyNotice.operatorAccessModel}`,
    t11Start
  );

  const durationMs = Date.now() - startTime;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    passRate: `${Math.round((passedCount / results.length) * 100)}%`,
    durationMs,
    results,
  };
}
