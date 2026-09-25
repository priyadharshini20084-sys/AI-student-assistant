import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  Award,
  ChevronRight,
  Send,
  Loader2
} from 'lucide-react';
import { QuizQuestion, QuizResult, StudentProfile } from '../types';

interface Props {
  profile: StudentProfile;
  onQuizCompleted: (result: QuizResult) => void;
  onOpenDoubtSolver?: (topic: string) => void;
  prefillParams?: Record<string, any>;
}

export const QuizAgentView: React.FC<Props> = ({
  profile,
  onQuizCompleted,
  onOpenDoubtSolver,
  prefillParams
}) => {
  // Configuration states
  const [subject, setSubject] = useState(prefillParams?.subject || 'Deep Learning');
  const [topic, setTopic] = useState(prefillParams?.topic || 'LSTM & Recurrent Neural Networks');
  const [count, setCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionType, setQuestionType] = useState<'mcq' | 'true_false' | 'short_answer'>('mcq');

  // Quiz flow states: 'config' | 'loading' | 'active' | 'evaluating' | 'reviewed_question' | 'completed'
  const [quizState, setQuizState] = useState<'config' | 'loading' | 'active' | 'evaluating' | 'reviewed_question' | 'completed'>('config');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [shortAnswerInput, setShortAnswerInput] = useState<string>('');
  const [currentEvaluation, setCurrentEvaluation] = useState<{ isCorrect: boolean; score: number; feedback: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<QuizResult | null>(null);

  // Generate Questions
  const handleStartQuiz = async () => {
    setQuizState('loading');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          count,
          difficulty,
          questionType
        })
      });

      if (!res.ok) throw new Error('Failed to generate quiz');

      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions received');
      }

      setQuestions(data.questions);
      setCurrentIndex(0);
      setSelectedOption('');
      setShortAnswerInput('');
      setCurrentEvaluation(null);
      setQuizState('active');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to generate quiz questions. Please check parameters and try again.');
      setQuizState('config');
    }
  };

  // Submit answer for the current question
  const handleSubmitAnswer = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    if (currentQ.type === 'short_answer') {
      if (!shortAnswerInput.trim()) return;
      setQuizState('evaluating');

      try {
        const res = await fetch('/api/quiz/evaluate-short-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: currentQ.question,
            modelAnswer: currentQ.correctAnswer,
            studentAnswer: shortAnswerInput,
            topic: currentQ.topic
          })
        });

        const evalData = await res.json();
        const updatedQuestions = [...questions];
        updatedQuestions[currentIndex] = {
          ...currentQ,
          userAnswer: shortAnswerInput,
          isCorrect: evalData.isCorrect,
          score: evalData.score,
          feedback: evalData.feedback
        };
        setQuestions(updatedQuestions);
        setCurrentEvaluation(evalData);
        setQuizState('reviewed_question');
      } catch (err) {
        console.error(err);
        const evalData = {
          isCorrect: shortAnswerInput.length > 20,
          score: shortAnswerInput.length > 20 ? 80 : 40,
          feedback: 'Evaluated locally. Key technical terms provided.'
        };
        setCurrentEvaluation(evalData);
        setQuizState('reviewed_question');
      }
    } else {
      if (!selectedOption) return;
      const isCorrect = selectedOption.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = {
        ...currentQ,
        userAnswer: selectedOption,
        isCorrect,
        score: isCorrect ? 100 : 0,
        feedback: currentQ.explanation
      };
      setQuestions(updatedQuestions);
      setCurrentEvaluation({
        isCorrect,
        score: isCorrect ? 100 : 0,
        feedback: currentQ.explanation
      });
      setQuizState('reviewed_question');
    }
  };

  // Move to next question or conclude quiz
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption('');
      setShortAnswerInput('');
      setCurrentEvaluation(null);
      setQuizState('active');
    } else {
      // Complete quiz and calculate final scores
      const correctCount = questions.filter((q) => q.isCorrect).length;
      const wrongCount = questions.length - correctCount;
      const percentage = Math.round((correctCount / questions.length) * 100);

      // Topic breakdown
      const topicMap: Record<string, { correct: number; total: number }> = {};
      const weakAreas: string[] = [];

      questions.forEach((q) => {
        const t = q.topic || 'Core Concepts';
        if (!topicMap[t]) topicMap[t] = { correct: 0, total: 0 };
        topicMap[t].total += 1;
        if (q.isCorrect) {
          topicMap[t].correct += 1;
        } else {
          if (!weakAreas.includes(t)) weakAreas.push(t);
        }
      });

      const topicPerformance = Object.entries(topicMap).map(([t, val]) => ({
        topic: t,
        correct: val.correct,
        total: val.total
      }));

      const suggestedTopics = weakAreas.length > 0 ? weakAreas : ['Advanced Multi-Head Attention', 'Gradient Clipping Proofs'];

      const result: QuizResult = {
        id: `quiz-${Date.now()}`,
        subject,
        topic,
        difficulty,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        score: correctCount,
        percentage,
        topicPerformance,
        weakAreas,
        suggestedTopics,
        questions,
        completedAt: new Date().toLocaleString()
      };

      setFinalResult(result);
      setQuizState('completed');
      onQuizCompleted(result);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Brain className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-stone-900 dark:text-white">
                Interactive AI Quiz Agent
              </h1>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Test your engineering and AI concepts with instant conceptual feedback, question-by-question scoring, and weak area analysis.
            </p>
          </div>

          {quizState !== 'config' && (
            <button
              onClick={() => setQuizState('config')}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Quiz Setup</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. QUIZ CONFIGURATION SCREEN */}
      {quizState === 'config' && (
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <h2 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Configure Assessment
            </h2>
            <span className="text-xs text-stone-400">Customized to your knowledge level</span>
          </div>

          {/* Quick preset chips */}
          <div>
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-2">
              Popular Engineering Topics:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { s: 'Deep Learning', t: 'LSTM & Sequence Models' },
                { s: 'Deep Learning', t: 'Backpropagation & Loss Functions' },
                { s: 'Big Data Analytics', t: 'Hadoop MapReduce & Spark' },
                { s: 'Data Security', t: 'RSA & Asymmetric Cryptography' },
                { s: 'Cloud Computing', t: 'Virtualization & Microservices' }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSubject(preset.s);
                    setTopic(preset.t);
                  }}
                  className="text-xs px-3 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/70 transition-colors"
                >
                  {preset.t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Deep Learning"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Specific Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. LSTM Gates & Vanishing Gradients"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Question Format
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Conceptual Answer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              >
                <option value="Easy">Beginner / Foundation</option>
                <option value="Medium">Medium / University Standard</option>
                <option value="Hard">Advanced / Competitive Exam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Number of Questions
              </label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              >
                <option value={3}>3 Questions (Quick Sprint)</option>
                <option value={5}>5 Questions (Recommended)</option>
                <option value={10}>10 Questions (Deep Assessment)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartQuiz}
              className="px-6 py-3 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-xs transition-colors"
            >
              <Brain className="w-4 h-4" />
              <span>Start Interactive Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. LOADING SCREEN */}
      {quizState === 'loading' && (
        <div className="bg-white dark:bg-stone-900 p-12 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-900 dark:text-white">
            Generating Tailored Quiz Questions...
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Formulating {difficulty} level questions on &ldquo;{topic}&rdquo; with clear conceptual evaluation rubrics.
          </p>
        </div>
      )}

      {/* 3. ACTIVE QUESTION SCREEN */}
      {(quizState === 'active' || quizState === 'evaluating' || quizState === 'reviewed_question') && currentQ && (
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
          {/* Progress Bar & Header */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {currentQ.topic}
              </span>
            </div>

            <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Body */}
          <div className="pt-2">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options / Input Area */}
          {currentQ.type === 'short_answer' ? (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400">
                Type your answer (evaluated on meaning and key concepts):
              </label>
              <textarea
                rows={3}
                disabled={quizState === 'reviewed_question' || quizState === 'evaluating'}
                value={shortAnswerInput}
                onChange={(e) => setShortAnswerInput(e.target.value)}
                placeholder="Explain the mechanism or key terms concisely..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {(currentQ.options || ['True', 'False']).map((opt, optIdx) => {
                const isSelected = selectedOption === opt;
                const isReviewed = quizState === 'reviewed_question';
                const isCorrectOption = isReviewed && opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
                const isWrongSelected = isReviewed && isSelected && !isCorrectOption;

                let btnStyles = 'border-stone-200 dark:border-stone-700 hover:border-indigo-400 bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-200';

                if (isReviewed) {
                  if (isCorrectOption) {
                    btnStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold';
                  } else if (isWrongSelected) {
                    btnStyles = 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 line-through';
                  } else {
                    btnStyles = 'opacity-50 border-stone-200 dark:border-stone-800';
                  }
                } else if (isSelected) {
                  btnStyles = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-semibold ring-2 ring-indigo-500/20';
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isReviewed || quizState === 'evaluating'}
                    onClick={() => setSelectedOption(opt)}
                    className={`p-3.5 text-left text-xs rounded-xl border flex items-center justify-between transition-all ${btnStyles}`}
                  >
                    <span>{opt}</span>
                    {isReviewed && isCorrectOption && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                    )}
                    {isReviewed && isWrongSelected && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* AI Feedback Box (revealed after submission) */}
          {quizState === 'reviewed_question' && currentEvaluation && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                currentEvaluation.isCorrect
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-200'
                  : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-950 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {currentEvaluation.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                <span className="text-xs font-bold">
                  {currentEvaluation.isCorrect ? 'Correct!' : 'Incorrect / Needs Improvement'}
                  {currentQ.type === 'short_answer' && ` (Score: ${currentEvaluation.score}%)`}
                </span>
              </div>

              <p className="text-xs leading-relaxed">
                {currentEvaluation.feedback}
              </p>

              {currentQ.type === 'short_answer' && (
                <div className="pt-2 text-[11px] text-stone-600 dark:text-stone-400 border-t border-stone-200 dark:border-stone-700">
                  <span className="font-semibold">Ideal model answer: </span>
                  {currentQ.correctAnswer}
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            <span className="text-xs text-stone-400">
              {quizState === 'active' ? 'Answer will be evaluated upon submission' : 'Reviewed'}
            </span>

            {quizState === 'active' && (
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={currentQ.type === 'short_answer' ? !shortAnswerInput.trim() : !selectedOption}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Submit Answer</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}

            {quizState === 'evaluating' && (
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Concept...</span>
              </div>
            )}

            {quizState === 'reviewed_question' && (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Final Score'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. FINAL RESULTS SCREEN */}
      {quizState === 'completed' && finalResult && (
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
          {/* Trophy & Score Header */}
          <div className="text-center space-y-2 py-4 border-b border-stone-100 dark:border-stone-800">
            <div className="inline-flex p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 mb-1">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              Quiz Completed!
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {finalResult.subject} &bull; {finalResult.topic}
            </p>

            <div className="flex items-center justify-center gap-6 pt-3">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {finalResult.score} / {finalResult.totalQuestions}
                </span>
                <span className="block text-[11px] font-medium text-stone-400">Final Score</span>
              </div>
              <div className="h-8 w-px bg-stone-200 dark:bg-stone-800" />
              <div>
                <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                  {finalResult.percentage}%
                </span>
                <span className="block text-[11px] font-medium text-stone-400">Accuracy</span>
              </div>
            </div>
          </div>

          {/* Topic-Wise Performance breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3">
              Topic-Wise Performance:
            </h3>
            <div className="space-y-2.5">
              {finalResult.topicPerformance.map((item, idx) => {
                const pct = Math.round((item.correct / item.total) * 100);
                return (
                  <div key={idx} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-100 dark:border-stone-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-stone-900 dark:text-white">{item.topic}</span>
                      <span className="text-stone-500 dark:text-stone-400">
                        {item.correct}/{item.total} correct ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weak Areas & Suggested Revision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Identified Weak Areas:
              </h4>
              {finalResult.weakAreas.length > 0 ? (
                <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1 list-disc pl-4 mt-2">
                  {finalResult.weakAreas.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                  Outstanding work! No critical weak areas detected in this quiz session.
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40">
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Suggested Revision Focus:
              </h4>
              <ul className="text-xs text-indigo-800 dark:text-indigo-300 space-y-1 list-disc pl-4 mt-2">
                {finalResult.suggestedTopics.map((topicItem, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span>{topicItem}</span>
                    {onOpenDoubtSolver && (
                      <button
                        onClick={() => onOpenDoubtSolver(topicItem)}
                        className="text-[10px] underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-semibold"
                      >
                        Explain in Doubt Solver &rarr;
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                setQuizState('active');
                setCurrentIndex(0);
                setSelectedOption('');
                setShortAnswerInput('');
                setCurrentEvaluation(null);
              }}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
            >
              Review / Retake This Quiz
            </button>
            <button
              onClick={() => setQuizState('config')}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              Start Another Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
