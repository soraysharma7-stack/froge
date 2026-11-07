/**
 * FROGÉ AI — GPT-2 50,257 Token Vocabulary & Subword Engine Service
 * Backed by OpenAI GPT-2 byte-level Byte-Pair Encoding (BPE)
 * Canonical reference: /public/assets/aistudio/gpt2_vocabulary_50257_tokens_0eebe765.pdf
 */

import { encode as gpt2Encode, decode as gpt2Decode } from 'gpt-tokenizer/model/gpt-2';

export const GPT2_VOCAB_PDF_URL = '/assets/aistudio/gpt2_vocabulary_50257_tokens_0eebe765.pdf';
export const GPT2_TOTAL_TOKENS = 50257;
export const GPT2_MAX_TOKEN_ID = 50256;
export const GPT2_SPECIAL_TOKEN_ID = 50256;
export const GPT2_SPECIAL_TOKEN_STR = '<|endoftext|>';
export const GPT2_TOKENS_PER_PAGE = 320;
export const GPT2_TOTAL_PAGES = 158;

export interface Gpt2TokenItem {
  index: number;
  id: number;
  text: string;
  display: string;
  bytes: number[];
  hex: string;
  vocabPage: number;
  pdfPage: number;
  isLeadingSpace: boolean;
  isSpecial: boolean;
}

export interface Gpt2TokenLookupResult {
  id: number;
  text: string;
  display: string;
  bytes: number[];
  hex: string;
  vocabPage: number;
  pdfPage: number;
  isSpecial: boolean;
  category: 'special' | 'byte' | 'word' | 'subword' | 'punctuation' | 'whitespace';
}

export interface Gpt2AnalysisMetrics {
  text: string;
  charCount: number;
  byteCount: number;
  tokenCount: number;
  wordCount: number;
  compressionRatio: number; // bytes per token or chars per token
  tokensPerWord: number;
  tokens: Gpt2TokenItem[];
}

export interface Gpt2PageInfo {
  vocabPage: number;
  pdfPage: number;
  startId: number;
  endId: number;
  tokenCount: number;
}

/**
 * Calculates vocabulary page (1-158) and PDF document page (2-159) for any token ID.
 */
export function getVocabPageForId(id: number): Gpt2PageInfo {
  const boundedId = Math.max(0, Math.min(GPT2_MAX_TOKEN_ID, Math.floor(id)));
  const vocabPage = Math.floor(boundedId / GPT2_TOKENS_PER_PAGE) + 1;
  const pdfPage = vocabPage + 1; // Page 1 is the cover/notation sheet
  const startId = (vocabPage - 1) * GPT2_TOKENS_PER_PAGE;
  const endId = Math.min(GPT2_MAX_TOKEN_ID, startId + GPT2_TOKENS_PER_PAGE - 1);
  return {
    vocabPage,
    pdfPage,
    startId,
    endId,
    tokenCount: endId - startId + 1,
  };
}

/**
 * Formats a token string using official guide notation:
 * ␣ = leading/embedded space character (U+0120)
 * \n, \t = newline / tab
 * \xNN = non-printable byte
 */
export function formatTokenDisplay(rawText: string, id?: number): string {
  if (id === GPT2_SPECIAL_TOKEN_ID || rawText === GPT2_SPECIAL_TOKEN_STR) {
    return GPT2_SPECIAL_TOKEN_STR;
  }
  let display = '';
  for (let i = 0; i < rawText.length; i++) {
    const char = rawText[i];
    if (char === ' ') {
      display += '␣';
    } else if (char === '\n') {
      display += '\\n';
    } else if (char === '\t') {
      display += '\\t';
    } else if (char === '\r') {
      display += '\\r';
    } else {
      const code = char.charCodeAt(0);
      if (code < 32 || code === 127) {
        display += `\\x${code.toString(16).padStart(2, '0')}`;
      } else {
        display += char;
      }
    }
  }
  return display || '␣';
}

/**
 * Encodes text into a detailed array of GPT-2 tokens.
 */
