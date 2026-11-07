import React, { useState } from 'react';
import {
  X,
  Cpu,
  Layers,
  Binary,
  MessageSquare,
  TrendingUp,
  Workflow,
  Sparkles,
  ArrowRight,
  Database,
  Hash,
  RefreshCw,
  Search,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import {
  NEURAL_LAYERS,
  TRAINING_LIFECYCLE_STAGES,
  frogeNeuralArchitectureEngine,
  NeuralInferenceTrace,
} from '../brain/neural/neuralArchitecture';
import {
  frogeEnglishNlpEngine,
  DeepNlpAnalysisResult,
  ENGLISH_IDIOMS_DATABASE,
} from '../brain/language/englishNlpEngine';

interface NeuralArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const NeuralArchitectureModal: React.FC<NeuralArchitectureModalProps> = ({
  isOpen,
  onClose,
  initialQuery = 'List all dates from 2030 to 2040 when Earth and Mars are closest.',
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'pipeline' | 'english_nlp' | 'layers' | 'training' | 'simulator'>('architecture');
  const [simQuery, setSimQuery] = useState(initialQuery);
  const [activeTrace, setActiveTrace] = useState<NeuralInferenceTrace>(() =>
    frogeNeuralArchitectureEngine.analyzeNeuralInference(initialQuery)
  );
  const [activeNlp, setActiveNlp] = useState<DeepNlpAnalysisResult>(() =>
    frogeEnglishNlpEngine.analyzeEnglishInput(initialQuery)
  );

  if (!isOpen) return null;

  const handleRunSimulation = (queryToRun: string) => {
    setSimQuery(queryToRun);
    const trace = frogeNeuralArchitectureEngine.analyzeNeuralInference(queryToRun);
    setActiveTrace(trace);
    setActiveNlp(frogeEnglishNlpEngine.analyzeEnglishInput(queryToRun));
  };

  const samplePrompts = [
    { label: 'Astronomy & Dates', prompt: 'List all dates from 2030 to 2040 when Earth and Mars are closest.' },
    { label: 'Coding & Logic', prompt: 'Write a TypeScript debounce function with AST type safety and cleanup.' },
    { label: 'Conversational Chat', prompt: 'Explain the core principles of photosynthesis in simple terms.' },
    { label: 'Business & Forecasting', prompt: 'Forecast Q4 revenue trends given $1.2M MRR and 4.5% churn.' },
    { label: 'Deep Research Agent', prompt: 'Perform a comprehensive multi-source investigation into quantum computing breakthroughs.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  FROGÉ Neural Network Architecture
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  4-Tier Cognitive Neural Core
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pre-Training Core (Logic) → Instruction Tuning (Chat) → Multi-Modal Fusion (Business) → Autonomous ReAct Loop (Research)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 bg-zinc-50/40 dark:bg-zinc-900/40 gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'architecture', label: 'System Topology', icon: Layers },
            { id: 'pipeline', label: 'Full 4-Stage Pipeline', icon: Workflow },
            { id: 'english_nlp', label: 'Deep English NLP', icon: MessageSquare },
            { id: 'layers', label: '4 Cognitive Layers', icon: Cpu },
            { id: 'training', label: 'Training & Data Lifecycle', icon: Database },
            { id: 'simulator', label: 'Live Neural Simulator', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white/60 dark:bg-zinc-800/60 rounded-t-lg'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SYSTEM TOPOLOGY */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              {/* Architecture Blueprint Card */}
              <div className="p-5 rounded-2xl bg-zinc-950 text-white font-mono shadow-inner border border-zinc-800">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs text-zinc-400">
                  <span className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Zap className="w-4 h-4" /> FROGÉ Neural Flow Topology
                  </span>
                  <span>Pure In-Computer Transformer Core</span>
                </div>

                <div className="py-6 flex flex-col items-center justify-center text-xs md:text-sm text-center space-y-4">
                  <div className="flex flex-col md:flex-row items-center gap-3 w-full justify-center">
                    <div className="px-4 py-3 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-semibold shadow-md">
                      [ 1. Matrix Operations & Formal Logic ]
                      <div className="text-[10px] text-emerald-400/80 font-normal mt-0.5">Coding Engine · Deterministic AST · Low Ambiguity</div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-zinc-500 hidden md:block shrink-0" />
                    <div className="text-zinc-500 md:hidden">↓</div>

                    <div className="px-4 py-3 rounded-xl bg-blue-950/80 border border-blue-600/60 text-blue-300 font-semibold shadow-md">
                      [ 2. Base Token Prediction & Chat Alignment ]
                      <div className="text-[10px] text-blue-400/80 font-normal mt-0.5">Context Window Attention · Next-Token · RLHF</div>
                    </div>
                  </div>

                  <div className="text-zinc-500 font-bold">↓ (Context Fusion & Fine-Tuning)</div>

                  <div className="flex flex-col md:flex-row-reverse items-center gap-3 w-full justify-center">
                    <div className="px-4 py-3 rounded-xl bg-amber-950/80 border border-amber-600/60 text-amber-300 font-semibold shadow-md">
                      [ 4. Multi-Step Agentic Loop (ReAct) ]
                      <div className="text-[10px] text-amber-400/80 font-normal mt-0.5">Search + Tools + Observation + Grounded Synthesis</div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-zinc-500 rotate-180 hidden md:block shrink-0" />
                    <div className="text-zinc-500 md:hidden">↑</div>

                    <div className="px-4 py-3 rounded-xl bg-purple-950/80 border border-purple-600/60 text-purple-300 font-semibold shadow-md">
                      [ 3. Data Extraction & Domain Analysis ]
                      <div className="text-[10px] text-purple-400/80 font-normal mt-0.5">Context Fusion: Text + Numbers + Tabular Forecasting</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* End-to-End System Flow Diagram Card */}
              <div className="p-5 rounded-2xl bg-zinc-950 text-white font-mono shadow-inner border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs text-zinc-400">
                  <span className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Workflow className="w-4 h-4" /> End-to-End System Architecture & Flowchart
                  </span>
                  <span>User → API → Context/Memory → 5 Modes → Gateway/Tools → NN & Verification → Deployment Loop</span>
                </div>

                <div className="space-y-3 py-2 text-xs">
                  {/* Step 1: User to Context */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200">
                      👤 User: Web / Mobile / Desktop
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                    <div className="px-3 py-2 rounded-lg bg-indigo-950 border border-indigo-700 text-indigo-300">
                      🛡️ API & Permissions
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                    <div className="px-3 py-2 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300">
                      📑 Context Builder
                    </div>
                    <span className="text-zinc-500 font-bold">⟷</span>
                    <div className="px-3 py-2 rounded-lg bg-blue-950 border border-blue-700 text-blue-300">
                      🧠 Memory & Doc Retrieval
                    </div>
                  </div>

                  <div className="flex justify-center text-zinc-500">↓</div>

                  {/* Step 2: Brain to Router */}
                  <div className="flex items-center justify-center gap-2">
                    <div className="px-4 py-2.5 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold shadow-md">
                      ⚡ FROGÉ Brain
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                    <div className="px-4 py-2.5 rounded-xl bg-purple-950 border border-purple-600 text-purple-300 font-bold shadow-md">
                      🔀 Intent, Complexity & Mode Router
                    </div>
                  </div>

                  <div className="flex justify-center text-zinc-500">↓</div>

                  {/* Step 3: Five Operational Modes */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-emerald-800/80 text-emerald-300 font-semibold">
                      💬 Simple Chat
                      <div className="text-[10px] text-zinc-400 font-normal">Direct & Lite</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-indigo-800/80 text-indigo-300 font-semibold">
                      🧠 Deep Thinking
                      <div className="text-[10px] text-zinc-400 font-normal">First-Principles</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-cyan-800/80 text-cyan-300 font-semibold">
                      💻 FROGÉ Code
                      <div className="text-[10px] text-zinc-400 font-normal">AST & Sandbox</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-amber-800/80 text-amber-300 font-semibold">
                      🎓 Student Mode
                      <div className="text-[10px] text-zinc-400 font-normal">Socratic Pedagogy</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-purple-800/80 text-purple-300 font-semibold">
                      📊 MAX
                      <div className="text-[10px] text-zinc-400 font-normal">Strategic Business</div>
                    </div>
                  </div>

                  <div className="flex justify-center text-zinc-500">↓</div>

                  {/* Step 4: Model Gateway & Tools */}
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <div className="px-4 py-2.5 rounded-xl bg-blue-950 border border-blue-600 text-blue-300 font-bold">
                      🌐 Model Gateway
                    </div>
                    <span className="text-zinc-500 font-bold">+</span>
                    <div className="px-4 py-2.5 rounded-xl bg-amber-950 border border-amber-600 text-amber-300 font-bold">
                      🔧 Research & Approved Tools
                    </div>
                  </div>

                  <div className="flex justify-center text-zinc-500">↓</div>

                  {/* Step 5: NN Adapter -> Verification -> Response */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <div className="px-3 py-2 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-300">
                      🧬 Pretrained NN + FROGÉ Adapter
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                    <div className="px-3 py-2 rounded-lg bg-red-950 border border-red-700 text-red-300 font-bold">
                      🔍 Answer Verification
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                    <div className="px-3 py-2 rounded-lg bg-emerald-900 border border-emerald-500 text-white font-bold">
                      🚀 Final Response → User
                    </div>
                  </div>

                  {/* Step 6: Continuous Feedback & Fine-Tuning Loop */}
                  <div className="mt-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-300">
                    <span className="text-amber-400 font-bold">🔄 Continuous Improvement & Safe Deployment Loop:</span>
                    <div className="flex items-center justify-between gap-2 mt-2 flex-wrap text-zinc-400">
                      <span>Reviewed Improvement Data</span>
                      <span>→</span>
                      <span>Offline Fine-Tuning</span>
                      <span>→</span>
                      <span>Evaluation & Regression Tests</span>
                      <span>→</span>
                      <span className="text-emerald-400 font-semibold">Deploy Only if Results Improve → Model Gateway</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Core Pillars Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NEURAL_LAYERS.map((layer) => (
                  <div
                    key={layer.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-2xs hover:border-emerald-400 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-lg bg-${layer.color}-100 dark:bg-${layer.color}-950 text-${layer.color}-600 dark:text-${layer.color}-400 font-bold text-xs`}>
                        {layer.stageName}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 mb-3 leading-relaxed">
                      {layer.nature}
                    </p>
                    <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">Why Sequence Matters:</div>
                      <div>{layer.trainingPriority}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: FULL 4-STAGE PIPELINE */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              {/* Pipeline Flowchart Diagram */}
              <div className="p-5 rounded-2xl bg-zinc-950 text-white font-mono shadow-inner border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs text-zinc-400">
                  <span className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Workflow className="w-4 h-4" /> Full Next-Level Execution Pipeline
                  </span>
                  <span>User Input → Guardrail → Intent/Tone → Context/Memory → Persona Response</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 py-2">
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-700/60 text-center space-y-1">
                    <span className="text-[10px] font-mono text-red-400 font-bold uppercase">Stage 1</span>
                    <div className="text-xs font-bold text-red-200">Guardrail & Safety</div>
                    <p className="text-[10px] text-zinc-400">Fast Safety & Policy Pre-Filter</p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-950/70 border border-blue-700/60 text-center space-y-1">
                    <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Stage 2</span>
                    <div className="text-xs font-bold text-blue-200">Intent & Tone Classifier</div>
                    <p className="text-[10px] text-zinc-400">Topic Routing & Emotion Mapping</p>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-950/70 border border-purple-700/60 text-center space-y-1">
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Stage 3</span>
                    <div className="text-xs font-bold text-purple-200">Context & Memory Fusion</div>
                    <p className="text-[10px] text-zinc-400">Session Facts + Implicit Intent</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-center space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Stage 4</span>
                    <div className="text-xs font-bold text-emerald-200">Friendly Response Gen</div>
                    <p className="text-[10px] text-zinc-400">Warm Persona + Follow-Up</p>
                  </div>
                </div>
              </div>

              {/* Persona Instructions YAML Specification Card */}
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    Stage 4: Persona Instructions & Conditioning
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold">
                    YAML Specification
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto">
                  <pre>{`Persona_Instructions:
  Tone: Warm, encouraging, empathetic, clear, grounded.
  Rules:
    - Never say "As an AI..." or "I am programmed to..."
    - Acknowledge feelings first before giving instructions.
    - Keep sentences varied in length so the rhythm sounds natural.
    - Use clear spacing and bolding for readability.
    - End with an interactive, relevant follow-up question.`}</pre>
                </div>
              </div>

              {/* 4 Pipeline Stages In-Depth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-red-500" />
                    1. Guardrail & Safety Fast Check
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Evaluates incoming text instantly for dangerous patterns, harmful payload instructions, and policy compliance before engaging deep model reasoning.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-blue-500" />
                    2. Intent & Sentiment Classifier (Tone Mapping)
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Routes topics into specific buckets (Greeting, Technical, Billing, Science, Research) and maps emotional states (Frustrated → high empathy & short steps; Curious → enthusiastic).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-purple-500" />
                    3. Context & Memory Fusion (State Tracking)
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Tracks short-term facts (user preferences, entities, active topic) and realizes implicit intent when the user builds on prior messages without re-explaining context.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    4. Friendly Human Response Generation
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Direct warm greeting, empathetic validation of feelings, clear and readable formatting with active voice, and an engaging conversational follow-up question.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DEEP ENGLISH NLP & PRAGMATICS */}
          {activeTab === 'english_nlp' && (
            <div className="space-y-6">
              {/* Header Overview Card */}
              <div className="p-5 rounded-2xl bg-zinc-950 text-white font-mono shadow-inner border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs text-zinc-400">
                  <span className="flex items-center gap-2 text-blue-400 font-bold">
                    <MessageSquare className="w-4 h-4" /> Deep English Linguistic & Pragmatics Engine
                  </span>
                  <span>Beyond Keywords: Subtext, Sarcasm, Idioms & Formality Register</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  The English NLP engine analyzes subtext, detects irony or frustration (e.g. <em>"Oh, great..."</em>), links complex English idioms (e.g. <em>"burnt out"</em>, <em>"touch base"</em>), and applies linguistic mimicry with active voice and natural transition anchors.
                </p>
              </div>

              {/* 4 Core Linguistic Techniques */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    1. Linguistic Mimicry (Formality Register)
                  </span>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    Matches user formality: if casual shorthand is used (<em>"sup bro"</em>), responds casually (<em>"Hey there! Ready when you are."</em>). If formal prose is used, responds with executive polish.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 space-y-2">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Workflow className="w-4 h-4 text-purple-600" />
                    2. Natural Transition Anchors
                  </span>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    Uses conversational bridges (<em>"That makes total sense," "Here’s the cool part," "By the way"</em>) to connect thoughts smoothly instead of sounding like disjointed bullet points.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    3. Active Voice & Dynamic Cadence
                  </span>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    Uses active English verbs and alternates between short punchy sentences and descriptive explanations to build a natural speech cadence.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    4. Empathetic Mirroring
                  </span>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    Validates emotional subtext (<em>"I can see why that’s frustrating," "That sounds amazing!"</em>) before transitioning to direct answers or next steps.
                  </p>
                </div>
              </div>

              {/* Live NLP Analyzer Card */}
              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-600" />
                  Live Pragmatics & Formality Evaluation on Current Query:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                    <span className="text-zinc-500 text-[11px] block">Formality Register</span>
                    <strong className="text-zinc-900 dark:text-zinc-100 uppercase font-mono text-xs">
                      {activeNlp.formalityRegister.replace('_', ' ')}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                    <span className="text-zinc-500 text-[11px] block">Pragmatic Mood</span>
                    <strong className="text-zinc-900 dark:text-zinc-100 uppercase font-mono text-xs">
                      {activeNlp.pragmaticMood.replace('_', ' ')}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                    <span className="text-zinc-500 text-[11px] block">Sarcasm Detected?</span>
                    <strong className={`font-mono text-xs ${activeNlp.isSarcastic ? 'text-amber-600 font-bold' : 'text-emerald-600'}`}>
                      {activeNlp.isSarcastic ? 'YES (Subtext Detected)' : 'NO (Literal Meaning)'}
                    </strong>
                  </div>
                </div>

                {activeNlp.detectedIdioms.length > 0 && (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                    <span className="font-bold text-purple-900 dark:text-purple-200">Idiom & Context Linking:</span>
                    {activeNlp.detectedIdioms.map((idm, i) => (
                      <div key={i} className="text-purple-800 dark:text-purple-300">
                        • <strong>"{idm.phrase}"</strong> mapped to: <em>{idm.actualPragmaticMeaning}</em>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: 4 COGNITIVE LAYERS */}
          {activeTab === 'layers' && (
            <div className="space-y-6">
              {NEURAL_LAYERS.map((layer, idx) => (
                <div
                  key={layer.id}
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                        Cognitive Layer {idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {layer.name}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {layer.stageName}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Core Nature:
                    </span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {layer.nature}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Activated Capabilities
                      </span>
                      <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {layer.capabilities.map((c, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Binary className="w-3.5 h-3.5 text-blue-600" />
                        Mathematical & Structural Foundations
                      </span>
                      <ul className="space-y-1 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                        {layer.mathematicalFoundations.map((m, i) => (
                          <li key={i} className="bg-zinc-100 dark:bg-zinc-800/80 px-2 py-1 rounded">
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: TRAINING LIFECYCLE */}
          {activeTab === 'training' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold">Foundational Training Lifecycle:</span> Petabyte corpus data preparation, subword tokenization, deep Transformer parameter architecture, and forward/backward loss backpropagation.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TRAINING_LIFECYCLE_STAGES.map((stage) => (
                  <div
                    key={stage.id}
                    className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-emerald-600" />
                        {stage.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {stage.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      {stage.description}
                    </p>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                        Operational Mechanics:
                      </span>
                      <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {stage.operationalMechanics.map((op, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{op}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">{stage.metricLabel}:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {stage.metricValue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NEURAL SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Query Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Test Query Across the 4 Neural Layers:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simQuery}
                    onChange={(e) => setSimQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunSimulation(simQuery)}
                    placeholder="Enter any query to observe layer activation..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => handleRunSimulation(simQuery)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Run Trace</span>
                  </button>
                </div>
              </div>

              {/* Sample Prompts */}
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRunSimulation(p.prompt)}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-800 dark:hover:text-emerald-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Live Trace Output */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span>Tokens Processed: <strong className="text-zinc-900 dark:text-zinc-100">{activeTrace.tokensProcessed}</strong></span>
                  <span>Architecture: <strong className="text-emerald-600">{activeTrace.estimatedParametersEngaged}</strong></span>
                </div>

                {/* Step 1 & Step 2 Conversational Alignment Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Step 1: Input Analysis (NLU & Intent Recognition) */}
                  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30 space-y-2.5">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <Search className="w-4 h-4 text-blue-600" />
                      Step 1: User Input Analysis (NLU & Intent)
                    </span>
                    <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                      <div>
                        <strong className="text-blue-950 dark:text-blue-200">Intent:</strong>{' '}
                        <span>{activeTrace.nluAnalysis.detectedIntent}</span>
                      </div>
                      <div>
                        <strong className="text-blue-950 dark:text-blue-200">Sentiment & Tone:</strong>{' '}
                        <span className="font-semibold text-blue-700 dark:text-blue-300">
                          {activeTrace.nluAnalysis.detectedSentiment}
                        </span>
                      </div>
                      {activeTrace.nluAnalysis.extractedEntities.length > 0 && (
                        <div>
                          <strong className="text-blue-950 dark:text-blue-200">Extracted Entities:</strong>{' '}
                          <span className="font-mono text-[11px] bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
                            {activeTrace.nluAnalysis.extractedEntities.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Friendly Human Response Generation */}
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-2.5">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      Step 2: Friendly Human Response Framing
                    </span>
                    <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                      <div>
                        <strong className="text-emerald-950 dark:text-emerald-200">Warm Opening:</strong>{' '}
                        <span className="italic">"{activeTrace.friendlyResponseFraming.warmOpening}"</span>
                      </div>
                      <div>
                        <strong className="text-emerald-950 dark:text-emerald-200">Tone & Empathy:</strong>{' '}
                        <span>{activeTrace.friendlyResponseFraming.toneMatchingAndEmpathy}</span>
                      </div>
                      <div>
                        <strong className="text-emerald-950 dark:text-emerald-200">Interactive Follow-up:</strong>{' '}
                        <span className="text-emerald-800 dark:text-emerald-300 font-medium italic">
                          "{activeTrace.friendlyResponseFraming.interactiveClosing}"
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Layer Activation Bars */}
                <div className="space-y-3">
                  {activeTrace.activatedLayers.map((l) => (
                    <div
                      key={l.layerId}
                      className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{l.layerName}</span>
                        <span className="font-mono font-bold text-emerald-600">
                          {Math.round(l.activationScore * 100)}% Engaged
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${l.activationScore * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span>{l.activeRole}</span>
                        <span className="font-mono text-zinc-400">{l.computationDetails}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ReAct Execution Steps if Present */}
                {activeTrace.reactSteps && (
                  <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Workflow className="w-4 h-4 text-amber-600" />
                      Autonomous ReAct Multi-Step Loop (Reason → Act → Observe → Synthesize)
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {activeTrace.reactSteps.map((s, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                          <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                            {s.phase}
                          </span>
                          <span className="flex-1">{s.description}</span>
                          <span className="text-zinc-400 font-mono text-[10px]">{s.latencyMs}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between text-xs text-zinc-500">
          <span>FROGÉ Neural Engine Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
