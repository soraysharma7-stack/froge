import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  ShieldCheck,
  Award,
  AlertCircle,
} from 'lucide-react';
import { StudentDifficulty, StudySessionState } from '../brain/student/types';

interface StudentStudyToolbarProps {
  difficulty: StudentDifficulty;
  onChangeDifficulty: (difficulty: StudentDifficulty) => void;
  onQuickPrompt: (promptText: string) => void;
  onOpenReportModal: () => void;
  sessionState: StudySessionState;
  onUpdateSessionState: (updater: (prev: StudySessionState) => StudySessionState) => void;
}

export const StudentStudyToolbar: React.FC<StudentStudyToolbarProps> = ({
  difficulty,
  onChangeDifficulty,
  onQuickPrompt,
  onOpenReportModal,
  sessionState,
  onUpdateSessionState,
}) => {
  const [showDurationSelector, setShowDurationSelector] = useState(false);

  // Timer Tick effect (1 second intervals when active and not paused)
  useEffect(() => {
    if (!sessionState.isActive || sessionState.isPaused) return;

    const interval = setInterval(() => {
      onUpdateSessionState((prev) => {
        const maxSeconds = prev.plannedDurationMinutes * 60;
        const newElapsed = prev.elapsedSeconds + 1;

        // Check if maximum 2 hours (or planned duration) reached
        if (newElapsed >= maxSeconds) {
          return {
            ...prev,
            elapsedSeconds: maxSeconds,
            isPaused: true,
            sessionCompleted: true,
          };
        }

        return {
          ...prev,
          elapsedSeconds: newElapsed,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionState.isActive, sessionState.isPaused, onUpdateSessionState]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    onUpdateSessionState((prev) => ({
      ...prev,
      isActive: true,
      isPaused: !prev.isPaused,
    }));
  };

  const handleResetTimer = () => {
    onUpdateSessionState((prev) => ({
      ...prev,
      elapsedSeconds: 0,
      isPaused: false,
      sessionCompleted: false,
    }));
  };

  const handleChangePlannedDuration = (mins: number) => {
    // Max 120 minutes constraint
    const clampedMins = Math.min(120, Math.max(10, mins));
    onUpdateSessionState((prev) => ({
      ...prev,
      plannedDurationMinutes: clampedMins,
      sessionCompleted: false,
    }));
    setShowDurationSelector(false);
  };

  const totalPlannedSeconds = sessionState.plannedDurationMinutes * 60;
  const progressPercent = Math.min(
    100,
    Math.round((sessionState.elapsedSeconds / totalPlannedSeconds) * 100)
  );

  return (
    <div
      id="student-study-toolbar"
      className="bg-white border-b border-sky-100 shadow-2xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none"
    >
      {/* Left: Mode Title, Difficulty Selector, & Integrity Badge */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-sky-900 font-bold text-xs">
          <div className="w-5 h-5 rounded-md bg-sky-600 text-white flex items-center justify-center text-[10px]">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <span>Student Mode</span>
        </div>

        <span className="text-zinc-200 hidden sm:inline">|</span>

        {/* Difficulty Selector */}
        <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 border border-zinc-200/80">
          {(['beginner', 'intermediate', 'advanced'] as StudentDifficulty[]).map(
            (lvl) => (
              <button
                key={lvl}
                onClick={() => onChangeDifficulty(lvl)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize transition-all ${
                  difficulty === lvl
                    ? 'bg-white text-sky-900 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
                title={`Set explanation level to ${lvl}`}
              >
                {lvl}
              </button>
            )
          )}
        </div>

        {/* Socratic Academic Integrity Badge */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium"
          title="Socratic Learning Mode: FROGÉ explains concepts from first principles and does not encourage copy-paste cheating."
        >
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span className="hidden md:inline">Socratic Tutor (Anti-Cheating Protected)</span>
          <span className="md:hidden">Socratic</span>
        </div>
      </div>

      {/* Center & Right: 2-Hour Maximum Study Session Timer & Quick Lenses */}
      <div className="flex flex-wrap items-center gap-2.5 ml-auto">
        {/* Planned Maximum 2-Hour Session Timer */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-sky-50/70 border border-sky-200 text-sky-950 text-xs relative">
          <div className="flex items-center gap-1 font-mono font-bold text-[11px]">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>{formatTime(sessionState.elapsedSeconds)}</span>
            <span className="text-zinc-400 font-sans text-[10px]">
              / {sessionState.plannedDurationMinutes}m
            </span>
          </div>

          {/* Play / Pause Toggle */}
          <button
            onClick={handleToggleTimer}
            className="p-1 rounded hover:bg-sky-200/60 text-sky-800 transition-colors"
            title={sessionState.isPaused ? 'Resume study session' : 'Pause timer'}
          >
            {sessionState.isPaused ? (
              <Play className="w-3 h-3 text-emerald-600" />
            ) : (
              <Pause className="w-3 h-3 text-amber-600" />
            )}
          </button>

          {/* Reset Timer */}
          <button
            onClick={handleResetTimer}
            className="p-1 rounded hover:bg-sky-200/60 text-zinc-500 hover:text-zinc-800 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Duration Selector Trigger */}
          <button
            onClick={() => setShowDurationSelector(!showDurationSelector)}
            className="px-1.5 py-0.5 rounded bg-white border border-sky-200 text-[10px] font-semibold text-sky-800 hover:bg-sky-50 transition-colors"
            title="Choose planned session duration (max 2 hours)"
          >
            Duration
          </button>

          {/* Duration Popup Menu */}
          {showDurationSelector && (
            <div className="absolute right-0 top-full mt-1.5 w-44 p-2 bg-white rounded-xl shadow-lg border border-zinc-200 z-50 text-[11px] space-y-1 animate-fade-in">
              <span className="font-bold text-zinc-800 block px-1 text-[10px] uppercase tracking-wider">
                Planned Duration (Max 2h)
              </span>
              {[25, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleChangePlannedDuration(mins)}
                  className={`w-full text-left px-2 py-1 rounded flex items-center justify-between ${
                    sessionState.plannedDurationMinutes === mins
                      ? 'bg-sky-50 text-sky-900 font-bold'
                      : 'hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <span>
                    {mins} mins {mins === 120 ? '(2 hr Max)' : ''}
                  </span>
                  {sessionState.plannedDurationMinutes === mins && (
                    <span className="text-[10px] text-sky-600 font-bold">Active</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Generate Study Report Button */}
        <button
          onClick={onOpenReportModal}
          className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[11px] flex items-center gap-1.5 shadow-2xs transition-colors"
          title="Open student learning summary & revision report"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Study Report</span>
        </button>
      </div>

      {/* Session limit notice if 2-hour or planned limit is hit */}
      {sessionState.sessionCompleted && (
        <div className="w-full mt-1 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Study Session Complete!</strong> You reached your planned duration limit ({sessionState.plannedDurationMinutes} mins). Time for a well-deserved break!
            </span>
          </div>
          <button
            onClick={onOpenReportModal}
            className="px-2 py-0.5 rounded bg-emerald-600 text-white font-semibold text-[10px] hover:bg-emerald-700 transition-colors"
          >
            Review Report
          </button>
        </div>
      )}
    </div>
  );
};
