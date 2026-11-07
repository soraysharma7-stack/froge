import React, { useState } from 'react';
import {
  GraduationCap,
  X,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  ExternalLink,
  Printer,
  Sparkles,
} from 'lucide-react';
import { StudentReportData } from '../brain/student/types';

interface StudentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: StudentReportData | null;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const handleCopyMarkdown = () => {
    const stepSummary = Array.isArray(report.stepByStepSummary) ? report.stepByStepSummary : [];
    const definitions = Array.isArray(report.keyDefinitions) ? report.keyDefinitions : [];
    const feynmanList = Array.isArray(report.feynmanChecklist) ? report.feynmanChecklist : [];
    const resources = Array.isArray(report.recommendedResources) ? report.recommendedResources : [];

    const md = `# 🎓 FROGÉ Student Learning & Revision Report
**Topic:** ${report.topic}
**Difficulty Level:** ${report.difficulty.toUpperCase()}
**Session Duration:** ${report.sessionDurationMinutes} minutes
**Date:** ${new Date(report.generatedAt).toLocaleDateString()}

---

## 🌟 Core Concept & Summary
${report.summaryRecap}

---

## 🔍 Step-by-Step Framework
${stepSummary.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---

## 📖 Key Terms & Definitions
${definitions.map((k) => `* **${k.term}**: ${k.definition}`).join('\n')}

---

## 🎯 Mastery & Quiz Results
* **Score:** ${report.quizScore.correct} / ${report.quizScore.total} (${report.quizScore.percentage}%)
* **Practice Problems Reviewed:** ${report.practiceProblemsReviewed}

---

## 💡 Feynman Revision Checklist
${feynmanList.map((c) => `- [x] ${c}`).join('\n')}

---

## 🔗 Recommended Learning Resources
${resources.map((r) => `* [${r.title}](${r.url}) - ${r.provider}`).join('\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="student-report-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-zinc-50/80 border-b border-zinc-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">
                Student Revision & Learning Report
              </h2>
              <p className="text-[11px] text-zinc-500">
                Study session summary & mastery assessment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyMarkdown}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium flex items-center gap-1 transition-colors"
              title="Copy markdown study guide"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium flex items-center gap-1 transition-colors"
              title="Print study sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-zinc-200/70 text-zinc-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Top Metadata Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-100">
              <span className="text-[10px] font-semibold text-sky-800 uppercase tracking-wider block">
                Topic & Scope
              </span>
              <p className="font-bold text-zinc-900 text-xs mt-0.5 truncate">
                {report.topic}
              </p>
              <span className="text-[10px] text-sky-700 font-medium capitalize mt-1 inline-block">
                Level: {report.difficulty}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Mastery Score
              </span>
              <p className="font-bold text-emerald-900 text-xs mt-0.5">
                {report.quizScore.percentage}% Accuracy
              </p>
              <span className="text-[10px] text-emerald-700 font-medium mt-1 inline-block">
                {report.quizScore.correct} of {report.quizScore.total} questions
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block">
                Session Time
              </span>
              <div className="flex items-center gap-1 mt-0.5 font-bold text-amber-900 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{report.sessionDurationMinutes} mins</span>
              </div>
              <span className="text-[10px] text-amber-700 font-medium mt-1 inline-block">
                Max 2h planned
              </span>
            </div>
          </div>

          {/* Core Concept Summary */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-zinc-900 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Core Concept Intuition</span>
            </div>
            <p className="text-zinc-700 leading-relaxed">
              {report.summaryRecap}
            </p>
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2">
            <h4 className="font-bold text-zinc-900 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Phased Learning Progression</span>
            </h4>
            <div className="space-y-1.5 pl-1">
              {(report.stepByStepSummary || []).map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-zinc-700">
                  <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Definitions */}
          <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2">
            <h4 className="font-bold text-zinc-900 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Key Vocabulary & Flashcards</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(report.keyDefinitions || []).map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/60"
                >
                  <span className="font-bold text-zinc-900 block text-[11px]">
                    {item.term}
                  </span>
                  <p className="text-zinc-600 text-[11px] mt-0.5 leading-relaxed">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Feynman Mastery Checklist */}
          <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/70 space-y-1.5">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Feynman Revision Checklist</span>
            </h4>
            <ul className="space-y-1 pl-1 text-emerald-900 text-[11px]">
              {(report.feynmanChecklist || []).map((chk, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{chk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Resources */}
          <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2">
            <h4 className="font-bold text-zinc-900">Recommended Next Steps & External Resources</h4>
            <div className="space-y-1.5">
              {(report.recommendedResources || []).map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex items-center justify-between text-zinc-800 transition-colors"
                >
                  <div>
                    <span className="font-semibold text-[11px]">{res.title}</span>
                    <span className="text-[10px] text-zinc-500 ml-2">({res.provider})</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span>🎓 FROGÉ Socratic Educator · Academic Integrity Protected</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
