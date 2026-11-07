import {
  StudentDifficulty,
  StudentInsights,
  StudentQuiz,
  PracticeQuestion,
  StudentDiagram,
  EducationalResource,
  RevisionItem,
  StepByStepPhase,
  StudentExample,
  AntiCheatingGuidance,
  StudentReportData,
  StudySessionState,
} from './types';

/**
 * Checks if a query appears to be a direct request for cheating on homework/tests
 */
export function detectCheatingAttempt(query: string): AntiCheatingGuidance {
  const q = query.toLowerCase();
  const cheatKeywords = [
    'solve this for my test',
    'give me the answer so i can submit',
    'do my homework for me',
    'cheat on my exam',
    'test question answer only',
    'just give the final answer no explanation',
    'do my assignment',
    'take my quiz',
  ];

  const hasCheatIntent = cheatKeywords.some((k) => q.includes(k));

  if (hasCheatIntent) {
    return {
      detectedCheatingAttempt: true,
      guidanceMessage:
        'FROGÉ Student Mode upholds academic integrity. Instead of giving direct copy-paste test answers, I will explain the underlying concept, walk through a similar example with different numbers, and guide you to solve it step-by-step!',
      socraticHint:
        'Focus on identifying the core formula and given variables first. What principle connects the knowns to the unknowns?',
      parallelExample:
        'Let’s look at an isomorphic practice problem together so you understand the logic and can solve your specific homework problem independently.',
    };
  }

  return {
    detectedCheatingAttempt: false,
    guidanceMessage: '',
    socraticHint: '',
  };
}

/**
 * Generates topic-aware diagrams, examples, quizzes, and resources
 */
