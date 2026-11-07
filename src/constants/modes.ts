import { FrogeModeConfig, FrogeModeId } from '../types';

export const FROGE_MODES: Record<FrogeModeId, FrogeModeConfig> = {
  'simple-chat': {
    id: 'simple-chat',
    name: 'Simple Chat',
    shortName: 'Simple',
    tagline: 'Lightweight, rapid conversational intelligence',
    description: 'Instant answers, everyday drafting, concise summaries, and natural conversational flow without computational overhead.',
    badge: 'Fast & Direct',
    iconName: 'MessageSquare',
    accentColor: '#10b981', // emerald-500
    lightBg: 'bg-emerald-50/80',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    placeholder: 'Ask FROGÉ anything or ask for a quick summary...',
    samplePrompts: [
      {
        title: 'Draft a crisp update',
        prompt: 'Draft a polished 3-bullet executive update about our Q3 product roadmap progress.',
        category: 'Work',
      },
      {
        title: 'Summarize key principles',
        prompt: 'Explain the 80/20 Pareto principle with three memorable real-world examples.',
        category: 'Knowledge',
      },
      {
        title: 'Plan a travel day',
        prompt: 'Create an optimized 1-day walking itinerary for exploring Kyoto in autumn.',
        category: 'Travel',
      },
      {
        title: 'Email response',
        prompt: 'Write a polite, firm email declining an invitation due to scheduling constraints.',
        category: 'Communication',
      },
    ],
  },
  'deep-thinking': {
    id: 'deep-thinking',
    name: 'Deep Thinking',
    shortName: 'Thinking',
    tagline: 'Multi-step deductive reasoning & step traces',
    description: 'Deep cognitive chains, premise verification, counter-argument exploration, and systematic logic modeling with full thought inspection.',
    badge: 'Reasoning Engine',
    iconName: 'BrainCircuit',
    accentColor: '#6366f1', // indigo-500
    lightBg: 'bg-indigo-50/80',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    placeholder: 'Pose a complex problem, paradox, or multi-variable strategy question...',
    samplePrompts: [
      {
        title: 'Analyze market dynamics',
        prompt: 'Analyze the second-order economic consequences of rapid sovereign AI datacenter expansion on regional energy grids.',
        category: 'Analysis',
      },
      {
        title: 'Evaluate trade-offs',
        prompt: 'Compare Monolithic vs Microservices architecture for a fintech platform scaling from 10k to 2M daily active users.',
        category: 'Architecture',
      },
      {
        title: 'Resolve game theory dilemma',
        prompt: 'Break down the Nash Equilibrium in a duopoly pricing war and explore cooperative strategies.',
        category: 'Strategy',
      },
      {
        title: 'Philosophical synthesis',
        prompt: 'Reconcile deterministic causality with subjective free will through modern compatibilist perspectives.',
        category: 'Philosophy',
      },
    ],
  },
  'froge-code': {
    id: 'froge-code',
    name: 'FROGÉ Code',
    shortName: 'Code',
    tagline: 'Production software architecture & algorithmic precision',
    description: 'Full-stack TypeScript, modern systems design, bug diagnosis, performance refactors, and modular clean architecture.',
    badge: 'Engineering Core',
    iconName: 'TerminalSquare',
    accentColor: '#059669', // emerald-600
    lightBg: 'bg-emerald-50/90',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    placeholder: 'Write code, optimize algorithms, build components, or debug TypeScript...',
    samplePrompts: [
      {
        title: 'React hook pattern',
        prompt: 'Write a robust custom React hook useDebouncedWebSocket with auto-reconnection and message queuing in TypeScript.',
        category: 'Frontend',
      },
      {
        title: 'Data structure design',
        prompt: 'Implement a memory-efficient LRU Cache in TypeScript with O(1) get and put operations and full unit tests.',
        category: 'Algorithms',
      },
      {
        title: 'SQL schema & queries',
        prompt: 'Design a PostgreSQL schema for a collaborative workspace with row-level security and nested comments.',
        category: 'Backend',
      },
      {
        title: 'Tailwind animation UI',
        prompt: 'Create a pure Tailwind CSS + React interactive bento grid component with responsive layout and glass effects.',
        category: 'UI/UX',
      },
    ],
  },
  'max': {
    id: 'max',
    name: 'MAX Business',
    shortName: 'MAX',
    tagline: 'Autonomous Business Intelligence, Analytics & Controlled Agents',
    description: 'Autonomous business assistance with transparent arithmetic, sales pipeline audits, 3-scenario forecasting, RFM customer cohorts, inventory EOQ, and consequential action guards.',
    badge: '12-Capability Suite',
    iconName: 'Zap',
    accentColor: '#d97706', // amber-600
    lightBg: 'bg-amber-50/80',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    placeholder: 'Ask MAX for sales velocity, EBITDA audit, 3-scenario forecasting, customer RFM, inventory EOQ, or workflow plan...',
    samplePrompts: [
      {
        title: 'Sales Pipeline & Velocity',
        prompt: 'Audit quarterly enterprise sales velocity, win rate trends, and quota attainment pacing with step-by-step arithmetic traces.',
        category: 'Sales',
      },
      {
        title: 'EBITDA & Unit Economics',
        prompt: 'Analyze EBITDA margin, LTV to CAC ratio, CAC payback period, and variance analysis across business segments.',
        category: 'Finance',
      },
      {
        title: '3-Scenario Forecasting',
        prompt: 'Generate 12-month revenue forecast across Pessimistic, Base Case, and Optimistic scenarios with confidence intervals.',
        category: 'Forecasting',
      },
      {
        title: 'Customer RFM & Retention',
        prompt: 'Segment customer cohorts using RFM analysis, model Net Revenue Retention (NRR), and identify churn hazard indicators.',
        category: 'Customers',
      },
      {
        title: 'Inventory EOQ & Safety Stock',
        prompt: 'Calculate Economic Order Quantity (EOQ), reorder point thresholds, and safety stock requirements to mitigate stockout risks.',
        category: 'Inventory',
      },
      {
        title: 'Contract & Document Audit',
        prompt: 'Analyze vendor contract for liability caps, indemnification clauses, auto-renewal traps, and SLA penalty terms.',
        category: 'Documents',
      },
    ],
  },
  'student-mode': {
    id: 'student-mode',
    name: 'Student Mode',
    shortName: 'Student',
    tagline: 'Socratic tutoring, intuitive analogies & mastery checks',
    description: 'Step-by-step concept deconstruction, interactive comprehension quizzes, active recall vocabulary flashcards, and patient guided learning.',
    badge: 'Socratic Tutor',
    iconName: 'GraduationCap',
    accentColor: '#0284c7', // sky-600
    lightBg: 'bg-sky-50/80',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-200',
    placeholder: 'Ask to learn any topic, theorem, historical era, or concept from scratch...',
    samplePrompts: [
      {
        title: 'Explain Quantum Superposition',
        prompt: 'Teach me Quantum Superposition like I am a high school student, with a great everyday analogy and a quick quiz.',
        category: 'Physics',
      },
      {
        title: 'Calculus made intuitive',
        prompt: 'Break down derivatives vs integrals using a car speedometer and odometer analogy with step-by-step practice.',
        category: 'Math',
      },
      {
        title: 'Photosynthesis walkthrough',
        prompt: 'Explain the light-dependent and Calvin cycle stages of photosynthesis simply with key terms to memorize.',
        category: 'Biology',
      },
      {
        title: 'Neural Networks 101',
        prompt: 'Explain backpropagation in neural networks using an analogy of tuning a guitar or adjusting an oven recipe.',
        category: 'Computer Science',
      },
    ],
  },
};

export const FROGE_MODE_LIST = Object.values(FROGE_MODES);
