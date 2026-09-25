import React from 'react';
import {
  Calendar,
  FileText,
  Brain,
  HelpCircle,
  Compass,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
  CheckCircle2,
  TrendingUp,
  Target,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { StudentProfile, StudyPlan, QuizResult, AgentRouteResult } from '../types';
import { AgentRouterBar } from './AgentRouterBar';
import { TabType } from './Navigation';

interface Props {
  profile: StudentProfile;
  activePlan: StudyPlan;
  recentQuizzes: QuizResult[];
  onNavigate: (tab: TabType, params?: Record<string, any>) => void;
  onRouteAction: (result: AgentRouteResult, originalPrompt: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  profile,
  activePlan,
  recentQuizzes,
  onNavigate,
  onRouteAction
}) => {
  const completedDaysCount = activePlan.schedule.filter((d) => d.completed).length;
  const totalDays = activePlan.schedule.length;
  const planProgress = Math.round((completedDaysCount / totalDays) * 100);

  // Quick stats calculation
  const averageQuizScore =
    recentQuizzes.length > 0
      ? Math.round(
          recentQuizzes.reduce((acc, q) => acc + q.percentage, 0) / recentQuizzes.length
        )
      : 0;

  const quickActionCards = [
    {
      tab: 'study-planner' as TabType,
      title: 'Study Planner',
      badge: 'Active Plan',
      description: `${activePlan.subject} &bull; ${activePlan.daysCount} Days Schedule`,
      icon: Calendar,
      color: 'from-blue-500 to-indigo-600',
      actionText: 'View Timetable',
      extra: (
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-400 mb-1">
            <span>Progress: {completedDaysCount}/{totalDays} Days</span>
            <span className="font-semibold text-stone-900 dark:text-white">{planProgress}%</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full"
              style={{ width: `${planProgress}%` }}
            />
          </div>
        </div>
      )
    },
    {
      tab: 'notes-assistant' as TabType,
      title: 'Notes Assistant',
      badge: 'Document AI',
      description: 'Extract 2-mark & 16-mark questions, formulas, and cheat sheets.',
      icon: FileText,
      color: 'from-amber-500 to-orange-600',
      actionText: 'Analyze Notes',
      extra: (
        <div className="mt-3 flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>2 Sample Engineering Documents Ready</span>
        </div>
      )
    },
    {
      tab: 'quiz-agent' as TabType,
      title: 'Quiz Agent',
      badge: `${averageQuizScore}% Avg`,
      description: 'Interactive topic quizzes with conceptual grading & weak area insights.',
      icon: Brain,
      color: 'from-purple-500 to-pink-600',
      actionText: 'Start Assessment',
      extra: (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
          <Award className="w-3.5 h-3.5 text-purple-600" />
          <span>{recentQuizzes.length} Quizzes Completed</span>
        </div>
      )
    },
    {
      tab: 'doubt-solver' as TabType,
      title: 'Doubt Solver',
      badge: 'ELI5 to Exam',
      description: 'Multi-layer explanations with analogies, math formulations & exam answers.',
      icon: HelpCircle,
      color: 'from-emerald-500 to-teal-600',
      actionText: 'Solve Doubt',
      extra: (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Instant Step-by-Step Clarity</span>
        </div>
      )
    },
    {
      tab: 'career-agent' as TabType,
      title: 'Career Agent',
      badge: 'Roadmap',
      description: `Structured 10-section guidance towards ${profile.careerInterest}.`,
      icon: Compass,
      color: 'from-rose-500 to-red-600',
      actionText: 'Open Roadmap',
      extra: (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
          <Target className="w-3.5 h-3.5 text-rose-600" />
          <span>Placement & Project Sequence</span>
        </div>
      )
    },
    {
      tab: 'chat' as TabType,
      title: 'Assistant Chat',
      badge: 'Conversational',
      description: 'Ask any academic question, derivation, or study tip.',
      icon: MessageSquare,
      color: 'from-cyan-500 to-blue-600',
      actionText: 'Chat with AI',
      extra: (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>24/7 Engineering Tutor</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                {profile.degree} &bull; {profile.department}
              </span>
              <span className="text-xs text-stone-400">
                {profile.year} &bull; {profile.semester}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
              Welcome back, {profile.name}!
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              Targeting: <span className="font-semibold text-stone-700 dark:text-stone-300">{profile.targetExams}</span> &bull; Career Goal: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{profile.careerInterest}</span>
            </p>
          </div>

          {/* Quick Academic Readiness Pill */}
          <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-850 p-3.5 rounded-xl border border-stone-100 dark:border-stone-800">
            <div>
              <span className="text-[11px] font-medium text-stone-400 block">Study Plan</span>
              <span className="text-sm font-bold text-stone-900 dark:text-white">
                {planProgress}% Completed
              </span>
            </div>
            <div className="h-7 w-px bg-stone-200 dark:bg-stone-700" />
            <div>
              <span className="text-[11px] font-medium text-stone-400 block">Quiz Accuracy</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {averageQuizScore}% Avg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTRAL INTELLIGENT AGENT ROUTER BAR */}
      <AgentRouterBar profile={profile} onRouteAction={onRouteAction} />

      {/* Quick Action Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
            Academic AI Modules
          </h2>
          <span className="text-xs text-stone-400">Select an agent or ask above</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActionCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.tab}
                onClick={() => onNavigate(card.tab)}
                className="group bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div>
                  {card.extra}
                  <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>{card.actionText}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column: Active Plan Daily Breakdown & Recent Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's / Upcoming Study Schedule */}
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Active Study Timetable: {activePlan.subject}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('study-planner')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Schedule &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {activePlan.schedule.slice(0, 3).map((day, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-100 dark:border-stone-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-white">{day.date}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                        day.priority === 'High'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                      }`}
                    >
                      {day.priority}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 line-clamp-1">
                    {day.topics.join(', ')}
                  </p>
                </div>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium shrink-0">
                  {day.duration}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quiz Performance History */}
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Recent Quiz Assessments
              </h3>
            </div>
            <button
              onClick={() => onNavigate('quiz-agent')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Take New Quiz &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentQuizzes.length > 0 ? (
              recentQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-stone-900 dark:text-white">{quiz.topic}</h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {quiz.subject} &bull; {quiz.difficulty} &bull; {quiz.completedAt}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {quiz.score}/{quiz.totalQuestions}
                    </span>
                    <span className="block text-[10px] text-stone-400 font-medium">
                      ({quiz.percentage}%)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-stone-400">
                No quizzes taken yet. Test your knowledge with the Quiz Agent!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
