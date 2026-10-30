import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Globe,
  FileText,
  RotateCcw,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { ApiClient } from '../../lib/api';
import { Report, ChatMessage } from '../../types';

interface ChatViewProps {
  reports: Report[];
  activeReport: Report | null;
  currentLang: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ reports, activeReport, currentLang }) => {
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
        'Welcome to Ask LabLens. I am your evidence-linked educational companion. I help explain clinical pathology terminology, reference range significance, and what questions you might ask your physician. I never diagnose conditions or prescribe medications.',
      sources: [
        {
          source_id: 'MEDLINEPLUS_GUIDE',
          name: 'MedlinePlus Guide to Understanding Lab Results',
          organization: 'National Library of Medicine (NIH)',
          url: 'https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/'
        }
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState(currentLang || 'en');
  const [selectedReportId, setSelectedReportId] = useState<string>(activeReport?.id || (reports[0]?.id ?? ''));
  const [selectedParamId, setSelectedParamId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSelectedReport = reports.find((r) => r.id === selectedReportId) || activeReport;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || isLoading) return;

    setInput('');
    const newHistory = [...messages, { role: 'user' as const, content: q }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const historyPayload: ChatMessage[] = newHistory.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const contextObj: any = {};
      if (selectedReportId) contextObj.report_id = selectedReportId;
      if (selectedParamId) contextObj.parameter_id = selectedParamId;

      const res = await ApiClient.sendChatMessage(
        q,
        historyPayload,
        contextObj,
        selectedLang
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          sources: res.sources
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Apologies, I encountered an error: ${err.message || 'Could not fetch response.'}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Chat history reset. How can I assist you with your laboratory reports today?'
      }
    ]);
  };

  const suggestedPrompts = [
    'What does Hemoglobin mean?',
    'Why can a normal test fluctuate?',
    'What questions should I ask my doctor?',
    'Explain this medical term in Hindi.'
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col rounded-2xl bg-white border border-[#A5BEB0]/60 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 bg-[#E5EEE6]/60 border-b border-[#A5BEB0]/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#204D3B] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#25292B]">LabLens Assistant</h2>
              <p className="text-xs text-[#204D3B] font-mono font-semibold">
                Understand your report, one question at a time.
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Context Selector, Language, Clear */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Report Focus */}
          {reports.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-[#A5BEB0] rounded-xl px-2.5 py-1 text-xs">
              <FileText className="w-3.5 h-3.5 text-[#204D3B]" />
              <select
                value={selectedReportId}
                onChange={(e) => {
                  setSelectedReportId(e.target.value);
                  setSelectedParamId('');
                }}
                className="bg-transparent text-[#25292B] focus:outline-none cursor-pointer max-w-[140px] truncate font-medium"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.file_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Parameter Focus */}
          {currentSelectedReport?.parameters && currentSelectedReport.parameters.length > 0 && (
            <div className="flex items-center gap-1 bg-white border border-[#A5BEB0] rounded-xl px-2 py-1 text-xs">
              <span className="text-[#52635B] text-[11px]">Analyte:</span>
              <select
                value={selectedParamId}
                onChange={(e) => setSelectedParamId(e.target.value)}
                className="bg-transparent text-[#204D3B] focus:outline-none cursor-pointer max-w-[130px] truncate font-semibold"
              >
                <option value="">All Parameters</option>
                {currentSelectedReport.parameters.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.test_name} ({p.classification_status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Language Toggle */}
          <div className="flex items-center gap-1.5 bg-white border border-[#A5BEB0] rounded-xl px-2.5 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-[#204D3B]" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent text-[#25292B] focus:outline-none cursor-pointer font-medium"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>

          {/* Clear button */}
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-[#52635B] hover:text-[#25292B] hover:bg-[#E5EEE6] transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Medical Safety Doctrine Banner */}
      <div className="px-4 py-2 bg-[#E5EEE6]/80 border-b border-[#A5BEB0]/60 flex items-center gap-2 text-xs text-[#204D3B] font-mono font-bold">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-[#204D3B]" />
        <span>Medical Doctrine: AI explains. Deterministic rules classify. Doctors diagnose.</span>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin bg-white">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#204D3B] text-white font-medium rounded-tr-none shadow-sm'
                  : 'bg-[#E5EEE6]/60 border border-[#A5BEB0]/60 text-[#25292B] rounded-tl-none shadow-2xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#A5BEB0]/40">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#204D3B] mb-1 font-bold">
                    Supporting Medical Sources:
                  </div>
                  <div className="space-y-1">
                    {msg.sources.map((s, sIdx) => (
                      <a
                        key={sIdx}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] text-[#204D3B] font-bold hover:underline mr-3"
                      >
                        <span>{s.name} ({s.organization})</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#52635B] p-2">
            <Loader2 className="w-4 h-4 text-[#204D3B] animate-spin" />
            <span className="italic">Consulting verified medical knowledge...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="px-4 py-2 bg-[#E5EEE6]/50 border-t border-[#A5BEB0]/50 flex gap-2 overflow-x-auto no-scrollbar">
        {suggestedPrompts.map((prompt, pIdx) => (
          <button
            key={pIdx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="shrink-0 px-3.5 py-1 rounded-full bg-white hover:bg-[#E5EEE6] text-xs text-[#25292B] border border-[#A5BEB0] transition-colors cursor-pointer font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-[#A5BEB0]/60 flex items-center gap-3">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask about lab test meaning, printed ranges, or doctor preparation..."
          className="flex-1 bg-white border border-[#A5BEB0] focus:border-[#204D3B] rounded-xl px-4 py-2.5 text-xs text-[#25292B] placeholder:text-[#52635B]/60 focus:outline-none resize-none font-medium"
          disabled={isLoading}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !input.trim()}
          className="p-3 rounded-xl bg-[#204D3B] hover:bg-[#204D3B]/90 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
