import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  Volume2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  StudentInsights,
  StudentDifficulty,
  StudentReportData,
} from '../brain/student/types';
import { generateStudentReport } from '../brain/student';

interface StudentInsightsPanelProps {
  insights: StudentInsights;
  messageId: string;
  onOpenReportModal?: (report: StudentReportData) => void;
  onListenAudio?: () => void;
}

type TabType = 'intuition' | 'examples' | 'quiz' | 'practice' | 'revision' | 'resources';

export const StudentInsightsPanel: React.FC<StudentInsightsPanelProps> = ({
  insights,
  messageId,
  onOpenReportModal,
  onListenAudio,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('intuition');
  const [selectedQuizIdx, setSelectedQuizIdx] = useState<number | null>(null);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [activeDifficulty, setActiveDifficulty] = useState<StudentDifficulty>(
    insights.difficulty || 'intermediate'
  );

  const toggleHint = (id: string) => {
    setRevealedHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSolution = (id: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateReport = () => {
    if (onOpenReportModal) {
      const rep = generateStudentReport(
        insights.coreConcept,
        activeDifficulty,
        {
          plannedDurationMinutes: 45,
          elapsedSeconds: 1200,
          isActive: true,
          isPaused: false,
          startTime: Date.now() - 1200000,
          topicsCovered: [insights.coreConcept],
          quizzesAnswered: selectedQuizIdx !== null ? 1 : 0,
          quizzesCorrect:
            selectedQuizIdx === insights.quizQuestion?.correctIndex ? 1 : 0,
          sessionCompleted: false,
          breakReminderMinutes: 25,
        },
        insights
      );
      onOpenReportModal(rep);
    }
  };

  return (
    <div
      id={`student-insights-${messageId}`}
      className="mt-3.5 rounded-2xl border border-sky-200/80 bg-white shadow-2xs overflow-hidden text-xs"
    >
      {/* Top Academic Integrity Notice if detected */}
      {insights.antiCheatingNotice?.detectedCheatingAttempt && (
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200/80 flex items-start gap-2 text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[11px]">Academic Integrity Guardian: </span>
            <span className="text-[11px] leading-relaxed">
              {insights.antiCheatingNotice.guidanceMessage}
            </span>
          </div>
        </div>
      )}

      {/* Header Bar: Socratic Title & Action Buttons */}
      <div className="px-4 py-3 bg-sky-50/70 border-b border-sky-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-2xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 text-xs tracking-tight">
              Socratic Study Hub
            </h4>
            <span className="text-[10px] text-zinc-500 font-medium">
              Concept: {insights.coreConcept}
            </span>
          </div>
        </div>

        {/* Difficulty Pill & Action Buttons */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-white rounded-lg p-0.5 border border-sky-200/60 shadow-2xs">
            {(['beginner', 'intermediate', 'advanced'] as StudentDifficulty[]).map(
              (diff) => (
                <button
                  key={diff}
                  onClick={() => setActiveDifficulty(diff)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize transition-colors ${
                    activeDifficulty === diff
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {diff}
                </button>
              )
            )}
          </div>

          <button
            onClick={handleGenerateReport}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 border border-sky-200 text-sky-800 font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
            title="Generate student study & revision report"
          >
            <FileText className="w-3 h-3 text-sky-600" />
            <span>Study Report</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex border-b border-zinc-100 bg-zinc-50/50 px-2 overflow-x-auto text-[11px] select-none">
        <button
          onClick={() => setActiveTab('intuition')}
          className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'intuition'
              ? 'border-sky-600 text-sky-900 font-bold bg-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Intuition & Steps</span>
        </button>

        <button
          onClick={() => setActiveTab('examples')}
          className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'examples'
              ? 'border-sky-600 text-sky-900 font-bold bg-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Examples & Diagrams</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'quiz'
              ? 'border-sky-600 text-sky-900 font-bold bg-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Interactive Quiz</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'practice'
              ? 'border-sky-600 text-sky-900 font-bold bg-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>Practice Problems</span>
        </button>

        <button
          onClick={() => setActiveTab('revision')}
          className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'revision'
              ? 'border-sky-600 text-sky-900 font-bold bg-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-purple-600" />
          <span>Revision & Flashcards</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'resources'
              ? 'border-sky-600 text-sky-900 font-bold bg-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5 text-zinc-600" />
          <span>Resources</span>
        </button>
      </div>

      {/* Tab 1: Intuition & Step-by-Step Teaching */}
      {activeTab === 'intuition' && (
        <div className="p-4 space-y-4">
          {/* Simple Explanation Box */}
          <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-sky-900 font-bold">
              <Lightbulb className="w-4 h-4 text-sky-600" />
              <span>Simple Explanation (The 30-Second Intuition)</span>
            </div>
            <p className="text-zinc-700 leading-relaxed text-xs">
              {insights.simpleExplanation}
            </p>
          </div>

          {/* Phased Step-by-Step Progression */}
          <div className="space-y-2">
            <h5 className="font-bold text-zinc-900 flex items-center gap-1.5 text-xs">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Step-by-Step Teaching Progression</span>
            </h5>
            <div className="space-y-2">
              {(insights.stepByStepSteps || []).map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 text-xs">
                      {step.title}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px] flex items-center justify-center">
                      0{step.stepNumber}
                    </span>
                  </div>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    {step.explanation}
                  </p>
                  {step.tip && (
                    <div className="text-[11px] text-sky-800 bg-sky-50/80 px-2 py-1 rounded-md border border-sky-100 flex items-center gap-1 mt-1">
                      <Lightbulb className="w-3 h-3 text-sky-600 shrink-0" />
                      <span>{step.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Explanation Breakdown */}
          <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2">
            <h5 className="font-bold text-zinc-900">Detailed Conceptual Mechanics</h5>
            <p className="text-zinc-600 leading-relaxed whitespace-pre-line text-xs">
              {insights.detailedExplanation}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Examples & Diagrams */}
      {activeTab === 'examples' && (
        <div className="p-4 space-y-4">
          {/* Diagrams & Visual Conceptual Maps */}
          {(insights.diagrams || []).map((diag, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-800 space-y-2"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span className="font-bold text-xs text-zinc-100">{diag.title}</span>
                <span className="text-[10px] text-emerald-400 font-mono">Conceptual Map</span>
              </div>
              {diag.asciiArt && (
                <pre className="p-2 bg-black/40 rounded-lg text-[11px] font-mono overflow-x-auto text-emerald-300 leading-tight">
                  <code>{diag.asciiArt}</code>
                </pre>
              )}
              <p className="text-[11px] text-zinc-400 italic">{diag.explanation}</p>
            </div>
          ))}

          {/* Real-World Examples & Analogies */}
          <div className="space-y-3">
            {(insights.examples || []).map((ex, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2"
              >
                <h5 className="font-bold text-zinc-900 text-xs">{ex.title}</h5>
                <div className="space-y-1.5 text-xs text-zinc-700">
                  <div className="p-2 rounded-lg bg-white border border-zinc-100">
                    <span className="font-bold text-sky-800 text-[11px] block">
                      Everyday Analogy:
                    </span>
                    <p className="mt-0.5">{ex.realWorldAnalogy}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-zinc-100">
                    <span className="font-bold text-emerald-800 text-[11px] block">
                      Worked Calculation / Scenario:
                    </span>
                    <p className="mt-0.5">{ex.workedExample}</p>
                  </div>
                  {ex.counterExample && (
                    <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100 text-amber-950">
                      <span className="font-bold text-amber-900 text-[11px] block">
                        Watch Out For (Counter-example):
                      </span>
                      <p className="mt-0.5">{ex.counterExample}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Quiz */}
      {activeTab === 'quiz' && (
        <div className="p-4 space-y-3">
          {insights.quizQuestion && (
            <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-200/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <h5 className="font-bold text-sky-950 text-xs">Concept Check Quiz</h5>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  Mastery Check
                </span>
              </div>

              <p className="text-zinc-800 font-medium text-xs">
                {insights.quizQuestion.question}
              </p>

              <div className="space-y-1.5">
                {(insights.quizQuestion?.options || []).map((opt, idx) => {
                  const isSelected = selectedQuizIdx === idx;
                  const isCorrect = idx === insights.quizQuestion!.correctIndex;
                  const hasAnswered = selectedQuizIdx !== null;

                  let style = 'bg-white hover:bg-sky-50 text-zinc-800 border-zinc-200';
                  if (hasAnswered) {
                    if (isCorrect) {
                      style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                    } else if (isSelected) {
                      style = 'bg-red-50 border-red-400 text-red-900';
                    } else {
                      style = 'bg-white opacity-40 border-zinc-200 text-zinc-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedQuizIdx(idx)}
                      disabled={hasAnswered}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between gap-2 ${style}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedQuizIdx !== null && (
                <div className="p-2.5 rounded-lg bg-white border border-sky-200 text-zinc-800 text-[11px] leading-relaxed animate-fade-in">
                  <span className="font-bold text-sky-800">Why this is correct: </span>
                  {insights.quizQuestion.explanation}
                </div>
              )}
            </div>
          )}

          {/* Additional Quizzes if available */}
          {insights.additionalQuizzes && insights.additionalQuizzes.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <span className="font-bold text-zinc-900 text-xs block">Additional Practice Quiz</span>
              {(insights.additionalQuizzes || []).map((q, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1.5">
                  <p className="font-medium text-zinc-800 text-xs">{q.question}</p>
                  <ul className="space-y-1 pl-2 text-[11px] text-zinc-600">
                    {(q.options || []).map((opt, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-zinc-200 text-zinc-700 text-[9px] font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Practice Questions with Step-by-Step Solutions (Anti-Cheating Friendly) */}
      {activeTab === 'practice' && (
        <div className="p-4 space-y-3">
          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-900 text-[11px] flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Active Problem Solving:</strong> Try solving on scratch paper first, then consult the hint before revealing the solution!
            </span>
          </div>

          <div className="space-y-3">
            {(insights.practiceQuestions || []).map((pq) => {
              const isHintOpen = revealedHints[pq.id];
              const isSolOpen = revealedSolutions[pq.id];

              return (
                <div
                  key={pq.id}
                  className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2.5"
                >
                  <p className="font-semibold text-zinc-900 text-xs leading-relaxed">
                    {pq.question}
                  </p>

                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
                    <button
                      onClick={() => toggleHint(pq.id)}
                      className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Lightbulb className="w-3 h-3 text-amber-600" />
                      <span>{isHintOpen ? 'Hide Hint' : 'Show Hint'}</span>
                    </button>

                    <button
                      onClick={() => toggleSolution(pq.id)}
                      className="px-2.5 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3 text-sky-600" />
                      <span>{isSolOpen ? 'Hide Solution' : 'Reveal Step-by-Step Solution'}</span>
                    </button>
                  </div>

                  {isHintOpen && (
                    <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/70 text-amber-950 text-[11px] leading-relaxed">
                      <span className="font-bold">Guiding Hint: </span>
                      {pq.hint}
                    </div>
                  )}

                  {isSolOpen && (
                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800 text-[11px] space-y-1.5 animate-fade-in">
                      <span className="font-bold text-sky-900 block">
                        Step-by-Step Solution Breakdown:
                      </span>
                      <p className="whitespace-pre-line text-zinc-700 leading-relaxed">
                        {pq.solution}
                      </p>
                      <div className="pt-1.5 border-t border-zinc-200/60 font-semibold text-emerald-800">
                        Takeaway: {pq.keyTakeaway}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Flashcards & Revision */}
      {activeTab === 'revision' && (
        <div className="p-4 space-y-4">
          {/* Key Terms Flashcards */}
          <div className="space-y-2">
            <h5 className="font-bold text-zinc-900 flex items-center gap-1.5 text-xs">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>Core Vocabulary Flashcards</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(insights.keyTerms || []).map((term, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1"
                >
                  <span className="font-bold text-purple-900 text-xs block">
                    {term.term}
                  </span>
                  <p className="text-zinc-700 text-[11px] leading-relaxed">
                    {term.definition}
                  </p>
                  {term.analogy && (
                    <p className="text-[10px] text-zinc-500 italic mt-1">
                      Analogy: {term.analogy}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feynman Revision Checklist */}
          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
            <h5 className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Feynman Revision Checklist</span>
            </h5>
            <ul className="space-y-1 pl-1 text-emerald-900 text-[11px]">
              {(insights.revisionChecklist || []).map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Practice Tip */}
          {insights.practiceTip && (
            <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-sky-900 text-[11px] flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong>Study Strategy: </strong>
                {insights.practiceTip}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Curated Resources */}
      {activeTab === 'resources' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
            <span className="font-bold text-zinc-900 text-xs">
              Curated Educational Resources
            </span>
            <span className="text-[10px] text-zinc-400">Verified learning material</span>
          </div>

          <div className="space-y-2">
            {(insights.resources || []).map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex items-center justify-between transition-colors group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 text-xs group-hover:text-sky-700">
                      {res.title}
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                      {res.provider}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{res.description}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-sky-600 shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
