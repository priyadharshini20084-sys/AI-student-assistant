import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Loader2,
  CornerDownLeft,
  GraduationCap
} from 'lucide-react';
import { ChatMessage, StudentProfile } from '../types';
import { initialChatMessages } from '../data/demoData';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Props {
  profile: StudentProfile;
  prefillMessage?: string;
}

export const ChatView: React.FC<Props> = ({ profile, prefillMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [input, setInput] = useState(prefillMessage || '');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'How should I prepare for semester exams in 10 days?',
    'Explain the mathematical difference between Sigmoid and ReLU',
    'What are 3 high-impact portfolio projects for AI & DS placements?',
    'Give me a 1-day sprint plan to revise Computer Networks'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (userText = input) => {
    const text = userText.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newMessages.slice(-8),
          studentProfile: profile
        })
      });

      if (!res.ok) throw new Error('Chat failed');

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: 'I apologize, but I encountered a momentary connection hiccup. Please retry or ask another question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: `Hello ${profile.name}! Conversation cleared. What academic topic or exam preparation shall we tackle?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-110px)] max-h-[860px] bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
      {/* Chat Top Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
              <span>AI Student Assistant Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Personalized for {profile.name} &bull; {profile.department}
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                ) : (
                  <div className="relative group">
                    <MarkdownRenderer content={msg.text} />
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-200 dark:border-stone-800 text-[10px] text-stone-400">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-stone-600 to-stone-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs font-semibold text-xs">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Formulating academic guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-stone-50 dark:bg-stone-850/60 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-stone-400 shrink-0">Suggestions:</span>
        {suggestedPrompts.map((sp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(sp)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            {sp}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask any college, exam, or engineering doubt..."
          disabled={loading}
          className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
