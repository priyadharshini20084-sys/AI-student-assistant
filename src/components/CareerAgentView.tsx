import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Briefcase,
  Code,
  FolderGit2,
  FileCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Layers,
  Loader2
} from 'lucide-react';
import { CareerRoadmap, StudentProfile } from '../types';

interface Props {
  profile: StudentProfile;
}

export const CareerAgentView: React.FC<Props> = ({ profile }) => {
  const [degree, setDegree] = useState(profile.degree || 'B.Tech');
  const [branch, setBranch] = useState(profile.department || 'Artificial Intelligence & Data Science');
  const [year, setYear] = useState(profile.year || '3rd Year');
  const [skills, setSkills] = useState(profile.skills.join(', ') || 'Python, PyTorch, SQL, Git');
  const [programmingLanguages, setProgrammingLanguages] = useState('Python, C++, SQL');
  const [interests, setInterests] = useState('Deep Learning, Computer Vision, MLOps, LLMs');
  const [careerGoal, setCareerGoal] = useState(profile.careerInterest || 'Machine Learning Engineer');
  const [currentExperience, setCurrentExperience] = useState('Coursework projects and basic Kaggle competitions');
  const [preferredDomain, setPreferredDomain] = useState('AI & Data Systems');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [copied, setCopied] = useState(false);

  const careerGoalPresets = [
    'Machine Learning Engineer',
    'Data Scientist / AI Analyst',
    'MLOps & Cloud AI Architect',
    'Full Stack AI Application Developer',
    'Computer Vision Research Engineer'
  ];

  const handleGenerateRoadmap = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/career/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          degree,
          branch,
          year,
          skills: skills.split(',').map((s) => s.trim()),
          programmingLanguages,
          interests,
          careerGoal,
          currentExperience,
          preferredDomain,
          studentProfile: profile
        })
      });

      if (!res.ok) throw new Error('Roadmap generation failed');

      const data: CareerRoadmap = await res.json();
      setRoadmap(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to generate career roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRoadmap = () => {
    if (!roadmap) return;
    const text = `CAREER ROADMAP: ${roadmap.careerGoal} (${roadmap.degree} - ${roadmap.branch} - ${roadmap.year})
Skill Assessment: ${roadmap.sections.skillAssessment}
Projects:
${roadmap.sections.projectsToBuild.map((p) => `- [${p.level}] ${p.title}: ${p.description} (Tech: ${p.techStack.join(', ')})`).join('\n')}
Learning Sequence:
${roadmap.sections.suggestedLearningSequence.map((s) => `- ${s.weekOrPhase} [${s.focus}]: ${s.deliverables}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Compass className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-stone-900 dark:text-white">
                AI Career Agent & Roadmap
              </h1>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Personalized technical engineering roadmaps, portfolio projects, and placement interview strategies.
            </p>
          </div>

          {roadmap && (
            <button
              onClick={handleCopyRoadmap}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Roadmap'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Input Configuration Card */}
      <form
        onSubmit={handleGenerateRoadmap}
        className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs"
      >
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Student Academic & Career Parameters
          </h2>
          <span className="text-[11px] text-stone-400">
            Autofilled from your student profile
          </span>
        </div>

        {/* Quick Goal Presets */}
        <div>
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-1.5">
            Select Career Goal:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {careerGoalPresets.map((goal, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCareerGoal(goal)}
                className={`text-xs px-3 py-1 rounded-xl border transition-colors ${
                  careerGoal === goal
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Degree & Branch
            </label>
            <input
              type="text"
              value={`${degree} in ${branch}`}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Current Academic Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
            >
              <option value="1st Year">1st Year (Freshman)</option>
              <option value="2nd Year">2nd Year (Sophomore)</option>
              <option value="3rd Year">3rd Year (Junior)</option>
              <option value="4th Year">4th Year (Senior / Final Year)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Preferred Domain
            </label>
            <input
              type="text"
              value={preferredDomain}
              onChange={(e) => setPreferredDomain(e.target.value)}
              placeholder="e.g. AI Systems, Computer Vision, MLOps"
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Current Skills
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Python, PyTorch, SQL, Pandas"
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Programming Languages
            </label>
            <input
              type="text"
              value={programmingLanguages}
              onChange={(e) => setProgrammingLanguages(e.target.value)}
              placeholder="e.g. Python, C++, Java"
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Current Projects / Experience Level
          </label>
          <input
            type="text"
            value={currentExperience}
            onChange={(e) => setCurrentExperience(e.target.value)}
            placeholder="e.g. Built a CNN classifier for digit recognition, 2 mini-projects"
            className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center gap-2 shadow-xs transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Formulating 10-Section Roadmap...</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                <span>Generate Career Roadmap</span>
              </>
            )}
          </button>
        </div>
      </form>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ROADMAP PRESENTATION (10 Structured Sections) */}
      {roadmap && (
        <div className="space-y-6">
          {/* Market Disclaimer banner as mandated */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Market Verification Notice: </span>
              {roadmap.marketDisclaimer}
            </div>
          </div>

          {/* 1. Skill Assessment */}
          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Current Skill Assessment & Readiness</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {roadmap.sections.skillAssessment}
            </p>
          </div>

          {/* 2 & 3 & 4. Technical Foundations, Programming, AI/ML Skills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
              <span className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider block">
                2. Technical Foundations
              </span>
              <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1.5 list-disc pl-4">
                {roadmap.sections.technicalFoundations.map((tf, i) => (
                  <li key={i}>{tf}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
              <span className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider block">
                3. Programming & DSA Skills
              </span>
              <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1.5 list-disc pl-4">
                {roadmap.sections.programmingSkills.map((ps, i) => (
                  <li key={i}>{ps}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
              <span className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider block">
                4. AI / ML / DS Core Skills
              </span>
              <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1.5 list-disc pl-4">
                {roadmap.sections.aiMlDataScienceSkills.map((as, i) => (
                  <li key={i}>{as}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5. Projects to Build (Beginner, Intermediate, Capstone) */}
          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
              <span>5. Recommended Portfolio Projects (3 Tiers)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roadmap.sections.projectsToBuild.map((proj, pIdx) => (
                <div
                  key={pIdx}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        proj.level === 'Beginner'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                          : proj.level === 'Intermediate'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                      }`}
                    >
                      {proj.level} Tier
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white mt-1.5">
                      {proj.title}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-2 border-t border-stone-200 dark:border-stone-800">
                    {proj.techStack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200/60 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300 font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6 & 7. GitHub Portfolio & Internship Prep */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
              <span className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider block">
                6. GitHub & Portfolio Suggestions
              </span>
              <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1.5 list-disc pl-4">
                {roadmap.sections.portfolioSuggestions.map((ps, i) => (
                  <li key={i}>{ps}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
              <span className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider block">
                7. Internship & Campus Placement Preparation
              </span>
              <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1.5 list-disc pl-4">
                {roadmap.sections.internshipPreparation.map((ip, i) => (
                  <li key={i}>{ip}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 8 & 9. Resume & Interview Prep */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
              <span className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider block">
                8. Resume Preparation (ATS & Impact)
              </span>
              <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1.5 list-disc pl-4">
                {roadmap.sections.resumePreparation.map((rp, i) => (
                  <li key={i}>{rp}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
              <span className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider block">
                9. Technical & Behavioral Interview Strategy
              </span>
              <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1.5 list-disc pl-4">
                {roadmap.sections.interviewPreparation.map((iv, i) => (
                  <li key={i}>{iv}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 10. Suggested Learning Sequence */}
          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>10. Suggested Phased Learning Sequence</span>
            </div>

            <div className="space-y-2.5">
              {roadmap.sections.suggestedLearningSequence.map((phase, pIdx) => (
                <div
                  key={pIdx}
                  className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                      {phase.weekOrPhase}
                    </span>
                    <h5 className="font-semibold text-stone-900 dark:text-white">
                      Focus: {phase.focus}
                    </h5>
                  </div>
                  <div className="text-stone-600 dark:text-stone-400 text-xs sm:text-right max-w-md">
                    <span className="font-medium text-stone-500">Deliverables: </span>
                    {phase.deliverables}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
