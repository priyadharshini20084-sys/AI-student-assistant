import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, CheckCircle2, HelpCircle, CornerDownLeft } from 'lucide-react';
import { AgentRouteResult, StudentProfile } from '../types';

interface Props {
  profile: StudentProfile;
  onRouteAction: (result: AgentRouteResult, originalPrompt: string) => void;
  className?: string;
}

export const AgentRouterBar: React.FC<Props> = ({ profile, onRouteAction, className = '' }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [routingStep, setRoutingStep] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<AgentRouteResult | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState('');

  const examplePrompts = [
    'I have 5 days to prepare for Deep Learning and 4 hrs/day',
    'Explain vanishing gradient in simple words with an analogy',
    'Test me on LSTM with 5 medium questions',
    'Generate important 16-mark questions from my notes',
    'I am a 3rd-year AI&DS student. What skills should I learn?'
  ];

  const handleRoute = async (userPrompt: string) => {
    const input = userPrompt.trim();
    if (!input) return;

    setLoading(true);
    setRoutingStep('Step 1: Analyzing student goal & intent...');
    setLastResult(null);

    try {
      setTimeout(() => {
        setRoutingStep('Step 2: Identifying optimal AI module & extracting parameters...');
      }, 400);

      const res = await fetch('/api/agent/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          currentProfile: profile
        })
      });

      const data: AgentRouteResult = await res.json();
      setRoutingStep('Step 3: Route finalized!');
      setLastResult(data);

      if (data.feature !== 'clarification' && (!data.missingInfo || data.missingInfo.length === 0)) {
        setTimeout(() => {
          onRouteAction(data, input);
          setLoading(false);
          setRoutingStep(null);
          setPrompt('');
        }, 700);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Routing failed:', err);
      setLoading(false);
      setRoutingStep(null);
      // Fallback
      onRouteAction({
        feature: 'chat',
        confidence: 0.7,
        reasoning: 'Continuing in Student Assistant Chat',
        extractedParams: {},
        suggestedAction: 'Open Chat'
      }, input);
    }
  };

  const handleClarificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarificationAnswer.trim() || !lastResult) return;
    const combinedPrompt = `${prompt}. Details: ${clarificationAnswer}`;
    setClarificationAnswer('');
    handleRoute(combinedPrompt);
  };

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-xs ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 dark:text-white">
          Intelligent Student Agent Router
        </h2>
      </div>

      <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
        Type your current study goal in plain English. The agent automatically figures out whether you need a study plan, doubt explanation, quiz, note extractor, or career roadmap.
      </p>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRoute(prompt);
        }}
        className="relative flex items-center"
      >
        <input
          id="agent-router-input"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. 'I have 5 days for Deep Learning' or 'Test me on LSTM' or 'Explain vanishing gradient'..."
          disabled={loading}
          className="w-full pl-4 pr-24 py-3.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
        />
        <button
          id="agent-router-submit"
          type="submit"
          disabled={loading || !prompt.trim()}
          className="absolute right-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Routing...</span>
            </>
          ) : (
            <>
              <span>Ask Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Reasoning Steps Display */}
      {routingStep && (
        <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-2.5 text-xs text-indigo-800 dark:text-indigo-200">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-medium">{routingStep}</span>
        </div>
      )}

      {/* Clarification prompt if agent needs more details */}
      {lastResult && (lastResult.feature === 'clarification' || (lastResult.missingInfo && lastResult.missingInfo.length > 0)) && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Agent needs quick clarification:
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                {lastResult.clarificationQuestion || lastResult.reasoning}
              </p>
              <form onSubmit={handleClarificationSubmit} className="mt-2.5 flex gap-2">
                <input
                  type="text"
                  value={clarificationAnswer}
                  onChange={(e) => setClarificationAnswer(e.target.value)}
                  placeholder="e.g. '4 hours per day' or 'Intermediate difficulty'..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium flex items-center gap-1"
                >
                  <span>Answer</span>
                  <CornerDownLeft className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quick Prompts Chips */}
      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mr-1">
          Try asking:
        </span>
        {examplePrompts.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPrompt(sample);
              handleRoute(sample);
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors"
          >
            &ldquo;{sample}&rdquo;
          </button>
        ))}
      </div>
    </div>
  );
};
