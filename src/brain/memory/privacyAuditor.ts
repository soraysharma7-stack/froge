/**
 * FROGÉ Brain - Privacy Auditor & Sensitive Data Protection
 *
 * Implements:
 * 1. Deep sensitive data detection (API keys, passwords, credit cards, SSNs, health PII)
 * 2. Automatic redaction & storage blockers
 * 3. Clear, calibrated privacy boundary disclosures
 *
 * Privacy Policy Principle:
 * "Never store sensitive information unnecessarily. Never claim false magic guarantees
 * that data is impossible for infrastructure operators to inspect; instead, enforce
 * rigorous cryptographic tenant isolation, auto-scrubbing, and user-controlled deletion."
 */

import {
  SensitiveDataType,
  SensitiveDataAuditResult,
  PrivacyBoundaryDisclosure,
} from './types';

// Regular expressions for sensitive data patterns
const SENSITIVE_PATTERNS: Array<{
  type: SensitiveDataType;
  regex: RegExp;
  description: string;
}> = [
  {
    type: 'api_key_or_secret',
    regex: /\b(?:AIza[0-9A-Za-z-_]{20,50}|sk-[a-zA-Z0-9_\-]{20,80}|ghp_[a-zA-Z0-9]{36}|xox[baprs]-[0-9a-zA-Z]{10,48}|froge_local_sk_[a-zA-Z0-9_]{10,48}|Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*)\b/gi,
    description: 'API Key, Secret Token or OAuth Bearer credential',
  },
  {
    type: 'password_or_token',
    regex: /(?:password|passwd|pwd|secret|auth_token)\s*[:=]\s*["']?([^\s"',;]+)["']?/gi,
    description: 'Plaintext password or authorization token assignment',
  },
  {
    type: 'credit_card_number',
    // 13-19 digits with optional spaces or dashes (Visa, MC, Amex, Discover, etc.)
    regex: /(?:\b4[0-9]{3}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}\b|\b4[0-9]{12}(?:[0-9]{3})?\b|\b5[1-5][0-9]{2}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}\b|\b3[47][0-9]{2}[- ]?[0-9]{6}[- ]?[0-9]{5}\b|\b6011[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}\b|\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b)/g,
    description: 'Payment card number (Visa, MC, Amex, Discover, JCB)',
  },
  {
    type: 'social_security_number',
    // US SSN format: 3 digits, dash/space, 2 digits, dash/space, 4 digits
    regex: /\b\d{3}[- ]\d{2}[- ]\d{4}\b/g,
    description: 'Government National Identification / Social Security Number',
  },
  {
    type: 'private_health_info',
    regex: /\b(?:medical record number|mrn|patient id|diagnosis code|icd-10|prescription number)\s*[:#=]\s*([A-Za-z0-9\-]+)\b/gi,
    description: 'Protected Health Information or Patient Record Identifier',
  },
  {
    type: 'high_entropy_token',
    regex: /\b[a-fA-F0-9]{32,64}\b|\beyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\b/g,
    description: 'High-entropy cryptographic hash or JSON Web Token (JWT)',
  },
];

/**
 * Audit and sanitize content before memory persistence
 */
export function auditSensitiveData(
  text: string,
  strictRejection = false
): SensitiveDataAuditResult {
  if (!text || typeof text !== 'string') {
    return {
      hasSensitiveData: false,
      detectedTypes: [],
      blocked: false,
      redactedText: text || '',
      auditExplanation: 'Content empty or non-string format.',
    };
  }

  const detectedTypes: SensitiveDataType[] = [];
  let redacted = text;
  const explanationParts: string[] = [];

  for (const pattern of SENSITIVE_PATTERNS) {
    const matches = text.match(pattern.regex);
    if (matches && matches.length > 0) {
      if (!detectedTypes.includes(pattern.type)) {
        detectedTypes.push(pattern.type);
      }
      explanationParts.push(`Detected ${matches.length} instance(s) of ${pattern.description}`);

      // Perform surgical redaction
      redacted = redacted.replace(pattern.regex, (match) => {
        const prefix = match.slice(0, 2);
        return `[REDACTED_${pattern.type.toUpperCase()}:${prefix}***]`;
      });
    }
  }

  const hasSensitiveData = detectedTypes.length > 0;
  const blocked = hasSensitiveData && strictRejection;

  return {
    hasSensitiveData,
    detectedTypes,
    blocked,
    redactedText: redacted,
    auditExplanation: hasSensitiveData
      ? `Privacy Filter Triggered: ${explanationParts.join('; ')}`
      : 'Clean: No sensitive PII, credentials, or protected financial tokens detected.',
  };
}

/**
 * Standard Privacy Boundary & Operator Disclosure Definition
 *
 * Explicitly states real security boundaries without deceptive "unhackable" claims.
 */
export const FROGE_PRIVACY_DISCLOSURE: PrivacyBoundaryDisclosure = {
  isolationLevel: 'cryptographic_user_namespace',
  operatorAccessModel: 'system_operators_retain_infrastructure_access',
  dataStorageLocation: 'client_local_and_tenant_partitioned_backend',
  encryptionAtRest: true,
  encryptionInTransit: true,
  notice:
    'FROGÉ Memory enforces strict per-user cryptographic isolation across all memory tiers (Conversation, Personalization, App/Data). Data belonging to User A is never retrievable or indexed by queries from User B. However, as with standard secure cloud computing infrastructure, system hosting administrators retain underlying server operating capability; we do not make false claims of zero-knowledge immunity from infrastructure maintenance.',
};