export function encodeToGpt2Tokens(text: string): Gpt2TokenItem[] {
  if (!text) return [];

  // Allow <|endoftext|> as a special token
  const tokenIds = gpt2Encode(text, { allowedSpecial: new Set([GPT2_SPECIAL_TOKEN_STR]) });

  return tokenIds.map((id, index) => {
    let tokenStr = '';
    try {
      tokenStr = gpt2Decode([id]);
    } catch {
      tokenStr = `[Token ${id}]`;
    }

    const pageInfo = getVocabPageForId(id);
    const buffer = Buffer.from(tokenStr, 'utf-8');
    const bytes = Array.from(buffer);
    const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join(' ');
    const isLeadingSpace = tokenStr.startsWith(' ');
    const isSpecial = id === GPT2_SPECIAL_TOKEN_ID;
    const display = formatTokenDisplay(tokenStr, id);

    return {
      index,
      id,
      text: tokenStr,
      display,
      bytes,
      hex,
      vocabPage: pageInfo.vocabPage,
      pdfPage: pageInfo.pdfPage,
      isLeadingSpace,
      isSpecial,
    };
  });
}

/**
 * Decodes an array of token IDs back into string.
 */
export function decodeGpt2TokenIds(ids: number[]): string {
  if (!ids || ids.length === 0) return '';
  try {
    return gpt2Decode(ids);
  } catch {
    return ids.map(id => {
      try {
        return gpt2Decode([id]);
      } catch {
        return '';
      }
    }).join('');
  }
}

/**
 * Analyzes text tokenization metrics.
 */
export function analyzeTextTokenization(text: string): Gpt2AnalysisMetrics {
  const tokens = encodeToGpt2Tokens(text);
  const charCount = text.length;
  const byteCount = Buffer.byteLength(text, 'utf-8');
  const tokenCount = tokens.length;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length || (text.trim() ? 1 : 0);

  const compressionRatio = tokenCount > 0 ? Number((charCount / tokenCount).toFixed(2)) : 0;
  const tokensPerWord = wordCount > 0 ? Number((tokenCount / wordCount).toFixed(2)) : 0;

  return {
    text,
    charCount,
    byteCount,
    tokenCount,
    wordCount,
    compressionRatio,
    tokensPerWord,
    tokens,
  };
}

/**
 * Categorizes a token based on its ID and content.
 */
function categorizeToken(id: number, text: string): Gpt2TokenLookupResult['category'] {
  if (id === GPT2_SPECIAL_TOKEN_ID) return 'special';
  if (id < 256) return 'byte';
  if (/^\s+$/.test(text)) return 'whitespace';
  if (/^[^\w\s]+$/.test(text)) return 'punctuation';
  if (/^\s?[a-zA-Z0-9]+$/.test(text)) return 'word';
  return 'subword';
}

/**
 * Single token lookup by ID.
 */
export function lookupTokenById(id: number): Gpt2TokenLookupResult | null {
  if (isNaN(id) || id < 0 || id > GPT2_MAX_TOKEN_ID) return null;
  const pageInfo = getVocabPageForId(id);
  let text = '';
  try {
    text = gpt2Decode([id]);
  } catch {
    text = id === GPT2_SPECIAL_TOKEN_ID ? GPT2_SPECIAL_TOKEN_STR : `[Token ${id}]`;
  }
  const buffer = Buffer.from(text, 'utf-8');
  const bytes = Array.from(buffer);
  const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join(' ');

  return {
    id,
    text,
    display: formatTokenDisplay(text, id),
    bytes,
    hex,
    vocabPage: pageInfo.vocabPage,
    pdfPage: pageInfo.pdfPage,
    isSpecial: id === GPT2_SPECIAL_TOKEN_ID,
    category: categorizeToken(id, text),
  };
}

/**
 * Search vocabulary by ID or string match.
 */
