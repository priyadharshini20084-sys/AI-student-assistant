import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Printer,
  Search,
  FileCheck,
  ChevronRight,
  FileCode,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { NoteDocument, NoteAnalysisType } from '../types';
import { sampleSampleDocuments } from '../data/demoData';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Props {
  prefillDocument?: NoteDocument;
}

export const NotesAssistantView: React.FC<Props> = ({ prefillDocument }) => {
  const [activeDoc, setActiveDoc] = useState<NoteDocument>(prefillDocument || sampleSampleDocuments[0]);
  const [analysisType, setAnalysisType] = useState<NoteAnalysisType>('concepts');
  const [specificTopic, setSpecificTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);

  // The 7 required action options
  const actionOptions: { id: NoteAnalysisType; label: string; icon: any; description: string }[] = [
    { id: 'concepts', label: 'A. Important Concepts', icon: BookOpen, description: 'Core definitions, formulas & why they matter' },
    { id: 'short_notes', label: 'B. Short Notes', icon: FileText, description: 'Bulleted high-yield cheat sheet' },
    { id: 'two_mark', label: 'C. 2-Mark Questions', icon: HelpCircle, description: 'Concise, high-scoring university answers' },
    { id: 'sixteen_mark', label: 'D. 16-Mark Questions', icon: Cpu, description: 'Structured with headings, diagrams & examples' },
    { id: 'summary', label: 'E. Summary', icon: FileCheck, description: 'High-level synthesis of syllabus unit' },
    { id: 'topic_explain', label: 'F. Explain Specific Topic', icon: Search, description: 'Targeted deep-dive on single topic' },
    { id: 'revision_notes', label: 'G. Revision Notes', icon: Sparkles, description: 'Formula sheets & comparison tables' },
  ];

  const handleRunAnalysis = async (typeToRun = analysisType) => {
    if (!activeDoc || !activeDoc.content.trim()) {
      setErrorMsg('Please upload or load a document first.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setAnalysisType(typeToRun);

    try {
      const res = await fetch('/api/notes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentContent: activeDoc.content,
          fileName: activeDoc.fileName,
          analysisType: typeToRun,
          specificTopic: specificTopic.trim()
        })
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data = await res.json();
      setAnalysisResult(data.result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to process document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      const estimatedPages = Math.max(1, Math.round(content.length / 2200));
      const newDoc: NoteDocument = {
        id: `doc-${Date.now()}`,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        estimatedPages,
        content,
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      setActiveDoc(newDoc);
      setAnalysisResult(null);
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    if (!customText.trim()) return;
    const newDoc: NoteDocument = {
      id: `doc-${Date.now()}`,
      fileName: 'Pasted_Lecture_Notes.txt',
      fileSize: `${(customText.length / 1024).toFixed(1)} KB`,
      estimatedPages: Math.max(1, Math.round(customText.length / 2200)),
      content: customText,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setActiveDoc(newDoc);
    setCustomText('');
    setShowPasteArea(false);
    setAnalysisResult(null);
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-stone-900 dark:text-white">
                Notes Assistant
              </h1>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Upload PDF or lecture notes to extract exam questions, formulas, and structured study notes without hallucinations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPasteArea(!showPasteArea)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
            >
              {showPasteArea ? 'Hide Text Area' : 'Paste Raw Text'}
            </button>
            <div className="text-[11px] text-stone-400 hidden sm:block">
              Sample Notes:
            </div>
            {sampleSampleDocuments.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  setActiveDoc(doc);
                  setAnalysisResult(null);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-xl border transition-colors ${
                  activeDoc.id === doc.id
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {doc.fileName.split('_')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Paste notes modal/area */}
      {showPasteArea && (
        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 space-y-2">
          <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200">
            Paste Lecture Notes / PDF Text:
          </label>
          <textarea
            rows={4}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Paste syllabus content, textbook paragraphs, or slide transcripts here..."
            className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-mono"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowPasteArea(false)}
              className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700"
            >
              Cancel
            </button>
            <button
              onClick={handlePasteSubmit}
              disabled={!customText.trim()}
              className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white"
            >
              Use This Text
            </button>
          </div>
        </div>
      )}

      {/* Document Viewer / Info Banner */}
      <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-900 dark:text-white">
                  {activeDoc.fileName}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Processed
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Size: {activeDoc.fileSize} &bull; ~{activeDoc.estimatedPages} Pages &bull; {activeDoc.content.length} characters
              </p>
            </div>
          </div>

          {/* Upload Button & Dropzone */}
          <div className="flex items-center gap-2">
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl border border-dashed cursor-pointer flex items-center gap-1.5 transition-colors ${
                isDragOver
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600'
                  : 'border-stone-300 dark:border-stone-700 hover:border-indigo-500 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Notes (PDF / TXT)</span>
              <input
                type="file"
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Document Content Sneak Peek (Collapsible) */}
        <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 text-[11px] font-mono text-stone-600 dark:text-stone-400 line-clamp-2 bg-white/60 dark:bg-stone-900/60 p-2.5 rounded-lg">
          {activeDoc.content.slice(0, 240)}...
        </div>
      </div>

      {/* 7 Action Mode Selectors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
            Select Analysis Operation:
          </h2>
          <span className="text-[11px] text-stone-400">
            Strictly grounded on uploaded text
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {actionOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = analysisType === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleRunAnalysis(opt.id)}
                disabled={loading}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 hover:border-indigo-300 dark:hover:border-indigo-800 bg-white dark:bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400'}`} />
                  <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-stone-900 dark:text-white'}`}>
                    {opt.label}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Specific Topic Input if 'topic_explain' is active */}
      {analysisType === 'topic_explain' && (
        <div className="flex gap-2 p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/50">
          <input
            type="text"
            value={specificTopic}
            onChange={(e) => setSpecificTopic(e.target.value)}
            placeholder="Enter the specific topic to explain from the document (e.g. 'Forget Gate mechanism' or 'RSA Key Generation')..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
          />
          <button
            onClick={() => handleRunAnalysis('topic_explain')}
            disabled={loading}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Explain Topic
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-white">
            Analyzing document with AI...
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Extracting definitions, formulas, and structuring exam-ready content from &ldquo;{activeDoc.fileName}&rdquo;.
          </p>
        </div>
      )}

      {/* Results Screen */}
      {!loading && analysisResult && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900 dark:text-white">
                Generated {actionOptions.find((a) => a.id === analysisType)?.label}
              </span>
              <span className="text-[11px] text-stone-400">
                &bull; Source: {activeDoc.fileName}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center gap-1"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center gap-1"
                title="Print response"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <MarkdownRenderer content={analysisResult} />
          </div>
        </div>
      )}

      {/* Empty Initial State Prompt */}
      {!loading && !analysisResult && (
        <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-center space-y-2">
          <FileText className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
          <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
            Ready to generate university study notes
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Click any of the 7 buttons above (e.g. &ldquo;C. 2-Mark Questions&rdquo; or &ldquo;D. 16-Mark Questions&rdquo;) to analyze &ldquo;{activeDoc.fileName}&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
};
