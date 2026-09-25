import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  RefreshCw,
  Printer,
  Download,
  BookOpen,
  Sparkles,
  AlertCircle,
  Sliders,
  ChevronRight,
  Flame,
  Coffee,
  Copy,
  Check,
  Share2,
  FileText,
  RotateCcw,
  X,
  Send,
  ArrowUp
} from 'lucide-react';
import { StudyPlan, StudyPlanDay, StudentProfile } from '../types';
import { StudyPlanExportModal, generatePlanMarkdown } from './StudyPlanExportModal';

interface Props {
  profile: StudentProfile;
  activePlan: StudyPlan;
  onUpdatePlan: (plan: StudyPlan) => void;
  prefillParams?: Record<string, any>;
}

export const StudyPlannerView: React.FC<Props> = ({
  profile,
  activePlan,
  onUpdatePlan,
  prefillParams
}) => {
  const promptInputRef = useRef<HTMLInputElement>(null);

  // Prompt input state for natural language prompts (e.g. "Create a 7-day study plan for learning Python")
  const [promptInput, setPromptInput] = useState<string>(
    prefillParams?.prompt ||
    (prefillParams?.subject ? `Create a ${prefillParams?.daysCount || 5}-day study plan for ${prefillParams.subject}` : '')
  );

  const [isEditing, setIsEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [quickCopied, setQuickCopied] = useState(false);

  // Granular form states initialized with existing plan or prefilled params
  const [subject, setSubject] = useState(prefillParams?.subject || activePlan.subject || 'Deep Learning');
  const [topics, setTopics] = useState(
    prefillParams?.topics ||
    activePlan.topics ||
    'Feedforward Networks, Backpropagation Calculus, CNN Architectures, RNN & LSTM, Transformers & Attention'
  );
  const [daysCount, setDaysCount] = useState<number>(
    prefillParams?.daysCount || activePlan.daysCount || 5
  );
  const [dailyHours, setDailyHours] = useState<number>(
    prefillParams?.dailyHours || activePlan.dailyHours || 4
  );
  const [examDate, setExamDate] = useState(activePlan.examDate || '2026-09-28');
  const [knowledgeLevel, setKnowledgeLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    activePlan.knowledgeLevel || 'Intermediate'
  );
  const [preferredStudyTime, setPreferredStudyTime] = useState(
    activePlan.preferredStudyTime || 'Evening (6 PM - 10 PM)'
  );
  const [importantTopics, setImportantTopics] = useState(
    activePlan.importantTopics || 'LSTM gating equations, ResNet skip connections, Backpropagation derivations'
  );

  // Respond to incoming prefillParams (e.g., from Dashboard or centralized router)
  useEffect(() => {
    if (prefillParams) {
      if (prefillParams.prompt) {
        setPromptInput(prefillParams.prompt);
      } else if (prefillParams.subject) {
        setPromptInput(`Create a ${prefillParams.daysCount || 5}-day study plan for ${prefillParams.subject}`);
      }
      if (prefillParams.subject) setSubject(prefillParams.subject);
      if (prefillParams.daysCount) setDaysCount(prefillParams.daysCount);
      if (prefillParams.dailyHours) setDailyHours(prefillParams.dailyHours);
      if (prefillParams.topics) setTopics(prefillParams.topics);
    }
  }, [prefillParams]);

  // Toggle completion of a specific day in the timetable
  const toggleDayCompletion = (dayIndex: number) => {
    const newSchedule = [...activePlan.schedule];
    newSchedule[dayIndex] = {
      ...newSchedule[dayIndex],
      completed: !newSchedule[dayIndex].completed
    };

    const completedCount = newSchedule.filter((d) => d.completed).length;
    const progress = Math.round((completedCount / newSchedule.length) * 100);

    onUpdatePlan({
      ...activePlan,
      schedule: newSchedule,
      progress
    });
  };

  // Generate new plan via API (supports natural prompt or structured parameter inputs)
  const handleGeneratePlan = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    if (generating) return; // Prevent duplicate requests while generating

    const queryPrompt = (customPrompt !== undefined ? customPrompt : promptInput).trim();
    if (!queryPrompt && !subject.trim()) {
      setErrorMsg('Please enter a prompt (e.g., "Create a 7-day study plan for learning Python") or specify a subject.');
      return;
    }

    setGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/study-planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryPrompt,
          subject: subject.trim(),
          topics: topics.trim(),
          daysCount,
          dailyHours,
          examDate,
          knowledgeLevel,
          preferredStudyTime,
          importantTopics: importantTopics.trim(),
          studentProfile: profile
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate study timetable');
      }

      const newPlan: StudyPlan = await res.json();
      onUpdatePlan(newPlan);

      // Keep parameter form fields in sync with the newly generated plan
      if (newPlan.subject) setSubject(newPlan.subject);
      if (newPlan.daysCount) setDaysCount(newPlan.daysCount);
      if (newPlan.dailyHours) setDailyHours(newPlan.dailyHours);
      if (newPlan.topics) setTopics(newPlan.topics);
      if (newPlan.knowledgeLevel) setKnowledgeLevel(newPlan.knowledgeLevel);
      if (newPlan.preferredStudyTime) setPreferredStudyTime(newPlan.preferredStudyTime);

      // Keep prompt box active & populated or ready for next prompt
      if (customPrompt) {
        setPromptInput(customPrompt);
      }
    } catch (err: any) {
      console.error('Study planner error:', err);
      setErrorMsg(err.message || 'Could not reach the AI planner. Check your connection or retry.');
    } finally {
      setGenerating(false);
    }
  };

  // Reset to clear prompt and allow a fresh start
  const handleResetPlan = () => {
    setPromptInput('');
    setErrorMsg(null);
    setSubject('');
    setTopics('');
    setDaysCount(7);
    setDailyHours(3);
    setImportantTopics('');
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  };

  // Quick preset loader
  const applyPreset = (subj: string, days: number, hrs: number, topicsStr: string) => {
    setSubject(subj);
    setDaysCount(days);
    setDailyHours(hrs);
    setTopics(topicsStr);
    const presetPrompt = `Create a ${days}-day study plan for ${subj} (${hrs} hrs/day)`;
    setPromptInput(presetPrompt);
    handleGeneratePlan(undefined, presetPrompt);
  };

  // Export / Print helpers
  const handlePrint = () => {
    window.print();
  };

  const handleQuickCopyMarkdown = async () => {
    try {
      const markdown = generatePlanMarkdown(activePlan);
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(markdown);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = markdown;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setQuickCopied(true);
      setTimeout(() => setQuickCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with utilities */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-stone-900 dark:text-white">
              AI Study Planner
            </h1>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Personalized, realistic timetables designed for engineering syllabus coverage and exam prep.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Copy to Clipboard */}
          <button
            onClick={handleQuickCopyMarkdown}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
              quickCopied
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                : 'border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
            title="Copy structured Markdown with checklist to clipboard"
          >
            {quickCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Copied Markdown!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                <span>Copy Plan</span>
              </>
            )}
          </button>

          {/* Export & Download Modal Trigger */}
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            title="Export to file (.md, .txt, .csv, .json) or copy formatted text"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export & Download</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="px-2.5 py-2 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1 transition-colors"
            title="Print Plan"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Print</span>
          </button>
        </div>
      </div>

      {/* ALWAYS-VISIBLE AI STUDY PLAN PROMPT & GENERATOR CARD */}
      <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-white">
                Generate AI Study Timetable
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Enter your prompt to create a new study plan anytime. You can generate unlimited plans.
              </p>
            </div>
          </div>

          {/* New Plan / Reset & Edit Parameters controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetPlan}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 flex items-center gap-1.5 transition-colors"
              title="Clear prompt and reset to a clean state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Plan / Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-colors ${
                isEditing
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
              title="Fine-tune parameters like daily hours, exam date, and topic lists"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Hide Parameters' : 'Edit / Regenerate Plan'}</span>
            </button>
          </div>
        </div>

        {/* The Prompt Input Field & Primary Generate Button (Always Visible) */}
        <form onSubmit={(e) => handleGeneratePlan(e)} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                ref={promptInputRef}
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                disabled={generating}
                placeholder="e.g. 'Create a 7-day study plan for learning Python' or '14-day study plan for Machine Learning'..."
                className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 transition-all shadow-inner pr-8"
              />
              {promptInput && !generating && (
                <button
                  type="button"
                  onClick={() => setPromptInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                  title="Clear prompt"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={generating || (!promptInput.trim() && !subject.trim())}
              className="px-5 py-3 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating New Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate New Study Plan</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Suggested Prompts (One-click generation) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
              Try Prompt:
            </span>
            {[
              'Create a 7-day study plan for learning Python',
              'Create a 14-day study plan for learning Machine Learning',
              '5 days for Deep Learning, 4 hrs/day',
              '3 days rapid revision for Data Structures & Algorithms'
            ].map((suggestedPrompt) => (
              <button
                key={suggestedPrompt}
                type="button"
                disabled={generating}
                onClick={() => {
                  setPromptInput(suggestedPrompt);
                  handleGeneratePlan(undefined, suggestedPrompt);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700/80 transition-colors disabled:opacity-50"
              >
                {suggestedPrompt}
              </button>
            ))}
          </div>
        </form>

        {/* Collapsible Edit / Detailed Parameter Panel */}
        {isEditing && (
          <form
            onSubmit={(e) => handleGeneratePlan(e)}
            className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4"
          >
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                Detailed Timetable Parameters
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-stone-400">
                <span>Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('Deep Learning', 5, 4, 'CNN, RNN, LSTM, Attention, Transformers')}
                  className="underline hover:text-indigo-600 px-1"
                >
                  Deep Learning (5d)
                </button>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={() => applyPreset('Big Data Analytics', 3, 3, 'Hadoop HDFS, MapReduce, Apache Spark, NoSQL')}
                  className="underline hover:text-indigo-600 px-1"
                >
                  Big Data (3d)
                </button>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={() => applyPreset('Python Programming', 7, 2.5, 'Syntax, OOP, File I/O, NumPy, Pandas, Data Structures')}
                  className="underline hover:text-indigo-600 px-1"
                >
                  Python (7d)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Deep Learning, Python, Machine Learning"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Days Available ({daysCount} Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={daysCount}
                  onChange={(e) => setDaysCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Daily Study Hours ({dailyHours} Hours/Day)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Knowledge Level
                </label>
                <select
                  value={knowledgeLevel}
                  onChange={(e) => setKnowledgeLevel(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                >
                  <option value="Beginner">Beginner (Need fundamental foundations)</option>
                  <option value="Intermediate">Intermediate (Familiar with core concepts)</option>
                  <option value="Advanced">Advanced (Quick high-yield exam revision)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Preferred Study Slot
                </label>
                <select
                  value={preferredStudyTime}
                  onChange={(e) => setPreferredStudyTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                >
                  <option value="Morning (6 AM - 10 AM)">Morning (6 AM - 10 AM)</option>
                  <option value="Afternoon (1 PM - 5 PM)">Afternoon (1 PM - 5 PM)</option>
                  <option value="Evening (6 PM - 10 PM)">Evening (6 PM - 10 PM)</option>
                  <option value="Late Night (10 PM - 2 AM)">Late Night (10 PM - 2 AM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Target Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Topics to Cover
              </label>
              <textarea
                rows={2}
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="e.g. Unit 1: Foundations, Unit 2: Models & Algorithms, Unit 3: Projects..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                High-Priority / Important Topics (Optional)
              </label>
              <input
                type="text"
                value={importantTopics}
                onChange={(e) => setImportantTopics(e.target.value)}
                placeholder="e.g. Core derivations, high probability exam questions, code exercises"
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              >
                Close Parameters
              </button>
              <button
                type="submit"
                disabled={generating}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center gap-1.5 shadow-xs"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Regenerating Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Regenerate Plan with Custom Parameters</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Error Message Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-2 text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 p-1"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Plan Metrics / Progress bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-stone-50 dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Subject</span>
          <p className="text-sm font-bold text-stone-900 dark:text-white truncate">{activePlan.subject}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Commitment</span>
          <p className="text-sm font-bold text-stone-900 dark:text-white">
            {activePlan.dailyHours}h/day &bull; {activePlan.daysCount} Days
          </p>
        </div>
        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Knowledge Level</span>
          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{activePlan.knowledgeLevel}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Plan Progress</span>
            <span className="text-xs font-bold text-stone-900 dark:text-white">{activePlan.progress}%</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${activePlan.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Schedule Day Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
            Daily Study Timetable ({activePlan.schedule.length} Days)
          </h2>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Click day checkmark when completed
          </span>
        </div>

        <div className="space-y-3">
          {activePlan.schedule.map((day, idx) => (
            <div
              key={`day-${day.day}-${idx}`}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                day.completed
                  ? 'bg-stone-50/70 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-75'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDayCompletion(idx)}
                    className="mt-0.5 text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title={day.completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                  >
                    {day.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950/40" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {day.date || `Day ${day.day}`}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          day.priority === 'High'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : day.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        }`}
                      >
                        {day.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{day.duration}</span>
                </div>
              </div>

              {/* Day Details */}
              <div className="space-y-3 pl-8">
                {/* Topics list */}
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                    Topics to Learn
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {day.topics.map((t, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700/60 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Practice Tasks & Active Recall */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-800">
                    <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mb-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      Practice & Problem Solving
                    </span>
                    <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1 list-disc list-inside">
                      {day.practiceTasks?.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-800">
                    <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mb-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      Active Recall & Revision
                    </span>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      {day.revisionTime}
                    </p>
                  </div>
                </div>

                {/* Breaks & Wellness tip */}
                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800/60">
                  <div className="flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                    <span>{day.breakSuggestions}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick bottom action card to create another plan */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Want to create another study plan or explore another subject?
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleResetPlan}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Clear</span>
            </button>
            <button
              type="button"
              onClick={scrollToTop}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Create New Plan</span>
            </button>
          </div>
        </div>

        {/* Bottom Export & Sharing Card */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-stone-50 to-indigo-50/40 dark:from-stone-900 dark:to-indigo-950/20 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400">
              <Share2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Export or Share this Study Timetable
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Download formatted Markdown (.md), Excel/Sheets (CSV), JSON, or copy with ready-to-use task checklists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleQuickCopyMarkdown}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                quickCopied
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300'
              }`}
            >
              {quickCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={() => setExportModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Options</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export & Download Modal */}
      <StudyPlanExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        plan={activePlan}
      />
    </div>
  );
};
