import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Radar, MessageSquare, Download, ExternalLink, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Report, ReportParameter } from '../../types';
import { ApiClient } from '../../lib/api';

interface ResultsViewProps {
  report: Report;
  currentLang: string;
  onBack: () => void;
  onOpenTrustTrace: (param: ReportParameter) => void;
  onOpenQualityRadar: () => void;
  onOpenVisitReady: () => void;
  onDownloadPdf: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  report,
  currentLang,
  onBack,
  onOpenTrustTrace,
  onOpenQualityRadar,
  onOpenVisitReady,
  onDownloadPdf,
}) => {
  const [explanations, setExplanations] = useState<Record<string, any>>({});
  const [teachBackActive, setTeachBackActive] = useState<string | null>(null);
  const [teachBackAnswer, setTeachBackAnswer] = useState<number | null>(null);

  useEffect(() => {
    if (report.parameters) {
      report.parameters.forEach(async (param) => {
        try {
          const exp = await ApiClient.getExplanation(report.id, param.id, currentLang);
          setExplanations((prev) => ({ ...prev, [param.id]: exp }));
        } catch {
          // ignore
        }
      });
    }
  }, [report.id, currentLang, report.parameters]);

  const inRangeCount = report.parameters?.filter((p) => p.classification_status === 'In Range').length || 0;
  const outOfRangeCount = report.parameters?.filter((p) => p.classification_status === 'Below Range' || p.classification_status === 'Above Range').length || 0;
  const unverifiedCount = report.parameters?.filter((p) => p.classification_status === 'Needs Verification' || p.classification_status === 'Unable to Classify').length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-12">
      {/* Top Banner & Signature Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#A5BEB0]/60 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white hover:bg-[#E5EEE6] text-[#25292B] border border-[#A5BEB0] transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-[#25292B] tracking-tight">Verified Parameter Results</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-bold">
                Deterministic Engine v1.0
              </span>
            </div>
            <p className="text-xs text-[#52635B] mt-1">
              File: <span className="text-[#25292B] font-mono font-semibold">{report.file_name}</span> | Printed Reference Ranges Verified
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenQualityRadar}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#E5EEE6] text-[#204D3B] border border-[#A5BEB0] text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Quality Radar</span>
          </button>

          <button
            onClick={onOpenVisitReady}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#204D3B] hover:bg-[#204D3B]/90 text-white font-bold text-xs hover:scale-[1.02] transition-all shadow-md cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>VisitReady™ Prep</span>
          </button>

          <button
            onClick={onDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#E5EEE6] text-[#25292B] text-xs font-semibold border border-[#A5BEB0] transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#204D3B]" />
            <span>Export Doctor PDF</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#A5BEB0]/60 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-[#52635B] block font-semibold">In Reference Range</span>
            <span className="text-2xl font-bold text-emerald-700 font-mono">{inRangeCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#A5BEB0]/60 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-[#52635B] block font-semibold">Outside Printed Range</span>
            <span className="text-2xl font-bold text-amber-700 font-mono">{outOfRangeCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#A5BEB0]/60 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-[#52635B] block font-semibold">Needs Verification</span>
            <span className="text-2xl font-bold text-[#204D3B] font-mono">{unverifiedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E5EEE6] flex items-center justify-center text-[#204D3B]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Parameter Result Cards */}
      <div className="space-y-4">
        {report.parameters?.map((param) => {
          const exp = explanations[param.id];
          const isOutOfRange = param.classification_status === 'Below Range' || param.classification_status === 'Above Range';

          return (
            <div
              key={param.id}
              className={`p-6 rounded-2xl border transition-all bg-white shadow-xs ${
                isOutOfRange
                  ? 'border-amber-400'
                  : 'border-[#A5BEB0]/60 hover:border-[#204D3B]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#A5BEB0]/30">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-[#25292B]">{param.test_name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        param.classification_status === 'In Range'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : param.classification_status === 'Below Range' || param.classification_status === 'Above Range'
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-blue-50 border-blue-300 text-blue-800'
                      }`}
                    >
                      {param.classification_status}
                    </span>
                  </div>
                  <p className="text-xs text-[#52635B] mt-1">
                    Deterministic Reason: {param.classification_reason || 'Evaluated strictly against printed limits.'}
                  </p>
                </div>

                {/* Quantitative Value & Range Pill */}
                <div className="text-right bg-[#E5EEE6]/50 p-3 rounded-xl border border-[#A5BEB0]/60 font-mono">
                  <div className="text-lg font-extrabold text-[#25292B]">
                    {param.numeric_value !== undefined ? param.numeric_value : param.raw_value}{' '}
                    <span className="text-xs font-bold text-[#204D3B]">{param.unit || ''}</span>
                  </div>
                  <div className="text-[11px] text-[#52635B]">
                    Printed Range: <span className="font-semibold text-[#25292B]">{param.reference_range_raw || 'Unspecified'}</span>
                  </div>
                </div>
              </div>

              {/* Constrained Educational Plain-Language Context */}
              <div className="py-4">
                <h4 className="text-xs font-bold text-[#204D3B] uppercase tracking-wider mb-2 font-mono">
                  Educational Understanding ({currentLang.toUpperCase()})
                </h4>

                {exp ? (
                  <div className="space-y-1.5 text-xs text-[#25292B] leading-relaxed">
                    <p className="font-semibold text-[#25292B]">
                      {exp.what_it_measures}
                    </p>
                    {exp.general_context?.map((ctx: string, i: number) => (
                      <p key={i} className="text-[#52635B]">
                        • {ctx}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[#52635B] italic">Loading vetted educational context...</div>
                )}
              </div>

              {/* Bottom Actions & TrustTrace Launcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#A5BEB0]/30">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#52635B] text-[11px] font-semibold">Primary Source:</span>
                  <a
                    href="https://medlineplus.gov/lab-tests/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E5EEE6] border border-[#A5BEB0] text-[#204D3B] text-[11px] font-bold hover:underline transition-colors"
                  >
                    <span>MedlinePlus Lab Guide</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTeachBackActive(teachBackActive === param.id ? null : param.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E5EEE6] hover:bg-[#E5EEE6]/80 text-[#25292B] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#204D3B]" />
                    <span>Teach-Back Check</span>
                  </button>

                  <button
                    onClick={() => onOpenTrustTrace(param)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#204D3B] hover:bg-[#204D3B]/90 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Inspect TrustTrace™ Evidence</span>
                  </button>
                </div>
              </div>

              {/* Teach-Back Interactive Panel */}
              {teachBackActive === param.id && (
                <div className="mt-4 p-4 rounded-xl bg-[#E5EEE6] border border-[#A5BEB0] text-xs">
                  <div className="font-bold text-[#25292B] mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#204D3B]" />
                    Interactive Comprehension Check: Why is this reading not a diagnosis?
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setTeachBackAnswer(1)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                        teachBackAnswer === 1
                          ? 'bg-rose-50 border-rose-400 text-rose-800'
                          : 'bg-white border-[#A5BEB0] text-[#25292B] hover:bg-gray-50'
                      }`}
                    >
                      A. It is an automatic diagnosis of severe disease.
                    </button>
                    <button
                      onClick={() => setTeachBackAnswer(2)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                        teachBackAnswer === 2
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold'
                          : 'bg-white border-[#A5BEB0] text-[#25292B] hover:bg-gray-50'
                      }`}
                    >
                      B. Many transient factors (hydration, diet, lab calibration) affect levels; only a licensed clinician can interpret it in personal context.
                    </button>
                  </div>
                  {teachBackAnswer === 2 && (
                    <div className="mt-2.5 text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Correct! LabLens principles: Out-of-range does not prove disease, and doctors diagnose.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
