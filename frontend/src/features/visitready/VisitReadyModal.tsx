import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Download, Globe, HelpCircle, CheckCircle2, UserCheck, Stethoscope } from 'lucide-react';
import { VisitReadyData, Report } from '../../types';
import { ApiClient } from '../../lib/api';

interface VisitReadyModalProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf: () => void;
}

export const VisitReadyModal: React.FC<VisitReadyModalProps> = ({
  report,
  isOpen,
  onClose,
  onDownloadPdf,
}) => {
  const [lang, setLang] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [data, setData] = useState<VisitReadyData | null>(null);
  const [loading, setLoading] = useState(false);

  // Optional patient context questionnaire state
  const [showContextForm, setShowContextForm] = useState(false);
  const [ageGroup, setAgeGroup] = useState('Adult (18-64)');
  const [fastingStatus, setFastingStatus] = useState('Yes, 10-12 hours overnight');
  const [symptoms, setSymptoms] = useState('Mild fatigue');
  const [medications, setMedications] = useState('None / Multivitamin');

  const fetchSummary = async (language = lang, contextPayload?: any) => {
    setLoading(true);
    try {
      if (contextPayload) {
        const res = await ApiClient.getVisitReadyWithContext(report.id, contextPayload, language);
        setData(res);
      } else {
        const res = await ApiClient.getVisitReady(report.id, language);
        setData(res);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSummary(lang);
    }
  }, [isOpen, lang, report.id]);

  const handleApplyContext = (e: React.FormEvent) => {
    e.preventDefault();
    const ctx = {
      age_group: ageGroup,
      fasting_status: fastingStatus,
      symptoms: symptoms ? symptoms.split(',').map((s) => s.trim()) : [],
      medications: medications ? medications.split(',').map((m) => m.trim()) : [],
    };
    fetchSummary(lang, ctx);
    setShowContextForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-[#A5BEB0] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#A5BEB0]/40 bg-[#E5EEE6]/50">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#204D3B]" />
              <h3 className="text-lg font-bold text-[#25292B]">VisitReady™ Doctor Prep</h3>
            </div>
            <p className="text-xs text-[#52635B] mt-0.5">
              Prepare for an informed, evidence-guided consultation with your clinician.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#52635B] hover:text-[#25292B] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Language Switch & Optional Context Toggle */}
        <div className="px-6 py-3 bg-[#E5EEE6]/30 border-b border-[#A5BEB0]/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#52635B]" />
            <span className="text-xs text-[#52635B] font-semibold">Language:</span>
            <div className="flex bg-white border border-[#A5BEB0] rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  lang === 'en' ? 'bg-[#204D3B] text-white' : 'text-[#52635B] hover:text-[#25292B]'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  lang === 'hi' ? 'bg-[#204D3B] text-white' : 'text-[#52635B] hover:text-[#25292B]'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLang('hinglish')}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  lang === 'hinglish' ? 'bg-[#204D3B] text-white' : 'text-[#52635B] hover:text-[#25292B]'
                }`}
              >
                Hinglish
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContextForm(!showContextForm)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#E5EEE6] text-[#25292B] text-xs font-semibold border border-[#A5BEB0] transition-colors shadow-xs"
            >
              {showContextForm ? 'Hide Context' : '+ Add Patient Context'}
            </button>
            <button
              onClick={onDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#204D3B] hover:bg-[#183a2d] text-white font-bold text-xs shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Optional Patient Context Form Drawer */}
          {showContextForm && (
            <form onSubmit={handleApplyContext} className="p-4 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0] space-y-3 animate-fade-in text-xs">
              <div className="font-bold text-[#204D3B] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                Optional Patient-Reported Clinical Context (Non-Diagnostic)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#52635B] font-bold mb-1">Age Demographic</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full bg-white border border-[#A5BEB0] rounded-lg px-2.5 py-1.5 text-xs text-[#25292B] focus:outline-none focus:border-[#204D3B]"
                  >
                    <option value="Young Adult (18-35)">Young Adult (18-35)</option>
                    <option value="Adult (36-64)">Adult (36-64)</option>
                    <option value="Senior (65+)">Senior (65+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#52635B] font-bold mb-1">Fasting Status Prior to Test</label>
                  <select
                    value={fastingStatus}
                    onChange={(e) => setFastingStatus(e.target.value)}
                    className="w-full bg-white border border-[#A5BEB0] rounded-lg px-2.5 py-1.5 text-xs text-[#25292B] focus:outline-none focus:border-[#204D3B]"
                  >
                    <option value="Yes, 10-12 hours overnight">Yes, 10-12 hours overnight</option>
                    <option value="No fasting / Random collection">No fasting / Random collection</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#52635B] font-bold mb-1">Reported Symptoms</label>
                  <input
                    type="text"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Fatigue, Dizziness"
                    className="w-full bg-white border border-[#A5BEB0] rounded-lg px-2.5 py-1.5 text-xs text-[#25292B] focus:outline-none focus:border-[#204D3B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#52635B] font-bold mb-1">Current Medications / Supplements</label>
                  <input
                    type="text"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="e.g. Iron supplements, Biotin"
                    className="w-full bg-white border border-[#A5BEB0] rounded-lg px-2.5 py-1.5 text-xs text-[#25292B] focus:outline-none focus:border-[#204D3B]"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#204D3B] text-white font-bold text-xs hover:bg-[#183a2d]"
                >
                  Regenerate VisitReady Prompts
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="py-12 text-center text-[#52635B] text-xs">Generating VisitReady summary...</div>
          ) : data ? (
            <>
              {/* Key Discussion Points */}
              <div>
                <h4 className="text-xs font-bold text-[#25292B] uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-[#204D3B]" />
                  Key Discussion Points for Your Appointment
                </h4>
                <div className="p-4 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/50 space-y-2">
                  {data.key_discussion_points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#25292B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#204D3B] mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions for Doctor */}
              <div>
                <h4 className="text-xs font-bold text-[#25292B] uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#204D3B]" />
                  Approved Questions to Ask Your Doctor ({data.suggested_questions.length})
                </h4>
                <div className="space-y-3">
                  {data.suggested_questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white border border-[#A5BEB0]/60 shadow-xs space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#204D3B] font-bold uppercase tracking-wider">
                          [{q.category}] • Trigger: {q.context_trigger}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#25292B]">"{q.question_text}"</p>
                      <p className="text-[11px] text-[#52635B] italic">Rationale: {q.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3.5 rounded-xl bg-[#E5EEE6]/60 border border-[#A5BEB0]/60 text-[11px] text-[#52635B] leading-relaxed">
                <span className="font-bold text-[#25292B]">Notice:</span> {data.clinical_disclaimer}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
