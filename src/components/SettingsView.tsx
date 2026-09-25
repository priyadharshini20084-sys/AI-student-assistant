import React, { useState } from 'react';
import {
  Settings,
  User,
  GraduationCap,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  Moon,
  Sun,
  Plus,
  X
} from 'lucide-react';
import { StudentProfile } from '../types';
import { initialStudentProfile } from '../data/demoData';

interface Props {
  profile: StudentProfile;
  onUpdateProfile: (p: StudentProfile) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<Props> = ({
  profile,
  onUpdateProfile,
  darkMode,
  onToggleDarkMode,
  onResetDemoData
}) => {
  const [formData, setFormData] = useState<StudentProfile>({ ...profile });
  const [newSkill, setNewSkill] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const addSkill = () => {
    if (!newSkill.trim() || formData.skills.includes(newSkill.trim())) return;
    setFormData({
      ...formData,
      skills: [...formData.skills, newSkill.trim()]
    });
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  const addSubject = () => {
    if (!newSubject.trim() || formData.subjects.includes(newSubject.trim())) return;
    setFormData({
      ...formData,
      subjects: [...formData.subjects, newSubject.trim()]
    });
    setNewSubject('');
  };

  const removeSubject = (index: number) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Settings className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-bold text-stone-900 dark:text-white">
            Student Profile & Preferences
          </h1>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Personalize your college credentials and branch details. All AI features use this context for custom plans and roadmaps.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Student profile updated successfully!</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-stone-900 dark:text-white">
              Academic Credentials
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                College / Institute Name
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Degree
              </label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. B.Tech / B.E."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Branch / Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Artificial Intelligence & Data Science"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Year & Semester
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="3rd Year"
                  className="w-1/2 px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
                <input
                  type="text"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  placeholder="Semester 6"
                  className="w-1/2 px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Primary Career Goal
              </label>
              <input
                type="text"
                value={formData.careerInterest}
                onChange={(e) => setFormData({ ...formData, careerInterest: e.target.value })}
                placeholder="e.g. Machine Learning Engineer"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Upcoming Target Exams
              </label>
              <input
                type="text"
                value={formData.targetExams}
                onChange={(e) => setFormData({ ...formData, targetExams: e.target.value })}
                placeholder="e.g. Semester 6 Finals, GATE 2027"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Current Semester Subjects & Skills */}
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-stone-900 dark:text-white">
              Current Semester Subjects & Skills
            </h2>
          </div>

          {/* Subjects Tag Manager */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Enrolled Subjects
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.subjects.map((sub, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs flex items-center gap-1.5"
                >
                  <span>{sub}</span>
                  <button
                    type="button"
                    onClick={() => removeSubject(idx)}
                    className="text-stone-400 hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Add subject (e.g. Compiler Design)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
              <button
                type="button"
                onClick={addSubject}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Skills Tag Manager */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Technical Skills & Tools
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-xs flex items-center gap-1.5"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="text-indigo-400 hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. Docker, Hugging Face)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Application Preferences & Reset */}
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <h2 className="text-sm font-bold text-stone-900 dark:text-white">
              Interface & System
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-900 dark:text-white">
                Theme Appearance
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Switch between clean light and distraction-free dark theme
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="px-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 text-stone-800 dark:text-stone-200 font-medium"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{darkMode ? 'Dark Theme' : 'Light Theme'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            <div>
              <p className="text-xs font-semibold text-stone-900 dark:text-white">
                Reset Sample Demo Data
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Restore pre-filled student data, quiz records, and study plan
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onResetDemoData();
                setFormData(initialStudentProfile);
              }}
              className="px-3 py-1.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
