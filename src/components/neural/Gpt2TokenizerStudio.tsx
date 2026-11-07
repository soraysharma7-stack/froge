/**
 * FROGÉ AI — GPT-2 Tokenizer Studio & 50,257 Vocabulary Explorer
 *
 * Provides:
 * 1. Live Subword Token Visualizer with alternating color-coded chips & ID badges.
 * 2. Real-time KPI Bar (Token Count, Bytes, Chars, Compression Ratio, Tokens/Word).
 * 3. Bidirectional Vocabulary Search (ID 0–50256 and text substring).
 * 4. Token Inspector Popover/Modal with Unicode, UTF-8 Hex, and PDF Page Locator.
 * 5. Embedded Reference PDF Viewer for gpt2_vocabulary_50257_tokens_0eebe765.pdf.
 * 6. Quick Presets for Code, Whitespace Nuance, Devanagari Hindi, and Special Tokens.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Binary,
  Search,
  BookOpen,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Info,
  ChevronRight,
  FileCode,
  Hash,
  ListFilter,
  X,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import {
  encodeToGpt2Tokens,
  lookupTokenById,
  searchGpt2Vocabulary,
  getVocabPageForId,
  formatTokenDisplay,
  GPT2_VOCAB_PDF_URL,
  GPT2_TOTAL_TOKENS,
  GPT2_MAX_TOKEN_ID,
  GPT2_SPECIAL_TOKEN_ID,
  GPT2_SPECIAL_TOKEN_STR,
  GPT2_CURATED_PRESETS,
  Gpt2TokenItem,
  Gpt2TokenLookupResult,
  Gpt2AnalysisMetrics,
} from '../../brain/curriculum/gpt2VocabularyService';

// Alternating soft color palettes for subword token visualization
const TOKEN_COLOR_PALETTES = [
  {
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/25',
    badge: 'bg-blue-600/15 text-blue-700 dark:text-blue-300',
  },
  {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/25',
    badge: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300',
  },
  {
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-500/25',
    badge: 'bg-purple-600/15 text-purple-700 dark:text-purple-300',
  },
  {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/25',
    badge: 'bg-amber-600/15 text-amber-700 dark:text-amber-300',
  },
  {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-500/25',
    badge: 'bg-cyan-600/15 text-cyan-700 dark:text-cyan-300',
  },
  {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/25',
    badge: 'bg-rose-600/15 text-rose-700 dark:text-rose-300',
  },
];

export const Gpt2TokenizerStudio: React.FC = () => {
  const [inputText, setInputText] = useState<string>(GPT2_CURATED_PRESETS[0].text);
  const [viewMode, setViewMode] = useState<'visualizer' | 'registry' | 'pdf'>('visualizer');
  const [searchQuery, setSearchQuery] = useState<string>('50256');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedToken, setSelectedToken] = useState<Gpt2TokenItem | Gpt2TokenLookupResult | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [targetPdfPage, setTargetPdfPage] = useState<number>(1);

  // Live Analysis computation
  const analysis: Gpt2AnalysisMetrics = useMemo(() => {
    try {
      return (
        encodeToGpt2Tokens(inputText) && {
          text: inputText,
          charCount: inputText.length,
          byteCount: new TextEncoder().encode(inputText).length,
          tokenCount: encodeToGpt2Tokens(inputText).length,
          wordCount: inputText.trim().split(/\s+/).filter(Boolean).length || (inputText.trim() ? 1 : 0),
          compressionRatio:
            inputText.length > 0 && encodeToGpt2Tokens(inputText).length > 0
              ? Number((inputText.length / encodeToGpt2Tokens(inputText).length).toFixed(2))
              : 0,
          tokensPerWord:
            inputText.trim().split(/\s+/).filter(Boolean).length > 0
              ? Number(
                  (
                    encodeToGpt2Tokens(inputText).length /
                    inputText.trim().split(/\s+/).filter(Boolean).length
                  ).toFixed(2)
                )
              : 0,
          tokens: encodeToGpt2Tokens(inputText),
        }
      );
    } catch {
      return {
        text: inputText,
        charCount: inputText.length,
        byteCount: inputText.length,
        tokenCount: 0,
        wordCount: 0,
        compressionRatio: 0,
        tokensPerWord: 0,
        tokens: [],
      };
    }
  }, [inputText]);

  // Search Results computation
  const searchResults = useMemo(() => {
    try {
      const raw = searchGpt2Vocabulary(searchQuery, 60);
      if (categoryFilter === 'all') return raw;
      return raw.filter((r) => r.category === categoryFilter);
    } catch {
      return [];
    }
  }, [searchQuery, categoryFilter]);

  const handleCopy = (textToCopy: string, id?: number) => {
    navigator.clipboard?.writeText(textToCopy);
    if (id !== undefined) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } else {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 1500);
    }
  };

  const handleJumpToPdf = (pdfPage: number) => {
    setTargetPdfPage(pdfPage);
    setViewMode('pdf');
  };

  return (
    <div className="space-y-6">
      {/* HEADER TOOLBAR & MODE SWITCH */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Byte-Level BPE · 50,257 Total Tokens (0–50256)
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono tabular-nums">
              320 Tokens / Page · 158 Pages
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Binary className="w-5 h-5 text-emerald-600" />
            <span>GPT-2 Tokenizer Studio & Vocabulary Engine</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-3xl leading-relaxed">
            Direct implementation of the complete 50,257 subword token vocabulary from the official specification. Inspect live token splits, byte representations, space conventions (<code className="text-emerald-600 dark:text-emerald-400">␣</code>), and special sequence boundary tokens.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Segmented View Mode Switch */}
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 gap-1">
            <button
              onClick={() => setViewMode('visualizer')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                viewMode === 'visualizer'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-500" />
              <span>Live Visualizer</span>
            </button>
            <button
              onClick={() => setViewMode('registry')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                viewMode === 'registry'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-emerald-500" />
              <span>Vocabulary Search</span>
            </button>
            <button
              onClick={() => setViewMode('pdf')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                viewMode === 'pdf'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              <span>Reference PDF</span>
            </button>
          </div>

          <a
            href={GPT2_VOCAB_PDF_URL}
            download="gpt2_vocabulary_50257_tokens.pdf"
            className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: LIVE TOKENIZER VISUALIZER */}
      {/* ======================================================== */}
      {viewMode === 'visualizer' && (
        <div className="space-y-6">
          {/* Preset Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Curated Tokenization Test Presets</span>
              </span>
              <span>Click a preset to populate input</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-wrap sm:flex-nowrap">
              {GPT2_CURATED_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(preset.text)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all text-left whitespace-nowrap shrink-0 cursor-pointer ${
                    inputText === preset.text
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                  title={preset.description}
                >
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block uppercase font-mono">
                    {preset.category}
                  </span>
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Textarea & Controls */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase font-mono tracking-wider">
                Raw Input Text
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInputText('')}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleCopy(inputText)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste any text, prompt, code snippet, or special tokens here to inspect live GPT-2 subword tokenization..."
              rows={4}
              className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-y"
            />

            {/* LIVE KPI METRICS STRIP (Tabular Numerals) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/70">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Total Tokens
                </span>
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {analysis.tokenCount}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/70">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Chars · Bytes
                </span>
                <span className="text-xl font-bold font-mono text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {analysis.charCount} <span className="text-xs text-zinc-400 font-normal">c</span> · {analysis.byteCount} <span className="text-xs text-zinc-400 font-normal">b</span>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/70">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Chars / Token
                </span>
                <span className="text-xl font-bold font-mono text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {analysis.compressionRatio}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/70">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Tokens / Word
                </span>
                <span className="text-xl font-bold font-mono text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {analysis.tokensPerWord}
                </span>
              </div>
            </div>
          </div>

          {/* VISUAL SUBWORD TOKEN CHIPS STREAM */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Binary className="w-4 h-4 text-emerald-500" />
                  <span>Color-Coded Subword Token Sequence</span>
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Click any subword chip to view byte details, hexadecimal mapping, and page location in the 158-page PDF guide.
                </p>
              </div>
              <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                <span className="text-emerald-500">␣</span> = Leading/Embedded Space
              </div>
            </div>

            {analysis.tokens.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
                Enter text above to see subword tokenization chips.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 max-h-[320px] overflow-y-auto">
                {analysis.tokens.map((token, idx) => {
                  const palette = token.isSpecial
                    ? {
                        bg: 'bg-rose-500/15 dark:bg-rose-500/20 ring-1 ring-rose-500/40',
                        text: 'text-rose-700 dark:text-rose-300 font-bold',
                        border: 'border-rose-500/40',
                        badge: 'bg-rose-600/20 text-rose-700 dark:text-rose-200',
                      }
                    : TOKEN_COLOR_PALETTES[token.index % TOKEN_COLOR_PALETTES.length];

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedToken(token)}
                      className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${palette.bg} ${palette.text} ${palette.border}`}
                      title={`Token ID ${token.id} · Page ${token.vocabPage} (${token.bytes.length} bytes)`}
                    >
                      <span className="font-medium whitespace-pre">{token.display}</span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-semibold tabular-nums ${palette.badge}`}
                      >
                        {token.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* TOKEN BREAKDOWN DATA GRID */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider">
              Token Sequence Grid ({analysis.tokens.length} Total Subwords)
            </h4>

            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 max-h-[380px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] uppercase tracking-wider sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Token ID</th>
                    <th className="py-2.5 px-3">Display Text</th>
                    <th className="py-2.5 px-3">Bytes (Hex)</th>
                    <th className="py-2.5 px-3">Vocab Page</th>
                    <th className="py-2.5 px-3">PDF Page</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-mono">
                  {analysis.tokens.map((token) => (
                    <tr
                      key={token.index}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="py-2 px-3 text-zinc-400 tabular-nums">{token.index + 1}</td>
                      <td className="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {token.id}
                      </td>
                      <td className="py-2 px-3 text-zinc-900 dark:text-zinc-100 font-semibold whitespace-pre">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                          {token.display}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-zinc-500 dark:text-zinc-400 tabular-nums text-[11px]">
                        {token.hex}
                      </td>
                      <td className="py-2 px-3 text-zinc-600 dark:text-zinc-300 tabular-nums">
                        Page {token.vocabPage} / 158
                      </td>
                      <td className="py-2 px-3 text-zinc-500 tabular-nums">
                        Page {token.pdfPage}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopy(String(token.id), token.id)}
                            className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                          >
                            {copiedId === token.id ? 'Copied' : 'Copy ID'}
                          </button>
                          <button
                            onClick={() => handleJumpToPdf(token.pdfPage)}
                            className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                          >
                            View PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: VOCABULARY SEARCH & REGISTRY */}
      {/* ======================================================== */}
      {viewMode === 'registry' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-emerald-500" />
                  <span>Search All 50,257 Tokens</span>
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Look up any token by exact numerical ID (0 to 50256) or text substring (e.g. "the", "hello", "code").
                </p>
              </div>

              {/* Landmark ID Quick Jumps */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-[11px] text-zinc-400">Landmarks:</span>
                {[
                  { label: '0 (!)', id: '0' },
                  { label: '220 (space)', id: '220' },
                  { label: '262 ( the)', id: '262' },
                  { label: '1169 (the)', id: '1169' },
                  { label: '15496 (Hello)', id: '15496' },
                  { label: '50256 (<|endoftext|>)', id: '50256' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSearchQuery(item.id)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by token ID (e.g. 50256, 262) or word snippet (e.g. 'learning', 'token')..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-xs text-zinc-400 mr-1 flex items-center gap-1">
                <ListFilter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </span>
              {[
                { id: 'all', label: 'All Results' },
                { id: 'word', label: 'Words' },
                { id: 'subword', label: 'Subwords' },
                { id: 'byte', label: 'Byte Fallbacks (0-255)' },
                { id: 'special', label: 'Special Token (50256)' },
                { id: 'whitespace', label: 'Whitespace' },
                { id: 'punctuation', label: 'Punctuation' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 max-h-[480px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] uppercase tracking-wider sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Token ID</th>
                    <th className="py-2.5 px-3">Representation</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">UTF-8 Bytes (Hex)</th>
                    <th className="py-2.5 px-3">Vocab Page</th>
                    <th className="py-2.5 px-3">PDF Page</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-mono">
                  {searchResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-zinc-400">
                        No tokens found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    searchResults.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {item.id}
                        </td>
                        <td className="py-2 px-3 text-zinc-900 dark:text-zinc-100 font-semibold whitespace-pre">
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              item.isSpecial
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                                : 'bg-zinc-100 dark:bg-zinc-800'
                            }`}
                          >
                            {item.display}
                          </span>
                        </td>
                        <td className="py-2 px-3 capitalize text-zinc-500">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/60 text-[10px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-zinc-500 dark:text-zinc-400 tabular-nums text-[11px]">
                          {item.hex}
                        </td>
                        <td className="py-2 px-3 text-zinc-600 dark:text-zinc-300 tabular-nums">
                          Page {item.vocabPage} / 158
                        </td>
                        <td className="py-2 px-3 text-zinc-500 tabular-nums">
                          Page {item.pdfPage}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedToken(item)}
                              className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => handleJumpToPdf(item.pdfPage)}
                              className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                            >
                              View in PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: REFERENCE PDF VIEWER */}
      {/* ======================================================== */}
      {viewMode === 'pdf' && (
        <div className="space-y-4">
          {/* Notation Reference Banner from Page 1 */}
          <div className="p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-emerald-400 font-bold block mb-1">␣ = Space Character</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Represents a leading or embedded space. In BPE, spaces attach to the next word.
              </p>
            </div>
            <div>
              <span className="text-cyan-400 font-bold block mb-1">\n / \t = Newline & Tab</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Control characters encoded directly (e.g. token 198 is <code>\n</code>).
              </p>
            </div>
            <div>
              <span className="text-purple-400 font-bold block mb-1">\xNN = Raw Byte</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Byte-level fallback ensures zero OOV (Out of Vocabulary) errors for any symbol.
              </p>
            </div>
            <div>
              <span className="text-rose-400 font-bold block mb-1">ID 50256 = &lt;|endoftext|&gt;</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Special delimiter marking document endings and prompt sequence completion.
              </p>
            </div>
          </div>

          {/* PDF Viewer Frame */}
          <div className="p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Official Guide Document: <code className="text-emerald-600 font-mono">gpt2_vocabulary_50257_tokens_0eebe765.pdf</code>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={GPT2_VOCAB_PDF_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Fullscreen</span>
                </a>
              </div>
            </div>

            <iframe
              src={`${GPT2_VOCAB_PDF_URL}#page=${targetPdfPage}`}
              title="GPT-2 Tokenizer Vocabulary Document"
              className="w-full h-[680px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL / DRAWER: TOKEN INSPECTOR */}
      {/* ======================================================== */}
      {selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Binary className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>Token Specification</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold tabular-nums">
                      ID {selectedToken.id}
                    </span>
                  </h4>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Vocabulary Page {selectedToken.vocabPage} / 158 · Document Page {selectedToken.pdfPage}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedToken(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Token Highlight Box */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block">
                Visual String Representation
              </span>
              <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 whitespace-pre">
                {selectedToken.display}
              </div>
              <p className="text-xs text-zinc-500">
                {selectedToken.isSpecial
                  ? 'Special architectural delimiter marking document, sequence, and prompt termination.'
                  : selectedToken.text.startsWith(' ')
                  ? 'Starts with a leading space (␣). In GPT-2 BPE, spaces bind to subsequent words.'
                  : 'Subword component without leading whitespace.'}
              </p>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                  UTF-8 Bytes
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {selectedToken.bytes.length} byte{selectedToken.bytes.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                  Hex Sequence
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedToken.hex}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                  PDF Page Locator
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  Page {selectedToken.pdfPage} (PDF)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                  Page Range
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                  IDs {getVocabPageForId(selectedToken.id).startId}–{getVocabPageForId(selectedToken.id).endId}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => handleCopy(String(selectedToken.id), selectedToken.id)}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === selectedToken.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === selectedToken.id ? 'Copied ID' : 'Copy ID'}</span>
              </button>

              <button
                onClick={() => {
                  handleJumpToPdf(selectedToken.pdfPage);
                  setSelectedToken(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open in PDF Guide</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
