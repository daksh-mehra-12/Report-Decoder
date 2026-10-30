import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Loader2,
  ChevronDown,
  Globe
} from 'lucide-react';
import { ApiClient } from '../lib/api';
import { Report, ChatMessage } from '../types';

interface ChatAssistantProps {
  activeReport: Report | null;
  currentLang: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ activeReport, currentLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    sources?: Array<{
      source_id: string;
      name: string;
      organization: string;
      url: string;
    }>;
  }>>([
    {
      role: 'assistant',
      content:
        'Hello! I am your LabLens Educational Assistant. I can help explain laboratory terminology, what printed reference ranges signify, and what questions you might ask your doctor. Remember: I do not diagnose conditions or prescribe treatment.',
      sources: [
        {
          source_id: 'MEDLINEPLUS_OVERVIEW',
          name: 'MedlinePlus How to Understand Lab Results',
          organization: 'National Library of Medicine (NIH)',
          url: 'https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/'
        }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState(currentLang || 'en');
  const [selectedParamId, setSelectedParamId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLang) setSelectedLang(currentLang);
  }, [currentLang]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Build conversation history (excluding initial greeting to keep context clean)
      const history: ChatMessage[] = messages
        .filter((_, idx) => idx > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      // Attach context if user has an active report or selected parameter
      const context: any = {};
      if (activeReport) {
        context.report_id = activeReport.id;
        if (selectedParamId) {
          context.parameter_id = selectedParamId;
        }
      }

      const response = await ApiClient.sendChatMessage(
        userMsg,
        history,
        Object.keys(context).length > 0 ? context : undefined,
        selectedLang
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
          sources: response.sources
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `We encountered an issue connecting to the educational engine: ${err.message || 'Please check your connection and try again.'}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'What does this test measure?',
    'Why is an out-of-range result not a diagnosis?',
    'What questions should I ask my doctor?',
    'Can hydration affect laboratory results?'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#204D3B] text-white font-bold text-sm shadow-lg hover:bg-[#183a2d] hover:scale-105 active:scale-95 transition-all"
          aria-label="Open LabLens Educational Assistant"
        >
          <Sparkles className="w-5 h-5 text-[#A5BEB0]" />
          <span className="hidden sm:inline font-semibold">LabLens Assistant</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A5BEB0] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#A5BEB0]" />
          </span>
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[440px] h-[580px] max-h-[85vh] flex flex-col rounded-2xl bg-white border border-[#A5BEB0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-[#25292B] border-b border-[#A5BEB0]/30 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#204D3B] flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4 text-[#A5BEB0]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-xs sm:text-sm">LabLens Educational Assistant</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#A5BEB0] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Evidence-Linked • Anti-Diagnosis Guarded
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Selector */}
              <div className="flex items-center bg-[#1e2122] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white">
                <Globe className="w-3 h-3 text-[#A5BEB0] mr-1" />
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="en" className="bg-[#25292B] text-white">EN</option>
                  <option value="hi" className="bg-[#25292B] text-white">हिंदी</option>
                  <option value="hinglish" className="bg-[#25292B] text-white">Hinglish</option>
                </select>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Ribbon (if active report parameters exist) */}
          {activeReport && activeReport.parameters && activeReport.parameters.length > 0 && (
            <div className="px-3 py-1.5 bg-[#E5EEE6] border-b border-[#A5BEB0]/40 flex items-center justify-between text-[11px]">
              <span className="text-[#52635B] truncate max-w-[150px]">
                Report: <span className="text-[#25292B] font-mono font-semibold">{activeReport.file_name}</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[#52635B] font-medium">Focus:</span>
                <select
                  value={selectedParamId}
                  onChange={(e) => setSelectedParamId(e.target.value)}
                  className="bg-white text-[#25292B] border border-[#A5BEB0] rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                >
                  <option value="">All Parameters</option>
                  {activeReport.parameters.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.test_name} ({p.classification_status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Safety Disclaimer Banner */}
          <div className="px-3 py-1.5 bg-[#204D3B]/10 border-b border-[#204D3B]/20 flex items-center gap-1.5 text-[10px] text-[#204D3B] font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-[#204D3B] shrink-0" />
            <span>AI explains. Deterministic rules classify. Doctors diagnose.</span>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin text-xs bg-[#F9FBF9]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#204D3B] text-white font-medium rounded-tr-none'
                      : 'bg-white border border-[#A5BEB0]/60 text-[#25292B] rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Sources attached */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#A5BEB0]/40 space-y-1">
                      <div className="text-[10px] font-bold text-[#204D3B] uppercase tracking-wider font-mono">
                        Verified Sources:
                      </div>
                      {msg.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] text-[#204D3B] hover:underline"
                        >
                          <span>{src.name}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#52635B] p-2">
                <Loader2 className="w-4 h-4 text-[#204D3B] animate-spin" />
                <span className="italic">Consulting approved medical knowledge...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-1.5 bg-[#E5EEE6]/50 border-t border-[#A5BEB0]/40 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-[#E5EEE6] border border-[#A5BEB0] text-[10px] text-[#25292B] font-semibold transition-colors shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-[#A5BEB0]/40 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                selectedLang === 'hi'
                  ? 'अपनी रिपोर्ट या टेस्ट के बारे में पूछें...'
                  : selectedLang === 'hinglish'
                  ? 'Apni report ya test ke baare mein poochein...'
                  : 'Ask about report terminology or doctor questions...'
              }
              className="flex-1 bg-[#F4F8F5] border border-[#A5BEB0] focus:border-[#204D3B] rounded-xl px-3 py-2 text-xs text-[#25292B] placeholder:text-[#52635B] focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-xl bg-[#204D3B] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#183a2d] hover:scale-105 active:scale-95 transition-all shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

