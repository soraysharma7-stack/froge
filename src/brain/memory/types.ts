/**
 * FROGÉ Brain - Modular Memory Architecture Types
 *
 * 3 Separated Memory Tiers:
 * 1. Conversation Memory (dialogue turns, sliding window context, session summaries, topic threads)
 * 2. User Personalization Memory (user preferences, interaction style, user profile facts, explicit instructions)
 * 3. Application / Data Memory (structured domain entities, data caches, saved artifacts, knowledge facts)
 *
 * Built with:
 * - Strict User & Tenant Isolation
 * - Sensitive Information Scrubbing & Detection
 * - Calibrated Privacy Boundaries & Operator Disclosures
 * - Granular User Control (Disable, Delete, Reset, Selectivity Rules)
 */

export type MemoryTier = 'conversation' | 'personalization' | 'app_data';

export type PersonalizationCategory =
  | 'preference'
  | 'interaction_style'
  | 'user_goal'
  | 'expertise_level'
  | 'custom_instruction'
  | 'profile_fact'
  | 'domain_constraint';

export type AppDataCategory =
  | 'domain_entity'
  | 'structured_record'
  | 'data_cache'
  | 'artifact_metadata'
  | 'verified_fact'
  | 'analytics_metric';

export type ConversationRole = 'user' | 'assistant' | 'system' | 'tool';

/**
 * 1. Conversation Memory Item
 */
export interface ConversationTurnItem {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: number;
  role: ConversationRole;
  content: string;
  mode?: string;
  tokensCount?: number;
  topicTags?: string[];
  sentiment?: string;
  isSummary?: boolean;
}

export interface ConversationSessionState {
  sessionId: string;
  userId: string;
  startedAt: number;
  lastActiveAt: number;
  totalTurns: number;
  recentTurns: ConversationTurnItem[];
  summaryContext?: string;
  dominantTopics: string[];
}

/**
 * 2. User Personalization Memory Item
 */
export interface PersonalizationMemoryItem {
  id: string;
  userId: string;
  timestamp: number;
  updatedAt: number;
  category: PersonalizationCategory;
  key: string;
  value: string;
  confidence: number; // 0.0 to 1.0
  source: 'explicit_user_statement' | 'inferred_interaction' | 'system_default';
  isPinned?: boolean;
  ttlSeconds?: number; // Optional expiration
  tags?: string[];
}

/**
 * 3. Application / Data Memory Item
 */
export interface AppDataMemoryItem {
  id: string;
  userId: string;
  namespace: string; // E.g., 'tasks', 'research_cache', 'code_artifacts', 'reports'
  category: AppDataCategory;
  key: string;
  data: Record<string, any> | string;
  schemaVersion?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  accessCount: number;
  isImmutable?: boolean;
}

/**
 * Privacy & Sensitive Data Classifications
 */
export type SensitiveDataType =
  | 'api_key_or_secret'
  | 'password_or_token'
  | 'credit_card_number'
  | 'social_security_number'
  | 'private_health_info'
  | 'phone_number_pii'
  | 'high_entropy_token';

export interface SensitiveDataAuditResult {
  hasSensitiveData: boolean;
  detectedTypes: SensitiveDataType[];
  blocked: boolean;
  redactedText: string;
  auditExplanation: string;
}

/**
 * User Memory Preferences & Privacy Controls
 */
export interface UserMemoryControlConfig {
  userId: string;
  // Master switch
  globalMemoryEnabled: boolean;
  // Tier switches
  conversationMemoryEnabled: boolean;
  personalizationMemoryEnabled: boolean;
  appDataMemoryEnabled: boolean;
  // Selective Capture Policies
  autoCapturePreferences: boolean;
  autoSummarizeConversations: boolean;
  allowedCategories: string[];
  blockedKeywords: string[];
  // Retention Rules
  conversationRetentionDays: number;
  appDataRetentionDays: number;
  // Privacy & Redaction
  strictPiiRedaction: boolean;
  rejectSensitiveUploads: boolean;
  // Transparency Disclosure
  operatorAccessDisclaimerAcknowledged: boolean;
}

/**
 * Privacy Boundary & Disclosure Specification
 */
export interface PrivacyBoundaryDisclosure {
  isolationLevel: 'cryptographic_user_namespace' | 'tenant_partitioned' | 'local_sandbox';
  operatorAccessModel: 'system_operators_retain_infrastructure_access' | 'client_side_zero_knowledge';
  notice: string;
  dataStorageLocation: 'client_local_and_tenant_partitioned_backend';
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
}

/**
 * Memory Retrieval Query Parameters
 */
export interface MemoryQueryParams {
  userId: string;
  queryText?: string;
  tier?: MemoryTier;
  categories?: string[];
  namespace?: string;
  sessionId?: string;
  limit?: number;
  minRelevanceScore?: number;
  includeRecentTurnsOnly?: boolean;
}

/**
 * Unified Memory Query Result
 */
export interface UnifiedMemoryQueryResult {
  userId: string;
  query: string;
  conversationContext: ConversationTurnItem[];
  sessionSummary?: string;
  personalizationRecords: PersonalizationMemoryItem[];
  appDataRecords: AppDataMemoryItem[];
  totalRetrieved: number;
  isolationVerified: boolean;
  durationMs: number;
}

/**
 * Memory Audit Log Entry
 */
export interface MemoryAuditLog {
  id: string;
  userId: string;
  timestamp: number;
  action: 'store' | 'query' | 'delete' | 'reset' | 'disable' | 'enable' | 'redact_blocked';
  tier: MemoryTier | 'all';
  targetKeyOrId?: string;
  status: 'success' | 'blocked_by_policy' | 'not_found';
  details: string;
}
