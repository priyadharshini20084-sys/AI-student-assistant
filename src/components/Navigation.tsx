import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Brain,
  HelpCircle,
  Compass,
  MessageSquare,
  Settings,
  Moon,
  Sun,
  GraduationCap,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { StudentProfile } from '../types';

export type TabType =
  | 'dashboard'
  | 'study-planner'
  | 'notes-assistant'
  | 'quiz-agent'
  | 'doubt-solver'
  | 'career-agent'
  | 'chat'
  | 'settings';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  profile: StudentProfile;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  darkMode,
  onToggleDarkMode,
  profile,
  mobileMenuOpen,
  onToggleMobileMenu
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard, badge: '' },
    { id: 'study-planner' as TabType, label: 'Study Planner', icon: Calendar, badge: 'AI' },
    { id: 'notes-assistant' as TabType, label: 'Notes Assistant', icon: FileText, badge: 'Docs' },
    { id: 'quiz-agent' as TabType, label: 'Quiz Agent', icon: Brain, badge: 'Interactive' },
    { id: 'doubt-solver' as TabType, label: 'Doubt Solver', icon: HelpCircle, badge: 'Instant' },
    { id: 'career-agent' as TabType, label: 'Career Agent', icon: Compass, badge: 'Roadmap' },
    { id: 'chat' as TabType, label: 'AI Assistant Chat', icon: MessageSquare, badge: '' },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings, badge: '' }
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-stone-900 dark:text-stone-100 text-sm leading-tight">
              AI Student Assistant
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Engineering & AI/DS</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Desktop & Collapsible Mobile Sidebar */}
      <aside
        className={`fixed lg:static top-[57px] lg:top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="hidden lg:flex items-center justify-between p-5 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-900 dark:text-white text-base tracking-tight">
                  Student AI Agent
                </span>
              </div>
              <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                B.Tech &bull; AI & DS
              </span>
            </div>
          </div>
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-stone-400 dark:text-stone-500">
            Agent Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  if (mobileMenuOpen) onToggleMobileMenu();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400 dark:text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card / Quick Profile */}
        <div className="p-3 border-t border-stone-200 dark:border-stone-800">
          <div
            onClick={() => onSelectTab('settings')}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/70 cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                {profile.name}
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                {profile.year} &bull; {profile.semester}
              </p>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={onToggleMobileMenu}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}
    </>
  );
};
