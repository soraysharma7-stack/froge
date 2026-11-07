/**
 * FROGÉ Brain - Web Search & Cognitive Synthesis Engine
 *
 * Core Philosophy: "See, Think, Understand, Then Answer"
 * 1. SEE: Extract actual websites, subjects, and empirical snippets.
 * 2. THINK: Reason through the real retrieved evidence without fake boilerplate.
 * 3. UNDERSTAND: Identify the exact question the user asked.
 * 4. THEN GIVE ANSWER: Deliver a factual, grounded answer based strictly on the retrieved websites.
 */

import { WebSearchResult } from '../../types';
import { cleanSearchPrompt } from './webSearchEngine';

export interface WebSearchSynthesisOptions {
  query: string;
  sources: WebSearchResult[];
  isCurrentNewsOrEvent?: boolean;
}

function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function synthesizeWebSearchResponse(options: WebSearchSynthesisOptions): string {
  const { query, sources } = options;
  const cleanedQuery = cleanSearchPrompt(query) || query;
  const topic = cleanedQuery.trim();

  if (!sources || sources.length === 0) {
    return `No live web sources were retrieved for "${topic}". Please verify your query or search term.`;
  }

  // Filter out duplicates and empty snippets
  const validSources = sources.filter((s) => s.title && s.url && s.snippet);
  if (validSources.length === 0) {
    return `No verified web content could be extracted for "${topic}".`;
  }

  // Build clean findings from the actual websites
  const findings = validSources.map((s, idx) => {
    const title = cleanText(s.title);
    const domain = s.sourceDomain || 'web';
    const snippet = cleanText(s.snippet);
    return {
      index: idx + 1,
      title,
      domain,
      snippet,
      url: s.url,
    };
  });

  // Extract key sentences from snippets that most closely match query terms
  const queryTerms = topic.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const relevantSentences: string[] = [];

  for (const f of findings) {
    const sentences = f.snippet.split(/(?<=[.!?])\s+/);
    for (const sent of sentences) {
      const sentLower = sent.toLowerCase();
      const matchCount = queryTerms.filter((term) => sentLower.includes(term)).length;
      if (matchCount > 0 && !relevantSentences.includes(sent)) {
        relevantSentences.push(`${sent} [${f.index}]`);
      }
    }
  }

  // If sentence extraction was too sparse, use the direct snippets
  const mainFindingsText =
    relevantSentences.length >= 2
      ? relevantSentences.slice(0, 5).join(' ')
      : findings.map((f) => `• **${f.title}**: ${f.snippet} [${f.index}]`).join('\n\n');

  // Build source list
  const sourceCitations = findings
    .map((f) => `[${f.index}] [${f.title}](${f.url}) — *${f.domain}*`)
    .join('\n');

  return `Based on live web search results for **"${topic}"**:

${mainFindingsText}

---

#### 🌐 Verified Sources
${sourceCitations}`;
}
