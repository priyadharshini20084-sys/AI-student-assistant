import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Layers,
  BookOpen,
  ArrowRight,
  MessageSquare,
  Copy,
  Check,
  Zap,
  GraduationCap,
  Code,
  Brain,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DoubtExplanation, StudentProfile } from '../types';

interface Props {
  profile: StudentProfile;
  onOpenQuiz?: (topic: string) => void;
  prefillDoubt?: string;
}

export const DoubtSolverView: React.FC<Props> = ({ profile, onOpenQuiz, prefillDoubt }) => {
  const [doubtInput, setDoubtInput] = useState(prefillDoubt || 'Explain vanishing gradient');
  const [level, setLevel] = useState<'Very Simple' | 'Beginner' | 'Intermediate' | 'Technical' | 'Exam Preparation'>('Beginner');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<DoubtExplanation | null>(null);
  const [followUpInput, setFollowUpInput] = useState('');
  const [copied, setCopied] = useState(false);

  const explanationLevels = [
    { id: 'Very Simple', label: 'Very Simple (ELI5)', desc: 'Zero jargon & intuitive analogies' },
    { id: 'Beginner', label: 'Beginner', desc: 'Standard engineering foundations' },
    { id: 'Intermediate', label: 'Intermediate', desc: 'Algorithmic steps & formulas' },
    { id: 'Technical', label: 'Technical / Math', desc: 'Deep derivations & proofs' },
    { id: 'Exam Preparation', label: 'Exam Preparation', desc: 'Point-wise for full university marks' },
  ];

  const popularDoubts = [
    'Explain vanishing gradient problem',
    'Why do we use ReLU instead of Sigmoid?',
    'What is the difference between CNN and RNN?',
    'How does Backpropagation calculate weight updates?',
    'Difference between Symmetric and Asymmetric encryption',
    'What is Overfitting and how do L1/L2 regularization prevent it?'
  ];

  const handleSolve = async (query = doubtInput, selectedLvl = level) => {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/doubt/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doubt: query,
          level: selectedLvl,
          studentProfile: profile
        })
      });

      if (!res.ok) throw new Error('Failed to solve doubt');
      const data: DoubtExplanation = await res.json();
      setExplanation(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to generate explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim() || !explanation) return;
    const combinedQuery = `${explanation.doubt}. Follow-up doubt: ${followUpInput}`;
    setDoubtInput(combinedQuery);
    setFollowUpInput('');
    handleSolve(combinedQuery, level);
  };

  const handleCopyExamAnswer = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation.examReadyAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <HelpCircle className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-bold text-stone-900 dark:text-white">
            AI Academic Doubt Solver
          </h1>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Get clear, multi-layered explanations from friendly ELI5 analogies to university exam-ready point-wise answers.
        </p>
      </div>

      {/* Input & Configuration Card */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
        {/* Doubt Question Input */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
            What concept or question are you stuck on?
          </label>
          <div className="relative">
            <input
              type="text"
              value={doubtInput}
              onChange={(e) => setDoubtInput(e.target.value)}
              placeholder="e.g. 'Explain vanishing gradient' or 'Why use Softmax over Sigmoid?'"
              className="w-full pl-4 pr-28 py-3 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            <button
              onClick={() => handleSolve(doubtInput, level)}
              disabled={loading || !doubtInput.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{loading ? 'Solving...' : 'Explain'}</span>
            </button>
          </div>
        </div>

        {/* Popular Doubts Chips */}
        <div>
          <span className="text-[11px] font-semibold text-stone-400 block mb-1.5">
            Suggested Engineering Doubts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {popularDoubts.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setDoubtInput(d);
                  handleSolve(d, level);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors"
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Explanation Level Selector */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
            Explanation Depth / Level:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {explanationLevels.map((lvl) => {
              const isSelected = level === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => {
                    setLevel(lvl.id as any);
                    if (explanation) {
                      handleSolve(doubtInput, lvl.id as any);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/30'
                      : 'border-stone-200 dark:border-stone-800 hover:border-indigo-300 text-stone-700 dark:text-stone-300 bg-stone-50/50 dark:bg-stone-850'
                  }`}
                >
                  <span className="block text-xs font-bold">{lvl.label}</span>
                  <span className="text-[10px] text-stone-400 leading-tight block mt-0.5">
                    {lvl.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
          <h3 className="text-sm font-bold text-stone-900 dark:text-white">
            Formulating {level} Explanation...
          </h3>
          <p className="text-xs text-stone-400">
            Synthesizing definitions, analogies, technical derivations, and exam rubrics.
          </p>
        </div>
      )}

      {/* Output Structured in the 7 Required Sections */}
      {!loading && explanation && (
        <div className="space-y-4">
          {/* Quick Actions Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
            <span className="font-semibold text-stone-900 dark:text-white">
              Solved: &ldquo;{explanation.doubt}&rdquo; &bull; <span className="text-indigo-600 dark:text-indigo-400">{explanation.level} Level</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSolve(explanation.doubt, 'Very Simple')}
                className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
              >
                Simplify Further
              </button>
              <button
                onClick={handleCopyExamAnswer}
                className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Exam Answer'}</span>
              </button>
              {onOpenQuiz && (
                <button
                  onClick={() => onOpenQuiz(explanation.doubt)}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1"
                >
                  <Brain className="w-3 h-3" />
                  <span>Test in Quiz</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 1: Simple Definition */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Simple Definition</span>
            </div>
            <p className="text-sm font-medium text-stone-900 dark:text-white leading-relaxed">
              {explanation.definition}
            </p>
          </div>

          {/* Section 2 & 3: Easy Explanation + Real World Analogy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                <span>2. Easy Explanation</span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                {explanation.easyExplanation}
              </p>
            </div>

            <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/20 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>3. Real-World Analogy</span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed italic">
                &ldquo;{explanation.analogy}&rdquo;
              </p>
            </div>
          </div>

          {/* Section 4: Technical Mechanics & Derivation */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              <Code className="w-3.5 h-3.5 text-indigo-600" />
              <span>4. Technical Mechanics & Mathematical Formulation</span>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line font-mono bg-stone-50 dark:bg-stone-850 p-3.5 rounded-xl border border-stone-100 dark:border-stone-800">
              {explanation.technicalDetails}
            </p>
          </div>

          {/* Section 5: Example or Code Snippet */}
          {explanation.exampleOrCode && (
            <div className="bg-stone-900 text-stone-100 p-5 rounded-2xl border border-stone-800 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <Code className="w-3.5 h-3.5" />
                <span>5. Concrete Implementation / Code Example</span>
              </div>
              <pre className="text-xs font-mono overflow-x-auto p-3 bg-stone-950 rounded-xl border border-stone-800 leading-relaxed text-indigo-200">
                {explanation.exampleOrCode}
              </pre>
            </div>
          )}

          {/* Section 6: Key Takeaway Points */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>6. High-Yield Key Takeaways</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 dark:text-stone-300">
              {explanation.keyPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-stone-50 dark:bg-stone-850 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 7: University Exam-Ready Answer */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>7. University Exam-Ready Answer (Full Marks Format)</span>
              </div>
              <button
                onClick={handleCopyExamAnswer}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-xs"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-stone-800 dark:text-stone-200 whitespace-pre-line leading-relaxed">
              {explanation.examReadyAnswer}
            </div>
          </div>

          {/* Follow-up Question Input Form */}
          <form onSubmit={handleFollowUp} className="flex gap-2 pt-2">
            <input
              type="text"
              value={followUpInput}
              onChange={(e) => setFollowUpInput(e.target.value)}
              placeholder="Ask a follow-up question (e.g. 'How does gradient clipping compare?')..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!followUpInput.trim() || loading}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center gap-1.5"
            >
              <span>Ask Follow-up</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