export function generateStudentInsights(
  userQuery: string,
  difficulty: StudentDifficulty = 'intermediate'
): StudentInsights {
  const queryLower = userQuery.toLowerCase().trim();
  const antiCheating = detectCheatingAttempt(userQuery);

  // Subject categorization heuristics
  const isPhysics =
    queryLower.includes('quantum') ||
    queryLower.includes('physics') ||
    queryLower.includes('relativity') ||
    queryLower.includes('gravity') ||
    queryLower.includes('force') ||
    queryLower.includes('energy') ||
    queryLower.includes('thermodynamics') ||
    queryLower.includes('electromagnetism');

  const isMath =
    queryLower.includes('calculus') ||
    queryLower.includes('derivative') ||
    queryLower.includes('integral') ||
    queryLower.includes('algebra') ||
    queryLower.includes('matrix') ||
    queryLower.includes('geometry') ||
    queryLower.includes('probability') ||
    queryLower.includes('math') ||
    queryLower.includes('theorem');

  const isCS =
    queryLower.includes('code') ||
    queryLower.includes('algorithm') ||
    queryLower.includes('neural network') ||
    queryLower.includes('data structure') ||
    queryLower.includes('binary') ||
    queryLower.includes('recursion') ||
    queryLower.includes('sorting') ||
    queryLower.includes('ai') ||
    queryLower.includes('computer');

  const isBiology =
    queryLower.includes('photosynthesis') ||
    queryLower.includes('dna') ||
    queryLower.includes('cell') ||
    queryLower.includes('genetics') ||
    queryLower.includes('mitosis') ||
    queryLower.includes('biology') ||
    queryLower.includes('evolution') ||
    queryLower.includes('protein');

  const cleanTopicTitle = userQuery
    .replace(/[#*`_]/g, '')
    .slice(0, 70)
    .trim();

  // 1. Simple Explanation (Intuition / Everyday Analogy)
  let simpleExplanation = '';
  if (difficulty === 'beginner') {
    simpleExplanation = `Think of ${cleanTopicTitle} like a set of building blocks or a daily routine. When you change one piece, the other pieces adjust smoothly so the whole picture stays in balance. You don't need complicated formulas to start—just notice what comes in, what changes, and what comes out!`;
  } else if (difficulty === 'intermediate') {
    simpleExplanation = `${cleanTopicTitle} describes how fundamental components interact under defined rules. An everyday analogy is a water distribution system: pressure represents potential, flow rate represents throughput, and pipe resistance limits the flow.`;
  } else {
    simpleExplanation = `${cleanTopicTitle} can be formalized as an invariant relation under specified boundary conditions. By isolating the independent variables from state transformations, we can deduce governing equations from first principles.`;
  }

  // 2. Detailed Explanation
  let detailedExplanation = '';
  if (difficulty === 'beginner') {
    detailedExplanation = `### Fundamental Breakdown\n1. **The Starting Point**: We begin with what we can see and touch.\n2. **The Transformation**: A specific force or rule causes a clear change.\n3. **The Result**: The final state is stable and predictable.\n\nBy keeping these 3 steps in mind, you can explain this to anyone in under a minute!`;
  } else if (difficulty === 'intermediate') {
    detailedExplanation = `### Systematic Theoretical Framework\n1. **Axiomatic Definition**: Establishing the core properties and conservation laws.\n2. **Mathematical / Logical Relationship**: Identifying how rate of change, input variables, and equilibrium states behave.\n3. **Practical Constraints**: Recognizing where standard approximations apply and where edge cases emerge.`;
  } else {
    detailedExplanation = `### In-Depth Mathematical & Theoretical Decomposition\n1. **Formal Definition & Constraints**: Deconstructing the state space $\\mathcal{S}$ and operators acting upon the domain.\n2. **Mechanistic Derivations**: Tracing conservation laws, perturbation analysis, and convergence criteria.\n3. **Boundary Conditions & Asymptotics**: Rigorous analysis of limiting behavior as inputs approach extreme bounds ($x \\to 0, x \\to \\infty$).`;
  }

  // 3. Step-by-Step Phases
  const stepByStepSteps: StepByStepPhase[] = [
    {
      stepNumber: 1,
      title: 'Phase 1: Build the Intuition',
      explanation:
        'Connect the idea to a concrete mental model before diving into symbols or technical jargon.',
      tip: 'Ask yourself: "What everyday object behaves similarly to this?"',
    },
    {
      stepNumber: 2,
      title: 'Phase 2: Identify Key Variables',
      explanation:
        'Distinguish the fixed constants from the variables that change during the process.',
      tip: 'Highlight what is known versus what you need to solve.',
    },
    {
      stepNumber: 3,
      title: 'Phase 3: Trace the Transformation',
      explanation:
        'Walk through the mechanism step-by-step: observe how an input moves through the system to produce the output.',
      tip: 'Draw a quick sketch or flowchart on scrap paper.',
    },
    {
      stepNumber: 4,
      title: 'Phase 4: Worked Example & Verification',
      explanation:
        'Apply the concept to a standard test case with concrete numbers or logic gates to verify your reasoning.',
      tip: 'Always do a sanity check: does the result make physical/logical sense?',
    },
    {
      stepNumber: 5,
      title: 'Phase 5: Recognize Common Pitfalls',
      explanation:
        'Learn the most frequent mistakes students make (e.g. confusing correlation with causation, unit mismatch, or sign errors).',
      tip: 'Double-check your units and boundary assumptions.',
    },
  ];

  // 4. Examples
  const examples: StudentExample[] = [
    {
      title: 'Real-World Everyday Analogy',
      realWorldAnalogy:
        'Imagine navigating traffic with GPS rerouting: as traffic builds on one route (resistance), flow naturally redistributes across alternative streets to balance travel times.',
      workedExample:
        'Consider an initial state with value $X_0 = 10$. If an external factor increases the rate by $20\\%$, the new output is $X_1 = 10 \\times 1.20 = 12$.',
      counterExample:
        'Counter-example: Assuming doubling an input always doubles the output. In non-linear systems or with friction, diminishing returns occur.',
    },
    {
      title: 'Concrete Problem Walkthrough',
      realWorldAnalogy:
        'Think of budgeting monthly expenses: income is the inflow, fixed bills are baseline deductions, and discretionary savings represent surplus buffer.',
      workedExample:
        'Given a system with parameters $\\alpha = 2.5$ and $\\beta = 4.0$, total response is evaluated as $R = \\alpha \\cdot \\beta = 10.0$.',
      counterExample:
        'Pitfall: Omitting baseline offset terms ($y = mx + b$ vs $y = mx$), leading to zero-point calibration error.',
    },
  ];

  // 5. Diagrams (ASCII & conceptual models)
  let diagramAscii = '';
  if (isPhysics) {
    diagramAscii = `
+-------------------------------------------------------------+
|                     PHYSICAL SYSTEM FLOW                    |
+-------------------------------------------------------------+
   [ Initial State ] ---> ( Applied Force / Energy ) ---> [ Final Equilibrium ]
           |                                                      |
           v                                                      v
   Potential Energy (U)  =============================>   Kinetic Energy (K)
                               ( Energy Conserved )
`;
  } else if (isMath) {
    diagramAscii = `
+-------------------------------------------------------------+
|                 MATHEMATICAL FUNCTION MAPPING               |
+-------------------------------------------------------------+
   Input Domain (x) --------[ Transformation f(x) ]--------> Output Range (y)
          |                                                         |
          +-----> Instantaneous Rate of Change: df/dx (Slope) <-----+
          +-----> Cumulative Area Under Curve:  ∫ f(x) dx     <-----+
`;
  } else if (isCS) {
    diagramAscii = `
+-------------------------------------------------------------+
|                  ALGORITHMIC COMPUTATION PIPELINE           |
+-------------------------------------------------------------+
   [ Raw Input Stream ] ---> [ Processing & Logic Kernel ] ---> [ Verified Output ]
              |                             |                             |
              v                             v                             v
        O(N) Ingestion             O(N log N) Computation          O(1) Access Result
`;
  } else if (isBiology) {
    diagramAscii = `
+-------------------------------------------------------------+
|                    BIOLOGICAL CYCLE SCHEMATIC               |
+-------------------------------------------------------------+
   Light Energy + H2O ---> [ Light Reactions (Thylakoid) ] ---> ATP + NADPH
                                      |
                                      v
   CO2 --------------> [ Calvin Cycle (Stroma) ] -------------> Glucose (C6H12O6)
`;
  } else {
    diagramAscii = `
+-------------------------------------------------------------+
|                 CONCEPTUAL LEARNING BLUEPRINT               |
+-------------------------------------------------------------+
   1. Core Foundation  --->  2. Transformation  --->  3. Practical Application
         (Axiom)                 (Mechanism)               (Mastery & Recall)
`;
  }

  const diagrams: StudentDiagram[] = [
    {
      title: `System Concept Map: ${cleanTopicTitle}`,
      asciiArt: diagramAscii.trim(),
      svgType: isBiology ? 'cycle' : isMath ? 'layers' : isCS ? 'flowchart' : 'comparison',
      explanation:
        'This diagram visualizes how inputs transition through key mechanisms to produce the verified outcome while maintaining fundamental conservation balance.',
    },
  ];

  // 6. Key Revision Terms (Flashcard style)
  const keyTerms: RevisionItem[] = [
    {
      term: 'First Principles',
      definition:
        'The foundational, irreducible truths from which all higher-level reasoning is constructed.',
      analogy: 'The individual LEGO bricks from which any complex castle can be assembled.',
      mnemonic: 'F-I-R-S-T: Foundation, Invariance, Reason, Simplification, Truth.',
    },
    {
      term: 'Active Recall',
      definition:
        'The learning technique of actively retrieving information from memory rather than passively re-reading.',
      analogy: 'Exercising a muscle by lifting a weight rather than watching someone else lift.',
      mnemonic: 'Recall > Re-read.',
    },
    {
      term: 'The Feynman Technique',
      definition:
        'Explaining a concept aloud in plain, jargon-free language to immediately expose gaps in understanding.',
      analogy: 'Teaching a 6th grader without using technical buzzwords.',
      mnemonic: 'Simple explanation = True mastery.',
    },
    {
      term: 'Equilibrium State',
      definition:
        'A balanced condition where opposing forces or rates cancel out, producing steady-state behavior.',
      analogy: 'A seesaw balanced perfectly level with equal weights on both sides.',
    },
  ];

  // 7. Interactive Quizzes (Multiple Choice with Explanations)
  const quizQuestion: StudentQuiz = {
    question: `Which approach best demonstrates true conceptual mastery of "${cleanTopicTitle}" over rote memorization?`,
    options: [
      'Being able to reconstruct the solution from first principles and explain it simply to someone else.',
      'Memorizing formula shortcuts without understanding where variables originate.',
      'Only solving problems that use identical numbers to textbook examples.',
      'Relying solely on software tools to compute answers without sanity checking.',
    ],
    correctIndex: 0,
    explanation:
      'True understanding allows you to reconstruct answers in novel situations, catch edge-case errors, and transfer knowledge across disciplines!',
    difficulty,
  };

  const additionalQuizzes: StudentQuiz[] = [
    {
      question: `When analyzing a system involving "${cleanTopicTitle}", what is the first step in rigorous problem solving?`,
      options: [
        'Identify knowns, unknowns, and the governing physical or logical constraints.',
        'Immediately plug numbers into the most complex formula available.',
        'Guess the final answer and work backwards to justify it.',
        'Ignore boundary conditions and assume unlimited ideal capacity.',
      ],
      correctIndex: 0,
      explanation:
        'Correctly formulating the problem by stating knowns and constraints prevents 90% of downstream calculation errors.',
      difficulty,
    },
    {
      question: 'How does changing the scale of an input typically affect a non-linear process?',
      options: [
        'Outputs may exhibit threshold effects, saturation, or exponential shifts rather than a simple 1:1 ratio.',
        'Outputs always change by exactly the same fixed numerical percentage.',
        'Scale changes never affect physical or algorithmic systems.',
        'Non-linear systems are purely random and cannot be modeled.',
      ],
      correctIndex: 0,
      explanation:
        'Non-linear systems often hit capacity limits, saturation thresholds, or diminishing returns as scale increases.',
      difficulty,
    },
  ];

  // 8. Practice Questions with Hints & Step-by-Step Solutions (Anti-Cheating Friendly)
  const practiceQuestions: PracticeQuestion[] = [
    {
      id: 'pq-1',
      question: `Practice Problem 1: In a scenario involving ${cleanTopicTitle}, if the primary driver variable increases by a factor of 2 while damping resistance remains constant, what is the expected initial response?`,
      hint: 'Recall the direct relationship between driving force and system velocity before saturation occurs.',
      solution:
        'Step 1: Write the proportional relation $R \\propto F / D$.\nStep 2: Substitute $F_{new} = 2F_0$.\nStep 3: Since damping $D$ is constant, the response doubles ($R_{new} = 2 R_0$).\nStep 4: Verify boundary conditions to ensure no threshold limits were exceeded.',
      keyTakeaway:
        'Linear approximations hold accurately within moderate operational ranges.',
    },
    {
      id: 'pq-2',
      question: `Practice Problem 2: Identify the critical mistake in the following student assertion: "Because outcome B occurred after event A, event A must be the sole cause of B."`,
      hint: 'Think about post hoc ergo propter hoc (correlation vs. causation) and confounding background variables.',
      solution:
        'Step 1: Identify that temporal sequence (A before B) is necessary for causation, but not sufficient.\nStep 2: Check for lurking confounding variables that might simultaneously influence both A and B.\nStep 3: Propose a controlled test or counterfactual scenario to isolate causal impact.',
      keyTakeaway:
        'Always isolate confounding variables before attributing direct causality.',
    },
  ];

  // 9. Revision Checklist
  const revisionChecklist: string[] = [
    `Defined ${cleanTopicTitle} in your own plain words without looking at notes.`,
    'Identified the 3 key governing variables and their units/types.',
    'Completed the interactive quiz and scored 100%.',
    'Worked through at least one practice problem using the hint-guided method.',
    'Explained the core analogy to test your retention (Feynman Technique).',
  ];

  // 10. Curated Educational Resources
  const resources: EducationalResource[] = [
    {
      title: 'Khan Academy Interactive Library',
      provider: 'Khan Academy',
      type: 'course',
      url: 'https://www.khanacademy.org',
      description: 'Free world-class mastery-based video lessons and interactive exercises.',
      difficulty: 'beginner',
    },
    {
      title: 'MIT OpenCourseWare (OCW)',
      provider: 'MIT',
      type: 'course',
      url: 'https://ocw.mit.edu',
      description: 'Full lecture notes, exams, and video recordings from official MIT curriculum.',
      difficulty: 'advanced',
    },
    {
      title: '3Blue1Brown Visual Essence Series',
      provider: '3Blue1Brown',
      type: 'video',
      url: 'https://www.3blue1brown.com',
      description: 'Deep intuitive visual animations deconstructing math, physics, and neural networks.',
      difficulty: 'intermediate',
    },
    {
      title: 'PhET Interactive Science Simulations',
      provider: 'University of Colorado Boulder',
      type: 'interactive',
      url: 'https://phet.colorado.edu',
      description: 'Interactive STEM simulations for hands-on experimentation and intuition building.',
      difficulty: 'beginner',
    },
    {
      title: 'LibreTexts Open Textbook Collective',
      provider: 'LibreTexts',
      type: 'textbook',
      url: 'https://libretexts.org',
      description: 'Peer-reviewed open-access college textbooks covering STEM, humanities, and social sciences.',
      difficulty: 'intermediate',
    },
  ];

  return {
    coreConcept: cleanTopicTitle,
    difficulty,
    simpleExplanation,
    detailedExplanation,
    stepByStepSteps,
    examples,
    diagrams,
    keyTerms,
    quizQuestion,
    additionalQuizzes,
    practiceQuestions,
    practiceTip:
      'Try the Feynman Technique: spend 2 minutes summarizing this concept out loud in plain words. If you stumble on a step, revisit the breakdown!',
    revisionChecklist,
    resources,
    antiCheatingNotice: antiCheating.detectedCheatingAttempt ? antiCheating : undefined,
  };
}

/**
 * Compiles a comprehensive student learning and revision report
 */
export function generateStudentReport(
  topic: string,
  difficulty: StudentDifficulty,
  session: StudySessionState,
  insights?: StudentInsights
): StudentReportData {
  const resolvedInsights = insights || generateStudentInsights(topic, difficulty);
  const durationMinutes = Math.max(1, Math.round(session.elapsedSeconds / 60));

  const totalQuizzes = session.quizzesAnswered || 1;
  const correctQuizzes = session.quizzesCorrect || 1;
  const percentage = Math.round((correctQuizzes / totalQuizzes) * 100);

  return {
    reportId: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    generatedAt: Date.now(),
    topic: topic || 'Study Session Topic',
    difficulty,
    sessionDurationMinutes: Math.min(durationMinutes, 120), // capped at 2 hours
    coreConcept: resolvedInsights.coreConcept,
    summaryRecap: resolvedInsights.simpleExplanation,
    stepByStepSummary: (resolvedInsights.stepByStepSteps || []).map(
      (s) => `${s.title}: ${s.explanation}`
    ),
    keyDefinitions: (resolvedInsights.keyTerms || []).map((k) => ({
      term: k.term,
      definition: k.definition,
    })),
    quizScore: {
      total: totalQuizzes,
      correct: correctQuizzes,
      percentage,
    },
    practiceProblemsReviewed: resolvedInsights.practiceQuestions?.length || 0,
    recommendedResources: (resolvedInsights.resources || []).map((r) => ({
      title: r.title,
      provider: r.provider,
      url: r.url,
    })),
    feynmanChecklist: resolvedInsights.revisionChecklist || [],
  };
}
