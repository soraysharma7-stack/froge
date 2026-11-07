import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Copy,
  Check,
  Share2,
  Volume2,
  VolumeX,
  RotateCw,
  Edit3,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Terminal,
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Play,
  Square,
  Target,
  Clock,
  Monitor,
  Maximize2,
  Eye,
  X,
  Layers,
} from 'lucide-react';
import { ChatMessage as ChatMessageType, FrogeModeId, VisualAttachment } from '../types';
import { FROGE_MODES } from '../constants/modes';
import { FrogeLogo } from './FrogeLogo';
import { CognitivePanel } from './CognitivePanel';
import { frogeOutcomeManager, classifyOutcomeCategory } from '../brain/outcome';
import { AudioPlaybackBar } from './AudioPlaybackBar';
import { StudentInsightsPanel } from './StudentInsightsPanel';
import { MaxBusinessDashboard } from './MaxBusinessDashboard';
import { StudentReportData } from '../brain/student/types';
import { WebSourcesView } from './WebSourcesView';

interface ChatMessageProps {
  message: ChatMessageType;
  onEditQuery?: (newQuery: string) => void;
  onRegenerate?: () => void;
  onRetry?: () => void;
  onShare?: (message: ChatMessageType) => void;
  onOpenStudentReport?: (report: StudentReportData) => void;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onEditQuery,
  onRegenerate,
  onRetry,
  onShare,
  onOpenStudentReport,
  isStreaming = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [thoughtExpanded, setThoughtExpanded] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isEditingUserMsg, setIsEditingUserMsg] = useState(false);
  const [editPromptValue, setEditPromptValue] = useState(message.content);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [trackedOutcomeId, setTrackedOutcomeId] = useState<string | null>(() => {
    const existing = frogeOutcomeManager.getAllTrackedAdvice().find((t) => t.advice.messageId === message.id);
    return existing ? existing.advice.id : null;
  });
  const [isTrackSuccessNotice, setIsTrackSuccessNotice] = useState(false);

  const modeConfig = FROGE_MODES[message.mode] || FROGE_MODES['simple-chat'];
  const isAssistant = message.role === 'assistant';

  const handleTrackOutcome = () => {
    if (trackedOutcomeId) return;
    try {
      const category = classifyOutcomeCategory(message.content);
      const res = frogeOutcomeManager.trackAdvice({
        messageId: message.id,
        query: 'Assistant Advice & Recommendations',
        adviceSummary: message.content.slice(0, 120).replace(/[#*`_]/g, '').trim(),
        fullAdviceText: message.content,
        category,
        predictedConfidence: 0.85,
        followUpHours: 24,
      });
      setTrackedOutcomeId(res.id);
      setIsTrackSuccessNotice(true);
      setTimeout(() => setIsTrackSuccessNotice(false), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle SpeechSynthesis audio playback for "Listen" action
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis && isPlayingAudio) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlayingAudio]);

  const handleToggleAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any other active speech
    const cleanText = message.content
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*_`>~-]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUserEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editPromptValue.trim() && onEditQuery) {
      onEditQuery(editPromptValue.trim());
      setIsEditingUserMsg(false);
    }
  };

  // User Message
  if (!isAssistant) {
    return (
      <div
        id={`chat-msg-${message.id}`}
        className="flex justify-end my-3 max-w-4xl ml-auto px-4 md:px-6 group"
      >
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] w-full space-y-1.5">
          {/* Visual Attachment Card (e.g. Screen Capture) */}
          {message.visualAttachment && (
            <div className="flex flex-col items-end">
              <div
                onClick={() => setShowImageLightbox(true)}
                className="relative group/img cursor-pointer rounded-2xl overflow-hidden border border-emerald-300 shadow-sm bg-zinc-950 max-w-sm max-h-48"
                title="Click to view full resolution capture"
              >
                <img
                  src={message.visualAttachment.dataUrl}
                  alt={message.visualAttachment.title || 'Screen capture'}
                  className="w-full h-full object-cover transition-transform group-hover/img:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover/img:bg-black/0 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover/img:opacity-100 bg-zinc-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg transition-opacity">
                    <Maximize2 className="w-3 h-3" />
                    <span>Expand Frame</span>
                  </div>
                </div>
                <div className="absolute bottom-1.5 left-1.5 bg-zinc-900/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-200 border border-white/10 flex items-center gap-1">
                  <Monitor className="w-3 h-3 text-emerald-400" />
                  <span>Screen Eye Frame</span>
                </div>
              </div>
            </div>
          )}

          {isEditingUserMsg ? (
            <form
              onSubmit={handleSaveUserEdit}
              className="w-full p-3.5 bg-white rounded-2xl border border-zinc-300 shadow-sm"
            >
              <textarea
                value={editPromptValue}
                onChange={(e) => setEditPromptValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsEditingUserMsg(false);
                    setEditPromptValue(message.content);
                  } else if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveUserEdit();
                  }
                }}
                className="w-full text-xs text-zinc-900 bg-transparent outline-none resize-none min-h-[60px] leading-relaxed"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsEditingUserMsg(false)}
                  className="px-2.5 py-1 text-xs text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors"
                >
                  Save & Resend
                </button>
              </div>
            </form>
          ) : (
            <div className="relative group/bubble flex flex-col items-end">
              <div className="bg-zinc-900 text-zinc-50 px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs sm:text-sm leading-relaxed shadow-2xs">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {/* User message hover actions */}
              <div className="opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center justify-end gap-2 mt-1 px-1">
                <button
                  onClick={() => setIsEditingUserMsg(true)}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-700 py-0.5 px-1 rounded transition-colors"
                  title="Edit prompt"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-700 py-0.5 px-1 rounded transition-colors"
                  title="Copy prompt"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lightbox for User Image Attachment */}
        {showImageLightbox && message.visualAttachment && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowImageLightbox(false)}
          >
            <div className="relative max-w-5xl max-h-[90vh] bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col">
              <div className="p-3 bg-zinc-900 flex items-center justify-between text-white text-xs border-b border-zinc-800">
                <span className="font-bold flex items-center gap-2 text-emerald-400">
                  <Monitor className="w-4 h-4" />
                  {message.visualAttachment.title || 'Screen Capture Frame'} (
                  {message.visualAttachment.width}×{message.visualAttachment.height})
                </span>
                <button
                  type="button"
                  onClick={() => setShowImageLightbox(false)}
                  className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-black">
                <img
                  src={message.visualAttachment.dataUrl}
                  alt="Full capture"
                  className="max-h-[80vh] w-auto object-contain rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Assistant Message
  return (
    <div
      id={`chat-msg-${message.id}`}
      className="flex justify-start gap-3.5 my-4 max-w-4xl mr-auto px-4 md:px-6 w-full animate-fade-in group"
    >
      {/* FROGÉ Avatar */}
      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-2xs shrink-0 mt-0.5">
        <FrogeLogo size="sm" showBadge={false} />
      </div>

      {/* Main Content Body Card */}
      <div className="max-w-[90%] flex-1 space-y-2.5 min-w-0">
        {/* Assistant Response Card */}
        <div className="bg-white border border-zinc-200/70 p-4 sm:p-5 rounded-2xl rounded-tl-sm shadow-2xs space-y-3.5">
          {/* Mode Tag & Status Header */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 tracking-tight">
                FROGÉ AI
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                style={{
                  color: modeConfig.accentColor,
                  borderColor: `${modeConfig.accentColor}30`,
                  backgroundColor: `${modeConfig.accentColor}0e`,
                }}
              >
                {modeConfig.name}
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{message.modelName || 'FOG Neural Core v3'}</span>
              </span>
            </div>

            {isStreaming && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Synthesizing...
              </span>
            )}
          </div>

          {/* Thought Process Accordion (Deep Thinking & MAX) */}
          {message.thoughtData && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 overflow-hidden text-xs">
              <button
                onClick={() => setThoughtExpanded(!thoughtExpanded)}
                className="w-full px-3 py-2 flex items-center justify-between text-indigo-900 hover:bg-indigo-50/60 transition-colors select-none font-medium"
              >
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-semibold text-xs">Reasoning Process</span>
                  <span className="text-[10px] text-indigo-500 font-mono">
                    ({message.thoughtData.durationSeconds}s)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-indigo-600 text-[11px]">
                  <span>{thoughtExpanded ? 'Hide Trace' : 'View Trace'}</span>
                  {thoughtExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {thoughtExpanded && (
                <div className="p-3 pt-1 space-y-1.5 border-t border-indigo-100/70 text-indigo-950 text-xs">
                  <p className="text-[11px] font-medium text-indigo-800 italic">
                    {message.thoughtData.summary}
                  </p>
                  <div className="space-y-1 pl-2 border-l-2 border-indigo-200">
                    {(message.thoughtData.steps || []).map((step, idx) => (
                      <div key={idx} className="text-[11px] flex items-start gap-1.5">
                        <span className="font-mono text-indigo-400 shrink-0">0{idx + 1}.</span>
                        <span className="leading-relaxed text-zinc-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FROGÉ Brain Cognitive Exploration Panel: Explanations, Conclusions, Evidence, Uncertainty */}
          {message.cognitiveExploration && (message.cognitiveExploration.isFastPath || message.cognitiveExploration.complexityTier === 0) ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50/80 border border-emerald-200/60 text-[11px] text-emerald-800 font-mono w-fit">
              <span className="font-bold flex items-center gap-1 text-emerald-700">⚡ Fast Path</span>
              <span className="text-emerald-300">·</span>
              <span>Model: FOG Turbo</span>
              <span className="text-emerald-300">·</span>
              <span>Verification: None</span>
              <span className="text-emerald-300">·</span>
              <span className="text-emerald-600 font-semibold">18 tokens</span>
            </div>
          ) : message.cognitiveExploration ? (
            <CognitivePanel
              cognitiveExploration={message.cognitiveExploration}
              brainDetails={message.brainDetails}
            />
          ) : null}

          {/* Model Router & Token / Cost Badge */}
          {message.brainDetails?.modelRouting && message.brainDetails?.usage && message.brainDetails?.cost && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200/60 text-[10px] text-zinc-500 font-mono">
              <div className="flex items-center gap-1.5 text-zinc-700 font-medium">
                <span className="text-emerald-600 font-bold">⚡ {message.brainDetails.usage.totalTokens} tokens</span>
                <span className="text-zinc-300">·</span>
                <span className="text-zinc-600">{message.brainDetails.modelRouting.selectedModelName.split('(')[0]}</span>
                {message.brainDetails.modelRouting.activatedExpensiveReasoning && (
                  <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 text-[9px] font-bold border border-indigo-200/60">
                    Reasoning Active
                  </span>
                )}
                {message.brainDetails.modelRouting.activatedMultiModelTools && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[9px] font-bold border border-amber-200/60">
                    Multi-Model
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-700 font-semibold">
                  ${message.brainDetails.cost.totalCostUsd.toFixed(5)}
                </span>
                {message.brainDetails.cost.savingsPercentage > 0 && (
                  <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded font-semibold border border-emerald-200/60">
                    {message.brainDetails.cost.savingsPercentage}% savings
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Web Search Sources Cards */}
          {message.webSearchResults && message.webSearchResults.length > 0 && (
            <WebSourcesView sources={message.webSearchResults} />
          )}

          {/* Formatted Markdown Content */}
          <div className="text-zinc-800 text-xs sm:text-sm leading-relaxed space-y-2.5 prose prose-zinc max-w-none">
            <Markdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-base font-bold text-zinc-900 mt-3 mb-1.5 pb-1 border-b border-zinc-100">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-bold text-zinc-900 mt-2.5 mb-1">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xs font-bold text-zinc-900 mt-2 mb-1">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-[11px] font-bold text-zinc-900 mt-1.5 mb-0.5 uppercase tracking-wider">
                    {children}
                  </h4>
                ),
                p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-emerald-500 pl-3 my-2 text-zinc-600 italic bg-zinc-50 py-1 rounded-r">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2 rounded-lg border border-zinc-200">
                    <table className="min-w-full text-xs text-left divide-y divide-zinc-200">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-zinc-50 text-zinc-800 font-semibold">{children}</thead>
                ),
                th: ({ children }) => <th className="px-3 py-1.5">{children}</th>,
                td: ({ children }) => (
                  <td className="px-3 py-1.5 border-t border-zinc-100">{children}</td>
                ),
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !String(children).includes('\n');

                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-zinc-100 text-emerald-800 border border-zinc-200/60">
                        {children}
                      </code>
                    );
                  }

                  const codeString = String(children).replace(/\n$/, '');

                  return (
                    <div className="my-2.5 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xs">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs">
                        <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px]">
                          <Terminal className="w-3 h-3 text-emerald-400" />
                          <span>{match ? match[1] : 'code'}</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(codeString);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-3 text-xs font-mono overflow-x-auto text-zinc-200 leading-relaxed">
                        <code>{children}</code>
                      </pre>
                    </div>
                  );
                },
              }}
            >
              {message.content}
            </Markdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-3.5 bg-emerald-500 ml-0.5 animate-pulse align-middle" />
            )}
          </div>

          {/* Error State Banner if message failed */}
          {message.status === 'error' && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs flex items-center justify-between gap-3 text-red-800">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Generation encountered an issue or was interrupted.</span>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}

          {/* Student Mode Socratic Learning Hub (Intuition, Steps, Examples, Diagrams, Quiz, Practice, Flashcards, Resources) */}
          {message.studentInsights && (
            <StudentInsightsPanel
              insights={message.studentInsights}
              messageId={message.id}
              onOpenReportModal={onOpenStudentReport}
              onListenAudio={handleToggleAudio}
            />
          )}

          {/* MAX Business Intelligence Command Center & Action Guard (12 Capabilities, Formula Traces, Controlled Agents) */}
          {message.maxPackage && (
            <MaxBusinessDashboard
              businessPackage={message.maxPackage}
            />
          )}

          {/* Response Action Bar: Regenerate, Retry, Copy, Share, Listen */}
          <div
            id={`msg-actions-${message.id}`}
            className="flex items-center gap-3 sm:gap-4 pt-2 border-t border-zinc-100 select-none text-xs text-zinc-400"
          >
            {/* Regenerate Action */}
            {onRegenerate && (
              <button
                id={`btn-regenerate-${message.id}`}
                onClick={onRegenerate}
                className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors"
                title="Regenerate response"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Regenerate</span>
              </button>
            )}

            {/* Retry Action (if distinct or explicit) */}
            {onRetry && (
              <button
                id={`btn-retry-${message.id}`}
                onClick={onRetry}
                className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors"
                title="Retry response"
              >
                <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-medium">Retry</span>
              </button>
            )}

            {/* Copy Action */}
            <button
              id={`btn-copy-${message.id}`}
              onClick={handleCopy}
              className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors"
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-medium text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>

            {/* Share Action */}
            {onShare && (
              <button
                id={`btn-share-${message.id}`}
                onClick={() => onShare(message)}
                className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors"
                title="Share response"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Share</span>
              </button>
            )}

            {/* FROGÉ Voice Playback Controller (Play, Pause, Replay, Speed, Language) */}
            <AudioPlaybackBar
              textToSpeak={message.content}
              messageId={message.id}
            />

            {/* Track Outcome Action (Optional Outcome Learning) */}
            <button
              id={`btn-track-outcome-${message.id}`}
              onClick={handleTrackOutcome}
              className={`flex items-center gap-1 transition-colors ${
                trackedOutcomeId ? 'text-teal-600 font-semibold' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title={trackedOutcomeId ? 'Outcome is being tracked' : 'Track outcome for calibration'}
            >
              <Target className={`w-3.5 h-3.5 ${trackedOutcomeId ? 'text-teal-600' : ''}`} />
              <span className="text-[11px]">
                {trackedOutcomeId ? 'Tracking' : 'Track outcome'}
              </span>
            </button>

            {isTrackSuccessNotice && (
              <span className="text-[10px] text-teal-600 font-semibold flex items-center gap-1 animate-pulse">
                <Clock className="w-3 h-3" /> Scheduled check-in (24h)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