export function searchGpt2Vocabulary(query: string, limit: number = 50): Gpt2TokenLookupResult[] {
  if (!query || !query.trim()) {
    // Return sample landmark tokens
    return [
      0, 220, 256, 262, 530, 995, 1169, 15496, 50256
    ].map(id => lookupTokenById(id)!).filter(Boolean);
  }

  const trimmed = query.trim();
  const results: Gpt2TokenLookupResult[] = [];

  // Check if query is numeric ID
  if (/^\d+$/.test(trimmed)) {
    const id = parseInt(trimmed, 10);
    const item = lookupTokenById(id);
    if (item) results.push(item);
    // Also include adjacent IDs for context
    for (let offset = 1; offset <= 3; offset++) {
      if (id - offset >= 0) {
        const prev = lookupTokenById(id - offset);
        if (prev) results.unshift(prev);
      }
      if (id + offset <= GPT2_MAX_TOKEN_ID) {
        const next = lookupTokenById(id + offset);
        if (next) results.push(next);
      }
    }
    return results;
  }

  // Exact encoded token lookup
  try {
    const exactIds = gpt2Encode(trimmed, { allowedSpecial: new Set([GPT2_SPECIAL_TOKEN_STR]) });
    for (const eid of exactIds) {
      const match = lookupTokenById(eid);
      if (match && !results.some(r => r.id === match.id)) {
        results.push(match);
      }
    }
  } catch {
    // Ignore encoding errors
  }

  // Also search leading space variation (e.g. " the" vs "the")
  try {
    const spaceVariantIds = gpt2Encode(' ' + trimmed, { allowedSpecial: new Set([GPT2_SPECIAL_TOKEN_STR]) });
    for (const svid of spaceVariantIds) {
      const match = lookupTokenById(svid);
      if (match && !results.some(r => r.id === match.id)) {
        results.push(match);
      }
    }
  } catch {
    // Ignore
  }

  // Linear scan for matches around common and sample tokens
  const queryLower = trimmed.toLowerCase();
  const sampledIndices = [
    // Landmark and common token IDs
    ...Array.from({ length: 300 }, (_, i) => i),
    ...Array.from({ length: 500 }, (_, i) => 256 + i),
    ...Array.from({ length: 500 }, (_, i) => 1000 + i),
    ...Array.from({ length: 300 }, (_, i) => 5000 + i),
    ...Array.from({ length: 300 }, (_, i) => 15000 + i),
    ...Array.from({ length: 300 }, (_, i) => 25000 + i),
    ...Array.from({ length: 300 }, (_, i) => 35000 + i),
    ...Array.from({ length: 300 }, (_, i) => 50000 + i),
    50256
  ];

  for (const id of sampledIndices) {
    if (results.length >= limit) break;
    if (id < 0 || id > GPT2_MAX_TOKEN_ID) continue;
    if (results.some(r => r.id === id)) continue;
    try {
      const txt = gpt2Decode([id]);
      if (txt.toLowerCase().includes(queryLower)) {
        const item = lookupTokenById(id);
        if (item) results.push(item);
      }
    } catch {
      // Ignore
    }
  }

  return results;
}

/**
 * Curated preset examples for exploration in the UI.
 */
export const GPT2_CURATED_PRESETS = [
  {
    title: 'Standard Greeting',
    category: 'Natural Language',
    text: 'Hello world, welcome to FROGE AI!',
    description: 'Notice how spaces attach to following words (" world", " welcome").',
  },
  {
    title: 'Space & Capitalization Nuances',
    category: 'Subword Nuance',
    text: 'The the  the   the The THE',
    description: 'Demonstrates how capitalization and space counts produce completely different token IDs.',
  },
  {
    title: 'Python Function & Code',
    category: 'Code & Syntax',
    text: 'def sum_numbers(numbers):\n    return sum(numbers)\n\nprint("Result:", sum_numbers([2, 4, 6]))',
    description: 'Shows indentation, newlines, brackets, and code tokens.',
  },
  {
    title: 'Special Token & End of Sequence',
    category: 'Architecture',
    text: 'Prompt completed. <|endoftext|>',
    description: 'Token ID 50256 marks sequence boundaries in GPT architectures.',
  },
  {
    title: 'Multilingual Devanagari Hindi',
    category: 'Byte-level BPE',
    text: 'नमस्ते दुनिया! यह फ्रोगे एआई है।',
    description: 'Demonstrates UTF-8 multi-byte sequence tokenization into multiple byte-level tokens.',
  },
  {
    title: 'Punctuation & Symbols',
    category: 'Symbols',
    text: '{"status": 200, "success": true, "tokens": 50257}',
    description: 'JSON formatting with braces, colons, quotes, and commas.',
  },
];
