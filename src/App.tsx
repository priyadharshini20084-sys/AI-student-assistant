import React, { useState, useEffect } from 'react';
import { Navigation, TabType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { NotesAssistantView } from './components/NotesAssistantView';
import { QuizAgentView } from './components/QuizAgentView';
import { DoubtSolverView } from './components/DoubtSolverView';
import { CareerAgentView } from './components/CareerAgentView';
import { ChatView } from './components/ChatView';
import { SettingsView } from './components/SettingsView';
import {
  initialStudentProfile,
  sampleStudyPlan,
  sampleQuizResults
} from './data/demoData';
import { StudentProfile, StudyPlan, QuizResult, AgentRouteResult } from './types';
import { Sparkles, GraduationCap } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ai_student_dark_mode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Current active navigation tab
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Student Profile state
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('ai_student_profile');
    return saved ? JSON.parse(saved) : initialStudentProfile;
  });

  // Active Study Plan state
  const [activePlan, setActivePlan] = useState<StudyPlan>(() => {
    const saved = localStorage.getItem('ai_student_study_plan');
    return saved ? JSON.parse(saved) : sampleStudyPlan;
  });

  // Quiz Results history
  const [recentQuizzes, setRecentQuizzes] = useState<QuizResult[]>(() => {
    const saved = localStorage.getItem('ai_student_quizzes');
    return saved ? JSON.parse(saved) : sampleQuizResults;
  });

  // Dynamic prefill states for smooth inter-module jumping
  const [studyPlanPrefill, setStudyPlanPrefill] = useState<Record<string, any> | undefined>(undefined);
  const [quizPrefill, setQuizPrefill] = useState<Record<string, any> | undefined>(undefined);
  const [doubtPrefill, setDoubtPrefill] = useState<string | undefined>(undefined);
  const [chatPrefill, setChatPrefill] = useState<string | undefined>(undefined);

  // Sync theme to root html element
  useEffect(() => {
    localStorage.setItem('ai_student_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist profile
  useEffect(() => {
    localStorage.setItem('ai_student_profile', JSON.stringify(profile));
  }, [profile]);

  // Persist study plan
  useEffect(() => {
    localStorage.setItem('ai_student_study_plan', JSON.stringify(activePlan));
  }, [activePlan]);

  // Persist quizzes
  useEffect(() => {
    localStorage.setItem('ai_student_quizzes', JSON.stringify(recentQuizzes));
  }, [recentQuizzes]);

  // Reset to initial demo data
  const handleResetDemoData = () => {
    setProfile(initialStudentProfile);
    setActivePlan(sampleStudyPlan);
    setRecentQuizzes(sampleQuizResults);
    localStorage.removeItem('ai_student_profile');
    localStorage.removeItem('ai_student_study_plan');
    localStorage.removeItem('ai_student_quizzes');
  };

  // Add new quiz result
  const handleQuizCompleted = (result: QuizResult) => {
    setRecentQuizzes((prev) => [result, ...prev]);
  };

  // Handle centralized agent routing
  const handleRouteAction = (result: AgentRouteResult, originalPrompt: string) => {
    const feature = result.feature;
    const params = result.extractedParams || {};

    if (feature === 'study-planner') {
      setStudyPlanPrefill({
        prompt: originalPrompt,
        subject: params.subject || 'Deep Learning',
        daysCount: params.daysAvailable || 5,
        dailyHours: params.dailyHours || 4,
        topics: params.topics || ''
      });
      setCurrentTab('study-planner');
    } else if (feature === 'doubt-solver') {
      setDoubtPrefill(params.topic || originalPrompt);
      setCurrentTab('doubt-solver');
    } else if (feature === 'quiz-agent') {
      setQuizPrefill({
        subject: params.subject || 'Deep Learning',
        topic: params.topic || originalPrompt,
        difficulty: params.difficulty || 'Medium'
      });
      setCurrentTab('quiz-agent');
    } else if (feature === 'notes-assistant') {
      setCurrentTab('notes-assistant');
    } else if (feature === 'career-agent') {
      setCurrentTab('career-agent');
    } else {
      // Default to chat with prompt
      setChatPrefill(originalPrompt);
      setCurrentTab('chat');
    }
  };

  // Navigation with optional parameters
  const handleNavigate = (tab: TabType, params?: Record<string, any>) => {
    if (tab === 'doubt-solver' && params?.topic) {
      setDoubtPrefill(params.topic);
    }
    if (tab === 'quiz-agent' && params?.topic) {
      setQuizPrefill(params);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col antialiased ${darkMode ? 'dark' : ''}`}>
      <div className="flex-1 flex min-h-screen">
        {/* Responsive Navigation Sidebar */}
        <Navigation
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          profile={profile}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar for Desktop Context */}
          <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                AI Student Assistant &bull;
              </span>
              <span className="text-xs font-bold text-stone-900 dark:text-white capitalize">
                {currentTab.replace('-', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-300">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{profile.college}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini 2.5 Flash Agent</span>
              </div>
            </div>
          </header>

          {/* Tab Views */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                profile={profile}
                activePlan={activePlan}
                recentQuizzes={recentQuizzes}
                onNavigate={handleNavigate}
                onRouteAction={handleRouteAction}
              />
            )}

            {currentTab === 'study-planner' && (
              <StudyPlannerView
                profile={profile}
                activePlan={activePlan}
                onUpdatePlan={(plan) => setActivePlan(plan)}
                prefillParams={studyPlanPrefill}
              />
            )}

            {currentTab === 'notes-assistant' && (
              <NotesAssistantView />
            )}

            {currentTab === 'quiz-agent' && (
              <QuizAgentView
                profile={profile}
                onQuizCompleted={handleQuizCompleted}
                onOpenDoubtSolver={(topic) => handleNavigate('doubt-solver', { topic })}
                prefillParams={quizPrefill}
              />
            )}

            {currentTab === 'doubt-solver' && (
              <DoubtSolverView
                profile={profile}
                onOpenQuiz={(topic) => handleNavigate('quiz-agent', { topic })}
                prefillDoubt={doubtPrefill}
              />
            )}

            {currentTab === 'career-agent' && (
              <CareerAgentView profile={profile} />
            )}

            {currentTab === 'chat' && (
              <ChatView profile={profile} prefillMessage={chatPrefill} />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                profile={profile}
                onUpdateProfile={(p) => setProfile(p)}
                darkMode={darkMode}
                onToggleDarkMode={() => setDarkMode(!darkMode)}
                onResetDemoData={handleResetDemoData}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
